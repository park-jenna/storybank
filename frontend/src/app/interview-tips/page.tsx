import type { Metadata } from "next";
import Link from "next/link";

import { StarResourceAsideNav, StarResourceBackToTop } from "@/components/StarResourcePageChrome";
import { StarResourceTimeBar } from "@/components/StarResourceTimeBar";

export const metadata: Metadata = {
  title: "STAR method · Interview tips",
  description:
    "STAR explained in plain language, plus how StoryBank helps you keep category-tagged stories ready so different behavioral questions still map to the same proof.",
};

const MIT_STAR_URL =
  "https://capd.mit.edu/resources/the-star-method-for-behavioral-interviews/";

export default function InterviewTipsPage() {
  return (
    <main className="main-content">
      <div className="page-shell page-shell--wide star-doc-shell">
        <div className="star-doc-layout">
          <header className="page-header star-doc-layout__head">
            <div className="page-header-left">
              <p className="star-doc-kicker">Interview prep</p>
              <h1 className="page-title">STAR method</h1>
              <p className="page-subtitle">
                A short structure for behavioral questions so your answer has a beginning, a middle
                where you drive the story, and a clear ending.
              </p>
            </div>
          </header>

          <aside className="star-doc-aside" aria-label="On this page">
            <div className="star-doc-aside__sticky">
              <StarResourceAsideNav />
            </div>
          </aside>

          <div className="star-doc-main">
            <article className="star-doc-prose" lang="en">
              <section className="star-doc-section" id="star-what" aria-labelledby="h-what">
                <h2 className="star-doc-h2" id="h-what">
                  What is STAR method?
                </h2>
                <p className="star-doc-p">
                  <abbr title="Situation, Task, Action, Result" className="star-doc-abbr">
                    STAR
                  </abbr>{" "}
                  is a way to organize answers
                  when an interviewer asks for a real example from your past. It is not a magic phrase
                  you have to say out loud; it is a checklist so you do not skip the part they actually
                  want to hear—what you did when something mattered.
                </p>
                <div className="star-doc-acronym" aria-label="STAR stands for four steps">
                  <div className="star-doc-acronym__item">
                    <span className="star-doc-acronym__meta">
                      <span className="star-doc-acronym__name">Situation</span>
                      <span className="star-doc-acronym__hint">Time, place, and why it mattered</span>
                    </span>
                  </div>
                  <div className="star-doc-acronym__item">
                    <span className="star-doc-acronym__meta">
                      <span className="star-doc-acronym__name">Task</span>
                      <span className="star-doc-acronym__hint">What you were expected to fix or deliver</span>
                    </span>
                  </div>
                  <div className="star-doc-acronym__item">
                    <span className="star-doc-acronym__meta">
                      <span className="star-doc-acronym__name">Action</span>
                      <span className="star-doc-acronym__hint">The steps you took and choices you made</span>
                    </span>
                  </div>
                  <div className="star-doc-acronym__item">
                    <span className="star-doc-acronym__meta">
                      <span className="star-doc-acronym__name">Result</span>
                      <span className="star-doc-acronym__hint">What happened next, with proof if you have it</span>
                    </span>
                  </div>
                </div>
                <p className="star-doc-p star-doc-p--tight-top">
                  Most people talk too long on Situation and too little on Action. If you only remember
                  one thing, let Action be the longest, most specific part of the story.
                </p>
              </section>

              <section className="star-doc-section" id="star-when" aria-labelledby="h-when">
                <h2 className="star-doc-h2" id="h-when">
                  When to use STAR
                </h2>
                <p className="star-doc-p">
                  Pull out STAR when the question is about behavior: how you handle pressure, conflict,
                  ambiguity, mistakes, influence, or collaboration. If they ask you to describe a past
                  event, they are usually grading you on judgment and execution, not on your ability to
                  summarize company history.
                </p>
                <p className="star-doc-p">
                  You can skip STAR for quick factual answers or deep technical deep-dives where the
                  interviewer only wants mechanics. For anything that sounds like “Tell me about a
                  time…,” a STAR-shaped answer is a safe default.
                </p>
                <ul className="star-doc-bullets">
                  <li>
                    The interviewer wants a real example from your past, often introduced with “Tell me
                    about a time…” or something in that family.
                  </li>
                  <li>
                    The topic is how you work with people—leading, collaborating, recovering from
                    setbacks, or getting a clear message across when it matters.
                  </li>
                  <li>
                    You are aiming for a few minutes of narrative: a short setup, most of the time on what
                    you did, then how things ended or what you learned.
                  </li>
                </ul>
              </section>

              <section className="star-doc-section" id="star-how" aria-labelledby="h-how">
                <h2 className="star-doc-h2" id="h-how">
                  How to use STAR
                </h2>
                <p className="star-doc-p">
                  Many career guides suggest spending most of your airtime on Action. MIT CAPD, for
                  example, offers a rough split: Situation about 20%, Task about 10%,{" "}
                  <strong>Action about 60%</strong>, Result about 10%. Treat that as a compass, not a
                  script—your story might need a little more or less setup.
                </p>
                <div className="star-doc-time">
                  <StarResourceTimeBar />
                  <p className="star-doc-source">
                    <span className="star-doc-source__label">Reference · </span>
                    <a href={MIT_STAR_URL} target="_blank" rel="noopener noreferrer">
                      MIT CAPD — The STAR method for behavioral interviews
                    </a>
                  </p>
                </div>
                <h3 className="star-doc-h3" id="h-how-letters">
                  What each letter means
                </h3>
                <ul className="star-doc-letters">
                  <li className="star-doc-letter" id="star-part-s">
                    <div className="star-doc-letter__row">
                      <span className="star-doc-letter__name">Situation</span>
                      <span className="star-doc-letter__pct">~20%</span>
                    </div>
                    <p className="star-doc-letter__p">
                      Set the scene in one or two sentences: who was involved, what system or project you
                      were in, and what was going wrong or what opportunity you faced. Skip org charts and
                      backstory unless the interviewer asks.
                    </p>
                  </li>
                  <li className="star-doc-letter" id="star-part-t">
                    <div className="star-doc-letter__row">
                      <span className="star-doc-letter__name">Task</span>
                      <span className="star-doc-letter__pct">~10%</span>
                    </div>
                    <p className="star-doc-letter__p">
                      State the goal you personally owned: a metric, a deadline, a risk to reduce, or a
                      decision the team needed. One clean sentence is often enough.
                    </p>
                  </li>
                  <li className="star-doc-letter" id="star-part-a">
                    <div className="star-doc-letter__row">
                      <span className="star-doc-letter__name">Action</span>
                      <span className="star-doc-letter__pct">~60%</span>
                    </div>
                    <p className="star-doc-letter__p">
                      Walk through what <strong>you</strong> did in order: how you diagnosed the issue,
                      who you aligned with, what you built or changed, and how you handled tradeoffs.
                      Use “I” for your work; name the team when credit is shared, but stay specific about
                      your role.
                    </p>
                  </li>
                  <li className="star-doc-letter" id="star-part-r">
                    <div className="star-doc-letter__row">
                      <span className="star-doc-letter__name">Result</span>
                      <span className="star-doc-letter__pct">~10%</span>
                    </div>
                    <p className="star-doc-letter__p">
                      Close with outcomes: numbers, time saved, fewer incidents, happier customers, or a
                      process that stuck. If the ending was mixed, say what you learned and what you would
                      do differently now—briefly, without undoing a strong Action section.
                    </p>
                  </li>
                </ul>
              </section>

              <section className="star-doc-section" id="star-example" aria-labelledby="h-example">
                <h2 className="star-doc-h2" id="h-example">
                  STAR stories example
                </h2>
                <p className="star-doc-p">
                  Here is one sample answer to a common prompt.
                </p>
                <p className="star-doc-p">
                  In a real interview you might shorten it or add detail if they ask follow-ups; the STAR
                  skeleton stays the same.
                </p>
                <div className="star-doc-example">
                  <p className="star-doc-example__prompt">
                    “Tell me about a time you had to deal with a sudden problem in production.”
                  </p>
                  <div className="star-doc-example__blocks">
                    <div className="star-doc-example__block">
                      <p className="star-doc-example__kind">Situation</p>
                      <p>
                        I was on call for our checkout service on a Friday afternoon. Error rates jumped
                        right after a routine deploy, and the support queue started filling with customers
                        who could not complete purchases.
                      </p>
                    </div>
                    <div className="star-doc-example__block">
                      <p className="star-doc-example__kind">Task</p>
                      <p>
                        I needed to stop the bleeding quickly, figure out whether to roll back or patch
                        forward, and keep support and leadership informed without guessing out loud.
                      </p>
                    </div>
                    <div className="star-doc-example__block">
                      <p className="star-doc-example__kind">Action</p>
                      <p>
                        I pulled the last hour of logs and traced failures to a new validation rule that
                        rejected a subset of tax IDs we had not tested against production data. I paired
                        with another engineer, reproduced the case in staging, and drafted a minimal fix.
                      </p>
                      <p>
                        We presented leadership with two options: immediate rollback (fastest restore) or
                        a targeted hotfix with extra monitoring (slightly riskier but avoids losing other
                        changes in the deploy). They chose the hotfix.
                      </p>
                      <p>
                        I shipped it behind a feature flag, watched metrics for thirty minutes, then ramped
                        traffic. I wrote a short timeline for support and filed follow-up tickets for tests
                        we were missing.
                      </p>
                    </div>
                    <div className="star-doc-example__block">
                      <p className="star-doc-example__kind">Result</p>
                      <p>
                        Checkout errors returned to normal within about forty-five minutes. We had no
                        further incidents that weekend. The missing test case was added in the next
                        sprint, and the runbook now includes a checklist for that validation path.
                      </p>
                    </div>
                  </div>
                </div>
              </section>

              <section
                className="star-doc-section star-doc-section--last star-doc-section--storybank"
                id="star-storybank"
                aria-labelledby="h-sb"
              >
                <h2 className="star-doc-h2" id="h-sb">
                  How StoryBank can help
                </h2>
                <p className="star-doc-storybank-lead">
                  Interviewers phrase behavioral questions in all kinds of ways, but many prompts are
                  listening for the same strengths. StoryBank helps you keep real examples organized{" "}
                  <strong>by category</strong> so you can route a new question to a story you already
                  trust—without inventing structure on the spot.
                </p>
                <p className="star-doc-p">
                  Think conflict, ambiguity, owning mistakes, influence without authority, or getting a
                  team unstuck: different wording, similar proof.
                </p>
                <p className="star-doc-p">
                  Each story stays in STAR form. When a prompt lands, you choose which prepared example
                  fits the signal, then tighten it for that exact question—not build the arc from scratch
                  under stress.
                </p>
                <h3 className="star-doc-storybank-subhead" id="h-sb-steps">
                  Use the product in three steps
                </h3>
                <ol className="star-doc-steps" aria-labelledby="h-sb-steps">
                  <li>
                    <Link href="/stories/new">New story</Link> — capture several examples per theme
                    (leadership, teamwork, failure, pressure, and more) so one competency is not riding
                    on a single anecdote.
                  </li>
                  <li>
                    <Link href="/common-questions">Common questions</Link> — save real prompts and link the
                    stories that fit; practice noticing when a new question is “the same shape” as one you
                    already answered on paper.
                  </li>
                  <li>
                    <Link href="/dashboard">Dashboard</Link> — spot gaps: questions with no linked story, or
                    STAR fields that still need detail before you rely on them in the room.
                  </li>
                </ol>
                <div className="card star-doc-cta">
                  <p className="star-doc-cta__label">Practice loop</p>
                  <p className="star-doc-cta__p">
                    Read a question from My Questions out loud. Name which story you would use and which part of STAR
                    you would lean on. Repeat until the map from prompt to proof feels automatic—not
                    rushed, just familiar.
                  </p>
                  <div className="star-doc-cta__actions">
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
            </article>
          </div>
        </div>

        <StarResourceBackToTop />
      </div>
    </main>
  );
}
