import os
import json
import sqlite3
from flask import Flask, request, jsonify
from flask_cors import CORS
from werkzeug.security import generate_password_hash, check_password_hash
from database import get_db, init_db
from ai_engine import calculate_career_recommendations, perform_skill_gap_analysis

app = Flask(__name__)
# Enable CORS for frontend development
CORS(app, resources={r"/api/*": {"origins": "*"}})

# Ensure database is initialized
init_db()

def query_db(query, args=(), one=False):
    conn = get_db()
    cur = conn.cursor()
    cur.execute(query, args)
    rv = cur.fetchall()
    conn.commit()
    conn.close()
    return (rv[0] if rv else None) if one else rv

def get_current_student_id():
    # Supports simple Authorization header 'Bearer <id>' or query/body fallback
    auth_header = request.headers.get("Authorization", "")
    if auth_header.startswith("Bearer "):
        try:
            return int(auth_header.split(" ")[1])
        except (ValueError, IndexError):
            pass
    # Fallback to query param or default demo student ID 1
    return int(request.args.get("student_id", 1))

# ==========================================
# MODULE 1: AUTHENTICATION & STUDENT PROFILE
# ==========================================

@app.route("/api/auth/register", methods=["POST"])
def register():
    data = request.get_json() or {}
    email = data.get("email", "").strip().lower()
    password = data.get("password", "")
    full_name = data.get("full_name", "").strip()
    department = data.get("department", "").strip()
    year_of_study = data.get("year_of_study", "").strip()
    roll_no = data.get("roll_no", "").strip()
    cgpa = data.get("cgpa", 7.0)
    tenth_marks = data.get("tenth_marks", 80.0)
    twelfth_marks = data.get("twelfth_marks", 80.0)
    college_name = data.get("college_name", "Engineering College").strip()

    # Validations
    if not email or "@" not in email:
        return jsonify({"error": "A valid email address is required."}), 400
    if not password or len(password) < 6:
        return jsonify({"error": "Password must be at least 6 characters long."}), 400
    if not full_name:
        return jsonify({"error": "Full name is required."}), 400
    if not department:
        return jsonify({"error": "Department is required."}), 400
    if not year_of_study:
        return jsonify({"error": "Year of study is required."}), 400

    conn = get_db()
    cur = conn.cursor()
    
    # Check if student exists
    cur.execute("SELECT id FROM students WHERE email = ?", (email,))
    if cur.fetchone():
        conn.close()
        return jsonify({"error": "An account with this email already exists."}), 409

    pwd_hash = generate_password_hash(password)
    cur.execute("""
    INSERT INTO students (email, password_hash, full_name, department, year_of_study, roll_no, cgpa, tenth_marks, twelfth_marks, college_name)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, (email, pwd_hash, full_name, department, year_of_study, roll_no, float(cgpa), float(tenth_marks), float(twelfth_marks), college_name))
    
    student_id = cur.lastrowid

    # Create empty profile
    cur.execute("""
    INSERT INTO student_profiles (student_id, technical_skills, soft_skills, interests, projects, certifications, career_preferences, selected_goal_role)
    VALUES (?, '[]', '[]', '[]', '[]', '[]', '{}', 'software_developer')
    """, (student_id,))

    # Log activity
    cur.execute("""
    INSERT INTO user_activity_log (student_id, activity_type, activity_title, details)
    VALUES (?, 'account_created', 'Welcome to Career Roadmap Platform', 'Registered student profile')
    """, (student_id,))

    conn.commit()
    conn.close()

    return jsonify({
        "message": "Registration successful!",
        "student": {
            "id": student_id,
            "email": email,
            "full_name": full_name,
            "department": department,
            "year_of_study": year_of_study,
            "cgpa": cgpa
        },
        "token": f"{student_id}"
    }), 201

@app.route("/api/auth/login", methods=["POST"])
def login():
    data = request.get_json() or {}
    email = data.get("email", "").strip().lower()
    password = data.get("password", "")

    if not email or not password:
        return jsonify({"error": "Email and password are required."}), 400

    conn = get_db()
    cur = conn.cursor()
    cur.execute("SELECT * FROM students WHERE email = ?", (email,))
    student = cur.fetchone()
    conn.close()

    if not student or not check_password_hash(student["password_hash"], password):
        return jsonify({"error": "Invalid email or password."}), 401

    return jsonify({
        "message": "Login successful!",
        "student": {
            "id": student["id"],
            "email": student["email"],
            "full_name": student["full_name"],
            "department": student["department"],
            "year_of_study": student["year_of_study"],
            "roll_no": student["roll_no"],
            "cgpa": student["cgpa"],
            "tenth_marks": student["tenth_marks"],
            "twelfth_marks": student["twelfth_marks"],
            "college_name": student["college_name"]
        },
        "token": f"{student['id']}"
    }), 200

@app.route("/api/profile", methods=["GET"])
def get_profile():
    student_id = get_current_student_id()
    conn = get_db()
    cur = conn.cursor()

    cur.execute("SELECT * FROM students WHERE id = ?", (student_id,))
    student = cur.fetchone()
    if not student:
        conn.close()
        return jsonify({"error": "Student not found"}), 404

    cur.execute("SELECT * FROM student_profiles WHERE student_id = ?", (student_id,))
    profile = cur.fetchone()
    conn.close()

    profile_dict = dict(profile) if profile else {}
    for key in ["technical_skills", "soft_skills", "interests", "projects", "certifications", "career_preferences"]:
        if key in profile_dict and isinstance(profile_dict[key], str):
            try:
                profile_dict[key] = json.loads(profile_dict[key])
            except Exception:
                profile_dict[key] = [] if key != "career_preferences" else {}

    student_dict = dict(student)
    del student_dict["password_hash"]

    return jsonify({
        "student": student_dict,
        "profile": profile_dict
    })

@app.route("/api/profile", methods=["PUT"])
def update_profile():
    student_id = get_current_student_id()
    data = request.get_json() or {}

    student_data = data.get("student", {})
    profile_data = data.get("profile", {})

    conn = get_db()
    cur = conn.cursor()

    # Update student base table
    cur.execute("""
    UPDATE students SET
        full_name = COALESCE(?, full_name),
        department = COALESCE(?, department),
        year_of_study = COALESCE(?, year_of_study),
        roll_no = COALESCE(?, roll_no),
        cgpa = COALESCE(?, cgpa),
        tenth_marks = COALESCE(?, tenth_marks),
        twelfth_marks = COALESCE(?, twelfth_marks),
        college_name = COALESCE(?, college_name)
    WHERE id = ?
    """, (
        student_data.get("full_name"),
        student_data.get("department"),
        student_data.get("year_of_study"),
        student_data.get("roll_no"),
        float(student_data.get("cgpa")) if student_data.get("cgpa") is not None else None,
        float(student_data.get("tenth_marks")) if student_data.get("tenth_marks") is not None else None,
        float(student_data.get("twelfth_marks")) if student_data.get("twelfth_marks") is not None else None,
        student_data.get("college_name"),
        student_id
    ))

    # Update profile table
    tech_skills = json.dumps(profile_data.get("technical_skills", []))
    soft_skills = json.dumps(profile_data.get("soft_skills", []))
    interests = json.dumps(profile_data.get("interests", []))
    projects = json.dumps(profile_data.get("projects", []))
    certs = json.dumps(profile_data.get("certifications", []))
    preferences = json.dumps(profile_data.get("career_preferences", {}))
    selected_role = profile_data.get("selected_goal_role", "ai_ml_engineer")
    bio = profile_data.get("bio", "")

    cur.execute("""
    INSERT OR REPLACE INTO student_profiles 
    (student_id, technical_skills, soft_skills, interests, projects, certifications, career_preferences, selected_goal_role, bio)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, (student_id, tech_skills, soft_skills, interests, projects, certs, preferences, selected_role, bio))

    # Log activity
    cur.execute("""
    INSERT INTO user_activity_log (student_id, activity_type, activity_title, details)
    VALUES (?, 'profile_updated', 'Updated Student Profile & Skills', 'Saved revised skills, academic info and project list')
    """, (student_id,))

    conn.commit()
    conn.close()

    return jsonify({"message": "Profile updated successfully!"}), 200

