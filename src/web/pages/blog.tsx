import { useEffect, useMemo, useState } from "react";
import { Search } from "lucide-react";
import { useContent } from "../queries/content";
import { PageBanner, PostCard } from "../components/content-ui";
import { CtaBand } from "./index";

export default function BlogPage() {
  const content = useContent();
  const [cat, setCat] = useState("");
  const [q, setQ] = useState("");
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);
  const cats = useMemo(() => Array.from(new Set(content.posts.map((p) => p.category).filter(Boolean))), [content.posts]);
  const posts = content.posts.filter(
    (p) => (!cat || p.category === cat) && (!q || `${p.title} ${p.excerpt} ${p.tags.join(" ")}`.toLowerCase().includes(q.toLowerCase())),
  );
  const [first, ...rest] = posts;

  return (
    <>
      <PageBanner title={content.blog.title || "Blog"} text={content.blog.subtitle} crumbs={[{ label: "Home", to: "/" }, { label: content.blog.title || "Blog" }]} />
      <section className="py-14 sm:py-16">
        <div className="container-x">
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex flex-wrap gap-2">
              {["", ...cats].map((c) => (
                <button
                  key={c || "all"}
                  type="button"
                  onClick={() => setCat(c)}
                  className={`rounded-full px-4 py-2 text-[14px] font-semibold transition ${cat === c ? "bg-navy text-white" : "bg-surface text-navy hover:bg-royal/10"}`}
                >
                  {c || "All posts"}
                </button>
              ))}
            </div>
            <label className="relative ml-auto w-full sm:w-72">
              <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input aria-label="Search articles" className="field !pl-11" placeholder="Search articles" value={q} onChange={(e) => setQ(e.target.value)} />
            </label>
          </div>

          {posts.length === 0 ? (
            <p className="py-20 text-center text-[16px]">{content.posts.length ? "No articles match your search." : "New articles are coming soon."}</p>
          ) : (
            <>
              {first && !q && !cat && rest.length > 0 ? (
                <div className="mt-10 grid gap-6 lg:grid-cols-[1.4fr_1fr]">
                  <PostCard p={first} />
                  <div className="grid gap-6">
                    {rest.slice(0, 2).map((p) => (
                      <PostCard key={p.id} p={p} />
                    ))}
                  </div>
                </div>
              ) : null}
              <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {(!q && !cat && rest.length > 0 ? rest.slice(2) : posts).map((p) => (
                  <PostCard key={p.id} p={p} />
                ))}
              </div>
            </>
          )}
        </div>
      </section>
      <CtaBand />
    </>
  );
}
