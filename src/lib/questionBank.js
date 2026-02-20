/**
 * Question Bank
 * Static quiz questions per topic.
 * Extracted from mockData.js — stays client-side.
 * In a future iteration, these could be AI-generated.
 */

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

/**
 * Get quiz questions for a topic.
 * Falls back to generic questions if topic not in bank.
 */
export function getQuestions(topicName) {
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
}

export default questionBank;