# ==========================================
# MODULE 2: AI CAREER RECOMMENDATION
# ==========================================

@app.route("/api/recommendations", methods=["GET"])
def get_recommendations():
    student_id = get_current_student_id()
    conn = get_db()
    cur = conn.cursor()

    cur.execute("SELECT * FROM students WHERE id = ?", (student_id,))
    student = cur.fetchone()
    if not student:
        conn.close()
        return jsonify({"error": "Student not found"}), 404

    cur.execute("SELECT * FROM student_profiles WHERE student_id = ?", (student_id,))
    profile = cur.fetchone()
    if not profile:
        conn.close()
        return jsonify({"error": "Student profile not found"}), 404

    cur.execute("SELECT * FROM career_roles")
    roles = [dict(r) for r in cur.fetchall()]
    conn.close()

    # Calculate real AI recommendations using TF-IDF and multi-factor scoring
    recommendations = calculate_career_recommendations(dict(student), dict(profile), roles)

    return jsonify({
        "student_id": student_id,
        "recommendations": recommendations
    })

@app.route("/api/career-roles", methods=["GET"])
def get_all_roles():
    conn = get_db()
    cur = conn.cursor()
    cur.execute("SELECT * FROM career_roles")
    roles = [dict(r) for r in cur.fetchall()]
    conn.close()

    for r in roles:
        r["required_technical_skills"] = json.loads(r["required_technical_skills"])
        r["required_soft_skills"] = json.loads(r["required_soft_skills"])

    return jsonify(roles)

