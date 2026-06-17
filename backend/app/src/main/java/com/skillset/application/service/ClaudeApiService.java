package com.skillset.application.service;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.skillset.application.dto.onboarding.QuestionDto;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.List;
import java.util.Map;

@Slf4j
@Service
public class ClaudeApiService {

    @Value("${claude.api.key:}")
    private String apiKey;

    private final RestTemplate restTemplate = new RestTemplate();
    private final ObjectMapper objectMapper = new ObjectMapper();

    private static final String CLAUDE_API_URL = "https://api.anthropic.com/v1/messages";
    private static final String MODEL = "claude-haiku-4-5-20251001";
    private static final String NON_PRECISE = "Non précisé";

    public List<QuestionDto> generateCandidateQuestions(Map<String, String> initialAnswers) {
        String prompt = buildCandidatePrompt(initialAnswers);
        return callClaudeAndParse(prompt);
    }

    public List<QuestionDto> generateEmployerQuestions(Map<String, String> initialAnswers) {
        String prompt = buildEmployerPrompt(initialAnswers);
        return callClaudeAndParse(prompt);
    }

    private List<QuestionDto> callClaudeAndParse(String prompt) {
        if (apiKey == null || apiKey.isBlank()) {
            log.warn("Claude API key not configured — returning fallback questions");
            return fallbackQuestions();
        }
        try {
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.set("x-api-key", apiKey);
            headers.set("anthropic-version", "2023-06-01");

            Map<String, Object> body = Map.of(
                "model", MODEL,
                "max_tokens", 2500,
                "messages", List.of(Map.of("role", "user", "content", prompt))
            );

            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(body, headers);
            ResponseEntity<String> response = restTemplate.postForEntity(CLAUDE_API_URL, entity, String.class);

            JsonNode root = objectMapper.readTree(response.getBody());
            String text = root.path("content").get(0).path("text").asText();

            // strip optional markdown code block
            text = text.replace("```json", "").replace("```", "").trim();

            return objectMapper.readValue(text, new TypeReference<List<QuestionDto>>() {});
        } catch (Exception e) {
            log.error("Claude API call failed: {}", e.getMessage());
            return fallbackQuestions();
        }
    }

    private String buildCandidatePrompt(Map<String, String> answers) {
        String domain   = answers.getOrDefault("domain", NON_PRECISE);
        String role     = answers.getOrDefault("desiredRole", NON_PRECISE);
        String level    = answers.getOrDefault("experienceLevel", NON_PRECISE);
        String contract = answers.getOrDefault("contractType", NON_PRECISE);
        String country  = answers.getOrDefault("candidateCountry", NON_PRECISE);
        String city     = answers.getOrDefault("candidateCity", NON_PRECISE);

        boolean isRemote = contract.toLowerCase().contains("remote")
            || contract.toLowerCase().contains("freelance")
            || answers.values().stream().anyMatch(v ->
                v.toLowerCase().contains("remote") || v.toLowerCase().contains("full remote"));

        String alreadyKnown = answers.entrySet().stream()
            .map(e -> "- " + e.getKey() + " : " + e.getValue())
            .collect(java.util.stream.Collectors.joining("\n"));

        String geoNote = isRemote
            ? "Ce candidat travaille en REMOTE/FREELANCE — ne pose aucune question sur la localisation "
              + "physique. Pose des questions sur l'organisation async, les outils distants, le fuseau horaire."
            : "Ce candidat est en présentiel/hybride dans " + country + " (" + city + "). "
              + "Adapte la monnaie (" + localCurrency(country) + "), les villes et les références locales.";

        return "Tu es un expert en matching emploi pour la plateforme SkillSet.\n"
            + "Objectif : construire le profil le plus PRÉCIS possible du candidat pour optimiser "
            + "son matching avec les offres dans le domaine \"" + domain + "\".\n\n"
            + "=== CONTEXTE DU CANDIDAT (DÉJÀ COLLECTÉ — NE PAS REDEMANDER) ===\n"
            + "Les informations suivantes ont déjà été obtenues. Analyse-les attentivement :\n"
            + alreadyKnown + "\n\n"
            + "ANTI-REDONDANCE ABSOLUE : Avant de générer chaque question, vérifie qu'elle ne porte pas "
            + "sur une information déjà présente dans le contexte ci-dessus, même formulée différemment. "
            + "Domaine, poste, niveau, contrat, pays, ville, LinkedIn, autorisation de travail, "
            + "et références sont DÉJÀ CONNUS — ne les redemande pas.\n\n"
            + "=== CONTEXTE GÉOGRAPHIQUE ===\n"
            + geoNote + "\n\n"
            + "=== INSTRUCTIONS DE GÉNÉRATION ===\n"
            + "Génère entre 8 et 14 questions selon la complexité du métier \"" + domain + "\".\n"
            + "Chaque question doit apporter une information UNIQUE et NON REDONDANTE pour affiner le matching.\n"
            + "Toutes les options doivent correspondre à la réalité de \"" + country + "\" et du domaine \"" + domain + "\".\n\n"
            + "TYPES DE QUESTIONS (adapte selon le domaine \"" + domain + "\") :\n"
            + "- Compétences techniques réelles (multi_choice) : 8-12 options propres au domaine et niveau\n"
            + "- Types d'employeurs cibles (multi_choice) : adaptés au domaine et au pays\n"
            + "- Réalisation professionnelle marquante (text) : question comportementale ouverte\n"
            + "- Disponibilité et mobilité selon contexte remote/présentiel\n"
            + "- Prétentions salariales en " + localCurrency(country) + " (text avec placeholder réaliste)\n"
            + "- Formations et certifications reconnues dans \"" + country + "\" (multi_choice)\n"
            + "- Environnement de travail préféré (single_choice)\n"
            + "- Langues professionnelles (multi_choice)\n"
            + "- Questions spécifiques au métier \"" + domain + "\" (1-4 questions propres à ce secteur)\n"
            + "- Questions de traçabilité/sécurité (inclure 1-2 parmi les suivantes SI non déjà renseigné) :\n"
            + "    • Numéro/type de pièce d'identité disponible pour vérification (single_choice)\n"
            + "    • Références professionnelles joignables : nombre et qualité (single_choice)\n"
            + "    • Autorisation légale de travailler dans \"" + country + "\" : statut précis (single_choice)\n\n"
            + "RÈGLES ABSOLUES :\n"
            + "- JAMAIS de numéro dans le texte d'une question (pas de \"1.\", \"Q1\", \"Question 1\", etc.)\n"
            + "- JAMAIS de question générique applicable à tout le monde\n"
            + "- JAMAIS de question déjà couverte par le contexte DÉJÀ COLLECTÉ ci-dessus\n"
            + "- Les options sont TOUJOURS spécifiques au pays \"" + country + "\"\n\n"
            + "FORMAT JSON STRICT (sans markdown, sans texte avant/après) :\n"
            + "[{\"id\":\"q1\",\"text\":\"...\",\"type\":\"text|single_choice|multi_choice\","
            + "\"options\":null,\"placeholder\":null}]";
    }

