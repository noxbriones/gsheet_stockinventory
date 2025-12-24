import {
  SPREADSHEET_ID,
  SHEET_NAME,
  DATA_SHEET_NAME,
  GOOGLE_CLIENT_ID,
  GOOGLE_API_KEY,
  SCOPES,
  DISCOVERY_DOCS,
  COLUMNS,
  COLUMN_NAMES,
  LOW_STOCK_THRESHOLD
} from '../utils/constants'

let gapi = null
let google = null
let isInitialized = false
let isSignedIn = false
let tokenClient = null
let accessToken = null

// Storage keys
const STORAGE_KEY = 'google_sheets_auth_token'
const STORAGE_TIMESTAMP_KEY = 'google_sheets_auth_timestamp'

// Load token from localStorage
const loadStoredToken = () => {
  try {
    const storedToken = localStorage.getItem(STORAGE_KEY)
    const storedTimestamp = localStorage.getItem(STORAGE_TIMESTAMP_KEY)
    
    if (storedToken && storedTimestamp) {
      // Check if token is less than 1 hour old (tokens typically last 1 hour)
      const tokenAge = Date.now() - parseInt(storedTimestamp, 10)
      const oneHour = 60 * 60 * 1000
      
      if (tokenAge < oneHour) {
        return storedToken
      } else {
        // Token is old, clear it
        clearStoredToken()
      }
    }
  } catch (error) {
    console.error('Error loading stored token:', error)
  }
  return null
}

// Save token to localStorage
const saveStoredToken = (token) => {
  try {
    localStorage.setItem(STORAGE_KEY, token)
    localStorage.setItem(STORAGE_TIMESTAMP_KEY, Date.now().toString())
  } catch (error) {
    console.error('Error saving token:', error)
  }
}

// Clear token from localStorage
const clearStoredToken = () => {
  try {
    localStorage.removeItem(STORAGE_KEY)
    localStorage.removeItem(STORAGE_TIMESTAMP_KEY)
  } catch (error) {
    console.error('Error clearing stored token:', error)
  }
}

// Initialize Google API
export const initGoogleAPI = () => {
  return new Promise((resolve, reject) => {
    if (isInitialized && gapi) {
      resolve()
      return
    }

    // Load Google Identity Services script
    if (window.google && window.gapi) {
      google = window.google
      gapi = window.gapi
      loadClient()
    } else {
      // Load Google Identity Services
      const gisScript = document.createElement('script')
      gisScript.src = 'https://accounts.google.com/gsi/client'
      gisScript.onload = () => {
        google = window.google
        
        // Load gapi script
        const gapiScript = document.createElement('script')
        gapiScript.src = 'https://apis.google.com/js/api.js'
        gapiScript.onload = () => {
          gapi = window.gapi
          loadClient()
        }
        gapiScript.onerror = () => reject(new Error('Failed to load Google API script'))
        document.head.appendChild(gapiScript)
      }
      gisScript.onerror = () => reject(new Error('Failed to load Google Identity Services script'))
      document.head.appendChild(gisScript)
    }

    function loadClient() {
      // Initialize gapi client without auth2
      gapi.load('client', () => {
        gapi.client
          .init({
            apiKey: GOOGLE_API_KEY,
            discoveryDocs: DISCOVERY_DOCS
          })
          .then(() => {
            isInitialized = true
            resolve()
          })
          .catch(reject)
      })
    }
  })
}

