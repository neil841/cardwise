// Authentication Modal Component - Modern 3D Design with Multi-Step Flow
import { signUp, signIn, signOut, onAuthStateChange } from '../services/authService.js';

class AuthModal {
  constructor() {
    this.modal = null;
    this.currentUser = null;
    this.currentStep = 'welcome'; // 'welcome', 'signin', 'login'
    this.init();
  }

  init() {
    this.createModal();
    this.setupEventListeners();
    this.setupAuthStateListener();
  }

  createModal() {
    const modalContainer = document.getElementById('auth-modal');
    if (!modalContainer) {
      console.error('Auth modal container not found');
      return;
    }

    modalContainer.innerHTML = `
      <div class="auth-overlay-modern">
        <div class="auth-container-modern">
          <!-- 3D Background Shapes -->
          <div class="auth-bg-shapes">
            <div class="shape shape-1"></div>
            <div class="shape shape-2"></div>
            <div class="shape shape-3"></div>
          </div>

          <!-- Close Button -->
          <button class="auth-close-modern" id="auth-close-modern">&times;</button>

          <!-- Dynamic Content Container -->
          <div class="auth-content-modern" id="auth-content-container">
            <!-- Content will be injected here -->
          </div>
        </div>
      </div>
    `;

    this.modal = modalContainer;
    this.renderStep('welcome');
  }

  renderStep(step) {
    this.currentStep = step;
    const container = document.getElementById('auth-content-container');
    if (!container) return;

    if (step === 'welcome') {
      container.innerHTML = `
        <div class="welcome-screen">
          <h1 class="welcome-title">Hi There!</h1>

          <button class="get-started-btn" id="get-started-btn">
            Get started
          </button>

          <button class="login-text-btn" id="login-text-btn">
            Login
          </button>

          <div class="new-user-text">
            <span>New around here?</span>
            <button class="signin-link-btn" id="signin-link-btn">Sign in</button>
          </div>
        </div>
      `;
    } else if (step === 'signin') {
      container.innerHTML = `
        <button class="back-btn" id="back-btn">← Back</button>
        <h1 class="auth-title-modern">Sign in</h1>

        <!-- Social Login Buttons -->
        <div class="social-buttons">
          <button class="social-btn apple-btn" id="apple-signin-btn">
            <svg class="social-icon" viewBox="0 0 24 24" fill="currentColor">
              <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/>
            </svg>
            Sign in with Apple
          </button>

          <button class="social-btn google-btn" id="google-signin-btn">
            <svg class="social-icon" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Sign in with Google
          </button>
        </div>

        <!-- Divider Text -->
        <div class="auth-divider">
          <span>or get a link emailed to you:</span>
        </div>

        <!-- Email Input -->
        <div class="email-signup-section">
          <input
            type="email"
            id="work-email-input"
            class="work-email-input"
            placeholder="Work email address"
          />
          <button class="email-signup-btn" id="email-signup-btn">
            Email me a signup link
          </button>
        </div>

        <!-- Terms -->
        <div class="auth-terms">
          <p class="terms-safe-text">You are completely safe.</p>
          <a href="#" class="terms-link" id="terms-link">Read our Terms & Conditions</a>
        </div>
      `;
    } else if (step === 'login') {
      container.innerHTML = `
        <button class="back-btn" id="back-btn">← Back</button>
        <h1 class="auth-title-modern">Login</h1>
        <p class="auth-subtitle">Welcome back! Please login to your account.</p>

        <!-- Login Form -->
        <div class="login-form">
          <div class="form-group">
            <label for="login-email">Email</label>
            <input
              type="email"
              id="login-email"
              class="form-input"
              placeholder="Enter your email"
            />
          </div>

          <div class="form-group">
            <label for="login-password">Password</label>
            <input
              type="password"
              id="login-password"
              class="form-input"
              placeholder="Enter your password"
            />
          </div>

          <button class="primary-btn" id="login-submit-btn">
            Login
          </button>

          <div class="forgot-password">
            <a href="#" id="forgot-password-link">Forgot password?</a>
          </div>
        </div>

        <!-- Divider -->
        <div class="auth-divider">
          <span>or continue with</span>
        </div>

        <!-- Social Login Buttons -->
        <div class="social-buttons-compact">
          <button class="social-btn-small apple-btn-small" id="apple-login-btn">
            <svg class="social-icon-small" viewBox="0 0 24 24" fill="currentColor">
              <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/>
            </svg>
          </button>

          <button class="social-btn-small google-btn-small" id="google-login-btn">
            <svg class="social-icon-small" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
          </button>
        </div>

        <!-- Terms -->
        <div class="auth-terms">
          <p class="terms-safe-text">You are completely safe.</p>
          <a href="#" class="terms-link">Read our Terms & Conditions</a>
        </div>
      `;
    }

    // Re-attach event listeners after rendering
    this.attachStepListeners();
  }

