import Link from "next/link";
import { StarResourceBackToTop, StarResourceGlanceJump, StarResourceTocNav } from "@/components/StarResourcePageChrome";
import { StarResourceTimeBar } from "@/components/StarResourceTimeBar";

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
    id: "star-part-s",
    letter: "S",
    title: "Situation",
    pct: "~20%",
    plain: "Where were you, and what was the background?",
    body:
      "Start with one or two sentences: your role and what was happening. Only include what a stranger would need—skip long history.",
  },
  {
    id: "star-part-t",
    letter: "T",
    title: "Task",
    pct: "~10%",
    plain: "What problem or goal were you working toward?",
    body:
      "State what had to get done and what you were personally responsible for. That makes it clear what “success” would look like.",
  },
  {
    id: "star-part-a",
    letter: "A",
    title: "Action",
    pct: "~60%",
    plain: "What did you actually do, step by step?",
    body:
      "Walk through what you did in order: choices you made, people you worked with, and concrete steps. This should be the longest part of your answer.",
  },
  {
    id: "star-part-r",
    letter: "R",
    title: "Result",
    pct: "~10%",
    plain: "How did it turn out, and what did you learn?",
    body:
      "Finish with the outcome: metrics if you have them, feedback you got, or a lesson learned. If things went sideways, say what you’d do differently now.",
  },
] as const;

const INTERVIEW_TIPS = [
  "Use a real situation from your past—not a made-up or exaggerated one. Details should line up with your resume and references.",
  "Say “I” for your own actions, even when the win was a team effort. Interviewers need to see your part clearly.",
  "Pick one specific moment instead of a vague habit (“I always…”). That makes your skills easier to believe.",
  "Tie the story to the job when you can. If the posting stresses communication or ownership, emphasize those in Action and Result.",
] as const;

const PREP_TIPS = [
  "You can’t predict every question. Build 3–5 solid stories and reuse them by shifting the emphasis to match the prompt.",
  "Use bullets or a short outline—not a word-for-word script—so you sound natural when you adapt on the spot.",
  "Skim the job description for repeated skills and verbs; they often match what interviewers will ask about.",
] as const;

const STORYBANK_USE_STEPS = [
  {
    title: "Write stories in STAR-shaped fields",
    body:
      "Create a story and fill in Situation & Task, Action, and Result. StoryBank nudges you toward a complete example, not a half-finished note.",
  },
  {
    title: "Tag categories that match job posts",
    body:
      "Add labels like leadership, conflict, or deadlines so when a question appears, you can find a relevant story quickly.",
  },
  {
    title: "Save questions and link them to stories",
    body:
      "Store prompts you expect (or pull from common lists) and connect each one to the story that answers it best.",
  },
  {
    title: "Use the dashboard to see what’s ready",
    body:
      "Check STAR completion, which questions still need a story, and where to polish next—so prep stays organized.",
  },
] as const;

