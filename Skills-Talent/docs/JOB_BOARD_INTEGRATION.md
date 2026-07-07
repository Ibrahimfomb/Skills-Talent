# Job Board Integration Guide

## Architecture Overview

SkillSet supports publishing job listings to multiple job boards across different regions through a flexible, adapter-based architecture.

### Key Components

| Component | Role | Location |
|-----------|------|----------|
| **JobBoardAdapter** | Port/interface for all adapters | `domain/port/` |
| **FranceTravailAdapter** | France implementation | `infrastructure/integration/adapter/` |
| **LinkedInAdapter** | Universal job board | `infrastructure/integration/adapter/` |
| **BrighterMondayAdapter** | Pan-African job board | `infrastructure/integration/adapter/` |
| **JobartisanAdapter** | African job board | `infrastructure/integration/adapter/` |
| **JobBoardRouter** | Routes countries to partners | `application/service/` |
| **JobBoardPublishingService** | Orchestrates multi-partner publishing | `application/service/` |
| **JobBoardConfig** | Country-to-partner mapping | `domain/entity/` |

---

## Supported Partners

### 1. **France Travail**
- **Region:** France
- **API:** https://api.francetravail.io/partenaire/offresdemploi/v2
- **Authentication:** Basic Auth (Client ID + Secret)
- **Environment Variables:**
  ```
  FRANCE_TRAVAIL_API_BASE_URL=https://api.francetravail.io/partenaire/offresdemploi/v2
  FRANCE_TRAVAIL_API_CLIENT_ID=<your-client-id>
  FRANCE_TRAVAIL_API_CLIENT_SECRET=<your-secret>
  ```
- **Getting Credentials:** https://developer.francetravail.io

### 2. **LinkedIn**
- **Region:** Universal (all countries)
- **API:** https://api.linkedin.com/v2/jobs
- **Authentication:** OAuth2 Bearer Token
- **Environment Variables:**
  ```
  LINKEDIN_API_BASE_URL=https://api.linkedin.com/v2
  LINKEDIN_API_ACCESS_TOKEN=<your-access-token>
  LINKEDIN_ORGANIZATION_ID=<your-org-id>
  ```
- **Getting Credentials:** https://www.linkedin.com/developers/apps

### 3. **BrighterMonday**
- **Region:** Pan-African (Kenya, Uganda, Nigeria, Ghana, Cameroon, Senegal, etc.)
- **API:** https://api.brightermonday.com/v1
- **Authentication:** Bearer Token
- **Environment Variables:**
  ```
  BRIGHTERMONDAY_API_BASE_URL=https://api.brightermonday.com/v1
  BRIGHTERMONDAY_API_KEY=<your-api-key>
  ```
- **Getting Credentials:** Contact partnerships@brightermonday.com
- **Documentation:** https://www.brightermonday.com/about/api

### 4. **Jobartisan**
- **Region:** African markets
- **API:** https://api.jobartisan.io/v1
- **Authentication:** Bearer Token
- **Environment Variables:**
  ```
  JOBARTISAN_API_BASE_URL=https://api.jobartisan.io/v1
  JOBARTISAN_API_KEY=<your-api-key>
  ```
- **Getting Credentials:** Contact api-support@jobartisan.io
- **Documentation:** https://jobartisan.io/developers

---

## Country-to-Partner Mapping

The `JobBoardConfig` table controls which job boards are called for each country:

| Country Code | Country | Partners | Priority |
|---|---|---|---|
| **FR** | France | France Travail, LinkedIn | 1, 2 |
| **CM** | Cameroon | BrighterMonday, LinkedIn, Jobartisan | 1, 2, 3 |
| **SN** | Senegal | BrighterMonday, LinkedIn | 1, 2 |
| **CI** | Côte d'Ivoire | BrighterMonday, LinkedIn | 1, 2 |
| **NG** | Nigeria | BrighterMonday, LinkedIn | 1, 2 |
| **KE** | Kenya | BrighterMonday, LinkedIn | 1, 2 |
| **\*** | Fallback (any other country) | LinkedIn | 1 |

### Adding a New Country

1. Insert into `job_board_configs`:
   ```sql
   INSERT INTO job_board_configs (id, country_code, partner, is_active, priority)
   VALUES (
     gen_random_uuid(),
     'TZ',  -- Tanzania
     'BRIGHTERMONDAY',
     true,
     1
   );
   ```

2. Multiple partners per country are supported — adjust `priority` to control order.

3. Fallback (\*) will be used if a country has no explicit mapping.

---

## REST API

### Publish Job to Multiple Job Boards

**Request:**
```http
POST /api/jobboards/publish/{jobId}
Content-Type: application/json

{
  "targetCountries": ["CM", "FR", "SN"]
}
```