    private String buildEmployerPrompt(Map<String, String> answers) {
        String company      = answers.getOrDefault("companyName", NON_PRECISE);
        String industry     = answers.getOrDefault("industry", NON_PRECISE);
        String size         = answers.getOrDefault("companySize", NON_PRECISE);
        String hiringRole   = answers.getOrDefault("hiringRole", NON_PRECISE);
        String country      = answers.getOrDefault("companyCountry", NON_PRECISE);
        String city         = answers.getOrDefault("companyCity", NON_PRECISE);
        String location     = city.equals(NON_PRECISE) ? country : (country.equals(NON_PRECISE) ? city : city + ", " + country);
        String contractType = answers.getOrDefault("contractType", NON_PRECISE);

        boolean isRemote = contractType.toLowerCase().contains("remote")
            || answers.values().stream().anyMatch(v ->
                v.toLowerCase().contains("remote") || v.toLowerCase().contains("full remote"));

        String alreadyKnown = answers.entrySet().stream()
            .map(e -> "- " + e.getKey() + " : " + e.getValue())
            .collect(java.util.stream.Collectors.joining("\n"));

        String geoNote = isRemote
            ? "Le poste est en REMOTE — ne pose aucune question sur la présence physique. "
              + "Pose des questions sur l'organisation async, les outils distants, la couverture horaire."
            : "Le poste est en présentiel/hybride à " + location + ". "
              + "Adapte la monnaie (" + localCurrency(country) + "), les normes légales et les références locales.";

        return "Tu es un expert en matching emploi pour la plateforme SkillSet.\n"
            + "Objectif : construire le profil PRÉCIS du besoin de recrutement de l'entreprise \""
            + company + "\" pour optimiser le matching avec les candidats.\n\n"
            + "=== CONTEXTE DE L'OFFRE (DÉJÀ COLLECTÉ — NE PAS REDEMANDER) ===\n"
            + "Les informations suivantes ont déjà été obtenues. Analyse-les attentivement :\n"
            + alreadyKnown + "\n\n"
            + "ANTI-REDONDANCE ABSOLUE : Avant de générer chaque question, vérifie qu'elle ne porte pas "
            + "sur une information déjà présente dans le contexte ci-dessus, même formulée différemment. "
            + "Nom d'entreprise, secteur, taille, localisation, poste, contrat, numéro d'enregistrement, "
            + "site web, LinkedIn et adresse sont DÉJÀ CONNUS — ne les redemande pas.\n\n"
            + "=== CONTEXTE GÉOGRAPHIQUE ===\n"
            + geoNote + "\n\n"
            + "=== INSTRUCTIONS DE GÉNÉRATION ===\n"
            + "Génère entre 8 et 12 questions selon la spécificité du poste \"" + hiringRole + "\".\n"
            + "Chaque question doit apporter une information UNIQUE et NON REDONDANTE pour le matching candidat/offre.\n"
            + "Toutes les options doivent correspondre à la réalité de \"" + country + "\" et du secteur \"" + industry + "\".\n\n"
            + "TYPES DE QUESTIONS (adapte selon le secteur \"" + industry + "\") :\n"
            + "- Compétences techniques indispensables (multi_choice) : 8-12 options propres au poste\n"
            + "- Niveau et profil d'expérience recherché (single_choice)\n"
            + "- Missions principales concrètes (text) : question ouverte sur le quotidien du rôle\n"
            + "- Rémunération proposée en " + localCurrency(country) + " (text avec placeholder réaliste)\n"
            + "- Culture et environnement de travail (single_choice)\n"
            + "- Questions spécifiques au secteur \"" + industry + "\" (2-4 questions propres à ce secteur)\n"
            + "- Critères différenciants pour le profil idéal (text ou multi_choice)\n"
            + "- Calendrier et processus de recrutement (text)\n\n"
            + "RÈGLES ABSOLUES :\n"
            + "- JAMAIS de numéro dans le texte d'une question (pas de \"1.\", \"Q1\", \"Question 1\", etc.)\n"
            + "- JAMAIS de question générique applicable à toutes les entreprises\n"
            + "- JAMAIS de question déjà couverte par le contexte DÉJÀ COLLECTÉ ci-dessus\n"
            + "- Les options sont TOUJOURS spécifiques au pays \"" + country + "\" et au secteur \"" + industry + "\"\n"
            + "- PAS de question de vérification de légitimité (déjà traitée en étape 1)\n\n"
            + "FORMAT JSON STRICT (sans markdown, sans texte avant/après) :\n"
            + "[{\"id\":\"q1\",\"text\":\"...\",\"type\":\"text|single_choice|multi_choice|number\","
            + "\"options\":null,\"placeholder\":null}]";
    }

