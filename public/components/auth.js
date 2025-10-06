// Authentication Modal Component
import { signUp, signIn, signOut, onAuthStateChange } from '../services/authService.js';

class AuthModal {
  constructor() {
    this.isSignUp = true;
    this.modal = null;
    this.currentUser = null;
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
      <div class="auth-overlay">
        <div class="auth-container">
          <div class="auth-header">
            <h2 id="auth-title">Sign Up for CardWise</h2>
            <button class="auth-close" id="auth-close">&times;</button>
          </div>
          
          <form id="auth-form" class="auth-form">
            <div id="signup-fields">
              <div class="auth-field">
                <label for="auth-name">Full Name</label>
                <input type="text" id="auth-name" placeholder="Enter your full name">
              </div>
            </div>
            
            <div class="auth-field">
              <label for="auth-email">Email</label>
              <input type="email" id="auth-email" placeholder="Enter your email">
            </div>
            
            <div class="auth-field">
              <label for="auth-password">Password</label>
              <input type="password" id="auth-password" placeholder="Enter your password">
            </div>
            
            <div id="signup-confirm" class="auth-field">
              <label for="auth-confirm-password">Confirm Password</label>
              <input type="password" id="auth-confirm-password" placeholder="Confirm your password">
            </div>
            
            <div id="auth-error" class="auth-error hidden"></div>
            <div id="auth-success" class="auth-success hidden"></div>
            
            <button type="submit" class="auth-submit" id="auth-submit">Sign Up</button>
          </form>
          
          <div class="auth-toggle">
            <span id="auth-toggle-text">Already have an account?</span>
            <button type="button" class="auth-toggle-btn" id="auth-toggle-btn">Login</button>
          </div>
        </div>
      </div>
    `;

    this.modal = modalContainer;
  }

  setupEventListeners() {
    const form = document.getElementById('auth-form');
    const toggleBtn = document.getElementById('auth-toggle-btn');
    const closeBtn = document.getElementById('auth-close');

    if (form) {
      form.addEventListener('submit', (e) => this.handleSubmit(e));
    }

    if (toggleBtn) {
      toggleBtn.addEventListener('click', () => this.toggleMode());
    }

    if (closeBtn) {
      closeBtn.addEventListener('click', () => this.hideModal());
    }

    // Close modal when clicking overlay
    if (this.modal) {
      this.modal.addEventListener('click', (e) => {
        if (e.target.classList.contains('auth-overlay')) {
          this.hideModal();
        }
      });
    }
  }

  setupAuthStateListener() {
    onAuthStateChange((user) => {
      this.currentUser = user;
      // Update global currentUser variable for app.js
      window.currentUser = user;
      if (user) {
        this.hideModal();
        this.showMainContent();
        this.updateUserDisplay(user);
      } else {
        this.showModal();
        this.hideMainContent();
      }
    });
  }

  showModal() {
    if (this.modal) {
      this.modal.classList.remove('hidden');
      document.body.style.overflow = 'hidden';
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
    const screens = document.querySelectorAll('.screen');
    screens.forEach(screen => screen.style.display = '');
    
    const header = document.querySelector('.app-header');
    if (header) header.style.display = 'flex';
  }

  hideMainContent() {
    const screens = document.querySelectorAll('.screen');
    screens.forEach(screen => screen.style.display = 'none');
  }

  updateUserDisplay(user) {
    // Add user info to header if it doesn't exist
    let userInfo = document.getElementById('user-info');
    if (!userInfo) {
      const header = document.querySelector('.app-header') || document.body;
      userInfo = document.createElement('div');
      userInfo.id = 'user-info';
      userInfo.className = 'user-info';
      header.appendChild(userInfo);
    }

    userInfo.innerHTML = `
      <span class="user-name">Welcome, ${user.displayName || user.email}</span>
      <button id="logout-btn" class="logout-btn">Logout</button>
    `;

    // Add logout event listener
    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
      logoutBtn.addEventListener('click', () => this.handleLogout());
    }
  }

  toggleMode() {
    this.isSignUp = !this.isSignUp;
    const title = document.getElementById('auth-title');
    const submitBtn = document.getElementById('auth-submit');
    const toggleText = document.getElementById('auth-toggle-text');
    const toggleBtn = document.getElementById('auth-toggle-btn');
    const signupFields = document.getElementById('signup-fields');
    const signupConfirm = document.getElementById('signup-confirm');

    if (this.isSignUp) {
      title.textContent = 'Sign Up for CardWise';
      submitBtn.textContent = 'Sign Up';
      toggleText.textContent = 'Already have an account?';
      toggleBtn.textContent = 'Login';
      signupFields.style.display = 'block';
      signupConfirm.style.display = 'block';
    } else {
      title.textContent = 'Login to CardWise';
      submitBtn.textContent = 'Login';
      toggleText.textContent = "Don't have an account?";
      toggleBtn.textContent = 'Sign Up';
      signupFields.style.display = 'none';
      signupConfirm.style.display = 'none';
      
      // Clear hidden field values to prevent validation issues
      document.getElementById('auth-name').value = '';
      document.getElementById('auth-confirm-password').value = '';
    }

    this.clearMessages();
    this.clearForm();
  }

  async handleSubmit(e) {
    e.preventDefault();
    
    const email = document.getElementById('auth-email').value.trim();
    const password = document.getElementById('auth-password').value;
    const name = document.getElementById('auth-name').value.trim();
    const confirmPassword = document.getElementById('auth-confirm-password').value;

    // Clear previous messages
    this.clearMessages();

    // Validation
    if (!this.validateForm(email, password, name, confirmPassword)) {
      return;
    }

    // Disable submit button during request
    const submitBtn = document.getElementById('auth-submit');
    const originalText = submitBtn.textContent;
    submitBtn.disabled = true;
    submitBtn.textContent = this.isSignUp ? 'Signing Up...' : 'Logging In...';

    try {
      if (this.isSignUp) {
        await signUp(email, password, name);
        this.showSuccess('Account created successfully! Welcome to CardWise.');
      } else {
        await signIn(email, password);
        this.showSuccess('Logged in successfully! Welcome back.');
      }
    } catch (error) {
      console.error('Auth error:', error);
      this.showError(this.getErrorMessage(error));
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = originalText;
    }
  }

  validateForm(email, password, name, confirmPassword) {
    // Check for empty email
    if (!email) {
      this.showError('Please enter your email address.');
      return false;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      this.showError('Please enter a valid email address.');
      return false;
    }

    // Check for empty password
    if (!password) {
      this.showError('Please enter your password.');
      return false;
    }

    // Password validation
    if (password.length < 6) {
      this.showError('Password must be at least 6 characters long.');
      return false;
    }

    // Sign up specific validation
    if (this.isSignUp) {
      if (!name || name.length < 2) {
        this.showError('Please enter your full name (at least 2 characters).');
        return false;
      }

      if (!confirmPassword) {
        this.showError('Please confirm your password.');
        return false;
      }

      if (password !== confirmPassword) {
        this.showError('Passwords do not match.');
        return false;
      }
    }

    return true;
  }

  async handleLogout() {
    try {
      await signOut();
      this.showSuccess('Logged out successfully.');
    } catch (error) {
      console.error('Logout error:', error);
      this.showError('Error logging out. Please try again.');
    }
  }

  showError(message) {
    const errorDiv = document.getElementById('auth-error');
    const successDiv = document.getElementById('auth-success');
    
    if (errorDiv) {
      errorDiv.textContent = message;
      errorDiv.classList.remove('hidden');
    }
    
    if (successDiv) {
      successDiv.classList.add('hidden');
    }
  }

  showSuccess(message) {
    const errorDiv = document.getElementById('auth-error');
    const successDiv = document.getElementById('auth-success');
    
    if (successDiv) {
      successDiv.textContent = message;
      successDiv.classList.remove('hidden');
    }
    
    if (errorDiv) {
      errorDiv.classList.add('hidden');
    }

    // Hide success message after 3 seconds
    setTimeout(() => {
      if (successDiv) {
        successDiv.classList.add('hidden');
      }
    }, 3000);
  }

  clearMessages() {
    const errorDiv = document.getElementById('auth-error');
    const successDiv = document.getElementById('auth-success');
    
    if (errorDiv) {
      errorDiv.classList.add('hidden');
      errorDiv.textContent = '';
    }
    
    if (successDiv) {
      successDiv.classList.add('hidden');
      successDiv.textContent = '';
    }
  }

  clearForm() {
    const form = document.getElementById('auth-form');
    if (form) {
      form.reset();
    }
    this.clearMessages();
  }

  getErrorMessage(error) {
    switch (error.code) {
      case 'auth/email-already-in-use':
        return 'An account with this email already exists.';
      case 'auth/weak-password':
        return 'Password is too weak. Please choose a stronger password.';
      case 'auth/user-not-found':
        return 'No account found with this email address.';
      case 'auth/wrong-password':
        return 'Incorrect password. Please try again.';
      case 'auth/invalid-email':
        return 'Invalid email address format.';
      case 'auth/user-disabled':
        return 'This account has been disabled.';
      case 'auth/too-many-requests':
        return 'Too many failed attempts. Please try again later.';
      default:
        return 'An error occurred. Please try again.';
    }
  }
}

// Export for use in app.js
window.AuthModal = AuthModal;