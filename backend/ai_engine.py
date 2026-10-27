import json
import numpy as np
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity

LEVEL_NUMERIC = {
    "none": 0,
    "beginner": 1,
    "intermediate": 2,
    "advanced": 3
}

def normalize_level(level_str):
    if not level_str:
        return 0
    return LEVEL_NUMERIC.get(str(level_str).strip().lower(), 1)

def extract_student_corpus(student_row, profile_row):
    """
    Constructs a textual semantic representation of the student
    using their projects, technical skills, interests, and department.
    """
    parts = []
    
    # Department & academic
    dept = student_row.get("department", "")
    parts.append(f"Department: {dept}")
    
    # Technical skills
    skills_json = profile_row.get("technical_skills", "[]")
    skills = json.loads(skills_json) if isinstance(skills_json, str) else (skills_json or [])
    skill_names = [f"{s.get('name')} {s.get('level', '')}" for s in skills if isinstance(s, dict)]
    if skill_names:
        parts.append(f"Technical Skills: {', '.join(skill_names)}")
        
    # Interests
    interests_json = profile_row.get("interests", "[]")
    interests = json.loads(interests_json) if isinstance(interests_json, str) else (interests_json or [])
    if interests:
        parts.append(f"Interests and Domains: {', '.join(interests)}")
        
    # Projects
    projects_json = profile_row.get("projects", "[]")
    projects = json.loads(projects_json) if isinstance(projects_json, str) else (projects_json or [])
    for p in projects:
        if isinstance(p, dict):
            p_title = p.get("title", "")
            p_desc = p.get("description", "")
            p_stack = ", ".join(p.get("tech_stack", []))
            parts.append(f"Project: {p_title}. Description: {p_desc}. Tech Stack: {p_stack}")
            
    # Certifications
    certs_json = profile_row.get("certifications", "[]")
    certs = json.loads(certs_json) if isinstance(certs_json, str) else (certs_json or [])
    for c in certs:
        if isinstance(c, dict):
            parts.append(f"Certification: {c.get('title', '')} from {c.get('provider', '')}")

    return " \n ".join(parts)

def extract_role_corpus(role_row):
    """
    Constructs a textual semantic representation of a career role.
    """
    parts = [
        f"Role Title: {role_row.get('title', '')}",
        f"Category: {role_row.get('category', '')}",
        f"Description: {role_row.get('description', '')}",
        f"Responsibilities: {role_row.get('typical_responsibilities', '')}"
    ]
    
    req_skills_json = role_row.get("required_technical_skills", "[]")
    req_skills = json.loads(req_skills_json) if isinstance(req_skills_json, str) else (req_skills_json or [])
    skills_text = ", ".join([s.get("name", "") for s in req_skills if isinstance(s, dict)])
    parts.append(f"Required Skills: {skills_text}")
    
    soft_skills_json = role_row.get("required_soft_skills", "[]")
    soft_skills = json.loads(soft_skills_json) if isinstance(soft_skills_json, str) else (soft_skills_json or [])
    parts.append(f"Soft Skills: {', '.join(soft_skills)}")
    
    return " \n ".join(parts)