**Response (201 Created):**
```json
{
  "jobId": "job-uuid-123",
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

### Unpublish Job from All Job Boards

**Request:**
```http
DELETE /api/jobboards/unpublish/{jobId}
```

**Response (200 OK):**
```json
{
  "jobId": "job-uuid-123",
  "timestamp": "2024-01-15T10:35:00",
  "successCount": 3,
  "failureCount": 0,
  "totalCount": 3,
  "results": [
    {
      "partner": "BRIGHTERMONDAY",
      "status": "UNPUBLISHED"
    },
    {
      "partner": "FRANCE_TRAVAIL",
      "status": "UNPUBLISHED"
    },
    {
      "partner": "LINKEDIN",
      "status": "UNPUBLISHED"
    }
  ]
}
```

---

## How to Add a New Job Board Partner

### 1. Create an Adapter Class

In `infrastructure/integration/adapter/`:

```java
@Service
@RequiredArgsConstructor
@Slf4j
public class MyJobBoardAdapter implements JobBoardAdapter {

    private final RestTemplate restTemplate;

    @Value("${myjobboard.api.base-url:https://api.myjobboard.com/v1}")
    private String baseUrl;

    @Value("${myjobboard.api.key:}")
    private String apiKey;

    @Override
    public JobBoardPartner getPartner() {
        return JobBoardPartner.MY_JOB_BOARD;  // Add enum value first
    }

    @Override
    public JobBoardPublishResult publish(JobListing jobListing) {
        // Implement your publish logic
        // Return JobBoardPublishResult.success(...) or .failure(...)
    }

    @Override
    public boolean unpublish(String externalId) {
        // Implement unpublish logic
        return success;
    }

    @Override
    public boolean isAvailable() {
        return apiKey != null && !apiKey.isEmpty();
    }
}
```

### 2. Add to JobBoardPartner Enum

In `domain/value/JobBoardPartner.java`:

```java
public enum JobBoardPartner {
    ...
    MY_JOB_BOARD("My Job Board", "REGION");
}
```

### 3. Register in Spring Config

In `infrastructure/config/JobBoardAdapterConfig.java`:

```java
@Bean
public Map<JobBoardPartner, JobBoardAdapter> jobBoardAdapterRegistry() {
    Map<JobBoardPartner, JobBoardAdapter> registry = new HashMap<>();
    ...
    registry.put(JobBoardPartner.MY_JOB_BOARD, myJobBoardAdapter);
    return registry;
}
```

### 4. Add Environment Variables

In `.env.example`:

```
MY_JOB_BOARD_API_BASE_URL=https://api.myjobboard.com/v1
MY_JOB_BOARD_API_KEY=
```

### 5. Configure Country Mappings

In `JobBoardConfig` table:

```sql
INSERT INTO job_board_configs (id, country_code, partner, is_active, priority)
VALUES (gen_random_uuid(), 'XX', 'MY_JOB_BOARD', true, 1);
```

---

## Error Handling

Each adapter failure is **isolated**. If one partner fails, others continue:

```json
{
  "results": [
    {
      "partner": "BRIGHTERMONDAY",
      "status": "PUBLISHED",
      "externalId": "bm-123",
      "externalUrl": "https://..."
    },
    {
      "partner": "LINKEDIN",
      "status": "FAILED",
      "errorMessage": "Invalid OAuth token"
    },
    {
      "partner": "JOBARTISAN",
      "status": "PUBLISHED",
      "externalId": "jo-456",
      "externalUrl": "https://..."
    }
  ]
}
```

---

## Database Schema

### job_board_configs
Defines which job boards are available for each country:

```sql
CREATE TABLE job_board_configs (
    id UUID PRIMARY KEY,
    country_code VARCHAR(2),
    partner VARCHAR(50),
    is_active BOOLEAN,
    priority INTEGER,
    metadata TEXT,
    created_at TIMESTAMP,
    updated_at TIMESTAMP
);
```

### job_board_publications
Tracks every publication attempt:

```sql
CREATE TABLE job_board_publications (
    id UUID PRIMARY KEY,
    job_listing_id UUID,
    partner VARCHAR(50),
    status VARCHAR(20),  -- PUBLISHED, FAILED, UNPUBLISHED
    external_id VARCHAR(255),
    external_url VARCHAR(2048),
    error_message TEXT,
    published_at TIMESTAMP,
    updated_at TIMESTAMP
);
```

---

## Testing

Run the test suites:

```bash
# Test routing logic
mvn test -Dtest=JobBoardRouterTest

# Test publication orchestration
mvn test -Dtest=JobBoardPublishingServiceTest
```

---

## Troubleshooting

### "Credentials not configured" error

Check your environment variables:

```bash
# France Travail
echo $FRANCE_TRAVAIL_API_CLIENT_ID
echo $FRANCE_TRAVAIL_API_CLIENT_SECRET

# LinkedIn
echo $LINKEDIN_API_ACCESS_TOKEN
echo $LINKEDIN_ORGANIZATION_ID

# BrighterMonday
echo $BRIGHTERMONDAY_API_KEY

# Jobartisan
echo $JOBARTISAN_API_KEY
```

### Job published on some partners but not others

Check the publication history:

```sql
SELECT * FROM job_board_publications 
WHERE job_listing_id = 'your-job-id'
ORDER BY published_at DESC;
```

### Partner API timeout

Adjust the timeout in `.env`:

```
INTEGRATION_API_TIMEOUT=60000  # 60 seconds
```

---

## Future Enhancements

- [ ] Webhook notifications when a job is published/unpublished
- [ ] Job sync status API (check if job is still active on partner)
- [ ] Batch publishing to multiple jobs
- [ ] Rate limiting per partner
- [ ] Retry logic with exponential backoff
