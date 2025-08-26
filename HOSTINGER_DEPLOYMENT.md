# Hostinger Deployment Guide

This guide will walk you through deploying your Smart Todo app on Hostinger step by step.

## 🚀 Quick Deployment Steps

### Step 1: Prepare Your Files
Ensure you have all the required files:
- `index.html`
- `styles.css`
- `script.js`
- `README.md` (optional)

### Step 2: Access Hostinger Control Panel
1. **Login** to your Hostinger account
2. **Navigate** to your hosting control panel
3. **Find** the "File Manager" or "FTP" option

### Step 3: Upload Files

#### Option A: Using File Manager (Recommended for beginners)
1. **Click** on "File Manager" in your control panel
2. **Navigate** to the `public_html` folder
3. **Click** "Upload" button
4. **Select** all your project files
5. **Wait** for upload to complete
6. **Verify** all files are in the correct location

#### Option B: Using FTP (For advanced users)
1. **Get FTP credentials** from your Hostinger control panel
2. **Use an FTP client** (FileZilla, WinSCP, etc.)
3. **Connect** to your hosting using the FTP credentials
4. **Navigate** to `public_html` folder
5. **Upload** all project files

### Step 4: Set File Permissions
1. **Select** all uploaded files
2. **Right-click** and choose "Change Permissions"
3. **Set** file permissions to `644`
4. **Set** folder permissions to `755`

### Step 5: Test Your App
1. **Open** your domain in a web browser
2. **Verify** the app loads correctly
3. **Test** all features (add tasks, learning items, etc.)
4. **Check** mobile responsiveness

## 🔧 Troubleshooting Common Issues

### Issue: App not loading
**Solution:**
- Check if all files are uploaded to `public_html`
- Verify file names are exactly: `index.html`, `styles.css`, `script.js`
- Clear browser cache and reload

### Issue: Styling not working
**Solution:**
- Ensure `styles.css` is in the same folder as `index.html`
- Check if Font Awesome CDN is accessible
- Verify Google Fonts are loading

### Issue: JavaScript not working
**Solution:**
- Check browser console for errors
- Ensure `script.js` is in the same folder as `index.html`
- Verify file permissions are set to `644`

### Issue: Data not saving
**Solution:**
- Check if localStorage is enabled in your browser
- Try accessing the app in incognito/private mode
- Verify no browser extensions are blocking localStorage

## 📱 Mobile Testing
After deployment, test your app on:
- **Mobile phones** (iOS and Android)
- **Tablets** (iPad, Android tablets)
- **Different browsers** (Chrome, Safari, Firefox)

## 🔒 Security Considerations
- **HTTPS**: Enable SSL certificate in Hostinger for secure access
- **File permissions**: Keep files at `644` and folders at `755`
- **Regular backups**: Export your data regularly using the app's export feature

## 📊 Performance Optimization
- **Enable Gzip compression** in Hostinger control panel
- **Use CDN** for Font Awesome and Google Fonts (already configured)
- **Minimize HTTP requests** (already optimized in the app)

## 🆘 Getting Help
If you encounter issues:
1. **Check** this deployment guide
2. **Review** the main README.md file
3. **Contact** Hostinger support for hosting-specific issues
4. **Check** browser console for JavaScript errors

## ✅ Deployment Checklist
- [ ] All files uploaded to `public_html`
- [ ] File permissions set correctly
- [ ] App loads without errors
- [ ] All features working (todos, learning, progress)
- [ ] Mobile responsiveness tested
- [ ] Data persistence working
- [ ] Export functionality working
- [ ] SSL certificate enabled (recommended)

## 🎉 Success!
Once all checklist items are complete, your Smart Todo app is successfully deployed and ready to use!

**Your app URL:** `https://yourdomain.com`

---

**Need more help?** Check the main README.md file for detailed documentation and troubleshooting tips.