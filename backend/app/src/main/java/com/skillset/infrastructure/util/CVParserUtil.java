package com.skillset.infrastructure.util;

import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

@Slf4j
@Component
public class CVParserUtil {
    
    public String extractKeywords(String cvContent) {
        log.info("Extracting keywords from CV");
        // TODO: Implement CV parsing logic
        return "";
    }
    
    public Double calculateMatchScore(String cvContent, String jobRequirements) {
        log.info("Calculating match score between CV and job requirements");
        // TODO: Implement matching algorithm using NLP or simple text matching
        return 0.0;
    }
}
