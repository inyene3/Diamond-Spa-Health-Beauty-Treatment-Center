# Firebase Setup Instructions for Diamond Spa

## Why Firebase?
- Bookings save to the cloud (not just one browser)
- Admin panel sees ALL bookings from any device
- Real-time updates
- Free for small businesses

## Setup Steps (5 minutes)

### Step 1: Create Firebase Project
1. Go to https://console.firebase.google.com/
2. Click "Create a project" or "Add project"
3. Enter project name: `diamond-spa`
4. Disable Google Analytics (optional) → Click "Create project"

### Step 2: Enable Firestore Database
1. In your project dashboard, click "Firestore Database" (left sidebar)
2. Click "Create database"
3. Select "Start in test mode" → Click "Next"
4. Choose a location close to you → Click "Enable"

### Step 3: Get Your Config
1. Click the gear icon (⚙️) → "Project settings"
2. Scroll down to "Your apps" section
3. Click the web icon (</>) to add a web app
4. Enter app nickname: `diamond-spa-web`
5. Click "Register app"
6. Copy the config object (looks like this):

```javascript
var firebaseConfig = {
    apiKey: "AIzaSyB...",
    authDomain: "diamond-spa.firebaseapp.com",
    projectId: "diamond-spa",
    storageBucket: "diamond-spa.appspot.com",
    messagingSenderId: "123456789",
    appId: "1:123456789:web:abc123"
};
```

### Step 4: Update firebase-config.js
1. Open `firebase-config.js` in your website folder
2. Replace the placeholder config with your actual config
3. Save the file

### Step 5: Set Firestore Rules (Important!)
1. In Firestore Database → Click "Rules" tab
2. Replace with these rules (allows read/write for testing):

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if true;
    }
  }
}
```

3. Click "Publish"

**Note:** For production, you should add proper security rules. But for testing, this works fine.

## Done!
- Open `index.html` → Book an appointment
- Open `admin.html` → See the booking appear instantly
- Add/edit services in admin → They appear on the website

## Troubleshooting
- **Bookings not showing?** Check browser console (F12) for errors
- **Config error?** Make sure you copied the entire firebaseConfig object
- **Still not working?** Make sure Firestore rules allow read/write
