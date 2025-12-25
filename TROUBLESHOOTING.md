# Troubleshooting Guide

## Common Errors and Solutions

### Content Security Policy (CSP) Error

**Error Message:**
```
Connecting to 'https://www.google.com/images/cleardot.gif' violates the following Content Security Policy directive: "connect-src ..."
```

**Possible Causes:**

1. **Missing Google Domain in CSP**
   - The CSP `connect-src` directive doesn't include `www.google.com`
   - Google services sometimes make requests to `www.google.com` (e.g., tracking pixels)
   - The wildcard `*.googleapis.com` only covers API subdomains, not `google.com`

2. **Incomplete CSP Configuration**
   - CSP may be missing other required Google domains
   - Some Google services use different subdomains

**Solutions:**

1. **Update CSP in `index.html`:**
   - Add `https://www.google.com` and `https://*.google.com` to the `connect-src` directive
   - This allows connections to Google's main domain and subdomains
   - Example:
     ```
     connect-src 'self' ... https://www.google.com https://*.google.com
     ```

2. **Rebuild the Application:**
   - After updating `index.html`, rebuild the application:
     ```bash
     npm run build
     ```
   - The updated CSP will be included in the `dist/index.html` file

3. **Verify CSP Configuration:**
   - Check that all required Google domains are included:
     - `https://apis.google.com`
     - `https://accounts.google.com`
     - `https://*.googleapis.com`
     - `https://www.google.com`
     - `https://*.google.com`

**Note:** The `cleardot.gif` is a 1x1 transparent pixel used by Google for tracking/analytics. While blocking it won't break core functionality, it may cause console warnings. Adding `www.google.com` to CSP resolves this.

### Cross-Origin-Opener-Policy (COOP) Error

**Error Message:**
```
Cross-Origin-Opener-Policy policy would block the window.opener call.
```

**Possible Causes:**

1. **OAuth Popup Mode Attempted**
   - The application is trying to use popup mode for OAuth
   - Browser security policies block window.opener calls

2. **Hosting Provider COOP Headers**
   - Your hosting provider (e.g., GitHub Pages) might be setting COOP headers
   - These headers block cross-origin window.opener access

3. **Browser Security Settings**
   - Browser extensions or security settings blocking OAuth popups
   - Strict privacy settings preventing window.opener

**Solutions:**

1. **Verify Redirect Mode is Used:**
   - The application uses redirect mode (`ux_mode: 'redirect'`) by default
   - This avoids window.opener issues entirely
   - If you see this error, it might be a warning that can be safely ignored

2. **Check Hosting Configuration:**
   - If using GitHub Pages or similar, check if COOP headers are being set
   - These headers are usually not set by default
   - The application is designed to work with redirect mode, which doesn't require window.opener

3. **Clear Browser Cache:**
   - Clear browser cache and cookies
   - Try in an incognito/private window
   - Disable browser extensions temporarily

4. **Verify OAuth Configuration:**
   - Ensure `ux_mode: 'redirect'` is set in the OAuth client configuration
   - Check that redirect_uri is properly configured in Google Cloud Console
   - Verify the redirect URI matches your application URL exactly

**Note:** This error is typically a warning and shouldn't prevent authentication if redirect mode is properly configured. The application will redirect to Google's OAuth page and back, which doesn't require window.opener.

**If the error persists:**
- Check browser console for more details
- Verify the OAuth flow completes successfully despite the warning
- The authentication should still work with redirect mode

### 400 Bad Request - Google Sheets API

**Error Message:**
```
GET https://content-sheets.googleapis.com/v4/spreadsheets/.../values/Sheet1!A2:I 400 (Bad Request)
```

**Possible Causes:**

1. **Sheet Name Doesn't Exist**
   - The sheet name in your environment variable doesn't match the actual sheet name in your spreadsheet
   - Sheet names are case-sensitive
   - Check your spreadsheet and verify the exact sheet name

2. **Spreadsheet Structure**
   - The spreadsheet might not have the expected structure
   - Ensure the sheet has at least a header row

3. **Range Format**
   - The range `Sheet1!A2:I` might be invalid if the sheet is empty or doesn't have enough columns

**Solutions:**

1. **Verify Sheet Name:**
   - Open your Google Spreadsheet
   - Check the exact name of the sheet tab (e.g., "Sheet1", "Sheet 1", "Data")
   - Update your `VITE_SHEET_NAME` environment variable to match exactly
   - For GitHub Pages, update the `VITE_SHEET_NAME` secret

2. **Check Spreadsheet Access:**
   - Ensure you're signed in with a Google account that has access to the spreadsheet
   - The spreadsheet must be shared with your Google account
   - If the spreadsheet is private, you need to be the owner or have been granted access

3. **Verify Spreadsheet Structure:**
   - Open your spreadsheet
   - Ensure there's a sheet with the name specified in `VITE_SHEET_NAME`
   - The sheet should have at least a header row with columns: ID, Name, SKU, Quantity, Price, Category, Description, Low Stock Level, Last Updated

