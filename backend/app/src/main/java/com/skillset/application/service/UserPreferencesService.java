package com.skillset.application.service;

import com.skillset.domain.entity.UserPreferences;
import com.skillset.domain.port.UserRepositoryPort;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class UserPreferencesService {
    private final UserRepositoryPort userRepositoryPort;
    
    public UserPreferences createPreferences(UserPreferences preferences) {
        // À implémenter avec port dédié
        return preferences;
    }
    
    public UserPreferences updatePreferences(String userId, UserPreferences preferencesDetails) {
        // À implémenter avec port dédié
        return preferencesDetails;
    }
}
