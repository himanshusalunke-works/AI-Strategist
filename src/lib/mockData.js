// ==========================================
// Mock Data Store for MVP Demo
// Replace with Supabase calls in production
// ==========================================

let currentUser = null;

// Sample subjects with topics
let subjects = [
    {
        id: 's1',
        user_id: 'demo',
        name: 'Physics',
        exam_date: '2026-03-15',
        daily_study_hours: 4,
        created_at: '2026-01-10T10:00:00Z'
    },
    {
        id: 's2',
        user_id: 'demo',
        name: 'Mathematics',
        exam_date: '2026-03-20',
        daily_study_hours: 3,
        created_at: '2026-01-12T10:00:00Z'
    }
];

let topics = [
    { id: 't1', subject_id: 's1', name: 'Thermodynamics', mastery_score: 42, created_at: '2026-01-10' },
    { id: 't2', subject_id: 's1', name: 'Electromagnetism', mastery_score: 78, created_at: '2026-01-10' },
    { id: 't3', subject_id: 's1', name: 'Optics', mastery_score: 85, created_at: '2026-01-10' },
    { id: 't4', subject_id: 's1', name: 'Mechanics', mastery_score: 65, created_at: '2026-01-10' },
    { id: 't5', subject_id: 's1', name: 'Waves & Sound', mastery_score: 55, created_at: '2026-01-10' },
    { id: 't6', subject_id: 's2', name: 'Calculus', mastery_score: 38, created_at: '2026-01-12' },
    { id: 't7', subject_id: 's2', name: 'Linear Algebra', mastery_score: 72, created_at: '2026-01-12' },
    { id: 't8', subject_id: 's2', name: 'Probability', mastery_score: 60, created_at: '2026-01-12' },
    { id: 't9', subject_id: 's2', name: 'Trigonometry', mastery_score: 90, created_at: '2026-01-12' },
    { id: 't10', subject_id: 's2', name: 'Differential Equations', mastery_score: 30, created_at: '2026-01-12' }
];

let quizAttempts = [
    { id: 'q1', topic_id: 't1', user_id: 'demo', accuracy: 40, attempted_at: '2026-02-01T10:00:00Z' },
    { id: 'q2', topic_id: 't1', user_id: 'demo', accuracy: 45, attempted_at: '2026-02-05T10:00:00Z' },
    { id: 'q3', topic_id: 't2', user_id: 'demo', accuracy: 75, attempted_at: '2026-02-03T10:00:00Z' },
    { id: 'q4', topic_id: 't2', user_id: 'demo', accuracy: 80, attempted_at: '2026-02-08T10:00:00Z' },
    { id: 'q5', topic_id: 't3', user_id: 'demo', accuracy: 85, attempted_at: '2026-02-06T10:00:00Z' },
    { id: 'q6', topic_id: 't4', user_id: 'demo', accuracy: 60, attempted_at: '2026-02-07T10:00:00Z' },
    { id: 'q7', topic_id: 't4', user_id: 'demo', accuracy: 70, attempted_at: '2026-02-10T10:00:00Z' },
    { id: 'q8', topic_id: 't5', user_id: 'demo', accuracy: 55, attempted_at: '2026-02-09T10:00:00Z' },
    { id: 'q9', topic_id: 't6', user_id: 'demo', accuracy: 35, attempted_at: '2026-02-04T10:00:00Z' },
    { id: 'q10', topic_id: 't6', user_id: 'demo', accuracy: 40, attempted_at: '2026-02-11T10:00:00Z' },
    { id: 'q11', topic_id: 't7', user_id: 'demo', accuracy: 70, attempted_at: '2026-02-05T10:00:00Z' },
    { id: 'q12', topic_id: 't8', user_id: 'demo', accuracy: 60, attempted_at: '2026-02-06T10:00:00Z' },
    { id: 'q13', topic_id: 't9', user_id: 'demo', accuracy: 90, attempted_at: '2026-02-07T10:00:00Z' },
    { id: 'q14', topic_id: 't10', user_id: 'demo', accuracy: 30, attempted_at: '2026-02-08T10:00:00Z' }
];

let schedules = [];

