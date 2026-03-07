// 1) token 을 local storage 에서 읽기
// 2) token 이 없으면 로그인 페이지로 리다이렉트
// 3) token 이 있으면 스토리 목록 API 호출
// 4) 스토리 목록을 화면에 렌더링

"use client";

import { useEffect, useMemo, useState } from "react";
import { fetchStories, Story } from "@/lib/stories";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { CATEGORIES, getBadgeClass, getChartColor } from "@/constants/categories";
import {
  Button,
  Card,
  Chip,
  Badge,
  EmptyState,
} from "@/components/ui";

export default function DashboardPage() {
  const router = useRouter();
  const [stories, setStories] = useState<Story[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 카테고리 필터링을 위한 state
  // default value 는 "All"
  const ALL = "All" as const;
  // 선택된 카테고리를 관리하는 state
  // 유저가 카테고리 버튼클릭 -> selectedCategory 업데이트 -> useMemo 호출 -> stories 필터링
  const [selectedCategory, setSelectedCategory] = useState<string>(ALL);

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
  }, []);

  // 카테고리 필터링 로직
  const filteredStories = useMemo(() => {
    if (selectedCategory === ALL) return stories;
    return stories.filter((s) => s.categories.includes(selectedCategory));
  }, [stories, selectedCategory]);

  const hasAnyStories = stories.length > 0;
  const hasFilteredStories = filteredStories.length > 0;

  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const s of stories) {
      for (const cat of s.categories) {
        counts[cat] = (counts[cat] ?? 0) + 1;
      }
    }
    return counts;
  }, [stories]);

  const categorySegments = useMemo(() => {
    const total = Object.values(categoryCounts).reduce((a, b) => a + b, 0);
    if (total === 0) return [];
    const entries = Object.entries(categoryCounts).sort((a, b) => b[1] - a[1]);
    let acc = 0;
    return entries.map(([name, count]) => {
      const pct = (count / total) * 100;
      const start = acc;
      acc += pct;
      return {
        name,
        count,
        start,
        end: acc,
        pct,
        color: getChartColor(name),
      };
    });
  }, [categoryCounts]);

  const topCategories = useMemo(
    () =>
      Object.entries(categoryCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 3)
        .map(([name]) => name),
    [categoryCounts]
  );

  // 헬퍼 함수: 날짜 포맷팅
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
    <main className="mt-8">
      {/* Header */}
      <header className="flex flex-wrap justify-between items-end gap-4">
        <div>
          <h1 className="text-3xl font-black m-0 tracking-tight text-[var(--foreground)]">
            My Stories
          </h1>
          <p className="muted mt-2 mb-0">
            Create, refine, and reuse STAR stories for behavioral interviews.
          </p>
        </div>

        <div className="flex gap-2.5">
          <Button
            onClick={() => {
              localStorage.removeItem("token");
              router.replace("/login");
            }}
          >
            Log out
          </Button>
          <Button variant="primary" onClick={() => router.push("/stories/new")}>
            + Add Story
          </Button>
        </div>
      </header>

      {loading && (
        <p className="muted mt-[18px]">Loading stories...</p>
      )}

      {!loading && !error && (
        <section>
          <Card variant="overview">
            <h2 className="text-lg font-bold m-0 mb-5 text-[var(--foreground)]">
              Overview
            </h2>
            <div className="flex flex-wrap items-center gap-8">
              <div className="relative w-[140px] h-[140px] shrink-0">
                {categorySegments.length > 0 ? (
                  <div
                    className="absolute inset-0 w-[140px] h-[140px] rounded-full z-0"
                    style={{
                      background: `conic-gradient(${categorySegments
                        .map((s) => `${s.color} ${s.start}% ${s.end}%`)
                        .join(", ")})`,
                    }}
                    aria-hidden
                  />
                ) : (
                  <div
                    className="absolute inset-0 w-[140px] h-[140px] rounded-full bg-[var(--border-light)] z-0"
                    aria-hidden
                  />
                )}
                <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[88px] h-[88px] rounded-full bg-[var(--card)] flex flex-col items-center justify-center shadow-[0_0_0_2px_var(--border-light)] z-[1]">
                  <span className="text-[28px] font-extrabold leading-none text-[var(--foreground)]">
                    {stories.length}
                  </span>
                  <span className="muted text-xs mt-1">Stories</span>
                </div>
              </div>
              <div className="flex gap-6 flex-wrap">
                <div className="flex flex-col gap-1">
                  <span className="text-[22px] font-bold text-[var(--foreground)]">
                    {stories.length}
                  </span>
                  <span className="muted text-[13px]">Stories Saved</span>
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-[22px] font-bold text-[var(--foreground)]">
                    {Object.keys(categoryCounts).length}
                  </span>
                  <span className="muted text-[13px]">Categories Used</span>
                </div>
              </div>
            </div>
            {topCategories.length > 0 && (
              <div className="mt-4 pt-4 border-t border-[var(--border-light)] flex flex-wrap items-center gap-2.5">
                <span className="muted text-[13px] mr-1">Top categories:</span>
                {topCategories.map((cat) => (
                  <Chip
                    key={cat}
                    selected={selectedCategory === cat}
                    onClick={() => setSelectedCategory(cat)}
                  >
                    {cat}
                  </Chip>
                ))}
              </div>
            )}
          </Card>
        </section>
      )}

      {!loading && !error && (
        <div className="mt-[18px]">
          <div className="flex flex-wrap gap-2.5">
            {[ALL, ...CATEGORIES].map((cat) => (
              <Chip
                key={cat}
                selected={selectedCategory === cat}
                onClick={() => setSelectedCategory(cat)}
              >
                {cat}
              </Chip>
            ))}
          </div>

          <p className="muted mt-2.5 mb-0 text-[13px]">
            Showing{" "}
            <b>
              {selectedCategory === ALL
                ? "all stories"
                : `stories in the "${selectedCategory}" category`}
            </b>{" "}
            ({filteredStories.length})
          </p>
        </div>
      )}

      {error && (
        <Card variant="error" className="mt-[18px]">
          <p className="text-red-600 m-0">Error: {error}</p>
        </Card>
      )}

      {/* 아직 스토리가 없는 경우 */}
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
              + Add Story
            </Button>
          }
        />
      )}

      {/* story 는 있는데, 필터링 결과가 없는 경우 */}
      {!loading && !error && hasAnyStories && !hasFilteredStories && (
        <EmptyState
          icon="🔍"
          title="No stories found"
          description={`No stories in the "${selectedCategory}" category`}
          action={
            <Button className="mt-4" onClick={() => setSelectedCategory(ALL)}>
              Show All Stories
            </Button>
          }
        />
      )}

      {!loading && !error && hasFilteredStories && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
          {filteredStories.map((s) => (
            <Link
              key={s.id}
              href={`/stories/${s.id}`}
              className="no-underline text-inherit block min-w-0"
            >
              <Card variant="story">
                {/* Header: 날짜 + 메뉴 */}
                <div className="flex justify-between items-start mb-0.5 shrink-0">
                  <span className="text-sm muted">
                    {s.createdAt ? formatDate(s.createdAt) : "Recently"}
                  </span>
                  <Button
                    variant="menu"
                    className="p-1"
                    onClick={(e) => {
                      e.preventDefault();
                      // TODO: 메뉴 동작 추가
                    }}
                  >
                    ⋯
                  </Button>
                </div>

                {/* 제목 */}
                <h3 className="text-2xl font-bold leading-snug text-[var(--foreground)] m-0 shrink-0 overflow-hidden line-clamp-2">
                  {s.title}
                </h3>

                {/* 미리보기 */}
                <div className="flex-1 min-h-0 overflow-hidden flex flex-col">
                  <p className="text-[var(--muted)] text-lg leading-relaxed flex-1 min-w-0 overflow-hidden text-ellipsis line-clamp-3 m-0">
                    {s.result
                      ? `Summary: ${s.result}`
                      : s.situation
                        ? `Situation: ${s.situation}`
                        : "Click to view full story"}
                  </p>
                </div>

                {/* Footer: 배지들 */}
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
