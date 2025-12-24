# Stock Inventory Web App

A React-based single-page application for managing stock inventory using Google Sheets as the backend database. Built with shadcn/ui components and Tailwind CSS.

## Features

- View inventory items
- Add new items
- Edit existing items
- Delete items
- Search and filter items
- Stock level tracking with low stock alerts

## Setup

1. Install dependencies:
```bash
npm install
```

2. Set up Google Sheets API:
   - Create a Google Cloud Project
   - Enable Google Sheets API
   - Create OAuth 2.0 credentials
   - Create a Google Spreadsheet with:
     - **Main Sheet** (default: "Sheet1") with the following header row:
       - ID, Name, SKU, Quantity, Price, Category, Description, Low Stock Level, Last Updated
     - **Data Sheet** (default: "Data") with a "Category" column containing all available categories

3. Configure environment variables:
   - Copy `.env.example` to `.env`
   - Fill in your Google API credentials and Spreadsheet ID

4. Run the development server:
```bash
npm run dev
```

## Environment Variables

Create a `.env` file with the following variables:

```
VITE_GOOGLE_CLIENT_ID=your_client_id_here
VITE_GOOGLE_API_KEY=your_api_key_here
VITE_SPREADSHEET_ID=your_spreadsheet_id_here
VITE_SHEET_NAME=Sheet1
VITE_DATA_SHEET_NAME=Data
VITE_LOW_STOCK_THRESHOLD=10
```

## Build

```bash
npm run build
```

The build output will be in the `dist` directory, ready for deployment.

## Deployment

### Pre-deployment Checklist

1. **Environment Variables**: Ensure all required environment variables are set in your deployment platform:
   - `VITE_GOOGLE_CLIENT_ID` (required)
   - `VITE_GOOGLE_API_KEY` (required)
   - `VITE_SPREADSHEET_ID` (required)
   - `VITE_SHEET_NAME` (optional, default: "Sheet1")
   - `VITE_DATA_SHEET_NAME` (optional, default: "Data")
   - `VITE_LOW_STOCK_THRESHOLD` (optional, default: 10)
   - `VITE_BASE_PATH` (optional, for subdirectory deployments, e.g., "/app/")

2. **Google Cloud Console Configuration**:
   - Add your production domain to authorized JavaScript origins
   - Add your production domain to authorized redirect URIs
   - Ensure Google Sheets API is enabled

3. **Build the Application**:
   ```bash
   npm run build
   ```

4. **Deploy the `dist` folder** to your hosting provider (Netlify, Vercel, GitHub Pages, etc.)

### Common Deployment Platforms

#### Netlify
- Set environment variables in Netlify dashboard
- Deploy the `dist` folder or connect your Git repository
- Build command: `npm run build`
- Publish directory: `dist`

#### Vercel
- Set environment variables in Vercel dashboard
- Deploy the `dist` folder or connect your Git repository
- Build command: `npm run build`
- Output directory: `dist`

#### GitHub Pages (Subdirectory)
- Set `VITE_BASE_PATH=/repository-name/` in your environment variables
- Build and deploy the `dist` folder contents to the `gh-pages` branch

### Troubleshooting

- **"Missing required environment variables"**: Check that all required env vars are set in your deployment platform
- **Google Sign-in not working**: Verify your production domain is added to Google Cloud Console authorized origins
- **404 errors on refresh**: Configure your hosting provider to serve `index.html` for all routes (SPA routing)
- **CSP errors**: The Content Security Policy in `index.html` may need adjustment based on your hosting setup

