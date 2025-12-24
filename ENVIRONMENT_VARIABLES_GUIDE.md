# Environment Variables Guide

This guide explains what environment variables you need to set for both **local development** and **GitHub Pages deployment**.

## 📋 Quick Reference

### Required Variables (Must Set)
- `VITE_GOOGLE_CLIENT_ID` - Google OAuth 2.0 Client ID
- `VITE_GOOGLE_API_KEY` - Google API Key  
- `VITE_SPREADSHEET_ID` - Google Spreadsheet ID

### Optional Variables (Have Defaults)
- `VITE_SHEET_NAME` - Default: `Sheet1`
- `VITE_DATA_SHEET_NAME` - Default: `Data`
- `VITE_LOW_STOCK_THRESHOLD` - Default: `10`

---

## 🖥️ Local Development (.env file)

For local development, create a `.env` file in the project root:

### Step 1: Create `.env` file
Create a file named `.env` in the root directory (same level as `package.json`)

### Step 2: Add Required Variables

```env
# Required - Google OAuth 2.0 Client ID
# Get from: Google Cloud Console → APIs & Services → Credentials → OAuth 2.0 Client ID
VITE_GOOGLE_CLIENT_ID=your_client_id_here.apps.googleusercontent.com

# Required - Google API Key
# Get from: Google Cloud Console → APIs & Services → Credentials → API Keys
VITE_GOOGLE_API_KEY=your_api_key_here

# Required - Google Spreadsheet ID
# Get from: URL of your spreadsheet
# Example: https://docs.google.com/spreadsheets/d/1a2b3c4d5e6f7g8h9i0j/edit
# The ID is: 1a2b3c4d5e6f7g8h9i0j
VITE_SPREADSHEET_ID=your_spreadsheet_id_here
```

### Step 3: Add Optional Variables (if different from defaults)

```env
# Optional - Sheet name (default: "Sheet1")
# Use this if your main sheet has a different name
VITE_SHEET_NAME=Sheet1

# Optional - Data sheet name (default: "Data")
# Use this if your categories sheet has a different name
VITE_DATA_SHEET_NAME=Data

# Optional - Low stock threshold (default: 10)
# Items below this quantity will show as low stock
VITE_LOW_STOCK_THRESHOLD=10
```

### Complete .env Example

```env
VITE_GOOGLE_CLIENT_ID=123456789-abcdefghijklmnop.apps.googleusercontent.com
VITE_GOOGLE_API_KEY=AIzaSyDY4OeWCbAbJVqC7V_SMSdODGOky9yVjnY
VITE_SPREADSHEET_ID=1_V0cdtWkd2QsaU2QS_fT-JgrBmD8wvFy1MbDXJj2cQs
VITE_SHEET_NAME=Sheet1
VITE_DATA_SHEET_NAME=Data
VITE_LOW_STOCK_THRESHOLD=10
```

