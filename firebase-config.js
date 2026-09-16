// Firebase Configuration
var firebaseConfig = {
    apiKey: "AIzaSyCPB4r66w6FpO4BEaOA0Bjtw8nzm2Qz5u8",
    authDomain: "diamond-spa-92953.firebaseapp.com",
    projectId: "diamond-spa-92953",
    storageBucket: "diamond-spa-92953.firebasestorage.app",
    messagingSenderId: "5548432127",
    appId: "1:5548432127:web:24af0c2e44ef80c55f4aca"
};

var db = null;
var firebaseReady = false;

try {
    firebase.initializeApp(firebaseConfig);
    db = firebase.firestore();
    firebaseReady = true;
    console.log('[Firebase] Initialized OK');

    // Test Firestore connection
    db.collection('_test').doc('ping').set({ timestamp: Date.now() })
        .then(function() {
            console.log('[Firebase] Firestore connection OK - read/write working');
            return db.collection('_test').doc('ping').delete();
        })
        .catch(function(err) {
            console.error('[Firebase] Firestore ERROR:', err.message);
            console.warn('[Firebase] Rules may not be published yet. Falling back to localStorage.');
            firebaseReady = false;
        });
} catch (error) {
    console.error('[Firebase] Init FAILED:', error.message);
    firebaseReady = false;
}
