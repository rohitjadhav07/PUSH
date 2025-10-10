// Real Telegram Web App Integration
class TelegramWebAppAuth {
  constructor() {
    this.tg = null;
    this.user = null;
    this.isReady = false;
    this.callbacks = {
      onReady: [],
      onUserChange: [],
      onThemeChange: []
    };
    
    if (typeof window !== 'undefined') {
      this.init();
    }
  }

  // Initialize Telegram Web App
  async init() {
    return new Promise((resolve) => {
      if (window.Telegram?.WebApp) {
        this.setupTelegram();
        resolve(true);
      } else {
        // Load Telegram Web App script
        const script = document.createElement('script');
        script.src = 'https://telegram.org/js/telegram-web-app.js';
        script.onload = () => {
          this.setupTelegram();
          resolve(true);
        };
        script.onerror = () => {
          console.error('Failed to load Telegram Web App script');
          resolve(false);
        };
        document.head.appendChild(script);
      }
    });
  }

  // Setup Telegram Web App
  setupTelegram() {
    this.tg = window.Telegram.WebApp;
    
    if (!this.tg) {
      console.error('Telegram Web App not available');
      return;
    }

    // Initialize the app
    this.tg.ready();
    this.tg.expand();
    
    // Set theme
    this.tg.setHeaderColor('#6366f1');
    this.tg.setBackgroundColor('#ffffff');
    
    // Get user data
    if (this.tg.initDataUnsafe?.user) {
      this.user = this.tg.initDataUnsafe.user;
    }
    
    // Set up event listeners
    this.tg.onEvent('themeChanged', () => {
      this.callbacks.onThemeChange.forEach(cb => cb(this.tg.themeParams));
    });
    
    this.isReady = true;
    this.callbacks.onReady.forEach(cb => cb(this));
  }

  // Get current user
  getUser() {
    if (!this.tg?.initDataUnsafe?.user) return null;
    
    const user = this.tg.initDataUnsafe.user;
    return {
      id: user.id,
      firstName: user.first_name,
      lastName: user.last_name,
      username: user.username,
      photoUrl: user.photo_url,
      languageCode: user.language_code,
      isPremium: user.is_premium || false,
      allowsWriteToPm: user.allows_write_to_pm || false
    };
  }

  // Get init data for validation
  getInitData() {
    return this.tg?.initData || '';
  }

  // Check if running in Telegram
  isInTelegram() {
    return !!(this.tg && this.tg.initData);
  }

  // Validate user authentication
  async validateAuth() {
    if (!this.isInTelegram()) {
      throw new Error('Not running in Telegram Web App');
    }

    const initData = this.getInitData();
    if (!initData) {
      throw new Error('No Telegram init data available');
    }

    try {
      const response = await fetch('/api/telegram/validate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ initData })
      });

      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.error || 'Validation failed');
      }

      return result.user;
    } catch (error) {
      console.error('Auth validation error:', error);
      throw error;
    }
  }

  // Login with Telegram
  async login() {
    try {
      // First validate the authentication
      const user = await this.validateAuth();
      
      // Store user data
      this.user = user;
      
      // Notify callbacks
      this.callbacks.onUserChange.forEach(cb => cb(user));
      
      return user;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  }

  // Logout
  logout() {
    this.user = null;
    this.callbacks.onUserChange.forEach(cb => cb(null));
  }

  // Event listeners
  onReady(callback) {
    if (this.isReady) {
      callback(this);
    } else {
      this.callbacks.onReady.push(callback);
    }
  }

  onUserChange(callback) {
    this.callbacks.onUserChange.push(callback);
  }

  onThemeChange(callback) {
    this.callbacks.onThemeChange.push(callback);
  }

  // UI Methods
  showMainButton(text, callback) {
    if (!this.tg) return;
    
    this.tg.MainButton.setText(text);
    this.tg.MainButton.show();
    this.tg.MainButton.onClick(callback);
  }

  hideMainButton() {
    if (!this.tg) return;
    this.tg.MainButton.hide();
  }

  showBackButton(callback) {
    if (!this.tg) return;
    this.tg.BackButton.show();
    this.tg.BackButton.onClick(callback);
  }

  hideBackButton() {
    if (!this.tg) return;
    this.tg.BackButton.hide();
  }

  showAlert(message) {
    if (!this.tg) return;
    this.tg.showAlert(message);
  }

  showConfirm(message, callback) {
    if (!this.tg) return;
    this.tg.showConfirm(message, callback);
  }

  // Haptic feedback
  hapticFeedback(type = 'impact', style = 'medium') {
    if (!this.tg?.HapticFeedback) return;
    
    switch (type) {
      case 'impact':
        this.tg.HapticFeedback.impactOccurred(style);
        break;
      case 'notification':
        this.tg.HapticFeedback.notificationOccurred(style);
        break;
      case 'selection':
        this.tg.HapticFeedback.selectionChanged();
        break;
    }
  }

  // Close the app
  close() {
    if (!this.tg) return;
    this.tg.close();
  }

  // Send data to bot
  sendData(data) {
    if (!this.tg) return;
    this.tg.sendData(JSON.stringify(data));
  }

  // Open links
  openLink(url, options = {}) {
    if (!this.tg) return;
    this.tg.openLink(url, options);
  }

  openTelegramLink(url) {
    if (!this.tg) return;
    this.tg.openTelegramLink(url);
  }

  // Get theme parameters
  getThemeParams() {
    return this.tg?.themeParams || {};
  }

  // Get viewport info
  getViewportInfo() {
    if (!this.tg) return null;
    
    return {
      height: this.tg.viewportHeight,
      stableHeight: this.tg.viewportStableHeight,
      isExpanded: this.tg.isExpanded
    };
  }
}

// Create singleton instance
export const telegramWebApp = new TelegramWebAppAuth();

// Export class for custom instances
export { TelegramWebAppAuth };

// Default export
export default telegramWebApp;