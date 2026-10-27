import urllib.request
import json

def test_api():
    base = "http://127.0.0.1:5000/api"
    
    # 1. Dashboard
    req = urllib.request.urlopen(f"{base}/dashboard?student_id=1")
    dash = json.loads(req.read().decode())
    print("[OK] Dashboard API:")
    print("  Student:", dash["student"]["full_name"], f"({dash['student']['department']})")
    print("  Active Goal:", dash["target_role"]["title"])
    print("  Readiness Score:", dash["holistic_readiness_score"], "%")
    print("  Roadmap Completed:", f"{dash['roadmap_progress']['completed_items']}/{dash['roadmap_progress']['total_items']}")
    print("  Top Match:", dash["top_recommendations"][0]["title"], f"({dash['top_recommendations'][0]['match_score']}%)")

    # 2. Recommendations
    req = urllib.request.urlopen(f"{base}/recommendations?student_id=1")
    recs = json.loads(req.read().decode())
    print("[OK] AI Recommendations API:")
    print(f"  Total roles evaluated: {len(recs['recommendations'])}")
    for r in recs["recommendations"][:3]:
        print(f"  - {r['title']}: {r['match_score']}% match | Tech: {r['score_breakdown']['technical_skills_score']}% | TF-IDF: {r['score_breakdown']['semantic_similarity_score']}%")

    # 3. Skill-Gap
    req = urllib.request.urlopen(f"{base}/skill-gap/ai_ml_engineer?student_id=1")
    gap = json.loads(req.read().decode())
    print("[OK] Skill Gap API:")
    print(f"  Role: {gap['role_title']}")
    print(f"  Readiness: {gap['overall_readiness_pct']}% | Priority Gaps: {gap['priority_counts']}")
    print(f"  Total matrix skills: {len(gap['gap_matrix'])}")

    # 4. Roadmap
    req = urllib.request.urlopen(f"{base}/roadmap/ai_ml_engineer?student_id=1")
    roadmap = json.loads(req.read().decode())
    print("[OK] Personalized Roadmap API:")
    print(f"  Phases: {len(roadmap['phases'])} | Total Modules: {roadmap['total_items']}")
    for p in roadmap['phases']:
        print(f"  - Phase {p['phase_num']}: {p['phase_title']} ({len(p['items'])} items)")

    # 5. Projects & Certifications
    req = urllib.request.urlopen(f"{base}/projects-certs/ai_ml_engineer")
    pc = json.loads(req.read().decode())
    print("[OK] Projects & Certifications API:")
    print(f"  Projects suggested: {len(pc['projects'])} | Certifications: {len(pc['certifications'])}")

    # 6. Placement Preparation
    req = urllib.request.urlopen(f"{base}/placement/categories?student_id=1")
    cats = json.loads(req.read().decode())
    print("[OK] Placement Prep API:")
    print(f"  Categories available: {[c['category'] for c in cats]}")

    print("\nALL BACKEND MODULES AND APIS OPERATING WITH 100% SUCCESS!")

if __name__ == "__main__":
    test_api()
