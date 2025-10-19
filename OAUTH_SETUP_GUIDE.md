# 🔐 OAuth Setup Guide - Apple & Google Sign-In

Complete step-by-step guide to enable Apple and Google authentication in your CardWise app.

---

## 📋 Prerequisites

- Firebase project already set up
- Firebase CLI installed
- Access to Apple Developer Account (for Apple Sign-In)
- Access to Google Cloud Console (for Google Sign-In)

---

## 🍎 Part 1: Enable Apple Sign-In

### Step 1: Firebase Console Setup

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your CardWise project (`cardwise-80156`)
3. Click **Authentication** in the left sidebar
4. Click the **Sign-in method** tab
5. Scroll to **Sign-in providers**
6. Click on **Apple**
7. Toggle the **Enable** switch to ON

### Step 2: Apple Developer Account Setup

1. Go to [Apple Developer Portal](https://developer.apple.com/account/)
2. Sign in with your Apple ID
3. Navigate to **Certificates, Identifiers & Profiles**
4. Click **Identifiers** in the sidebar
5. Click the **+** button to create a new identifier

### Step 3: Create App ID

1. Select **App IDs** and click **Continue**
2. Select **App** and click **Continue**
3. Fill in:
   - **Description**: CardWise Web App
   - **Bundle ID**: Choose **Explicit** and enter: `com.cardwise.webapp`
4. Scroll down to **Capabilities**
5. Check **Sign In with Apple**
6. Click **Continue**, then **Register**

### Step 4: Create Service ID

1. Go back to **Identifiers**
2. Click **+** button
3. Select **Services IDs** and click **Continue**
4. Fill in:
   - **Description**: CardWise Web Service
   - **Identifier**: `com.cardwise.webapp.service` (must be unique)
5. Check **Sign In with Apple**
6. Click **Continue**, then **Register**

### Step 5: Configure Service ID

1. Find your newly created Service ID and click on it
2. Check **Sign In with Apple** (if not already)
3. Click **Configure** next to "Sign In with Apple"
4. Configure domains and redirect URLs:
   - **Primary App ID**: Select your App ID (`com.cardwise.webapp`)
   - **Domains and Subdomains**: Add:
     - `cardwise-80156.web.app`
     - `cardwise-80156.firebaseapp.com`
   - **Return URLs**: Add:
     - `https://cardwise-80156.firebaseapp.com/__/auth/handler`
5. Click **Next**, then **Done**
6. Click **Continue**, then **Save**

### Step 6: Create Private Key

1. Go to **Keys** in the sidebar
2. Click **+** button
3. Fill in:
   - **Key Name**: CardWise Sign In Key
4. Check **Sign In with Apple**
5. Click **Configure** next to it
6. Select your **Primary App ID**
7. Click **Save**, then **Continue**
8. Click **Register**
9. **Download the key file** (.p8 file) - you can only download it once!
10. Note your **Key ID** (shown on the page)

### Step 7: Complete Firebase Configuration

1. Go back to Firebase Console → Authentication → Sign-in method → Apple
2. Scroll down to **Apple Developer Information**
3. Fill in:
   - **Services ID**: `com.cardwise.webapp.service` (from Step 4)
   - **Apple Team ID**: Find this in Apple Developer Account → Membership
   - **Key ID**: From Step 6
   - **Private Key**: Open the .p8 file and copy the entire contents (including BEGIN/END lines)
4. Click **Save**

---

## 🔵 Part 2: Enable Google Sign-In

### Step 1: Firebase Console Setup

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your CardWise project
3. Click **Authentication** → **Sign-in method**
4. Click on **Google**
5. Toggle the **Enable** switch to ON
6. **Project support email**: Enter your email
7. Click **Save**

### Step 2: Configure OAuth Consent Screen (Optional)

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Select your Firebase project
3. Go to **APIs & Services** → **OAuth consent screen**
4. Choose **External** (for public users)
5. Fill in:
   - **App name**: CardWise
   - **User support email**: Your email
   - **App logo**: (Optional) Upload CardWise logo
   - **Application home page**: `https://cardwise-80156.web.app`
   - **Authorized domains**: Add `cardwise-80156.web.app`
   - **Developer contact**: Your email
6. Click **Save and Continue**
7. Skip **Scopes** (click Save and Continue)
8. Skip **Test users** (click Save and Continue)
9. Click **Back to Dashboard**

### Step 3: Add Authorized Domains

1. Still in Firebase Console → Authentication → Sign-in method → Google
2. Scroll to **Authorized domains**
3. Your domain should already be there: `cardwise-80156.web.app`
4. If not, click **Add domain** and add it

---

## 💻 Part 3: Update Your Code

### Step 1: Update `auth.js`

Replace the placeholder OAuth functions with real implementations:

```javascript
// At the top of auth.js, add imports
import {
  signInWithPopup,
  GoogleAuthProvider,
  OAuthProvider
} from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js';

import { auth } from '../firebase/config.js';

// Replace handleAppleSignIn function
async handleAppleSignIn() {
  try {
    const provider = new OAuthProvider('apple.com');

    // Optional: Request additional scopes
    provider.addScope('email');
    provider.addScope('name');

    const result = await signInWithPopup(auth, provider);
    const user = result.user;

    this.showMessage(`Welcome ${user.displayName || user.email}!`, 'success');
    setTimeout(() => this.hideModal(), 1500);

    // Optional: Get Apple credential
    const credential = OAuthProvider.credentialFromResult(result);
    const accessToken = credential?.accessToken;
    const idToken = credential?.idToken;

  } catch (error) {
    console.error('Apple sign-in error:', error);
    if (error.code === 'auth/popup-closed-by-user') {
      this.showMessage('Sign-in cancelled', 'info');
    } else if (error.code === 'auth/account-exists-with-different-credential') {
      this.showMessage('Account already exists with different sign-in method', 'error');
    } else {
      this.showMessage('Sign-in failed: ' + error.message, 'error');
    }
  }
}

// Replace handleGoogleSignIn function
async handleGoogleSignIn() {
  try {
    const provider = new GoogleAuthProvider();

    // Optional: Request additional scopes
    provider.addScope('profile');
    provider.addScope('email');

    const result = await signInWithPopup(auth, provider);
    const user = result.user;

    this.showMessage(`Welcome ${user.displayName || user.email}!`, 'success');
    setTimeout(() => this.hideModal(), 1500);

    // Optional: Get Google credential
    const credential = GoogleAuthProvider.credentialFromResult(result);
    const accessToken = credential?.accessToken;

  } catch (error) {
    console.error('Google sign-in error:', error);
    if (error.code === 'auth/popup-closed-by-user') {
      this.showMessage('Sign-in cancelled', 'info');
    } else if (error.code === 'auth/account-exists-with-different-credential') {
      this.showMessage('Account already exists with different sign-in method', 'error');
    } else {
      this.showMessage('Sign-in failed: ' + error.message, 'error');
    }
  }
}
```

### Step 2: Create User Profile on First Sign-In

Add this function to handle new OAuth users:

```javascript
async handleOAuthUser(user) {
  // Check if user document exists in Firestore
  const { doc, getDoc, setDoc, serverTimestamp } = await import(
    'https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js'
  );
  const { db } = await import('../firebase/config.js');

  const userRef = doc(db, 'users', user.uid);
  const userSnap = await getDoc(userRef);

  if (!userSnap.exists()) {
    // Create new user document
    await setDoc(userRef, {
      uid: user.uid,
      email: user.email,
      displayName: user.displayName,
      photoURL: user.photoURL,
      createdAt: serverTimestamp(),
      lastLoginAt: serverTimestamp(),
      quizAttempts: 0,
      totalScore: 0,
      provider: user.providerData[0]?.providerId || 'unknown'
    });
  } else {
    // Update last login
    await setDoc(userRef, {
      lastLoginAt: serverTimestamp()
    }, { merge: true });
  }
}
```

Then call this in both OAuth handlers after successful sign-in:

```javascript
const user = result.user;
await this.handleOAuthUser(user); // Add this line
this.showMessage(`Welcome ${user.displayName || user.email}!`, 'success');
```

---

## 🧪 Part 4: Test Your Implementation

### Test Apple Sign-In

1. Start your local server: `firebase serve`
2. Open `http://localhost:5003`
3. Click **Sign In** button
4. Click **Get started** or **Sign in**
5. Click **Sign in with Apple**
6. You should see Apple's sign-in popup
7. Sign in with your Apple ID
8. Authorize the app
9. You should be signed in!

### Test Google Sign-In

1. Same as above, but click **Sign in with Google**
2. You should see Google's sign-in popup
3. Choose your Google account
4. You should be signed in!

### Verify Firestore

1. Go to Firebase Console → Firestore Database
2. Check the `users` collection
3. You should see new user documents for OAuth sign-ins

---

## 🐛 Troubleshooting

### Apple Sign-In Issues

**Error: "Invalid client"**
- Double-check your Service ID in Firebase matches Apple Developer
- Verify the Service ID is enabled and configured

**Error: "Invalid redirect URI"**
- Check that redirect URLs in Apple Developer match exactly:
  - `https://cardwise-80156.firebaseapp.com/__/auth/handler`

**Popup blocked**
- Ensure popup blockers are disabled
- User must initiate the sign-in (not automatic)

### Google Sign-In Issues

**Error: "Popup closed by user"**
- User closed the popup before completing sign-in
- This is normal - just show a friendly message

**Error: "This app isn't verified"**
- Normal for development
- Users can click "Advanced" → "Go to CardWise (unsafe)" to continue
- To remove warning, verify your app in Google Cloud Console

**Error: "Access blocked: Authorization Error"**
- Check OAuth consent screen is configured
- Ensure authorized domains are set correctly

### General OAuth Issues

**Account exists with different provider**
- User already signed up with email but trying to use Google/Apple
- Solution: Implement account linking or ask user to use original method

**Popup blocked in browser**
- Some browsers block popups by default
- Solution: Add popup detection and show instructions

---

## 🚀 Part 5: Deploy to Production

### Step 1: Test Locally First

```bash
firebase serve
```

### Step 2: Deploy When Ready

```bash
firebase deploy
```

### Step 3: Test on Production

1. Visit `https://cardwise-80156.web.app`
2. Test both Apple and Google sign-in
3. Verify users are created in Firestore
4. Check browser console for any errors

---

## 📚 Additional Resources

- [Firebase Auth Documentation](https://firebase.google.com/docs/auth)
- [Sign in with Apple - Firebase](https://firebase.google.com/docs/auth/web/apple)
- [Sign in with Google - Firebase](https://firebase.google.com/docs/auth/web/google-signin)
- [Apple Developer Documentation](https://developer.apple.com/sign-in-with-apple/)
- [Google OAuth Documentation](https://developers.google.com/identity/protocols/oauth2)

---

## ✅ Success Checklist

- [ ] Firebase Authentication enabled
- [ ] Apple Sign-In provider configured in Firebase
- [ ] Apple Developer App ID created
- [ ] Apple Developer Service ID created and configured
- [ ] Apple Private Key generated and added to Firebase
- [ ] Google Sign-In provider enabled in Firebase
- [ ] OAuth consent screen configured (optional)
- [ ] Code updated with OAuth implementations
- [ ] Tested Apple Sign-In locally
- [ ] Tested Google Sign-In locally
- [ ] Firestore users collection verified
- [ ] Deployed to production
- [ ] Tested on production

---

**Questions?** Check the Firebase and Apple/Google documentation or create an issue in the repository.

Happy coding! 🎉
