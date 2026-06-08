# SkillSet - Modern Recruitment Platform

Plateforme de recrutement intelligente qui connecte candidats et employeurs grâce à un système de matching par IA. L'application analyse les CVs, score les candidatures, propose un chatbot assistant et gère l'intégralité du cycle de recrutement — de la publication d'offre jusqu'à la décision finale.

---

## Stack Technique

| Couche | Technologie |
|--------|------------|
| Frontend | React 18.x + Vite |
| Routing | React Router DOM |
| Etat global | Zustand |
| HTTP Client | Axios |
| UI Icons | Lucide React |
| Style | CSS3 + Responsive Design |
| Backend | Java 17+ + Spring Boot 3.x |
| Sécurité | Spring Security + JWT + 2FA |
| Base de données | PostgreSQL 12+ |
| ORM | JPA/Hibernate |
| WebSocket | Spring WebSocket |
| Build backend | Maven |

---

```
SkillSet/
├── backend/app/
│   └── src/main/java/com/skillset/
│       ├── controller/          # REST Endpoints
│       ├── service/             # Business Logic
│       ├── repository/          # Data Access
│       ├── entity/              # JPA Entities
│       ├── dto/                 # Data Transfer Objects
│       ├── security/            # JWT + 2FA
│       ├── config/              # WebSocket Config
│       ├── utils/               # CV Parser, Email
│       └── websocket/           # WebSocket Handlers
│
├── frontend/src/
│   ├── pages/                   # Page Components
│   ├── components/
│   │   ├── common/              # Navbar, Footer, Sidebar
│   │   └── ui/                  # Button, Input, Modal...
│   ├── services/                # API Services
│   ├── store/                   # State Management (Zustand)
│   ├── hooks/                   # Custom Hooks
│   ├── styles/                  # Global Styles
│   ├── App.jsx
│   └── main.jsx
│
└── docs/
    ├── API.md                   # REST API Documentation
    ├── DATABASE.md              # Database Schema
    ├── FEATURES.md              # Feature List
    └── DEPLOYMENT.md            # Deployment Guide
```

---

## Fonctionnalités Principales

### ✅ Authentification & Sécurité
- Registration / Login avec JWT
- Two-Factor Authentication (2FA)
- Password Hashing
- Token Refresh

### ✅ Gestion des Offres
- Création et modification d'offres d'emploi
- Recherche avancée avec filtres
- Statuts des offres (OPEN, CLOSED, FILLED)
- Salaires et localisation

### ✅ Candidatures
- Soumission de candidatures
- Questions de screening personnalisées
- CV/Resume upload
- Match score automatique
- Suivi du statut

### ✅ Interviews
- Planification d'interviews
- Types d'interviews (Phone, Video, In-person, Async)
- Lien de réunion
- Feedback et notation

### ✅ Communication
- Messagerie directe
- Notifications en temps réel
- WebSocket pour mises à jour live
- Alertes email

### 🔄 À Implémenter
- IA CV Analysis
- Algorithme de matching IA
- Dashboard Admin
- Analytics & Reporting
- Recommendation Engine

---

## Stack Détaillé

### Backend (Java + Spring Boot)

**Dépendances principales:**
```xml
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-web</artifactId>
</dependency>
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-data-jpa</artifactId>
</dependency>
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-security</artifactId>
</dependency>
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-websocket</artifactId>
</dependency>
<dependency>
    <groupId>io.jsonwebtoken</groupId>
    <artifactId>jjwt</artifactId>
</dependency>
<dependency>
    <groupId>org.postgresql</groupId>
    <artifactId>postgresql</artifactId>
</dependency>
<dependency>
    <groupId>org.projectlombok</groupId>
    <artifactId>lombok</artifactId>
</dependency>
```

### Frontend (React + Vite)

**Dépendances principales:**
```json
{
  "dependencies": {
    "react": "^18.x",
    "react-dom": "^18.x",
    "react-router-dom": "^6.x",
    "zustand": "^4.x",
    "axios": "^1.x",
    "lucide-react": "^latest"
  },
  "devDependencies": {
    "vite": "^5.x",
    "@vitejs/plugin-react": "^4.x"
  }
}
```

