package com.skillset.application.service;

import com.skillset.application.dto.ScreeningQuestionDTO;
import com.skillset.domain.entity.ScreeningQuestion;
import com.skillset.domain.port.ScreeningQuestionRepositoryPort;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ScreeningQuestionService {
    private final ScreeningQuestionRepositoryPort screeningQuestionRepositoryPort;
    
    public ScreeningQuestion createQuestion(ScreeningQuestion question) {
        return screeningQuestionRepositoryPort.save(question);
    }
    
    public List<ScreeningQuestionDTO> getJobScreeningQuestions(String jobListingId) {
        return screeningQuestionRepositoryPort.findByJobListingId(jobListingId)
            .stream()
            .map(this::convertToDTO)
            .collect(Collectors.toList());
    }
    
    public ScreeningQuestion updateQuestion(String questionId, ScreeningQuestion questionDetails) {
        return screeningQuestionRepositoryPort.findById(questionId)
            .map(question -> {
                question.setQuestionText(questionDetails.getQuestionText());
                question.setQuestionType(questionDetails.getQuestionType());
                question.setOptions(questionDetails.getOptions());
                question.setIsRequired(questionDetails.getIsRequired());
                question.setOrderIndex(questionDetails.getOrderIndex());
                return screeningQuestionRepositoryPort.save(question);
            }).orElse(null);
    }
    
    public void deleteQuestion(String questionId) {
        screeningQuestionRepositoryPort.deleteById(questionId);
    }
    
    private ScreeningQuestionDTO convertToDTO(ScreeningQuestion question) {
        return new ScreeningQuestionDTO(
            question.getId(),
            question.getJobListing().getId(),
            question.getQuestionText(),
            question.getQuestionType(),
            question.getOptions(),
            question.getIsRequired(),
            question.getOrderIndex()
        );
    }
}