// Sign in user
export const signIn = async () => {
  if (!isInitialized) {
    await initGoogleAPI()
  }

  if (!google || !google.accounts) {
    throw new Error('Google Identity Services not loaded')
  }

  return new Promise((resolve, reject) => {
    try {
      // Store resolve/reject for callback
      let tokenResolve = null
      let tokenReject = null
      let timeoutId = null
      
      // Create a new token client with callback
      // Try popup mode first; if COOP blocks it, the error will be caught
      const client = google.accounts.oauth2.initTokenClient({
        client_id: GOOGLE_CLIENT_ID,
        scope: SCOPES,
        // Don't specify ux_mode - let Google Identity Services choose the best method
        // It will use popup if possible, or fall back to redirect if COOP blocks it
        callback: (response) => {
          // Clear timeout
          if (timeoutId) {
            clearTimeout(timeoutId)
            timeoutId = null
          }
          
          if (response.error) {
            console.error('Token error:', response)
            isSignedIn = false
            accessToken = null
            if (tokenReject) {
              tokenReject(new Error(response.error))
            }
            return
          }
          accessToken = response.access_token
          isSignedIn = true
          // Save token to localStorage
          saveStoredToken(accessToken)
          // Set the access token for gapi requests
          gapi.client.setToken({ access_token: accessToken })
          if (tokenResolve) {
            tokenResolve(true)
          }
        }
      })
      
      // Create promise that resolves when callback is called
      const tokenPromise = new Promise((res, rej) => {
        tokenResolve = res
        tokenReject = rej
      })
      
      // Request access token - omit prompt to allow automatic sign-in if user previously consented
      client.requestAccessToken()
      
      // Timeout after 30 seconds
      timeoutId = setTimeout(() => {
        if (!isSignedIn) {
          tokenReject = null
          tokenResolve = null
          reject(new Error('Sign in timeout'))
        }
      }, 30000)
      
      // Wait for callback
      tokenPromise.then(resolve).catch(reject)
    } catch (error) {
      console.error('Sign in error:', error)
      reject(error)
    }
  })
}

// Sign out user
export const signOut = async () => {
  if (!isInitialized) return

  try {
    if (accessToken) {
      google.accounts.oauth2.revoke(accessToken, () => {
        accessToken = null
        isSignedIn = false
        gapi.client.setToken(null)
        clearStoredToken()
      })
    } else {
      isSignedIn = false
      gapi.client.setToken(null)
      clearStoredToken()
    }
  } catch (error) {
    console.error('Sign out error:', error)
    // Clear stored token even if revoke fails
    clearStoredToken()
    isSignedIn = false
    gapi.client.setToken(null)
    throw error
  }
}

// Check if user is signed in
export const checkSignedIn = async () => {
  if (!isInitialized) {
    await initGoogleAPI()
  }

  try {
    // First, try to restore token from localStorage
    if (!accessToken) {
      const storedToken = loadStoredToken()
      if (storedToken) {
        accessToken = storedToken
        isSignedIn = true
        gapi.client.setToken({ access_token: accessToken })
      }
    }

    // Check if we have a valid token
    if (accessToken && isSignedIn) {
      // Verify token is still valid by making a test request
      try {
        await gapi.client.sheets.spreadsheets.get({
          spreadsheetId: SPREADSHEET_ID
        })
        return true
      } catch (err) {
        // Token expired or invalid - try to refresh silently
        accessToken = null
        isSignedIn = false
        gapi.client.setToken(null)
        clearStoredToken()
        
        // Try to get a new token silently
        try {
          await restoreSession()
          return isSignedIn
        } catch (refreshError) {
          return false
        }
      }
    }
    return false
  } catch (error) {
    console.error('Check signed in error:', error)
    return false
  }
}

// Restore session by requesting a new token silently
const restoreSession = async () => {
  if (!google || !google.accounts) {
    return false
  }

  return new Promise((resolve) => {
    let resolved = false
    let timeoutId = null
    
    const client = google.accounts.oauth2.initTokenClient({
      client_id: GOOGLE_CLIENT_ID,
      scope: SCOPES,
      callback: (response) => {
        if (timeoutId) {
          clearTimeout(timeoutId)
        }
        
        if (response.error) {
          if (!resolved) {
            resolved = true
            resolve(false)
          }
          return
        }
        
        accessToken = response.access_token
        isSignedIn = true
        saveStoredToken(accessToken)
        gapi.client.setToken({ access_token: accessToken })
        
        if (!resolved) {
          resolved = true
          resolve(true)
        }
      }
    })
    
    // Request token silently (no prompt)
    try {
      client.requestAccessToken({ prompt: 'none' })
    } catch (error) {
      // If silent refresh fails, user needs to sign in again
      if (!resolved) {
        resolved = true
        resolve(false)
      }
      return
    }
    
    // Timeout after 3 seconds for silent refresh
    timeoutId = setTimeout(() => {
      if (!resolved && !isSignedIn) {
        resolved = true
        resolve(false)
      }
    }, 3000)
  })
}

