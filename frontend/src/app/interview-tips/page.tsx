import Link from "next/link";
import { StarResourceBackToTop, StarResourceTocNav } from "@/components/StarResourcePageChrome";
import { StarResourceTimeBar } from "@/components/StarResourceTimeBar";

function ListCheckIcon() {
  return (
    <svg
      className="sb-star-page__check"
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
    id: "star-part-s",
    letter: "S",
    title: "Situation",
    pct: "~20%",
    plain: "Where were you, and what was going on?",
    body:
      "Give just enough context: your role and the moment. Skip long history—only what someone outside your team needs to picture the scene.",
  },
  {
    id: "star-part-t",
    letter: "T",
    title: "Task",
    pct: "~10%",
    plain: "What needed to happen?",
    body:
      "State the goal or problem and what you were personally responsible for. That defines what “finished” looks like before you describe actions.",
  },
  {
    id: "star-part-a",
    letter: "A",
    title: "Action",
    pct: "~60%",
    plain: "What did you do, in order?",
    body:
      "This is the proof: concrete steps, tradeoffs, who you partnered with. It should be the longest part of the answer.",
  },
  {
    id: "star-part-r",
    letter: "R",
    title: "Result",
    pct: "~10%",
    plain: "How did it end—and what did you learn?",
    body:
      "Share outcomes, metrics if you have them, feedback, or a lesson. If it failed, say what you would do differently now.",
  },
] as const;

const GLANCE_CARDS = [
  { letter: "S", title: "Situation", line: "Set the scene in one or two sentences." },
  { letter: "T", title: "Task", line: "Name what you had to deliver or fix." },
  { letter: "A", title: "Action", line: "Walk through what you did—this is most of the answer." },
  { letter: "R", title: "Result", line: "Close with impact, numbers, or a takeaway." },
] as const;

const ANSWER_TIPS = [
  "Use a real past example—details should line up with your resume and what references could confirm.",
  "Say “I” for your own moves, even on a team win. Interviewers need your contribution clearly.",
  "Pick one specific moment instead of a vague habit (“I always…”). Specific beats generic.",
  "Echo skills from the job description in Action and Result when you can.",
] as const;

const PREP_TIPS = [
  "You won’t predict every question. Build 3–5 solid stories you can retell with different emphasis.",
  "Outline bullets, not a memorized script—so you still sound natural when wording changes.",
  "Read the posting for repeated skills and verbs; they often match interview themes.",
] as const;

const STORYBANK_USE_STEPS = [
  {
    title: "Open New story",
    body:
      "Each story is one behavioral example. The form follows Situation & Task, then Action, then Result—the same letters you see above.",
  },
  {
    title: "Draft the STAR fields",
    body:
      "You don’t need a perfect first pass. Incomplete sections stay visible so you finish a real example instead of a vague note.",
  },
  {
    title: "Add categories",
    body:
      "Tag themes like leadership, conflict, or deadlines. Later you can filter stories when a question appears.",
  },
  {
    title: "Save questions and link stories",
    body:
      "Store prompts you expect (or pick from common lists) and connect each question to the story that fits best.",
  },
  {
    title: "Check the dashboard",
    body:
      "See which stories are STAR-complete, which questions still need a match, and what to polish next in one place.",
  },
] as const;

const LEARN_LIST = [
  "What STAR stands for and how much time to spend on each part",
  "Why behavioral interviews use this format",
  "How StoryBank maps STAR into the app so prep stays organized",
] as const;