  attachStepListeners() {
    // Close button
    const closeBtn = document.getElementById('auth-close-modern');
    if (closeBtn) {
      closeBtn.onclick = () => this.hideModal();
    }

    // Welcome screen buttons
    const getStartedBtn = document.getElementById('get-started-btn');
    const loginTextBtn = document.getElementById('login-text-btn');
    const signinLinkBtn = document.getElementById('signin-link-btn');

    if (getStartedBtn) getStartedBtn.onclick = () => this.renderStep('signin');
    if (loginTextBtn) loginTextBtn.onclick = () => this.renderStep('login');
    if (signinLinkBtn) signinLinkBtn.onclick = () => this.renderStep('signin');

    // Back button
    const backBtn = document.getElementById('back-btn');
    if (backBtn) backBtn.onclick = () => this.renderStep('welcome');

    // Sign in screen
    const appleSigninBtn = document.getElementById('apple-signin-btn');
    const googleSigninBtn = document.getElementById('google-signin-btn');
    const emailSignupBtn = document.getElementById('email-signup-btn');

    if (appleSigninBtn) appleSigninBtn.onclick = () => this.handleAppleSignIn();
    if (googleSigninBtn) googleSigninBtn.onclick = () => this.handleGoogleSignIn();
    if (emailSignupBtn) emailSignupBtn.onclick = () => this.handleEmailSignup();

    // Email input enter key
    const emailInput = document.getElementById('work-email-input');
    if (emailInput) {
      emailInput.onkeypress = (e) => {
        if (e.key === 'Enter') this.handleEmailSignup();
      };
    }

    // Login screen
    const loginSubmitBtn = document.getElementById('login-submit-btn');
    const appleLoginBtn = document.getElementById('apple-login-btn');
    const googleLoginBtn = document.getElementById('google-login-btn');
    const loginPasswordInput = document.getElementById('login-password');

    if (loginSubmitBtn) loginSubmitBtn.onclick = () => this.handleLogin();
    if (appleLoginBtn) appleLoginBtn.onclick = () => this.handleAppleSignIn();
    if (googleLoginBtn) googleLoginBtn.onclick = () => this.handleGoogleSignIn();

    if (loginPasswordInput) {
      loginPasswordInput.onkeypress = (e) => {
        if (e.key === 'Enter') this.handleLogin();
      };
    }
  }

  setupEventListeners() {
    const headerSignInBtn = document.getElementById('header-signin-btn');
    if (headerSignInBtn) {
      console.log('Setting up click listener for header-signin-btn');
      headerSignInBtn.addEventListener('click', (e) => {
        e.preventDefault();
        console.log('Sign In button clicked');
        this.showModal();
      });
    } else {
      console.error('header-signin-btn not found - login button will not work');
    }

    // Close modal when clicking overlay
    if (this.modal) {
      this.modal.addEventListener('click', (e) => {
        if (e.target.classList.contains('auth-overlay-modern')) {
          this.hideModal();
        }
      });
    }
  }

  setupAuthStateListener() {
    let isInitialLoad = true;

    onAuthStateChange((user) => {
      this.currentUser = user;
      window.currentUser = user;

      if (user) {
        this.hideModal();
        if (isInitialLoad) {
          this.showMainContent();
        }
        this.updateUserDisplay(user);
      }

      isInitialLoad = false;
    });
  }

