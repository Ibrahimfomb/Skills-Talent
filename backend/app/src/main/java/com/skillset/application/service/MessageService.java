package com.skillset.application.service;

import com.skillset.application.dto.MessageDTO;
import com.skillset.domain.entity.Message;
import com.skillset.domain.port.MessageRepositoryPort;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class MessageService {
    private final MessageRepositoryPort messageRepositoryPort;
    
    public Message sendMessage(Message message) {
        return messageRepositoryPort.save(message);
    }
    
    public List<MessageDTO> getConversation(String userId1, String userId2) {
        return messageRepositoryPort.findBySenderIdAndRecipientId(userId1, userId2)
            .stream()
            .map(this::convertToDTO)
            .collect(Collectors.toList());
    }
    
    public List<MessageDTO> getUnreadMessages(String userId) {
        return messageRepositoryPort.findByRecipientIdAndIsReadFalse(userId)
            .stream()
            .map(this::convertToDTO)
            .collect(Collectors.toList());
    }
    
    public Message markAsRead(String messageId) {
        // À implémenter selon le pattern port
        return null;
    }
    
    private MessageDTO convertToDTO(Message message) {
        return new MessageDTO(
            message.getId(),
            message.getSender().getId(),
            message.getRecipient().getId(),
            message.getContent(),
            message.getIsRead()
        );
    }
}
