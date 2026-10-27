# AI-Driven Personalized Career and Placement Roadmap for College Students

A full-stack, intelligent student career guidance and placement preparation platform built with **React**, **Python Flask**, **SQLite**, and a **Scikit-Learn/TF-IDF Multi-Factor AI Matching Engine**.

---

## 🌟 Key Application Modules

### **Module 1: Student Profile Management**
- **Student Auth & Session:** Registration, Login, and quick 1-click Demo Account switch.
- **Academic Profile:** Department, Year of Study, College Name, Roll Number, CGPA, 10th and 12th percentage tracking.
- **Competency Matrix:** Technical skills with granular proficiency tagging (Beginner, Intermediate, Advanced), Soft Skills tags, and Areas of Interest.
- **Portfolio & Experience:** Academic/personal projects with tech stack tags and GitHub URLs, plus verified certifications.
- **Career Preferences:** Work mode (Hybrid, Remote, Onsite), target company tier, and preferred role.
- **Persistence:** All edits and profile updates save persistently to the SQLite database with validation.

### **Module 2: AI Career Recommendation Engine**
- **Real Algorithmic Matching (0 - 100%):** Does not use fake or randomized scores. Evaluates student against benchmark career roles:
  - Software Developer (SDE)
  - Data Analyst / Business Intelligence
  - AI / ML Engineer
  - Full Stack Web Developer
  - Cybersecurity Analyst
  - Cloud & DevOps Engineer
- **Multi-Factor Weighted Scoring Formula:**
  $$\text{Match Score} = 0.40 \times \text{Tech Skills Overlap} + 0.25 \times \text{TF-IDF Semantic Fit} + 0.15 \times \text{Domain Interests} + 0.10 \times \text{Soft Skills} + 0.10 \times \text{Academic Eligibility}$$
- **Full Explainability:** Clear breakdown of *Why this role is recommended*, highlighting strengths, critical missing skills, and subscore breakdowns.
- **1-Click Goal Target:** Set any recommended role as the student's active target goal, dynamically reconfiguring the learning roadmap and skill gap matrix.

### **Module 3: Skill-Gap Analysis & Proficiency Matrix**
- **Interactive Multi-Axis Radar Chart:** Real-time visual comparison between the student's skill proficiency and industry benchmark requirements.
- **Gap Categorization & Urgency:** Categorizes gaps into **High Priority** (missing core competencies), **Medium Priority**, **Low Priority**, and **Met/Exceeded**.
- **Detailed Matrix Table:** Complete table containing required skill level, student level, core status, and tailored actionable advice.
- **Role Inspector:** Switch to analyze skill gaps for any career path on demand.

### **Module 4: Personalized Sequential Learning Roadmap**
- **Phased Curriculum:** Sequenced in logical pedagogical order:
  - *Phase 1:* Mathematical Foundations & Programming Core
  - *Phase 2:* Classical Machine Learning / Core Domain Architecture
  - *Phase 3:* Deep Learning / Frameworks & Specialized Tools
  - *Phase 4:* Production Deployment, Capstone & Placement Sprints
- **Verified Learning Resources:** Curated links to verified high-quality platforms (freeCodeCamp, MDN Web Docs, Scikit-Learn, PyTorch, MIT OpenCourseWare, GeeksforGeeks).
- **Interactive Progress Toggles:** Click to switch status between *Not Started* $\rightarrow$ *In Progress* $\rightarrow$ *Completed*, persistently updating progress metrics and activity history.

### **Module 5: Project & Certification Recommendations**
- **Industry Projects:** Curated projects with architecture summaries, starter GitHub repo references, difficulty ratings, estimated durations, and portfolio deliverables.
- **Recognized Certifications:** Industry credentials (AWS, Meta, CompTIA, Google, Oracle, freeCodeCamp) with exam codes, preparation timelines, cost structures, and official registration links.

### **Module 6: Placement Preparation & Diagnostic Assessment**
- **Interactive Practice Quizzes:**
  - Quantitative Aptitude
  - Logical Reasoning
  - Verbal Ability
  - Technical Core CS (OOP, DBMS, OS, Computer Networks)
  - Coding Practice (Algorithms & Complexity)
- **Live Grading Engine:** Real-time percentage scoring, answer evaluations, and comprehensive step-by-step mathematical/architectural explanations.
- **Behavioral & HR Interview Guide:** The **STAR Framework** (Situation, Task, Action, Result) with standard campus interview prompts, model answer delivery scripts, and critical Do's & Don'ts.

### **Module 7: Progress Tracking & Activity Audit Trail**
- **Holistic Placement Readiness Score:** Real-time composite metric aggregating roadmap completion, skill gap closures, test scores, and CGPA.
- **Category Diagnostic Performance:** Track historical best and average quiz scores across tracks.
- **Audit Trail:** Timestamped log of all completed roadmap topics, quiz attempts, and profile modifications stored in SQLite.

---

## 🛠️ Technology Stack

| Layer | Technologies Used |
|---|---|
| **Frontend** | React 18, Vite, Lucide Icons, Pure SVG Radar Visualizations, Vanilla Responsive CSS |
| **Backend** | Python 3.12, Flask, Flask-CORS, Werkzeug Security |
| **AI / ML** | Scikit-Learn (TF-IDF Vectorizer, Cosine Similarity), NumPy |
| **Database** | SQLite3 (`career_roadmap.db`) with relational schema |

---

## 🚀 Running the Application Locally

### 1. Start the Flask Backend Server
```powershell
cd "backend"
# Run with Python 3.12
python app.py
```
*The Flask REST API will start at:* `http://127.0.0.1:5000`

### 2. Start the Vite React Frontend
```powershell
cd "frontend"
npm.cmd run dev
```
*The web application will be accessible at:* `http://localhost:5173/`

### 3. Quick Demo Login Credentials
- **Email:** `demo@student.edu`
- **Password:** `Password123`
*(Or click the **"Use Demo Account"** button in the sign-in modal for 1-click access)*
