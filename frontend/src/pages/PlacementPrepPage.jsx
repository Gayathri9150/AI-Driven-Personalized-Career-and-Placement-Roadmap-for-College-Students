import React, { useState, useEffect } from 'react';
import {
  GraduationCap,
  Calculator,
  Brain,
  BookA,
  Binary,
  Code2,
  Users2,
  CheckCircle2,
  XCircle,
  HelpCircle,
  Clock,
  RotateCcw,
  Sparkles,
  ChevronRight,
  Award
} from 'lucide-react';
import { api } from '../api';

const CATEGORY_ICONS = {
  'Aptitude': Calculator,
  'Logical Reasoning': Brain,
  'Verbal Ability': BookA,
  'Technical Core': Binary,
  'Coding Practice': Code2
};

export default function PlacementPrepPage({ onQuizCompleted }) {
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [activeSection, setActiveSection] = useState('practice'); // 'practice' or 'hr_prep'

  // Quiz Runner States
  const [questions, setQuestions] = useState([]);
  const [userAnswers, setUserAnswers] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [quizResult, setQuizResult] = useState(null);

  // HR Questions State
  const [hrQuestions, setHrQuestions] = useState([]);

  useEffect(() => {
    loadCategoriesAndHR();
  }, []);

  const loadCategoriesAndHR = async () => {
    try {
      setLoading(true);
      const [cats, hrs] = await Promise.all([
        api.getPlacementCategories(),
        api.getHrQuestions()
      ]);
      setCategories(cats);
      setHrQuestions(hrs);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleStartQuiz = async (catName) => {
    try {
      setSelectedCategory(catName);
      setQuizResult(null);
      setUserAnswers({});
      const qs = await api.getPlacementQuestions(catName);
      setQuestions(qs);
    } catch (err) {
      alert(err.message || 'Failed to load questions');
    }
  };

  const handleSelectOption = (questionId, optionIndex) => {
    setUserAnswers({
      ...userAnswers,
      [questionId]: optionIndex
    });
  };

  const handleSubmitQuiz = async () => {
    const answeredCount = Object.keys(userAnswers).length;
    if (answeredCount < questions.length) {
      if (!confirm(`You have answered ${answeredCount} of ${questions.length} questions. Submit anyway?`)) {
        return;
      }
    }

    try {
      setSubmitting(true);
      const res = await api.submitPlacementQuiz(selectedCategory, userAnswers);
      setQuizResult(res);
      // Reload categories stats
      const updatedCats = await api.getPlacementCategories();
      setCategories(updatedCats);
      if (onQuizCompleted) onQuizCompleted();
    } catch (err) {
      alert(err.message || 'Failed to submit quiz');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: '80px' }}>
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <div className="content-page">
      <div className="page-header">
        <div>
          <h2>
            <GraduationCap size={24} style={{ color: '#a78bfa' }} />
            Campus Placement Preparation Suite
          </h2>
          <p>
            Module 6: Topic-wise aptitude, reasoning, technical core, coding practice, and behavioral HR interview mastery
          </p>
        </div>

        {/* Section Navigation */}
        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            className={`btn ${activeSection === 'practice' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => { setActiveSection('practice'); setQuizResult(null); setSelectedCategory(null); }}
          >
            Topic Assessments
          </button>
          <button
            className={`btn ${activeSection === 'hr_prep' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => { setActiveSection('hr_prep'); setSelectedCategory(null); }}
          >
            <Users2 size={16} /> HR & Behavioral Interview
          </button>
        </div>
      </div>

      {/* SECTION 1: TOPIC ASSESSMENTS & QUIZ RUNNER */}
      {activeSection === 'practice' && (
        <>
          {/* If no active quiz, display category selection cards */}
          {!selectedCategory ? (
            <div>
              <div className="grid-3" style={{ marginBottom: '28px' }}>
                {categories.map((cat) => {
                  const Icon = CATEGORY_ICONS[cat.category] || HelpCircle;
                  return (
                    <div
                      key={cat.category}
                      className="card"
                      style={{
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between',
                        cursor: 'pointer',
                        transition: 'transform 0.2s, border-color 0.2s'
                      }}
                      onClick={() => handleStartQuiz(cat.category)}
                    >
                      <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '14px' }}>
                          <div style={{
                            width: '46px',
                            height: '46px',
                            borderRadius: 'var(--radius-md)',
                            background: 'rgba(59, 130, 246, 0.15)',
                            color: '#60a5fa',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                          }}>
                            <Icon size={22} />
                          </div>
                          {cat.best_score !== null && (
                            <span className="badge badge-emerald">
                              Best: {cat.best_score}%
                            </span>
                          )}
                        </div>

                        <h3 style={{ fontSize: '17px', fontWeight: 700, marginBottom: '6px' }}>
                          {cat.category}
                        </h3>

                        <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '14px' }}>
                          {cat.question_count} curated diagnostic placement questions with explanations.
                        </p>
                      </div>

                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        paddingTop: '12px',
                        borderTop: '1px solid var(--border-subtle)',
                        fontSize: '12.5px',
                        color: 'var(--text-muted)'
                      }}>
                        <span>{cat.attempts_count} Attempts Taken</span>
                        <span style={{ color: '#60a5fa', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
                          Start Test <ChevronRight size={14} />
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Placement Tips Banner */}
              <div className="card" style={{ background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.5), rgba(15, 23, 42, 0.7))' }}>
                <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#fcd34d', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Sparkles size={18} /> Campus Recruitment Assessment Strategy
                </h3>
                <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                  Top tier hiring rounds typically utilize strict sectional cut-offs (minimum 70% in Quantitative Aptitude and 80% in Technical Core CS). We recommend completing diagnostic assessments weekly to maintain speed and accuracy.
                </p>
              </div>
            </div>
          ) : (
            /* Active Quiz Interface */
            <div style={{ maxWidth: '900px', margin: '0 auto' }}>
              {/* Quiz Header Bar */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <button
                  className="btn btn-secondary btn-sm"
                  onClick={() => setSelectedCategory(null)}
                >
                  ← Back to Categories
                </button>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span className="badge badge-purple">{selectedCategory} Assessment</span>
                  <span className="badge badge-neutral">
                    {Object.keys(userAnswers).length} / {questions.length} Answered
                  </span>
                </div>
              </div>

              {/* Quiz Result Announcement */}
              {quizResult && (
                <div className="card card-glow" style={{ marginBottom: '24px', background: 'rgba(16, 185, 129, 0.08)', borderColor: 'rgba(16, 185, 129, 0.4)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                      <div style={{
                        width: '64px',
                        height: '64px',
                        borderRadius: '50%',
                        background: 'linear-gradient(135deg, #10b981, #06b6d4)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '22px',
                        fontWeight: 800,
                        color: '#fff'
                      }}>
                        {quizResult.percentage}%
                      </div>
                      <div>
                        <h3 style={{ fontSize: '18px', fontWeight: 700 }}>
                          Assessment Completed!
                        </h3>
                        <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '2px' }}>
                          You answered {quizResult.score} out of {quizResult.total_questions} questions correctly.
                        </p>
                      </div>
                    </div>

                    <button
                      className="btn btn-secondary btn-sm"
                      onClick={() => handleStartQuiz(selectedCategory)}
                    >
                      <RotateCcw size={14} /> Retake Test
                    </button>
                  </div>
                </div>
              )}

              {/* Questions List */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                {questions.map((q, qIndex) => {
                  const userChoice = userAnswers[q.id];
                  const feedback = quizResult?.feedback?.[q.id];

                  return (
                    <div
                      key={q.id}
                      className="card"
                      style={{
                        borderColor: feedback
                          ? feedback.is_correct
                            ? 'rgba(16, 185, 129, 0.4)'
                            : 'rgba(244, 63, 94, 0.4)'
                          : undefined
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                        <span className="badge badge-neutral" style={{ fontSize: '11px' }}>
                          Question {qIndex + 1} of {questions.length} • {q.subcategory}
                        </span>
                        <span className="badge badge-blue" style={{ fontSize: '11px' }}>
                          {q.difficulty}
                        </span>
                      </div>

                      <h4 style={{ fontSize: '15px', fontWeight: 600, lineHeight: 1.5, marginBottom: '14px', whiteSpace: 'pre-line' }}>
                        {q.question_text}
                      </h4>

                      {/* Code Snippet if present */}
                      {q.code_snippet && (
                        <pre style={{
                          background: 'rgba(0, 0, 0, 0.4)',
                          padding: '12px 16px',
                          borderRadius: 'var(--radius-sm)',
                          fontSize: '12.5px',
                          color: '#38bdf8',
                          fontFamily: 'var(--font-mono)',
                          overflowX: 'auto',
                          marginBottom: '16px',
                          border: '1px solid var(--border-subtle)'
                        }}>
                          {q.code_snippet}
                        </pre>
                      )}

                      {/* Options */}
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        {q.options.map((opt, optIndex) => {
                          const isSelected = userChoice === optIndex;
                          const isCorrect = feedback && feedback.correct_choice === optIndex;
                          const isUserWrong = feedback && isSelected && !feedback.is_correct;

                          return (
                            <label
                              key={optIndex}
                              style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '12px',
                                padding: '10px 14px',
                                borderRadius: 'var(--radius-md)',
                                background: isCorrect
                                  ? 'rgba(16, 185, 129, 0.15)'
                                  : isUserWrong
                                  ? 'rgba(244, 63, 94, 0.15)'
                                  : isSelected
                                  ? 'rgba(59, 130, 246, 0.15)'
                                  : 'rgba(255, 255, 255, 0.02)',
                                border: '1px solid',
                                borderColor: isCorrect
                                  ? '#10b981'
                                  : isUserWrong
                                  ? '#f43f5e'
                                  : isSelected
                                  ? '#3b82f6'
                                  : 'var(--border-subtle)',
                                cursor: quizResult ? 'default' : 'pointer',
                                fontSize: '13.5px',
                                transition: 'all 0.15s'
                              }}
                            >
                              <input
                                type="radio"
                                name={`question-${q.id}`}
                                disabled={Boolean(quizResult)}
                                checked={isSelected}
                                onChange={() => handleSelectOption(q.id, optIndex)}
                              />
                              <span style={{ flex: 1, color: isCorrect ? '#34d399' : isUserWrong ? '#f87171' : 'var(--text-primary)' }}>
                                {opt}
                              </span>
                              {isCorrect && <CheckCircle2 size={16} style={{ color: '#34d399' }} />}
                              {isUserWrong && <XCircle size={16} style={{ color: '#f87171' }} />}
                            </label>
                          );
                        })}
                      </div>

                      {/* Step-by-Step Explanation when evaluated */}
                      {feedback && (
                        <div style={{
                          marginTop: '14px',
                          padding: '12px 14px',
                          borderRadius: 'var(--radius-sm)',
                          background: 'rgba(0, 0, 0, 0.25)',
                          borderLeft: `3px solid ${feedback.is_correct ? '#10b981' : '#f43f5e'}`,
                          fontSize: '12.5px',
                          lineHeight: 1.5
                        }}>
                          <strong style={{ color: '#93c5fd', display: 'block', marginBottom: '2px' }}>
                            Step-by-Step Rationale & Solution:
                          </strong>
                          <span style={{ color: 'var(--text-secondary)' }}>
                            {feedback.explanation}
                          </span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Submit Button */}
              {!quizResult && (
                <div style={{ display: 'flex', justifyContent: 'center', marginTop: '28px', marginBottom: '40px' }}>
                  <button
                    className="btn btn-primary"
                    style={{ padding: '12px 32px', fontSize: '15px' }}
                    onClick={handleSubmitQuiz}
                    disabled={submitting}
                  >
                    {submitting ? 'Submitting & Grading...' : 'Submit Assessment for Evaluation'}
                  </button>
                </div>
              )}
            </div>
          )}
        </>
      )}

      {/* SECTION 2: HR & BEHAVIORAL INTERVIEW PREPARATION */}
      {activeSection === 'hr_prep' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}>
          {/* STAR Framework Guide */}
          <div className="card card-glow" style={{ background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.7), rgba(15, 23, 42, 0.8))' }}>
            <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#f3f4f6', marginBottom: '6px' }}>
              ⭐ The STAR Interview Response Framework
            </h3>
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '14px' }}>
              Used by Fortune 500 & tech recruiters to assess competencies in campus interviews:
            </p>
            <div className="grid-4">
              <div style={{ background: 'rgba(255, 255, 255, 0.03)', padding: '12px', borderRadius: 'var(--radius-sm)' }}>
                <strong style={{ color: '#60a5fa', fontSize: '14px' }}>S - Situation</strong>
                <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '4px' }}>
                  Set the specific context, project scope, team role, and challenge encountered.
                </p>
              </div>
              <div style={{ background: 'rgba(255, 255, 255, 0.03)', padding: '12px', borderRadius: 'var(--radius-sm)' }}>
                <strong style={{ color: '#a78bfa', fontSize: '14px' }}>T - Task</strong>
                <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '4px' }}>
                  State your exact objective or technical milestone that needed execution.
                </p>
              </div>
              <div style={{ background: 'rgba(255, 255, 255, 0.03)', padding: '12px', borderRadius: 'var(--radius-sm)' }}>
                <strong style={{ color: '#34d399', fontSize: '14px' }}>A - Action</strong>
                <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '4px' }}>
                  Detail the concrete technical steps, algorithms, or initiatives YOU executed.
                </p>
              </div>
              <div style={{ background: 'rgba(255, 255, 255, 0.03)', padding: '12px', borderRadius: 'var(--radius-sm)' }}>
                <strong style={{ color: '#fbbf24', fontSize: '14px' }}>R - Result</strong>
                <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '4px' }}>
                  Quantify the outcome (e.g. latency reduced by 30%, top departmental score).
                </p>
              </div>
            </div>
          </div>

          {/* Standard Campus HR Questions with Answers */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {hrQuestions.map((hr) => (
              <div key={hr.id} className="card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <span className="badge badge-purple">{hr.category}</span>
                  <span className="badge badge-neutral">Campus Placement Standard</span>
                </div>

                <h3 style={{ fontSize: '17px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '8px' }}>
                  "{hr.question_text}"
                </h3>

                <div style={{ fontSize: '12.5px', color: '#93c5fd', marginBottom: '14px', background: 'rgba(59, 130, 246, 0.08)', padding: '8px 12px', borderRadius: '6px' }}>
                  <strong>Interviewer's Core Objective:</strong> {hr.context_objective}
                </div>

                {/* STAR Breakdown */}
                <div style={{ marginBottom: '16px' }}>
                  <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '8px', textTransform: 'uppercase' }}>
                    Recommended STAR Structural Approach:
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '10px' }}>
                    <div style={{ background: 'rgba(255, 255, 255, 0.02)', padding: '10px', borderRadius: '6px', fontSize: '12px' }}>
                      <span style={{ color: '#60a5fa', fontWeight: 600 }}>Situation: </span>
                      <span style={{ color: 'var(--text-secondary)' }}>{hr.star_approach.situation}</span>
                    </div>
                    <div style={{ background: 'rgba(255, 255, 255, 0.02)', padding: '10px', borderRadius: '6px', fontSize: '12px' }}>
                      <span style={{ color: '#a78bfa', fontWeight: 600 }}>Task: </span>
                      <span style={{ color: 'var(--text-secondary)' }}>{hr.star_approach.task}</span>
                    </div>
                    <div style={{ background: 'rgba(255, 255, 255, 0.02)', padding: '10px', borderRadius: '6px', fontSize: '12px' }}>
                      <span style={{ color: '#34d399', fontWeight: 600 }}>Action: </span>
                      <span style={{ color: 'var(--text-secondary)' }}>{hr.star_approach.action}</span>
                    </div>
                    <div style={{ background: 'rgba(255, 255, 255, 0.02)', padding: '10px', borderRadius: '6px', fontSize: '12px' }}>
                      <span style={{ color: '#fbbf24', fontWeight: 600 }}>Result: </span>
                      <span style={{ color: 'var(--text-secondary)' }}>{hr.star_approach.result}</span>
                    </div>
                  </div>
                </div>

                {/* Sample Model Answer */}
                <div style={{ background: 'rgba(0, 0, 0, 0.25)', padding: '14px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)', marginBottom: '14px' }}>
                  <div style={{ fontSize: '12px', fontWeight: 700, color: '#34d399', marginBottom: '4px' }}>
                    Model Delivery Script:
                  </div>
                  <p style={{ fontSize: '13px', color: 'var(--text-primary)', lineHeight: 1.5, fontStyle: 'italic' }}>
                    "{hr.sample_answer}"
                  </p>
                </div>

                {/* Do's and Don'ts */}
                <div className="grid-2">
                  <div style={{ background: 'rgba(16, 185, 129, 0.05)', padding: '10px 14px', borderRadius: '6px', border: '1px solid rgba(16, 185, 129, 0.2)' }}>
                    <span style={{ color: '#34d399', fontSize: '12px', fontWeight: 700 }}>✅ Key Do's:</span>
                    <ul style={{ paddingLeft: '16px', fontSize: '12px', color: 'var(--text-secondary)', marginTop: '4px', lineHeight: 1.4 }}>
                      {hr.dos_and_donts.dos.map((d, didx) => (
                        <li key={didx}>{d}</li>
                      ))}
                    </ul>
                  </div>
                  <div style={{ background: 'rgba(244, 63, 94, 0.05)', padding: '10px 14px', borderRadius: '6px', border: '1px solid rgba(244, 63, 94, 0.2)' }}>
                    <span style={{ color: '#f43f5e', fontSize: '12px', fontWeight: 700 }}>❌ Critical Don'ts:</span>
                    <ul style={{ paddingLeft: '16px', fontSize: '12px', color: 'var(--text-secondary)', marginTop: '4px', lineHeight: 1.4 }}>
                      {hr.dos_and_donts.donts.map((d, didx) => (
                        <li key={didx}>{d}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
