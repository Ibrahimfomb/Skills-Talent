package com.skillset.interfaces.controller;

import com.skillset.application.dto.AdminStatsDto;
import com.skillset.application.service.AdminService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
public class AdminController {

    private final AdminService adminService;

    @GetMapping("/stats")
    ResponseEntity<AdminStatsDto> getStats(@AuthenticationPrincipal String userId) {
        return ResponseEntity.ok(adminService.getStats(userId));
    }

    @GetMapping("/users")
    ResponseEntity<List<AdminStatsDto.UserSummary>> getUsers(
            @AuthenticationPrincipal String userId,
            @RequestParam(required = false) String search) {
        return ResponseEntity.ok(adminService.searchUsers(userId, search));
    }

    @PutMapping("/users/{targetId}/status")
    ResponseEntity<Void> toggleUserStatus(
            @AuthenticationPrincipal String userId,
            @PathVariable String targetId) {
        adminService.toggleUserStatus(userId, targetId);
        return ResponseEntity.ok().build();
    }
}
