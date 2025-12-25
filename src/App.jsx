import React from 'react'
import { InventoryProvider } from './context/InventoryContext'
import ItemList from './components/ItemList'
import SearchBar from './components/SearchBar'
import StockAlert from './components/StockAlert'
import ItemForm from './components/ItemForm'
import ChangesLog from './components/ChangesLog'
import { Button } from './components/ui/button'
import { useInventory } from './context/InventoryContext'
import { Plus, LogOut, History, Home } from 'lucide-react'

function AppContent() {
  const [showForm, setShowForm] = React.useState(false)
  const [editingItem, setEditingItem] = React.useState(null)
  const [currentPage, setCurrentPage] = React.useState('inventory') // 'inventory' or 'changes'
  const { isAuthenticated, handleSignIn, handleSignOut, fetchItems, refreshCategories, loading } = useInventory()

  const handleAddClick = () => {
    setEditingItem(null)
    setShowForm(true)
  }

  const handleEditClick = (item) => {
    setEditingItem(item)
    setShowForm(true)
  }

  const handleFormClose = () => {
    setShowForm(false)
    setEditingItem(null)
  }

  const handleRefresh = async () => {
    try {
      await Promise.all([
        fetchItems(),
        refreshCategories()
      ])
    } catch (error) {
      // Error is handled by context
      console.error('Refresh error:', error)
    }
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-500 to-purple-700 p-4">
        <div className="bg-white rounded-lg shadow-xl p-6 sm:p-8 max-w-md w-full">
          <h1 className="text-2xl sm:text-3xl font-bold text-center mb-2 text-gray-800">RORY Stock Inventory</h1>
          <p className="text-center text-sm sm:text-base text-gray-600 mb-6">Sign in with Google to access your inventory</p>
          <Button onClick={handleSignIn} className="w-full" size="lg">
            Sign in with Google
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-gradient-to-r from-purple-600 to-purple-700 text-white shadow-lg">
        <div className="container mx-auto px-3 sm:px-4 py-3 sm:py-4">
          <div className="flex flex-row justify-between items-center gap-2 sm:gap-3">
            <h1 
              className="text-base sm:text-xl md:text-2xl font-bold truncate min-w-0 flex-shrink cursor-pointer hover:opacity-80 transition-opacity"
              onClick={() => setCurrentPage('inventory')}
            >
              RORY Stock Inventory
            </h1>
            <div className="flex flex-row gap-2 flex-shrink-0">
              {currentPage === 'inventory' ? (
                <>
                  <Button 
                    onClick={handleAddClick} 
                    variant="secondary" 
                    className="flex-1 sm:flex-none text-sm sm:text-base"
                    size="sm"
                    title="Add Item"
                  >
                    <Plus className="h-4 w-4 sm:mr-2" />
                    <span className="hidden sm:inline">Add Item</span>
                  </Button>
                  <Button 
                    onClick={() => setCurrentPage('changes')} 
                    variant="default"
                    className="bg-purple-900 hover:bg-purple-950 text-white flex-1 sm:flex-none text-sm sm:text-base"
                    size="sm"
                    title="Change Log"
                  >
                    <History className="h-4 w-4 sm:mr-2" />
                    <span className="hidden sm:inline">Change Log</span>
                  </Button>
                </>
              ) : (
                <Button 
                  onClick={() => setCurrentPage('inventory')} 
                  variant="default"
                  className="bg-purple-900 hover:bg-purple-950 text-white flex-1 sm:flex-none text-sm sm:text-base"
                  size="sm"
                  title="Home"
                >
                  <Home className="h-4 w-4 sm:mr-2" />
                  <span className="hidden sm:inline">Home</span>
                </Button>
              )}
              <Button 
                onClick={handleSignOut} 
                variant="outline" 
                className="bg-white/10 hover:bg-white/20 border-white/20 text-white flex-1 sm:flex-none text-sm sm:text-base"
                size="sm"
                title="Sign Out"
              >
                <LogOut className="h-4 w-4 sm:mr-2" />
                <span className="hidden sm:inline">Sign Out</span>
              </Button>
            </div>
          </div>
        </div>
      </header>
      
      <main className="container mx-auto px-3 sm:px-4 py-4 sm:py-6">
        {currentPage === 'inventory' ? (
          <>
            <StockAlert />
            <SearchBar />
            <ItemList 
              onEdit={handleEditClick} 
              onRefresh={handleRefresh}
              refreshLoading={loading}
            />
          </>
        ) : (
          <ChangesLog />
        )}
      </main>

      {showForm && (
        <ItemForm
          item={editingItem}
          onClose={handleFormClose}
        />
      )}
    </div>
  )
}

function App() {
  return (
    <InventoryProvider>
      <AppContent />
    </InventoryProvider>
  )
}

export default App

