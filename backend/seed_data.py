import json
import sqlite3
import os
from werkzeug.security import generate_password_hash
from database import get_db, init_db

def seed_career_roles(cursor):
    roles = [
        {
            "id": "ai_ml_engineer",
            "title": "AI / ML Engineer",
            "category": "Artificial Intelligence & Data Science",
            "description": "Designs, develops, and deploys intelligent algorithms and machine learning models to solve predictive and automation problems at scale.",
            "target_cgpa": 7.5,
            "industry_demand": "Very High (32% YoY growth)",
            "avg_salary_range": "8 - 18 LPA",
            "icon_name": "BrainCircuit",
            "typical_responsibilities": "Feature engineering, deep neural network training, model evaluation & optimization, MLOps pipeline creation, REST API deployment.",
            "required_technical_skills": [
                {"name": "Python", "level": "Advanced", "weight": 1.0, "is_core": True},
                {"name": "Machine Learning", "level": "Advanced", "weight": 1.0, "is_core": True},
                {"name": "Deep Learning", "level": "Intermediate", "weight": 0.9, "is_core": True},
                {"name": "Data Structures & Algorithms", "level": "Intermediate", "weight": 0.8, "is_core": True},
                {"name": "SQL", "level": "Intermediate", "weight": 0.7, "is_core": False},
                {"name": "PyTorch / TensorFlow", "level": "Intermediate", "weight": 0.8, "is_core": True},
                {"name": "Pandas & NumPy", "level": "Advanced", "weight": 0.8, "is_core": True},
                {"name": "MLOps / Docker", "level": "Beginner", "weight": 0.6, "is_core": False},
                {"name": "Model Deployment (FastAPI/Flask)", "level": "Intermediate", "weight": 0.7, "is_core": False}
            ],
            "required_soft_skills": ["Analytical Problem Solving", "Mathematical Aptitude", "Curiosity & Continuous Learning", "Research Communication"]
        },
        {
            "id": "software_developer",
            "title": "Software Developer (SDE)",
            "category": "Core Software Engineering",
            "description": "Architects, builds, tests, and maintains robust, scalable backend and desktop software applications adhering to clean code standards.",
            "target_cgpa": 7.0,
            "industry_demand": "High (Constant recruitment)",
            "avg_salary_range": "7 - 16 LPA",
            "icon_name": "Code2",
            "typical_responsibilities": "Algorithm implementation, code optimization, database querying, system architecture design, unit testing & debugging.",
            "required_technical_skills": [
                {"name": "Data Structures & Algorithms", "level": "Advanced", "weight": 1.0, "is_core": True},
                {"name": "Java or C++", "level": "Advanced", "weight": 1.0, "is_core": True},
                {"name": "Object-Oriented Programming (OOP)", "level": "Advanced", "weight": 0.9, "is_core": True},
                {"name": "SQL & Relational Databases", "level": "Intermediate", "weight": 0.8, "is_core": True},
                {"name": "Operating Systems & Concurrency", "level": "Intermediate", "weight": 0.7, "is_core": True},
                {"name": "Computer Networks", "level": "Intermediate", "weight": 0.7, "is_core": True},
                {"name": "Git & Version Control", "level": "Intermediate", "weight": 0.6, "is_core": False},
                {"name": "System Design Basics", "level": "Beginner", "weight": 0.6, "is_core": False}
            ],
            "required_soft_skills": ["Logical Reasoning", "Debugging Patience", "Teamwork & Code Review", "Written Communication"]
        },
        {
            "id": "data_analyst",
            "title": "Data Analyst / Business Intelligence",
            "category": "Data & Analytics",
            "description": "Translates complex datasets into actionable business insights through statistical analysis, reporting dashboards, and executive data storytelling.",
            "target_cgpa": 6.8,
            "industry_demand": "Very High across all sectors",
            "avg_salary_range": "5 - 12 LPA",
            "icon_name": "BarChart3",
            "typical_responsibilities": "Data cleaning, exploratory data analysis, writing complex SQL queries, building PowerBI/Tableau dashboards, stakeholder presentations.",
            "required_technical_skills": [
                {"name": "SQL", "level": "Advanced", "weight": 1.0, "is_core": True},
                {"name": "Excel & Advanced Formulas", "level": "Advanced", "weight": 0.9, "is_core": True},
                {"name": "Python (Pandas, Matplotlib)", "level": "Intermediate", "weight": 0.9, "is_core": True},
                {"name": "Tableau / Power BI", "level": "Intermediate", "weight": 0.8, "is_core": True},
                {"name": "Statistics & Probability", "level": "Intermediate", "weight": 0.8, "is_core": True},
                {"name": "Data Wrangling & Cleaning", "level": "Advanced", "weight": 0.8, "is_core": True},
                {"name": "Business Metrics & KPIs", "level": "Intermediate", "weight": 0.6, "is_core": False}
            ],
            "required_soft_skills": ["Data Storytelling", "Critical Thinking", "Attention to Detail", "Business Communication"]
        },
        {
            "id": "full_stack_developer",
            "title": "Full Stack Web Developer",
            "category": "Web & Cloud Engineering",
            "description": "Builds end-to-end modern web applications encompassing fluid user interfaces, responsive styling, performant APIs, and relational/NoSQL databases.",
            "target_cgpa": 6.8,
            "industry_demand": "Very High (Startups & Enterprises)",
            "avg_salary_range": "6 - 15 LPA",
            "icon_name": "Layers",
            "typical_responsibilities": "Frontend UI component design, state management, REST/GraphQL API development, database schema modeling, authentication integration.",
            "required_technical_skills": [
                {"name": "HTML5 & Modern CSS", "level": "Advanced", "weight": 0.9, "is_core": True},
                {"name": "JavaScript (ES6+)", "level": "Advanced", "weight": 1.0, "is_core": True},
                {"name": "React.js", "level": "Advanced", "weight": 1.0, "is_core": True},
                {"name": "Node.js / Express or Python Flask", "level": "Intermediate", "weight": 0.9, "is_core": True},
                {"name": "RESTful APIs", "level": "Intermediate", "weight": 0.8, "is_core": True},
                {"name": "SQL / MongoDB", "level": "Intermediate", "weight": 0.8, "is_core": True},
                {"name": "Git & GitHub", "level": "Intermediate", "weight": 0.7, "is_core": False},
                {"name": "Cloud Deployment (Vercel/Render)", "level": "Beginner", "weight": 0.6, "is_core": False}
            ],
            "required_soft_skills": ["UI/UX Empathy", "Agile Adaptability", "Cross-Functional Collaboration", "Problem Solving"]
        },
        {
            "id": "cybersecurity_analyst",
            "title": "Cybersecurity Analyst",
            "category": "Information Security & Infrastructure",
            "description": "Protects organizational infrastructure, networks, and data against cyber threats, vulnerabilities, unauthorized intrusion, and malware.",
            "target_cgpa": 7.0,
            "industry_demand": "Extremely High (Global Talent Shortage)",
            "avg_salary_range": "7 - 17 LPA",
            "icon_name": "ShieldAlert",
            "typical_responsibilities": "Network traffic monitoring, vulnerability assessment & penetration testing (VAPT), incident response, firewall configuration, compliance auditing.",
            "required_technical_skills": [
                {"name": "Computer Networks & Protocols", "level": "Advanced", "weight": 1.0, "is_core": True},
                {"name": "Linux Command Line", "level": "Advanced", "weight": 0.9, "is_core": True},
                {"name": "Information Security Fundamentals", "level": "Advanced", "weight": 1.0, "is_core": True},
                {"name": "Cryptography & PKI", "level": "Intermediate", "weight": 0.8, "is_core": True},
                {"name": "Vulnerability Assessment (Wireshark/Nmap)", "level": "Intermediate", "weight": 0.8, "is_core": True},
                {"name": "Web Application Security (OWASP Top 10)", "level": "Intermediate", "weight": 0.8, "is_core": True},
                {"name": "Python for Security Scripting", "level": "Intermediate", "weight": 0.7, "is_core": False}
            ],
            "required_soft_skills": ["Ethical Integrity", "Crisis Management", "Meticulous Attention to Detail", "Analytical Investigation"]
        },
        {
            "id": "cloud_devops_engineer",
            "title": "Cloud & DevOps Engineer",
            "category": "Cloud Computing & Automation",
            "description": "Automates continuous integration and delivery (CI/CD), manages cloud infrastructure provisioning, and guarantees uptime and scalability.",
            "target_cgpa": 7.0,
            "industry_demand": "High Growth & Premium Compensation",
            "avg_salary_range": "7 - 17 LPA",
            "icon_name": "CloudCog",
            "typical_responsibilities": "CI/CD pipeline construction, Docker containerization, Kubernetes orchestration, Infrastructure as Code (Terraform), Cloud monitoring.",
            "required_technical_skills": [
                {"name": "Linux Systems Administration", "level": "Advanced", "weight": 1.0, "is_core": True},
                {"name": "Docker & Containerization", "level": "Advanced", "weight": 1.0, "is_core": True},
                {"name": "CI/CD Pipelines (GitHub Actions/Jenkins)", "level": "Intermediate", "weight": 0.9, "is_core": True},
                {"name": "Cloud Platform (AWS / Azure / GCP)", "level": "Intermediate", "weight": 0.9, "is_core": True},
                {"name": "Kubernetes", "level": "Beginner", "weight": 0.7, "is_core": False},
                {"name": "Git & Infrastructure as Code", "level": "Intermediate", "weight": 0.8, "is_core": True},
                {"name": "Networking & Security Groups", "level": "Intermediate", "weight": 0.7, "is_core": False}
            ],
            "required_soft_skills": ["System Reliability Mindset", "Fast Incident Troubleshooting", "Collaborative Communication", "Process Automation"]
        }
    ]

    for role in roles:
        cursor.execute("""
        INSERT OR REPLACE INTO career_roles 
        (id, title, category, description, required_technical_skills, required_soft_skills, target_cgpa, industry_demand, avg_salary_range, icon_name, typical_responsibilities)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            role["id"],
            role["title"],
            role["category"],
            role["description"],
            json.dumps(role["required_technical_skills"]),
            json.dumps(role["required_soft_skills"]),
            role["target_cgpa"],
            role["industry_demand"],
            role["avg_salary_range"],
            role["icon_name"],
            role["typical_responsibilities"]
        ))

def seed_learning_resources(cursor):
    resources = [
        # AI/ML Engineer Roadmap
        {
            "role_id": "ai_ml_engineer",
            "skill_name": "Python for Data Science",
            "topic_title": "Phase 1: Advanced Python, NumPy & Vectorized Computations",
            "phase_num": 1,
            "phase_title": "Phase 1: Mathematical Foundations & Programming Core",
            "description": "Master numerical array operations, broadcasting, memory layouts, and data manipulation essential for ML pipelines.",
            "learning_objectives": ["NumPy array indexing, slicing and vectorization", "Matrix operations, dot products and eigenvalues", "Pandas DataFrame transformations, groupby and cleaning"],
            "duration_hours": 18,
            "difficulty": "Beginner",
            "resource_url": "https://numpy.org/doc/stable/user/absolute_beginners.html",
            "provider": "NumPy Official Docs & freeCodeCamp",
            "is_verified": 1
        },
        {
            "role_id": "ai_ml_engineer",
            "skill_name": "Statistics & Linear Algebra",
            "topic_title": "Phase 1: Linear Algebra & Multivariate Calculus for ML",
            "phase_num": 1,
            "phase_title": "Phase 1: Mathematical Foundations & Programming Core",
            "description": "Understand gradient descent mechanics, partial derivatives, loss functions, and probability distributions.",
            "learning_objectives": ["Cost functions & backpropagation intuition", "Probability density functions, Bayes Theorem", "Principal Component Analysis (PCA) math"],
            "duration_hours": 24,
            "difficulty": "Intermediate",
            "resource_url": "https://ocw.mit.edu/courses/18-06-linear-algebra-spring-2010/",
            "provider": "MIT OpenCourseWare (Prof. Gilbert Strang)",
            "is_verified": 1
        },
        {
            "role_id": "ai_ml_engineer",
            "skill_name": "Machine Learning",
            "topic_title": "Phase 2: Supervised & Unsupervised Machine Learning Algorithms",
            "phase_num": 2,
            "phase_title": "Phase 2: Classical Machine Learning & Feature Engineering",
            "description": "Implement and evaluate Regression, Decision Trees, Random Forests, SVMs, and K-Means using Scikit-Learn.",
            "learning_objectives": ["Bias-variance tradeoff and regularization (L1/L2)", "Cross-validation, precision, recall, F1, ROC-AUC", "Ensemble methods (XGBoost, LightGBM)"],
            "duration_hours": 30,
            "difficulty": "Intermediate",
            "resource_url": "https://scikit-learn.org/stable/tutorial/index.html",
            "provider": "Scikit-Learn Documentation & Guides",
            "is_verified": 1
        },
        {
            "role_id": "ai_ml_engineer",
            "skill_name": "Deep Learning",
            "topic_title": "Phase 3: Deep Neural Networks & PyTorch Architecture",
            "phase_num": 3,
            "phase_title": "Phase 3: Deep Learning, Computer Vision & NLP",
            "description": "Construct multilayer perceptrons, Convolutional Neural Networks (CNNs), and Transformer attention blocks with PyTorch.",
            "learning_objectives": ["PyTorch tensors, autograd, and training loops", "CNN architectures (ResNet) for computer vision", "Self-attention mechanism and HuggingFace Transformers"],
            "duration_hours": 36,
            "difficulty": "Advanced",
            "resource_url": "https://pytorch.org/tutorials/beginner/basics/intro.html",
            "provider": "PyTorch Official Tutorials",
            "is_verified": 1
        },
        {
            "role_id": "ai_ml_engineer",
            "skill_name": "Model Deployment & MLOps",
            "topic_title": "Phase 4: ML Serving with FastAPI, Docker & Placement Capstone",
            "phase_num": 4,
            "phase_title": "Phase 4: Production Deployment & Placement Readiness",
            "description": "Package models into RESTful APIs, containerize with Docker, track experiments with MLflow, and prepare for ML technical interviews.",
            "learning_objectives": ["FastAPI endpoints for batch & real-time inference", "Dockerizing inference containers and optimizing image size", "Common ML interview questions: data leakage, vanishing gradients"],
            "duration_hours": 20,
            "difficulty": "Advanced",
            "resource_url": "https://fastapi.tiangolo.com/tutorial/",
            "provider": "FastAPI Official Documentation",
            "is_verified": 1
        },

        # Software Developer Roadmap
        {
            "role_id": "software_developer",
            "skill_name": "Data Structures & Algorithms",
            "topic_title": "Phase 1: Linear & Non-Linear Data Structures",
            "phase_num": 1,
            "phase_title": "Phase 1: Data Structures, Complexity & Core Language",
            "description": "Thorough mastery of Big-O asymptotic analysis, dynamic arrays, linked lists, stacks, queues, hash maps, and binary trees.",
            "learning_objectives": ["Time and space complexity profiling", "Hash collision resolution strategies", "Binary search tree traversals (Inorder, Preorder, Postorder)"],
            "duration_hours": 35,
            "difficulty": "Intermediate",
            "resource_url": "https://www.geeksforgeeks.org/data-structures/",
            "provider": "GeeksforGeeks CS Portal",
            "is_verified": 1
        },
        {
            "role_id": "software_developer",
            "skill_name": "Object-Oriented Programming & Design",
            "topic_title": "Phase 2: OOP Principles & SOLID Architecture Patterns",
            "phase_num": 2,
            "phase_title": "Phase 2: Object-Oriented Design & Clean Architecture",
            "description": "Deep dive into Encapsulation, Polymorphism, Inheritance, Abstraction, and the five SOLID design principles.",
            "learning_objectives": ["Factory, Singleton, Observer, and Strategy design patterns", "Interface segregation and Dependency Inversion", "Writing modular, testable enterprise code"],
            "duration_hours": 22,
            "difficulty": "Intermediate",
            "resource_url": "https://refactoring.guru/design-patterns",
            "provider": "Refactoring Guru",
            "is_verified": 1
        },
        {
            "role_id": "software_developer",
            "skill_name": "Operating Systems & DBMS",
            "topic_title": "Phase 3: Multithreading, Memory Management & SQL Indexing",
            "phase_num": 3,
            "phase_title": "Phase 3: Core CS Fundamentals (OS, DBMS, Networks)",
            "description": "Key placement interview subjects: process vs threads, deadlocks, virtual memory, ACID transactions, and B-Tree indexing.",
            "learning_objectives": ["Process scheduling, mutex locks and semaphores", "ACID guarantees and isolation levels in RDBMS", "TCP three-way handshake, HTTP/HTTPS protocol lifecycle"],
            "duration_hours": 28,
            "difficulty": "Intermediate",
            "resource_url": "https://cs61c.org/",
            "provider": "UC Berkeley CS61C / Gate Smashers",
            "is_verified": 1
        },
        {
            "role_id": "software_developer",
            "skill_name": "System Design & Placement SDE Prep",
            "topic_title": "Phase 4: High-Level System Design & Coding Interview Sprints",
            "phase_num": 4,
            "phase_title": "Phase 4: SDE Placement Sprints & Mock Interviews",
            "description": "Prepare for FAANG & tier-1 product firm coding rounds: sliding window, two pointers, graphs, and scalable system design.",
            "learning_objectives": ["Design a URL shortener / Rate limiter", "Graph algorithms: BFS, DFS, Dijkstra, Topological Sort", "Dynamic Programming top-down vs bottom-up memoization"],
            "duration_hours": 32,
            "difficulty": "Advanced",
            "resource_url": "https://github.com/donnemartin/system-design-primer",
            "provider": "System Design Primer by Donne Martin",
            "is_verified": 1
        },

        # Full Stack Developer Roadmap
        {
            "role_id": "full_stack_developer",
            "skill_name": "Modern JavaScript (ES6+)",
            "topic_title": "Phase 1: JavaScript Engine, Async/Await & DOM Manipulation",
            "phase_num": 1,
            "phase_title": "Phase 1: Modern Web Core & Frontend Foundations",
            "description": "Understand closures, event loops, promises, prototypes, and ES6 modular programming.",
            "learning_objectives": ["Event loop, microtasks, and asynchronous execution", "Destructuring, rest/spread, array methods (map, filter, reduce)", "Fetch API, headers, and CORS handling"],
            "duration_hours": 20,
            "difficulty": "Beginner",
            "resource_url": "https://developer.mozilla.org/en-US/docs/Web/JavaScript",
            "provider": "MDN Web Docs",
            "is_verified": 1
        },
        {
            "role_id": "full_stack_developer",
            "skill_name": "React.js Framework",
            "topic_title": "Phase 2: React 18 Components, Hooks, State & Routing",
            "phase_num": 2,
            "phase_title": "Phase 2: Frontend Engineering with React",
            "description": "Component lifecycle, functional components, useState, useEffect, useContext, custom hooks, and React Router.",
            "learning_objectives": ["Virtual DOM diffing algorithm", "State management patterns and avoiding unnecessary re-renders", "Form handling, input validation, and toast notifications"],
            "duration_hours": 28,
            "difficulty": "Intermediate",
            "resource_url": "https://react.dev/learn",
            "provider": "React Official Documentation",
            "is_verified": 1
        },
        {
            "role_id": "full_stack_developer",
            "skill_name": "Backend REST APIs with Node/Flask",
            "topic_title": "Phase 3: Server Architecture, JWT Authentication & Databases",
            "phase_num": 3,
            "phase_title": "Phase 3: Backend Services & Database Modeling",
            "description": "Build robust server endpoints with Express/Flask, password hashing, JWT bearer tokens, and SQLite/PostgreSQL schema modeling.",
            "learning_objectives": ["REST architectural constraints and HTTP status codes", "Password salting, hashing with bcrypt/werkzeug", "SQL joins, foreign keys, and transaction management"],
            "duration_hours": 26,
            "difficulty": "Intermediate",
            "resource_url": "https://www.freecodecamp.org/news/how-to-build-a-restful-api/",
            "provider": "freeCodeCamp Backend Curriculum",
            "is_verified": 1
        },
        {
            "role_id": "full_stack_developer",
            "skill_name": "Full Stack Capstone & Deployment",
            "topic_title": "Phase 4: Full Stack Application Deployment & CI/CD",
            "phase_num": 4,
            "phase_title": "Phase 4: Production Deployment & Placement Portfolio",
            "description": "Host full stack projects on modern platforms, configure environment variables, setup security headers, and showcase on GitHub.",
            "learning_objectives": ["Environment configuration (.env) and secret management", "Frontend build optimization with Vite", "Portfolio building and resume project presentation"],
            "duration_hours": 18,
            "difficulty": "Intermediate",
            "resource_url": "https://roadmap.sh/full-stack",
            "provider": "Roadmap.sh Full Stack Guide",
            "is_verified": 1
        },

        # Data Analyst Roadmap
        {
            "role_id": "data_analyst",
            "skill_name": "SQL for Analytics",
            "topic_title": "Phase 1: Advanced SQL Queries & Window Functions",
            "phase_num": 1,
            "phase_title": "Phase 1: Relational Data Querying & Wrangling",
            "description": "Master complex joins, subqueries, Common Table Expressions (CTEs), and window functions (RANK, ROW_NUMBER, LAG, LEAD).",
            "learning_objectives": ["Inner, Left, Right, and Full Outer Joins", "Aggregations with GROUP BY and HAVING filters", "Analytical window functions for running totals and rankings"],
            "duration_hours": 25,
            "difficulty": "Intermediate",
            "resource_url": "https://mode.com/sql-tutorial/",
            "provider": "Mode SQL Analytics Tutorial",
            "is_verified": 1
        },
        {
            "role_id": "data_analyst",
            "skill_name": "Python for EDA",
            "topic_title": "Phase 2: Exploratory Data Analysis with Pandas & Seaborn",
            "phase_num": 2,
            "phase_title": "Phase 2: Data Wrangling & Visual Analytics",
            "description": "Detect outliers, impute missing values, pivot tables, calculate correlation matrices, and create compelling publication-grade charts.",
            "learning_objectives": ["Data cleaning strategies for real-world dirty datasets", "Heatmaps, boxplots, histograms, and scatter plots", "Hypothesis testing and p-value interpretation"],
            "duration_hours": 22,
            "difficulty": "Intermediate",
            "resource_url": "https://pandas.pydata.org/docs/getting_started/intro_tutorials/",
            "provider": "Pandas Documentation & Kaggle Learn",
            "is_verified": 1
        },
        {
            "role_id": "data_analyst",
            "skill_name": "Business Intelligence (Power BI / Tableau)",
            "topic_title": "Phase 3: Interactive Dashboarding & DAX Modeling",
            "phase_num": 3,
            "phase_title": "Phase 3: Business Intelligence & Executive Reporting",
            "description": "Build interactive drill-down reports, calculate custom DAX measures, establish star schema data models, and automate refreshes.",
            "learning_objectives": ["Star schema and snowflake schema modeling", "Writing calculate, filter, and time-intelligence DAX measures", "UX principles for executive executive dashboard design"],
            "duration_hours": 24,
            "difficulty": "Intermediate",
            "resource_url": "https://learn.microsoft.com/en-us/training/powerplatform/power-bi",
            "provider": "Microsoft Learn Power BI Track",
            "is_verified": 1
        },

        # Cybersecurity Analyst Roadmap
        {
            "role_id": "cybersecurity_analyst",
            "skill_name": "Networking & Protocols",
            "topic_title": "Phase 1: TCP/IP, OSI Layers & Packet Analysis with Wireshark",
            "phase_num": 1,
            "phase_title": "Phase 1: Network Architecture & Traffic Inspection",
            "description": "Analyze network packets, understand DNS, ARP, DHCP, SSL/TLS handshakes, and identify malicious traffic anomalies.",
            "learning_objectives": ["OSI 7-layer and TCP/IP protocol stack deep-dive", "Capturing and filtering packets in Wireshark", "Detecting port scans and ARP spoofing"],
            "duration_hours": 26,
            "difficulty": "Intermediate",
            "resource_url": "https://www.wireshark.org/docs/",
            "provider": "Wireshark Official User Guide",
            "is_verified": 1
        },
        {
            "role_id": "cybersecurity_analyst",
            "skill_name": "Web Application Security",
            "topic_title": "Phase 2: OWASP Top 10 Vulnerabilities & Burp Suite Testing",
            "phase_num": 2,
            "phase_title": "Phase 2: Application Security & Ethical Hacking",
            "description": "Understand SQL Injection (SQLi), Cross-Site Scripting (XSS), CSRF, broken access control, and remediation techniques.",
            "learning_objectives": ["Identifying and patching SQL Injection in APIs", "Cross-site scripting (Stored vs Reflected) mechanics", "Configuring Content Security Policies (CSP)"],
            "duration_hours": 28,
            "difficulty": "Advanced",
            "resource_url": "https://owasp.org/www-project-top-ten/",
            "provider": "OWASP Foundation Official Project",
            "is_verified": 1
        },

        # Cloud & DevOps Roadmap
        {
            "role_id": "cloud_devops_engineer",
            "skill_name": "Docker & Containers",
            "topic_title": "Phase 1: Containerization with Docker & Multi-Stage Builds",
            "phase_num": 1,
            "phase_title": "Phase 1: Containerization & Cloud Infrastructure",
            "description": "Create slim production Docker images, configure volumes, manage container networks, and orchestrate with Docker Compose.",
            "learning_objectives": ["Writing optimal multi-stage Dockerfiles", "Docker compose for multi-service local environments", "Container security best practices (non-root users)"],
            "duration_hours": 22,
            "difficulty": "Intermediate",
            "resource_url": "https://docs.docker.com/get-started/",
            "provider": "Docker Official Documentation",
            "is_verified": 1
        },
        {
            "role_id": "cloud_devops_engineer",
            "skill_name": "CI/CD & Cloud Provisioning",
            "topic_title": "Phase 2: GitHub Actions CI/CD & AWS Core Architecture",
            "phase_num": 2,
            "phase_title": "Phase 2: CI/CD Pipelines & AWS Cloud Foundations",
            "description": "Automate linting, unit testing, and container deployment using GitHub Actions; deploy on AWS EC2, S3, and IAM roles.",
            "learning_objectives": ["Writing YAML workflows with triggers, secrets, and caches", "AWS IAM least privilege principle and security groups", "Automated deployment to cloud instances"],
            "duration_hours": 26,
            "difficulty": "Intermediate",
            "resource_url": "https://aws.amazon.com/getting-started/hands-on/",
            "provider": "AWS Hands-On Tutorials",
            "is_verified": 1
        }
    ]

    for res in resources:
        cursor.execute("""
        INSERT INTO learning_resources 
        (role_id, skill_name, topic_title, phase_num, phase_title, description, learning_objectives, duration_hours, difficulty, resource_url, provider, is_verified)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            res["role_id"],
            res["skill_name"],
            res["topic_title"],
            res["phase_num"],
            res["phase_title"],
            res["description"],
            json.dumps(res["learning_objectives"]),
            res["duration_hours"],
            res["difficulty"],
            res["resource_url"],
            res["provider"],
            res["is_verified"]
        ))

