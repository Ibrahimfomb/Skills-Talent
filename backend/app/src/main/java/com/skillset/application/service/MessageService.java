package com.skillset.application.service;

import com.skillset.application.dto.MessageDTO;
import com.skillset.domain.entity.Message;
import com.skillset.domain.port.MessageRepositoryPort;
import com.skillset.infrastructure.security.AuthorizationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class MessageService {

    private final MessageRepositoryPort    messageRepositoryPort;
    private final AuthorizationService     authorizationService;
    private final SimpMessagingTemplate    messagingTemplate;

    public Message sendMessage(String currentUserId, Message message) {
        if (message.getSender() == null || !currentUserId.equals(message.getSender().getId())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN,
                    "Vous ne pouvez envoyer des messages qu'en votre nom.");
        }
        Message saved = messageRepositoryPort.save(message);
        // Push real-time notification to recipient
        if (saved.getRecipient() != null) {
            messagingTemplate.convertAndSend(
                "/topic/user/" + saved.getRecipient().getId(),
                convertToDTO(saved)
            );
        }
        return saved;
    }

    public List<MessageDTO> getConversation(String currentUserId, String userId1, String userId2) {
        authorizationService.requireConversationParticipant(currentUserId, userId1, userId2);
        return messageRepositoryPort.findBySenderIdAndRecipientId(userId1, userId2)
            .stream().map(this::convertToDTO).collect(Collectors.toList());
    }

    public List<MessageDTO> getUnreadMessages(String currentUserId, String userId) {
        authorizationService.requireSelfOrAdmin(currentUserId, userId);
        return messageRepositoryPort.findByRecipientIdAndIsReadFalse(userId)
            .stream().map(this::convertToDTO).collect(Collectors.toList());
    }

    public MessageDTO markAsRead(String messageId, String currentUserId) {
        Message message = messageRepositoryPort.findById(messageId)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Message introuvable"));
        if (!currentUserId.equals(message.getRecipient().getId())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Accès non autorisé");
        }
        message.setIsRead(true);
        message.setReadAt(LocalDateTime.now());
        return convertToDTO(messageRepositoryPort.save(message));
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
