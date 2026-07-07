package com.skillset.application.dto.onboarding;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.List;

/**
 * DTO pour requête d'extraction de filtres profil
 * POST /api/onboarding/extract-filters
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class OnboardingFilterRequestDTO {

    private String userRole; // "CANDIDATE" ou "EMPLOYER"
    private List<PreviousAnswerDTO> answers;
}
