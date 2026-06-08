package com.skillset.application.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class JobListingDTO {
    private String id;
    private String title;
    private String description;
    private String companyId;
    private String location;
    private String jobType;
    private String salaryMin;
    private String salaryMax;
    private String requiredSkills;
    private String responsibilities;
    private String status;
}