def calculate_career_recommendations(student_row, profile_row, roles_list):
    """
    Real ML/Algorithmic multi-factor matching engine:
    1. TF-IDF + Cosine Similarity on Project descriptions, Interests & Role profiles
    2. Exact Skill Overlap & Proficiency Matrix calculation
    3. Soft Skill Alignment
    4. Academic Suitability (CGPA threshold)
    5. Detailed explainability breakdown
    """
    student_corpus = extract_student_corpus(student_row, profile_row)
    role_corpora = [extract_role_corpus(r) for r in roles_list]
    
    # 1. Real TF-IDF vectorization & Cosine Similarity
    all_texts = [student_corpus] + role_corpora
    vectorizer = TfidfVectorizer(stop_words='english', max_features=1000, ngram_range=(1, 2))
    tfidf_matrix = vectorizer.fit_transform(all_texts)
    
    student_vector = tfidf_matrix[0:1]
    role_vectors = tfidf_matrix[1:]
    semantic_similarities = cosine_similarity(student_vector, role_vectors)[0]

    # Student skills dict {skill_name_lower: level_int}
    skills_json = profile_row.get("technical_skills", "[]")
    student_skills = json.loads(skills_json) if isinstance(skills_json, str) else (skills_json or [])
    student_skills_map = {
        s.get("name", "").strip().lower(): normalize_level(s.get("level", "Beginner"))
        for s in student_skills if isinstance(s, dict)
    }

    # Student soft skills
    soft_skills_json = profile_row.get("soft_skills", "[]")
    student_soft_skills = json.loads(soft_skills_json) if isinstance(soft_skills_json, str) else (soft_skills_json or [])
    student_soft_set = set([s.strip().lower() for s in student_soft_skills if isinstance(s, str)])

    # Student interests
    interests_json = profile_row.get("interests", "[]")
    student_interests = json.loads(interests_json) if isinstance(interests_json, str) else (interests_json or [])
    student_interests_lower = " ".join(student_interests).lower()

    student_cgpa = float(student_row.get("cgpa", 7.0) or 7.0)

    results = []

    for idx, role in enumerate(roles_list):
        req_skills_json = role.get("required_technical_skills", "[]")
        req_skills = json.loads(req_skills_json) if isinstance(req_skills_json, str) else (req_skills_json or [])
        
        total_weight = 0.0
        weighted_skill_score = 0.0
        
        strengths = []
        proficiency_gaps = []
        critical_missing = []

        for r_skill in req_skills:
            if not isinstance(r_skill, dict):
                continue
            name = r_skill.get("name", "")
            req_lvl = normalize_level(r_skill.get("level", "Intermediate"))
            weight = float(r_skill.get("weight", 1.0))
            is_core = bool(r_skill.get("is_core", False))
            if is_core:
                weight *= 1.25 # Core skills have 25% higher weight
            
            total_weight += weight
            
            # Find best match in student's skills
            name_lower = name.lower()
            stud_lvl = 0
            
            # Direct match or partial keyword match
            for s_name, s_lvl in student_skills_map.items():
                if s_name in name_lower or name_lower in s_name:
                    stud_lvl = max(stud_lvl, s_lvl)

            if stud_lvl >= req_lvl and stud_lvl > 0:
                strengths.append(f"{name} (Met / Advanced)")
                weighted_skill_score += weight * 1.0
            elif stud_lvl > 0:
                proficiency_gaps.append(f"{name} (Current: level {stud_lvl}, Target: level {req_lvl})")
                ratio = stud_lvl / max(req_lvl, 1)
                weighted_skill_score += weight * ratio
            else:
                if is_core:
                    critical_missing.append(name)
                weighted_skill_score += 0.0

        tech_skill_score = (weighted_skill_score / total_weight * 100.0) if total_weight > 0 else 50.0
        tech_skill_score = min(100.0, max(0.0, tech_skill_score))

        # Semantic score from TF-IDF (0 - 100)
        tfidf_score = min(100.0, max(0.0, float(semantic_similarities[idx]) * 100.0 * 2.5)) # Scaled naturally

        # Soft skill alignment
        role_soft_json = role.get("required_soft_skills", "[]")
        role_soft = json.loads(role_soft_json) if isinstance(role_soft_json, str) else (role_soft_json or [])
        matched_soft = [s for s in role_soft if any(s.lower() in ss or ss in s.lower() for ss in student_soft_set)]
        soft_score = (len(matched_soft) / max(len(role_soft), 1)) * 100.0

        # Interest alignment bonus
        role_category_text = (role.get("title", "") + " " + role.get("category", "")).lower()
        interest_match_count = sum(1 for it in student_interests if it.lower() in role_category_text)
        interest_score = min(100.0, interest_match_count * 50.0 + 30.0 if interest_match_count > 0 else 40.0)

        # Academic eligibility
        target_cgpa = float(role.get("target_cgpa", 7.0) or 7.0)
        if student_cgpa >= target_cgpa:
            academic_score = 100.0
        else:
            deficit = target_cgpa - student_cgpa
            academic_score = max(50.0, 100.0 - (deficit * 30.0))

        # Overall Multi-factor Weighted Formula
        # 40% Tech Skills + 25% Semantic TF-IDF + 15% Domain Interest + 10% Soft Skills + 10% Academic
        final_match_score = (
            (0.40 * tech_skill_score) +
            (0.25 * tfidf_score) +
            (0.15 * interest_score) +
            (0.10 * soft_score) +
            (0.10 * academic_score)
        )
        final_match_score = round(min(98.5, max(15.0, final_match_score)), 1)

        # Human explainability generation
        explanation_points = []
        if strengths:
            explanation_points.append(f"Strong foundation in key competencies: {', '.join(strengths[:3])}.")
        if tfidf_score > 40:
            explanation_points.append("Your academic projects and technical interests exhibit high semantic alignment with this domain.")
        if student_cgpa >= target_cgpa:
            explanation_points.append(f"Current CGPA ({student_cgpa}) comfortably satisfies the benchmark threshold ({target_cgpa}).")
        if critical_missing:
            explanation_points.append(f"Bridging critical gaps in {', '.join(critical_missing[:2])} will substantially raise your industry readiness.")

        results.append({
            "role_id": role["id"],
            "title": role["title"],
            "category": role["category"],
            "description": role["description"],
            "icon_name": role["icon_name"],
            "target_cgpa": role["target_cgpa"],
            "avg_salary_range": role["avg_salary_range"],
            "industry_demand": role["industry_demand"],
            "match_score": final_match_score,
            "score_breakdown": {
                "technical_skills_score": round(tech_skill_score, 1),
                "semantic_similarity_score": round(tfidf_score, 1),
                "domain_interest_score": round(interest_score, 1),
                "soft_skills_score": round(soft_score, 1),
                "academic_score": round(academic_score, 1)
            },
            "strengths": strengths,
            "proficiency_gaps": proficiency_gaps,
            "critical_missing": critical_missing,
            "matched_soft_skills": matched_soft,
            "explanation": " ".join(explanation_points)
        })

    # Sort descending by calculated match score
    results.sort(key=lambda x: x["match_score"], reverse=True)
    return results

