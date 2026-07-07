# Architecture Hexagonale du Backend SkillSet

## Structure Complète

```
com/skillset/
│
├── domain/                          # ✅ COUCHE MÉTIER (Cœur)
│   ├── entity/                      # Entités JPA
│   │   ├── User.java
│   │   ├── JobListing.java
│   │   ├── Application.java
│   │   ├── ScreeningQuestion.java
│   │   ├── ApplicationAnswer.java
│   │   ├── Message.java
│   │   ├── Notification.java
│   │   ├── Review.java
│   │   ├── UserPreferences.java
│   │   └── Interview.java
│   │
│   └── port/                        # Interfaces des ports (contrats)
│       ├── UserRepositoryPort.java
│       ├── JobRepositoryPort.java
│       ├── ApplicationRepositoryPort.java
│       ├── ScreeningQuestionRepositoryPort.java
│       ├── MessageRepositoryPort.java
│       └── InterviewRepositoryPort.java
│
├── application/                     # ✅ COUCHE APPLICATION (Orchestration)
│   ├── dto/                         # Data Transfer Objects
│   │   ├── UserDTO.java
│   │   ├── JobListingDTO.java
│   │   ├── ApplicationDTO.java
│   │   ├── ScreeningQuestionDTO.java
│   │   ├── ApplicationAnswerDTO.java
│   │   └── MessageDTO.java
│   │
│   └── service/                     # Services d'application (Cas d'usage)
│       ├── AuthService.java
│       ├── JobService.java
│       ├── ApplicationService.java
│       ├── ScreeningQuestionService.java
│       ├── MessageService.java
│       ├── UserPreferencesService.java
│       └── InterviewService.java
│
├── infrastructure/                  # ✅ COUCHE INFRASTRUCTURE (Adapters)
│   ├── persistence/                 # Implémentation des repositories
│   │   ├── UserRepository.java      # Implémente UserRepositoryPort
│   │   ├── JobListingRepository.java
│   │   ├── ApplicationRepository.java
│   │   ├── ScreeningQuestionRepository.java
│   │   ├── ApplicationAnswerRepository.java
│   │   ├── MessageRepository.java
│   │   └── InterviewRepository.java
│   │
│   ├── config/                      # Configuration Spring
│   │   ├── WebSocketConfig.java
│   │   ├── JpaConfig.java
│   │   └── ApplicationConfig.java   # (beans)
│   │
│   ├── security/                    # Sécurité JWT + 2FA
│   │   ├── JwtUtil.java
│   │   └── JwtFilter.java
│   │
│   └── util/                        # Utilitaires
│       ├── CVParserUtil.java
│       └── EmailUtil.java
│
└── interfaces/                      # ✅ COUCHE PRÉSENTATION (Adapters)
    └── controller/                  # REST Controllers
        ├── AuthController.java
        ├── JobController.java
        ├── ApplicationController.java
        ├── ScreeningQuestionController.java
        ├── MessageController.java
        └── InterviewController.java
```

## Principes de l'Architecture Hexagonale

### 1️⃣ **Domain Layer** (Cœur métier)
- Contient les **entités métier** indépendantes de tout framework
- Définit les **interfaces des ports** (contrats)
- **Pas de dépendances** vers les couches externes
- Les entités JPA vivent ici (c'est acceptable en architecture moderne)

### 2️⃣ **Application Layer** (Orchestration)
- Implémente les **cas d'usage**
- Les **services** orchestrent la logique métier
- Les **DTOs** structurent les données échangées
- Dépend de la couche `domain` uniquement

### 3️⃣ **Infrastructure Layer** (Implémentation techniques)
- Implémente les **interfaces des ports** (repositories)
- Contient la **configuration** (Spring, JPA, WebSocket)
- Gère la **sécurité** (JWT, authentification)
- Contient les **utilitaires** techniques
- Peut dépendre de frameworks externes

### 4️⃣ **Interfaces Layer** (Exposition)
- Les **controllers** REST exposent les endpoints
- Convertit les requêtes HTTP en appels métier
- Les controllers dépendent de la couche `application` uniquement

## Flux des Dépendances

```
Interfaces ──→ Application ──→ Domain
              ↓
          Infrastructure ──→ Domain
```

**Les flèches pointent toujours vers l'intérieur (vers le Domain)**

## Fichiers à Placer

### ✅ À Déplacer vers `domain/entity/`
- `User.java`
- `JobListing.java`
- `Application.java`
- `ScreeningQuestion.java`
- `ApplicationAnswer.java`
- `Message.java`
- `Notification.java`
- `Review.java`
- `UserPreferences.java`
- `Interview.java`

### ✅ À Déplacer vers `application/dto/`
- `UserDTO.java`
- `JobListingDTO.java`
- `ApplicationDTO.java`
- `ScreeningQuestionDTO.java`
- `ApplicationAnswerDTO.java`
- `MessageDTO.java`

### ✅ À Déplacer vers `application/service/`
- `AuthService.java`
- `JobService.java`
- `ApplicationService.java`
- `ScreeningQuestionService.java`
- `MessageService.java`
- `UserPreferencesService.java`
- `InterviewService.java`

### ✅ À Déplacer vers `infrastructure/persistence/`
- `UserRepository.java`
- `JobListingRepository.java`
- `ApplicationRepository.java`
- `ScreeningQuestionRepository.java`
- `ApplicationAnswerRepository.java`
- `MessageRepository.java`
- `InterviewRepository.java`

### ✅ À Déplacer vers `infrastructure/security/`
- `JwtUtil.java`
- `JwtFilter.java`

### ✅ À Déplacer vers `infrastructure/config/`
- `WebSocketConfig.java`

### ✅ À Déplacer vers `infrastructure/util/`
- `CVParserUtil.java`
- `EmailUtil.java`

### ✅ À Déplacer vers `interfaces/controller/`
- `AuthController.java`
- `JobController.java`
- `ApplicationController.java`
- `ScreeningQuestionController.java`
- `MessageController.java`
- `InterviewController.java`

## Avantages de cette Architecture

✅ **Isolation du métier** - Domain indépendant de tout framework
✅ **Testabilité** - Facile de tester sans infrastructure
✅ **Flexibilité** - Changement facile de la base de données
✅ **Maintenabilité** - Code organisé et clair
✅ **Scalabilité** - Structure prête pour les évolutions

## Prochaines Étapes

1. Vérifier les imports dans les fichiers (utiliser les chemins corrects)
2. Ajouter les annotations JPA aux entités dans `domain/entity/`
3. Implémenter les interfaces des ports dans `infrastructure/persistence/`
4. Configurer les services pour dépendre des ports
5. Mettre à jour les controllers pour utiliser les services

---
