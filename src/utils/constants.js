// Google Sheets configuration
export const SPREADSHEET_ID = import.meta.env.VITE_SPREADSHEET_ID || ''
export const SHEET_NAME = import.meta.env.VITE_SHEET_NAME || 'Sheet1'
export const DATA_SHEET_NAME = import.meta.env.VITE_DATA_SHEET_NAME || 'Data'
export const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || ''
export const GOOGLE_API_KEY = import.meta.env.VITE_GOOGLE_API_KEY || ''
export const LOW_STOCK_THRESHOLD = parseInt(import.meta.env.VITE_LOW_STOCK_THRESHOLD || '10', 10)

// Validate required environment variables
export const validateEnvVars = () => {
  const errors = []
  
  if (!GOOGLE_CLIENT_ID) {
    errors.push('VITE_GOOGLE_CLIENT_ID is required')
  }
  
  if (!GOOGLE_API_KEY) {
    errors.push('VITE_GOOGLE_API_KEY is required')
  }
  
  if (!SPREADSHEET_ID) {
    errors.push('VITE_SPREADSHEET_ID is required')
  }
  
  return errors
}

// Column mappings (0-indexed)
export const COLUMNS = {
  ID: 0,
  NAME: 1,
  SKU: 2,
  QUANTITY: 3,
  PRICE: 4,
  CATEGORY: 5,
  DESCRIPTION: 6,
  LOW_STOCK_LEVEL: 7,
  LAST_UPDATED: 8
}

// Column names for header row
export const COLUMN_NAMES = [
  'ID',
  'Name',
  'SKU',
  'Quantity',
  'Price',
  'Category',
  'Description',
  'Low Stock Level',
  'Last Updated'
]

// Google API scopes
export const SCOPES = 'https://www.googleapis.com/auth/spreadsheets'

// API discovery URL
export const DISCOVERY_DOCS = ['https://sheets.googleapis.com/$discovery/rest?version=v4']

