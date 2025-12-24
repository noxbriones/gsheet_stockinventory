# GitHub Deployment Guide

## ✅ Code Pushed to GitHub

Your code has been successfully pushed to:
**https://github.com/noxbriones/gsheet_stockinventory**

## 🚀 Setting Up GitHub Pages

### Step 1: Enable GitHub Pages

1. Go to your repository: https://github.com/noxbriones/gsheet_stockinventory
2. Click on **Settings** → **Pages**
3. Under **Source**, select **GitHub Actions** (not "Deploy from a branch")
4. Save the settings

### Step 2: Add Repository Secrets

You need to add your environment variables as GitHub Secrets:

1. Go to **Settings** → **Secrets and variables** → **Actions**
2. Click **New repository secret** and add each of these:

   - **Name**: `VITE_GOOGLE_CLIENT_ID`
     **Value**: Your Google OAuth Client ID

   - **Name**: `VITE_GOOGLE_API_KEY`
     **Value**: Your Google API Key

   - **Name**: `VITE_SPREADSHEET_ID`
     **Value**: Your Google Spreadsheet ID

   - **Name**: `VITE_SHEET_NAME` (optional)
     **Value**: `Sheet1` (or your sheet name)

   - **Name**: `VITE_DATA_SHEET_NAME` (optional)
     **Value**: `Data` (or your data sheet name)

   - **Name**: `VITE_LOW_STOCK_THRESHOLD` (optional)
     **Value**: `10` (or your threshold)

### Step 3: Trigger Deployment

1. The workflow will automatically run when you push to the `main` branch
2. You can also manually trigger it:
   - Go to **Actions** tab
   - Select **Deploy to GitHub Pages** workflow
   - Click **Run workflow**

### Step 4: Access Your Deployed App

Once deployment completes:
- Your app will be available at: `https://noxbriones.github.io/gsheet_stockinventory/`
- Check the **Actions** tab to see deployment status
- The workflow will show the deployment URL when complete

## ⚠️ Important Notes

1. **Google Cloud Console Configuration**:
   - Add `https://noxbriones.github.io` to authorized JavaScript origins
   - Add `https://noxbriones.github.io` to authorized redirect URIs
   - Go to: https://console.cloud.google.com/apis/credentials

2. **First Deployment**:
   - The first deployment may take a few minutes
   - Subsequent deployments are faster

3. **Environment Variables**:
   - All environment variables must be set as GitHub Secrets
   - They are used during the build process
   - Changes to secrets require a new deployment

4. **Base Path**:
   - The app is configured for GitHub Pages subdirectory deployment
   - Base path is set to `/gsheet_stockinventory/`
   - If you change the repository name, update the workflow file

## 🔍 Troubleshooting

- **Build fails**: Check that all required secrets are set
- **App doesn't load**: Verify Google Cloud Console settings
- **404 errors**: Ensure GitHub Pages is enabled and using GitHub Actions
- **Sign-in doesn't work**: Check that your domain is in Google Cloud Console

## 📝 Workflow File

The deployment workflow is located at: `.github/workflows/deploy.yml`

This workflow:
- Builds the app with all environment variables
- Deploys to GitHub Pages automatically
- Runs on every push to `main` branch

