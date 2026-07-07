# SkillSet Features

## Authentication & Security
- ✅ User registration and login
- ✅ JWT token-based authentication
- ✅ Password hashing with Bcrypt
- 🔄 Two-factor authentication (2FA) — entity & flag exist, enforcement not wired

## Job Management
- ✅ Create and manage job listings (backend CRUD + employer UI)
- ✅ Job search — hits `GET /api/jobs` with mock fallback when backend is unreachable
- ✅ Salary range specification
- ✅ Job status tracking (OPEN, CLOSED, FILLED, PAUSED)

## Application Workflow
- ✅ Submit applications for jobs
- ✅ Screening questions per job
- ✅ Application status tracking
- 🔄 CV/Resume upload — UI present, no file storage wired
- 🔄 Match score calculation — CVParserUtil implemented (keyword overlap); not yet called from ApplicationService

## Interview Management
- ✅ Schedule interviews
- ✅ Interview type support (Phone, Video, In-person, Async)
- ✅ Interview link/meeting URL
- ✅ Interview feedback and rating
- ✅ Candidate and interviewer views

## Communication
- 🔄 Direct messaging — UI functional with local store; `messageService.sendMessage` called on send, persists when backend is up
- 🔄 Message read status tracking — local store only
- 🔄 Notification system — frontend mock store; no backend controller
- 🔄 WebSocket — config defined, not integrated into message flow

## User Preferences
- 🔄 Job preference customization — `UserPreferencesService` stub (no repository port)
- 🔄 Location/salary/notification/email preferences — entity exists, no CRUD endpoints

## Profile
- ✅ Profile read (`GET /api/auth/profile/{id}`)
- ✅ Profile update (`PUT /api/auth/profile/{id}`) — name, phone; persists to DB + localStorage

## AI & Analytics
- 🔄 CV keyword extraction — implemented (tokenize + stopword filter)
- 🔄 Job-candidate match score — implemented (keyword recall %)
- 📋 Recommendation engine
- ✅ STELLA AI chatbot — integrated with Claude API

## Admin Features
- ✅ Stats dashboard (`GET /api/admin/stats`)
- ✅ User search & status toggle (`GET/PUT /api/admin/users`)
- ✅ Admin sub-routes registered (`/admin/users`, `/admin/jobs`, `/admin/applications`, `/admin/moderation`)
- 🔄 Moderation panel — route declared, UI placeholder
- 🔄 Job/application admin views — tab placeholders

## Email
- 🔄 Email notifications — `EmailUtil` implemented with `JavaMailSender`; requires SMTP config in `application.properties`

## Legend
- ✅ Implemented and wired end-to-end
- 🔄 Partial — backend entity/service exists OR frontend UI exists, but not fully connected
- 📋 Planned — not started
