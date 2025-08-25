// Firebase Configuration
// Your actual Firebase project configuration

const firebaseConfig = {
    apiKey: "AIzaSyBjs7MeQuK-BlQT5cgtBRD7iqSd3sByrtk",
    authDomain: "smart-todo-b419c.firebaseapp.com",
    projectId: "smart-todo-b419c",
    storageBucket: "smart-todo-b419c.firebasestorage.app",
    messagingSenderId: "671151709526",
    appId: "1:671151709526:web:51e7e1a5ed0856816e4af7",
    measurementId: "G-9G2SLWPFC6"
};

// Initialize Firebase
const app = firebase.initializeApp(firebaseConfig);

// Initialize Firebase services
const auth = firebase.auth(app);
const db = firebase.firestore(app);
const analytics = firebase.analytics(app);

// Enable offline persistence
db.enablePersistence()
    .catch((err) => {
        if (err.code == 'failed-precondition') {
            // Multiple tabs open, persistence can only be enabled in one tab at a time
            console.log('Persistence failed - multiple tabs open');
        } else if (err.code == 'unimplemented') {
            // The current browser doesn't support persistence
            console.log('Persistence not supported');
        }
    });

console.log('Firebase initialized successfully');