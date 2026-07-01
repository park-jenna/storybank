import type { Metadata } from "next";
import { StarResourceAsideNav, StarResourceBackToTop } from "@/components/StarResourcePageChrome";
import { StarResourceTimeBar } from "@/components/StarResourceTimeBar";
import { StarBeforeAfter } from "@/components/StarBeforeAfter";
import { StarLetterAccordion } from "@/components/StarLetterAccordion";
import { StarHowSteps } from "@/components/StarHowSteps";

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
                A simple structure so your behavioral interview answers have a clear beginning,
                middle, and ending.
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

              {/* ── 1. What is STAR ── */}
              <section className="star-doc-section" id="star-what" aria-labelledby="h-what">
                <h2 className="star-doc-h2" id="h-what">
                  What is STAR?
                </h2>
                <p className="star-doc-p">
                  <abbr title="Situation, Task, Action, Result" className="star-doc-abbr">
                    STAR
                  </abbr>{" "}
                  is a checklist for answering behavioral questions — so you don&rsquo;t skip
                  the part the interviewer actually cares about: what you did when it mattered.
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
                <p className="star-doc-p star-doc-action-note">
                  If you only remember one thing, let <strong>Action</strong> be
                  the longest, most specific part of the story.
                </p>
              </section>

              {/* ── 2. See the difference (Before/After → Example) ── */}
              <section className="star-doc-section" id="star-example" aria-labelledby="h-example">
                <h2 className="star-doc-h2" id="h-example">
                  See the difference
                </h2>
                <p className="star-doc-p">
                  Same question, two answers. Toggle to see how STAR turns a vague response
                  into a clear, structured story.
                </p>
                <StarBeforeAfter />
              </section>

              {/* ── 3. Time allocation ── */}
              <section className="star-doc-section" id="star-how" aria-labelledby="h-how">
                <h2 className="star-doc-h2" id="h-how">
                  How to allocate your time
                </h2>
                <p className="star-doc-p">
                  Most people spend too long on Situation and rush through Action.
                  Aim for Action to be about <strong>60%</strong> of your answer — the
                  interviewer wants to hear what <em>you</em> did.
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
                <p className="star-doc-p">
                  Click any letter to expand writing tips.
                </p>
                <StarLetterAccordion />
              </section>

              {/* ── 4. When to use STAR ── */}
              <section className="star-doc-section" id="star-when" aria-labelledby="h-when">
                <h2 className="star-doc-h2" id="h-when">
                  When to use STAR
                </h2>
                <p className="star-doc-p">
                  Use STAR when the interviewer asks for a real past experience — anything
                  that sounds like &ldquo;Tell me about a time&hellip;&rdquo; Skip it for
                  quick factual answers or deep technical deep-dives.
                </p>
                <ul className="star-doc-bullets">
                  <li>
                    They want a real example — not a hypothetical or a summary of your
                    resume.
                  </li>
                  <li>
                    The topic is how you work with people: leading, collaborating,
                    recovering from setbacks, or communicating under pressure.
                  </li>
                  <li>
                    You&rsquo;re aiming for a few minutes of narrative — short setup, most
                    of the time on what you did, then a clear ending.
                  </li>
                </ul>
              </section>

              {/* ── 5. How StoryBank can help ── */}
              <section
                className="star-doc-section star-doc-section--last star-doc-section--storybank"
                id="star-storybank"
                aria-labelledby="h-sb"
              >
                <h2 className="star-doc-h2" id="h-sb">
                  How StoryBank can help
                </h2>
                <p className="star-doc-storybank-lead">
                  Different questions, same proof. StoryBank keeps your stories organized{" "}
                  <strong>by category</strong> so you can match any new prompt to an example
                  you already trust.
                </p>
                <h3 className="star-doc-storybank-subhead" id="h-sb-steps">
                  Use the product in four steps
                </h3>
                <StarHowSteps />
              </section>
            </article>
          </div>
        </div>

        <StarResourceBackToTop />
      </div>
    </main>
  );
}