def seed_projects_catalog(cursor):
    projects = [
        # AI/ML
        {
            "role_id": "ai_ml_engineer",
            "title": "Crop Disease Detection using CNN & Transfer Learning",
            "description": "An end-to-end computer vision web platform that takes leaf images, classifies 14 distinct plant diseases using a fine-tuned MobileNetV2, and recommends pesticide treatments.",
            "skills_developed": ["Computer Vision", "PyTorch / TensorFlow", "FastAPI", "Docker", "Model Quantization"],
            "difficulty": "Intermediate",
            "estimated_duration": "3 - 4 Weeks",
            "repo_starter_url": "https://github.com/topics/plant-disease-detection",
            "architecture_summary": "Client UI -> FastAPI Gateway -> ONNX Runtime Model Worker -> Result JSON with treatment recommendations.",
            "key_deliverables": ["Trained CNN with >94% validation accuracy", "REST API with image multipart upload", "Dockerized container ready for deployment"]
        },
        {
            "role_id": "ai_ml_engineer",
            "title": "Placement CTC Predictor & Resume Skill Extraction System",
            "description": "An NLP & regression engine that parses PDF student resumes, extracts technical skills using spaCy entity ruler, and predicts expected placement tier based on past campus trends.",
            "skills_developed": ["Natural Language Processing (NLP)", "spaCy", "Scikit-Learn", "Feature Engineering", "Streamlit"],
            "difficulty": "Advanced",
            "estimated_duration": "4 Weeks",
            "repo_starter_url": "https://github.com/topics/resume-parser",
            "architecture_summary": "PDF Resume Upload -> PyPDF2 / pdfplumber -> spaCy NER Pipeline -> TF-IDF Vectorizer -> Gradient Boosted Regressor -> Explainable Dashboard.",
            "key_deliverables": ["Custom NER skill extractor for 100+ CS competencies", "Model evaluation with MAE and R2 metrics", "Visual SHAP explainability plot"]
        },

        # Software Developer
        {
            "role_id": "software_developer",
            "title": "Distributed In-Memory Key-Value Cache Engine",
            "description": "A high-concurrency lightweight in-memory cache supporting LRU eviction, TTL expiration, thread-safe concurrent reads/writes, and a TCP client-server protocol.",
            "skills_developed": ["C++ / Java", "Multithreading & Mutexes", "TCP Sockets", "LRU Eviction (Hashmap + Doubly Linked List)", "Unit Testing"],
            "difficulty": "Advanced",
            "estimated_duration": "3 - 4 Weeks",
            "repo_starter_url": "https://github.com/topics/key-value-store",
            "architecture_summary": "TCP Server Socket Listener -> Thread Pool Worker Queue -> Thread-Safe Hash Map with R/W Locks -> Doubly-Linked LRU Chain.",
            "key_deliverables": ["Thread-safe GET, SET, DEL, EXPIRE commands", "Benchmarked 50,000 requests/sec throughput", "Full GoogleTest / JUnit test suite"]
        },
        {
            "role_id": "software_developer",
            "title": "College Campus Placement Portal with Role-Based Access",
            "description": "A complete student-recruiter-coordinator placement management system featuring drive scheduling, shortlisting filters, interview slot booking, and exportable analytics.",
            "skills_developed": ["Java Spring Boot / Python Flask", "MySQL Relational Schema", "JWT Authentication", "Role-Based Access Control (RBAC)"],
            "difficulty": "Intermediate",
            "estimated_duration": "3 Weeks",
            "repo_starter_url": "https://github.com/topics/placement-management-system",
            "architecture_summary": "React SPA -> Spring Boot / Flask REST Controller -> Service Layer -> JPA / SQLAlchemy DAO -> PostgreSQL Database.",
            "key_deliverables": ["Normalized 3NF relational database schema", "Automated email notifications on shortlisting", "Admin dashboard with placement percentage analytics"]
        },

        # Full Stack
        {
            "role_id": "full_stack_developer",
            "title": "Real-Time Collaborative Code Editor & Pair Programming App",
            "description": "A browser-based code workspace with syntax highlighting, live multi-cursor synchronization via WebSockets, and integrated code execution runner.",
            "skills_developed": ["React.js", "WebSockets / Socket.io", "Node.js", "Monaco Code Editor", "State Synchronization"],
            "difficulty": "Advanced",
            "estimated_duration": "4 Weeks",
            "repo_starter_url": "https://github.com/topics/collaborative-editor",
            "architecture_summary": "React Monaco Editor -> Socket.io Client -> Node.js WebSocket Room Hub -> Operational Transform / CRDT Engine -> Sandbox Execution API.",
            "key_deliverables": ["Sub-50ms peer cursor syncing", "Multi-language syntax highlighting", "Room join codes with temporary chat"]
        },

        # Data Analyst
        {
            "role_id": "data_analyst",
            "title": "Campus Placement Analytics & Salary Trend Dashboard",
            "description": "An interactive BI dashboard analyzing 5 years of historical engineering placement records across branches, CGPA brackets, company tiers, and skill profiles.",
            "skills_developed": ["Power BI / Tableau", "Advanced SQL", "Pandas Data Cleaning", "Statistical Correlation", "Executive KPI Design"],
            "difficulty": "Intermediate",
            "estimated_duration": "2 - 3 Weeks",
            "repo_starter_url": "https://github.com/topics/data-analysis-dashboard",
            "architecture_summary": "Raw CSV / SQL Database -> Python Cleaning Script -> Power Query Star Schema -> Interactive Drilldown DAX Visuals.",
            "key_deliverables": ["Interactive branch-wise CTC comparison charts", "Predictive student placement readiness scatterplot", "PDF Executive summary report"]
        },

        # Cybersecurity
        {
            "role_id": "cybersecurity_analyst",
            "title": "Automated Port Scanner & Vulnerability Auditing Tool",
            "description": "A Python-based CLI security auditor that inspects target IP address ports, grabs server service banners, checks for unpatched CVEs, and exports HTML audit reports.",
            "skills_developed": ["Python Socket Programming", "Nmap Scripting Engine", "CVE Database API Integration", "Network Reconnaissance", "HTML Reporting"],
            "difficulty": "Intermediate",
            "estimated_duration": "3 Weeks",
            "repo_starter_url": "https://github.com/topics/vulnerability-scanner",
            "architecture_summary": "Multi-threaded Socket Scanner -> Banner Grabber -> National Vulnerability Database (NVD) REST API Query -> Severity Matrix -> HTML Report Generator.",
            "key_deliverables": ["Multi-threaded scanner inspecting 1000 ports in <15 seconds", "NVD CVE matching with CVSS scores", "Actionable remediation checklists"]
        },

        # Cloud & DevOps
        {
            "role_id": "cloud_devops_engineer",
            "title": "Zero-Downtime Microservice CI/CD Pipeline on AWS",
            "description": "A production-grade delivery pipeline implementing automated unit tests, Docker container builds, push to AWS ECR, and rolling deployment to ECS Fargate.",
            "skills_developed": ["GitHub Actions", "Docker", "AWS ECR & ECS", "Terraform", "CloudWatch Monitoring"],
            "difficulty": "Advanced",
            "estimated_duration": "3 - 4 Weeks",
            "repo_starter_url": "https://github.com/topics/devops-pipeline",
            "architecture_summary": "Git Push -> GitHub Actions CI (Test & Build) -> Docker Image -> Amazon ECR -> Amazon ECS Fargate Rolling Update -> Route53 / ALB.",
            "key_deliverables": ["Terraform IaC scripts for VPC and ECS cluster", "GitHub Actions YAML workflow with secret management", "CloudWatch alarm notifications to Slack"]
        }
    ]

    for p in projects:
        cursor.execute("""
        INSERT INTO projects_catalog 
        (role_id, title, description, skills_developed, difficulty, estimated_duration, repo_starter_url, architecture_summary, key_deliverables)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            p["role_id"],
            p["title"],
            p["description"],
            json.dumps(p["skills_developed"]),
            p["difficulty"],
            p["estimated_duration"],
            p["repo_starter_url"],
            p["architecture_summary"],
            json.dumps(p["key_deliverables"])
        ))

def seed_certifications_catalog(cursor):
    certs = [
        # AI/ML
        {
            "role_id": "ai_ml_engineer",
            "title": "Deep Learning Specialization by Andrew Ng",
            "provider": "Coursera / DeepLearning.AI",
            "skills_covered": ["Neural Networks", "CNNs", "Sequence Models", "Hyperparameter Tuning", "Structuring ML Projects"],
            "cost_type": "Paid with Financial Aid Available",
            "prep_time_weeks": 8,
            "exam_code": "DLS-001",
            "official_url": "https://www.coursera.org/specializations/deep-learning",
            "industry_recognition": "Gold Standard Global Industry Benchmark"
        },
        {
            "role_id": "ai_ml_engineer",
            "title": "TensorFlow Developer Certificate",
            "provider": "Google / TensorFlow Certificate Network",
            "skills_covered": ["TensorFlow 2.x", "Image Classification", "NLP Sentiment Analysis", "Time Series Forecasting"],
            "cost_type": "Paid ($100 USD)",
            "prep_time_weeks": 6,
            "exam_code": "TF-DEV",
            "official_url": "https://www.tensorflow.org/certificate",
            "industry_recognition": "Google Certified Credential"
        },

        # SDE
        {
            "role_id": "software_developer",
            "title": "Oracle Certified Associate: Java SE Programmer (OCAJP)",
            "provider": "Oracle University",
            "skills_covered": ["Core Java", "OOP", "Exception Handling", "Java Collections Framework", "Lambda Expressions"],
            "cost_type": "Paid",
            "prep_time_weeks": 6,
            "exam_code": "1Z0-808",
            "official_url": "https://education.oracle.com/java-se-8-programmer-i/pexam_1Z0-808",
            "industry_recognition": "High enterprise recognition (TCS, Infosys, Wipro, Cognizant)"
        },
        {
            "role_id": "software_developer",
            "title": "AWS Certified Developer – Associate",
            "provider": "Amazon Web Services",
            "skills_covered": ["AWS Lambda", "DynamoDB", "API Gateway", "S3", "CI/CD Deployment", "Cloud Security"],
            "cost_type": "Paid ($150 USD with student discounts)",
            "prep_time_weeks": 8,
            "exam_code": "DVA-C02",
            "official_url": "https://aws.amazon.com/certification/certified-developer-associate/",
            "industry_recognition": "Globally Top-Ranked Cloud Dev Credential"
        },

        # Full Stack
        {
            "role_id": "full_stack_developer",
            "title": "Meta Front-End Developer Professional Certificate",
            "provider": "Coursera / Meta",
            "skills_covered": ["HTML5/CSS3", "JavaScript ES6+", "React.js", "Version Control", "UX Design & Figma"],
            "cost_type": "Paid with Financial Aid Available",
            "prep_time_weeks": 10,
            "exam_code": "META-FED",
            "official_url": "https://www.coursera.org/professional-certificates/meta-front-end-developer",
            "industry_recognition": "Meta Verified Professional Credential"
        },
        {
            "role_id": "full_stack_developer",
            "title": "freeCodeCamp Full Stack Developer Certification",
            "provider": "freeCodeCamp.org",
            "skills_covered": ["Responsive Web Design", "JavaScript Algorithms", "Front End Libraries", "Relational Database", "Back End Development"],
            "cost_type": "100% Free",
            "prep_time_weeks": 12,
            "exam_code": "FCC-FULLSTACK",
            "official_url": "https://www.freecodecamp.org/certification",
            "industry_recognition": "Widely Respected Practical Portfolio Proof"
        },

        # Data Analyst
        {
            "role_id": "data_analyst",
            "title": "Google Data Analytics Professional Certificate",
            "provider": "Coursera / Google",
            "skills_covered": ["Spreadsheets & Formulas", "SQL Querying", "Tableau Visualizations", "R Programming", "Data Storytelling"],
            "cost_type": "Paid with Financial Aid Available",
            "prep_time_weeks": 8,
            "exam_code": "GDA-001",
            "official_url": "https://www.coursera.org/professional-certificates/google-data-analytics",
            "industry_recognition": "Direct consideration in Google Career Certificates employer network"
        },
        {
            "role_id": "data_analyst",
            "title": "Microsoft Certified: Power BI Data Analyst Associate",
            "provider": "Microsoft Learn",
            "skills_covered": ["Power BI", "DAX Formulas", "Power Query", "Data Modeling", "Dashboard Security"],
            "cost_type": "Paid ($165 USD)",
            "prep_time_weeks": 6,
            "exam_code": "PL-300",
            "official_url": "https://learn.microsoft.com/en-us/credentials/certifications/data-analyst-associate/",
            "industry_recognition": "Industry Standard for Business Intelligence"
        },

        # Cybersecurity
        {
            "role_id": "cybersecurity_analyst",
            "title": "CompTIA Security+",
            "provider": "CompTIA",
            "skills_covered": ["Threats & Attacks", "Architecture & Design", "Implementation", "Operations & Incident Response", "Governance"],
            "cost_type": "Paid",
            "prep_time_weeks": 8,
            "exam_code": "SY0-701",
            "official_url": "https://www.comptia.org/certifications/security",
            "industry_recognition": "Global baseline requirement for InfoSec positions"
        },

        # Cloud & DevOps
        {
            "role_id": "cloud_devops_engineer",
            "title": "AWS Certified Solutions Architect – Associate",
            "provider": "Amazon Web Services",
            "skills_covered": ["Resilient Architectures", "High-Performing Architectures", "Secure Applications", "Cost-Optimized Architectures"],
            "cost_type": "Paid ($150 USD)",
            "prep_time_weeks": 8,
            "exam_code": "SAA-C03",
            "official_url": "https://aws.amazon.com/certification/certified-solutions-architect-associate/",
            "industry_recognition": "Top-tier Cloud credential globally"
        }
    ]

    for c in certs:
        cursor.execute("""
        INSERT INTO certifications_catalog 
        (role_id, title, provider, skills_covered, cost_type, prep_time_weeks, exam_code, official_url, industry_recognition)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            c["role_id"],
            c["title"],
            c["provider"],
            json.dumps(c["skills_covered"]),
            c["cost_type"],
            c["prep_time_weeks"],
            c["exam_code"],
            c["official_url"],
            c["industry_recognition"]
        ))

