package com.skillset.application.dto.onboarding;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.List;

/**
 * DTO pour une question générée par l'IA onboarding
 * Retourné par /api/onboarding/next-question
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class OnboardingQuestionDTO {

    // Texte et rendu
    private String question;
    private String placeholder;
    private String inputType; // text|textarea|select|number|date|country|city|salary|phone
    private List<String> options; // Pour les selects

    // Logique de navigation
    private boolean isLastQuestion;
    private String nextPhase; // Phase suivante si fournie
    private String fieldKey; // Clé unique camelCase pour stocker la réponse
    private int questionIndex; // Index de la question actuelle

    // Dépendances et impact
    private String dependsOn; // FieldKey sur lequel cette question dépend (ou null)
    private boolean affectsJobFilters; // Cette réponse affecte les filtres offres

    // Contexte pour le frontend
    private String contextualNote; // Raison du choix de cette question
}