4. **Test with a Simple Range:**
   - Try accessing just the header row first: `Sheet1!A1:I1`
   - If that works, the issue might be with the data range

**How to Fix:**

1. **Check Your Spreadsheet:**
   ```
   1. Open: https://docs.google.com/spreadsheets/d/YOUR_SPREADSHEET_ID/edit
   2. Look at the sheet tabs at the bottom
   3. Note the exact name (case-sensitive, including spaces)
   ```

2. **Update Environment Variables:**
   - Local: Update `.env` file with correct `VITE_SHEET_NAME`
   - GitHub: Update the `VITE_SHEET_NAME` secret in repository settings

3. **Verify Spreadsheet ID:**
   - The ID in the URL: `https://docs.google.com/spreadsheets/d/SPREADSHEET_ID/edit`
   - Should match your `VITE_SPREADSHEET_ID` exactly

4. **Check Permissions:**
   - Ensure your Google account has at least "Viewer" access to the spreadsheet
   - For editing, you need "Editor" access

### Other Common Issues

#### 403 Forbidden

**Error Message:**
```
GET https://content-sheets.googleapis.com/v4/spreadsheets/... 403 (Forbidden)
```

**Possible Causes:**

1. **Not Authenticated or Token Expired**
   - You haven't signed in with Google
   - Your authentication token has expired
   - The token was cleared from browser storage

2. **Insufficient Permissions**
   - The spreadsheet is not shared with your Google account
   - Your Google account doesn't have access to the spreadsheet
   - The spreadsheet owner hasn't granted you permission

3. **API Configuration Issues**
   - Google Sheets API is not enabled in your Google Cloud project
   - OAuth credentials are incorrect or misconfigured
   - API key restrictions are blocking the request

4. **Token Not Set Properly**
   - The OAuth token isn't being sent with the request
   - The token format is incorrect

**Solutions:**

1. **Sign In Again:**
   - Click the "Sign In" button in the application
   - Complete the Google OAuth flow
   - Grant the necessary permissions when prompted

2. **Check Spreadsheet Sharing:**
   - Open your Google Spreadsheet
   - Click the "Share" button (top right)
   - Ensure your Google account email is added with at least "Viewer" access
   - For editing, you need "Editor" access
   - Make sure you're using the same Google account in the app

3. **Verify Google Cloud Configuration:**
   - Go to [Google Cloud Console](https://console.cloud.google.com/)
   - Select your project
   - Navigate to "APIs & Services" > "Enabled APIs"
   - Ensure "Google Sheets API" is enabled
   - Check OAuth 2.0 Client ID configuration

4. **Check Environment Variables:**
   - Verify `VITE_GOOGLE_CLIENT_ID` is correct
   - Verify `VITE_GOOGLE_API_KEY` is correct
   - Ensure `VITE_SPREADSHEET_ID` matches your spreadsheet

5. **Clear Browser Storage and Retry:**
   - Open browser Developer Tools (F12)
   - Go to Application tab > Local Storage
   - Clear all items related to the app
   - Refresh the page and sign in again

**How to Fix:**

1. **Immediate Fix:**
   ```
   1. Click "Sign In" in the application
   2. Complete Google authentication
   3. Grant permissions when prompted
   ```

2. **Verify Spreadsheet Access:**
   ```
   1. Open: https://docs.google.com/spreadsheets/d/YOUR_SPREADSHEET_ID/edit
   2. Click "Share" button
   3. Add your Google account email
   4. Set permission to "Editor" or "Viewer"
   ```

3. **Check Google Cloud Setup:**
   ```
   1. Go to Google Cloud Console
   2. Verify Google Sheets API is enabled
   3. Check OAuth consent screen is configured
   4. Verify OAuth 2.0 Client ID is correct
   ```

#### 404 Not Found
- **Cause**: Spreadsheet ID is incorrect or spreadsheet was deleted
- **Fix**: Verify the spreadsheet ID in your environment variables

#### "Sheet not found" Error
- **Cause**: Sheet name doesn't match
- **Fix**: Check exact sheet name (case-sensitive) and update environment variable

## Debugging Steps

1. **Check Browser Console:**
   - Open Developer Tools (F12)
   - Look at the Network tab for failed requests
   - Check the Console tab for error messages

2. **Verify Environment Variables:**
   - Check that all required variables are set
   - Verify values are correct (no extra spaces, correct format)

3. **Test Spreadsheet Access:**
   - Try opening the spreadsheet directly in your browser
   - Ensure you can view and edit it manually

4. **Check Google Cloud Console:**
   - Verify Google Sheets API is enabled
   - Check that OAuth credentials are correct
   - Ensure API key has proper restrictions (if any)

## Getting Help

If you're still experiencing issues:

1. Check the browser console for detailed error messages
2. Verify all environment variables are set correctly
3. Ensure the spreadsheet structure matches the expected format
4. Check that your Google account has proper permissions

