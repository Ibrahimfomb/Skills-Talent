import axiosInstance from '../api/AxiosInstance';

export const messageService = {
  sendMessage: (messageData) => axiosInstance.post('/messages', messageData),
  getConversation: (userId1, userId2) => 
    axiosInstance.get('/messages/conversation', { params: { userId1, userId2 } }),
  getUnreadMessages: (userId) => 
    axiosInstance.get(`/messages/unread/${userId}`),
  markAsRead: (messageId) => 
    axiosInstance.put(`/messages/${messageId}/read`),
};

export default messageService;