export default function InterviewTipsPage() {
  return (
    <main className="main-content sb-star-page">
      <div className="sb-star-page-inner">
        <header className="sb-star-page-hero" id="star-intro">
          <p className="sb-star-page-kicker">Behavioral interviews · New to STAR?</p>
          <h1 className="page-title sb-star-page-title">The STAR method</h1>
          <p className="page-subtitle sb-star-page-subtitle">
            If you have never heard of STAR, you are in the right place. This page explains what it is, how to use it
            when you answer “Tell me about a time…,” and how StoryBank fits into your prep.
          </p>
          <blockquote className="sb-star-page-pullquote">
            <p className="sb-star-page-pullquote__label">In one sentence</p>
            <p className="sb-star-page-pullquote__body">
              <abbr title="Situation, Task, Action, Result">STAR</abbr> is a four-part outline for{" "}
              <strong>behavioral</strong> questions: you walk through a real past example in order—so your answer is
              clear, evidence-based, and easy to follow.
            </p>
          </blockquote>
          <div className="sb-star-page-hero-outcomes" aria-labelledby="star-learn-heading">
            <p className="sb-star-page-hero-outcomes__title" id="star-learn-heading">
              On this page you will
            </p>
            <ul className="sb-star-page-hero-outcomes__list">
              {LEARN_LIST.map((line) => (
                <li key={line}>{line}</li>
              ))}
            </ul>
          </div>
        </header>

        <div className="sb-star-page-sticky">
          <nav className="sb-star-page-toc-shell" aria-labelledby="sb-star-toc-label">
            <span className="sb-star-page-toc-shell__label" id="sb-star-toc-label">
              On this page
            </span>
            <StarResourceTocNav />
          </nav>
        </div>

        <div className="sb-star-page-body">
          <section id="star-why" className="sb-star-page-section" aria-labelledby="star-why-heading">
            <h2 className="section-label sb-star-page-h2" id="star-why-heading">
              Why behavioral interviews use STAR
            </h2>
            <p className="sb-star-page-lede">
              Many interviewers ask how you handled something before because past behavior is a practical signal of how
              you work. Without a structure, answers often drift: too much context, not enough about what{" "}
              <em>you</em> did, or no clear ending.
            </p>
            <div className="card sb-star-page-card">
              <p className="sb-star-page-p">
                <strong>STAR is not a test.</strong> It is a simple checklist—four buckets so you cover context, your
                responsibility, your actions, and the outcome. Interviewers who use behavioral questions often think in
                similar terms; when you follow STAR, they can follow your story.
              </p>
              <p className="sb-star-page-p">
                <strong>StoryBank</strong> uses the same four ideas as fields in the app, so the work you do here stays
                organized—you are not maintaining a separate worksheet.
              </p>
            </div>
          </section>

          <section id="star-glance" className="sb-star-page-section" aria-labelledby="star-glance-heading">
            <h2 className="section-label sb-star-page-h2" id="star-glance-heading">
              STAR in one view
            </h2>
            <p className="sb-star-page-lede">
              Same order everywhere: <strong>S</strong>ituation → <strong>T</strong>ask → <strong>A</strong>ction →{" "}
              <strong>R</strong>esult. Most of your speaking time should land on <strong>Action</strong>—that is where
              you show skills.
            </p>
            <p className="sb-star-page-lede sb-star-page-lede--follow">
              The percentages below are a <strong>rough guide</strong>, not a stopwatch. Career centers teach similar
              splits (for example{" "}
              <a
                href="https://capd.mit.edu/resources/the-star-method-for-behavioral-interviews/"
                target="_blank"
                rel="noopener noreferrer"
              >
                MIT CAPD
              </a>
              ). Tap a segment to jump to that step.
            </p>
            <ul className="sb-star-page-glance-grid" aria-label="STAR steps at a glance">
              {GLANCE_CARDS.map(({ letter, title, line }) => (
                <li key={letter} className="sb-star-page-glance-card">
                  <span className="sb-star-page-glance-card__letter" aria-hidden>
                    {letter}
                  </span>
                  <div>
                    <h3 className="sb-star-page-glance-card__title">{title}</h3>
                    <p className="sb-star-page-glance-card__body">{line}</p>
                  </div>
                </li>
              ))}
            </ul>
            <StarResourceTimeBar />
          </section>

          <section id="star-four" className="sb-star-page-section" aria-labelledby="star-four-heading">
            <h2 className="section-label sb-star-page-h2" id="star-four-heading">
              Each letter, explained
            </h2>
            <p className="sb-star-page-lede">
              Read once top to bottom; then use the bar above to jump back while you draft.
            </p>
            <div className="card sb-star-page-timeline-stack">
              <ol className="sb-star-page-timeline" aria-label="STAR answer structure in order">
                {STAR_PARTS.map(({ id, letter, title, pct, plain, body }) => (
                  <li key={id} id={id} className="sb-star-page-timeline__item">
                    <div className="sb-star-page-timeline__track" aria-hidden>
                      <span className="sb-star-page-timeline__node">{letter}</span>
                    </div>
                    <div className="sb-star-page-timeline__segment">
                      <div className="sb-star-page-part__head">
                        <div className="sb-star-page-part__title-row">
                          <h3 className="sb-star-page-part__title">{title}</h3>
                          <span className="sb-star-page-part__pct" aria-label={`Roughly ${pct} of your answer`}>
                            {pct}
                          </span>
                        </div>
                        <p className="sb-star-page-part__plain">{plain}</p>
                      </div>
                      <p className="sb-star-page-part__body">{body}</p>
                    </div>
                  </li>
                ))}
              </ol>
            </div>
          </section>

          <section id="star-tips" className="sb-star-page-section" aria-labelledby="star-tips-heading">
            <h2 className="section-label sb-star-page-h2" id="star-tips-heading">
              Tips
            </h2>
            <p className="sb-star-page-lede">
              Short reminders for the interview room and for your prep sessions.
            </p>
            <div className="sb-star-page-advice">
              <h3 className="sb-star-page-advice__sub" id="star-tips-answer">
                When you are answering
              </h3>
              <ul className="sb-star-page-list card sb-star-page-list-card">
                {ANSWER_TIPS.map((line) => (
                  <li key={line}>
                    <ListCheckIcon />
                    <span>{line}</span>
                  </li>
                ))}
              </ul>
              <h3 className="sb-star-page-advice__sub" id="star-tips-prep">
                When you are preparing stories
              </h3>
              <ul className="sb-star-page-list card sb-star-page-list-card">
                {PREP_TIPS.map((line) => (
                  <li key={line}>
                    <ListCheckIcon />
                    <span>{line}</span>
                  </li>
                ))}
              </ul>
            </div>
          </section>

          <section id="star-storybank" className="sb-star-page-section" aria-labelledby="star-storybank-heading">
            <h2 className="section-label sb-star-page-h2" id="star-storybank-heading">
              How StoryBank fits STAR
            </h2>
            <p className="sb-star-page-lede">
              StoryBank is a workspace for behavioral prep: draft stories once, organize them, and attach interview
              questions—instead of scattered notes the night before.
            </p>
            <div className="card sb-star-page-card">
              <p className="sb-star-page-p">
                <strong>What you get:</strong> a small library of stories you trust, categories for quick lookup, saved
                questions, and a dashboard that shows what is incomplete—so you always know what to work on next.
              </p>
            </div>
            <ol className="sb-star-page-steps card sb-star-page-steps-card">
              {STORYBANK_USE_STEPS.map(({ title, body }, index) => (
                <li key={title}>
                  <span className="sb-star-page-steps__num" aria-hidden>
                    {index + 1}
                  </span>
                  <div>
                    <strong className="sb-star-page-steps__title">{title}</strong>
                    <p className="sb-star-page-steps__body">{body}</p>
                  </div>
                </li>
              ))}
            </ol>
            <p className="sb-star-page-foot">
              Open the <Link href="/dashboard">dashboard</Link> anytime to see story progress, categories, and which
              saved questions still need a linked story.
            </p>
          </section>

          <section id="star-next" className="sb-star-page-section sb-star-page-section--last" aria-labelledby="star-next-heading">
            <h2 className="section-label sb-star-page-h2" id="star-next-heading">
              Next steps
            </h2>
            <div className="card sb-star-page-cta">
              <div className="card-head">
                <h3 className="card-title">Put it into StoryBank</h3>
              </div>
              <p className="sb-star-page-cta__text">
                Add your first story with STAR fields, browse prompts you might get asked, or open the dashboard to see
                your prep at a glance.
              </p>
              <div className="sb-star-page-cta__actions">
                <Link href="/stories/new" className="btn-primary">
                  New story
                </Link>
                <Link href="/common-questions" className="btn-secondary">
                  Common questions
                </Link>
                <Link href="/dashboard" className="btn-secondary">
                  Dashboard
                </Link>
              </div>
            </div>
          </section>
        </div>
      </div>
      <StarResourceBackToTop />
    </main>
  );
}
