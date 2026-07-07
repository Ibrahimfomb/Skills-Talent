package com.skillset.application.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class TotpSetupResponse {
    private String secret;
    private String qrCodeUri;
    private String qrCodeImageBase64;
}