@app.route("/api/career-roles/<role_id>/select-goal", methods=["POST"])
def select_goal_role(role_id):
    student_id = get_current_student_id()
    conn = get_db()
    cur = conn.cursor()

    # Verify role exists
    cur.execute("SELECT title FROM career_roles WHERE id = ?", (role_id,))
    role = cur.fetchone()
    if not role:
        conn.close()
        return jsonify({"error": "Role does not exist"}), 404

    cur.execute("""
    UPDATE student_profiles SET selected_goal_role = ? WHERE student_id = ?
    """, (role_id, student_id))

    cur.execute("""
    INSERT INTO user_activity_log (student_id, activity_type, activity_title, details)
    VALUES (?, 'role_changed', 'Target Career Goal Set', ?)
    """, (student_id, f"Switched target career focus to {role['title']}"))

    conn.commit()
    conn.close()

    return jsonify({"message": f"Successfully set target career goal to {role['title']}"})

# ==========================================
# MODULE 3: SKILL-GAP ANALYSIS
# ==========================================

@app.route("/api/skill-gap/<role_id>", methods=["GET"])
def get_skill_gap(role_id):
    student_id = get_current_student_id()
    conn = get_db()
    cur = conn.cursor()

    cur.execute("SELECT * FROM students WHERE id = ?", (student_id,))
    student = cur.fetchone()
    cur.execute("SELECT * FROM student_profiles WHERE student_id = ?", (student_id,))
    profile = cur.fetchone()

    cur.execute("SELECT * FROM career_roles WHERE id = ?", (role_id,))
    role = cur.fetchone()
    conn.close()

    if not role:
        return jsonify({"error": "Career role not found"}), 404
    if not student or not profile:
        return jsonify({"error": "Student or profile not found"}), 404

    analysis = perform_skill_gap_analysis(dict(student), dict(profile), dict(role))
    return jsonify(analysis)

# ==========================================
# MODULE 4: PERSONALIZED LEARNING ROADMAP
# ==========================================

