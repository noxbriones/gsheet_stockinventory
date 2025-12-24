# Deployment Checklist

## Issues Found and Fixed

### ✅ Fixed Issues

1. **Environment Variable Validation**
   - **Issue**: No validation for required environment variables, app would fail silently
   - **Fix**: Added `validateEnvVars()` function in `src/utils/constants.js` that checks for required variables on app startup
   - **Location**: `src/context/InventoryContext.jsx` - validation runs before Google API initialization

2. **Missing .env.example File**
   - **Issue**: README references `.env.example` but file doesn't exist
   - **Fix**: Created `.env.example` with all required and optional variables documented
   - **Note**: File may be blocked by gitignore, but template is documented in README

3. **Base Path Configuration**
   - **Issue**: No support for deploying to subdirectories (e.g., GitHub Pages)
   - **Fix**: Added `base` configuration in `vite.config.js` that reads from `VITE_BASE_PATH` environment variable
   - **Usage**: Set `VITE_BASE_PATH=/your-subdirectory/` for subdirectory deployments

4. **Build Optimization**
   - **Issue**: No code splitting configuration
   - **Fix**: Added manual chunk splitting in `vite.config.js` to separate React vendor code
   - **Result**: Smaller initial bundle, better caching

5. **Error Handling**
   - **Issue**: Missing error messages for missing credentials
   - **Fix**: Added clear error messages when environment variables are missing
   - **Location**: Error displayed in UI when validation fails

### ⚠️ Issues to Address Before Deployment

1. **Google Cloud Console Configuration**
   - **Action Required**: Add your production domain to:
     - Authorized JavaScript origins
     - Authorized redirect URIs
   - **Location**: Google Cloud Console → APIs & Services → Credentials → OAuth 2.0 Client IDs

2. **Content Security Policy (CSP)**
   - **Current**: CSP is configured in `index.html`
   - **Review**: Verify CSP allows all required Google API domains
   - **Location**: `index.html` line 8
   - **Note**: May need adjustment based on hosting provider

3. **SPA Routing Configuration**
   - **Issue**: Most hosting providers need configuration to serve `index.html` for all routes
   - **Solution**: 
     - **Netlify**: Create `_redirects` file in `public` folder with `/* /index.html 200`
     - **Vercel**: Add `vercel.json` with rewrite rules
     - **Apache**: Add `.htaccess` with rewrite rules
     - **Nginx**: Configure try_files directive

4. **Environment Variables in Production**
   - **Action Required**: Set all environment variables in your deployment platform
   - **Required Variables**:
     - `VITE_GOOGLE_CLIENT_ID`
     - `VITE_GOOGLE_API_KEY`
     - `VITE_SPREADSHEET_ID`
   - **Optional Variables**:
     - `VITE_SHEET_NAME` (default: "Sheet1")
     - `VITE_DATA_SHEET_NAME` (default: "Data")
     - `VITE_LOW_STOCK_THRESHOLD` (default: 10)
     - `VITE_BASE_PATH` (default: "/")

### 📋 Pre-Deployment Checklist

- [ ] All environment variables set in deployment platform
- [ ] Production domain added to Google Cloud Console
- [ ] Build completes successfully (`npm run build`)
- [ ] Test build locally (`npm run preview`)
- [ ] SPA routing configured (if needed)
- [ ] CSP reviewed and adjusted (if needed)
- [ ] Google Sheets API enabled in Google Cloud Console
- [ ] Spreadsheet is accessible and has correct structure

### 🔍 Testing Checklist

- [ ] App loads without errors
- [ ] Google Sign-in works
- [ ] Can fetch items from spreadsheet
- [ ] Can add new items
- [ ] Can edit items
- [ ] Can delete items
- [ ] Search functionality works
- [ ] Filters work correctly
- [ ] Low stock alerts display
- [ ] Refresh button works
- [ ] Sign out works

### 🚀 Deployment Steps

1. **Build the application**:
   ```bash
   npm run build
   ```

2. **Test the build locally**:
   ```bash
   npm run preview
   ```

3. **Deploy the `dist` folder** to your hosting provider

4. **Configure environment variables** in your hosting platform

5. **Configure SPA routing** (if needed)

6. **Test the deployed application**

### 📝 Notes

- The build output is in the `dist` directory
- Environment variables must be set at build time (Vite replaces them during build)
- For some platforms (like Netlify/Vercel), environment variables are automatically available during build
- The app uses localStorage for token storage, which persists across sessions
- Google OAuth tokens expire after 1 hour and are automatically refreshed when possible

