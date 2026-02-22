import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { topicsApi, subjectsApi, quizApi } from '../lib/api';
import { generateQuizWithAI } from '../lib/quizGenerator';
import {
    CheckCircle2, XCircle, ArrowRight, Trophy,
    Clock, BookOpen, ChevronRight, RotateCcw, Sparkles
} from 'lucide-react';
import './Quiz.css';

export default function Quiz() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();

    // States
    const [stage, setStage] = useState('select'); // select, quiz, result
    const [selectedTopic, setSelectedTopic] = useState(null);
    const [questions, setQuestions] = useState([]);
    const [currentQ, setCurrentQ] = useState(0);
    const [answers, setAnswers] = useState([]);
    const [selectedAnswer, setSelectedAnswer] = useState(null);
    const [showCorrect, setShowCorrect] = useState(false);
    const [score, setScore] = useState(0);
    const [timeLeft, setTimeLeft] = useState(30);
    const [allTopics, setAllTopics] = useState([]);
    const [subjects, setSubjects] = useState([]);
    const [updatedMastery, setUpdatedMastery] = useState(0);
    const [loading, setLoading] = useState(true);
    const [isGenerating, setIsGenerating] = useState(false);

    useEffect(() => {
        const init = async () => {
            try {
                // Load all topics and subjects for selection
                const [topicsData, subjectsData] = await Promise.all([
                    topicsApi.getAll(),
                    subjectsApi.getAll()
                ]);
                setAllTopics(topicsData);
                setSubjects(subjectsData);

                // If coming from subject detail with a topic pre-selected
                const topicId = searchParams.get('topicId');
                const topicName = searchParams.get('topicName');
                if (topicId && topicName) {
                    const fullTopic = topicsData.find(t => t.id === topicId);
                    startQuiz(fullTopic || { id: topicId, name: topicName });
                }            } catch (err) {
                console.error('Failed to load quiz data:', err);
            } finally {
                setLoading(false);
            }
        };
        init();
    }, []);

    // Timer
    useEffect(() => {
        if (stage !== 'quiz' || showCorrect) return;
        if (timeLeft <= 0) {
            handleAnswer(-1);
            return;
        }
        const timer = setTimeout(() => setTimeLeft(t => t - 1), 1000);
        return () => clearTimeout(timer);
    }, [timeLeft, stage, showCorrect]);

    const startQuiz = async (topic) => {
        setSelectedTopic(topic);
        setIsGenerating(true);
        try {
                const qs = await generateQuizWithAI(topic.name, topic.id);
            setQuestions(qs.slice(0, 5));
            setCurrentQ(0);
            setAnswers([]);
            setSelectedAnswer(null);
            setShowCorrect(false);
            setTimeLeft(30);
            setStage('quiz');
        } catch (err) {
            console.error('Failed to start quiz:', err);
            // Error handling fallback is already inside `generateQuizWithAI`
        } finally {
            setIsGenerating(false);
        }
    };

    const handleAnswer = (answerIdx) => {
        setSelectedAnswer(answerIdx);
        setShowCorrect(true);
        const isCorrect = answerIdx === questions[currentQ].answer;
        const newAnswers = [...answers, { selected: answerIdx, correct: questions[currentQ].answer, isCorrect }];
        setAnswers(newAnswers);

        setTimeout(async () => {
            if (currentQ < questions.length - 1) {
                setCurrentQ(c => c + 1);
                setSelectedAnswer(null);
                setShowCorrect(false);
                setTimeLeft(30);
            } else {
                // Calculate score
                const totalCorrect = newAnswers.filter(a => a.isCorrect).length;
                const accuracy = Math.round((totalCorrect / questions.length) * 100);
                setScore(accuracy);

                // Record attempt in Supabase
                try {
                    const { updatedTopic } = await quizApi.recordAttempt({
                        topic_id: selectedTopic.id,
                        accuracy
                    });
                    setUpdatedMastery(updatedTopic?.mastery_score || 0);
                } catch (err) {
                    console.error('Failed to record attempt:', err);
                    setUpdatedMastery(0);
                }

                setStage('result');
            }
        }, 1200);
    };

    if (loading) {
        return (
            <div className="quiz-page">
                <div className="empty-state">
                    <div className="spinner"></div>
                    <p>Loading quiz data...</p>
                </div>
            </div>
        );
    }

    // ---- Select Screen ----
    if (stage === 'select') {
        return (
            <div className="quiz-page">
                <div className="page-header">
                    <div>
                        <h1 className="page-title">Take a Quiz</h1>
                        <p className="page-subtitle">Select a topic to test your knowledge</p>
                    </div>
                </div>

                {isGenerating ? (
                    <div className="card empty-state">
                        <Sparkles size={40} className="plan-empty-icon" style={{ animation: 'pulse 2s infinite' }} />
                        <h3>Generating Quiz</h3>
                        <p>Our AI tutor is crafting personalized questions to test your knowledge on {selectedTopic?.name}...</p>
                    </div>
                ) : (
                    <>
                        {subjects.map(subject => {
                            const subTopics = allTopics.filter(t => t.subject_id === subject.id);
                            if (subTopics.length === 0) {
                                return (
                            <div key={subject.id} className="quiz-subject-group">
                                <h3 className="quiz-subject-name">{subject.name}</h3>
                                <div className="card empty-state-small">
                                    <p>No topics available for this subject yet.</p>
                                </div>
                            </div>
                        );
                    }
                    return (
                        <div key={subject.id} className="quiz-subject-group">
                            <h3 className="quiz-subject-name">{subject.name}</h3>
                            <div className="quiz-topic-grid">
                                {subTopics.map(topic => {
                                    const mastery = topic.mastery_score || 0;
                                    const barColor = mastery >= 80 ? 'var(--color-green)' : mastery >= 50 ? 'var(--color-orange)' : 'var(--color-red)';
                                    return (
                                        <button
                                            key={topic.id}
                                            className="quiz-topic-card card"
                                            onClick={() => startQuiz(topic)}
                                        >
                                            <div className="quiz-topic-card-top">
                                                <div className="quiz-topic-icon">
                                                    <BookOpen size={20} />
                                                </div>
                                                <span className="quiz-topic-name">{topic.name}</span>
                                                <ChevronRight size={16} className="quiz-topic-arrow" />
                                            </div>
                                            <div className="quiz-topic-bottom">
                                                <div className="quiz-topic-mastery-bar">
                                                    <div
                                                        className="quiz-topic-mastery-fill"
                                                        style={{ width: `${mastery}%`, background: barColor }}
                                                    />
                                                </div>
                                                <span className="quiz-topic-mastery-text">{mastery}%</span>
                                            </div>
                                        </button>
                                    );
                                })}
                                </div>
                            </div>
                        );
                    })}
                </>
                )}
            </div>
        );
    }

    // ---- Quiz Screen ----
    if (stage === 'quiz') {
        const question = questions[currentQ];
        return (
            <div className="quiz-page">
                <div className="quiz-active-header">
                    <div className="quiz-topic-label">
                        <BookOpen size={16} />
                        {selectedTopic.name}
                    </div>
                    <div className="quiz-progress-info">
                        <span>Question {currentQ + 1} of {questions.length}</span>
                        <div className={`quiz-timer ${timeLeft <= 10 ? 'quiz-timer-warn' : ''}`}>
                            <Clock size={14} />
                            {timeLeft}s
                        </div>
                    </div>
                </div>

                {/* Progress Dots */}
                <div className="quiz-dots">
                    {questions.map((_, i) => (
                        <div
                            key={i}
                            className={`quiz-dot ${i < currentQ ? (answers[i]?.isCorrect ? 'quiz-dot-correct' : 'quiz-dot-wrong') :
                                    i === currentQ ? 'quiz-dot-current' : ''
                                }`}
                        />
                    ))}
                </div>

                {/* Question Card */}
                <div className="quiz-question-card card animate-fade-in" key={currentQ}>
                    <h2 className="quiz-question-text">{question.q}</h2>

                    <div className="quiz-options">
                        {question.options.map((option, idx) => {
                            let optClass = 'quiz-option';
                            if (showCorrect) {
                                if (idx === question.answer) optClass += ' quiz-option-correct';
                                else if (idx === selectedAnswer) optClass += ' quiz-option-wrong';
                            } else if (idx === selectedAnswer) {
                                optClass += ' quiz-option-selected';
                            }

                            return (
                                <button
                                    key={idx}
                                    className={optClass}
                                    onClick={() => !showCorrect && handleAnswer(idx)}
                                    disabled={showCorrect}
                                >
                                    <span className="quiz-option-letter">{String.fromCharCode(65 + idx)}</span>
                                    <span className="quiz-option-text">{option}</span>
                                    {showCorrect && idx === question.answer && <CheckCircle2 size={18} />}
                                    {showCorrect && idx === selectedAnswer && idx !== question.answer && <XCircle size={18} />}
                                </button>
                            );
                        })}
                    </div>
                </div>
            </div>
        );
    }

    // ---- Result Screen ----
    if (stage === 'result') {
        const correctCount = answers.filter(a => a.isCorrect).length;

        return (
            <div className="quiz-page">
                <div className="quiz-result card animate-scale">
                    <div className="quiz-result-icon">
                        {score >= 80 ? '🏆' : score >= 60 ? '👍' : score >= 40 ? '📚' : '💪'}
                    </div>

                    <h2 className="quiz-result-title">
                        {score >= 80 ? 'Excellent!' : score >= 60 ? 'Good Job!' : score >= 40 ? 'Keep Practicing' : 'Don\'t Give Up!'}
                    </h2>

                    <div className="quiz-result-score">
                        <span className="quiz-result-number">{score}%</span>
                        <span className="quiz-result-label">Accuracy</span>
                    </div>

                    <div className="quiz-result-stats">
                        <div className="quiz-result-stat">
                            <CheckCircle2 size={16} color="var(--color-green)" />
                            <span>{correctCount} Correct</span>
                        </div>
                        <div className="quiz-result-stat">
                            <XCircle size={16} color="var(--color-red)" />
                            <span>{questions.length - correctCount} Wrong</span>
                        </div>
                    </div>

                    <div className="quiz-result-mastery">
                        <span>Updated Mastery: <strong>{updatedMastery}%</strong></span>
                    </div>

                    <div className="quiz-result-actions">
                        <button className="btn btn-primary" onClick={() => startQuiz(selectedTopic)}>
                            <RotateCcw size={16} /> Retry
                        </button>
                        <button className="btn btn-secondary" onClick={async () => {
                            setStage('select');
                            try {
                                const freshTopics = await topicsApi.getAll();
                                setAllTopics(freshTopics);
                            } catch (err) {
                                console.error('Failed to refresh topics:', err);
                            }
                        }}>
                            <BookOpen size={16} /> Other Topics
                        </button>
                        <Link to="/" className="btn btn-ghost">
                            Dashboard <ArrowRight size={16} />
                        </Link>
                    </div>
                </div>
            </div>
        );
    }
}