@app.route("/api/roadmap/<role_id>", methods=["GET"])
def get_roadmap(role_id):
    student_id = get_current_student_id()
    conn = get_db()
    cur = conn.cursor()

    # Fetch resources for this role ordered logically by phase and id
    cur.execute("""
    SELECT r.*, COALESCE(p.status, 'not_started') as user_status
    FROM learning_resources r
    LEFT JOIN user_roadmap_progress p ON p.resource_id = r.id AND p.student_id = ?
    WHERE r.role_id = ?
    ORDER BY r.phase_num ASC, r.id ASC
    """, (student_id, role_id))

    items = [dict(row) for row in cur.fetchall()]
    conn.close()

    # Group by Phase
    phases_dict = {}
    for item in items:
        item["learning_objectives"] = json.loads(item["learning_objectives"])
        phase_num = item["phase_num"]
        phase_title = item["phase_title"]
        if phase_num not in phases_dict:
            phases_dict[phase_num] = {
                "phase_num": phase_num,
                "phase_title": phase_title,
                "items": []
            }
        phases_dict[phase_num]["items"].append(item)

    phases_list = sorted(list(phases_dict.values()), key=lambda p: p["phase_num"])

    total_items = len(items)
    completed_items = sum(1 for it in items if it["user_status"] == "completed")
    in_progress_items = sum(1 for it in items if it["user_status"] == "in_progress")
    roadmap_progress_pct = round((completed_items / max(total_items, 1)) * 100.0, 1)

    return jsonify({
        "role_id": role_id,
        "total_items": total_items,
        "completed_items": completed_items,
        "in_progress_items": in_progress_items,
        "roadmap_progress_pct": roadmap_progress_pct,
        "phases": phases_list
    })

@app.route("/api/roadmap/item/<int:item_id>/status", methods=["POST"])
def update_roadmap_item_status(item_id):
    student_id = get_current_student_id()
    data = request.get_json() or {}
    new_status = data.get("status", "completed") # 'not_started', 'in_progress', 'completed'

    if new_status not in ["not_started", "in_progress", "completed"]:
        return jsonify({"error": "Invalid status value"}), 400

    conn = get_db()
    cur = conn.cursor()

    # Check resource
    cur.execute("SELECT topic_title FROM learning_resources WHERE id = ?", (item_id,))
    res = cur.fetchone()
    if not res:
        conn.close()
        return jsonify({"error": "Resource not found"}), 404

    cur.execute("""
    INSERT INTO user_roadmap_progress (student_id, resource_id, status, updated_at)
    VALUES (?, ?, ?, CURRENT_TIMESTAMP)
    ON CONFLICT(student_id, resource_id) DO UPDATE SET status = ?, updated_at = CURRENT_TIMESTAMP
    """, (student_id, item_id, new_status, new_status))

    # Log activity if completed
    if new_status == "completed":
        cur.execute("""
        INSERT INTO user_activity_log (student_id, activity_type, activity_title, details)
        VALUES (?, 'roadmap_completed', ?, 'Marked learning module as completed')
        """, (student_id, f"Completed: {res['topic_title']}"))

    conn.commit()
    conn.close()

    return jsonify({
        "message": f"Updated status to {new_status}",
        "resource_id": item_id,
        "status": new_status
    })

# ==========================================
# MODULE 5: PROJECTS & CERTIFICATIONS
# ==========================================

@app.route("/api/projects-certs/<role_id>", methods=["GET"])
def get_projects_and_certs(role_id):
    conn = get_db()
    cur = conn.cursor()

    # Projects
    cur.execute("SELECT * FROM projects_catalog WHERE role_id = ?", (role_id,))
    projects = [dict(p) for p in cur.fetchall()]
    for p in projects:
        p["skills_developed"] = json.loads(p["skills_developed"])
        p["key_deliverables"] = json.loads(p["key_deliverables"])

    # Certifications
    cur.execute("SELECT * FROM certifications_catalog WHERE role_id = ?", (role_id,))
    certs = [dict(c) for c in cur.fetchall()]
    for c in certs:
        c["skills_covered"] = json.loads(c["skills_covered"])

    conn.close()

    return jsonify({
        "role_id": role_id,
        "projects": projects,
        "certifications": certs
    })

# ==========================================
# MODULE 6: PLACEMENT PREPARATION
# ==========================================

@app.route("/api/placement/categories", methods=["GET"])
def get_placement_categories():
    student_id = get_current_student_id()
    conn = get_db()
    cur = conn.cursor()

    cur.execute("""
    SELECT category, count(*) as question_count 
    FROM placement_questions 
    GROUP BY category
    """)
    categories = [dict(c) for c in cur.fetchall()]

    # Get student's best and recent attempts
    cur.execute("""
    SELECT category, MAX(percentage) as best_score, AVG(percentage) as avg_score, COUNT(*) as attempts_count
    FROM user_placement_attempts
    WHERE student_id = ?
    GROUP BY category
    """, (student_id,))
    stats = {row["category"]: dict(row) for row in cur.fetchall()}

    for cat in categories:
        c_name = cat["category"]
        if c_name in stats:
            cat["best_score"] = round(stats[c_name]["best_score"], 1)
            cat["avg_score"] = round(stats[c_name]["avg_score"], 1)
            cat["attempts_count"] = stats[c_name]["attempts_count"]
        else:
            cat["best_score"] = None
            cat["avg_score"] = None
            cat["attempts_count"] = 0

    conn.close()
    return jsonify(categories)

