package com.skillset.interfaces.controller;

import com.skillset.application.dto.onboarding.*;
import com.skillset.application.service.CvGeneratorService;
import com.skillset.application.service.OnboardingAiService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

/**
 * Controller pour l'onboarding IA dynamique avec logique contextuelle en cascade.
 * Endpoints:
 * - POST /api/onboarding/next-question — Génère la question suivante
 * - POST /api/onboarding/generate-cv — Génère le CV depuis les réponses
 * - GET /api/onboarding/status — Statut d'onboarding (complété ?)
 * - GET /api/onboarding/context — Contexte cumulatif (villes, salaires, etc.)
 */
@Slf4j
@RestController
@RequestMapping("/api/onboarding")
@RequiredArgsConstructor
public class OnboardingAiController {

    private final OnboardingAiService onboardingAiService;
    private final CvGeneratorService cvGeneratorService;

    /**
     * POST /api/onboarding/next-question
     * Génère la question suivante avec contexte complet.
     *
     * Requête:
     * {
     *   "userRole": "CANDIDATE" ou "EMPLOYER",
     *   "jobTitle": "Développeur Full Stack",
     *   "currentPhase": "LOCALISATION",
     *   "questionIndex": 3,
     *   "previousAnswers": [
     *     { "fieldKey": "country", "question": "Pays ?", "answer": "France", "phase": "LOCALISATION" },
     *     { "fieldKey": "city", "question": "Ville ?", "answer": "Paris", "phase": "LOCALISATION" },
     *     ...
     *   ]
     * }
     *
     * Réponse:
     * {
     *   "question": "Combien d'années d'expérience avez-vous ?",
     *   "placeholder": "Ex: 5 ans",
     *   "inputType": "select",
     *   "options": ["0-2 ans", "2-5 ans", "5-10 ans", "10+ ans"],
     *   "isLastQuestion": false,
     *   "nextPhase": "EXPERIENCE",
     *   "fieldKey": "experience",
     *   "questionIndex": 4,
     *   "dependsOn": null,
     *   "affectsJobFilters": true,
     *   "contextualNote": "..."
     * }
     */
    @PostMapping("/next-question")
    public ResponseEntity<OnboardingQuestionDTO> getNextQuestion(
            @RequestBody OnboardingAnswerRequestDTO request) {

        log.info("Génération question onboarding - phase: {}, index: {}",
                request.getCurrentPhase(), request.getQuestionIndex());

        try {
            OnboardingQuestionDTO question = onboardingAiService.generateNextQuestion(request);
            return ResponseEntity.ok(question);
        } catch (Exception e) {
            log.error("Erreur génération question", e);
            return ResponseEntity.status(500).build();
        }
    }

    /**
     * POST /api/onboarding/generate-cv
     * Génère le CV professionnel depuis les réponses d'onboarding.
     *
     * Requête:
     * {
     *   "jobTitle": "Développeur Full Stack",
     *   "answers": [
     *     { "fieldKey": "country", "question": "Pays ?", "answer": "France", "phase": "LOCALISATION" },
     *     { "fieldKey": "city", "question": "Ville ?", "answer": "Paris", "phase": "LOCALISATION" },
     *     ...
     *   ]
     * }
     *
     * Réponse:
     * {
     *   "cvUrl": "https://res.cloudinary.com/.../cv_johndoe_1234567890.pdf",
     *   "message": "Votre CV a été généré et envoyé à votre email",
     *   "downloadUrl": "https://res.cloudinary.com/.../pdf",
     *   "emailSentTo": "john@example.com"
     * }
     */
    @PostMapping("/generate-cv")
    public ResponseEntity<GenerateCvResponseDTO> generateCv(
            @AuthenticationPrincipal String userId,
            @RequestBody GenerateCvRequestDTO request) {

        log.info("Génération CV pour user {} - poste: {}", userId, request.getJobTitle());

        try {
            // Générer structure CV depuis l'IA + réponses
            Map<String, Object> cvData = onboardingAiService.generateCvFromAnswers(
                    request.getJobTitle(),
                    request.getAnswers(),
                    "CANDIDATE"
            );

            // Orchestrer génération PDF + upload + email
            String cvUrl = cvGeneratorService.generateAndDeliverCv(userId, cvData);

            if (cvUrl == null) {
                return ResponseEntity.status(500)
                        .body(GenerateCvResponseDTO.builder()
                                .message("Erreur lors de la génération du CV")
                                .build());
            }

            return ResponseEntity.ok(GenerateCvResponseDTO.builder()
                    .cvUrl(cvUrl)
                    .downloadUrl(cvUrl)
                    .message("Votre CV a été généré avec succès et envoyé à votre email")
                    .emailSentTo("À vérifier dans vos emails")
                    .build());
        } catch (Exception e) {
            log.error("Erreur génération CV", e);
            return ResponseEntity.status(500)
                    .body(GenerateCvResponseDTO.builder()
                            .message("Erreur lors de la génération du CV")
                            .build());
        }
    }

