/**
 * Request Queue Manager
 * Manages API requests with throttling, queuing, and retry logic
 * to prevent ERR_INSUFFICIENT_RESOURCES errors
 */

class RequestQueue {
  constructor(options = {}) {
    this.maxConcurrent = options.maxConcurrent || 3 // Max concurrent requests
    this.retryAttempts = options.retryAttempts || 3
    this.retryDelay = options.retryDelay || 1000 // Initial retry delay in ms
    this.queue = []
    this.activeRequests = 0
    this.processing = false
  }

  /**
   * Add a request to the queue
   * @param {Function} requestFn - Function that returns a Promise
   * @param {Object} options - Request options (priority, retries, etc.)
   * @returns {Promise} - Promise that resolves/rejects with the request result
   */
  async enqueue(requestFn, options = {}) {
    return new Promise((resolve, reject) => {
      const request = {
        requestFn,
        resolve,
        reject,
        priority: options.priority || 0,
        retries: options.retries !== undefined ? options.retries : this.retryAttempts,
        id: Date.now() + Math.random()
      }

      // Insert based on priority (higher priority first)
      const insertIndex = this.queue.findIndex(r => r.priority < request.priority)
      if (insertIndex === -1) {
        this.queue.push(request)
      } else {
        this.queue.splice(insertIndex, 0, request)
      }

      this.processQueue()
    })
  }

  /**
   * Process the queue
   */
  async processQueue() {
    if (this.processing) return
    if (this.queue.length === 0) return
    if (this.activeRequests >= this.maxConcurrent) return

    this.processing = true

    while (this.queue.length > 0 && this.activeRequests < this.maxConcurrent) {
      const request = this.queue.shift()
      this.executeRequest(request)
    }

    this.processing = false
  }

  /**
   * Execute a request with retry logic
   */
  async executeRequest(request) {
    this.activeRequests++

    try {
      const result = await this.executeWithRetry(request)
      request.resolve(result)
    } catch (error) {
      request.reject(error)
    } finally {
      this.activeRequests--
      // Process next item in queue
      this.processQueue()
    }
  }

  /**
   * Execute request with exponential backoff retry
   */
  async executeWithRetry(request, attempt = 0) {
    try {
      return await request.requestFn()
    } catch (error) {
      // Check if error is retryable
      const isRetryable = this.isRetryableError(error)
      
      if (!isRetryable || attempt >= request.retries) {
        throw error
      }

      // Calculate exponential backoff delay
      const delay = this.retryDelay * Math.pow(2, attempt)
      
      // Add jitter to prevent thundering herd
      const jitter = Math.random() * 0.3 * delay
      const totalDelay = delay + jitter

      console.warn(
        `Request failed (attempt ${attempt + 1}/${request.retries + 1}), retrying in ${Math.round(totalDelay)}ms:`,
        error.message
      )

      await this.sleep(totalDelay)
      return this.executeWithRetry(request, attempt + 1)
    }
  }

  /**
   * Check if error is retryable
   */
  isRetryableError(error) {
    // 403 Forbidden - authentication/authorization errors are NOT retryable
    // These require user action (re-authentication or permission changes)
    if (error.status === 403) {
      return false
    }
    
    // Network errors that are retryable
    if (error.message && error.message.includes('ERR_INSUFFICIENT_RESOURCES')) {
      return true
    }
    
    if (error.message && error.message.includes('Failed to fetch')) {
      return true
    }

    if (error.message && error.message.includes('NetworkError')) {
      return true
    }

    // Rate limit errors (429)
    if (error.status === 429) {
      return true
    }

    // Server errors (5xx)
    if (error.status >= 500 && error.status < 600) {
      return true
    }

    // Timeout errors
    if (error.status === 408 || error.message?.includes('timeout')) {
      return true
    }

    // Don't retry client errors (4xx except 429, 408)
    if (error.status >= 400 && error.status < 500) {
      return false
    }

    // Default: retry for unknown errors
    return true
  }

  /**
   * Sleep utility
   */
  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms))
  }

  /**
   * Clear the queue
   */
  clear() {
    this.queue.forEach(request => {
      request.reject(new Error('Request queue cleared'))
    })
    this.queue = []
  }

  /**
   * Get queue status
   */
  getStatus() {
    return {
      queueLength: this.queue.length,
      activeRequests: this.activeRequests,
      maxConcurrent: this.maxConcurrent
    }
  }
}

// Create a singleton instance
const requestQueue = new RequestQueue({
  maxConcurrent: 3, // Limit concurrent requests
  retryAttempts: 3,
  retryDelay: 1000
})

/**
 * Debounce utility for rapid successive calls
 */
export function debounce(func, wait) {
  let timeout
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout)
      func(...args)
    }
    clearTimeout(timeout)
    timeout = setTimeout(later, wait)
  }
}

/**
 * Throttle utility to limit function calls
 */
export function throttle(func, limit) {
  let inThrottle
  return function executedFunction(...args) {
    if (!inThrottle) {
      func.apply(this, args)
      inThrottle = true
      setTimeout(() => (inThrottle = false), limit)
    }
  }
}

/**
 * Queue a request with automatic retry
 */
export async function queueRequest(requestFn, options = {}) {
  return requestQueue.enqueue(requestFn, options)
}

/**
 * Get queue status
 */
export function getQueueStatus() {
  return requestQueue.getStatus()
}

/**
 * Clear the queue
 */
export function clearQueue() {
  requestQueue.clear()
}

export default requestQueue