// Ensure user is signed in
const ensureSignedIn = async () => {
  const signedIn = await checkSignedIn()
  if (!signedIn) {
    await signIn()
  }
}

// Get all items from spreadsheet
export const getAllItems = async () => {
  await ensureSignedIn()

  try {
    const response = await gapi.client.sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: `${SHEET_NAME}!A2:I` // Skip header row
    })

    const rows = response.result.values || []
    return rows.map((row, index) => {
      // Ensure row has all columns, fill with empty strings if missing
      const fullRow = [...row, ...Array(9 - row.length).fill('')]
      return {
        id: fullRow[COLUMNS.ID] || `row_${index + 2}`,
        name: fullRow[COLUMNS.NAME] || '',
        sku: fullRow[COLUMNS.SKU] || '',
        quantity: parseInt(fullRow[COLUMNS.QUANTITY] || '0', 10),
        price: parseFloat(fullRow[COLUMNS.PRICE] || '0'),
        category: fullRow[COLUMNS.CATEGORY] || '',
        description: fullRow[COLUMNS.DESCRIPTION] || '',
        lowStockLevel: parseInt(fullRow[COLUMNS.LOW_STOCK_LEVEL] || LOW_STOCK_THRESHOLD.toString(), 10),
        lastUpdated: fullRow[COLUMNS.LAST_UPDATED] || ''
      }
    })
  } catch (error) {
    console.error('Error fetching items:', error)
    throw error
  }
}

// Helper function to convert column index to letter (0=A, 1=B, ..., 25=Z, 26=AA, etc.)
const columnIndexToLetter = (index) => {
  let result = ''
  while (index >= 0) {
    result = String.fromCharCode(65 + (index % 26)) + result
    index = Math.floor(index / 26) - 1
  }
  return result
}

// Get categories from Data sheet
export const getCategories = async () => {
  await ensureSignedIn()

  try {
    // First, get the Data sheet to find the category column
    const response = await gapi.client.sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: `${DATA_SHEET_NAME}!A1:ZZ1` // Get header row to find category column
    })

    const headers = response.result.values?.[0] || []
    const categoryColumnIndex = headers.findIndex(
      header => header && header.toString().toLowerCase().trim() === 'category'
    )

    if (categoryColumnIndex === -1) {
      console.warn('Category column not found in Data sheet')
      return []
    }

    // Convert column index to letter
    const columnLetter = columnIndexToLetter(categoryColumnIndex)

    // Get all category values (skip header row)
    const categoryResponse = await gapi.client.sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: `${DATA_SHEET_NAME}!${columnLetter}2:${columnLetter}` // Skip header, get all rows
    })

    const categoryRows = categoryResponse.result.values || []
    
    // Extract unique, non-empty categories and sort them
    const categories = new Set()
    categoryRows.forEach(row => {
      if (row && row[0] && row[0].toString().trim()) {
        categories.add(row[0].toString().trim())
      }
    })

    return Array.from(categories).sort()
  } catch (error) {
    console.error('Error fetching categories:', error)
    // Return empty array if Data sheet doesn't exist or has errors
    return []
  }
}

// Add new item to spreadsheet
export const addItem = async (item) => {
  await ensureSignedIn()

  try {
    // First, ensure header row exists
    await ensureHeaderRow()

    // Generate ID (timestamp-based)
    const id = `item_${Date.now()}`
    const now = new Date().toISOString()

    const values = [
      [
        id,
        item.name || '',
        item.sku || '',
        item.quantity?.toString() || '0',
        item.price?.toString() || '0',
        item.category || '',
        item.description || '',
        item.lowStockLevel?.toString() || LOW_STOCK_THRESHOLD.toString(),
        now
      ]
    ]

    const response = await gapi.client.sheets.spreadsheets.values.append({
      spreadsheetId: SPREADSHEET_ID,
      range: `${SHEET_NAME}!A2`,
      valueInputOption: 'USER_ENTERED',
      insertDataOption: 'INSERT_ROWS',
      resource: {
        values
      }
    })

    return { ...item, id, lastUpdated: now }
  } catch (error) {
    console.error('Error adding item:', error)
    throw error
  }
}