    /**
     * GET /api/onboarding/status
     * Retourne le statut d'onboarding et URL du CV si générée.
     *
     * Réponse:
     * {
     *   "completed": true,
     *   "cvUrl": "https://res.cloudinary.com/.../cv_johndoe_1234567890.pdf"
     * }
     */
    @GetMapping("/status")
    public ResponseEntity<Map<String, Object>> getOnboardingStatus(
            @AuthenticationPrincipal String userId) {

        Map<String, Object> response = new HashMap<>();
        response.put("userId", userId);
        response.put("completed", true); // TODO: Charger depuis DB via CandidateProfile

        // TODO: Charger URL CV depuis CandidateProfile.cvUrl si existante
        // response.put("cvUrl", candidateProfile.getCvUrl());

        return ResponseEntity.ok(response);
    }

    /**
     * GET /api/onboarding/context
     * Retourne le contexte cumulatif depuis les réponses actuelles du frontend.
     * Permet au frontend de connaître les options disponibles (villes filtrées, salaires, etc.)
     *
     * Paramètres (query string):
     * ?answers=[{"fieldKey":"country","answer":"France"},...]  (JSON encodé)
     *
     * Réponse:
     * {
     *   "country": "France",
     *   "currency": "EUR",
     *   "currencySymbol": "€",
     *   "salaryPeriod": "annuel",
     *   "phonePrefix": "+33",
     *   "availableCities": ["Paris", "Lyon", "Marseille", ...],
     *   "salaryRanges": ["18 000 - 25 000 €/an", "25 000 - 35 000 €/an", ...],
     *   "contractTypes": ["CDI", "CDD", "Stage", ...],
     *   "workModes": ["Présentiel", "Hybride", "Full remote"],
     *   "languages": ["Français"],
     *   "cvFormat": {
     *     "withPhoto": false,
     *     "withPersonalDetails": false,
     *     "rgpdStrict": true
     *   },
     *   "answeredFields": ["country"]
     * }
     */
    @PostMapping("/context")
    public ResponseEntity<OnboardingContextDTO> getContext(
            @RequestBody OnboardingContextRequestDTO request) {

        log.debug("Récupération contexte pour {} réponses",
                request.getAnswers() != null ? request.getAnswers().size() : 0);

        try {
            OnboardingContextDTO context = onboardingAiService.buildContext(
                    request.getAnswers() != null ? request.getAnswers() : java.util.Collections.emptyList()
            );
            return ResponseEntity.ok(context);
        } catch (Exception e) {
            log.error("Erreur récupération contexte", e);
            return ResponseEntity.status(500).build();
        }
    }

    /**
     * POST /api/onboarding/extract-filters
     * Extrait les filtres de recherche d'offres depuis les réponses.
     * Utilisé en fin d'onboarding pour personnaliser la recherche automatiquement.
     *
     * Requête:
     * {
     *   "userRole": "CANDIDATE",
     *   "answers": [
     *     { "fieldKey": "country", "answer": "France", ... },
     *     { "fieldKey": "city", "answer": "Paris", ... },
     *     ...
     *   ]
     * }
     *
     * Réponse:
     * {
     *   "preferredCountry": "France",
     *   "preferredCity": "Paris",
     *   "salaryExpectation": "50 000 - 70 000 €/an",
     *   "preferredContractTypes": ["CDI", "Freelance"],
     *   "preferredWorkMode": "Hybride",
     *   "preferredIndustries": ["Informatique"],
     *   "preferredCurrency": "EUR"
     * }
     */
    @PostMapping("/extract-filters")
    public ResponseEntity<Map<String, Object>> extractProfileFilters(
            @AuthenticationPrincipal String userId,
            @RequestBody OnboardingFilterRequestDTO request) {

        log.info("Extraction filtres onboarding pour user {} - rôle: {}",
                userId, request.getUserRole());

        try {
            Map<String, Object> filters = onboardingAiService.extractProfileFilters(
                    request.getAnswers(),
                    request.getUserRole()
            );

            // TODO: Sauvegarder dans UserPreferences pour ce user
            // userPreferencesService.saveFilters(userId, filters);

            return ResponseEntity.ok(filters);
        } catch (Exception e) {
            log.error("Erreur extraction filtres", e);
            return ResponseEntity.status(500).build();
        }
    }
}
