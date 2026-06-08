package com.skillset.infrastructure.util;

import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

@Slf4j
@Component
public class EmailUtil {
    
    public void sendNotification(String to, String subject, String body) {
        log.info("Sending email to: {} with subject: {}", to, subject);
        // TODO: Implement email sending logic using JavaMailSender
    }
    
    public void sendApplicationConfirmation(String candidateEmail, String jobTitle) {
        log.info("Sending application confirmation to: {}", candidateEmail);
        // TODO: Implement specific email template for application confirmation
    }
    
    public void sendInterviewInvitation(String candidateEmail, String companyName, String interviewDate) {
        log.info("Sending interview invitation to: {}", candidateEmail);
        // TODO: Implement specific email template for interview invitation
    }
}