@app.route("/api/placement/questions", methods=["GET"])
def get_placement_questions():
    category = request.args.get("category", "Aptitude")
    conn = get_db()
    cur = conn.cursor()

    cur.execute("SELECT * FROM placement_questions WHERE category = ?", (category,))
    questions = [dict(q) for q in cur.fetchall()]
    conn.close()

    for q in questions:
        q["options"] = json.loads(q["options"])

    return jsonify(questions)

@app.route("/api/placement/submit", methods=["POST"])
def submit_placement_quiz():
    student_id = get_current_student_id()
    data = request.get_json() or {}
    category = data.get("category", "Aptitude")
    answers = data.get("answers", {}) # {question_id: selected_index}

    conn = get_db()
    cur = conn.cursor()

    cur.execute("SELECT id, correct_option_index, explanation FROM placement_questions WHERE category = ?", (category,))
    db_questions = {str(q["id"]): q for q in cur.fetchall()}

    total = len(db_questions)
    correct_count = 0
    feedback = {}

    for q_id, q_data in db_questions.items():
        user_choice = answers.get(q_id)
        is_correct = (user_choice == q_data["correct_option_index"])
        if is_correct:
            correct_count += 1
        feedback[q_id] = {
            "user_choice": user_choice,
            "correct_choice": q_data["correct_option_index"],
            "is_correct": is_correct,
            "explanation": q_data["explanation"]
        }

    percentage = round((correct_count / max(total, 1)) * 100.0, 1)

    # Save attempt
    cur.execute("""
    INSERT INTO user_placement_attempts 
    (student_id, category, subcategory, score, total_questions, percentage, answers_json)
    VALUES (?, ?, 'Practice Assessment', ?, ?, ?, ?)
    """, (student_id, category, correct_count, total, percentage, json.dumps(answers)))

    # Log activity
    cur.execute("""
    INSERT INTO user_activity_log (student_id, activity_type, activity_title, details)
    VALUES (?, 'quiz_attempted', ?, ?)
    """, (student_id, f"Placement Assessment: {category}", f"Scored {percentage}% ({correct_count}/{total} questions)"))

    conn.commit()
    conn.close()

    return jsonify({
        "category": category,
        "score": correct_count,
        "total_questions": total,
        "percentage": percentage,
        "feedback": feedback
    })

@app.route("/api/placement/hr-questions", methods=["GET"])
def get_hr_questions():
    conn = get_db()
    cur = conn.cursor()
    cur.execute("SELECT * FROM hr_interview_questions")
    questions = [dict(q) for q in cur.fetchall()]
    conn.close()

    for q in questions:
        q["star_approach"] = json.loads(q["star_approach"])
        q["dos_and_donts"] = json.loads(q["dos_and_donts"])

    return jsonify(questions)

# ==========================================
# MODULE 7: PROGRESS TRACKING & DASHBOARD
# ==========================================

