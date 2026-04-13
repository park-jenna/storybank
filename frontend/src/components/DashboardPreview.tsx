const SAMPLE = {
  inProgress: [
    {
      title: "Resolving a conflict within the team",
      meta: "Action · Result missing",
      dot: "partial",
    },
    {
      title: "Using data to change a key decision",
      meta: "Result missing",
      dot: "partial",
    },
    {
      title: "A project where I stepped up as a leader",
      meta: "Not started",
      dot: "empty",
    },
  ],
  completed: [
    { title: "Improving the new hire onboarding process", meta: "Linked to 2 questions" },
    { title: "Delivering under a tight deadline", meta: "Linked to 3 questions" },
    { title: "What I learned from a failure", meta: "Linked to 1 question" },
  ],
  categories: [
    { name: "Teamwork", count: 3, pct: 100, warn: false },
    { name: "Problem Solving", count: 2, pct: 66, warn: false },
    { name: "Growth", count: 2, pct: 66, warn: false },
    { name: "Communication", count: 1, pct: 33, warn: false },
    { name: "Conflict", count: 1, pct: 33, warn: false },
    { name: "Leadership", count: 0, pct: 4, warn: true },
  ],
  questions: [
    { text: "How have you handled conflict in a team?", count: "2 stories", linked: true },
    { text: "Tell me about a failure and what you learned.", count: "1 story", linked: true },
    { text: "Describe a time you showed leadership.", count: "No story", linked: false },
    { text: "How did you influence a difficult stakeholder?", count: "No story", linked: false },
  ],
} as const;