// Update existing item
export const updateItem = async (id, item) => {
  await ensureSignedIn()

  try {
    // First, find the row number for this item
    const allItems = await getAllItems()
    const itemIndex = allItems.findIndex(i => i.id === id)

    if (itemIndex === -1) {
      throw new Error('Item not found')
    }

    // Row number is itemIndex + 2 (1 for header, 1 for 0-index)
    const rowNumber = itemIndex + 2
    const now = new Date().toISOString()

    const values = [
      [
        id,
        item.name || '',
        item.sku || '',
        item.quantity?.toString() || '0',
        item.price?.toString() || '0',
        item.category || '',
        item.description || '',
        item.lowStockLevel?.toString() || LOW_STOCK_THRESHOLD.toString(),
        now
      ]
    ]

    await gapi.client.sheets.spreadsheets.values.update({
      spreadsheetId: SPREADSHEET_ID,
      range: `${SHEET_NAME}!A${rowNumber}:I${rowNumber}`,
      valueInputOption: 'USER_ENTERED',
      resource: {
        values
      }
    })

    return { ...item, id, lastUpdated: now }
  } catch (error) {
    console.error('Error updating item:', error)
    throw error
  }
}

// Delete item from spreadsheet
export const deleteItem = async (id) => {
  await ensureSignedIn()

  try {
    // First, find the row number for this item
    const allItems = await getAllItems()
    const itemIndex = allItems.findIndex(i => i.id === id)

    if (itemIndex === -1) {
      throw new Error('Item not found')
    }

    // Row number is itemIndex + 2 (1 for header, 1 for 0-index)
    const rowNumber = itemIndex + 2

    await gapi.client.sheets.spreadsheets.batchUpdate({
      spreadsheetId: SPREADSHEET_ID,
      resource: {
        requests: [
          {
            deleteDimension: {
              range: {
                sheetId: await getSheetId(),
                dimension: 'ROWS',
                startIndex: rowNumber - 1,
                endIndex: rowNumber
              }
            }
          }
        ]
      }
    })
  } catch (error) {
    console.error('Error deleting item:', error)
    throw error
  }
}

// Get sheet ID by name
const getSheetId = async () => {
  try {
    const response = await gapi.client.sheets.spreadsheets.get({
      spreadsheetId: SPREADSHEET_ID
    })

    const sheet = response.result.sheets.find(
      s => s.properties.title === SHEET_NAME
    )

    if (!sheet) {
      throw new Error(`Sheet "${SHEET_NAME}" not found`)
    }

    return sheet.properties.sheetId
  } catch (error) {
    console.error('Error getting sheet ID:', error)
    throw error
  }
}

// Ensure header row exists
const ensureHeaderRow = async () => {
  try {
    const response = await gapi.client.sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: `${SHEET_NAME}!A1:I1`
    })

    const headers = response.result.values?.[0] || []

    // If headers don't match, update them
    if (headers.length < COLUMN_NAMES.length || !headers.every((h, i) => h === COLUMN_NAMES[i])) {
      await gapi.client.sheets.spreadsheets.values.update({
        spreadsheetId: SPREADSHEET_ID,
        range: `${SHEET_NAME}!A1:I1`,
        valueInputOption: 'RAW',
        resource: {
          values: [COLUMN_NAMES]
        }
      })
    }
  } catch (error) {
    // If range doesn't exist, create it
    if (error.status === 400) {
      await gapi.client.sheets.spreadsheets.values.update({
        spreadsheetId: SPREADSHEET_ID,
        range: `${SHEET_NAME}!A1:I1`,
        valueInputOption: 'RAW',
        resource: {
          values: [COLUMN_NAMES]
        }
      })
    } else {
      console.error('Error ensuring header row:', error)
      throw error
    }
  }
}
