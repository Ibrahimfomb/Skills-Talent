package com.skillset.application.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.JsonNode;
import com.skillset.application.dto.onboarding.*;
import com.skillset.infrastructure.util.ContextualDataLoader;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.*;
import java.util.stream.Collectors;

/**
 * Service pour orchestrer l'onboarding IA dynamique avec contexte cumulatif.
 * Gère génération questions, reconstruction contexte, génération CV, extraction filtres.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class OnboardingAiService {

    private final AiCompletionService aiCompletionService;
    private final RestTemplate restTemplate;
    private final ObjectMapper objectMapper;
    private final ContextualDataLoader contextualDataLoader;

    @Value("${ai.api.key:}")
    private String aiApiKey;

    @Value("${ai.model:gemini-flash-latest}")
    private String modelName;

    private static final String AI_API_URL_TEMPLATE =
            "https://generativelanguage.googleapis.com/v1beta/models/%s:generateContent";
    private static final int MIN_QUESTIONS = 5;
    private static final int MAX_QUESTIONS = 15;
    private static final int TIMEOUT_SECONDS = 30;

    /**
     * Construit le contexte cumulatif depuis les réponses antérieures.
     * Détermine les options filtrées (villes, salaires, etc.) basées sur le pays.
     */
    public OnboardingContextDTO buildContext(List<PreviousAnswerDTO> previousAnswers) {
        OnboardingContextDTO.OnboardingContextDTOBuilder builder = OnboardingContextDTO.builder();

        String country = null;
        for (PreviousAnswerDTO answer : previousAnswers) {
            if ("country".equals(answer.getFieldKey())) {
                country = answer.getAnswer();
                break;
            }
        }

        if (country == null || country.isEmpty()) {
            // Pas de pays sélectionné = contexte vide, options bloquées
            return builder
                    .country(null)
                    .currency("EUR")
                    .currencySymbol("€")
                    .salaryPeriod("annuel")
                    .phonePrefix("")
                    .availableCities(Collections.emptyList())
                    .salaryRanges(Collections.emptyList())
                    .contractTypes(Collections.emptyList())
                    .workModes(Collections.emptyList())
                    .languages(Collections.emptyList())
                    .cvFormat(OnboardingContextDTO.CVFormatDTO.builder()
                            .withPhoto(false)
                            .withPersonalDetails(false)
                            .rgpdStrict(false)
                            .build())
                    .answeredFields(previousAnswers.stream()
                            .map(PreviousAnswerDTO::getFieldKey)
                            .collect(Collectors.toList()))
                    .build();
        }

        // Charger métadonnées pays
        Map<String, Object> countryData = contextualDataLoader.getCountryData(country);
        if (countryData == null) {
            countryData = new HashMap<>();
        }

        String currency = (String) countryData.getOrDefault("currency", "EUR");
        String currencySymbol = (String) countryData.getOrDefault("currencySymbol", "€");
        String salaryPeriod = (String) countryData.getOrDefault("salaryPeriod", "annuel");
        String phonePrefix = (String) countryData.getOrDefault("phonePrefix", "");

        List<String> cities = (List<String>) countryData.getOrDefault("cities", Collections.emptyList());
        List<String> salaryRanges = (List<String>) countryData.getOrDefault("salaryRanges", Collections.emptyList());
        List<String> contractTypes = (List<String>) countryData.getOrDefault("contractTypes", Collections.emptyList());
        List<String> workModes = (List<String>) countryData.getOrDefault("workModes", Collections.emptyList());
        List<String> languages = (List<String>) countryData.getOrDefault("languages", Collections.emptyList());

        boolean withPhoto = ((List<String>) countryData.getOrDefault("withPhoto", Collections.emptyList())).contains(country);
        boolean withDetails = ((List<String>) countryData.getOrDefault("withPersonalDetails", Collections.emptyList())).contains(country);
        boolean rgpdStrict = ((List<String>) countryData.getOrDefault("rgpdStrict", Collections.emptyList())).contains(country);

        return builder
                .country(country)
                .currency(currency)
                .currencySymbol(currencySymbol)
                .salaryPeriod(salaryPeriod)
                .phonePrefix(phonePrefix)
                .availableCities(cities)
                .salaryRanges(salaryRanges)
                .contractTypes(contractTypes)
                .workModes(workModes)
                .languages(languages)
                .cvFormat(OnboardingContextDTO.CVFormatDTO.builder()
                        .withPhoto(withPhoto)
                        .withPersonalDetails(withDetails)
                        .rgpdStrict(rgpdStrict)
                        .build())
                .answeredFields(previousAnswers.stream()
                        .map(PreviousAnswerDTO::getFieldKey)
                        .collect(Collectors.toList()))
                .build();
    }

    /**
     * Génère la question suivante via le fournisseur IA configuré, avec contexte complet.
     * Règles absolues :
     * - Ne jamais poser une question si fieldKey déjà dans answeredFields
     * - Si fieldKey=city → options = UNIQUEMENT availableCities
     * - Si fieldKey=salary → options = UNIQUEMENT salaryRanges avec currencySymbol
     * - etc.
     */
    public OnboardingQuestionDTO generateNextQuestion(OnboardingAnswerRequestDTO request) {
        List<PreviousAnswerDTO> previousAnswers = request.getPreviousAnswers();
        OnboardingContextDTO context = buildContext(previousAnswers);

        String systemPrompt = buildSystemPrompt(request.getUserRole(), request.getJobTitle(), context, previousAnswers);
        String userPrompt = String.format(
                "Phase actuelle: %s\nIndex question: %d\nGénère la question suivante avec les règles absolues.",
                request.getCurrentPhase(),
                request.getQuestionIndex()
        );

        try {
            String responseText = callAiProvider(systemPrompt, userPrompt);
            OnboardingQuestionDTO question = parseQuestionResponse(responseText);
            question.setQuestionIndex(request.getQuestionIndex());
            return question;
        } catch (Exception e) {
            log.error("Erreur génération question IA — fallback", e);
            return generateFallbackQuestion(request.getQuestionIndex(), request.getCurrentPhase());
        }
    }

    /**
     * Détermine si l'onboarding est complet.
     * Minimum 5 questions, maximum 15.
     * Tous les champs essentiels couverts ?
     */
    public boolean shouldContinue(List<PreviousAnswerDTO> previousAnswers, String userRole, int questionCount) {
        if (questionCount < MIN_QUESTIONS) return true;
        if (questionCount >= MAX_QUESTIONS) return false;

        List<String> answered = previousAnswers.stream()
                .map(PreviousAnswerDTO::getFieldKey)
                .collect(Collectors.toList());

        Set<String> essentialFields = getEssentialFields(userRole);
        return !answered.containsAll(essentialFields);
    }

    /**
     * Génère le CV structuré depuis les réponses de l'onboarding.
     * Appelle le fournisseur IA configuré avec toutes les réponses + contexte pays.
     */
    public Map<String, Object> generateCvFromAnswers(String jobTitle, List<PreviousAnswerDTO> answers, String userRole) {
        OnboardingContextDTO context = buildContext(answers);

        String cvPrompt = buildCvPrompt(jobTitle, answers, context, userRole);

        try {
            String responseText = callAiProvider("Tu es un expert RH.", cvPrompt);
            // Parser JSON retourné
            Map<String, Object> cvData = objectMapper.readValue(responseText, Map.class);
            enrichCvWithCountryFormat(cvData, context);
            return cvData;
        } catch (Exception e) {
            log.error("Erreur génération CV IA", e);
            return generateFallbackCvStructure(jobTitle, answers);
        }
    }

    /**
     * Extrait les filtres de recherche d'offres depuis les réponses d'onboarding.
     * Alimente UserPreferences pour recherche personnalisée.
     */
    public Map<String, Object> extractProfileFilters(List<PreviousAnswerDTO> answers, String userRole) {
        Map<String, Object> filters = new HashMap<>();

        for (PreviousAnswerDTO answer : answers) {
            String field = answer.getFieldKey();
            String value = answer.getAnswer();

            if ("country".equals(field)) {
                filters.put("preferredCountry", value);
            } else if ("city".equals(field)) {
                filters.put("preferredCity", value);
            } else if ("salary".equals(field)) {
                filters.put("salaryExpectation", value);
            } else if ("contractType".equals(field)) {
                filters.put("preferredContractTypes", List.of(value.split(",")));
            } else if ("workMode".equals(field)) {
                filters.put("preferredWorkMode", value);
            } else if ("jobDomain".equals(field)) {
                filters.put("preferredIndustries", List.of(value));
            }
        }

        // Ajouter devise depuis contexte
        OnboardingContextDTO context = buildContext(answers);
        filters.put("preferredCurrency", context.getCurrency());

        return filters;
    }

    // ─── PRIVATE HELPERS ───

    private String buildSystemPrompt(String userRole, String jobTitle, OnboardingContextDTO context,
                                     List<PreviousAnswerDTO> previousAnswers) {
        StringBuilder prompt = new StringBuilder();
        prompt.append("Tu es un expert RH. Tu génères des questions d'onboarding pour un candidat au poste de ")
                .append(jobTitle).append(".\n\n");

        prompt.append("CONTEXTE CUMULATIF OBLIGATOIRE:\n");
        prompt.append("- Pays: ").append(context.getCountry()).append("\n");
        prompt.append("- Devise: ").append(context.getCurrencySymbol()).append(" (").append(context.getSalaryPeriod()).append(")\n");
        prompt.append("- Préfixe téléphone: ").append(context.getPhonePrefix()).append("\n");
        prompt.append("- Champs déjà répondus (NE PAS REPOSER): ").append(context.getAnsweredFields()).append("\n");

        if (!context.getAvailableCities().isEmpty()) {
            prompt.append("- Villes disponibles: ").append(context.getAvailableCities()).append("\n");
        }
        if (!context.getSalaryRanges().isEmpty()) {
            prompt.append("- Fourchettes salariales: ").append(context.getSalaryRanges()).append("\n");
        }
        if (!context.getContractTypes().isEmpty()) {
            prompt.append("- Types contrat: ").append(context.getContractTypes()).append("\n");
        }

        prompt.append("\nRÈGLES ABSOLUES:\n")
                .append("1. Ne JAMAIS poser une question si fieldKey est dans [Champs déjà répondus]\n")
                .append("2. Si fieldKey='city' → options = UNIQUEMENT villes disponibles\n")
                .append("3. Si fieldKey='salary' → options = UNIQUEMENT fourchettes avec ").append(context.getCurrencySymbol()).append("\n")
                .append("4. Si fieldKey='phone' → placeholder commence par ").append(context.getPhonePrefix()).append("\n")
                .append("5. Questions pour CANDIDATE: expérience, compétences, projets, soft skills, salaire, disponibilité\n")
                .append("6. Maximum 15 questions, minimum 5\n")
                .append("7. Chaque question découle logiquement de la précédente\n\n")
                .append("Réponses précédentes:\n");

        for (PreviousAnswerDTO answer : previousAnswers) {
            prompt.append("- ").append(answer.getFieldKey()).append(": ").append(answer.getAnswer()).append("\n");
        }

        prompt.append("\nRéponds UNIQUEMENT en JSON valide:\n")
                .append("{\n")
                .append("  \"question\": \"texte précis et contextualisé\",\n")
                .append("  \"placeholder\": \"exemple adapté\",\n")
                .append("  \"inputType\": \"text|textarea|select|number|country|city|salary|phone\",\n")
                .append("  \"options\": [\"option1\", \"option2\"],\n")
                .append("  \"isLastQuestion\": false,\n")
                .append("  \"nextPhase\": \"phase suivante ou null\",\n")
                .append("  \"fieldKey\": \"clé camelCase unique\",\n")
                .append("  \"dependsOn\": \"fieldKey prérequis ou null\",\n")
                .append("  \"affectsJobFilters\": true,\n")
                .append("  \"contextualNote\": \"raison du choix\"\n")
                .append("}\n");

        return prompt.toString();
    }

    private String buildCvPrompt(String jobTitle, List<PreviousAnswerDTO> answers,
                                  OnboardingContextDTO context, String userRole) {
        StringBuilder prompt = new StringBuilder();
        prompt.append("Génère un CV professionnel ATS 2024 pour un ").append(jobTitle)
                .append(" en ").append(context.getCountry()).append(".\n\n");

        prompt.append("FORMAT selon pays:\n");
        prompt.append("- Photo: ").append(context.getCvFormat().isWithPhoto() ? "INCLURE" : "NE PAS INCLURE").append("\n");
        prompt.append("- Âge/nationalité: ").append(context.getCvFormat().isWithPersonalDetails() ? "INCLURE" : "EXCLURE (RGPD)").append("\n");
        prompt.append("- Devise: ").append(context.getCurrencySymbol()).append("\n\n");

        prompt.append("Réponses de l'utilisateur:\n");
        for (PreviousAnswerDTO answer : answers) {
            prompt.append("- ").append(answer.getFieldKey()).append(": ").append(answer.getAnswer()).append("\n");
        }

        prompt.append("\nRéponds UNIQUEMENT en JSON valide avec structure CV complète.\n");

        return prompt.toString();
    }

    private String callAiProvider(String systemPrompt, String userPrompt) throws Exception {
        if (aiApiKey == null || aiApiKey.isEmpty()) {
            log.warn("AI provider API key not configured — using fallback");
            return "{}";
        }

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.set("x-goog-api-key", aiApiKey);

        Map<String, Object> body = new LinkedHashMap<>();
        body.put("system_instruction", Map.of("parts", List.of(Map.of("text", systemPrompt))));
        body.put("contents", List.of(
                Map.of("role", "user", "parts", List.of(Map.of("text", userPrompt)))
        ));
        body.put("generationConfig", Map.of(
                "maxOutputTokens", 2000,
                "thinkingConfig", Map.of("thinkingBudget", 0)
        ));

        HttpEntity<Map<String, Object>> entity = new HttpEntity<>(body, headers);
        String response = restTemplate.postForObject(
                String.format(AI_API_URL_TEMPLATE, modelName),
                entity,
                String.class
        );

        JsonNode root = objectMapper.readTree(response);
        return root.path("candidates").get(0).path("content").path("parts").get(0).path("text").asText();
    }

    private OnboardingQuestionDTO parseQuestionResponse(String jsonText) throws Exception {
        JsonNode node = objectMapper.readTree(jsonText);
        return OnboardingQuestionDTO.builder()
                .question(node.get("question").asText())
                .placeholder(node.get("placeholder").asText(""))
                .inputType(node.get("inputType").asText("text"))
                .options(objectMapper.convertValue(node.get("options"), List.class))
                .isLastQuestion(node.get("isLastQuestion").asBoolean(false))
                .nextPhase(node.get("nextPhase").asText(null))
                .fieldKey(node.get("fieldKey").asText())
                .dependsOn(node.get("dependsOn").asText(null))
                .affectsJobFilters(node.get("affectsJobFilters").asBoolean(false))
                .contextualNote(node.get("contextualNote").asText(""))
                .build();
    }

    private OnboardingQuestionDTO generateFallbackQuestion(int index, String phase) {
        List<String> fallbacks = List.of(
                "Quelles sont vos principales compétences ?",
                "Décrivez votre expérience professionnelle",
                "Quels sont vos objectifs de carrière ?",
                "Préférez-vous le télétravail ?",
                "Avez-vous des certifications pertinentes ?"
        );
        String q = fallbacks.get(Math.min(index, fallbacks.size() - 1));
        return OnboardingQuestionDTO.builder()
                .question(q)
                .inputType("textarea")
                .isLastQuestion(index >= fallbacks.size() - 1)
                .fieldKey("fallback_" + index)
                .build();
    }

    private void enrichCvWithCountryFormat(Map<String, Object> cvData, OnboardingContextDTO context) {
        cvData.put("country", context.getCountry());
        cvData.put("currency", context.getCurrency());
        cvData.put("cvFormat", Map.of(
                "withPhoto", context.getCvFormat().isWithPhoto(),
                "withPersonalDetails", context.getCvFormat().isWithPersonalDetails(),
                "rgpdStrict", context.getCvFormat().isRgpdStrict()
        ));
    }

    private Map<String, Object> generateFallbackCvStructure(String jobTitle, List<PreviousAnswerDTO> answers) {
        Map<String, Object> cv = new HashMap<>();
        cv.put("title", jobTitle);
        cv.put("answers", answers);
        return cv;
    }

    private Set<String> getEssentialFields(String userRole) {
        Set<String> essential = new HashSet<>();
        if ("CANDIDATE".equals(userRole)) {
            essential.addAll(List.of("country", "city", "experience", "skills", "salary", "availability", "phone"));
        } else {
            essential.addAll(List.of("country", "city", "jobDescription", "requiredSkills", "experienceLevel", "salary", "contractType"));
        }
        return essential;
    }
}
