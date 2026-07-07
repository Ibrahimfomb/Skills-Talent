# Database Schema

## Tables

### Users
- `id` (UUID, PK)
- `email` (VARCHAR, UNIQUE)
- `password` (VARCHAR)
- `firstName` (VARCHAR)
- `lastName` (VARCHAR)
- `phoneNumber` (VARCHAR)
- `role` (ENUM: JOB_SEEKER, EMPLOYER, ADMIN)
- `profilePictureUrl` (VARCHAR)
- `isActive` (BOOLEAN)
- `twoFactorEnabled` (BOOLEAN)
- `twoFactorSecret` (VARCHAR)
- `createdAt` (TIMESTAMP)
- `updatedAt` (TIMESTAMP)

### JobListings
- `id` (UUID, PK)
- `title` (VARCHAR)
- `description` (TEXT)
- `companyId` (VARCHAR, FK)
- `location` (VARCHAR)
- `jobType` (VARCHAR)
- `salaryMin` (VARCHAR)
- `salaryMax` (VARCHAR)
- `requiredSkills` (TEXT)
- `responsibilities` (TEXT)
- `status` (ENUM: OPEN, CLOSED, FILLED, PAUSED)
- `postedAt` (TIMESTAMP)
- `expiresAt` (TIMESTAMP)
- `createdAt` (TIMESTAMP)

### Applications
- `id` (UUID, PK)
- `jobSeekerId` (VARCHAR, FK)
- `jobListingId` (UUID, FK)
- `coverLetter` (TEXT)
- `cvUrl` (VARCHAR)
- `status` (ENUM: SUBMITTED, SCREENING, INTERVIEW, APPROVED, REJECTED, WITHDRAWN)
- `matchScore` (DOUBLE)
- `appliedAt` (TIMESTAMP)
- `reviewedAt` (TIMESTAMP)
- `createdAt` (TIMESTAMP)

### ScreeningQuestions
- `id` (UUID, PK)
- `jobListingId` (UUID, FK)
- `questionText` (TEXT)
- `questionType` (VARCHAR)
- `options` (TEXT - JSON)
- `isRequired` (BOOLEAN)
- `orderIndex` (INT)

### ApplicationAnswers
- `id` (UUID, PK)
- `applicationId` (UUID, FK)
- `screeningQuestionId` (UUID, FK)
- `answerText` (TEXT)

### Messages
- `id` (UUID, PK)
- `senderId` (UUID, FK)
- `recipientId` (UUID, FK)
- `content` (TEXT)
- `isRead` (BOOLEAN)
- `sentAt` (TIMESTAMP)
- `readAt` (TIMESTAMP)

### Notifications
- `id` (UUID, PK)
- `userId` (UUID, FK)
- `title` (VARCHAR)
- `message` (TEXT)
- `notificationType` (VARCHAR)
- `isRead` (BOOLEAN)
- `createdAt` (TIMESTAMP)
- `readAt` (TIMESTAMP)

### Reviews
- `id` (UUID, PK)
- `applicationId` (UUID, FK)
- `reviewerId` (VARCHAR)
- `rating` (INT)
- `comments` (TEXT)
- `status` (VARCHAR)
- `createdAt` (TIMESTAMP)

### UserPreferences
- `id` (UUID, PK)
- `userId` (VARCHAR, UNIQUE, FK)
- `preferredJobTypes` (TEXT)
- `preferredLocations` (TEXT)
- `preferredIndustries` (TEXT)
- `salaryExpectationMin` (DOUBLE)
- `salaryExpectationMax` (DOUBLE)
- `notificationsEnabled` (BOOLEAN)
- `emailAlertsEnabled` (BOOLEAN)

### Interviews
- `id` (UUID, PK)
- `applicationId` (VARCHAR)
- `candidateId` (VARCHAR)
- `interviewerId` (VARCHAR)
- `scheduledAt` (TIMESTAMP)
- `interviewType` (VARCHAR)
- `interviewLink` (VARCHAR)
- `status` (VARCHAR)
- `notes` (TEXT)
- `rating` (INT)
- `createdAt` (TIMESTAMP)
- `updatedAt` (TIMESTAMP)

## Relationships

- **Users** → **Messages** (1:Many as sender, 1:Many as recipient)
- **Users** → **Notifications** (1:Many)
- **JobListings** → **Applications** (1:Many)
- **JobListings** → **ScreeningQuestions** (1:Many)
- **Applications** → **ApplicationAnswers** (1:Many)
- **Applications** → **Reviews** (1:Many)
- **ScreeningQuestions** → **ApplicationAnswers** (1:Many)
