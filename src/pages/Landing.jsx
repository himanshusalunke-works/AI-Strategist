import { Link } from "react-router-dom";
import {
  Brain,
  Zap,
  BarChart3,
  Calendar,
  CheckCircle,
  ArrowRight,
  Star,
  Sun,
  Moon,
} from "lucide-react";
import { useTheme } from "../context/ThemeContext";
import "./Landing.css";

const FEATURES = [
  {
    icon: Zap,
    title: "AI-Powered Quizzes",
    desc: "Llama-driven MCQs tailored to your exact topic, exam board, and mastery level — regenerated fresh every session.",
    img: "/feature-quiz.png",
    color: "#4F46E5",
  },
  {
    icon: Calendar,
    title: "Smart Study Schedules",
    desc: "Tell us your exam date and daily hours. Our AI builds a day-by-day plan that prioritises your weakest topics first.",
    img: "/feature-schedule.png",
    color: "#059669",
  },
  {
    icon: BarChart3,
    title: "Deep Performance Analytics",
    desc: "Radar charts, accuracy trends, readiness scores — see exactly where you stand and what to fix before exam day.",
    img: "/feature-analytics.png",
    color: "#06B6D4",
  },
];

const STATS = [
  { value: "5 secs", label: "Quiz generation time" },
  { value: "100%", label: "Personalised questions" },
  { value: "Daily", label: "Schedule adaptation" },
  { value: "Free", label: "To get started" },
];

const TESTIMONIALS = [
  {
    text: "The AI quiz generator is insanely fast. It just knows what to ask.",
    name: "Anika R.",
    label: "JEE Aspirant",
  },
  {
    text: "My readiness score went from 42% to 78% in three weeks of consistent use.",
    name: "Rahul M.",
    label: "UPSC Preparer",
  },
  {
    text: "Best study tool I have used. The schedule planner is a lifesaver.",
    name: "Priya S.",
    label: "Class 12 Student",
  },
];

