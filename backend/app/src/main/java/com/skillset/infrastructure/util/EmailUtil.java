package com.skillset.infrastructure.util;

import lombok.extern.slf4j.Slf4j;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Component;

import java.util.Optional;

@Slf4j
@Component
public class EmailUtil {

    private final JavaMailSender mailSender;

    public EmailUtil(Optional<JavaMailSender> mailSender) {
        this.mailSender = mailSender.orElse(null);
    }

    public void sendNotification(String to, String subject, String body) {
        if (mailSender == null) {
            log.warn("JavaMailSender not configured — skipping email to {}: {}", to, subject);
            return;
        }
        try {
            SimpleMailMessage msg = new SimpleMailMessage();
            msg.setTo(to);
            msg.setSubject(subject);
            msg.setText(body);
            mailSender.send(msg);
            log.info("Email sent to: {} — {}", to, subject);
        } catch (Exception e) {
            log.error("Failed to send email to {}: {}", to, e.getMessage());
        }
    }

    public void sendApplicationConfirmation(String candidateEmail, String jobTitle) {
        sendNotification(
            candidateEmail,
            "Candidature reçue — " + jobTitle,
            "Bonjour,\n\n" +
            "Votre candidature pour le poste de « " + jobTitle + " » a bien été reçue.\n" +
            "Nous vous recontacterons prochainement.\n\n" +
            "Cordialement,\nL'équipe SkillSet"
        );
    }

    public void sendInterviewInvitation(String candidateEmail, String companyName, String interviewDate) {
        sendNotification(
            candidateEmail,
            "Invitation à un entretien — " + companyName,
            "Bonjour,\n\n" +
            "Vous êtes invité(e) à un entretien avec " + companyName + " le " + interviewDate + ".\n" +
            "Veuillez vous connecter à votre espace SkillSet pour confirmer votre disponibilité.\n\n" +
            "Cordialement,\nL'équipe SkillSet"
        );
    }

    public void sendDataExportConfirmation(String to, String firstName) {
        try {
            if (mailSender == null) {
                log.warn("Email non configuré — sendDataExportConfirmation ignoré");
                return;
            }
            SimpleMailMessage message = new SimpleMailMessage();
            message.setTo(to);
            message.setSubject("SkillSet — Export de vos données personnelles");
            message.setText(
                "Bonjour " + firstName + ",\n\n" +
                "Votre demande d'export de données personnelles (Article 20 RGPD) a bien été reçue.\n\n" +
                "Vos données sont en cours de préparation. Vous recevrez un email de confirmation une fois l'export finalisé.\n\n" +
                "La génération peut prendre quelques minutes.\n\n" +
                "Cordialement,\n" +
                "L'équipe SkillSet"
            );
            mailSender.send(message);
            log.info("Email export données envoyé à {}", to);
        } catch (Exception e) {
            log.error("Erreur envoi email export données à {} : {}", to, e.getMessage());
        }
    }

    public void sendAccountDeletionConfirmation(String to, String firstName) {
        try {
            if (mailSender == null) {
                log.warn("Email non configuré — sendAccountDeletionConfirmation ignoré");
                return;
            }
            SimpleMailMessage message = new SimpleMailMessage();
            message.setTo(to);
            message.setSubject("SkillSet — Confirmation de suppression de compte");
            message.setText(
                "Bonjour " + firstName + ",\n\n" +
                "Nous confirmons que votre demande de suppression de compte a bien été prise en compte.\n\n" +
                "Toutes vos données personnelles seront définitivement supprimées conformément au RGPD (Article 17).\n\n" +
                "Nous sommes désolés de vous voir partir et espérons vous revoir à l'avenir.\n\n" +
                "Cordialement,\n" +
                "L'équipe SkillSet"
            );
            mailSender.send(message);
            log.info("Email suppression compte envoyé à {}", to);
        } catch (Exception e) {
            log.error("Erreur envoi email suppression compte à {} : {}", to, e.getMessage());
        }
    }

    public void sendStatusChangedEmail(String to, String firstName, String jobTitle, String newStatus) {
        if (mailSender == null) return;
        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(to);
        message.setSubject("Mise à jour de votre candidature — SkillSet");
        message.setText(
            "Bonjour " + firstName + ",\n\n" +
            "Votre candidature pour le poste de « " + jobTitle + " » a été mise à jour.\n" +
            "Nouveau statut : " + newStatus + "\n\n" +
            "Connectez-vous à votre espace SkillSet pour en savoir plus.\n\n" +
            "Cordialement,\n" +
            "L'équipe SkillSet"
        );
        mailSender.send(message);
    }

    public void sendBulkActionConfirmation(String to, String firstName, int count) {
        if (mailSender == null) return;
        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(to);
        message.setSubject("Mise à jour en masse effectuée — SkillSet");
        message.setText(
            "Bonjour " + firstName + ",\n\n" +
            "Vous venez de mettre à jour le statut de " + count + " candidature(s) depuis votre tableau de bord SkillSet.\n\n" +
            "Cordialement,\n" +
            "L'équipe SkillSet"
        );
        mailSender.send(message);
    }

    public void sendAutomationTriggeredEmail(String to, String firstName, String ruleName, String jobTitle) {
        if (mailSender == null) return;
        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(to);
        message.setSubject("Action automatique sur votre candidature — SkillSet");
        message.setText(
            "Bonjour " + firstName + ",\n\n" +
            "Une action automatique « " + ruleName + " » vient d'être appliquée à votre candidature pour le poste de « " + jobTitle + " ».\n\n" +
            "Connectez-vous à votre espace SkillSet pour consulter les détails.\n\n" +
            "Cordialement,\n" +
            "L'équipe SkillSet"
        );
        mailSender.send(message);
    }
}