def perform_skill_gap_analysis(student_row, profile_row, role_row):
    """
    Performs precise skill-gap analysis:
    - Benchmark required skills vs Student skills
    - Categorizes gaps into Critical Missing, Proficiency Gap, Met/Exceeded
    - Assigns Priority: High, Medium, Low
    - Generates Radar Chart dataset for visualization
    """
    req_skills_json = role_row.get("required_technical_skills", "[]")
    req_skills = json.loads(req_skills_json) if isinstance(req_skills_json, str) else (req_skills_json or [])

    skills_json = profile_row.get("technical_skills", "[]")
    student_skills = json.loads(skills_json) if isinstance(skills_json, str) else (skills_json or [])
    
    student_skills_map = {}
    for s in student_skills:
        if isinstance(s, dict):
            student_skills_map[s.get("name", "").strip().lower()] = {
                "level_str": s.get("level", "Beginner"),
                "level_num": normalize_level(s.get("level", "Beginner")),
                "years": s.get("years", 1)
            }

    gap_items = []
    radar_labels = []
    radar_benchmark = []
    radar_student = []

    priority_counts = {"High": 0, "Medium": 0, "Low": 0, "Met": 0}

    for skill in req_skills:
        if not isinstance(skill, dict):
            continue
        name = skill.get("name", "")
        req_level_str = skill.get("level", "Intermediate")
        req_level_num = normalize_level(req_level_str)
        is_core = bool(skill.get("is_core", False))
        weight = float(skill.get("weight", 1.0))

        # Check student level
        name_lower = name.lower()
        stud_data = None
        for s_name, data in student_skills_map.items():
            if s_name in name_lower or name_lower in s_name:
                stud_data = data
                break

        if stud_data:
            stud_level_str = stud_data["level_str"]
            stud_level_num = stud_data["level_num"]
        else:
            stud_level_str = "Not Acquired"
            stud_level_num = 0

        # Radar chart points (1 - 3 scale)
        radar_labels.append(name)
        radar_benchmark.append(req_level_num)
        radar_student.append(stud_level_num)

        # Status & Priority determination
        if stud_level_num >= req_level_num:
            status = "Met / Exceeded"
            priority = "None"
            priority_counts["Met"] += 1
            action_advice = "Maintain currency through applied problem solving and projects."
        elif stud_level_num > 0:
            status = "Proficiency Gap"
            if is_core or (req_level_num - stud_level_num >= 2):
                priority = "High"
                priority_counts["High"] += 1
            else:
                priority = "Medium"
                priority_counts["Medium"] += 1
            action_advice = f"Advance knowledge from {stud_level_str} to {req_level_str} level via hands-on exercises."
        else:
            status = "Critical Missing" if is_core else "Secondary Missing"
            if is_core:
                priority = "High"
                priority_counts["High"] += 1
            else:
                priority = "Low"
                priority_counts["Low"] += 1
            action_advice = f"Begin foundational learning modules for {name} immediately."

        gap_items.append({
            "skill_name": name,
            "required_level": req_level_str,
            "required_level_num": req_level_num,
            "student_level": stud_level_str,
            "student_level_num": stud_level_num,
            "is_core": is_core,
            "weight": weight,
            "status": status,
            "priority": priority,
            "action_advice": action_advice
        })

    # Sort gaps: High priority first, then Medium, then Low, then Met
    priority_order = {"High": 1, "Medium": 2, "Low": 3, "None": 4}
    gap_items.sort(key=lambda x: priority_order.get(x["priority"], 5))

    # Readiness percentage calculation
    total_skills = len(req_skills)
    met_weight = sum(g["student_level_num"] / max(g["required_level_num"], 1) for g in gap_items)
    overall_readiness_pct = round((met_weight / max(total_skills, 1)) * 100.0, 1)

    return {
        "role_id": role_row["id"],
        "role_title": role_row["title"],
        "overall_readiness_pct": overall_readiness_pct,
        "priority_counts": priority_counts,
        "gap_matrix": gap_items,
        "radar_chart": {
            "labels": radar_labels,
            "benchmark_dataset": radar_benchmark,
            "student_dataset": radar_student
        }
    }
