import { useEffect, useState } from "react";
import { Link, useLocation, useParams } from "wouter";
import { ArrowLeft, ExternalLink, Loader2, X } from "lucide-react";
import { AdminLayout, Card, Field } from "./layout";
import { ImagePicker, errorText, input } from "./ui";
import { RichEditor } from "./rich-editor";
import { LivePreview } from "./live-preview";
import { SchemaBox } from "./schema-box";
import { client } from "../../lib/api";
import { CATEGORIES, serviceUrl } from "../../lib/site";
import { SITE_ORIGIN } from "../../components/seo-head";
import { useAllContent, useContentAction } from "../../queries/content";
import { useSite } from "../../queries/site";
import { isLive, readingTime, toSlug, uid, type Post } from "../../../api/lib/content-schema";

const blank = (): Post => {
  const now = new Date().toISOString();
  return {
    id: uid(),
    slug: "",
    title: "",
    excerpt: "",
    body: "",
    image: "",
    imageAlt: "",
    category: "",
    tags: [],
    author: "",
    status: "draft",
    publishAt: now,
    createdAt: now,
    updatedAt: now,
    seoTitle: "",
    seoDescription: "",
    ogImage: "",
    schema: "",
    service: "",
  };
};

/** ISO → value for <input type="datetime-local"> (local time). */
const toLocal = (iso: string) => {
  const d = iso ? new Date(iso) : new Date();
  const off = d.getTimezoneOffset() * 60000;
  return new Date(d.getTime() - off).toISOString().slice(0, 16);
};
const fromLocal = (v: string) => (v ? new Date(v).toISOString() : new Date().toISOString());
const plain = (html: string) => html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();