---

## Démarrage Rapide

### Prérequis
- Java 17+
- Node.js 16+
- PostgreSQL 12+
- Git

### 1. Clone et Setup Backend

```bash
# Clone repository
git clone <repository-url>
cd SkillSet/backend/app

# Build
mvn clean package

# Run
mvn spring-boot:run
```

Backend disponible: `http://localhost:8080`

### 2. Setup Frontend

```bash
cd SkillSet/frontend

# Install dependencies
npm install

# Run dev server
npm run dev
```

Frontend disponible: `http://localhost:5173`

### 3. Configuration

Créer `.env` files:

**Backend** `.env`:
```
SPRING_DATASOURCE_URL=jdbc:postgresql://localhost:5432/skillset
SPRING_DATASOURCE_USERNAME=postgres
SPRING_DATASOURCE_PASSWORD=password
JWT_SECRET=YourSecureSecret123!@#
JWT_EXPIRATION=86400000
```

**Frontend** `.env`:
```
VITE_API_URL=http://localhost:8080/api
```

---

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register user
- `POST /api/auth/login` - Login
- `GET /api/auth/profile/{userId}` - Get profile
- `PUT /api/auth/profile/{userId}` - Update profile

### Jobs
- `GET /api/jobs` - Get all open jobs
- `GET /api/jobs/search?location=<location>` - Search jobs
- `POST /api/jobs` - Create job
- `GET /api/jobs/{jobId}` - Get job detail

### Applications
- `POST /api/applications` - Submit application
- `GET /api/applications/candidate/{jobSeekerId}` - Get candidate apps
- `PUT /api/applications/{applicationId}/status` - Update status

### Interviews
- `POST /api/interviews` - Schedule interview
- `GET /api/interviews/candidate/{candidateId}` - Get interviews
- `PUT /api/interviews/{interviewId}/feedback` - Add feedback

Voir [API.md](docs/API.md) pour documentation complète

---

## Database Schema

Voir [DATABASE.md](docs/DATABASE.md) pour le schéma complet

**Entités principales:**
- Users
- JobListings
- Applications
- ScreeningQuestions
- ApplicationAnswers
- Messages
- Notifications
- Interviews
- UserPreferences
- Reviews

---

## Deployment

Voir [DEPLOYMENT.md](docs/DEPLOYMENT.md) pour instructions complètes

### Docker (Optionnel)
```bash
docker-compose build
docker-compose up
```

---

## Documentation

| Document | Description |
|----------|------------|
| [API.md](docs/API.md) | Documentation complète des endpoints REST |
| [DATABASE.md](docs/DATABASE.md) | Schéma et relations des tables |
| [FEATURES.md](docs/FEATURES.md) | Liste des fonctionnalités implémentées et prévues |
| [DEPLOYMENT.md](docs/DEPLOYMENT.md) | Guide de déploiement en production |

---

## Contribution

1. Fork le projet
2. Create feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open Pull Request

---

## License

This project is licensed under the MIT License - see LICENSE file for details

---

## Support

Pour des questions ou issues, veuillez ouvrir une issue sur GitHub
        ├── features/
        ├── pages/
        ├── router/
        ├── store/
        ├── hooks/
        ├── layouts/
        └── utils/
