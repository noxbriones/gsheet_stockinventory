import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { Input } from './ui/input'
import { Label } from './ui/label'
import { Badge } from './ui/badge'
import { Button } from './ui/button'
import { Loader2, Calendar, TrendingUp, TrendingDown, Minus, RefreshCw, Trash2 } from 'lucide-react'
import { getQuantityLogEntries } from '../services/googleSheetsService'
import { Select } from './ui/select'
import { useInventory } from '../context/InventoryContext'

const ChangesLog = () => {
  const { openCleanupDialog } = useInventory()
  const [logEntries, setLogEntries] = useState([])
  const [filteredEntries, setFilteredEntries] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [dateFilter, setDateFilter] = useState('') // Format: YYYY-MM-DD
  const [itemFilter, setItemFilter] = useState('')
  const [typeFilter, setTypeFilter] = useState('all') // 'all', 'Add', 'Subtract', 'Set'

  useEffect(() => {
    fetchLogEntries()
  }, [])

  useEffect(() => {
    filterEntries()
  }, [logEntries, dateFilter, itemFilter, typeFilter])

  const fetchLogEntries = async () => {
    setLoading(true)
    setError(null)
    try {
      const entries = await getQuantityLogEntries()
      // Sort by timestamp (newest first)
      entries.sort((a, b) => {
        const dateA = a.timestamp ? new Date(a.timestamp).getTime() : 0
        const dateB = b.timestamp ? new Date(b.timestamp).getTime() : 0
        return dateB - dateA
      })
      setLogEntries(entries)
    } catch (err) {
      setError('Failed to fetch changes log: ' + err.message)
      console.error('Fetch error:', err)
    } finally {
      setLoading(false)
    }
  }

  const filterEntries = () => {
    let filtered = [...logEntries]

    // Filter by date
    if (dateFilter) {
      const filterDate = new Date(dateFilter)
      filterDate.setHours(0, 0, 0, 0)
      const nextDay = new Date(filterDate)
      nextDay.setDate(nextDay.getDate() + 1)

      filtered = filtered.filter(entry => {
        if (!entry.timestamp) return false
        const entryDate = new Date(entry.timestamp)
        return entryDate >= filterDate && entryDate < nextDay
      })
    }

    // Filter by item name
    if (itemFilter.trim()) {
      const query = itemFilter.toLowerCase()
      filtered = filtered.filter(entry =>
        entry.itemName.toLowerCase().includes(query) ||
        entry.itemId.toLowerCase().includes(query)
      )
    }

    // Filter by type
    if (typeFilter !== 'all') {
      filtered = filtered.filter(entry => {
        const entryType = entry.changeType || ''
        if (typeFilter === 'Add') {
          return entryType.toLowerCase() === 'add' || entry.change > 0
        } else if (typeFilter === 'Subtract') {
          return entryType.toLowerCase() === 'subtract' || entry.change < 0
        } else if (typeFilter === 'Set') {
          return entryType.toLowerCase() === 'set' || entry.change === 0
        }
        return entryType.toLowerCase() === typeFilter.toLowerCase()
      })
    }

    setFilteredEntries(filtered)
  }

  const getChangeIcon = (change) => {
    if (change > 0) return <TrendingUp className="h-4 w-4 text-green-500" />
    if (change < 0) return <TrendingDown className="h-4 w-4 text-red-500" />
    return <Minus className="h-4 w-4 text-muted-foreground" />
  }

  const getChangeBadgeVariant = (change) => {
    if (change > 0) return 'success'
    if (change < 0) return 'destructive'
    return 'secondary'
  }

  const formatDate = (timestamp) => {
    if (!timestamp) return '-'
    try {
      const date = new Date(timestamp)
      return date.toLocaleString()
    } catch {
      return timestamp
    }
  }

  if (loading && logEntries.length === 0) {
    return (
      <Card className="mt-4 sm:mt-6">
        <CardContent className="flex flex-col items-center justify-center py-8 sm:py-12 px-4">
          <Loader2 className="h-8 w-8 sm:h-10 sm:w-10 animate-spin text-primary mb-4" />
          <p className="text-muted-foreground text-sm sm:text-base">Loading changes log...</p>
        </CardContent>
      </Card>
    )
  }

  if (error && logEntries.length === 0) {
    return (
      <Card className="mt-4 sm:mt-6 border-destructive">
        <CardContent className="flex flex-col items-center justify-center py-8 sm:py-12 px-4">
          <p className="text-destructive font-medium text-sm sm:text-base text-center break-words">
            Error: {error}
          </p>
          <Button onClick={fetchLogEntries} className="mt-4">
            Retry
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="mt-4 sm:mt-6">
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <CardTitle className="text-xl sm:text-2xl">Changes Log</CardTitle>
            <div className="flex gap-2">
              <Button
                onClick={openCleanupDialog}
                variant="outline"
                size="sm"
                disabled={loading}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Cleanup
              </Button>
              <Button
                onClick={fetchLogEntries}
                variant="outline"
                size="sm"
                disabled={loading}
              >
                {loading ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <RefreshCw className="h-4 w-4 mr-2" />
                )}
                Refresh
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Filters */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pb-4 border-b">
            <div className="space-y-2">
              <Label htmlFor="dateFilter">Filter by Date</Label>
              <Input
                id="dateFilter"
                type="date"
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                className="w-full"
              />
              {dateFilter && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setDateFilter('')}
                  className="h-6 text-xs"
                >
                  Clear date filter
                </Button>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="itemFilter">Filter by Item</Label>
              <Input
                id="itemFilter"
                type="text"
                value={itemFilter}
                onChange={(e) => setItemFilter(e.target.value)}
                placeholder="Search by item name or ID..."
                className="w-full"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="typeFilter">Filter by Type</Label>
              <Select
                id="typeFilter"
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
              >
                <option value="all">All Types</option>
                <option value="Add">Add</option>
                <option value="Subtract">Subtract</option>
                <option value="Set">Set</option>
              </Select>
            </div>
          </div>

          {/* Results count */}
          <div className="text-sm text-muted-foreground">
            Showing {filteredEntries.length} of {logEntries.length} change{logEntries.length !== 1 ? 's' : ''}
            {dateFilter && ` on ${new Date(dateFilter).toLocaleDateString()}`}
            {typeFilter !== 'all' && ` (Type: ${typeFilter})`}
          </div>

          {/* Log entries table */}
          {filteredEntries.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No changes found</p>
              {(dateFilter || itemFilter || typeFilter !== 'all') && (
                <p className="text-sm mt-2">Try adjusting your filters</p>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-muted/50">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-semibold">Date & Time</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold">Item</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold">Old Qty</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold">New Qty</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold">Change</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold">Type</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredEntries.map((entry, index) => (
                    <tr
                      key={`${entry.timestamp}-${entry.itemId}-${index}`}
                      className={`hover:bg-muted/50 transition-colors ${
                        index !== filteredEntries.length - 1 ? 'border-b' : ''
                      }`}
                    >
                      <td className="px-4 py-3 text-sm">
                        {formatDate(entry.timestamp)}
                      </td>
                      <td className="px-4 py-3 text-sm">
                        <div className="font-medium">{entry.itemName || '-'}</div>
                        <div className="text-xs text-muted-foreground">{entry.itemId}</div>
                      </td>
                      <td className="px-4 py-3 text-sm">{entry.oldQuantity}</td>
                      <td className="px-4 py-3 text-sm font-medium">{entry.newQuantity}</td>
                      <td className="px-4 py-3 text-sm">
                        <div className="flex items-center gap-2">
                          {getChangeIcon(entry.change)}
                          <Badge variant={getChangeBadgeVariant(entry.change)} className="text-xs">
                            {entry.change > 0 ? '+' : ''}{entry.change}
                          </Badge>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm">
                        <Badge 
                          variant="outline" 
                          className={`text-xs ${
                            entry.changeType?.toLowerCase() === 'subtract' || entry.change < 0
                              ? 'text-red-600 border-red-600 bg-red-50'
                              : entry.changeType?.toLowerCase() === 'add' || entry.change > 0
                              ? 'text-green-600 border-green-600 bg-green-50'
                              : ''
                          }`}
                        >
                          {entry.changeType || '-'}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

export default ChangesLog