// Sample quiz questions per topic
const questionBank = {
    Thermodynamics: [
        { q: "What is the first law of thermodynamics?", options: ["Energy cannot be created or destroyed", "Entropy always increases", "Heat flows from cold to hot", "Temperature is constant"], answer: 0 },
        { q: "Which process occurs at constant temperature?", options: ["Adiabatic", "Isobaric", "Isothermal", "Isochoric"], answer: 2 },
        { q: "What is the SI unit of entropy?", options: ["Joule", "J/K", "Kelvin", "Watt"], answer: 1 },
        { q: "In an adiabatic process, what is zero?", options: ["Work done", "Heat transfer", "Internal energy change", "Pressure change"], answer: 1 },
        { q: "What is the Carnot efficiency formula?", options: ["1 - Tc/Th", "Tc/Th", "Th - Tc", "1 - Th/Tc"], answer: 0 }
    ],
    Electromagnetism: [
        { q: "What is Coulomb's law about?", options: ["Magnetic fields", "Electric force between charges", "Electromagnetic waves", "Current flow"], answer: 1 },
        { q: "What is the unit of electric field?", options: ["Tesla", "N/C", "Ampere", "Ohm"], answer: 1 },
        { q: "Faraday's law relates to?", options: ["Static electricity", "Electromagnetic induction", "Resistance", "Capacitance"], answer: 1 },
        { q: "What does a solenoid produce?", options: ["Electric field", "Uniform magnetic field", "Heat", "Light"], answer: 1 },
        { q: "Maxwell's equations unify?", options: ["Mechanics and heat", "Electricity and magnetism", "Optics and sound", "Gravity and motion"], answer: 1 }
    ],
    Optics: [
        { q: "What is Snell's law about?", options: ["Reflection", "Refraction", "Diffraction", "Polarization"], answer: 1 },
        { q: "Total internal reflection requires?", options: ["High angle of incidence", "Dense to rarer medium", "Both A and B", "Neither"], answer: 2 },
        { q: "What type of lens converges light?", options: ["Concave", "Convex", "Plano", "Cylindrical"], answer: 1 },
        { q: "Diffraction is more pronounced when?", options: ["Wavelength >> slit", "Wavelength ≈ slit", "Wavelength << slit", "No relation"], answer: 1 },
        { q: "What is the speed of light in vacuum?", options: ["3×10⁶ m/s", "3×10⁸ m/s", "3×10¹⁰ m/s", "3×10⁴ m/s"], answer: 1 }
    ],
    Mechanics: [
        { q: "Newton's second law states?", options: ["F = ma", "F = mv", "F = m/a", "F = a/m"], answer: 0 },
        { q: "What is the unit of momentum?", options: ["N", "kg·m/s", "J", "W"], answer: 1 },
        { q: "Kinetic energy formula?", options: ["½mv", "½mv²", "mv²", "½m²v"], answer: 1 },
        { q: "What is projectile motion?", options: ["Linear only", "Circular", "Combination of horizontal and vertical", "Random"], answer: 2 },
        { q: "Conservation of momentum applies when?", options: ["No external forces", "With friction", "Always", "Never"], answer: 0 }
    ],
    'Waves & Sound': [
        { q: "Sound waves are?", options: ["Transverse", "Longitudinal", "Electromagnetic", "Surface"], answer: 1 },
        { q: "What is the Doppler effect?", options: ["Change in amplitude", "Change in frequency due to motion", "Change in speed", "Reflection of sound"], answer: 1 },
        { q: "Ultrasound frequency is?", options: ["< 20 Hz", "20-20000 Hz", "> 20000 Hz", "Exactly 1000 Hz"], answer: 2 },
        { q: "Resonance occurs when?", options: ["Damping is high", "Driving freq = natural freq", "Amplitude is zero", "Frequency is zero"], answer: 1 },
        { q: "Speed of sound is fastest in?", options: ["Air", "Water", "Steel", "Vacuum"], answer: 2 }
    ],
    Calculus: [
        { q: "What is the derivative of x²?", options: ["x", "2x", "x²", "2x²"], answer: 1 },
        { q: "∫ 2x dx = ?", options: ["x²+C", "2x²+C", "x+C", "2+C"], answer: 0 },
        { q: "What is the chain rule used for?", options: ["Addition", "Composite functions", "Division", "Products"], answer: 1 },
        { q: "Limit of sin(x)/x as x→0 is?", options: ["0", "1", "∞", "undefined"], answer: 1 },
        { q: "The integral represents?", options: ["Slope", "Area under curve", "Tangent", "Normal"], answer: 1 }
    ],
    'Linear Algebra': [
        { q: "What is the determinant of identity matrix?", options: ["0", "1", "-1", "undefined"], answer: 1 },
        { q: "Eigenvalue equation is?", options: ["Av = λv", "Av = v", "A = λ", "v = λA"], answer: 0 },
        { q: "A matrix is singular when?", options: ["det ≠ 0", "det = 0", "det = 1", "det = -1"], answer: 1 },
        { q: "Rank of a matrix is?", options: ["Number of rows", "Number of non-zero rows in REF", "Trace", "Determinant"], answer: 1 },
        { q: "Transpose of (AB) is?", options: ["AB", "BA", "B'A'", "A'B'"], answer: 2 }
    ],
    Probability: [
        { q: "P(A∪B) for independent events?", options: ["P(A)+P(B)", "P(A)+P(B)-P(A∩B)", "P(A)×P(B)", "P(A)-P(B)"], answer: 1 },
        { q: "Bayes' theorem is used for?", options: ["Prior probability", "Conditional probability", "Joint probability", "Marginal probability"], answer: 1 },
        { q: "Expected value of a fair die?", options: ["3", "3.5", "4", "6"], answer: 1 },
        { q: "Standard deviation is the square root of?", options: ["Mean", "Median", "Variance", "Mode"], answer: 2 },
        { q: "Normal distribution is?", options: ["Skewed left", "Skewed right", "Symmetric", "Uniform"], answer: 2 }
    ],
    Trigonometry: [
        { q: "sin²θ + cos²θ = ?", options: ["0", "1", "2", "sinθ"], answer: 1 },
        { q: "tan(45°) = ?", options: ["0", "1", "√2", "undefined"], answer: 1 },
        { q: "Period of sin(x) is?", options: ["π", "2π", "π/2", "4π"], answer: 1 },
        { q: "cos(0) = ?", options: ["0", "1", "-1", "undefined"], answer: 1 },
        { q: "What is the range of sin(x)?", options: ["[0,1]", "[-1,1]", "[0,∞)", "(-∞,∞)"], answer: 1 }
    ],
    'Differential Equations': [
        { q: "Order of dy/dx + y = 0?", options: ["0", "1", "2", "3"], answer: 1 },
        { q: "A linear ODE has what degree?", options: ["0", "1", "2", "Any"], answer: 1 },
        { q: "Separable DE means?", options: ["Variables can be separated", "It's linear", "It's homogeneous", "No solution exists"], answer: 0 },
        { q: "Solution of dy/dx = ky?", options: ["y = kx", "y = Ce^(kx)", "y = sin(kx)", "y = x²"], answer: 1 },
        { q: "Integrating factor is used for?", options: ["Exact DEs", "Linear first-order DEs", "Second-order DEs", "Partial DEs"], answer: 1 }
    ]
};

