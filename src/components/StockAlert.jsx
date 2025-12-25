import React, { useState } from 'react'
import { useInventory } from '../context/InventoryContext'
import { Alert, AlertDescription, AlertTitle } from './ui/alert'
import { Button } from './ui/button'
import { AlertTriangle, ChevronDown, ChevronUp } from 'lucide-react'

const StockAlert = () => {
  const { lowStockItems } = useInventory()
  const [isCollapsed, setIsCollapsed] = useState(false)

  if (lowStockItems.length === 0) {
    return null
  }

  return (
    <Alert variant="warning" className="mb-4 sm:mb-6 text-sm sm:text-base">
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2 mb-1">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 sm:h-5 sm:w-5 shrink-0" />
            <AlertTitle className="text-base sm:text-lg mb-0">Low Stock Alert</AlertTitle>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="h-6 w-6 p-0 shrink-0"
            aria-label={isCollapsed ? 'Expand alert' : 'Collapse alert'}
          >
            {isCollapsed ? (
              <ChevronDown className="h-4 w-4" />
            ) : (
              <ChevronUp className="h-4 w-4" />
            )}
          </Button>
        </div>
        {!isCollapsed && (
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
        )}
      </div>
    </Alert>
  )
}

export default StockAlert