```

---

## Architecture backend

Le backend suit les principes de l'Architecture Hexagonale (Ports et Adaptateurs). La logique metier est totalement isolee des outils techniques.

**domain/**
Le coeur du projet. Contient les entites metier (Candidate, JobOffer, Application...) et les regles de gestion. Aucune dependance externe — ni Spring, ni JPA.

**application/**
Les cas d'utilisation. C'est le chef d'orchestre : il appelle le domaine, coordonne les operations, et communique avec l'exterieur via des ports (interfaces).

**infrastructure/persistence/**
Implementation concrete des repositories avec Spring Data JPA et PostgreSQL. Implémente les interfaces definies dans le domaine.

**infrastructure/web/**
Les controleurs REST. Ils recoivent les requetes HTTP, appellent les services de la couche application, et retournent les reponses JSON.

**infrastructure/security/**
Configuration Spring Security, filtres JWT, gestion CORS. Protege les routes selon le role de l'utilisateur (CANDIDATE, EMPLOYER, ADMIN).

**infrastructure/config/**
Configuration des beans Spring, MapStruct, et autres elements transverses.

---

## Architecture frontend

```
src/
│
├── api/                        # Couche communication avec le backend
│   ├── AxiosInstance.js        # Instance Axios + intercepteur JWT automatique
│   ├── AuthApi.js              # Inscription, connexion, token
│   ├── JobApi.js               # Offres d'emploi (CRUD, recherche, filtres)
│   ├── MessageApi.js           # Messagerie entre candidats et employeurs
│   └── AiApi.js                # Analyse CV, matching, chatbot
│
├── components/                 # Composants UI réutilisables
│   ├── common/
│   │   ├── Navbar.jsx          # Barre de navigation principale
│   │   ├── Sidebar.jsx         # Menu lateral / filtres
│   │   └── Footer.jsx          # Pied de page
│   └── ui/
│       ├── Button.jsx          # Bouton avec variantes (primary, secondary...)
│       ├── Input.jsx           # Champ de saisie stylisé
│       ├── Modal.jsx           # Fenetre modale (confirmations, formulaires)
│       ├── Spinner.jsx         # Indicateur de chargement
│       └── Toast.jsx           # Notification temporaire (succès, erreur)
│
├── features/                   # Fonctionnalites metier regroupees par domaine
│   ├── auth/
│   │   ├── LoginForm.jsx       # Formulaire de connexion
│   │   ├── RegisterForm.jsx    # Formulaire d'inscription avec choix de role
│   │   └── SocialAuth.jsx      # Connexion Google / LinkedIn
│   ├── job-board/
│   │   ├── JobCard.jsx         # Carte d'une offre d'emploi
│   │   ├── JobDescription.jsx  # Page detail d'une offre
│   │   └── SearchFilters.jsx   # Filtres (lieu, salaire, contrat, niveau)
│   ├── applications/
│   │   ├── ApplicationPipeline.jsx  # Suivi du statut (postulé, entretien, refusé...)
│   │   └── ApplyButton.jsx          # Bouton candidature avec logique metier
│   ├── matching/
│   │   ├── AiCvAnalyzer.jsx    # Analyse du CV par IA + suggestions
│   │   └── MatchScoreBadge.jsx # Score de correspondance candidat/offre
│   ├── messaging/
│   │   ├── ChatWindow.jsx      # Fenetre de conversation
│   │   ├── ContactList.jsx     # Liste des conversations
│   │   └── MessageBubble.jsx   # Bulle de message individuelle
│   └── chatbot/
│       ├── ChatbotWidget.jsx       # Widget flottant du chatbot IA
│       └── AiAssistantMessage.jsx  # Composant message de l'assistant
│
├── pages/                      # Pages de l'application par acteur
│   ├── candidate/
│   │   ├── CandidateDashboard.jsx  # Tableau de bord : stats, recommandations
│   │   ├── JobSearch.jsx           # Recherche et filtrage d'offres
│   │   ├── MyApplications.jsx      # Suivi de toutes mes candidatures
│   │   └── ProfileSettings.jsx     # Modifier le profil, uploader le CV
│   ├── employer/
│   │   ├── EmployerDashboard.jsx   # Stats offres, candidatures reçues
│   │   ├── PostJobPage.jsx         # Publier une nouvelle offre
│   │   ├── CompanyProfile.jsx      # Page entreprise publique
│   │   └── CandidateReview.jsx     # Consulter et noter les candidats
│   ├── admin/
│   │   ├── AdminStats.jsx          # Statistiques globales de la plateforme
│   │   ├── ModerationPanel.jsx     # Signalements, offres / avis à moderer
│   │   └── UserManagement.jsx      # Gestion des comptes (bloquer, supprimer)
│   └── shared/
│       ├── LoginPage.jsx           # Page de connexion
│       ├── RegisterPage.jsx        # Page d'inscription
│       ├── MessageCenter.jsx       # Centre de messagerie
│       └── NotificationsPage.jsx   # Centre de notifications
│
├── router/
│   ├── AppRouter.jsx           # Toutes les routes de l'application
│   ├── ProtectedRoute.jsx      # Redirige vers /login si non connecté
│   └── RoleGuard.jsx           # Bloque l'accès selon le role (CANDIDATE / EMPLOYER / ADMIN)
│
├── store/                      # Etat global (Zustand)
│   ├── AuthStore.js            # Utilisateur connecté, token JWT, role
│   ├── MessageStore.js         # Conversations, messages, etat du chat
│   └── NotificationStore.js    # Notifications push et alertes systeme
│
├── hooks/                      # Hooks React personnalisés (à implementer)
├── layouts/                    # Layouts partagés par section (à implementer)
└── utils/                      # Fonctions utilitaires, constantes (à implementer)
```

---

## Les 3 acteurs de la plateforme

**Candidat (CANDIDATE)**
Recherche des offres, postule, suit ses candidatures, reçoit un score de matching IA sur chaque offre, communique avec les employeurs via la messagerie.

**Employeur (EMPLOYER)**
Publie et gere ses offres, consulte les candidatures reçues, accede aux profils et CVs, change le statut des candidats dans le pipeline, echange via la messagerie.

**Administrateur (ADMIN)**
Supervise la plateforme, modere les contenus signales, gere les comptes utilisateurs, consulte les statistiques globales.

---

## Installation et demarrage

### Prerequis

- Java 17+
- Maven 3.9+
- Node.js 20+
- PostgreSQL 15+

### Base de donnees

```bash
psql -U postgres

