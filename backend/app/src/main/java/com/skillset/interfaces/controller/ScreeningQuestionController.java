package com.skillset.interfaces.controller;

import com.skillset.application.dto.ScreeningQuestionDTO;
import com.skillset.application.service.ScreeningQuestionService;
import com.skillset.domain.entity.ScreeningQuestion;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/screening-questions")
@RequiredArgsConstructor
public class ScreeningQuestionController {
    private final ScreeningQuestionService screeningQuestionService;
    
    @PostMapping
    public ResponseEntity<ScreeningQuestion> createQuestion(@RequestBody ScreeningQuestion question) {
        ScreeningQuestion createdQuestion = screeningQuestionService.createQuestion(question);
        return new ResponseEntity<>(createdQuestion, HttpStatus.CREATED);
    }
    
    @GetMapping("/job/{jobListingId}")
    public ResponseEntity<List<ScreeningQuestionDTO>> getJobQuestions(@PathVariable String jobListingId) {
        List<ScreeningQuestionDTO> questions = screeningQuestionService.getJobScreeningQuestions(jobListingId);
        return ResponseEntity.ok(questions);
    }
    
    @PutMapping("/{questionId}")
    public ResponseEntity<ScreeningQuestion> updateQuestion(@PathVariable String questionId, @RequestBody ScreeningQuestion questionDetails) {
        ScreeningQuestion updatedQuestion = screeningQuestionService.updateQuestion(questionId, questionDetails);
        if (updatedQuestion != null) {
            return ResponseEntity.ok(updatedQuestion);
        }
        return ResponseEntity.notFound().build();
    }
    
    @DeleteMapping("/{questionId}")
    public ResponseEntity<Void> deleteQuestion(@PathVariable String questionId) {
        screeningQuestionService.deleteQuestion(questionId);
        return ResponseEntity.noContent().build();
    }
}
