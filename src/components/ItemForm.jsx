import React, { useState, useEffect } from 'react'
import { useInventory } from '../context/InventoryContext'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from './ui/dialog'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Label } from './ui/label'
import { Select } from './ui/select'
import { Loader2, Calendar, Trash2, Save, Plus, Minus } from 'lucide-react'
import { Alert, AlertDescription } from './ui/alert'
import { LOW_STOCK_THRESHOLD } from '../utils/constants'

const ItemForm = ({ item, onClose }) => {
  const { addItem, updateItem, deleteItem, categories, loading } = useInventory()
  const [formData, setFormData] = useState({
    name: '',
    sku: '',
    quantity: '',
    price: '',
    category: '',
    description: '',
    lowStockLevel: ''
  })
  const [stockAdjustment, setStockAdjustment] = useState({
    type: 'add', // 'add' or 'subtract'
    amount: ''
  })
  const [quantityChangeType, setQuantityChangeType] = useState(null) // Track if quick adjustment was used
  const [errors, setErrors] = useState({})
  const [submitError, setSubmitError] = useState(null)

  const isEditing = !!item

  useEffect(() => {
    if (item) {
      setFormData({
        name: item.name || '',
        sku: item.sku || '',
        quantity: item.quantity?.toString() || '',
        price: item.price?.toString() || '',
        category: item.category || '',
        description: item.description || '',
        lowStockLevel: item.lowStockLevel?.toString() || LOW_STOCK_THRESHOLD.toString()
      })
      // Reset change type when item changes
      setQuantityChangeType(null)
    } else {
      // Set default low stock level for new items
      setFormData(prev => ({
        ...prev,
        lowStockLevel: prev.lowStockLevel || LOW_STOCK_THRESHOLD.toString()
      }))
      // Reset change type for new items
      setQuantityChangeType(null)
    }
  }, [item])

  const validate = () => {
    const newErrors = {}
    
    if (!formData.name.trim()) {
      newErrors.name = 'Name is required'
    }
    
    if (formData.quantity !== '' && (isNaN(formData.quantity) || parseFloat(formData.quantity) < 0)) {
      newErrors.quantity = 'Quantity must be a non-negative number'
    }
    
    if (formData.price !== '' && (isNaN(formData.price) || parseFloat(formData.price) < 0)) {
      newErrors.price = 'Price must be a non-negative number'
    }
    
    if (formData.lowStockLevel !== '' && (isNaN(formData.lowStockLevel) || parseInt(formData.lowStockLevel, 10) < 0)) {
      newErrors.lowStockLevel = 'Low stock level must be a non-negative number'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitError(null)

    if (!validate()) {
      return
    }

    try {
      const itemData = {
        name: formData.name.trim(),
        sku: formData.sku.trim(),
        quantity: parseInt(formData.quantity || '0', 10),
        price: parseFloat(formData.price || '0'),
        category: formData.category.trim(),
        description: formData.description.trim(),
        lowStockLevel: parseInt(formData.lowStockLevel || LOW_STOCK_THRESHOLD.toString(), 10),
        // Add adjustment info if this was a quick adjustment
        quantityChangeType: quantityChangeType
      }

      if (isEditing) {
        await updateItem(item.id, itemData)
      } else {
        await addItem(itemData)
      }

      // Reset change type after submission
      setQuantityChangeType(null)
      onClose()
    } catch (error) {
      setSubmitError(error.message || 'Failed to save item')
    }
  }

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: null }))
    }
  }

  const handleQuantityChange = (delta) => {
    const currentValue = parseInt(formData.quantity || '0', 10)
    const newValue = Math.max(0, currentValue + delta)
    handleChange('quantity', newValue.toString())
  }

  // Handler for quick stock adjustment
  const handleStockAdjustment = async () => {
    const currentQuantity = parseInt(formData.quantity || '0', 10)
    const adjustmentAmount = parseInt(stockAdjustment.amount || '0', 10)
    
    if (adjustmentAmount <= 0) {
      setErrors(prev => ({ ...prev, stockAdjustment: 'Amount must be greater than 0' }))
      return
    }

    let newQuantity
    if (stockAdjustment.type === 'add') {
      newQuantity = currentQuantity + adjustmentAmount
    } else {
      newQuantity = Math.max(0, currentQuantity - adjustmentAmount)
    }

    // Store the change type for logging
    setQuantityChangeType(stockAdjustment.type)
    
    // Update quantity in form data
    const updatedFormData = {
      ...formData,
      quantity: newQuantity.toString()
    }
    setFormData(updatedFormData)
    setStockAdjustment({ type: 'add', amount: '' })
    setErrors(prev => ({ ...prev, stockAdjustment: null }))

    // Auto-submit if editing and form is valid
    if (isEditing) {
      // Validate before submitting
      const validationErrors = {}
      if (!updatedFormData.name.trim()) {
        validationErrors.name = 'Name is required'
      }
      if (updatedFormData.quantity !== '' && (isNaN(updatedFormData.quantity) || parseFloat(updatedFormData.quantity) < 0)) {
        validationErrors.quantity = 'Quantity must be a non-negative number'
      }
      
      if (Object.keys(validationErrors).length === 0) {
        // Form is valid, submit it
        setSubmitError(null)
        try {
          const itemData = {
            name: updatedFormData.name.trim(),
            sku: updatedFormData.sku.trim(),
            quantity: parseInt(updatedFormData.quantity || '0', 10),
            price: parseFloat(updatedFormData.price || '0'),
            category: updatedFormData.category.trim(),
            description: updatedFormData.description.trim(),
            lowStockLevel: parseInt(updatedFormData.lowStockLevel || LOW_STOCK_THRESHOLD.toString(), 10),
            quantityChangeType: stockAdjustment.type
          }
          await updateItem(item.id, itemData)
          setQuantityChangeType(null)
          onClose()
        } catch (error) {
          setSubmitError(error.message || 'Failed to save item')
        }
      } else {
        setErrors(validationErrors)
      }
    }
  }

  const handleDelete = async () => {
    if (!isEditing) return
    
    if (window.confirm(`Are you sure you want to delete "${item.name}"?`)) {
      try {
        await deleteItem(item.id)
        onClose()
      } catch (error) {
        setSubmitError(error.message || 'Failed to delete item')
      }
    }
  }

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="w-full max-h-[95vh] sm:max-h-[90vh] overflow-y-auto p-4 sm:p-6" onClose={onClose}>
        <DialogHeader>
          <DialogTitle className="text-lg sm:text-xl">{isEditing ? 'Edit Item' : 'Add New Item'}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
          {submitError && (
            <Alert variant="destructive">
              <AlertDescription>{submitError}</AlertDescription>
            </Alert>
          )}

          {/* Name field - full width */}
          <div className="space-y-1.5 sm:space-y-2">
            <Label htmlFor="name" className="text-sm sm:text-base">
              Name <span className="text-destructive">*</span>
            </Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => handleChange('name', e.target.value)}
              placeholder="Item name"
              className={`text-lg sm:text-xl ${errors.name ? 'border-destructive' : ''}`}
            />
            {errors.name && (
              <p className="text-sm text-destructive">{errors.name}</p>
            )}
          </div>

          {/* Quick Stock Adjustment - Only show when editing */}
          {isEditing && (
            <div className="space-y-1.5 sm:space-y-2 p-3 bg-muted/50 rounded-md border">
              <Label className="text-sm sm:text-base font-semibold">Quick Stock Adjustment</Label>
              <div className="flex flex-col sm:flex-row gap-2">
                {/* Add/Subtract Toggle */}
                <div className="flex gap-1 border rounded-md p-1 bg-background">
                  <Button
                    type="button"
                    variant={stockAdjustment.type === 'add' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setStockAdjustment(prev => ({ ...prev, type: 'add' }))}
                    className={`flex-1 ${stockAdjustment.type === 'add' ? 'bg-green-600 hover:bg-green-700 text-white' : ''}`}
                  >
                    <Plus className="h-3 w-3 mr-1" />
                    Add
                  </Button>
                  <Button
                    type="button"
                    variant={stockAdjustment.type === 'subtract' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setStockAdjustment(prev => ({ ...prev, type: 'subtract' }))}
                    className={`flex-1 ${stockAdjustment.type === 'subtract' ? 'bg-red-600 hover:bg-red-700 text-white' : ''}`}
                  >
                    <Minus className="h-3 w-3 mr-1" />
                    Subtract
                  </Button>
                </div>
                
                {/* Amount Input */}
                <Input
                  type="number"
                  min="1"
                  value={stockAdjustment.amount}
                  onChange={(e) => {
                    setStockAdjustment(prev => ({ ...prev, amount: e.target.value }))
                    if (errors.stockAdjustment) {
                      setErrors(prev => ({ ...prev, stockAdjustment: null }))
                    }
                  }}
                  placeholder="Amount"
                  className="flex-1"
                />
                
                {/* Apply Button */}
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleStockAdjustment}
                  disabled={!stockAdjustment.amount || parseInt(stockAdjustment.amount || '0', 10) <= 0 || loading}
                  className="whitespace-nowrap"
                >
                  {loading ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : null}
                  Apply
                </Button>
              </div>
              {errors.stockAdjustment && (
                <p className="text-sm text-destructive">{errors.stockAdjustment}</p>
              )}
              <p className="text-xs text-muted-foreground">
                Use this to quickly add or remove stock. The quantity will update and save automatically.
              </p>
            </div>
          )}

          {/* Row 1: Quantity (full width) */}
          <div className="space-y-1.5 sm:space-y-2">
            <Label htmlFor="quantity" className="text-sm sm:text-base">Quantity</Label>
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={() => handleQuantityChange(-1)}
                className="h-10 w-10 flex-shrink-0"
                disabled={parseInt(formData.quantity || '0', 10) <= 0}
              >
                <Minus className="h-4 w-4" />
              </Button>
              <Input
                id="quantity"
                type="number"
                min="0"
                value={formData.quantity}
                onChange={(e) => handleChange('quantity', e.target.value)}
                placeholder="0"
                className={`flex-1 ${errors.quantity ? 'border-destructive' : ''}`}
              />
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={() => handleQuantityChange(1)}
                className="h-10 w-10 flex-shrink-0"
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            {errors.quantity && (
              <p className="text-sm text-destructive">{errors.quantity}</p>
            )}
          </div>

          {/* Row 2: Category (left) and Price (right) — 2 columns */}
          <div className="grid grid-cols-2 gap-3 sm:gap-4">
            <div className="space-y-1.5 sm:space-y-2">
              <Label htmlFor="category" className="text-sm sm:text-base">Category</Label>
              <Select
                id="category"
                value={formData.category}
                onChange={(e) => handleChange('category', e.target.value)}
              >
                <option value="">Select a category</option>
                {categories.map(cat => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </Select>
            </div>
            <div className="space-y-1.5 sm:space-y-2">
              <Label htmlFor="price" className="text-sm sm:text-base">Price</Label>
              <Input
                id="price"
                type="number"
                min="0"
                step="0.01"
                value={formData.price}
                onChange={(e) => handleChange('price', e.target.value)}
                placeholder="0.00"
                className={errors.price ? 'border-destructive' : ''}
              />
              {errors.price && (
                <p className="text-sm text-destructive">{errors.price}</p>
              )}
            </div>
          </div>

          {/* Row 3: SKU (left) and Low Stock Level (right) — 2 columns */}
          <div className="grid grid-cols-2 gap-3 sm:gap-4">
            <div className="space-y-1.5 sm:space-y-2">
              <Label htmlFor="sku" className="text-sm sm:text-base">SKU</Label>
              <Input
                id="sku"
                value={formData.sku}
                onChange={(e) => handleChange('sku', e.target.value)}
                placeholder="Stock keeping unit"
              />
            </div>
            <div className="space-y-1.5 sm:space-y-2">
              <Label htmlFor="lowStockLevel" className="text-sm sm:text-base">Low Stock Level</Label>
              <Input
                id="lowStockLevel"
                type="number"
                min="0"
                value={formData.lowStockLevel}
                onChange={(e) => handleChange('lowStockLevel', e.target.value)}
                placeholder={LOW_STOCK_THRESHOLD.toString()}
                className={errors.lowStockLevel ? 'border-destructive' : ''}
              />
              {errors.lowStockLevel && (
                <p className="text-sm text-destructive">{errors.lowStockLevel}</p>
              )}
            </div>
          </div>

          <div className="space-y-1.5 sm:space-y-2">
            <Label htmlFor="description" className="text-sm sm:text-base">Description</Label>
            <textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleChange('description', e.target.value)}
              placeholder="Item description"
              rows={3}
              className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-base sm:text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 touch-manipulation resize-y"
            />
          </div>

          {isEditing && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground pt-2 border-t">
              <Calendar className="h-4 w-4" />
              <span>
                Last Updated: {item.lastUpdated 
                  ? new Date(item.lastUpdated).toLocaleString() 
                  : 'Never'}
              </span>
            </div>
          )}

          <DialogFooter className="flex-row gap-2 justify-between">
            <div className="flex gap-2">
              {isEditing && (
                <Button 
                  type="button" 
                  variant="destructive" 
                  onClick={handleDelete} 
                  disabled={loading}
                  className="col-auto"
                >
                  {loading ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Trash2 className="mr-2 h-4 w-4" />
                  )}
                  Delete
                </Button>
              )}
            </div>
            <div className="flex gap-2">
              <Button 
                type="button" 
                variant="outline" 
                onClick={onClose} 
                disabled={loading}
                className=""
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={loading}
                className=""
              >
                {loading ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Save className="mr-2 h-4 w-4" />
                )}
                {isEditing ? 'Update' : 'Add'} Item
              </Button>
            </div>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

export default ItemForm