@app.route("/api/dashboard", methods=["GET"])
def get_dashboard_summary():
    student_id = get_current_student_id()
    conn = get_db()
    cur = conn.cursor()

    cur.execute("SELECT * FROM students WHERE id = ?", (student_id,))
    student = cur.fetchone()
    if not student:
        conn.close()
        return jsonify({"error": "Student not found"}), 404

    cur.execute("SELECT * FROM student_profiles WHERE student_id = ?", (student_id,))
    profile = cur.fetchone()
    if not profile:
        conn.close()
        return jsonify({"error": "Profile not found"}), 404

    target_role_id = profile["selected_goal_role"] or "ai_ml_engineer"

    # Fetch role info
    cur.execute("SELECT * FROM career_roles WHERE id = ?", (target_role_id,))
    role = cur.fetchone()

    # All career roles for AI recommendation engine
    cur.execute("SELECT * FROM career_roles")
    all_roles = [dict(r) for r in cur.fetchall()]

    # Roadmap progress for target role
    cur.execute("""
    SELECT count(*) as total_items,
           SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as completed_items,
           SUM(CASE WHEN status = 'in_progress' THEN 1 ELSE 0 END) as in_progress_items
    FROM learning_resources r
    LEFT JOIN user_roadmap_progress p ON p.resource_id = r.id AND p.student_id = ?
    WHERE r.role_id = ?
    """, (student_id, target_role_id))
    roadmap_stats = dict(cur.fetchone() or {})
    total_roadmap = roadmap_stats.get("total_items") or 0
    completed_roadmap = roadmap_stats.get("completed_items") or 0
    roadmap_pct = round((completed_roadmap / max(total_roadmap, 1)) * 100.0, 1) if total_roadmap > 0 else 0

    # Placement quiz stats
    cur.execute("""
    SELECT count(*) as total_tests, AVG(percentage) as avg_score, MAX(percentage) as highest_score
    FROM user_placement_attempts
    WHERE student_id = ?
    """, (student_id,))
    quiz_stats = dict(cur.fetchone() or {})
    avg_quiz_score = round(quiz_stats.get("avg_score") or 0, 1)

    # Activity log (recent 6)
    cur.execute("""
    SELECT * FROM user_activity_log 
    WHERE student_id = ? 
    ORDER BY timestamp DESC LIMIT 6
    """, (student_id,))
    activities = [dict(a) for a in cur.fetchall()]

    conn.close()

    # Run AI engine for recommendations & explainability
    recommendations = calculate_career_recommendations(dict(student), dict(profile), all_roles)
    top_recommendation = recommendations[0] if recommendations else None

    # Run skill gap analysis for the active target role
    skill_gap = perform_skill_gap_analysis(dict(student), dict(profile), dict(role)) if role else None

    # Calculate Holistic Placement Readiness Score (0-100)
    # 35% Skill Readiness + 30% Roadmap Completion + 20% Placement Quizzes + 15% Academic/CGPA
    skill_readiness_val = skill_gap["overall_readiness_pct"] if skill_gap else 60.0
    academic_pct = min(100.0, (float(student["cgpa"] or 7.0) / 10.0) * 100.0)
    holistic_readiness = (
        (0.35 * skill_readiness_val) +
        (0.30 * roadmap_pct) +
        (0.20 * (avg_quiz_score if avg_quiz_score > 0 else 50.0)) +
        (0.15 * academic_pct)
    )
    holistic_readiness = round(min(98.0, max(20.0, holistic_readiness)), 1)

    return jsonify({
        "student": {
            "id": student["id"],
            "full_name": student["full_name"],
            "email": student["email"],
            "department": student["department"],
            "year_of_study": student["year_of_study"],
            "roll_no": student["roll_no"],
            "cgpa": student["cgpa"],
            "college_name": student["college_name"]
        },
        "target_role": dict(role) if role else None,
        "holistic_readiness_score": holistic_readiness,
        "roadmap_progress": {
            "total_items": total_roadmap,
            "completed_items": completed_roadmap,
            "in_progress_items": roadmap_stats.get("in_progress_items") or 0,
            "percentage": roadmap_pct
        },
        "placement_stats": {
            "total_tests": quiz_stats.get("total_tests") or 0,
            "average_score": avg_quiz_score,
            "highest_score": round(quiz_stats.get("highest_score") or 0, 1)
        },
        "skill_gap_summary": {
            "readiness_pct": skill_gap["overall_readiness_pct"] if skill_gap else 0,
            "priority_counts": skill_gap["priority_counts"] if skill_gap else {},
            "radar_chart": skill_gap["radar_chart"] if skill_gap else {}
        },
        "top_recommendations": recommendations[:3],
        "recent_activities": activities
    })

if __name__ == "__main__":
    # Run Flask on port 5000
    print("Starting AI Career Roadmap Backend Server on http://127.0.0.1:5000")
    app.run(host="127.0.0.1", port=5000, debug=True)
