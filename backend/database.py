import sqlite3
import json
import os
from werkzeug.security import generate_password_hash

DB_PATH = os.path.join(os.path.dirname(__file__), "career_roadmap.db")

def get_db():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    conn = get_db()
    cursor = conn.cursor()

    # 1. Students Table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS students (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        email TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        full_name TEXT NOT NULL,
        department TEXT NOT NULL,
        year_of_study TEXT NOT NULL,
        roll_no TEXT,
        cgpa REAL DEFAULT 7.5,
        tenth_marks REAL DEFAULT 85.0,
        twelfth_marks REAL DEFAULT 85.0,
        college_name TEXT DEFAULT 'National Institute of Technology',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
    """)

    # 2. Student Profiles Table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS student_profiles (
        student_id INTEGER PRIMARY KEY,
        technical_skills TEXT NOT NULL DEFAULT '[]', -- JSON: [{name: 'Python', level: 'Intermediate', years: 2}]
        soft_skills TEXT NOT NULL DEFAULT '[]',      -- JSON: ['Communication', 'Teamwork']
        interests TEXT NOT NULL DEFAULT '[]',        -- JSON: ['Artificial Intelligence', 'Web Development']
        projects TEXT NOT NULL DEFAULT '[]',         -- JSON: [{title: '...', description: '...', tech_stack: ['...']}]
        certifications TEXT NOT NULL DEFAULT '[]',   -- JSON: [{title: '...', provider: '...', year: 2024}]
        career_preferences TEXT NOT NULL DEFAULT '{}', -- JSON: {work_mode: 'Remote', company_type: 'Product', preferred_role: 'AI/ML Engineer'}
        selected_goal_role TEXT DEFAULT 'AI/ML Engineer',
        bio TEXT DEFAULT 'Aspiring engineer passionate about building intelligent systems and solving real-world challenges.',
        FOREIGN KEY(student_id) REFERENCES students(id) ON DELETE CASCADE
    )
    """)

    # 3. Career Roles Table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS career_roles (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        category TEXT NOT NULL,
        description TEXT NOT NULL,
        required_technical_skills TEXT NOT NULL, -- JSON: [{name: 'Python', level: 'Advanced', weight: 1.0, is_core: true}]
        required_soft_skills TEXT NOT NULL,      -- JSON: ['Analytical Thinking', 'Problem Solving']
        target_cgpa REAL DEFAULT 7.0,
        industry_demand TEXT DEFAULT 'High',
        avg_salary_range TEXT DEFAULT '6 - 15 LPA',
        icon_name TEXT DEFAULT 'BrainCircuit',
        typical_responsibilities TEXT NOT NULL
    )
    """)

    # 4. Learning Resources Table (Personalized Roadmap Topics)
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS learning_resources (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        role_id TEXT NOT NULL,
        skill_name TEXT NOT NULL,
        topic_title TEXT NOT NULL,
        phase_num INTEGER NOT NULL,
        phase_title TEXT NOT NULL,
        description TEXT NOT NULL,
        learning_objectives TEXT NOT NULL, -- JSON list of strings
        duration_hours INTEGER NOT NULL,
        difficulty TEXT NOT NULL,          -- 'Beginner', 'Intermediate', 'Advanced'
        resource_url TEXT NOT NULL,
        provider TEXT NOT NULL,
        is_verified BOOLEAN DEFAULT 1,
        FOREIGN KEY(role_id) REFERENCES career_roles(id)
    )
    """)

    # 5. Projects Catalog Table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS projects_catalog (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        role_id TEXT NOT NULL,
        title TEXT NOT NULL,
        description TEXT NOT NULL,
        skills_developed TEXT NOT NULL, -- JSON list
        difficulty TEXT NOT NULL,
        estimated_duration TEXT NOT NULL,
        repo_starter_url TEXT NOT NULL,
        architecture_summary TEXT NOT NULL,
        key_deliverables TEXT NOT NULL, -- JSON list
        FOREIGN KEY(role_id) REFERENCES career_roles(id)
    )
    """)

    # 6. Certifications Catalog Table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS certifications_catalog (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        role_id TEXT NOT NULL,
        title TEXT NOT NULL,
        provider TEXT NOT NULL,
        skills_covered TEXT NOT NULL, -- JSON list
        cost_type TEXT NOT NULL,      -- 'Free', 'Paid with Free Tier', 'Paid'
        prep_time_weeks INTEGER NOT NULL,
        exam_code TEXT,
        official_url TEXT NOT NULL,
        industry_recognition TEXT DEFAULT 'Global',
        FOREIGN KEY(role_id) REFERENCES career_roles(id)
    )
    """)

    # 7. Placement Questions Table (Aptitude, Reasoning, Verbal, Technical, Coding)
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS placement_questions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        category TEXT NOT NULL,      -- 'Aptitude', 'Logical Reasoning', 'Verbal Ability', 'Technical Core', 'Coding Practice'
        subcategory TEXT NOT NULL,   -- e.g., 'Percentages', 'Data Structures', 'DBMS'
        question_text TEXT NOT NULL,
        code_snippet TEXT,
        options TEXT NOT NULL,       -- JSON list: ["Option A", "Option B", "Option C", "Option D"]
        correct_option_index INTEGER NOT NULL,
        explanation TEXT NOT NULL,
        difficulty TEXT NOT NULL     -- 'Easy', 'Medium', 'Hard'
    )
    """)

    # 8. HR Interview Questions Table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS hr_interview_questions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        category TEXT NOT NULL,       -- 'Behavioral', 'Situational', 'Leadership', 'General HR'
        question_text TEXT NOT NULL,
        context_objective TEXT NOT NULL,
        star_approach TEXT NOT NULL,  -- JSON: {situation: '...', task: '...', action: '...', result: '...'}
        sample_answer TEXT NOT NULL,
        dos_and_donts TEXT NOT NULL   -- JSON: {dos: [...], donts: [...]}
    )
    """)

    # 9. User Roadmap Progress
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS user_roadmap_progress (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        student_id INTEGER NOT NULL,
        resource_id INTEGER NOT NULL,
        status TEXT DEFAULT 'not_started', -- 'not_started', 'in_progress', 'completed'
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(student_id, resource_id),
        FOREIGN KEY(student_id) REFERENCES students(id) ON DELETE CASCADE,
        FOREIGN KEY(resource_id) REFERENCES learning_resources(id)
    )
    """)

    # 10. User Placement Quiz Attempts
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS user_placement_attempts (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        student_id INTEGER NOT NULL,
        category TEXT NOT NULL,
        subcategory TEXT,
        score INTEGER NOT NULL,
        total_questions INTEGER NOT NULL,
        percentage REAL NOT NULL,
        answers_json TEXT NOT NULL,
        completed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY(student_id) REFERENCES students(id) ON DELETE CASCADE
    )
    """)

    # 11. User Activity Log
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS user_activity_log (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        student_id INTEGER NOT NULL,
        activity_type TEXT NOT NULL, -- 'roadmap_completed', 'quiz_attempted', 'profile_updated', 'role_changed'
        activity_title TEXT NOT NULL,
        details TEXT,
        timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY(student_id) REFERENCES students(id) ON DELETE CASCADE
    )
    """)

    conn.commit()
    conn.close()
    print("Database tables initialized successfully.")

if __name__ == "__main__":
    init_db()
