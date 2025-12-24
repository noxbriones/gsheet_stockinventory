import React from 'react'
import { useInventory } from '../context/InventoryContext'
import { Alert, AlertDescription, AlertTitle } from './ui/alert'
import { AlertTriangle } from 'lucide-react'

const StockAlert = () => {
  const { lowStockItems } = useInventory()

  if (lowStockItems.length === 0) {
    return null
  }

  return (
    <Alert variant="warning" className="mb-4 sm:mb-6 text-sm sm:text-base">
      <AlertTriangle className="h-4 w-4 sm:h-5 sm:w-5 shrink-0" />
      <AlertTitle className="text-base sm:text-lg">Low Stock Alert</AlertTitle>
      <AlertDescription className="text-sm sm:text-base">
        {lowStockItems.length} item{lowStockItems.length !== 1 ? 's' : ''} {lowStockItems.length === 1 ? 'has' : 'have'} quantity below their low stock threshold:
        <ul className="list-disc list-inside mt-2 space-y-1 text-xs sm:text-sm">
          {lowStockItems.slice(0, 5).map(item => {
            const threshold = item.lowStockLevel || 10
            return (
              <li key={item.id} className="break-words">
                <strong>{item.name}</strong> - {item.quantity} remaining (threshold: {threshold})
              </li>
            )
          })}
          {lowStockItems.length > 5 && (
            <li className="text-muted-foreground">
              ...and {lowStockItems.length - 5} more
            </li>
          )}
        </ul>
      </AlertDescription>
    </Alert>
  )
}

export default StockAlert

