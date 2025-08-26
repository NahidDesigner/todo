# Firebase Setup Guide for Smart Todo App

This guide will walk you through setting up Firebase for your Smart Todo app to enable real-time sync across all devices.

## 🔥 Step 1: Create Firebase Project

### 1.1 Go to Firebase Console
1. **Visit** [Firebase Console](https://console.firebase.google.com/)
2. **Click** "Create a project" or "Add project"
3. **Enter** project name: `smart-todo-app` (or your preferred name)
4. **Enable** Google Analytics (optional but recommended)
5. **Click** "Create project"

### 1.2 Project Setup
1. **Wait** for project creation to complete
2. **Click** "Continue" when prompted
3. **Choose** analytics account (or create new one)
4. **Click** "Create project"

## 🔥 Step 2: Enable Firestore Database

### 2.1 Create Database
1. **In Firebase Console**, click "Firestore Database" in the left sidebar
2. **Click** "Create database"
3. **Choose** "Start in test mode" (we'll secure it later)
4. **Select** a location close to your users (e.g., `us-central1` for US)
5. **Click** "Done"

### 2.2 Database Rules (Optional)
Later, you can secure your database by updating the rules in the "Rules" tab:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId}/{document=**} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

## 🔥 Step 3: Enable Authentication

### 3.1 Setup Authentication
1. **In Firebase Console**, click "Authentication" in the left sidebar
2. **Click** "Get started"
3. **Click** "Email/Password" provider
4. **Enable** "Email/Password" sign-in method
5. **Click** "Save"

### 3.2 Additional Providers (Optional)
You can also enable:
- **Google** sign-in
- **Facebook** sign-in
- **GitHub** sign-in
- **Phone** authentication

## 🔥 Step 4: Get Firebase Configuration

### 4.1 Register Web App
1. **In Firebase Console**, click the gear icon ⚙️ (Project settings)
2. **Scroll down** to "Your apps" section
3. **Click** "Add app" and choose the web icon (</>)
4. **Register app** with name: `Smart Todo Web App`
5. **Click** "Register app"

### 4.2 Copy Configuration
You'll see a configuration object like this:

```javascript
const firebaseConfig = {
  apiKey: "AIzaSyC...",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abc123def456"
};
```

## 🔥 Step 5: Update Your App

### 5.1 Update firebase-config.js
Replace the placeholder values in `firebase-config.js` with your actual Firebase configuration:

```javascript
const firebaseConfig = {
    apiKey: "YOUR_ACTUAL_API_KEY",
    authDomain: "YOUR_ACTUAL_PROJECT_ID.firebaseapp.com",
    projectId: "YOUR_ACTUAL_PROJECT_ID",
    storageBucket: "YOUR_ACTUAL_PROJECT_ID.appspot.com",
    messagingSenderId: "YOUR_ACTUAL_SENDER_ID",
    appId: "YOUR_ACTUAL_APP_ID"
};
```

### 5.2 File Structure
Ensure your files are organized like this:
```
your-project/
├── index.html
├── styles.css
├── script.js
├── firebase-config.js  ← Updated with your config
└── README.md
```

## 🔥 Step 6: Test Your Setup

### 6.1 Local Testing
1. **Open** `index.html` in your browser
2. **Check** browser console for "Firebase initialized successfully"
3. **Click** "Sign In" button
4. **Create** a new account
5. **Test** adding todos and learning items

### 6.2 Verify Data Sync
1. **Add** some todos and learning items
2. **Check** Firebase Console → Firestore Database
3. **Verify** data appears in the database
4. **Test** on different devices/browsers

## 🔥 Step 7: Deploy to Hostinger

### 7.1 Upload Files
1. **Upload** all files to your Hostinger hosting
2. **Ensure** `firebase-config.js` is uploaded with your config
3. **Test** the live version

### 7.2 SSL Certificate
1. **Enable** SSL certificate in Hostinger
2. **Use** HTTPS for secure authentication
3. **Test** sign-in functionality

## 🔥 Step 8: Security Rules (Recommended)

### 8.1 Update Firestore Rules
In Firebase Console → Firestore Database → Rules:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can only access their own data
    match /users/{userId}/{document=**} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

### 8.2 Authentication Settings
1. **Go to** Authentication → Settings
2. **Add** your domain to "Authorized domains"
3. **Configure** password reset emails if needed

## 🔥 Step 9: Monitor Usage

### 9.1 Firebase Console Monitoring
- **Usage**: Monitor database reads/writes
- **Authentication**: Track user sign-ups
- **Performance**: Check app performance
- **Analytics**: View user behavior (if enabled)

### 9.2 Free Tier Limits
Firebase free tier includes:
- **1GB** Firestore storage
- **50K** Firestore reads/day
- **20K** Firestore writes/day
- **10K** Firestore deletes/day
- **10K** authentication calls/day

## 🔥 Troubleshooting

### Common Issues

**"Firebase not initialized"**
- Check if `firebase-config.js` is loaded before `script.js`
- Verify Firebase SDK scripts are loaded
- Check browser console for errors

**"Permission denied"**
- Ensure Firestore rules allow authenticated users
- Check if user is properly signed in
- Verify user ID matches document path

**"Network error"**
- Check internet connection
- Verify Firebase project is active
- Check if domain is authorized

**"Authentication failed"**
- Verify email/password are correct
- Check if email is verified (if required)
- Ensure authentication is enabled in Firebase

### Debug Steps
1. **Open** browser developer tools (F12)
2. **Check** Console tab for errors
3. **Check** Network tab for failed requests
4. **Verify** Firebase configuration values
5. **Test** with different browsers

## 🔥 Advanced Configuration

### Custom Authentication
You can add more authentication providers:

```javascript
// Google Sign-in
const provider = new firebase.auth.GoogleAuthProvider();
auth.signInWithPopup(provider);

// Facebook Sign-in
const fbProvider = new firebase.auth.FacebookAuthProvider();
auth.signInWithPopup(fbProvider);
```

### Data Migration
To migrate existing local data to Firebase:

```javascript
// Export local data
const localData = {
    todos: JSON.parse(localStorage.getItem('smartTodo_todos')) || [],
    learning: JSON.parse(localStorage.getItem('smartTodo_learning')) || []
};

// Import to Firebase (run this once)
localData.todos.forEach(todo => {
    db.collection('users').doc(userId).collection('todos').add(todo);
});
```

## 🔥 Performance Optimization

### 1. Enable Offline Persistence
Already configured in the app:
```javascript
db.enablePersistence()
    .catch((err) => {
        console.log('Persistence error:', err);
    });
```

### 2. Optimize Queries
- Use specific queries instead of getting all documents
- Implement pagination for large datasets
- Use indexes for complex queries

### 3. Monitor Usage
- Check Firebase Console regularly
- Set up usage alerts
- Monitor performance metrics

## 🔥 Backup and Recovery

### Export Data
The app includes export functionality:
1. **Click** "Export" button
2. **Download** JSON file
3. **Store** backup safely

### Import Data
You can restore from backup:
1. **Parse** JSON file
2. **Upload** to Firebase
3. **Verify** data integrity

## 🎉 Success!

Once you've completed all steps:
- ✅ Firebase project created
- ✅ Firestore database enabled
- ✅ Authentication configured
- ✅ App updated with config
- ✅ Data syncing across devices
- ✅ Security rules implemented

Your Smart Todo app now has:
- **Real-time sync** across all devices
- **User authentication** and security
- **Offline capability** with local backup
- **Cloud storage** with automatic backup
- **Cross-device access** to your data

## 📞 Support

If you encounter issues:
1. **Check** this guide for solutions
2. **Review** Firebase documentation
3. **Check** browser console for errors
4. **Verify** configuration values
5. **Test** with different browsers/devices

---

**Need help?** Check the main README.md for additional troubleshooting tips.