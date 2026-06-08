package com.skillset.infrastructure.persistence;

import com.skillset.domain.entity.Message;
import com.skillset.domain.port.MessageRepositoryPort;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MessageRepository extends JpaRepository<Message, String>, MessageRepositoryPort {
    List<Message> findBySenderIdAndRecipientId(String senderId, String recipientId);
    List<Message> findByRecipientIdAndIsReadFalse(String recipientId);
}