export default function BlogEditPage() {
  const { id } = useParams<{ id: string }>();
  const [, navigate] = useLocation();
  const site = useSite();
  const { data } = useAllContent();
  const act = useContentAction();
  const [post, setPost] = useState<Post | null>(null);
  const [slugTouched, setSlugTouched] = useState(false);
  const [tag, setTag] = useState("");
  const [state, setState] = useState<{ pending: boolean; msg: string | null; err: string | null; dirty: boolean }>({ pending: false, msg: null, err: null, dirty: false });

  useEffect(() => {
    if (!data || post) return;
    if (id === "new") setPost({ ...blank(), author: site.siteName });
    else {
      const found = data.posts.find((p) => p.id === id);
      if (found) {
        setPost(found);
        setSlugTouched(true);
      }
    }
  }, [data, id, post, site.siteName]);

  useEffect(() => {
    if (!state.dirty) return;
    const warn = (e: BeforeUnloadEvent) => e.preventDefault();
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [state.dirty]);

  if (!data) return <AdminLayout title="Blog post"><Loader2 className="h-6 w-6 animate-spin text-blue-600" /></AdminLayout>;
  if (!post)
    return (
      <AdminLayout title="Post not found">
        <Link to="/admin/blog" className="font-semibold text-blue-600">← Back to all posts</Link>
      </AdminLayout>
    );

  const set = (p: Partial<Post>) => {
    setPost((old) => ({ ...old!, ...p, ...(p.title !== undefined && !slugTouched ? { slug: toSlug(p.title) } : {}) }));
    setState((s) => ({ ...s, dirty: true, msg: null }));
  };
  const categories = Array.from(new Set([...data.posts.map((p) => p.category).filter(Boolean), ...CATEGORIES.map((c) => c.title)]));

  const save = async (status?: Post["status"]) => {
    const next: Post = { ...post, status: status ?? post.status, slug: post.slug || toSlug(post.title) };
    if (!next.excerpt.trim()) next.excerpt = plain(next.body).slice(0, 220);
    if (next.status === "published" && Date.parse(next.publishAt) > Date.now()) next.publishAt = new Date().toISOString();
    setState((s) => ({ ...s, pending: true, err: null, msg: null }));
    try {
      const saved = await act(() => client.content.savePost(next));
      setPost(saved);
      setSlugTouched(true);
      setState({ pending: false, err: null, dirty: false, msg: saved.status === "draft" ? "Draft saved." : isLive(saved) ? "Published — it's live on your website." : "Scheduled." });
      if (id === "new") navigate(`/admin/blog/${saved.id}`, { replace: true });
    } catch (e) {
      setState((s) => ({ ...s, pending: false, err: errorText(e) }));
    }
  };

  const live = isLive(post);
  const title = post.seoTitle || `${post.title || "Post title"} | ${site.siteName}`;
  const desc = post.seoDescription || post.excerpt || plain(post.body).slice(0, 155);
  const words = plain(post.body).split(" ").filter(Boolean).length;

  return (
    <AdminLayout
      title={id === "new" ? "New blog post" : "Edit blog post"}
      subtitle={`${words} words · ${readingTime(post.body)} min read`}
      actions={
        <div className="flex flex-wrap items-center gap-2">
          <Link to="/admin/blog" className="flex h-10 items-center gap-1.5 rounded-md px-3 text-[14px] font-semibold text-slate-600 hover:bg-white">
            <ArrowLeft className="h-4 w-4" /> All posts
          </Link>
          {live && id !== "new" && (
            <a href={`/blog/${post.slug}`} target="_blank" rel="noreferrer" className="flex h-10 items-center gap-1.5 rounded-md border border-slate-200 bg-white px-3 text-[14px] font-semibold text-slate-600 hover:text-blue-600">
              <ExternalLink className="h-4 w-4" /> View
            </a>
          )}
        </div>
      }
    >
      <LivePreview label="Post preview" path="/blog/__preview__" draft={{ post: { post: { ...post, slug: "__preview__", status: "published" }, related: [] } }}>
      {(previewOpen) => (
      <div className={`grid gap-6 ${previewOpen ? "2xl:grid-cols-[1fr_320px]" : "xl:grid-cols-[1fr_360px]"}`}>
        <div className="space-y-6">
          <Card bodyClass="p-5 space-y-4">
            <input aria-label="Post title" className="w-full border-0 text-[26px] font-semibold text-slate-800 outline-none placeholder:text-slate-300" placeholder="Post title" value={post.title} onChange={(e) => set({ title: e.target.value })} />
            <div className="flex flex-wrap items-center gap-1 text-[13px] text-slate-500">
              <span>{SITE_ORIGIN.replace(/^https?:\/\//, "")}/blog/</span>
              <input
                aria-label="Web address (slug)"
                className="min-w-[200px] flex-1 rounded border border-transparent px-1.5 py-0.5 text-slate-700 hover:border-slate-200 focus:border-blue-500 focus:outline-none"
                value={post.slug}
                onChange={(e) => {
                  setSlugTouched(true);
                  set({ slug: toSlug(e.target.value) });
                }}
              />
            </div>
            <RichEditor value={post.body} onChange={(body) => set({ body })} />
          </Card>

          <Card title="Short summary" subtitle="Shown on the blog list and in Google. Leave empty to use the first lines of the post.">
            <textarea aria-label="Summary" className={`${input} !h-24 py-2.5`} value={post.excerpt} onChange={(e) => set({ excerpt: e.target.value })} />
          </Card>

          <Card title="SEO (Google & sharing)" subtitle="Optional — good defaults are used automatically.">
            <div className="grid gap-5 lg:grid-cols-[1fr_360px]">
              <div className="grid gap-4">
                <Field label="SEO title">
                  <input aria-label="SEO title" className={input} placeholder={`${post.title} | ${site.siteName}`} value={post.seoTitle} onChange={(e) => set({ seoTitle: e.target.value })} />
                  <span className={`text-right text-[12px] ${title.length > 65 ? "text-red-600" : "text-slate-400"}`}>{title.length}/65</span>
                </Field>
                <Field label="Meta description">
                  <textarea aria-label="Meta description" className={`${input} !h-24 py-2.5`} placeholder={desc} value={post.seoDescription} onChange={(e) => set({ seoDescription: e.target.value })} />
                  <span className={`text-right text-[12px] ${desc.length > 160 ? "text-red-600" : "text-slate-400"}`}>{desc.length}/160</span>
                </Field>
              </div>
              <div className="grid content-start gap-3">
                <span className="text-[13.5px] font-semibold text-slate-700">Google preview</span>
                <div className="rounded-md border border-slate-200 bg-white p-4 font-[arial,sans-serif]">
                  <p className="truncate text-[12.5px] text-[#202124]">{SITE_ORIGIN.replace(/^https?:\/\//, "")}/blog/{post.slug}</p>
                  <p className="mt-0.5 line-clamp-1 text-[18px] text-[#1a0dab]">{title}</p>
                  <p className="mt-1 line-clamp-2 text-[13.5px] text-[#4d5156]">{desc}</p>
                </div>
                <ImagePicker label="Share image (optional)" aspect="aspect-[1200/630]" value={post.ogImage} onChange={(url) => set({ ogImage: url })} hint="Default: the featured image." />
              </div>
              <div className="lg:col-span-2">
                <SchemaBox
                  value={post.schema ?? ""}
                  onChange={(schema) => set({ schema })}
                  url={`${SITE_ORIGIN}/blog/${post.slug}`}
                  title={post.title}
                  description={desc}
                  image={post.ogImage || post.image}
                  brand={site.siteName}
                  origin={SITE_ORIGIN}
                />
                <p className="mt-1 text-[12.5px] text-slate-500">Every post already gets Article (BlogPosting) and breadcrumb data automatically — add more here only if needed (e.g. FAQ or How-to).</p>
              </div>
            </div>
          </Card>
        </div>

        <div className="space-y-6">
          <Card title="Publish" bodyClass="p-5 space-y-4">
            <Field label="Status">
              <select aria-label="Status" className={input} value={post.status} onChange={(e) => set({ status: e.target.value as Post["status"] })}>
                <option value="draft">Draft (not visible)</option>
                <option value="published">Published</option>
                <option value="scheduled">Scheduled (goes live on the date below)</option>
              </select>
            </Field>
            <Field label={post.status === "scheduled" ? "Go live on" : "Post date"}>
              <input aria-label="Publish date" type="datetime-local" className={input} value={toLocal(post.publishAt)} onChange={(e) => set({ publishAt: fromLocal(e.target.value) })} />
            </Field>
            {state.err && <p className="text-[13.5px] font-medium text-red-600">{state.err}</p>}
            {state.msg && <p className="text-[13.5px] font-medium text-green-600">{state.msg}</p>}
            {!state.msg && !state.err && state.dirty && <p className="text-[13px] text-slate-500">Unsaved changes.</p>}
            <div className="grid gap-2">
              <button type="button" disabled={state.pending} onClick={() => save()} className="flex h-11 items-center justify-center gap-2 rounded-md bg-blue-600 text-[14px] font-semibold text-white hover:bg-blue-700 disabled:opacity-60">
                {state.pending && <Loader2 className="h-4 w-4 animate-spin" />}
                {post.status === "draft" ? "Save draft" : post.status === "scheduled" ? "Save & schedule" : "Save & publish"}
              </button>
              {post.status === "draft" && (
                <button type="button" disabled={state.pending} onClick={() => save("published")} className="h-11 rounded-md border border-blue-600 text-[14px] font-semibold text-blue-600 hover:bg-blue-50 disabled:opacity-60">
                  Publish now
                </button>
              )}
            </div>
          </Card>

          <Card title="Featured image" bodyClass="p-5 space-y-3">
            <ImagePicker label="Image" value={post.image} onChange={(url) => set({ image: url })} hint="Shown at the top of the post and on the blog list. Best size: 1200 × 630." />
            <input aria-label="Image description" className={input} placeholder="Short image description (for Google)" value={post.imageAlt} onChange={(e) => set({ imageAlt: e.target.value })} />
          </Card>

          <Card title="Details" bodyClass="p-5 space-y-4">
            <Field label="Category">
              <input aria-label="Category" list="blog-cats" className={input} value={post.category} onChange={(e) => set({ category: e.target.value })} />
              <datalist id="blog-cats">
                {categories.map((c) => (
                  <option key={c} value={c} />
                ))}
              </datalist>
            </Field>
            <Field label="Tags" hint="Press Enter after each tag">
              <div className="flex flex-wrap gap-1.5">
                {post.tags.map((t) => (
                  <span key={t} className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-2.5 py-1 text-[12.5px] font-semibold text-blue-700">
                    {t}
                    <button type="button" aria-label={`Remove ${t}`} onClick={() => set({ tags: post.tags.filter((x) => x !== t) })}>
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                ))}
              </div>
              <input
                aria-label="Add tag"
                className={input}
                value={tag}
                placeholder="Add a tag"
                onChange={(e) => setTag(e.target.value)}
                onKeyDown={(e) => {
                  if ((e.key === "Enter" || e.key === ",") && tag.trim()) {
                    e.preventDefault();
                    if (!post.tags.includes(tag.trim())) set({ tags: [...post.tags, tag.trim()] });
                    setTag("");
                  }
                }}
              />
            </Field>
            <Field label="Author">
              <input aria-label="Author" className={input} value={post.author} onChange={(e) => set({ author: e.target.value })} />
            </Field>
            <Field label="Related service" hint="Adds a “Get this service” box at the end of the post.">
              <select aria-label="Related service" className={input} value={post.service} onChange={(e) => set({ service: e.target.value })}>
                <option value="">None — general consultation box</option>
                {CATEGORIES.map((c) => (
                  <optgroup key={c.slug} label={c.title}>
                    {c.services.map((s) => (
                      <option key={s.name} value={serviceUrl(c.slug, s.name)}>
                        {s.name}
                      </option>
                    ))}
                  </optgroup>
                ))}
              </select>
            </Field>
          </Card>
        </div>
      </div>
      )}
      </LivePreview>
    </AdminLayout>
  );
}