  showModal() {
    console.log('showModal() called, modal exists:', !!this.modal);
    if (this.modal) {
      this.renderStep('welcome'); // Always start at welcome
      this.modal.classList.remove('hidden');
      document.body.style.overflow = 'hidden';
      console.log('Modal shown successfully');
    } else {
      console.error('Modal element not found - cannot show auth modal');
    }
  }

  hideModal() {
    if (this.modal) {
      this.modal.classList.add('hidden');
      document.body.style.overflow = 'auto';
      this.clearForm();
    }
  }

  showMainContent() {
    const header = document.querySelector('.app-header');
    if (header) header.style.display = 'flex';
  }

  updateUserDisplay(user) {
    const headerBtn = document.getElementById('header-signin-btn');
    if (headerBtn) {
      headerBtn.textContent = user.displayName || user.email?.split('@')[0] || 'Account';
      headerBtn.onclick = () => this.showUserMenu();
    }
  }

  showUserMenu() {
    if (confirm('Sign out?')) {
      this.handleLogout();
    }
  }

  async handleAppleSignIn() {
    this.showMessage('Apple Sign-In coming soon! For now, use email signup or login.', 'info');
    // TODO: Implement Apple OAuth
  }

  async handleGoogleSignIn() {
    this.showMessage('Google Sign-In coming soon! For now, use email signup or login.', 'info');
    // TODO: Implement Google OAuth
  }

  async handleEmailSignup() {
    const emailInput = document.getElementById('work-email-input');
    const email = emailInput?.value.trim();

    if (!email) {
      this.showMessage('Please enter your email address', 'error');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      this.showMessage('Please enter a valid email address', 'error');
      return;
    }

    try {
      const tempPassword = Math.random().toString(36).slice(-8) + 'A1!';
      await signUp(email, tempPassword, email.split('@')[0]);
      this.showMessage('Account created! Welcome to CardWise.', 'success');
      setTimeout(() => this.hideModal(), 2000);
    } catch (error) {
      if (error.code === 'auth/email-already-in-use') {
        this.showMessage('Email already registered. Please use Login.', 'info');
        setTimeout(() => this.renderStep('login'), 2000);
      } else {
        this.showMessage('Error: ' + error.message, 'error');
      }
    }
  }

  async handleLogin() {
    const emailInput = document.getElementById('login-email');
    const passwordInput = document.getElementById('login-password');
    const email = emailInput?.value.trim();
    const password = passwordInput?.value;

    if (!email || !password) {
      this.showMessage('Please enter both email and password', 'error');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      this.showMessage('Please enter a valid email address', 'error');
      return;
    }

    try {
      await signIn(email, password);
      this.showMessage('Welcome back!', 'success');
      setTimeout(() => this.hideModal(), 1500);
    } catch (error) {
      if (error.code === 'auth/user-not-found') {
        this.showMessage('No account found. Please sign up first.', 'error');
      } else if (error.code === 'auth/wrong-password') {
        this.showMessage('Incorrect password. Please try again.', 'error');
      } else {
        this.showMessage('Error: ' + error.message, 'error');
      }
    }
  }

  async handleLogout() {
    try {
      await signOut();
      const headerBtn = document.getElementById('header-signin-btn');
      if (headerBtn) {
        headerBtn.textContent = 'Sign In';
        headerBtn.onclick = () => this.showModal();
      }
      this.showMessage('Signed out successfully', 'success');
    } catch (error) {
      console.error('Logout error:', error);
    }
  }

  showMessage(message, type = 'info') {
    const toast = document.createElement('div');
    toast.className = `auth-toast auth-toast-${type}`;
    toast.textContent = message;
    document.body.appendChild(toast);

    setTimeout(() => toast.classList.add('show'), 10);
    setTimeout(() => {
      toast.classList.remove('show');
      setTimeout(() => toast.remove(), 300);
    }, 3000);
  }

  clearForm() {
    const emailInput = document.getElementById('work-email-input');
    const loginEmail = document.getElementById('login-email');
    const loginPassword = document.getElementById('login-password');

    if (emailInput) emailInput.value = '';
    if (loginEmail) loginEmail.value = '';
    if (loginPassword) loginPassword.value = '';
  }
}

// Export for use in app.js
window.AuthModal = AuthModal;
