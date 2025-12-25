import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react'
import {
  initGoogleAPI,
  signIn,
  signOut,
  checkSignedIn,
  getAllItems as fetchAllItems,
  getCategories as fetchCategories,
  addItem as createItem,
  updateItem as modifyItem,
  deleteItem as removeItem,
  removeOldQuantityLogEntries
} from '../services/googleSheetsService'
import { LOW_STOCK_THRESHOLD, validateEnvVars } from '../utils/constants'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from '../components/ui/dialog'
import { Button } from '../components/ui/button'
import { Loader2, Trash2 } from 'lucide-react'

const InventoryContext = createContext()

export const useInventory = () => {
  const context = useContext(InventoryContext)
  if (!context) {
    throw new Error('useInventory must be used within an InventoryProvider')
  }
  return context
}

export const InventoryProvider = ({ children }) => {
  const [items, setItems] = useState([])
  const [filteredItems, setFilteredItems] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [filterCategory, setFilterCategory] = useState('all')
  const [filterStockLevel, setFilterStockLevel] = useState('all')
  const [showCleanupDialog, setShowCleanupDialog] = useState(false)
  const [cleanupLoading, setCleanupLoading] = useState(false)
  
  // Refs to prevent concurrent API calls
  const fetchingItemsRef = useRef(false)
  const fetchingCategoriesRef = useRef(false)

  // Initialize Google API on mount
  useEffect(() => {
    const initialize = async () => {
      // Validate environment variables first
      const envErrors = validateEnvVars()
      if (envErrors.length > 0) {
        const errorMsg = 'Missing required environment variables: ' + envErrors.join(', ') + '. Please check your .env file.'
        setError(errorMsg)
        console.error('Environment variable validation failed:', envErrors)
        return
      }

      try {
        await initGoogleAPI()
        
        // Check if we're returning from OAuth redirect
        const urlParams = new URLSearchParams(window.location.search)
        const hasOAuthCode = urlParams.has('code') || urlParams.has('state')
        const isOAuthPending = sessionStorage.getItem('google_sheets_oauth_pending') === 'true'
        
        if (hasOAuthCode && isOAuthPending) {
          // We're returning from OAuth redirect, try to sign in
          // The signIn function will handle the OAuth callback
          try {
            await signIn()
            setIsAuthenticated(true)
            await Promise.all([
              fetchItems(),
              fetchCategoriesList()
            ])
          } catch (err) {
            // If sign in fails, check if already signed in
            const signedIn = await checkSignedIn()
            setIsAuthenticated(signedIn)
            if (signedIn) {
              await Promise.all([
                fetchItems(),
                fetchCategoriesList()
              ])
            } else {
              setError('Failed to complete sign in: ' + err.message)
            }
          }
        } else {
          // Normal initialization
          const signedIn = await checkSignedIn()
          setIsAuthenticated(signedIn)
          if (signedIn) {
            await Promise.all([
              fetchItems(),
              fetchCategoriesList()
            ])
          }
        }
      } catch (err) {
        setError('Failed to initialize Google API: ' + err.message)
        console.error('Initialization error:', err)
      }
    }
    initialize()
  }, [])

  // Filter items based on search and filters
  useEffect(() => {
    let filtered = [...items]

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(
        item =>
          item.name.toLowerCase().includes(query) ||
          item.sku.toLowerCase().includes(query) ||
          item.category.toLowerCase().includes(query)
      )
    }

    // Apply category filter
    if (filterCategory !== 'all') {
      filtered = filtered.filter(item => item.category === filterCategory)
    }

    // Apply stock level filter
    if (filterStockLevel === 'low') {
      filtered = filtered.filter(item => {
        const threshold = item.lowStockLevel || LOW_STOCK_THRESHOLD
        return item.quantity < threshold
      })
    } else if (filterStockLevel === 'in-stock') {
      filtered = filtered.filter(item => {
        const threshold = item.lowStockLevel || LOW_STOCK_THRESHOLD
        return item.quantity >= threshold
      })
    }

    setFilteredItems(filtered)
  }, [items, searchQuery, filterCategory, filterStockLevel])

  // Fetch all items
  const fetchItems = useCallback(async () => {
    // Prevent concurrent calls
    if (fetchingItemsRef.current) {
      console.log('Items fetch already in progress, skipping...')
      return
    }
    
    fetchingItemsRef.current = true
    setLoading(true)
    setError(null)
    try {
      const data = await fetchAllItems()
      setItems(data)
    } catch (err) {
      setError('Failed to fetch items: ' + err.message)
      console.error('Fetch error:', err)
    } finally {
      setLoading(false)
      fetchingItemsRef.current = false
    }
  }, [])

  // Fetch categories from Data sheet
  const fetchCategoriesList = useCallback(async () => {
    // Prevent concurrent calls
    if (fetchingCategoriesRef.current) {
      console.log('Categories fetch already in progress, skipping...')
      return
    }
    
    fetchingCategoriesRef.current = true
    try {
      const data = await fetchCategories()
      setCategories(data)
    } catch (err) {
      console.error('Failed to fetch categories:', err)
      // Don't set error state for categories, just log it
      // Fallback to empty array
      setCategories([])
    } finally {
      fetchingCategoriesRef.current = false
    }
  }, [])

  // Add new item
  const addItem = useCallback(async (item) => {
    setLoading(true)
    setError(null)
    try {
      const newItem = await createItem(item)
      setItems(prev => [...prev, newItem])
      return newItem
    } catch (err) {
      setError('Failed to add item: ' + err.message)
      console.error('Add error:', err)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  // Update existing item
  const updateItem = useCallback(async (id, item) => {
    setLoading(true)
    setError(null)
    try {
      const updatedItem = await modifyItem(id, item)
      setItems(prev =>
        prev.map(i => (i.id === id ? updatedItem : i))
      )
      return updatedItem
    } catch (err) {
      setError('Failed to update item: ' + err.message)
      console.error('Update error:', err)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  // Delete item
  const deleteItem = useCallback(async (id) => {
    setLoading(true)
    setError(null)
    try {
      await removeItem(id)
      setItems(prev => prev.filter(i => i.id !== id))
    } catch (err) {
      setError('Failed to delete item: ' + err.message)
      console.error('Delete error:', err)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  // Authentication functions
  const handleSignIn = useCallback(async () => {
    try {
      await signIn()
      setIsAuthenticated(true)
      await Promise.all([
        fetchItems(),
        fetchCategoriesList()
      ])
    } catch (err) {
      setError('Failed to sign in: ' + err.message)
      console.error('Sign in error:', err)
      throw err
    }
  }, [fetchItems, fetchCategoriesList])

  const handleSignOut = useCallback(async () => {
    try {
      await signOut()
      setIsAuthenticated(false)
      setItems([])
      setFilteredItems([])
      setCategories([])
    } catch (err) {
      setError('Failed to sign out: ' + err.message)
      console.error('Sign out error:', err)
    }
  }, [])

  // Refresh categories
  const refreshCategories = useCallback(async () => {
    await fetchCategoriesList()
  }, [fetchCategoriesList])

  // Get low stock items
  const lowStockItems = React.useMemo(() => {
    return items.filter(item => {
      const threshold = item.lowStockLevel || LOW_STOCK_THRESHOLD
      return item.quantity < threshold
    })
  }, [items])

  // Manual cleanup function
  const runCleanup = useCallback(async () => {
    setCleanupLoading(true)
    try {
      const result = await removeOldQuantityLogEntries()
      console.log('Cleanup completed:', result.message)
      // Store the cleanup timestamp
      localStorage.setItem('quantity_log_last_cleanup', Date.now().toString())
      setShowCleanupDialog(false)
      return result
    } catch (error) {
      console.error('Cleanup failed:', error)
      throw error
    } finally {
      setCleanupLoading(false)
    }
  }, [])

  // Check if cleanup is needed and show dialog
  useEffect(() => {
    if (!isAuthenticated) {
      return
    }

    const CLEANUP_STORAGE_KEY = 'quantity_log_last_cleanup'
    const CLEANUP_DIALOG_DISMISSED_KEY = 'quantity_log_cleanup_dialog_dismissed'
    const ONE_MONTH_MS = 30 * 24 * 60 * 60 * 1000 // 30 days in milliseconds

    const checkCleanupNeeded = () => {
      const lastCleanup = localStorage.getItem(CLEANUP_STORAGE_KEY)
      const dialogDismissed = localStorage.getItem(CLEANUP_DIALOG_DISMISSED_KEY)
      const now = Date.now()
      
      // Check if it's been a month since last cleanup
      const needsCleanup = !lastCleanup || (now - parseInt(lastCleanup, 10)) >= ONE_MONTH_MS
      
      // Show dialog if cleanup is needed and user hasn't dismissed it today
      if (needsCleanup) {
        const dismissedDate = dialogDismissed ? parseInt(dialogDismissed, 10) : 0
        const oneDayAgo = now - (24 * 60 * 60 * 1000)
        
        // Show dialog if never dismissed or dismissed more than a day ago
        if (!dialogDismissed || dismissedDate < oneDayAgo) {
          setShowCleanupDialog(true)
        }
      }
    }

    // Check immediately when authenticated
    checkCleanupNeeded()

    // Check periodically (every hour)
    const intervalId = setInterval(checkCleanupNeeded, 60 * 60 * 1000)

    return () => clearInterval(intervalId)
  }, [isAuthenticated])

  // Handle cleanup dialog actions
  const handleCleanupConfirm = useCallback(async () => {
    try {
      await runCleanup()
    } catch (error) {
      setError('Failed to clean up old logs: ' + error.message)
    }
  }, [runCleanup])

  const handleCleanupCancel = useCallback(() => {
    setShowCleanupDialog(false)
    // Remember that user dismissed the dialog today
    localStorage.setItem('quantity_log_cleanup_dialog_dismissed', Date.now().toString())
  }, [])

  const handleCleanupLater = useCallback(() => {
    setShowCleanupDialog(false)
    // Remember that user dismissed the dialog today
    localStorage.setItem('quantity_log_cleanup_dialog_dismissed', Date.now().toString())
  }, [])

  // Function to manually open cleanup dialog
  const openCleanupDialog = useCallback(() => {
    setShowCleanupDialog(true)
  }, [])

  const value = {
    items,
    filteredItems,
    loading,
    error,
    isAuthenticated,
    searchQuery,
    filterCategory,
    filterStockLevel,
    categories,
    lowStockItems,
    fetchItems,
    addItem,
    updateItem,
    deleteItem,
    refreshCategories,
    setSearchQuery,
    setFilterCategory,
    setFilterStockLevel,
    handleSignIn,
    handleSignOut,
    openCleanupDialog
  }

  return (
    <InventoryContext.Provider value={value}>
      {children}
      
      {/* Cleanup Dialog */}
      <Dialog open={showCleanupDialog} onOpenChange={setShowCleanupDialog}>
        <DialogContent onClose={handleCleanupCancel}>
          <DialogHeader>
            <DialogTitle>Clean Up Old Log Entries?</DialogTitle>
            <DialogDescription>
              It's been more than 3 months since the last cleanup. Would you like to remove quantity log entries older than 3 months?
              <br /><br />
              This will help keep your log file manageable and improve performance.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex-col sm:flex-row gap-2">
            <Button
              variant="outline"
              onClick={handleCleanupLater}
              disabled={cleanupLoading}
            >
              Remind Me Later
            </Button>
            <Button
              variant="outline"
              onClick={handleCleanupCancel}
              disabled={cleanupLoading}
            >
              Don't Ask Again Today
            </Button>
            <Button
              variant="default"
              onClick={handleCleanupConfirm}
              disabled={cleanupLoading}
            >
              {cleanupLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Cleaning...
                </>
              ) : (
                <>
                  <Trash2 className="mr-2 h-4 w-4" />
                  Clean Up Now
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </InventoryContext.Provider>
  )
}