CREATE DATABASE skillstalent;
CREATE USER stuser WITH PASSWORD 'stpass';
GRANT ALL PRIVILEGES ON DATABASE skillstalent TO stuser;
\q
```

### Backend

```bash
cd backend
mvn spring-boot:run
# Demarre sur http://localhost:8080
```

### Frontend

```bash
cd frontend
npm install
npm run dev
# Demarre sur http://localhost:5173
```

---

## Variables d'environnement

### Backend — application.yml

```yaml
spring:
  datasource:
    url: ${DATABASE_URL:jdbc:postgresql://localhost:5432/skillstalent}
    username: ${DATABASE_USER:stuser}
    password: ${DATABASE_PASS:stpass}

app:
  jwt-secret: ${JWT_SECRET}
  jwt-expiration: 86400000

cloudinary:
  cloud-name: ${CLOUDINARY_NAME}
  api-key: ${CLOUDINARY_KEY}
  api-secret: ${CLOUDINARY_SECRET}
```

### Frontend — .env.development

```
VITE_API_URL=http://localhost:8080/api
VITE_WS_URL=http://localhost:8080/ws
```

---

## Endpoints API principaux

Toutes les routes protegees necessitent le header : Authorization: Bearer votre_token_jwt

| Methode | Route | Description |
|---------|-------|-------------|
| POST | /api/auth/register | Inscription |
| POST | /api/auth/login | Connexion + token JWT |
| GET | /api/jobs | Recherche offres avec filtres |
| POST | /api/jobs | Publier une offre (Employeur) |
| POST | /api/applications | Postuler a une offre |
| GET | /api/applications/my | Mes candidatures |
| GET | /api/messages/conversations | Mes conversations |
| POST | /api/ai/analyze-cv | Analyse CV par IA |
| GET | /api/ai/match/:jobId | Score de matching pour une offre |
| GET | /api/admin/stats | Statistiques plateforme (Admin) |

---

## Auteur

TEJOU TIWA Grace Divine
3eme Annee — Filiere Developpement d'Applications
Encadreur : Mr Hassane | Annee academique 2025–2026