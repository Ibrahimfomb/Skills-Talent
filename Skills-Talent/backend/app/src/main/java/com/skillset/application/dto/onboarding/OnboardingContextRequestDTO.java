package com.skillset.application.dto.onboarding;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.List;

/**
 * DTO pour requête de contexte
 * POST /api/onboarding/context
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class OnboardingContextRequestDTO {

    private List<PreviousAnswerDTO> answers;
}