export default function Landing() {
  const { theme, toggleTheme } = useTheme();
  return (
    <div className="landing">
      {/* ---- Navbar ---- */}
      <nav className="landing-nav">
        <div className="landing-nav-brand">
          <div className="landing-nav-logo">
            <Brain size={22} />
          </div>
          <span>AI Strategist</span>
        </div>
        <div className="landing-nav-links">
          <Link to="/login" className="landing-nav-link">
            Log In
          </Link>
          <button
            className="landing-theme-toggle"
            onClick={toggleTheme}
            aria-label={
              theme === "dark" ? "Switch to light mode" : "Switch to dark mode"
            }
          >
            {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
          </button>
          <Link to="/register" className="btn btn-primary btn-sm">
            Get Started Free
          </Link>
        </div>
      </nav>

      {/* ---- Hero ---- */}
      <section className="landing-hero">
        <div className="landing-hero-glow glow-left" />
        <div className="landing-hero-glow glow-right" />
        <div className="landing-hero-content">
          <div className="landing-badge">
            <Zap size={13} /> Powered by Llama 3.3 via Groq
          </div>
          <h1 className="landing-hero-title">
            Study <span className="landing-gradient-text">Smarter</span>.<br />
            Score <span className="landing-gradient-text">Higher</span>.
          </h1>
          <p className="landing-hero-sub">
            AI Study Strategist generates personalised quizzes, builds adaptive
            study schedules, and tracks your readiness — all powered by the
            fastest AI on the planet.
          </p>
          <div className="landing-hero-cta">
            <Link to="/register" className="btn btn-primary landing-btn-lg">
              Start for Free <ArrowRight size={18} />
            </Link>
            <Link to="/login" className="landing-btn-ghost">
              I have an account
            </Link>
          </div>
          <div className="landing-hero-trust">
            {[...Array(5)].map((_, i) => (
              <Star key={i} size={14} fill="#F59E0B" color="#F59E0B" />
            ))}
            <span>Loved by 1,000+ students</span>
          </div>
        </div>
        <div className="landing-hero-visual">
          <div className="landing-hero-img-wrap">
            <img
              src="/hero-dashboard.png"
              alt="AI Strategist Dashboard"
              className="landing-hero-img"
            />
            <div className="landing-hero-img-glow" />
          </div>
        </div>
      </section>

      {/* ---- Stats ---- */}
      <section className="landing-stats">
        {STATS.map((s) => (
          <div key={s.label} className="landing-stat">
            <span className="landing-stat-value">{s.value}</span>
            <span className="landing-stat-label">{s.label}</span>
          </div>
        ))}
      </section>

      {/* ---- Features ---- */}
      <section className="landing-features" id="features">
        <div className="landing-section-label">What we offer</div>
        <h2 className="landing-section-title">
          Everything you need to ace your exam
        </h2>
        <div className="landing-features-grid">
          {FEATURES.map((f, idx) => (
            <div
              key={f.title}
              className={`landing-feature-card ${idx === 1 ? "feature-card-accent" : ""}`}
            >
              <div className="landing-feature-img-wrap">
                <img
                  src={f.img}
                  alt={f.title}
                  className="landing-feature-img"
                />
              </div>
              <div
                className="landing-feature-icon"
                style={{ background: `${f.color}20`, color: f.color }}
              >
                <f.icon size={22} />
              </div>
              <h3 className="landing-feature-title">{f.title}</h3>
              <p className="landing-feature-desc">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ---- How It Works ---- */}
      <section className="landing-how">
        <div className="landing-section-label">How it works</div>
        <h2 className="landing-section-title">
          Three steps to exam confidence
        </h2>
        <div className="landing-steps">
          {[
            {
              n: "01",
              title: "Create your subjects",
              desc: "Add subjects, topics and set your exam date. The more detail, the smarter the AI.",
            },
            {
              n: "02",
              title: "Let AI build your plan",
              desc: "One click generates a personalised multi-day study schedule weighted to your weakest areas.",
            },
            {
              n: "03",
              title: "Quiz, track and improve",
              desc: "Take AI quizzes, watch your mastery scores rise, and get analytics that show exactly what to focus on next.",
            },
          ].map((s) => (
            <div key={s.n} className="landing-step">
              <div className="landing-step-number">{s.n}</div>
              <h4 className="landing-step-title">{s.title}</h4>
              <p className="landing-step-desc">{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ---- Testimonials ---- */}
      <section className="landing-testimonials">
        <div className="landing-section-label">Testimonials</div>
        <h2 className="landing-section-title">Students love it</h2>
        <div className="landing-testimonials-grid">
          {TESTIMONIALS.map((t) => (
            <div key={t.name} className="landing-testimonial">
              <div className="landing-testimonial-stars">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} size={13} fill="#F59E0B" color="#F59E0B" />
                ))}
              </div>
              <p className="landing-testimonial-text">"{t.text}"</p>
              <div className="landing-testimonial-author">
                <div className="landing-testimonial-avatar">{t.name[0]}</div>
                <div>
                  <div className="landing-testimonial-name">{t.name}</div>
                  <div className="landing-testimonial-label">{t.label}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ---- CTA Banner ---- */}
      <section className="landing-cta-banner">
        <div className="landing-cta-glow" />
        <h2 className="landing-cta-title">
          Ready to transform the way you study?
        </h2>
        <p className="landing-cta-sub">
          Free forever. No credit card required.
        </p>
        <div className="landing-hero-cta">
          <Link to="/register" className="btn btn-primary landing-btn-lg">
            Create Free Account <ArrowRight size={18} />
          </Link>
        </div>
        <div className="landing-cta-checks">
          {[
            "AI-generated quizzes",
            "Smart study schedules",
            "Performance analytics",
            "Dark mode included",
          ].map((c) => (
            <span key={c} className="landing-cta-check">
              <CheckCircle size={14} /> {c}
            </span>
          ))}
        </div>
      </section>

      {/* ---- Footer ---- */}
      <footer className="landing-footer">
        <div className="landing-footer-brand">
          <Brain size={18} /> AI Strategist
        </div>
        <span className="landing-footer-copy">
          © 2026 AI Strategist. Built with ❤️ for students.
        </span>
      </footer>
    </div>
  );
}
