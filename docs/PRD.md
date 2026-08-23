# AI Interview Simulator MVP PRD

> 文档职责：记录当前 MVP 的产品目标、用户流程、功能边界和后续方向。当前实现以 Next.js + DeepSeek、6 道问题、逐题提交回答、最终整体评价为准。

## 1. Product Overview

AI Interview Simulator is a personal interview preparation tool. Users provide a target job description and their resume, then the product generates a customized mock interview, collects answers, and returns structured feedback.

The MVP focuses on validating one core value:

> Can AI help a job seeker prepare for a specific role with relevant questions and useful feedback?

## 2. Target User

Primary user:

- A job seeker preparing for an upcoming interview.
- Has a specific job description in hand.
- Wants to know what questions may be asked and how to improve their answers.

Early user scenarios:

- The user wants to practice for a role before a real interview.
- The user wants to understand gaps between their resume and the job requirements.
- The user wants feedback on whether their answers sound convincing.

## 3. MVP Goal

Build a simple web-based demo that completes the full interview preparation flow:

1. User enters a job description.
2. User enters resume content.
3. AI generates interview questions.
4. User answers the questions in text.
5. AI generates a final evaluation report.

The first version should prioritize a complete, useful workflow over advanced features.

## 4. Core User Flow

1. User opens the app homepage at `/`.
2. The homepage shows the product entry, login/register entry, interview entry, and current authentication status.
3. If the user is not logged in, the user goes to `/login` to sign up or log in.
4. After authentication, the user can enter `/interview` from the homepage or direct route.
5. User pastes the job description.
6. User pastes resume text.
7. User clicks "Start Mock Interview".
8. The system generates 6 interview questions.
9. User answers questions one by one.
10. User submits each answer separately.
11. The system generates a final report.
12. User reviews strengths, weaknesses, and improvement suggestions.

## 5. MVP Features

### 5.0 Homepage, Entry, and Authentication

The product uses a basic homepage as the first product entry. Supabase Auth protects the interview workspace and prepares for later cloud history, without changing the core AI interview flow.

MVP behavior:

- Show a `/` homepage with basic product entry information and a polished first-screen hero.
- Show `/login` and `/interview` entry points on the homepage hero.
- Show whether the user is logged in; if logged in, show basic account information such as email.
- Keep homepage navigation limited to real available destinations; do not show fake future-feature buttons.
- Support email and password signup on `/login`.
- Support email and password login on `/login`.
- Keep the user signed in after refresh.
- When an unauthenticated user clicks the homepage `/interview` entry, send them directly to `/login`; direct unauthenticated access to `/interview` should also return to `/login`.
- Provide logout from the authenticated experience.

Out of scope for this MVP stage:

- Complex marketing landing page
- Cloud-synced interview history
- User profile page
- Password reset customization
- Third-party OAuth login
- Roles or permissions
- Payment or usage limits
- Custom password storage or custom session implementation

### 5.1 Job Description Input

User can paste a job description into a text area.

Required fields for MVP:

- Job description raw text

Optional later fields:

- Job title
- Company name
- Seniority level
- Interview language

### 5.2 Resume Input

User can paste resume content into a text area.

Required fields for MVP:

- Resume raw text

Out of scope for MVP:

- PDF upload
- DOCX upload
- Resume format parsing
- Resume editor

### 5.3 Question Generation

The system generates role-specific interview questions based on the job description and resume.

Question types should include:

- Background and experience questions
- Technical or skill-based questions
- Project deep-dive questions
- Behavioral questions
- Role-fit questions

MVP output:

- 6 questions
- Each question has a short reason explaining why it was asked

### 5.4 Answer Collection

User answers each question in text.

MVP behavior:

- Display questions in a list for the current MVP; step-by-step interviewing can be reconsidered later
- Provide one text area per answer
- Allow the user to submit each answer separately

Out of scope for MVP:

- Voice input
- Video recording
- Real-time follow-up questions
- Timer

### 5.5 Final Evaluation

After submission, AI generates a structured evaluation report.

Report sections:

- Overall interview score
- Role match summary
- Key strengths
- Main weaknesses or risk areas
- Answer quality feedback
- Resume and job requirement gap analysis
- Suggested improvement actions
- Recommended follow-up practice questions

## 6. Non-Goals

The MVP will not include:

- Payment
- Admin dashboard
- Enterprise hiring workflow
- Interview scheduling
- Real-time voice conversation
- Video interview analysis
- Complex resume parsing
- Account-based or cloud-synced persistent interview history
- Multi-model scoring comparison

These features can be considered after the core workflow proves useful.

## 7. Suggested Data Model

```text
JobPost
- id
- raw_text
- created_at

Resume
- id
- raw_text
- created_at

InterviewSession
- id
- job_post_id
- resume_id
- questions
- answers
- final_feedback
- created_at

InterviewQuestion
- id
- question
- category
- reason

InterviewAnswer
- question_id
- answer_text
```

For the earliest prototype, this can live in memory or local state. A database can be added after the basic product loop works.

## 8. AI Prompting Requirements

### Question Generation Prompt

Input:

- Job description
- Resume text

Output:

- 6 interview questions
- Category for each question
- Reason for each question

The model should focus on the specific match between the resume and the job description instead of producing generic interview questions.

### Final Evaluation Prompt

Input:

- Job description
- Resume text
- Generated questions
- User answers

Output:

- Overall score
- Strengths
- Weaknesses
- Role match analysis
- Answer-by-answer feedback
- Concrete improvement suggestions
- Recommended next practice questions

The feedback should be direct, constructive, and specific.

## 9. Success Criteria

The MVP is successful if:

- A user can complete the full flow without guidance.
- Generated questions feel relevant to the job and resume.
- Final feedback contains specific, actionable advice.
- The whole session can be completed in less than 15 minutes.
- The product is useful even without cloud history, uploads, or voice features.

## 10. First Build Milestone

Milestone 1: Text-only prototype

Deliverables:

- Single web page or simple multi-step UI
- Job description text input
- Resume text input
- AI-generated question list
- Answer text areas
- Final evaluation report

Recommended tech stack:

- Frontend: Next.js or React
- Backend: Next.js API routes
- AI provider: DeepSeek API
- Database: none for first prototype, then SQLite or Supabase later

## 11. Open Questions

- Should the product start in Chinese, English, or support both?
- Should the first version optimize for software engineering interviews or general job interviews?
- Should the product later evolve from the current question-list flow into one-question-at-a-time interviewing?
- Should scores be strict and numeric, or more coaching-oriented?
- Should interview sessions be saved locally after the first prototype?
