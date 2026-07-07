package com.skillset.application.dto.onboarding;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.List;

/**
 * DTO pour requête de la question suivante
 * POST /api/onboarding/next-question
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class OnboardingAnswerRequestDTO {

    // Contexte utilisateur
    private String userRole; // "CANDIDATE" ou "EMPLOYER"
    private String jobTitle; // Titre du poste recherché/proposé

    // État actuel du flux
    private String currentPhase; // Phase actuelle (INTRO, LOCALISATION, EXPERIENCE, etc.)
    private int questionIndex; // Index de la question actuelle

    // Réponses antérieures pour reconstruire le contexte
    private List<PreviousAnswerDTO> previousAnswers;
}
