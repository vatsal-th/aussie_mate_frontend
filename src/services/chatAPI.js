// services/chatAPI.js
import { API_CONFIG } from '../config/api';

const API_BASE = API_CONFIG.BASE_URL;

const getAuthHeaders = () => ({
  'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
  'Content-Type': 'application/json'
});

export const chatAPI = {
  // Get all chat rooms
  async getChatRooms() {
    const response = await fetch(`${API_BASE}/chat/rooms`, {
      headers: getAuthHeaders()
    });
    return response.json();
  },

  // Create or get chat room
  async createChatRoom(jobId, cleanerId) {
    const response = await fetch(`${API_BASE}/chat/rooms`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ jobId, cleanerId })
    });
    return response.json();
  },

  // Get chat messages
  async getChatMessages(chatRoomId, page = 1, limit = 50) {
    const response = await fetch(
      `${API_BASE}/chat/rooms/${chatRoomId}/messages?page=${page}&limit=${limit}`,
      { headers: getAuthHeaders() }
    );
    return response.json();
  },

  // Mark chat as read
  async markChatAsRead(chatRoomId) {
    const response = await fetch(`${API_BASE}/chat/rooms/${chatRoomId}/read`, {
      method: 'PUT',
      headers: getAuthHeaders()
    });
    return response.json();
  },

  // Get unread count
  async getUnreadCount() {
    const response = await fetch(`${API_BASE}/chat/unread-count`, {
      headers: getAuthHeaders()
    });
    return response.json();
  }
};
