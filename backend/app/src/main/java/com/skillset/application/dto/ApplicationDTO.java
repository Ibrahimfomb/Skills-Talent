package com.skillset.application.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ApplicationDTO {
    private String id;
    private String jobSeekerId;
    private String jobListingId;
    private String coverLetter;
    private String cvUrl;
    private String status;
    private Double matchScore;
}
