import { auth, db } from '../firebase';
import { doc, updateDoc, onSnapshot, collection, query, where, orderBy } from 'firebase/firestore';

class OnlineStatusService {
  constructor() {
    this.statusUpdateInterval = null;
    this.heartbeatInterval = 30000; // 30 seconds
    this.awayTimeout = 300000; // 5 minutes
    this.awayTimer = null;
    this.isActive = true;
    this.currentStatus = 'offline';
    
    // Bind methods
    this.handleActivity = this.handleActivity.bind(this);
    this.handleVisibilityChange = this.handleVisibilityChange.bind(this);
    
    // Setup activity listeners
    this.setupActivityListeners();
  }

  // Initialize online status tracking
  async initialize(userId) {
    if (!userId) return;
    
    this.userId = userId;
    
    // Set user as online
    await this.updateStatus('online');
    
    // Start heartbeat
    this.startHeartbeat();
    
    // Setup beforeunload to set offline
    window.addEventListener('beforeunload', () => {
      this.updateStatus('offline');
    });
  }

  // Update user online status
  async updateStatus(status) {
    if (!this.userId) return;
    
    try {
      const userRef = doc(db, 'users', this.userId);
      const updateData = {
        onlineStatus: status,
        isOnline: status === 'online',
        lastActive: new Date()
      };
      
      await updateDoc(userRef, updateData);
      this.currentStatus = status;
      console.log(`Status updated to: ${status}`);
    } catch (error) {
      console.error('Error updating status:', error);
    }
  }

  // Start heartbeat to keep user online
  startHeartbeat() {
    if (this.statusUpdateInterval) {
      clearInterval(this.statusUpdateInterval);
    }
    
    this.statusUpdateInterval = setInterval(() => {
      if (this.isActive && this.currentStatus !== 'offline') {
        this.updateStatus('online');
      }
    }, this.heartbeatInterval);
  }

  // Stop heartbeat
  stopHeartbeat() {
    if (this.statusUpdateInterval) {
      clearInterval(this.statusUpdateInterval);
      this.statusUpdateInterval = null;
    }
  }

  // Setup activity listeners
  setupActivityListeners() {
    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'];
    
    events.forEach(event => {
      document.addEventListener(event, this.handleActivity, true);
    });
    
    // Handle page visibility changes
    document.addEventListener('visibilitychange', this.handleVisibilityChange);
  }

  // Handle user activity
  handleActivity() {
    this.isActive = true;
    
    // Clear away timer
    if (this.awayTimer) {
      clearTimeout(this.awayTimer);
    }
    
    // Set user as online if not already
    if (this.currentStatus !== 'online') {
      this.updateStatus('online');
    }
    
    // Set away timer
    this.awayTimer = setTimeout(() => {
      this.isActive = false;
      this.updateStatus('away');
    }, this.awayTimeout);
  }

  // Handle page visibility changes
  handleVisibilityChange() {
    if (document.hidden) {
      this.updateStatus('away');
      this.stopHeartbeat();
    } else {
      this.updateStatus('online');
      this.startHeartbeat();
      this.handleActivity();
    }
  }

  // Get online users
  async getOnlineUsers() {
    try {
      const response = await fetch('/api/users/online', {
        headers: {
          'Authorization': `Bearer ${await auth.currentUser?.getIdToken()}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        return {
          success: true,
          users: data.data
        };
      }
      
      return {
        success: false,
        error: 'Failed to fetch online users'
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Calculate time since last active
  getTimeSinceActive(lastActive) {
    if (!lastActive) return 'Nunca activo';
    
    const now = new Date();
    const lastActiveDate = new Date(lastActive);
    const diffMs = now - lastActiveDate;
    
    const minutes = Math.floor(diffMs / 60000);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    
    if (minutes < 1) return 'Activo ahora';
    if (minutes < 60) return `Activo hace ${minutes} min`;
    if (hours < 24) return `Activo hace ${hours}h`;
    if (days < 7) return `Activo hace ${days}d`;
    return 'Inactivo por más de una semana';
  }

  // Check if user is considered online (active within last 5 minutes)
  isUserOnline(lastActive, isOnline, onlineStatus) {
    if (!isOnline || onlineStatus === 'offline') return false;
    
    if (onlineStatus === 'online') return true;
    
    // For 'away' status, check if last active was within 15 minutes
    if (onlineStatus === 'away') {
      const now = new Date();
      const lastActiveDate = new Date(lastActive);
      const diffMs = now - lastActiveDate;
      return diffMs < 900000; // 15 minutes
    }
    
    return false;
  }

  // Cleanup
  cleanup() {
    this.stopHeartbeat();
    
    if (this.awayTimer) {
      clearTimeout(this.awayTimer);
    }
    
    // Remove event listeners
    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'];
    events.forEach(event => {
      document.removeEventListener(event, this.handleActivity, true);
    });
    
    document.removeEventListener('visibilitychange', this.handleVisibilityChange);
    
    // Set user as offline
    if (this.userId) {
      this.updateStatus('offline');
    }
  }
}

export default new OnlineStatusService();