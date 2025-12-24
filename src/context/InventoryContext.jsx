import React, { createContext, useContext, useState, useEffect, useCallback } from 'react'
import {
  initGoogleAPI,
  signIn,
  signOut,
  checkSignedIn,
  getAllItems as fetchAllItems,
  getCategories as fetchCategories,
  addItem as createItem,
  updateItem as modifyItem,
  deleteItem as removeItem
} from '../services/googleSheetsService'
import { LOW_STOCK_THRESHOLD, validateEnvVars } from '../utils/constants'

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
        const signedIn = await checkSignedIn()
        setIsAuthenticated(signedIn)
        if (signedIn) {
          await Promise.all([
            fetchItems(),
            fetchCategoriesList()
          ])
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
    }
  }, [])

  // Fetch categories from Data sheet
  const fetchCategoriesList = useCallback(async () => {
    try {
      const data = await fetchCategories()
      setCategories(data)
    } catch (err) {
      console.error('Failed to fetch categories:', err)
      // Don't set error state for categories, just log it
      // Fallback to empty array
      setCategories([])
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
    handleSignOut
  }

  return (
    <InventoryContext.Provider value={value}>
      {children}
    </InventoryContext.Provider>
  )
}

