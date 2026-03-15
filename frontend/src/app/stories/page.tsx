"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";

import { fetchStories, Story } from "@/lib/stories";
import { CATEGORIES } from "@/constants/categories";
import { Button, Card, Chip, Badge, EmptyState } from "@/components/ui";

const ALL = "All" as const;

export default function StoriesPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [stories, setStories] = useState<Story[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [internalCategory, setInternalCategory] = useState<string>(ALL);

  const categoryFromUrl = searchParams.get("category");
  const selectedCategory =
    categoryFromUrl != null && categoryFromUrl !== ""
      ? decodeURIComponent(categoryFromUrl)
      : internalCategory;

  function handleSelectCategory(cat: string) {
    setInternalCategory(cat);
    if (cat === ALL) {
      router.replace("/stories");
    } else {
      router.replace(`/stories?category=${encodeURIComponent(cat)}`);
    }
  }

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
        const data = await fetchStories(token);
        setStories(data.stories);
      } catch (err) {
        const msg =
          err instanceof Error ? err.message : "Failed to load stories.";
        setError(msg);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [router]);

  const filteredStories = useMemo(() => {
    if (selectedCategory === ALL) return stories;
    return stories.filter((s) => s.categories.includes(selectedCategory));
  }, [stories, selectedCategory]);

  const hasAnyStories = stories.length > 0;
  const hasFilteredStories = filteredStories.length > 0;

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    if (diffDays === 0) return "Today";
    if (diffDays === 1) return "Yesterday";
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`;
    return `${Math.floor(diffDays / 365)} years ago`;
  };

  return (
    <main className="stories-page">
      {loading && <p className="muted mt-6">Loading stories...</p>}

      {!loading && !error && (
        <>
          <section className="page-section">
            <h2 className="page-section-title">All Stories</h2>
            <div className="flex flex-wrap gap-3">
              {[ALL, ...CATEGORIES].map((cat) => (
                <Chip
                  key={cat}
                  selected={selectedCategory === cat}
                  onClick={() => handleSelectCategory(cat)}
                >
                  {cat}
                </Chip>
              ))}
            </div>
            <p className="muted mt-4 mb-0 text-base">
              Showing{" "}
              <b>
                {selectedCategory === ALL
                  ? "all stories"
                  : `stories in \"${selectedCategory}\"`}
              </b>{" "}
              ({filteredStories.length})
            </p>
          </section>
        </>
      )}

      {error && (
        <Card variant="error" className="mt-[18px]">
          <p className="form-error m-0">Error: {error}</p>
        </Card>
      )}

      {!loading && !error && !hasAnyStories && (
        <EmptyState
          icon="📝"
          title="No stories yet"
          description="Create your first STAR story to get started"
          action={
            <Button
              variant="primary"
              className="mt-4"
              onClick={() => router.push("/stories/new")}
            >
              + New Story
            </Button>
          }
        />
      )}

      {!loading && !error && hasAnyStories && !hasFilteredStories && (
        <EmptyState
          icon="🔍"
          title="No stories found"
          description={`No stories in the \"${selectedCategory}\" category`}
          action={
            <Button className="mt-4" onClick={() => handleSelectCategory(ALL)}>
              Show All Stories
            </Button>
          }
        />
      )}

      {!loading && !error && hasFilteredStories && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 stories-card-grid">
          {filteredStories.map((s) => (
            <Link
              key={s.id}
              href={`/stories/${s.id}`}
              className="no-underline text-inherit block min-w-0"
            >
              <Card variant="story">
                <div className="flex justify-between items-start mb-1 shrink-0">
                  <span className="text-base muted">
                    {s.createdAt ? formatDate(s.createdAt) : "Recently"}
                  </span>
                  <Button
                    variant="menu"
                    className="p-1"
                    onClick={(e) => {
                      e.preventDefault();
                    }}
                  >
                    ⋯
                  </Button>
                </div>
                <h3 className="story-title-on-card text-2xl font-bold leading-snug text-[var(--foreground)] m-0 shrink-0 overflow-hidden line-clamp-2">
                  {s.title}
                </h3>
                <div className="flex-1 min-h-0 overflow-hidden flex flex-col">
                  <p className="text-[var(--muted)] text-base leading-relaxed flex-1 min-w-0 overflow-hidden text-ellipsis line-clamp-3 m-0">
                    {s.result
                      ? `Summary: ${s.result}`
                      : s.situation
                        ? `Situation: ${s.situation}`
                        : "Click to view full story"}
                  </p>
                </div>
                <div className="flex gap-2 flex-wrap shrink-0">
                  {s.categories.slice(0, 3).map((cat) => (
                    <Badge key={cat} category={cat} />
                  ))}
                  {s.categories.length > 3 && (
                    <span className="badge badge-primary">
                      +{s.categories.length - 3}
                    </span>
                  )}
                </div>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </main>
  );
}

