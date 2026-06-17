package com.skillset.application.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.skillset.application.dto.ChatRequest;
import com.skillset.domain.entity.User;
import com.skillset.domain.entity.UserRole;
import com.skillset.infrastructure.persistence.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.*;

@Slf4j
@Service
@RequiredArgsConstructor
public class ChatbotService {

    @Value("${claude.api.key:}")
    private String apiKey;

    private final UserRepository userRepository;
    private final RestTemplate restTemplate = new RestTemplate();
    private final ObjectMapper objectMapper = new ObjectMapper();

    private static final String CLAUDE_API_URL = "https://api.anthropic.com/v1/messages";
    private static final String MODEL = "claude-haiku-4-5-20251001";

    public String chat(String userId, ChatRequest request) {
        User user = userRepository.findById(userId).orElse(null);
        if (user == null) {
            return "Désolé, impossible de vous identifier. Veuillez vous reconnecter.";
        }
        String systemPrompt = buildSystemPrompt(user, request.getProfile());
        return callClaude(systemPrompt, request.getHistory(), request.getMessage());
    }

    private String buildSystemPrompt(User user, Map<String, Object> profile) {
        String roleLabel = user.getRole() == UserRole.CANDIDATE ? "candidat(e)"
                         : user.getRole() == UserRole.EMPLOYER  ? "employeur"
                         : "administrateur";

        StringBuilder sb = new StringBuilder();
        sb.append("Tu es STELLA, l'assistante IA intelligente et bienveillante de la plateforme SkillSet.\n");
        sb.append("SkillSet est une plateforme de recrutement qui connecte talents et entreprises.\n\n");
        sb.append("Utilisateur : ").append(user.getFirstName()).append(" ").append(user.getLastName())
          .append(" (").append(roleLabel).append(")\n\n");

        if (user.getRole() == UserRole.CANDIDATE) {
            sb.append("En tant qu'assistante d'un candidat, tu peux :\n");
            sb.append("• Analyser son profil et suggérer des améliorations\n");
            sb.append("• Rechercher des offres d'emploi adaptées à son profil\n");
            sb.append("• Estimer son salaire selon son expérience et son domaine\n");
            sb.append("• Préparer des entretiens d'embauche (méthode STAR, questions fréquentes)\n");
            sb.append("• Aider à rédiger des lettres de motivation et optimiser son CV\n");
            sb.append("• Conseiller sur la recherche d'emploi et la négociation salariale\n");
        } else if (user.getRole() == UserRole.EMPLOYER) {
            sb.append("En tant qu'assistante d'un employeur, tu peux :\n");
            sb.append("• Aider à rédiger des offres d'emploi attractives et inclusives\n");
            sb.append("• Analyser les candidatures reçues et établir des critères de sélection\n");
            sb.append("• Préparer des questions d'entretien pertinentes\n");
            sb.append("• Donner des conseils sur le recrutement et la rétention des talents\n");
            sb.append("• Analyser le marché du travail et les tendances salariales\n");
            sb.append("• Aider à définir des fiches de poste et des grilles de rémunération\n");
        }

        if (profile != null && !profile.isEmpty()) {
            sb.append("\nContexte du profil :\n");
            profile.forEach((k, v) -> {
                if (v != null && !String.valueOf(v).isBlank()
                        && !k.equals("id") && !k.equals("password")
                        && !k.equals("onboardingCompleted")) {
                    sb.append("- ").append(k).append(" : ").append(v).append("\n");
                }
            });
        }

        sb.append("\nRègles de réponse :\n");
        sb.append("- Réponds TOUJOURS en français\n");
        sb.append("- Sois concis, professionnel et bienveillant\n");
        sb.append("- Utilise **gras** pour les points importants\n");
        sb.append("- Utilise • pour les listes\n");
        sb.append("- Limite tes réponses à 300 mots sauf si une explication détaillée est demandée\n");
        sb.append("- Si tu manques d'informations précises, pose une question de clarification courte\n");
        sb.append("- Ne réponds pas aux questions sans rapport avec l'emploi, le recrutement ou SkillSet\n");

        return sb.toString();
    }

    private String callClaude(String systemPrompt, List<Map<String, String>> history, String message) {
        if (apiKey == null || apiKey.isBlank()) {
            log.warn("Claude API key not configured — returning fallback reply for STELLA");
            return fallbackReply();
        }
        try {
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.set("x-api-key", apiKey);
            headers.set("anthropic-version", "2023-06-01");

            // Build messages: history (last 10) + current message
            List<Map<String, String>> messages = new ArrayList<>();
            if (history != null) {
                history.stream()
                    .filter(m -> "user".equals(m.get("role")) || "assistant".equals(m.get("role")))
                    .limit(10)
                    .forEach(messages::add);
            }
            messages.add(Map.of("role", "user", "content", message));

            Map<String, Object> body = new LinkedHashMap<>();
            body.put("model", MODEL);
            body.put("max_tokens", 800);
            body.put("system", systemPrompt);
            body.put("messages", messages);

            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(body, headers);
            ResponseEntity<String> response = restTemplate.postForEntity(CLAUDE_API_URL, entity, String.class);

            JsonNode root = objectMapper.readTree(response.getBody());
            return root.path("content").get(0).path("text").asText();
        } catch (Exception e) {
            log.error("Claude API call failed for STELLA chatbot: {}", e.getMessage());
            return fallbackReply();
        }
    }

    public Map<String, Object> search(String query) {
        try {
            String encoded = URLEncoder.encode(query, StandardCharsets.UTF_8);
            String url = "https://api.duckduckgo.com/?q=" + encoded + "&format=json&no_html=1&skip_disambig=1";
            ResponseEntity<String> response = restTemplate.getForEntity(url, String.class);
            JsonNode root = objectMapper.readTree(response.getBody());

            Map<String, Object> result = new LinkedHashMap<>();
            result.put("abstract",     root.path("Abstract").asText());
            result.put("abstractText", root.path("AbstractText").asText());
            result.put("abstractUrl",  root.path("AbstractURL").asText());
            result.put("answer",       root.path("Answer").asText());

            List<Map<String, String>> topics = new ArrayList<>();
            JsonNode relatedTopics = root.path("RelatedTopics");
            if (relatedTopics.isArray()) {
                for (int i = 0; i < Math.min(relatedTopics.size(), 5); i++) {
                    JsonNode t = relatedTopics.get(i);
                    if (t.has("Text") && t.has("FirstURL")) {
                        Map<String, String> topic = new LinkedHashMap<>();
                        topic.put("text", t.path("Text").asText());
                        topic.put("url",  t.path("FirstURL").asText());
                        topics.add(topic);
                    }
                }
            }
            result.put("relatedTopics", topics);
            return result;
        } catch (Exception e) {
            log.error("DuckDuckGo search failed for query '{}': {}", query, e.getMessage());
            return Map.of("abstract", "", "relatedTopics", List.of());
        }
    }

    private String fallbackReply() {
        return "Je suis **STELLA**, votre assistante IA SkillSet. Je rencontre une difficulté temporaire. "
             + "Veuillez réessayer dans quelques instants ou utiliser directement les fonctionnalités de la plateforme.";
    }
}
