# Setting Up GitHub Secrets

## ⚠️ Error: Missing Environment Variables

If you're seeing this error:
```
Environment variable validation failed: ['VITE_GOOGLE_CLIENT_ID is required', 'VITE_GOOGLE_API_KEY is required', 'VITE_SPREADSHEET_ID is required']
```

It means the GitHub Secrets are not set or are empty.

## 🔧 How to Fix

### Step 1: Go to Repository Settings

1. Navigate to: https://github.com/noxbriones/gsheet_stockinventory
2. Click on **Settings** (top menu)
3. In the left sidebar, click **Secrets and variables** → **Actions**

### Step 2: Add Required Secrets

Click **New repository secret** for each of the following:

#### Required Secrets:

1. **Name**: `VITE_GOOGLE_CLIENT_ID`
   - **Value**: Your Google OAuth 2.0 Client ID
   - **Where to find**: Google Cloud Console → APIs & Services → Credentials → OAuth 2.0 Client ID

2. **Name**: `VITE_GOOGLE_API_KEY`
   - **Value**: Your Google API Key
   - **Where to find**: Google Cloud Console → APIs & Services → Credentials → API Keys

3. **Name**: `VITE_SPREADSHEET_ID`
   - **Value**: Your Google Spreadsheet ID
   - **Where to find**: In the URL of your spreadsheet: `https://docs.google.com/spreadsheets/d/SPREADSHEET_ID/edit`
   - **Example**: If URL is `https://docs.google.com/spreadsheets/d/1a2b3c4d5e6f7g8h9i0j/edit`, the ID is `1a2b3c4d5e6f7g8h9i0j`

#### Optional Secrets (have defaults):

4. **Name**: `VITE_SHEET_NAME`
   - **Value**: `Sheet1` (or your sheet name)
   - **Default**: `Sheet1` (only add if different)

5. **Name**: `VITE_DATA_SHEET_NAME`
   - **Value**: `Data` (or your data sheet name)
   - **Default**: `Data` (only add if different)

6. **Name**: `VITE_LOW_STOCK_THRESHOLD`
   - **Value**: `10` (or your threshold)
   - **Default**: `10` (only add if different)

### Step 3: Verify Secrets Are Set

After adding all secrets, you should see them listed in the **Secrets and variables** → **Actions** page.

**Important**: 
- Secret names are case-sensitive
- Make sure there are no extra spaces
- Values should not have quotes around them

### Step 4: Trigger a New Deployment

After setting the secrets:

1. Go to **Actions** tab
2. Select **Deploy to GitHub Pages** workflow
3. Click **Run workflow** → **Run workflow** (green button)
4. Or simply push a new commit to trigger the workflow

### Step 5: Check Build Logs

1. Go to **Actions** tab
2. Click on the latest workflow run
3. Check the **Check required secrets** step - it should show "✓ All required secrets are set"
4. If it shows errors, double-check your secret names and values

## 🔍 Troubleshooting

### Secret Not Found
- **Issue**: Workflow says secret is not set
- **Fix**: 
  - Verify the secret name matches exactly (case-sensitive)
  - Make sure you clicked "Add secret" after entering the value
  - Check that you're in the correct repository

### Build Still Fails
- **Issue**: Secrets are set but build fails
- **Fix**:
  - Check the build logs for specific error messages
  - Verify the values are correct (no extra spaces, correct format)
  - Make sure Google Cloud Console credentials are valid

### App Shows Error After Deployment
- **Issue**: App deploys but shows environment variable errors
- **Fix**:
  - Secrets must be set BEFORE the build runs
  - Re-run the workflow after setting secrets
  - Check that all three required secrets are set

## 📝 Quick Checklist

- [ ] `VITE_GOOGLE_CLIENT_ID` secret added
- [ ] `VITE_GOOGLE_API_KEY` secret added
- [ ] `VITE_SPREADSHEET_ID` secret added
- [ ] Workflow triggered (manually or via push)
- [ ] Build completed successfully
- [ ] App accessible at: https://noxbriones.github.io/gsheet_stockinventory/

## 🔗 Useful Links

- **Repository Settings**: https://github.com/noxbriones/gsheet_stockinventory/settings/secrets/actions
- **Google Cloud Console**: https://console.cloud.google.com/apis/credentials
- **Workflow Actions**: https://github.com/noxbriones/gsheet_stockinventory/actions

