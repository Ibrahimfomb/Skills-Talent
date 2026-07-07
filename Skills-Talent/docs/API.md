# SkillSet API Documentation

## Base URL
```
http://localhost:8080/api
```

## Authentication
All requests (except `/auth/register` and `/auth/login`) require JWT token in Authorization header:
```
Authorization: Bearer <jwt_token>
```

## Endpoints

### Authentication (`/auth`)

#### Register User
- **POST** `/auth/register`
- **Body**: User object with email, password, firstName, lastName, role
- **Response**: Created User object

#### Login
- **POST** `/auth/login?email=<email>`
- **Response**: User DTO with token

#### Get Profile
- **GET** `/auth/profile/{userId}`
- **Response**: User DTO

#### Update Profile
- **PUT** `/auth/profile/{userId}`
- **Body**: Updated User details
- **Response**: Updated User object

### Jobs (`/jobs`)

#### Get All Open Jobs
- **GET** `/jobs`
- **Response**: List of JobListingDTO

#### Search Jobs
- **GET** `/jobs/search?location=<location>`
- **Response**: List of JobListingDTO

#### Get Company Jobs
- **GET** `/jobs/company/{companyId}`
- **Response**: List of JobListingDTO

#### Get Job by ID
- **GET** `/jobs/{jobId}`
- **Response**: JobListing object

#### Create Job
- **POST** `/jobs`
- **Body**: JobListing object
- **Response**: Created JobListing

#### Update Job
- **PUT** `/jobs/{jobId}`
- **Body**: Updated JobListing details
- **Response**: Updated JobListing

### Applications (`/applications`)

#### Submit Application
- **POST** `/applications`
- **Body**: Application object
- **Response**: Created Application

#### Get Candidate Applications
- **GET** `/applications/candidate/{jobSeekerId}`
- **Response**: List of ApplicationDTO

#### Get Job Applications
- **GET** `/applications/job/{jobListingId}`
- **Response**: List of ApplicationDTO

#### Get Application by ID
- **GET** `/applications/{applicationId}`
- **Response**: Application object

#### Update Application Status
- **PUT** `/applications/{applicationId}/status?status=<status>`
- **Response**: Updated Application

### Screening Questions (`/screening-questions`)

#### Create Question
- **POST** `/screening-questions`
- **Body**: ScreeningQuestion object
- **Response**: Created ScreeningQuestion

#### Get Job Screening Questions
- **GET** `/screening-questions/job/{jobListingId}`
- **Response**: List of ScreeningQuestionDTO

#### Update Question
- **PUT** `/screening-questions/{questionId}`
- **Body**: Updated ScreeningQuestion details
- **Response**: Updated ScreeningQuestion

#### Delete Question
- **DELETE** `/screening-questions/{questionId}`
- **Response**: 204 No Content

### Messages (`/messages`)

#### Send Message
- **POST** `/messages`
- **Body**: Message object
- **Response**: Created Message

#### Get Conversation
- **GET** `/messages/conversation?userId1=<id>&userId2=<id>`
- **Response**: List of MessageDTO

#### Get Unread Messages
- **GET** `/messages/unread/{userId}`
- **Response**: List of MessageDTO

#### Mark as Read
- **PUT** `/messages/{messageId}/read`
- **Response**: Updated Message

### Interviews (`/interviews`)

#### Schedule Interview
- **POST** `/interviews`
- **Body**: Interview object
- **Response**: Created Interview

#### Get Candidate Interviews
- **GET** `/interviews/candidate/{candidateId}`
- **Response**: List of Interview objects

#### Get Interviewer Schedule
- **GET** `/interviews/interviewer/{interviewerId}`
- **Response**: List of Interview objects

#### Get Interview by ID
- **GET** `/interviews/{interviewId}`
- **Response**: Interview object

#### Update Interview Status
- **PUT** `/interviews/{interviewId}/status?status=<status>`
- **Response**: Updated Interview

#### Add Interview Feedback
- **PUT** `/interviews/{interviewId}/feedback?notes=<notes>&rating=<rating>`
- **Response**: Updated Interview

### Job Board Integration (`/jobboards`)

#### Publish Job to Multiple Job Boards
- **POST** `/jobboards/publish/{jobId}`
- **Auth**: EMPLOYER role required
- **Body**:
  ```json
  {
    "targetCountries": ["CM", "FR", "SN"]
  }
  ```
- **Response** (201 Created):
  ```json
  {
    "jobId": "job-uuid",
    "timestamp": "2024-01-15T10:30:00",
    "successCount": 3,
    "failureCount": 0,
    "totalCount": 3,
    "results": [
      {
        "partner": "BRIGHTERMONDAY",
        "status": "PUBLISHED",
        "externalId": "bm-12345",
        "externalUrl": "https://www.brightermonday.com/jobs/bm-12345"
      },
      {
        "partner": "FRANCE_TRAVAIL",
        "status": "PUBLISHED",
        "externalId": "ft-67890",
        "externalUrl": "https://www.francetravail.fr/offres/ft-67890"
      },
      {
        "partner": "LINKEDIN",
        "status": "PUBLISHED",
        "externalId": "li-abcde",
        "externalUrl": "https://www.linkedin.com/jobs/view/li-abcde"
      }
    ]
  }
  ```

#### Unpublish Job from All Job Boards
- **DELETE** `/jobboards/unpublish/{jobId}`
- **Auth**: EMPLOYER role required, must be job owner
- **Response** (200 OK): Same structure as publish endpoint

**Supported Countries & Job Boards:**

| Country | Code | Job Boards |
|---------|------|-----------|
| France | FR | France Travail, LinkedIn |
| Cameroon | CM | BrighterMonday, LinkedIn, Jobartisan |
| Senegal | SN | BrighterMonday, LinkedIn |
| Côte d'Ivoire | CI | BrighterMonday, LinkedIn |
| Nigeria | NG | BrighterMonday, LinkedIn |
| Kenya | KE | BrighterMonday, LinkedIn |
| Other | * | LinkedIn (fallback) |

For more details on job board integrations, see [JOB_BOARD_INTEGRATION.md](./JOB_BOARD_INTEGRATION.md).

## Status Codes

- `200 OK`: Successful GET request
- `201 Created`: Successful POST request
- `204 No Content`: Successful DELETE request
- `400 Bad Request`: Invalid request data
- `401 Unauthorized`: Missing or invalid JWT token
- `404 Not Found`: Resource not found
- `500 Internal Server Error`: Server error
