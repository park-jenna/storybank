import Link from "next/link";

function ListCheckIcon() {
  return (
    <svg
      className="star-resource__check"
      viewBox="0 0 14 14"
      width={14}
      height={14}
      aria-hidden
    >
      <path
        d="M2.5 7.2 5.4 10 11.5 3.8"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

const STAR_PARTS = [
  {
    letter: "S",
    title: "Situation",
    pct: "~20%",
    body:
      "Open with one or two sentences of context: where you were, your role, and what was going on. Share only what someone new to the story needs—skip the long backstory.",
  },
  {
    letter: "T",
    title: "Task",
    pct: "~10%",
    body:
      "Name the challenge or goal: what had to get done and what you were responsible for. That shows what a good outcome would have looked like.",
  },
  {
    letter: "A",
    title: "Action",
    pct: "~60%",
    body:
      "Explain what you did, in order—decisions you made, who you worked with, and the concrete steps you took. Plan for this to be the longest part of your answer.",
  },
  {
    letter: "R",
    title: "Result",
    pct: "~10%",
    body:
      "Close with what happened next: numbers if you have them, feedback you heard, or a clear takeaway. If it didn’t go smoothly, add what you learned or what you’d do differently now.",
  },
] as const;

const INTERVIEW_TIPS = [
  "Stick to what really happened. Interviewers notice when a story feels rehearsed or inflated, and it may not match your resume or references.",
  "Say what you did using “I,” even for team wins. Employers need to see your contribution, not only that the group succeeded.",
  "Use one specific story instead of a vague habit (“I always…”). Concrete details make your skills believable.",
  "Point your example at the job. If the posting stresses communication or ownership, highlight those in your Action and Result.",
] as const;

const PREP_TIPS = [
  "You can’t guess every question. Prepare 3–5 strong stories and reuse them across prompts by shifting the emphasis.",
  "Jot bullet notes or a short outline—full scripts often sound stiff and are hard to adapt on the spot.",
  "Read the job description for repeated verbs and themes; they hint at what interviewers will probe for.",
] as const;

const SIDEBAR_NAV = [
  { href: "#star-why", label: "Why it helps" },
  { href: "#star-four", label: "The four parts" },
  { href: "#star-tips", label: "Before you dive in" },
  { href: "#star-prep", label: "Preparing your stories" },
  { href: "#star-storybank", label: "Using StoryBank" },
  { href: "#star-practice", label: "Practice" },
] as const;

const STAR_AT_A_GLANCE = [
  { letter: "S", label: "Situation", hint: "Set the scene: who you were and what was happening." },
  { letter: "T", label: "Task", hint: "The problem or goal—and your part in fixing it." },
  { letter: "A", label: "Action", hint: "What you did, step by step (most of your time)." },
  { letter: "R", label: "Result", hint: "How it turned out; numbers or lessons if helpful." },
] as const;

function StarResourceSidebar() {
  return (
    <aside className="star-resource-aside" aria-label="Quick reference and shortcuts">
      <nav className="card star-resource-aside-card" aria-labelledby="star-resource-nav-h">
        <h2 className="star-resource-aside-card__title" id="star-resource-nav-h">
          On this page
        </h2>
        <ul className="star-resource-aside-nav">
          {SIDEBAR_NAV.map(({ href, label }) => (
            <li key={href}>
              <a href={href} className="star-resource-aside-nav__link">
                {label}
              </a>
            </li>
          ))}
        </ul>
      </nav>

      <div className="card star-resource-aside-card">
        <h2 className="star-resource-aside-card__title">STAR at a glance</h2>
        <p className="star-resource-aside-lede">
          Aim for about <strong>60%</strong> on <strong>Action</strong>; keep Situation and Task brief.
        </p>
        <dl className="star-resource-glance">
          {STAR_AT_A_GLANCE.map(({ letter, label, hint }) => (
            <div key={letter} className="star-resource-glance__row">
              <dt>
                <span className="star-resource-glance__mark" aria-hidden>
                  {letter}
                </span>
                {label}
              </dt>
              <dd>{hint}</dd>
            </div>
          ))}
        </dl>
      </div>

      <div className="card star-resource-aside-card">
        <h2 className="star-resource-aside-card__title">In StoryBank</h2>
        <ul className="star-resource-aside-fields">
          <li>
            <span className="star-resource-aside-fields__k">Library</span>
            <span className="star-resource-aside-fields__v">
              Keep a small set of real stories you can polish—not one-off notes you lose.
            </span>
          </li>
          <li>
            <span className="star-resource-aside-fields__k">Reuse</span>
            <span className="star-resource-aside-fields__v">
              The same story can fit many prompts; categories help you grab the right one fast.
            </span>
          </li>
          <li>
            <span className="star-resource-aside-fields__k">Practice</span>
            <span className="star-resource-aside-fields__v">
              Save questions you expect and rehearse against the stories you already wrote.
            </span>
          </li>
        </ul>
      </div>

      <div className="card star-resource-aside-card star-resource-aside-card--muted">
        <h2 className="star-resource-aside-card__title">Further reading</h2>
        <p className="star-resource-aside-foot">
          <a
            href="https://capd.mit.edu/resources/the-star-method-for-behavioral-interviews/"
            target="_blank"
            rel="noopener noreferrer"
            className="star-resource-aside-foot__link"
          >
            MIT CAPD: STAR method & worksheet
          </a>
        </p>
      </div>

      <div className="star-resource-aside-actions">
        <Link href="/common-questions" className="btn-primary star-resource-aside-actions__btn">
          Common questions
        </Link>
        <Link href="/stories/new" className="btn-secondary star-resource-aside-actions__btn">
          New story
        </Link>
        <Link href="/dashboard" className="btn-secondary star-resource-aside-actions__btn">
          Dashboard
        </Link>
      </div>
    </aside>
  );
}

export default function InterviewTipsPage() {
  return (
    <main className="main-content star-resource-page">
      <header className="page-header">
        <div className="page-header-left">
          <h1 className="page-title">STAR method</h1>
          <p className="page-subtitle">
            A simple structure for behavioral questions like “Tell me about a time when…”
          </p>
        </div>
      </header>

      <div className="star-resource-layout">
        <div className="star-resource-main">
          <div className="star-resource-lede-block">
            <p className="star-resource-lede">
              In a behavioral interview, the interviewer learns how you act at work from{" "}
              <strong>real examples</strong> from your past—not hypotheticals.
            </p>
            <p className="star-resource-lede">
              <abbr title="Situation, Task, Action, Result">STAR</abbr> is a common way to keep those
              answers clear and complete, with most of your talking time on what <em>you</em> did
              (especially Action).
            </p>
          </div>

          <section className="star-resource-block" aria-labelledby="star-why">
            <h2 className="section-label" id="star-why">
              Why it helps
            </h2>
            <div className="card star-resource-prose-card">
              <p className="star-resource-card-p">
                Some questions are framed as a simple yes or no (“Do you have experience with…?”).
                Answer with a clear yes—then back it up with a short story that shows what that
                experience actually looked like. STAR gives that story a beginning, middle, and end, so
                the interviewer can follow you without wading through extra detail.
              </p>
            </div>
          </section>

          <section className="star-resource-block" aria-labelledby="star-four">
            <h2 className="section-label" id="star-four">
              The four parts
            </h2>
            <p className="star-resource-intro">
              The bar below is a <strong>rough guide</strong>, not a timer:{" "}
              <strong>Action</strong> should get most of your talking time; Situation and Task stay
              short. The split is a common rule of thumb used in career resources such as{" "}
              <a
                href="https://capd.mit.edu/resources/the-star-method-for-behavioral-interviews/"
                target="_blank"
                rel="noopener noreferrer"
              >
                MIT CAPD
              </a>
              .
            </p>
            <div
              className="star-resource-timebar"
              role="img"
              aria-label="Rough share of answer time: Situation about 20 percent, Task about 10 percent, Action about 60 percent, Result about 10 percent"
            >
              <span className="star-resource-timebar__seg star-resource-timebar__seg--s" title="Situation ~20%">
                <span className="star-resource-timebar__label">S ~20%</span>
              </span>
              <span className="star-resource-timebar__seg star-resource-timebar__seg--t" title="Task ~10%">
                <span className="star-resource-timebar__label">T ~10%</span>
              </span>
              <span className="star-resource-timebar__seg star-resource-timebar__seg--a" title="Action ~60%">
                <span className="star-resource-timebar__label">A ~60%</span>
              </span>
              <span className="star-resource-timebar__seg star-resource-timebar__seg--r" title="Result ~10%">
                <span className="star-resource-timebar__label">R ~10%</span>
              </span>
            </div>
            <div className="star-resource-parts-stack">
              {STAR_PARTS.map(({ letter, title, pct, body }) => (
                <div key={letter} className="card star-resource-part">
                  <div className="star-resource-part__head">
                    <span className="star-resource-part__mark" aria-hidden>
                      {letter}
                    </span>
                    <div>
                      <h3 className="star-resource-part__title">{title}</h3>
                      <p className="star-resource-part__pct">{pct} of your answer</p>
                    </div>
                  </div>
                  <p className="star-resource-part__body">{body}</p>
                </div>
              ))}
            </div>
          </section>

          <section className="star-resource-block" aria-labelledby="star-tips">
            <h2 className="section-label" id="star-tips">
              Before you dive in
            </h2>
            <ul className="star-resource-list card star-resource-list-card">
              {INTERVIEW_TIPS.map((line) => (
                <li key={line}>
                  <ListCheckIcon />
                  <span>{line}</span>
                </li>
              ))}
            </ul>
          </section>

          <section className="star-resource-block" aria-labelledby="star-prep">
            <h2 className="section-label" id="star-prep">
              Preparing your stories
            </h2>
            <ul className="star-resource-list card star-resource-list-card">
              {PREP_TIPS.map((line) => (
                <li key={line}>
                  <ListCheckIcon />
                  <span>{line}</span>
                </li>
              ))}
            </ul>
          </section>

          <section className="star-resource-block" aria-labelledby="star-storybank">
            <h2 className="section-label" id="star-storybank">
              Using StoryBank
            </h2>
            <div className="card star-resource-prose-card">
              <p className="star-resource-card-p">
                StoryBank is for keeping a <strong>small library</strong> of behavioral examples you
                actually lived—so prep is reuse and refinement, not reinventing answers from scratch
                every time. Tag stories with categories that show up in job posts (leadership,
                conflict, deadlines) so when a question lands, you can pull the right example quickly.
              </p>
              <p className="star-resource-card-p">
                Save <strong>common questions</strong> you expect or collect from postings, and practice
                by connecting them to the stories you already drafted. The STAR structure above is the
                shape to aim for in how you tell each one.
              </p>
            </div>
          </section>

          <section className="star-resource-block star-resource-block--cta" id="star-practice" aria-labelledby="star-practice-h">
            <h2 className="section-label" id="star-practice-h">
              Practice
            </h2>
            <div className="card star-resource-cta">
              <div className="card-head">
                <h3 className="card-title">Put it into practice</h3>
              </div>
              <p className="star-resource-cta__text">
                Save common prompts and link them to STAR stories so you are not starting from a blank
                page.
              </p>
              <div className="star-resource-cta__actions">
                <Link href="/common-questions" className="btn-primary">
                  Common questions
                </Link>
                <Link href="/stories" className="btn-secondary">
                  My stories
                </Link>
              </div>
            </div>
          </section>
        </div>

        <StarResourceSidebar />
      </div>
    </main>
  );
}