**Important Notes:**
- Do NOT add quotes around values
- Do NOT commit `.env` to git (it's in `.gitignore`)
- Restart your dev server after changing `.env`

---

## ☁️ GitHub Pages Deployment (GitHub Secrets)

For GitHub Pages deployment, you need to set **Repository Secrets** in GitHub.

### Step 1: Go to Repository Settings

1. Navigate to: https://github.com/noxbriones/gsheet_stockinventory
2. Click **Settings** (top menu)
3. In left sidebar: **Secrets and variables** → **Actions**

### Step 2: Add Required Secrets

Click **"New repository secret"** for each:

#### 1. VITE_GOOGLE_CLIENT_ID
- **Name**: `VITE_GOOGLE_CLIENT_ID`
- **Value**: Your Google OAuth 2.0 Client ID
- **Where to find**: 
  - Go to [Google Cloud Console](https://console.cloud.google.com/apis/credentials)
  - Click on your OAuth 2.0 Client ID
  - Copy the "Client ID" value
- **Example**: `123456789-abcdefghijklmnop.apps.googleusercontent.com`

#### 2. VITE_GOOGLE_API_KEY
- **Name**: `VITE_GOOGLE_API_KEY`
- **Value**: Your Google API Key
- **Where to find**:
  - Go to [Google Cloud Console](https://console.cloud.google.com/apis/credentials)
  - Click on "API Keys"
  - Copy the API key value
- **Example**: `AIzaSyDY4OeWCbAbJVqC7V_SMSdODGOky9yVjnY`

#### 3. VITE_SPREADSHEET_ID
- **Name**: `VITE_SPREADSHEET_ID`
- **Value**: Your Google Spreadsheet ID
- **Where to find**:
  - Open your Google Spreadsheet
  - Look at the URL: `https://docs.google.com/spreadsheets/d/SPREADSHEET_ID/edit`
  - Copy the ID between `/d/` and `/edit`
- **Example**: `1_V0cdtWkd2QsaU2QS_fT-JgrBmD8wvFy1MbDXJj2cQs`

### Step 3: Add Optional Secrets (Only if different from defaults)

#### 4. VITE_SHEET_NAME (Optional)
- **Name**: `VITE_SHEET_NAME`
- **Value**: The exact name of your main sheet tab
- **Default**: `Sheet1`
- **Only add if**: Your sheet has a different name (e.g., "Sheet 1", "Inventory", etc.)
- **Important**: Sheet names are case-sensitive and must match exactly!

#### 5. VITE_DATA_SHEET_NAME (Optional)
- **Name**: `VITE_DATA_SHEET_NAME`
- **Value**: The exact name of your categories/data sheet
- **Default**: `Data`
- **Only add if**: Your categories sheet has a different name

#### 6. VITE_LOW_STOCK_THRESHOLD (Optional)
- **Name**: `VITE_LOW_STOCK_THRESHOLD`
- **Value**: Number (as string)
- **Default**: `10`
- **Only add if**: You want a different threshold

### Step 4: Verify Secrets

After adding secrets, you should see them listed:
- ✅ `VITE_GOOGLE_CLIENT_ID`
- ✅ `VITE_GOOGLE_API_KEY`
- ✅ `VITE_SPREADSHEET_ID`
- (Optional) `VITE_SHEET_NAME`
- (Optional) `VITE_DATA_SHEET_NAME`
- (Optional) `VITE_LOW_STOCK_THRESHOLD`

**Important Notes:**
- Secret names are **case-sensitive** - must match exactly
- No quotes around values
- No spaces before/after values
- Secrets are encrypted and cannot be viewed after creation

---

## 🔍 How to Find Your Values

### Finding Google OAuth Client ID

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Select your project
3. Navigate to **APIs & Services** → **Credentials**
4. Under "OAuth 2.0 Client IDs", click on your client
5. Copy the **Client ID** (looks like: `xxx.apps.googleusercontent.com`)

### Finding Google API Key

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Select your project
3. Navigate to **APIs & Services** → **Credentials**
4. Under "API Keys", click on your key
5. Copy the **Key** value (starts with `AIza...`)

### Finding Spreadsheet ID

1. Open your Google Spreadsheet
2. Look at the URL in your browser
3. The URL format is: `https://docs.google.com/spreadsheets/d/SPREADSHEET_ID/edit`
4. Copy the ID between `/d/` and `/edit`

**Example:**
- URL: `https://docs.google.com/spreadsheets/d/1_V0cdtWkd2QsaU2QS_fT-JgrBmD8wvFy1MbDXJj2cQs/edit`
- ID: `1_V0cdtWkd2QsaU2QS_fT-JgrBmD8wvFy1MbDXJj2cQs`

### Finding Sheet Name

1. Open your Google Spreadsheet
2. Look at the sheet tabs at the bottom
3. The default is usually "Sheet1" or "Sheet 1"
4. Copy the exact name (case-sensitive, including spaces)

---

## ✅ Checklist

### Local Development
- [ ] Created `.env` file in project root
- [ ] Added `VITE_GOOGLE_CLIENT_ID`
- [ ] Added `VITE_GOOGLE_API_KEY`
- [ ] Added `VITE_SPREADSHEET_ID`
- [ ] (Optional) Added `VITE_SHEET_NAME` if different
- [ ] (Optional) Added `VITE_DATA_SHEET_NAME` if different
- [ ] (Optional) Added `VITE_LOW_STOCK_THRESHOLD` if different
- [ ] Restarted dev server

### GitHub Pages
- [ ] Added `VITE_GOOGLE_CLIENT_ID` secret
- [ ] Added `VITE_GOOGLE_API_KEY` secret
- [ ] Added `VITE_SPREADSHEET_ID` secret
- [ ] (Optional) Added `VITE_SHEET_NAME` secret if different
- [ ] (Optional) Added `VITE_DATA_SHEET_NAME` secret if different
- [ ] (Optional) Added `VITE_LOW_STOCK_THRESHOLD` secret if different
- [ ] Triggered new deployment

---

## 🚨 Common Mistakes

1. **Adding quotes around values**
   - ❌ Wrong: `VITE_GOOGLE_CLIENT_ID="123-abc.apps.googleusercontent.com"`
   - ✅ Correct: `VITE_GOOGLE_CLIENT_ID=123-abc.apps.googleusercontent.com`

2. **Extra spaces**
   - ❌ Wrong: `VITE_GOOGLE_CLIENT_ID= 123-abc.apps.googleusercontent.com `
   - ✅ Correct: `VITE_GOOGLE_CLIENT_ID=123-abc.apps.googleusercontent.com`

3. **Wrong sheet name**
   - ❌ Wrong: `VITE_SHEET_NAME=sheet1` (if actual name is "Sheet1")
   - ✅ Correct: `VITE_SHEET_NAME=Sheet1` (must match exactly, case-sensitive)

4. **Using wrong spreadsheet ID**
   - Make sure you're copying the ID from the URL, not the full URL

---

## 🔗 Quick Links

- **GitHub Secrets**: https://github.com/noxbriones/gsheet_stockinventory/settings/secrets/actions
- **Google Cloud Console**: https://console.cloud.google.com/apis/credentials
- **Workflow Actions**: https://github.com/noxbriones/gsheet_stockinventory/actions

---

## 📝 Summary

**Minimum Required (3 secrets):**
1. `VITE_GOOGLE_CLIENT_ID`
2. `VITE_GOOGLE_API_KEY`
3. `VITE_SPREADSHEET_ID`

**Optional (only if different from defaults):**
- `VITE_SHEET_NAME` (default: "Sheet1")
- `VITE_DATA_SHEET_NAME` (default: "Data")
- `VITE_LOW_STOCK_THRESHOLD` (default: "10")

All variables must start with `VITE_` to be accessible in the Vite build process.

