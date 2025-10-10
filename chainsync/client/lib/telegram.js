// Telegram Web App Integration
export class TelegramWebApp {
  constructor() {
    this.tg = null;
    this.isInitialized = false;
    
    if (typeof window !== 'undefined') {
      this.init();
    }
  }

  init() {
    // Load Telegram Web App script if not already loaded
    if (!window.Telegram?.WebApp) {
      const script = document.createElement('script');
      script.src = 'https://telegram.org/js/telegram-web-app.js';
      script.onload = () => {
        this.tg = window.Telegram.WebApp;
        this.setupWebApp();
      };
      document.head.appendChild(script);
    } else {
      this.tg = window.Telegram.WebApp;
      this.setupWebApp();
    }
  }

  setupWebApp() {
    if (!this.tg) return;

    // Initialize Telegram Web App
    this.tg.ready();
    this.tg.expand();
    
    // Set theme
    this.tg.setHeaderColor('#6366f1');
    this.tg.setBackgroundColor('#f8fafc');
    
    this.isInitialized = true;
  }

  // Get user data
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
      isPremium: user.is_premium,
      allowsWriteToPm: user.allows_write_to_pm
    };
  }

  // Show main button
  showMainButton(text, callback) {
    if (!this.tg) return;
    
    this.tg.MainButton.setText(text);
    this.tg.MainButton.show();
    this.tg.MainButton.onClick(callback);
  }

  // Hide main button
  hideMainButton() {
    if (!this.tg) return;
    this.tg.MainButton.hide();
  }

  // Show back button
  showBackButton(callback) {
    if (!this.tg) return;
    this.tg.BackButton.show();
    this.tg.BackButton.onClick(callback);
  }

  // Hide back button
  hideBackButton() {
    if (!this.tg) return;
    this.tg.BackButton.hide();
  }

  // Show popup
  showPopup(params) {
    if (!this.tg) return;
    this.tg.showPopup(params);
  }

  // Show alert
  showAlert(message) {
    if (!this.tg) return;
    this.tg.showAlert(message);
  }

  // Show confirm
  showConfirm(message, callback) {
    if (!this.tg) return;
    this.tg.showConfirm(message, callback);
  }

  // Haptic feedback
  hapticFeedback(type = 'impact', style = 'medium') {
    if (!this.tg?.HapticFeedback) return;
    
    if (type === 'impact') {
      this.tg.HapticFeedback.impactOccurred(style);
    } else if (type === 'notification') {
      this.tg.HapticFeedback.notificationOccurred(style);
    } else if (type === 'selection') {
      this.tg.HapticFeedback.selectionChanged();
    }
  }

  // Close web app
  close() {
    if (!this.tg) return;
    this.tg.close();
  }

  // Send data to bot
  sendData(data) {
    if (!this.tg) return;
    this.tg.sendData(JSON.stringify(data));
  }

  // Open link
  openLink(url, options = {}) {
    if (!this.tg) return;
    this.tg.openLink(url, options);
  }

  // Open telegram link
  openTelegramLink(url) {
    if (!this.tg) return;
    this.tg.openTelegramLink(url);
  }

  // Check if running in Telegram
  isRunningInTelegram() {
    return this.tg && this.tg.initData;
  }

  // Get theme params
  getThemeParams() {
    if (!this.tg) return null;
    return this.tg.themeParams;
  }

  // Set viewport height
  setViewportHeight() {
    if (!this.tg) return;
    
    const vh = this.tg.viewportHeight;
    document.documentElement.style.setProperty('--tg-viewport-height', `${vh}px`);
  }
}

// Telegram Bot API helpers
export class TelegramBotAPI {
  constructor(botToken) {
    this.botToken = botToken;
    this.baseURL = `https://api.telegram.org/bot${botToken}`;
  }

  // Send message
  async sendMessage(chatId, text, options = {}) {
    const response = await fetch(`${this.baseURL}/sendMessage`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        chat_id: chatId,
        text,
        ...options
      })
    });
    
    return response.json();
  }

  // Get user profile photos
  async getUserProfilePhotos(userId, options = {}) {
    const response = await fetch(`${this.baseURL}/getUserProfilePhotos`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        user_id: userId,
        ...options
      })
    });
    
    return response.json();
  }

  // Get chat member
  async getChatMember(chatId, userId) {
    const response = await fetch(`${this.baseURL}/getChatMember`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        chat_id: chatId,
        user_id: userId
      })
    });
    
    return response.json();
  }
}

// Utility functions
export const telegramUtils = {
  // Format username
  formatUsername(username) {
    return username?.startsWith('@') ? username : `@${username}`;
  },

  // Get user display name
  getUserDisplayName(user) {
    if (user.lastName) {
      return `${user.firstName} ${user.lastName}`;
    }
    return user.firstName || user.username || 'Unknown User';
  },

  // Generate user avatar URL
  getUserAvatarUrl(user, size = 100) {
    if (user.photoUrl) return user.photoUrl;
    
    // Generate a placeholder avatar based on user ID
    const colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD', '#98D8C8'];
    const color = colors[user.id % colors.length];
    const initials = this.getUserDisplayName(user).split(' ').map(n => n[0]).join('').toUpperCase();
    
    return `https://ui-avatars.com/api/?name=${initials}&background=${color.slice(1)}&color=fff&size=${size}`;
  },

  // Validate Telegram data
  validateTelegramData(initData, botToken) {
    // This would implement the actual validation logic
    // For now, we'll just return true for demo purposes
    return true;
  },

  // Parse Telegram init data
  parseTelegramInitData(initData) {
    const params = new URLSearchParams(initData);
    const data = {};
    
    for (const [key, value] of params) {
      if (key === 'user') {
        data.user = JSON.parse(value);
      } else {
        data[key] = value;
      }
    }
    
    return data;
  }
};

// Create singleton instance
export const telegramWebApp = new TelegramWebApp();

// Export default
export default {
  TelegramWebApp,
  TelegramBotAPI,
  telegramUtils,
  telegramWebApp
};