// ---- Helper Functions ----
const generateId = () => Math.random().toString(36).substring(2, 10);

// ---- Auth ----
export const mockAuth = {
    getUser: () => currentUser,
    signUp: ({ email, password, name }) => {
        currentUser = { id: 'demo', email, name: name || email.split('@')[0] };
        localStorage.setItem('ai_study_user', JSON.stringify(currentUser));
        return { user: currentUser, error: null };
    },
    signIn: ({ email, password }) => {
        currentUser = { id: 'demo', email, name: email.split('@')[0] };
        localStorage.setItem('ai_study_user', JSON.stringify(currentUser));
        return { user: currentUser, error: null };
    },
    signOut: () => {
        currentUser = null;
        localStorage.removeItem('ai_study_user');
    },
    restoreSession: () => {
        const stored = localStorage.getItem('ai_study_user');
        if (stored) {
            currentUser = JSON.parse(stored);
            return currentUser;
        }
        return null;
    }
};

// ---- Subjects ----
export const mockSubjects = {
    getAll: () => subjects.filter(s => s.user_id === 'demo'),
    getById: (id) => subjects.find(s => s.id === id),
    create: ({ name, exam_date, daily_study_hours }) => {
        const newSubject = {
            id: generateId(),
            user_id: 'demo',
            name,
            exam_date,
            daily_study_hours: Number(daily_study_hours),
            created_at: new Date().toISOString()
        };
        subjects.push(newSubject);
        return newSubject;
    },
    update: (id, data) => {
        const idx = subjects.findIndex(s => s.id === id);
        if (idx !== -1) {
            subjects[idx] = { ...subjects[idx], ...data };
            return subjects[idx];
        }
        return null;
    },
    delete: (id) => {
        subjects = subjects.filter(s => s.id !== id);
        topics = topics.filter(t => t.subject_id !== id);
    }
};