export default function DashboardPreview() {
  return (
    <div className="db-preview">
      {/* Sidebar */}
      <aside className="db-preview-sidebar">
        <div className="db-preview-brand">StoryBank</div>

        <div className="db-preview-nav-label">Menu</div>
        <div className="db-preview-nav-item db-preview-nav-item--active">
          <svg viewBox="0 0 16 16" className="db-preview-nav-icon" aria-hidden>
            <rect x="1" y="1" width="6" height="6" rx="1" />
            <rect x="9" y="1" width="6" height="6" rx="1" />
            <rect x="1" y="9" width="6" height="6" rx="1" />
            <rect x="9" y="9" width="6" height="6" rx="1" />
          </svg>
          Dashboard
        </div>

        <div className="db-preview-nav-label" style={{ marginTop: 10 }}>
          Prepare
        </div>
        <div className="db-preview-nav-item">
          <svg viewBox="0 0 16 16" className="db-preview-nav-icon" aria-hidden>
            <path d="M3 2h10a1 1 0 011 1v10a1 1 0 01-1 1H3a1 1 0 01-1-1V3a1 1 0 011-1z" />
            <path d="M5 5h6M5 8h6M5 11h3" />
          </svg>
          My Stories
          <span className="db-preview-badge">3</span>
        </div>
        <div className="db-preview-nav-item">
          <svg viewBox="0 0 16 16" className="db-preview-nav-icon" aria-hidden>
            <path d="M4 2h8a1 1 0 011 1v11l-5-3-5 3V3a1 1 0 011-1z" />
          </svg>
          My Questions
          <span className="db-preview-badge">2</span>
        </div>

        <div className="db-preview-nav-label" style={{ marginTop: 10 }}>
          Resources
        </div>
        <div className="db-preview-nav-item">
          <svg viewBox="0 0 16 16" className="db-preview-nav-icon" aria-hidden>
            <circle cx="7" cy="7" r="4.5" fill="none" stroke="currentColor" strokeWidth="1.2" />
            <path d="M10.5 10.5L13 13" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
          </svg>
          Common Questions
        </div>
        <div className="db-preview-nav-item">
          <svg viewBox="0 0 16 16" className="db-preview-nav-icon" aria-hidden>
            <path
              d="M8 1.5v2.5M8 12v2.5M2.8 2.8l1.8 1.8M11.4 11.4l1.8 1.8M1.5 8h2.5M12 8h2.5M2.8 13.2l1.8-1.8M11.4 4.6l1.8-1.8"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.2"
              strokeLinecap="round"
            />
            <circle cx="8" cy="8" r="2" fill="none" stroke="currentColor" strokeWidth="1.2" />
          </svg>
          STAR method
        </div>

        <div className="db-preview-sidebar-spacer" />
        <div className="db-preview-profile">
          <div className="db-preview-avatar">JN</div>
          <div>
            <div className="db-preview-profile-name">Jack Niu</div>
            <div className="db-preview-profile-sub">Interview prep</div>
          </div>
        </div>
      </aside>

      {/* Main */}
      <div className="db-preview-main">
        {/* Header */}
        <div className="db-preview-header">
          <div>
            <div className="db-preview-title">Welcome back, Jack</div>
            <div className="db-preview-subtitle">3 stories in progress · 2 questions unlinked</div>
          </div>
          <button className="db-preview-new-btn" tabIndex={-1} type="button">
            + New story
          </button>
        </div>

        {/* Stats */}
        <div className="db-preview-stats">
          {[
            { label: "Total stories", value: "9", sub: "written", warn: false },
            { label: "STAR complete", value: "6", sub: "3 in progress", warn: false },
            { label: "Category coverage", value: "5/6", sub: "Leadership missing", warn: true },
            { label: "My questions", value: "7", sub: "stories linked", warn: false },
          ].map(({ label, value, sub, warn }) => (
            <div key={label} className="db-preview-stat">
              <div className="db-preview-stat-label">{label}</div>
              <div className={`db-preview-stat-value${warn ? " db-preview-stat-value--warn" : ""}`}>
                {value}
              </div>
              <div className={`db-preview-stat-sub${warn ? " db-preview-stat-sub--warn" : ""}`}>
                {sub}
              </div>
            </div>
          ))}
        </div>

        {/* Grid */}
        <div className="db-preview-grid">
          {/* Left */}
          <div className="db-preview-col">
            {/* In progress */}
            <div className="db-preview-card">
              <div className="db-preview-card-head">
                <span className="db-preview-card-title">In progress</span>
                <span className="db-preview-card-link">View all →</span>
              </div>
              {SAMPLE.inProgress.map((s) => (
                <div key={s.title} className="db-preview-row">
                  <span className={`db-preview-dot db-preview-dot--${s.dot}`} />
                  <div className="db-preview-row-info">
                    <div className="db-preview-row-title">{s.title}</div>
                    <div className="db-preview-row-meta">{s.meta}</div>
                  </div>
                  <span className="db-preview-row-btn">{s.dot === "empty" ? "Start" : "Edit"}</span>
                </div>
              ))}
            </div>

            {/* Completed */}
            <div className="db-preview-card">
              <div className="db-preview-card-head">
                <span className="db-preview-card-title">Completed</span>
                <span className="db-preview-card-link">View all →</span>
              </div>
              {SAMPLE.completed.map((s) => (
                <div key={s.title} className="db-preview-row">
                  <span className="db-preview-dot db-preview-dot--done" />
                  <div className="db-preview-row-info">
                    <div className="db-preview-row-title">{s.title}</div>
                    <div className="db-preview-row-meta">{s.meta}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right */}
          <div className="db-preview-col">
            {/* Category coverage */}
            <div className="db-preview-card">
              <div className="db-preview-card-head">
                <span className="db-preview-card-title">Category coverage</span>
              </div>
              {SAMPLE.categories.map(({ name, count, pct, warn }) => (
                <div key={name} className="db-preview-prog">
                  <div className="db-preview-prog-label">
                    <span style={{ color: warn ? "var(--warn-text)" : undefined }}>{name}</span>
                    <span style={{ color: warn ? "var(--warn-text)" : undefined }}>{count}</span>
                  </div>
                  <div className="db-preview-prog-bg">
                    <div
                      className={`db-preview-prog-fill${warn ? " db-preview-prog-fill--warn" : ""}`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>

            {/* My Questions */}
            <div className="db-preview-card">
              <div className="db-preview-card-head">
                <span className="db-preview-card-title">My questions</span>
                <span className="db-preview-card-link">View all →</span>
              </div>
              {SAMPLE.questions.map((q) => (
                <div key={q.text} className="db-preview-q">
                  <div className={`db-preview-q-check${q.linked ? " db-preview-q-check--done" : ""}`}>
                    {q.linked ? "✓" : ""}
                  </div>
                  <div className="db-preview-q-text">{q.text}</div>
                  <div className={`db-preview-q-count${!q.linked ? " db-preview-q-count--warn" : ""}`}>
                    {q.count}
                  </div>
                </div>
              ))}
              <div className="db-preview-cta-row">
                <button className="db-preview-cta" tabIndex={-1} type="button">
                  Browse
                </button>
                <button
                  className="db-preview-cta db-preview-cta--primary"
                  tabIndex={-1}
                  type="button"
                >
                  Link stories
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

