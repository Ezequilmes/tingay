# Firebase App Check Setup Instructions

## Current Issue
The application is experiencing reCAPTCHA `ERR_ABORTED` and Firebase `Missing or insufficient permissions` errors in production. This is because App Check is not properly configured in the Firebase console.

## Required Configuration Steps

### 1. Firebase Console App Check Configuration

1. **Go to Firebase Console**: https://console.firebase.google.com/
2. **Select your project**: `soygay-b9bc5`
3. **Navigate to App Check**: In the left sidebar, find "App Check" under "Build"

### 2. Register Your Web App

1. **Click "Add app"** or find your existing web app
2. **Select "Web"** as the platform
3. **Choose "reCAPTCHA Enterprise"** as the provider
4. **Enter the site key**: `6LeS06ErAAAAAFWtzMkvNhqGt0Q14S7B8kdzm0gI`
   - This is the PUBLIC site key (not the secret key)
   - The secret key is used server-side and is already configured in `.env`

### 3. Configure App Registration Settings

1. **Set custom TTL** (optional): Default 1 hour is recommended
2. **Add authorized domains**:
   - `soygay-b9bc5.firebaseapp.com` (Firebase Auth domain)
   - `soygay-b9bc5.web.app` (Firebase Hosting domain)
   - `localhost:5173` (for development - only if needed for testing)

### 4. Enable App Check for Firebase Services

In the App Check section, enable enforcement for:
- **Cloud Firestore**: Enable enforcement
- **Firebase Authentication**: Enable enforcement (if using)
- **Cloud Storage**: Enable enforcement (if using)

**Important**: Start with "Monitor" mode first, then switch to "Enforce" mode after verifying everything works.

### 5. Debug Token Setup (for Development)

1. **Generate debug token**: In App Check settings, go to "Manage debug tokens"
2. **Add debug token**: The app will generate one automatically when running in development
3. **Check browser console**: Look for a message like:
   ```
   App Check debug token: [TOKEN]. You will need to add it to your app's App Check settings.
   ```
4. **Add the token** to the Firebase console under "Manage debug tokens"

## Current Configuration Status

✅ **Frontend**: reCAPTCHA Enterprise provider configured in `firebase.js`
✅ **Backend**: Secret key configured in `.env`
✅ **Firestore Rules**: Updated to require App Check tokens
❌ **Firebase Console**: App Check registration needed
❌ **Enforcement**: Not enabled in Firebase console

## Verification Steps

After completing the console configuration:

1. **Check App Check metrics** in Firebase console
2. **Monitor browser console** for App Check errors
3. **Test Firestore operations** to ensure they work
4. **Verify token generation** in Network tab

## Troubleshooting

- **403 errors**: Usually means app is not registered in App Check console
- **Token refresh issues**: Check if enforcement is enabled too early
- **Debug token not working**: Ensure it's properly added to Firebase console
- **Domain errors**: Verify all domains are authorized in reCAPTCHA console

## Next Steps

1. Complete the Firebase console configuration above
2. Test the application in development mode
3. Gradually enable enforcement for production
4. Monitor metrics and adjust as needed