def seed_placement_questions(cursor):
    questions = [
        # Aptitude Questions
        {
            "category": "Aptitude",
            "subcategory": "Time and Work",
            "question_text": "A can finish a software module in 12 days, while B can finish the same module in 18 days. If they work together on the module, in how many days will it be completed?",
            "code_snippet": None,
            "options": ["7.2 days", "8.0 days", "6.5 days", "7.5 days"],
            "correct_option_index": 0,
            "explanation": "Work done by A in 1 day = 1/12. Work done by B in 1 day = 1/18. Combined 1 day work = 1/12 + 1/18 = (3 + 2)/36 = 5/36. Therefore, total days required = 36/5 = 7.2 days.",
            "difficulty": "Easy"
        },
        {
            "category": "Aptitude",
            "subcategory": "Percentages & Profit",
            "question_text": "A tech laptop is sold at a profit of 20%. If both the cost price and selling price were Rs. 2,000 less, the profit percentage would have been 25%. What is the original cost price of the laptop?",
            "code_snippet": None,
            "options": ["Rs. 10,000", "Rs. 12,000", "Rs. 14,000", "Rs. 8,000"],
            "correct_option_index": 0,
            "explanation": "Let original CP = x. SP = 1.20x. New CP = (x - 2000), New SP = (1.20x - 2000). New Profit % = 25%, so New SP = 1.25 * New CP. => 1.20x - 2000 = 1.25(x - 2000) => 1.20x - 2000 = 1.25x - 2500 => 0.05x = 500 => x = 10,000.",
            "difficulty": "Medium"
        },
        {
            "category": "Aptitude",
            "subcategory": "Speed, Time & Distance",
            "question_text": "A train running at 72 km/h crosses a 160-meter long railway platform in 18 seconds. What is the length of the train in meters?",
            "code_snippet": None,
            "options": ["200 m", "240 m", "180 m", "160 m"],
            "correct_option_index": 0,
            "explanation": "Speed = 72 * (5/18) = 20 m/s. Total distance crossed = Speed * Time = 20 * 18 = 360 meters. Distance = Train Length + Platform Length => Train Length = 360 - 160 = 200 meters.",
            "difficulty": "Medium"
        },
        {
            "category": "Aptitude",
            "subcategory": "Permutations & Probability",
            "question_text": "From a team of 4 front-end engineers and 6 back-end engineers, a sprint committee of 4 members is to be formed. What is the probability that exactly 2 front-end and 2 back-end engineers are chosen?",
            "code_snippet": None,
            "options": ["3/7", "5/14", "9/21", "2/7"],
            "correct_option_index": 0,
            "explanation": "Total ways to choose 4 members from 10 = 10C4 = 210. Favorable ways = 4C2 * 6C2 = 6 * 15 = 90. Probability = 90 / 210 = 3/7 (approx 42.86%).",
            "difficulty": "Hard"
        },
        {
            "category": "Aptitude",
            "subcategory": "Ratios & Mixtures",
            "question_text": "Two data storage clusters A and B contain SSD to HDD in ratios 5:3 and 7:9 respectively. If equal storage units are taken from both clusters and merged into a backup cluster C, what is the ratio of SSD to HDD in cluster C?",
            "code_snippet": None,
            "options": ["17:15", "15:17", "11:13", "13:11"],
            "correct_option_index": 0,
            "explanation": "In Cluster A: SSD fraction = 5/8, HDD fraction = 3/8 = 10/16 and 6/16. In Cluster B: SSD fraction = 7/16, HDD fraction = 9/16. Total SSD = 10/16 + 7/16 = 17/16. Total HDD = 6/16 + 9/16 = 15/16. Ratio = 17:15.",
            "difficulty": "Medium"
        },

        # Logical Reasoning
        {
            "category": "Logical Reasoning",
            "subcategory": "Coding-Decoding",
            "question_text": "In a certain recruitment cipher, if 'PYTHON' is coded as 'QZWIKM', how will 'SERVER' be coded in the same cipher?",
            "code_snippet": None,
            "options": ["TFUSFQ", "TFUWFT", "SDUFSD", "TFUDSS"],
            "correct_option_index": 0,
            "explanation": "Pattern: Alternating +1, -1 for each letter: P(+1)=Q, Y(-1)=X... Wait: P->Q (+1), Y->Z (+1), T->W (+3), H->I (+1), O->K (-4), N->M (-1). In strict cipher +1 on consonants, -1 on vowels: S(+1)=T, E(-1)=D or standard pattern (+1, -1, +1, -1, +1, -1): S(+1)=T, E(-1)=D, R(+1)=S, V(-1)=U, E(+1)=F, R(-1)=Q => 'TFUSFQ' matching alternating shifts.",
            "difficulty": "Easy"
        },
        {
            "category": "Logical Reasoning",
            "subcategory": "Blood Relations",
            "question_text": "Pointing to a photograph of a tech startup founder, Ananya says: 'He is the son of the only son of my grandfather.' How is Ananya related to the founder in the photograph?",
            "code_snippet": None,
            "options": ["Sister", "Mother", "Aunt", "Cousin"],
            "correct_option_index": 0,
            "explanation": "'Only son of my grandfather' refers to Ananya's father. 'The son of Ananya's father' is Ananya's brother. Thus, Ananya is the sister of the person in the photograph.",
            "difficulty": "Easy"
        },
        {
            "category": "Logical Reasoning",
            "subcategory": "Syllogisms",
            "question_text": "Statements:\n1. All developers are problem solvers.\n2. Some problem solvers are designers.\n\nConclusions:\nI. Some designers are developers.\nII. Some problem solvers are developers.",
            "code_snippet": None,
            "options": ["Only Conclusion II follows", "Only Conclusion I follows", "Both Conclusions follow", "Neither Conclusion follows"],
            "correct_option_index": 0,
            "explanation": "From statement 1 ('All developers are problem solvers'), by conversion 'Some problem solvers are developers' is strictly valid (Conclusion II follows). However, there is no direct intersection guaranteed between developers and designers, so Conclusion I does not necessarily follow.",
            "difficulty": "Medium"
        },
        {
            "category": "Logical Reasoning",
            "subcategory": "Number Series",
            "question_text": "Find the missing number in the sequence: 4, 18, 48, 100, 180, ?",
            "code_snippet": None,
            "options": ["294", "280", "296", "312"],
            "correct_option_index": 0,
            "explanation": "The pattern follows n^2 * (n + 1) or n^3 - n^2:\nFor n=2: 2^3 - 2^2 = 8 - 4 = 4\nFor n=3: 3^3 - 3^2 = 27 - 9 = 18\nFor n=4: 4^3 - 4^2 = 64 - 16 = 48\nFor n=5: 5^3 - 5^2 = 125 - 25 = 100\nFor n=6: 6^3 - 6^2 = 216 - 36 = 180\nFor n=7: 7^3 - 7^2 = 343 - 49 = 294.",
            "difficulty": "Hard"
        },

        # Verbal Ability
        {
            "category": "Verbal Ability",
            "subcategory": "Sentence Correction",
            "question_text": "Select the grammatically correct sentence from the following options:",
            "code_snippet": None,
            "options": [
                "Neither the project manager nor the software engineers were aware of the production bug.",
                "Neither the project manager nor the software engineers was aware of the production bug.",
                "Neither the project manager or the software engineers were aware of the production bug.",
                "Neither the project manager nor the software engineers had no awareness of the bug."
            ],
            "correct_option_index": 0,
            "explanation": "Rule of proximity for correlative conjunctions 'neither... nor': when subjects are joined by 'neither... nor', the verb must agree in number with the closer subject ('software engineers' is plural, so plural verb 'were' is required). Option 4 also creates a double negative.",
            "difficulty": "Medium"
        },
        {
            "category": "Verbal Ability",
            "subcategory": "Vocabulary & Antonyms",
            "question_text": "Choose the word that is most nearly OPPOSITE in meaning to 'EPHEMERAL':",
            "code_snippet": None,
            "options": ["Permanent", "Transient", "Fugitive", "Fleeting"],
            "correct_option_index": 0,
            "explanation": "'Ephemeral' means lasting for a very short time (transient, fleeting). The exact opposite is 'Permanent' (enduring, everlasting).",
            "difficulty": "Easy"
        },
        {
            "category": "Verbal Ability",
            "subcategory": "Error Spotting",
            "question_text": "Identify the part of the sentence with an error: 'The team of junior developers (A) / have successfully resolved (B) / all critical issues (C) / reported in the backlog (D).'",
            "code_snippet": None,
            "options": ["Part (B) 'have successfully resolved'", "Part (A) 'The team of junior developers'", "Part (C) 'all critical issues'", "Part (D) 'reported in the backlog'"],
            "correct_option_index": 0,
            "explanation": "The head subject of the sentence is the collective noun 'The team' (singular), not the modifier 'junior developers'. Hence, the singular auxiliary verb 'has' should be used instead of 'have': 'The team... has successfully resolved'.",
            "difficulty": "Medium"
        },

        # Technical Core
        {
            "category": "Technical Core",
            "subcategory": "Object-Oriented Programming",
            "question_text": "Which OOP concept is demonstrated when a subclass provides a specific implementation of a method that is already provided by its superclass?",
            "code_snippet": None,
            "options": ["Method Overriding (Runtime Polymorphism)", "Method Overloading (Compile-time Polymorphism)", "Encapsulation", "Multiple Inheritance"],
            "correct_option_index": 0,
            "explanation": "Method Overriding occurs when a derived class defines a method with the same name, return type, and parameter signature as a method in its base class, resolved at runtime via dynamic dispatch (virtual table).",
            "difficulty": "Easy"
        },
        {
            "category": "Technical Core",
            "subcategory": "DBMS & SQL",
            "question_text": "In relational database management systems, which normal form eliminates transitive dependencies between non-prime attributes?",
            "code_snippet": None,
            "options": ["Third Normal Form (3NF)", "Second Normal Form (2NF)", "First Normal Form (1NF)", "Boyce-Codd Normal Form (BCNF)"],
            "correct_option_index": 0,
            "explanation": "1NF removes duplicate columns and requires atomic values. 2NF removes partial functional dependencies on a composite candidate key. 3NF removes transitive dependencies (X -> Y and Y -> Z where Z is non-prime).",
            "difficulty": "Medium"
        },
        {
            "category": "Technical Core",
            "subcategory": "Operating Systems",
            "question_text": "Which of the following conditions is NOT one of Coffman's four mandatory conditions required for a Deadlock to occur?",
            "code_snippet": None,
            "options": ["Preemption allowed by kernel", "Mutual Exclusion", "Hold and Wait", "Circular Wait"],
            "correct_option_index": 0,
            "explanation": "The four Coffman conditions are: 1. Mutual Exclusion, 2. Hold and Wait, 3. No Preemption (resources cannot be forcibly reclaimed), and 4. Circular Wait. If preemption is allowed, deadlock cannot occur.",
            "difficulty": "Medium"
        },
        {
            "category": "Technical Core",
            "subcategory": "Computer Networks",
            "question_text": "During the TCP 3-way handshake to establish a connection between Client and Server, which flags are sent in the second packet (from Server to Client)?",
            "code_snippet": None,
            "options": ["SYN + ACK", "SYN only", "ACK only", "FIN + ACK"],
            "correct_option_index": 0,
            "explanation": "TCP 3-way handshake steps:\n1. Client -> Server: SYN (synchronize sequence number)\n2. Server -> Client: SYN + ACK (acknowledge client sequence + send server sequence)\n3. Client -> Server: ACK (acknowledge server sequence).",
            "difficulty": "Easy"
        },
        {
            "category": "Technical Core",
            "subcategory": "Data Structures",
            "question_text": "What is the worst-case time complexity of searching for an element in a Balanced Binary Search Tree (such as an AVL Tree or Red-Black Tree) containing N elements?",
            "code_snippet": None,
            "options": ["O(log N)", "O(N)", "O(N log N)", "O(1)"],
            "correct_option_index": 0,
            "explanation": "Because AVL and Red-Black trees strictly enforce self-balancing criteria ensuring height h <= 1.44 log2(N), the search path is strictly bounded by tree height, guaranteeing O(log N) worst-case time complexity.",
            "difficulty": "Easy"
        },

        # Coding Practice
        {
            "category": "Coding Practice",
            "subcategory": "Two Pointers / Arrays",
            "question_text": "Given an integer array 'nums' and an integer 'target', return indices of the two numbers such that they add up to target. What is the optimal time and space complexity using a Hash Map?",
            "code_snippet": "def two_sum(nums: list[int], target: int) -> list[int]:\n    seen = {}\n    for i, num in enumerate(nums):\n        diff = target - num\n        if diff in seen:\n            return [seen[diff], i]\n        seen[num] = i\n    return []",
            "options": ["Time: O(N), Space: O(N)", "Time: O(N^2), Space: O(1)", "Time: O(N log N), Space: O(1)", "Time: O(1), Space: O(N)"],
            "correct_option_index": 0,
            "explanation": "A single pass through the array performs O(1) hash map lookups for the complement (target - num). If present, indices are returned. At most N elements are stored in the dictionary, giving O(N) linear time and O(N) space complexity.",
            "difficulty": "Easy"
        },
        {
            "category": "Coding Practice",
            "subcategory": "Sliding Window",
            "question_text": "What is the length of the longest substring without repeating characters in the string 'abcabcbb'?",
            "code_snippet": "def length_of_longest_substring(s: str) -> int:\n    char_map = {}\n    left = max_len = 0\n    for right, char in enumerate(s):\n        if char in char_map and char_map[char] >= left:\n            left = char_map[char] + 1\n        char_map[char] = right\n        max_len = max(max_len, right - left + 1)\n    return max_len",
            "options": ["3 (substring 'abc')", "4 (substring 'abca')", "2 (substring 'ab')", "5 (substring 'abcab')"],
            "correct_option_index": 0,
            "explanation": "The sliding window expands to include 'a', 'b', 'c' (length 3). When the second 'a' is encountered at index 3, the left boundary slides to index 1 ('b'). The maximum window size observed without duplicate characters is 3.",
            "difficulty": "Medium"
        }
    ]

    for q in questions:
        cursor.execute("""
        INSERT INTO placement_questions 
        (category, subcategory, question_text, code_snippet, options, correct_option_index, explanation, difficulty)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            q["category"],
            q["subcategory"],
            q["question_text"],
            q["code_snippet"],
            json.dumps(q["options"]),
            q["correct_option_index"],
            q["explanation"],
            q["difficulty"]
        ))

def seed_hr_interview_questions(cursor):
    hr_questions = [
        {
            "category": "General HR",
            "question_text": "Tell me about yourself and your journey in technology.",
            "context_objective": "Evaluates elevator pitch clarity, communication structure, academic focus, passion for software engineering, and cultural fit.",
            "star_approach": {
                "situation": "Start with your present academic background (degree, department, college) and primary technical domain.",
                "task": "Highlight key milestones: core projects, technologies mastered, hackathons, and certifications.",
                "action": "Describe how you solve real challenges (e.g. debugging, building web apps, ML pipelines) and your collaborative team experiences.",
                "result": "Conclude with why you are excited about this specific role and what impact you aim to deliver."
            },
            "sample_answer": "I am a 3rd-year Computer Science student passionate about building scalable, data-driven applications. Over the past two years, I have built a solid foundation in Data Structures, Python, and Full Stack development. For instance, I recently developed a Crop Disease Detection platform utilizing Deep Learning and FastAPI, where I improved inference latency by 35% through containerization. Beyond code, I actively mentor junior batchmates in competitive programming. I am eager to contribute my problem-solving skills and technical curiosity to your engineering team as a Software / ML Engineer.",
            "dos_and_donts": {
                "dos": ["Keep response under 2 minutes", "Focus on technical impact & measurable outcomes", "Tailor closing sentence to the hiring company"],
                "donts": ["Do not recite your high school marks chronologically", "Avoid generic claims like 'I am hardworking' without proof", "Do not sound memorized"]
            }
        },
        {
            "category": "Behavioral",
            "question_text": "Describe a challenging situation where you faced a major obstacle during a group project. How did you resolve it?",
            "context_objective": "Assesses conflict resolution, adaptability, teamwork, ownership, and emotional intelligence under pressure.",
            "star_approach": {
                "situation": "During our final semester capstone project, our team had two weeks before demo day when the third-party payment API we relied on changed its authentication protocol, breaking our main workflow.",
                "task": "As technical lead, I needed to keep the team calm, identify an alternative integration or adapt our architecture without missing the deadline.",
                "action": "I scheduled an emergency standup, divided tasks into API mock testing and webhook re-routing, and paired with our backend engineer to implement JWT fallback authentication within 48 hours.",
                "result": "We delivered our demo on schedule with 100% test coverage and earned the top departmental grade. It reinforced the importance of proactive decoupling and transparent communication."
            },
            "sample_answer": "During our campus hackathon, 12 hours before final presentation, our database migrations corrupted our demo user records. Rather than pointing fingers, I immediately initialized our automated backup snapshot, drafted an emergency triage checklist, and split the remaining tasks with my teammate. We restored the pipeline in under 90 minutes and presented a flawless live demo, placing in the top 3 teams.",
            "dos_and_donts": {
                "dos": ["Use 'I' for individual contributions while acknowledging team effort", "Highlight resilience and calm problem solving", "Focus on the positive learning outcome"],
                "donts": ["Never speak negatively of former teammates or professors", "Avoid vague endings without clear resolution metrics"]
            }
        },
        {
            "category": "Situational",
            "question_text": "What are your greatest strengths and an area you are actively working to improve (weakness)?",
            "context_objective": "Tests self-awareness, honesty, growth mindset, and intentional self-improvement.",
            "star_approach": {
                "situation": "Reflect on how your analytical habits help in software delivery, and pick a genuine technical or professional area of growth.",
                "task": "Demonstrate the concrete steps, courses, or habits you have put in place to address the weakness.",
                "action": "Mention books read, certifications pursued, or systems built.",
                "result": "Show steady measurable progress."
            },
            "sample_answer": "My greatest strength is my structured approach to debugging and analytical problem-solving; when faced with complex production issues, I isolate variables methodically rather than making blind guesses. An area I am actively improving is public speaking to large audiences. To address this, I volunteered to present our weekly tech club seminars and enrolled in Toastmasters workshops, which has noticeably boosted my confidence in presenting technical designs.",
            "dos_and_donts": {
                "dos": ["Choose a genuine weakness that isn't a core fatal flaw (e.g., perfectionism in design balance)", "Always explain the concrete steps you are taking to improve"],
                "donts": ["Never say 'I have no weaknesses'", "Do not use cliché humble-brags like 'I work too hard'"]
            }
        }
    ]

    for hr in hr_questions:
        cursor.execute("""
        INSERT INTO hr_interview_questions 
        (category, question_text, context_objective, star_approach, sample_answer, dos_and_donts)
        VALUES (?, ?, ?, ?, ?, ?)
        """, (
            hr["category"],
            hr["question_text"],
            hr["context_objective"],
            json.dumps(hr["star_approach"]),
            hr["sample_answer"],
            json.dumps(hr["dos_and_donts"])
        ))

def seed_sample_student(cursor):
    # Sample student: demo@student.edu / Password123
    pwd_hash = generate_password_hash("Password123")
    cursor.execute("""
    INSERT OR REPLACE INTO students 
    (id, email, password_hash, full_name, department, year_of_study, roll_no, cgpa, tenth_marks, twelfth_marks, college_name)
    VALUES (1, 'demo@student.edu', ?, 'Gayathri R.', 'Computer Science & Engineering', '3rd Year', 'CS2023-042', 8.65, 94.5, 91.2, 'National Institute of Technology')
    """, (pwd_hash,))

    technical_skills = [
        {"name": "Python", "level": "Intermediate", "years": 2},
        {"name": "Data Structures & Algorithms", "level": "Intermediate", "years": 2},
        {"name": "Machine Learning", "level": "Beginner", "years": 1},
        {"name": "SQL", "level": "Intermediate", "years": 2},
        {"name": "HTML5 & Modern CSS", "level": "Advanced", "years": 2},
        {"name": "JavaScript", "level": "Intermediate", "years": 1},
        {"name": "C++", "level": "Intermediate", "years": 2},
        {"name": "Git & GitHub", "level": "Intermediate", "years": 2}
    ]

    soft_skills = ["Analytical Thinking", "Problem Solving", "Adaptability", "Teamwork", "Written Communication"]
    interests = ["Artificial Intelligence", "Machine Learning", "Full Stack Web Development", "Cloud Computing"]
    
    projects = [
        {
            "title": "Crop Disease Detection using CNN",
            "description": "Developed a deep learning model using PyTorch and Transfer Learning (MobileNetV2) to identify 10 plant leaf diseases with 92% validation accuracy. Created a FastAPI backend.",
            "tech_stack": ["Python", "PyTorch", "FastAPI", "OpenCV"],
            "github_url": "https://github.com/demo/crop-disease-detection"
        },
        {
            "title": "Student Attendance Management System",
            "description": "Built a full stack web app for campus classroom attendance recording with role-based auth, automated monthly PDF reports, and export to Excel.",
            "tech_stack": ["HTML5", "CSS3", "JavaScript", "Python Flask", "SQLite"],
            "github_url": "https://github.com/demo/attendance-portal"
        }
    ]

    certifications = [
        {"title": "Python for Data Science and AI", "provider": "IBM / Coursera", "year": "2024"},
        {"title": "Responsive Web Design Certification", "provider": "freeCodeCamp", "year": "2023"}
    ]

    career_preferences = {
        "preferred_role": "AI / ML Engineer",
        "work_mode": "Hybrid",
        "company_type": "Product Companies & AI Labs",
        "preferred_locations": ["Bangalore", "Hyderabad", "Chennai", "Remote"]
    }

    cursor.execute("""
    INSERT OR REPLACE INTO student_profiles 
    (student_id, technical_skills, soft_skills, interests, projects, certifications, career_preferences, selected_goal_role, bio)
    VALUES (1, ?, ?, ?, ?, ?, ?, 'ai_ml_engineer', '3rd-year CS student passionate about building intelligent algorithms, clean web services, and solving real-world challenges.')
    """, (
        json.dumps(technical_skills),
        json.dumps(soft_skills),
        json.dumps(interests),
        json.dumps(projects),
        json.dumps(certifications),
        json.dumps(career_preferences)
    ))

    # Pre-populate some roadmap progress for this student
    cursor.execute("DELETE FROM user_roadmap_progress WHERE student_id = 1")
    cursor.execute("""
    INSERT INTO user_roadmap_progress (student_id, resource_id, status)
    VALUES 
    (1, 1, 'completed'),
    (1, 2, 'in_progress'),
    (1, 3, 'not_started'),
    (1, 4, 'not_started')
    """)

    # Pre-populate sample placement attempts
    cursor.execute("DELETE FROM user_placement_attempts WHERE student_id = 1")
    cursor.execute("""
    INSERT INTO user_placement_attempts (student_id, category, subcategory, score, total_questions, percentage, answers_json)
    VALUES 
    (1, 'Aptitude', 'Diagnostic Test', 4, 5, 80.0, '{"0": 0, "1": 0, "2": 0, "3": 1, "4": 0}'),
    (1, 'Technical Core', 'CS Fundamentals', 4, 5, 80.0, '{"0": 0, "1": 0, "2": 1, "3": 0, "4": 0}')
    """)

    # Pre-populate activity logs
    cursor.execute("DELETE FROM user_activity_log WHERE student_id = 1")
    cursor.execute("""
    INSERT INTO user_activity_log (student_id, activity_type, activity_title, details)
    VALUES 
    (1, 'roadmap_completed', 'Completed Python for Data Science', 'Finished Phase 1 module on NumPy and Vectorization'),
    (1, 'quiz_attempted', 'Scored 80% on Aptitude Diagnostic', 'Answered 4 out of 5 questions correctly'),
    (1, 'profile_updated', 'Updated Skill Proficiency', 'Set Python proficiency to Intermediate')
    """)

def run_seeder():
    init_db()
    conn = get_db()
    cursor = conn.cursor()

    print("Seeding Career Roles...")
    seed_career_roles(cursor)

    print("Seeding Learning Resources...")
    seed_learning_resources(cursor)

    print("Seeding Projects Catalog...")
    seed_projects_catalog(cursor)

    print("Seeding Certifications Catalog...")
    seed_certifications_catalog(cursor)

    print("Seeding Placement Questions...")
    seed_placement_questions(cursor)

    print("Seeding HR Interview Questions...")
    seed_hr_interview_questions(cursor)

    print("Seeding Demo Student Profile...")
    seed_sample_student(cursor)

    conn.commit()
    conn.close()
    print("Database seeding completed successfully!")

if __name__ == "__main__":
    run_seeder()
