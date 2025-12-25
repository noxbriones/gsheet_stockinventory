import React, { useState } from 'react'
import { useInventory } from '../context/InventoryContext'
import ItemCard from './ItemCard'
import { Card, CardContent } from './ui/card'
import { Button } from './ui/button'
import { Badge } from './ui/badge'
import { LOW_STOCK_THRESHOLD } from '../utils/constants'
import { Loader2, AlertCircle, Package, Table, LayoutGrid, RefreshCw } from 'lucide-react'

const ItemList = ({ onEdit, onRefresh, refreshLoading }) => {
  const { filteredItems, loading, error } = useInventory()
  const [viewMode, setViewMode] = useState('card') // 'card' or 'table'

  if (loading && filteredItems.length === 0) {
    return (
      <Card className="mt-4 sm:mt-6">
        <CardContent className="flex flex-col items-center justify-center py-8 sm:py-12 px-4">
          <Loader2 className="h-8 w-8 sm:h-10 sm:w-10 animate-spin text-primary mb-4" />
          <p className="text-muted-foreground text-sm sm:text-base">Loading inventory...</p>
        </CardContent>
      </Card>
    )
  }

  if (error && filteredItems.length === 0) {
    return (
      <Card className="mt-4 sm:mt-6 border-destructive">
        <CardContent className="flex flex-col items-center justify-center py-8 sm:py-12 px-4">
          <AlertCircle className="h-8 w-8 sm:h-10 sm:w-10 text-destructive mb-4" />
          <p className="text-destructive font-medium text-sm sm:text-base text-center break-words">Error: {error}</p>
        </CardContent>
      </Card>
    )
  }

  if (filteredItems.length === 0) {
    return (
      <Card className="mt-4 sm:mt-6">
        <CardContent className="flex flex-col items-center justify-center py-8 sm:py-12 px-4">
          <Package className="h-10 w-10 sm:h-12 sm:w-12 text-muted-foreground mb-4" />
          <p className="text-muted-foreground text-base sm:text-lg">No items found</p>
          <p className="text-muted-foreground text-xs sm:text-sm mt-2 text-center">Add your first item to get started!</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="mt-4 sm:mt-6">
      <div className="mb-3 sm:mb-4 flex flex-row justify-between items-center gap-3">
        <div className="flex items-center gap-3">
          <h2 className="text-xl sm:text-2xl font-semibold">Inventory Items</h2>
          <p className="text-muted-foreground text-xs sm:text-sm">
            Showing {filteredItems.length} item{filteredItems.length !== 1 ? 's' : ''}
          </p>
        </div>
        <div className="flex flex-row items-center gap-2">
          <Button
            onClick={onRefresh}
            variant="outline"
            size="sm"
            disabled={refreshLoading}
            title="Refresh inventory data"
          >
            <RefreshCw className={`h-4 w-4 sm:mr-2 ${refreshLoading ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">Refresh</span>
          </Button>
          <Button
            onClick={() => setViewMode(viewMode === 'card' ? 'table' : 'card')}
            variant="outline"
            size="sm"
          >
            {viewMode === 'card' ? (
              <>
                <Table className="h-4 w-4 sm:mr-2" />
                <span className="hidden sm:inline">View as Table</span>
              </>
            ) : (
              <>
                <LayoutGrid className="h-4 w-4 sm:mr-2" />
                <span className="hidden sm:inline">View as Cards</span>
              </>
            )}
          </Button>
        </div>
      </div>
      
      {viewMode === 'card' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
          {filteredItems.map(item => (
            <ItemCard
              key={item.id}
              item={item}
              onEdit={onEdit}
            />
          ))}
        </div>
      ) : (
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-muted/50">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-foreground">Quantity</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-foreground">Name</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-foreground">Category</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-foreground">Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredItems.map((item, index) => {
                  const lowStockThreshold = item.lowStockLevel || LOW_STOCK_THRESHOLD
                  const isLowStock = item.quantity < lowStockThreshold
                  const isOutOfStock = item.quantity === 0
                  
                  const getStockBadgeVariant = () => {
                    if (isOutOfStock) return 'destructive'
                    if (isLowStock) return 'warning'
                    return 'success'
                  }

                  const getStockLabel = () => {
                    if (isOutOfStock) return 'Out of Stock'
                    if (isLowStock) return 'Low Stock'
                    return 'In Stock'
                  }

                  return (
                    <tr
                      key={item.id}
                      onClick={() => onEdit(item)}
                      className={`cursor-pointer hover:bg-muted/50 transition-colors ${
                        index !== filteredItems.length - 1 ? 'border-b' : ''
                      }`}
                    >
                      <td className="px-4 py-3 text-sm font-medium">{item.quantity}</td>
                      <td className="px-4 py-3 text-sm">{item.name}</td>
                      <td className="px-4 py-3 text-sm text-muted-foreground">{item.category || '-'}</td>
                      <td className="px-4 py-3 text-sm">
                        <Badge variant={getStockBadgeVariant()} className="text-xs">
                          {getStockLabel()}
                        </Badge>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  )
}

export default ItemList

