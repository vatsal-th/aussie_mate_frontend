// services/socketService.js
import io from 'socket.io-client';
import { API_CONFIG } from '../config/api';

class SocketService {
  constructor() {
    this.socket = null;
    this.isConnected = false;
    this.listeners = [];
  }

  connect(token) {
    if (this.socket) this.disconnect();

    // Get token from param or localStorage
    const authToken = token || localStorage.getItem("token");
    if (!authToken) {
      console.error('❌ No JWT token found. Cannot connect to Socket.IO server.');
      return;
    }

    // Prepare backend URL
    let backendURL = API_CONFIG.BASE_URL.replace('/api', '');

    // Ensure proper WebSocket protocol
    if (backendURL.startsWith('https://')) {
      backendURL = backendURL.replace('https://', 'wss://');
    } else if (backendURL.startsWith('http://')) {
      backendURL = backendURL.replace('http://', 'ws://');
    } else if (!backendURL.startsWith('ws://') && !backendURL.startsWith('wss://')) {
      // Fallback for local development
      console.warn('⚠️ Unexpected backend URL format. Using localhost fallback.');
      backendURL = 'ws://localhost:3000';
    }

    console.log('🔌 Connecting to WebSocket:', backendURL);

    // Connect to Socket.IO
    this.socket = io(backendURL, {
      auth: { token: authToken },
      transports: ["websocket"],
      timeout: 5000,
      forceNew: true
    });

    // Connection events
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

    this.socket.on('connect_error', (error) => {
      console.error('❌ Socket connection error:', error.message);
      this.notifyListeners('error', {
        message: 'Failed to connect to chat server. Check backend or network.'
      });
    });

    // Chat events
    this.socket.on('chat_joined', data => this.notifyListeners('chatJoined', data));
    this.socket.on('chat_history', messages => this.notifyListeners('chatHistory', messages));
    this.socket.on('new_message', message => this.notifyListeners('newMessage', message));
    this.socket.on('chat_notification', notification => this.notifyListeners('chatNotification', notification));
    this.socket.on('messages_marked_read', data => this.notifyListeners('messagesMarkedRead', data));

    this.socket.on('error', error => {
      if (error.message === 'Failed to join chat') return;
      if (error.message === 'Access denied') {
        this.notifyListeners('error', { message: 'Access denied. Check login or contact support.' });
      } else if (error.message === 'You must submit a quote before starting a chat') {
        this.notifyListeners('error', { message: 'Submit a quote first. Wait for acceptance before chatting.' });
      } else {
        this.notifyListeners('error', error);
      }
    });
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.isConnected = false;
    }
  }

  on(event, callback) { this.listeners.push({ event, callback }); }
  off(event, callback) { this.listeners = this.listeners.filter(l => !(l.event === event && l.callback === callback)); }
  notifyListeners(event, data) { this.listeners.filter(l => l.event === event).forEach(l => l.callback(data)); }

  // Socket actions
  joinChat(jobId, cleanerId) { if (this.socket && this.isConnected) this.socket.emit('join_chat', { jobId, cleanerId }); }
  sendMessage(chatRoomId, content, messageType = 'text') { if (this.socket && this.isConnected) this.socket.emit('send_message', { chatRoomId, content, messageType }); }
  sendQuote(chatRoomId, price, message) { if (this.socket && this.isConnected) this.socket.emit('send_quote', { chatRoomId, price, message }); }
  updateBudget(chatRoomId, amount, isNegotiable = true) { if (this.socket && this.isConnected) this.socket.emit('update_budget', { chatRoomId, amount, isNegotiable }); }
  markAsRead(chatRoomId) { if (this.socket && this.isConnected) this.socket.emit('mark_as_read', { chatRoomId }); }
  leaveChat() { if (this.socket && this.isConnected) this.socket.emit('leave_chat'); }
}

export const socketService = new SocketService();