function StarResourceSidebar() {
  return (
    <aside className="star-resource-aside" aria-label="Quick reference and shortcuts">
      <nav className="card star-resource-aside-card" aria-labelledby="star-resource-nav-h">
        <h2 className="star-resource-aside-card__title" id="star-resource-nav-h">
          On this page
        </h2>
        <StarResourceTocNav />
      </nav>

      <div className="card star-resource-aside-card">
        <h2 className="star-resource-aside-card__title">STAR at a glance</h2>
        <p className="star-resource-aside-lede">
          <strong>S</strong>ituation → <strong>T</strong>ask → <strong>A</strong>ction → <strong>R</strong>esult. Spend most of your time on{" "}
          <strong>Action</strong> (what you did).
        </p>
        <StarResourceGlanceJump />
        <p className="star-resource-aside-hint">
          Jump to each letter below, or read “What is STAR?” first if you’re new to the acronym.
        </p>
      </div>

      <div className="card star-resource-aside-card">
        <h2 className="star-resource-aside-card__title">StoryBank in short</h2>
        <ul className="star-resource-aside-fields">
          <li>
            <span className="star-resource-aside-fields__k">Purpose</span>
            <span className="star-resource-aside-fields__v">
              One place to draft behavioral stories, tag them, and connect them to interview questions.
            </span>
          </li>
          <li>
            <span className="star-resource-aside-fields__k">Why</span>
            <span className="star-resource-aside-fields__v">
              So you reuse strong examples instead of rewriting from scratch every time.
            </span>
          </li>
          <li>
            <span className="star-resource-aside-fields__k">Start</span>
            <span className="star-resource-aside-fields__v">
              Add a story, pick categories, then link saved questions when you’re ready to practice.
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
      <header className="page-header star-resource-page-header">
        <div className="page-header-left">
          <h1 className="page-title">STAR method</h1>
          <p className="page-subtitle">
            A friendly guide to the acronym—and how StoryBank helps you use it in real prep.
          </p>
          <p className="star-resource-hero-pill" role="status">
            <span className="star-resource-hero-pill__k">First time here?</span>
            <span className="star-resource-hero-pill__v">
              STAR is just four steps for telling a clear past-tense story in a behavioral interview. You don’t need to be an expert—only honest and specific.
            </span>
          </p>
        </div>
      </header>

      <div className="star-resource-layout">
        <div className="star-resource-main">
          <div className="star-resource-lede-block">
            <p className="star-resource-lede">
              Many interviews include <strong>behavioral</strong> questions: they ask how you behaved in real situations
              (“Tell me about a time when…”). A good answer is a short story from your experience—not a theory or a
              list of adjectives.
            </p>
            <p className="star-resource-lede">
              <abbr title="Situation, Task, Action, Result">STAR</abbr> is a widely used way to organize that story so
              it’s easy to follow: first context, then what you needed to do, then what <em>you</em> did, then how it
              ended. You’ll see the same shape inside StoryBank when you write a story.
            </p>
          </div>

          <section id="star-intro" className="star-resource-block" aria-labelledby="star-intro-heading">
            <h2 className="section-label" id="star-intro-heading">
              What is STAR?
            </h2>
            <div className="card star-resource-prose-card">
              <p className="star-resource-card-p">
                <strong>STAR</strong> is an acronym. Each letter is one chunk of your answer—think of it as{" "}
                <strong>setup → goal → what you did → ending</strong>.
              </p>
              <ul className="star-resource-plain-list">
                <li>
                  <strong>S — Situation:</strong> Briefly set the scene (where you were, your role, what was going on).
                </li>
                <li>
                  <strong>T — Task:</strong> Name the problem or goal—what had to happen.
                </li>
                <li>
                  <strong>A — Action:</strong> The heart of your answer: the steps <em>you</em> took. This is usually
                  most of your talking time.
                </li>
                <li>
                  <strong>R — Result:</strong> What changed afterward—numbers, feedback, or what you learned.
                </li>
              </ul>
              <p className="star-resource-card-p">
                You don’t have to say “First, Situation…” out loud. The letters are a <strong>checklist</strong> so you
                don’t skip the part interviewers care about most: your actions.
              </p>
            </div>
          </section>

          <section id="star-why" className="star-resource-block" aria-labelledby="star-why-heading">
            <h2 className="section-label" id="star-why-heading">
              Why it helps
            </h2>
            <div className="card star-resource-prose-card">
              <p className="star-resource-card-p">
                Behavioral questions reward <strong>evidence</strong>: a concrete example shows how you think and act,
                not just what you claim on paper. STAR keeps your answer from rambling or stopping too early—especially
                before you’ve explained what you personally did.
              </p>
              <p className="star-resource-card-p">
                If a question sounds like yes/no (“Have you used X?”), you can still answer yes—and then use STAR to
                show what that experience looked like in practice.
              </p>
            </div>
          </section>

          <section id="star-four" className="star-resource-block" aria-labelledby="star-four-heading">
            <h2 className="section-label" id="star-four-heading">
              The four parts (with rough timing)
            </h2>
            <p className="star-resource-intro">
              The bar is a <strong>rough guide</strong>, not a stopwatch: put most of your time on{" "}
              <strong>Action</strong>. Career centers often teach a similar split—for example{" "}
              <a
                href="https://capd.mit.edu/resources/the-star-method-for-behavioral-interviews/"
                target="_blank"
                rel="noopener noreferrer"
              >
                MIT CAPD
              </a>
              . Tap a segment to jump to that part below.
            </p>
            <StarResourceTimeBar />
            <div className="star-resource-parts-stack">
              {STAR_PARTS.map(({ id, letter, title, pct, plain, body }) => (
                <div key={letter} id={id} className="card star-resource-part">
                  <div className="star-resource-part__head">
                    <span className="star-resource-part__mark" aria-hidden>
                      {letter}
                    </span>
                    <div>
                      <h3 className="star-resource-part__title">{title}</h3>
                      <p className="star-resource-part__pct">{pct} of your answer</p>
                      <p className="star-resource-part__plain">{plain}</p>
                    </div>
                  </div>
                  <p className="star-resource-part__body">{body}</p>
                </div>
              ))}
            </div>
          </section>

          <section id="star-tips" className="star-resource-block" aria-labelledby="star-tips-heading">
            <h2 className="section-label" id="star-tips-heading">
              Before you answer
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

          <section id="star-prep" className="star-resource-block" aria-labelledby="star-prep-heading">
            <h2 className="section-label" id="star-prep-heading">
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

          <section id="star-storybank" className="star-resource-block" aria-labelledby="star-storybank-heading">
            <h2 className="section-label" id="star-storybank-heading">
              StoryBank: what it is and how to use it
            </h2>
            <div className="card star-resource-prose-card">
              <p className="star-resource-card-p">
                <strong>StoryBank</strong> is a personal workspace for behavioral interview prep. It’s built around the
                same STAR-shaped story you just read: you draft real examples once, organize them, and connect them to
                questions—so you’re not staring at a blank page the night before an interview.
              </p>
              <p className="star-resource-card-p">
                <strong>What it’s for:</strong> keeping a small library of stories you trust, seeing which questions still
                need a match, and rehearsing with prompts you care about—not scattered notes across docs and apps.
              </p>
            </div>
            <ol className="star-resource-steps card star-resource-steps-card">
              {STORYBANK_USE_STEPS.map(({ title, body }, index) => (
                <li key={title}>
                  <span className="star-resource-steps__num" aria-hidden>
                    {index + 1}
                  </span>
                  <div>
                    <strong className="star-resource-steps__title">{title}</strong>
                    <p className="star-resource-steps__body">{body}</p>
                  </div>
                </li>
              ))}
            </ol>
            <p className="star-resource-storybank-foot">
              The <Link href="/dashboard">dashboard</Link> pulls this together: story progress, categories, and which
              saved questions still need a linked story—so you know what to work on next.
            </p>
          </section>

          <section className="star-resource-block star-resource-block--cta" id="star-practice" aria-labelledby="star-practice-h">
            <h2 className="section-label" id="star-practice-h">
              Next steps
            </h2>
            <div className="card star-resource-cta">
              <div className="card-head">
                <h3 className="card-title">Try it in StoryBank</h3>
              </div>
              <p className="star-resource-cta__text">
                Add your first story with STAR fields, browse common questions, or open the dashboard to see your prep at
                a glance.
              </p>
              <div className="star-resource-cta__actions">
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

        <StarResourceSidebar />
      </div>
      <StarResourceBackToTop />
    </main>
  );
}
