// 1) token 을 local storage 에서 읽기
// 2) token 이 없으면 로그인 페이지로 리다이렉트
// 3) token 이 있으면 스토리 목록 API 호출 
// 4) 스토리 목록을 화면에 렌더링 

"use client";

import { useEffect, useMemo, useState } from "react";
import { fetchStories, Story } from "@/lib/stories";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { CATEGORIES } from "@/constants/categories";


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

                // 1) token 을 local storage 에서 읽기
                const token = localStorage.getItem("token");
                // 2) token 이 없으면 로그인 페이지로 리다이렉트
                if (!token) {
                    setError("No token found. Please log in again.");
                    router.replace("/login");
                    return;
                }

                // 3) token 이 있으면 스토리 목록 API 호출
                const data = await fetchStories(token);

                // 4) state 에 스토리 목록 저장 -> 화면 렌더링
                setStories(data.stories);
            } catch (err) {
                const msg = err instanceof Error ? err.message : "Failed to load stories.";
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

    const hasAnyStories = stories.length > 0; // 원본 데이터
    const hasFilteredStories = filteredStories.length > 0;

    return (
      <main style={{ marginTop: 32 }}>
        <header
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-end",
            gap: 16,
          }}
        >
          <div>
            <h1 style={{ fontSize: 32, fontWeight: 900, margin: 0 }}>My Stories</h1>
            <p className="muted" style={{ marginTop: 8, marginBottom: 0 }}>
              Create, refine, and reuse STAR stories for behavioral interviews.
            </p>
          </div>

          <div style={{ display: "flex", gap: 10 }}>
            <button
              className="btn"
              onClick={() => {
                localStorage.removeItem("token");
                router.replace("/login");
              }}
            >
              Log out
            </button>

            <button
              className="btn btn-primary"
              onClick={() => router.push("/stories/new")}
            >
              + Add Story
            </button>
          </div>
        </header>

        {loading && <p className="muted" style={{ marginTop: 18 }}>Loading stories...</p>}

        {!loading && !error && (
          <div style={{ marginTop: 18 }}>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
              {[ALL, ...CATEGORIES].map((cat) => {
                const selected = selectedCategory === cat;

                return (
                  <button
                    key={cat}
                    type="button"
                    className ={`chip ${selected ? "chip-selected" : ""}`}
                    onClick={() => setSelectedCategory(cat)}
                  >
                    {cat}
                  </button>
                );
              })}
            </div>

            <p className="muted" style={{ marginTop: 10, marginBottom: 0, fontSize: 13 }}>

              Showing{" "}
              <b>
                {selectedCategory === ALL ? "all stories" : `stories in the "${selectedCategory}" category`}
              </b>{""}
              ({filteredStories.length}) 
            </p>
          </div>
        )}

        {error && (
          <div className="card" style={{ marginTop: 18, borderColor: "rgba(220, 38, 38, 0.35)" }}>
            <p style={{ color: "crimson", margin: 0 }}>Error: {error}</p>
          </div>
        )}

        {/* 아직 스토리가 없는 경우 */}
        {!loading && !error && !hasAnyStories && (
          <div className="card" style={{ marginTop: 18 }}>
            <p style={{ margin: 0 }}>No stories yet.</p>
            <p className="muted" style={{ marginTop: 6, marginBottom: 0 }}>
              Click <strong>+ Add Story</strong> to create your first one.
            </p>
          </div>
        )}

        {/* story 는 있는데, 필터링 결과가 없는 경우 */}
        {!loading && !error && hasAnyStories && !hasFilteredStories && (
          <div className="card" style={{ marginTop: 18 }}>
            <p style={{ margin: 0 }}>No stories found for the selected category.</p>
            <p className="muted" style={{ marginTop: 6, marginBottom: 0 }}>
              Try selecting <strong>All</strong> or a different category.
            </p>

            <div style={{ marginTop: 18 }}>
              <button
                type="button"
                className="btn"
                onClick={() => setSelectedCategory(ALL)}
              >
                Show All Stories
              </button>
            </div>
          </div>
        )}

        {!loading && !error && hasFilteredStories && (
          <ul
            style={{
              marginTop: 18,
              display: "grid",
              gap: 12,
              padding: 0,
              listStyle: "none",
            }}
          >
            {filteredStories.map((s) => (
              <li key={s.id} className="card" style={{ display: "grid", gap: 10 }}>
                <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
                  <div>
                    <Link href={`/stories/${s.id}`} style={{ textDecoration: "none" }}>
                      <span style={{ fontWeight: 800, fontSize: 18 }}>{s.title}</span>
                    </Link>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </main>
    );
}
