"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { fetchUserQuestions, UserQuestionItem } from "@/lib/user-questions";
import { Button, Card, Badge, EmptyState } from "@/components/ui";

export default function SavedQuestionsPage() {
  const router = useRouter();
  const [userQuestions, setUserQuestions] = useState<UserQuestionItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        setError(null);
        const token = localStorage.getItem("token");
        if (!token) {
          setError("No token found. Please log in again.");
          router.replace("/login");
          return;
        }
        const data = await fetchUserQuestions(token);
        setUserQuestions(data.userQuestions);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load saved questions.");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [router]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    if (diffDays === 0) return "Today";
    if (diffDays === 1) return "Yesterday";
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    return date.toLocaleDateString();
  };

  return (
    <main className="saved-questions-page">
      <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
        <h1 className="text-2xl font-semibold m-0">Saved Questions</h1>
        <Link href="/common-questions">
          <Button variant="default">
            View common interview questions
          </Button>
        </Link>
      </div>

      {loading && <p className="muted mt-6">Loading saved questions...</p>}

      {error && (
        <Card variant="error" className="mt-4">
          <p className="form-error m-0">Error: {error}</p>
        </Card>
      )}

      {!loading && !error && userQuestions.length === 0 && (
        <EmptyState
          icon="📋"
          title="No saved questions yet"
          description="Save questions from the common list to see them here."
          action={
            <Button
              variant="primary"
              className="mt-4"
              onClick={() => router.push("/common-questions")}
            >
              View common questions
            </Button>
          }
        />
      )}

      {!loading && !error && userQuestions.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-4">
          {userQuestions.map((uq) => (
            <Card key={uq.id} variant="default" className="block">
              <div className="flex justify-between items-start mb-2">
                <span className="text-sm muted">{formatDate(uq.createdAt)}</span>
              </div>
              <h3 className="text-lg font-semibold mb-2 line-clamp-2">
                {uq.question.content}
              </h3>
              {uq.question.recommendedCategories?.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-3">
                  {uq.question.recommendedCategories.slice(0, 3).map((cat) => (
                    <Badge key={cat} category={cat} />
                  ))}
                </div>
              )}
              {uq.stories.length > 0 ? (
                <div className="mt-2">
                  <p className="text-sm muted mb-1">
                    Linked stories ({uq.stories.length})
                  </p>
                  <ul className="list-none p-0 m-0 space-y-1">
                    {uq.stories.map((s) => (
                      <li key={s.id}>
                        <Link
                          href={`/stories/${s.id}`}
                          className="text-sm text-[var(--primary)] hover:underline"
                        >
                          {s.title}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              ) : (
                <p className="text-sm muted mt-2">No stories linked yet.</p>
              )}
            </Card>
          ))}
        </div>
      )}
    </main>
  );
}
