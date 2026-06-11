# Product Requirements Document: Login Module Fixed Asset Management

## 1. Product Overview & Goals
- **Executive Summary**: This product implements a secure authentication module for the Fixed Asset Management application used internally. It aims to streamline user access while enforcing stringent security measures.
- **Problem Statement**: Unauthorized access and poor password management pose a security risk to the Fixed Asset Management system. The current authentication lacks centralized control and multi-factor authentication.
- **Key Business Objectives**: Secure the Fixed Asset Management application login process, reduce unauthorized access attempts to zero, and maintain compliance with SEOJK No. 21/SEOJK.03/2017.

## 2. Target Audience & Personas
- **Maker (Admin Aset)**: Initiates asset mutations, writes off books, and adds new assets.
- **Checker (SPV Aset)**: Verifies and approves the requests submitted by Makers.
- **Superadmin TI**: Manages user access rights, monitors anomalous login logs, and unlocks user accounts.

## 3. Scope Boundaries
- **In-Scope Features**: 
  - Active Directory Integration via LDAP
  - Multi-Factor Authentication via WhatsApp and SMS
  - reCAPTCHA v3 anti-automation
  - Account lockout mechanism
  - Idle session timeout
  - Login monitoring dashboard
- **Out-of-Scope Features**:
  - Financial reconciliation modules (non-financial application)
  - Core asset management logic (outside of authentication scope)
  - External user login support

## 4. User Stories & Acceptance Criteria
- **US-1: Active Directory Login**
  - **As an** internal employee (Maker/Checker/Superadmin)
  - **I want** to log in using my Active Directory credentials
  - **So that** I don't have to remember a separate password.
  - **Acceptance Criteria**:
    - **Given** I am on the login page **When** I enter a valid PN and AD password **Then** I am prompted for OTP.

- **US-2: Multi-Factor Authentication**
  - **As an** internal employee
  - **I want** to verify my identity via OTP
  - **So that** my account is protected from unauthorized access.
  - **Acceptance Criteria**:
    - **Given** I entered valid AD credentials **When** the system sends a 6-digit OTP via WhatsApp/SMS **Then** I can input the OTP within 3 minutes to gain access.

- **US-3: Account Lockout**
  - **As a** Superadmin TI
  - **I want** the system to lock user accounts after consecutive failed attempts
  - **So that** brute force attacks are mitigated.
  - **Acceptance Criteria**:
    - **Given** a user attempts to log in **When** they fail 3 times consecutively **Then** the account is locked for 15 minutes.

## 5. Functional & Non-Functional Requirements
- **Functional Requirements**:
  - FR-1: Autentikasi Terintegrasi Active Directory BRI (F-01)
  - FR-2: Multi-Factor Authentication (MFA OTP) via WhatsApp/SMS (F-02)
  - FR-3: Anti-Automation Protection via Captcha (F-03)
  - FR-4: Account Lockout Management (F-04)
  - FR-5: Idle Session Timeout of 15 minutes (F-05)
  - FR-6: Monitoring Dashboard for login success/failure and anomalies.
- **Non-Functional Requirements**:
  - NFR-1: Full compliance with SEOJK No. 21/SEOJK.03/2017 and UU No. 27 Tahun 2022.
  - NFR-2: Passwords must not be stored in the local database.
  - NFR-3: JWT tokens encrypted via AES-256 with short expiration.
  - NFR-4: Ensure input passwords are cleared from memory post-authentication.
  - NFR-5: TLS v1.2 or TLS v1.3 must be used for all login communication.

## 6. Assumptions & Open Risks
- **Assumptions**: The company has a working Active Directory system and available APIs for WhatsApp/SMS gateway integration.
- **Open Risks**: WhatsApp gateway failure might lead to high SMS costs as a fallback.
