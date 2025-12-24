import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { Badge } from './ui/badge'
import { LOW_STOCK_THRESHOLD } from '../utils/constants'
import { Package, Tag } from 'lucide-react'

const ItemCard = ({ item, onEdit }) => {
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

  const getBorderColor = () => {
    if (isOutOfStock) return 'border-l-red-500'
    if (isLowStock) return 'border-l-yellow-500'
    return 'border-l-green-500'
  }


  return (
    <Card className={`${getBorderColor()} border-l-4`}>
      <CardHeader className="!px-4 sm:!px-6 !pt-4 sm:!pt-6 !pb-0">
        <div className="flex flex-col sm:flex-row justify-between items-start gap-2 sm:gap-0">
          <CardTitle 
            className="text-lg sm:text-xl break-words pr-2 cursor-pointer hover:text-primary transition-colors"
            onClick={() => onEdit(item)}
          >
            {item.name}
          </CardTitle>
        </div>
      </CardHeader>
      <CardContent className="space-y-2 sm:space-y-3 p-4 sm:p-6 pt-0">
        {/* Single line: Quantity, Category, Stock Status */}
        <div className="flex items-center gap-3 sm:gap-4 text-sm flex-wrap">
          <div className="flex items-center gap-1.5">
            <Package className={`h-4 w-4 ${isOutOfStock ? 'text-red-500' : isLowStock ? 'text-yellow-500' : 'text-green-500'}`} />
            <span className={`font-semibold ${isOutOfStock ? 'text-red-500' : isLowStock ? 'text-yellow-500' : 'text-green-500'}`}>
              {item.quantity}
            </span>
          </div>
          
          {item.category && (
            <div className="flex items-center gap-1.5">
              <Tag className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">{item.category}</span>
            </div>
          )}
          
          <div className="ml-auto">
            <Badge variant={getStockBadgeVariant()} className="text-xs shrink-0">{getStockLabel()}</Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export default ItemCard

