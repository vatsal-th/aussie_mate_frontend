import io from 'socket.io-client';
import { API_CONFIG } from '../config/api';
import { validateMessageForPhoneNumbers } from '../utils/phoneValidator';

class SocketService {
  constructor() {
    this.socket = null;
    this.isConnected = false;
    this.listeners = [];
  }

  connect(token) {
    if (this.socket) this.disconnect();

    let backendURL = API_CONFIG.BASE_URL;
    
    if (backendURL && backendURL.endsWith('/api')) {
      backendURL = backendURL.slice(0, -4);
    }

    if (!backendURL || backendURL.includes('undefined')) {
      console.error('❌ VITE_BACKEND_URL environment variable is not set');
      return;
    }

    if (backendURL.startsWith('https://')) {
      backendURL = backendURL.replace('https://', 'wss://');
    } else if (backendURL.startsWith('http://')) {
      backendURL = backendURL.replace('http://', 'ws://');
    }

    console.log('🔌 Connecting to WebSocket:', backendURL);

    this.socket = io(backendURL, {
      auth: { token },
      transports: ["websocket"],
      timeout: 5000,
      forceNew: true
    });

    this.socket.on('connect', () => {
      this.isConnected = true;
      console.log('✅ Socket connected successfully');
      this.notifyListeners('connectionStatus', true);
    });

    this.socket.on('disconnect', () => {
      this.isConnected = false;
      console.log('❌ Socket disconnected');
      this.notifyListeners('connectionStatus', false);
    });

    // Chat events
    this.socket.on('chat_joined', (data) => {
      this.notifyListeners('chatJoined', data);
    });
    
    this.socket.on('chat_history', (messages) => {
      this.notifyListeners('chatHistory', messages);
    });
    
    this.socket.on('new_message', (message) => {
      this.notifyListeners('newMessage', message);
    });
    
    this.socket.on('chat_notification', (notification) => {
      this.notifyListeners('chatNotification', notification);
    });

    this.socket.on('messages_marked_read', (data) => 
      this.notifyListeners('messagesMarkedRead', data)
    );

    this.socket.on('error', (error) => {
      if (error.message === 'Failed to join chat') {
        return;
      } else if (error.message === 'Access denied') {
        this.notifyListeners('error', { 
          message: 'Access denied. Please check your login status or contact support.' 
        });
      } else if (error.message === 'You must submit a quote before starting a chat') {
        this.notifyListeners('error', { 
          message: 'You must submit a quote for this job first. Once the customer accepts your quote, you can start chatting.' 
        });
      } else {
        this.notifyListeners('error', error);
      }
    });

    this.socket.on('connect_error', (error) => {
      console.error('❌ Socket connection error:', error.message);
      this.notifyListeners('error', { 
        message: 'Failed to connect to chat server. Please check if the backend is running.' 
      });
    });
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.isConnected = false;
    }
  }

  // Event listeners
  on(event, callback) {
    this.listeners.push({ event, callback });
  }

  off(event, callback) {
    this.listeners = this.listeners.filter(
      listener => !(listener.event === event && listener.callback === callback)
    );
  }

  notifyListeners(event, data) {
    this.listeners
      .filter(listener => listener.event === event)
      .forEach(listener => listener.callback(data));
  }

  // Socket actions
  joinChat(jobId, cleanerId) {
    if (this.socket && this.isConnected) {
      this.socket.emit('join_chat', { jobId, cleanerId });
    }
  }

  sendMessage(chatRoomId, content, messageType = 'text') {
    // Check for phone numbers in message content
    const validation = validateMessageForPhoneNumbers(content);
    if (!validation.isValid) {
      // Emit error to show alert in frontend
      this.notifyListeners('error', { 
        message: validation.message 
      });
      return;
    }

    if (this.socket && this.isConnected) {
      this.socket.emit('send_message', {
        chatRoomId,
        content,
        messageType
      });
    }
  }

  sendQuote(chatRoomId, price, message) {
    // Check for phone numbers in quote message
    const validation = validateMessageForPhoneNumbers(message);
    if (!validation.isValid) {
      // Emit error to show alert in frontend
      this.notifyListeners('error', { 
        message: 'Phone numbers are not allowed in quote messages. Please contact through the platform.' 
      });
      return;
    }

    if (this.socket && this.isConnected) {
      this.socket.emit('send_quote', {
        chatRoomId,
        price,
        message
      });
    }
  }

  updateBudget(chatRoomId, amount, isNegotiable = true) {
    if (this.socket && this.isConnected) {
      this.socket.emit('update_budget', {
        chatRoomId,
        amount,
        isNegotiable
      });
    }
  }

  markAsRead(chatRoomId) {
    if (this.socket && this.isConnected) {
      this.socket.emit('mark_as_read', { chatRoomId });
    }
  }

  leaveChat() {
    if (this.socket && this.isConnected) {
      this.socket.emit('leave_chat');
    }
  }
}

export const socketService = new SocketService();
