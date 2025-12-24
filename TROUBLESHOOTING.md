# Troubleshooting Guide

## Common Errors and Solutions

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
- **Cause**: No permission to access the spreadsheet
- **Fix**: Share the spreadsheet with your Google account

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