// ---- Topics ----
export const mockTopics = {
    getBySubject: (subjectId) => topics.filter(t => t.subject_id === subjectId),
    getAll: () => topics,
    getById: (id) => topics.find(t => t.id === id),
    create: ({ subject_id, name }) => {
        const newTopic = {
            id: generateId(),
            subject_id,
            name,
            mastery_score: 0,
            created_at: new Date().toISOString()
        };
        topics.push(newTopic);
        return newTopic;
    },
    update: (id, data) => {
        const idx = topics.findIndex(t => t.id === id);
        if (idx !== -1) {
            topics[idx] = { ...topics[idx], ...data };
            return topics[idx];
        }
        return null;
    },
    delete: (id) => {
        topics = topics.filter(t => t.id !== id);
    },
    updateMastery: (id, newAccuracy) => {
        const topic = topics.find(t => t.id === id);
        if (topic) {
            topic.mastery_score = Math.round((topic.mastery_score + newAccuracy) / 2);
            return topic;
        }
        return null;
    }
};

// ---- Quiz ----
export const mockQuiz = {
    getQuestions: (topicName) => {
        const questions = questionBank[topicName];
        if (questions) return questions;
        // Generic fallback
        return [
            { q: `What is the core concept of ${topicName}?`, options: ["Option A", "Option B", "Option C", "Option D"], answer: 0 },
            { q: `Which principle applies to ${topicName}?`, options: ["Principle 1", "Principle 2", "Principle 3", "Principle 4"], answer: 1 },
            { q: `What is the formula for ${topicName}?`, options: ["Formula A", "Formula B", "Formula C", "Formula D"], answer: 2 },
            { q: `Who contributed most to ${topicName}?`, options: ["Scientist A", "Scientist B", "Scientist C", "Scientist D"], answer: 0 },
            { q: `What application uses ${topicName}?`, options: ["Application 1", "Application 2", "Application 3", "Application 4"], answer: 1 }
        ];
    },
    recordAttempt: ({ topic_id, accuracy }) => {
        const attempt = {
            id: generateId(),
            topic_id,
            user_id: 'demo',
            accuracy,
            attempted_at: new Date().toISOString()
        };
        quizAttempts.push(attempt);
        // Update mastery
        mockTopics.updateMastery(topic_id, accuracy);
        return attempt;
    },
    getAttemptsByTopic: (topicId) => quizAttempts.filter(a => a.topic_id === topicId),
    getAllAttempts: () => quizAttempts.filter(a => a.user_id === 'demo')
};

// ---- Schedules ----
export const mockSchedules = {
    getBySubject: (subjectId) => schedules.find(s => s.subject_id === subjectId),
    getLatest: () => schedules.length > 0 ? schedules[schedules.length - 1] : null,
    save: ({ subject_id, schedule_data }) => {
        // Remove old schedule for this subject
        schedules = schedules.filter(s => s.subject_id !== subject_id);
        const newSchedule = {
            id: generateId(),
            user_id: 'demo',
            subject_id,
            schedule_data,
            generated_at: new Date().toISOString()
        };
        schedules.push(newSchedule);
        return newSchedule;
    },
    getAll: () => schedules
};