    private String localCurrency(String country) {
        return switch (country) {
            case "France", "Belgique", "Luxembourg", "Espagne", "Portugal",
                 "Italie", "Allemagne", "Pays-Bas" -> "euros (€)";
            case "Suisse"   -> "francs suisses (CHF)";
            case "Royaume-Uni" -> "livres sterling (GBP)";
            case "Canada"   -> "dollars canadiens (CAD)";
            case "États-Unis" -> "dollars américains (USD)";
            case "Australie" -> "dollars australiens (AUD)";
            case "Maroc"    -> "dirhams (MAD)";
            case "Tunisie"  -> "dinars tunisiens (TND)";
            case "Algérie"  -> "dinars algériens (DZD)";
            case "Émirats Arabes Unis" -> "dirhams (AED)";
            case "Qatar"    -> "riyals (QAR)";
            case "Inde"     -> "roupies (INR)";
            case "Chine"    -> "yuans (CNY)";
            case "Japon"    -> "yens (JPY)";
            case "Brésil"   -> "reais (BRL)";
            default         -> "FCFA (XAF)";
        };
    }

    private List<QuestionDto> fallbackQuestions() {
        return List.of(
            new QuestionDto("q1", "Quelles sont vos principales compétences ?", "text", null, "Ex : Python, gestion de projet, comptabilité..."),
            new QuestionDto("q2", "Quel salaire annuel brut souhaitez-vous ?", "text", null, "Ex : 45 000 €"),
            new QuestionDto("q3", "Êtes-vous ouvert(e) au télétravail ?", "single_choice",
                List.of("100% présentiel", "Hybride (2-3j/semaine)", "Full remote"), null),
            new QuestionDto("q4", "Dans quelle(s) ville(s) souhaitez-vous travailler ?", "text", null, "Ex : Paris, Lyon, Bordeaux"),
            new QuestionDto("q5", "Quelle est votre disponibilité ?", "single_choice",
                List.of("Immédiate", "1 mois", "2 mois", "3 mois et plus"), null),
            new QuestionDto("q6", "Avez-vous des certifications ou formations notables ?", "text", null, "Ex : AWS Certified, PMP, Master RH...")
        );
    }
}
