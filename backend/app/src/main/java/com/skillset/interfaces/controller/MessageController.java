package com.skillset.interfaces.controller;

import com.skillset.application.dto.MessageDTO;
import com.skillset.application.service.MessageService;
import com.skillset.domain.entity.Message;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/messages")
@RequiredArgsConstructor
public class MessageController {
    private final MessageService messageService;
    
    @PostMapping
    public ResponseEntity<Message> sendMessage(@RequestBody Message message) {
        Message sentMessage = messageService.sendMessage(message);
        return new ResponseEntity<>(sentMessage, HttpStatus.CREATED);
    }
    
    @GetMapping("/conversation")
    public ResponseEntity<List<MessageDTO>> getConversation(@RequestParam String userId1, @RequestParam String userId2) {
        List<MessageDTO> messages = messageService.getConversation(userId1, userId2);
        return ResponseEntity.ok(messages);
    }
    
    @GetMapping("/unread/{userId}")
    public ResponseEntity<List<MessageDTO>> getUnreadMessages(@PathVariable String userId) {
        List<MessageDTO> unreadMessages = messageService.getUnreadMessages(userId);
        return ResponseEntity.ok(unreadMessages);
    }
}
