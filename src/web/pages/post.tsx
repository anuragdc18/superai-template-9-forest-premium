import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "wouter";
import DOMPurify from "dompurify";
import { ArrowLeft, ArrowRight, Check, Copy, Facebook, Linkedin, Loader2 } from "lucide-react";
import { usePost } from "../queries/content";
import { useSite } from "../queries/site";
import { waLink } from "../lib/site";
import { WaIcon } from "../components/header";
import { PostCard, ReadTime, fmtDate } from "../components/content-ui";
import { CtaBand } from "./index";

export default function PostPage() {
  const { slug } = useParams<{ slug: string }>();
  const site = useSite();
  const { data, isPending, isError } = usePost(slug);
  const [copied, setCopied] = useState(false);
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [slug]);

  const html = useMemo(
    () => (data ? DOMPurify.sanitize(data.post.body, { ADD_ATTR: ["target", "rel", "loading"], FORBID_TAGS: ["style", "script", "iframe", "form"] }) : ""),
    [data],
  );

  if (isPending)
    return (
      <div className="grid min-h-[50vh] place-items-center">
        <Loader2 className="h-7 w-7 animate-spin text-royal" />
      </div>
    );
  if (isError || !data)
    return (
      <div className="container-x py-28 text-center">
        <h1 className="text-3xl font-bold">Article not found</h1>
        <p className="mt-3">It may have been moved or unpublished.</p>
        <Link to="/blog" className="btn-brand mt-6">
          See all articles
        </Link>
      </div>
    );

  const { post, related } = data;
  const url = typeof window !== "undefined" ? window.location.href : "";
  const share = encodeURIComponent(url);
  const cta = post.service || "/contact";

  return (
    <>
      <article>
        <header className="bg-surface">
          <div className="container-x max-w-4xl py-12 sm:py-16">
            <Link to="/blog" className="inline-flex items-center gap-1.5 text-[14px] font-semibold text-royal hover:gap-2.5">
              <ArrowLeft className="h-4 w-4" /> All articles
            </Link>
            {post.category && <p className="mt-6 text-[13px] font-bold uppercase tracking-[0.14em] text-brand">{post.category}</p>}
            <h1 className="mt-3 text-[32px] font-extrabold leading-tight sm:text-[44px]">{post.title}</h1>
            <div className="mt-5 flex flex-wrap items-center gap-x-4 gap-y-2 text-[14px] text-slate-500">
              {post.author && <span className="font-semibold text-navy">{post.author}</span>}
              <span>{fmtDate(post.publishAt)}</span>
              <ReadTime html={post.body} />
            </div>
          </div>
        </header>
        {post.image && (
          <div className="container-x max-w-5xl">
            <img src={post.image} alt={post.imageAlt || post.title} className="-mt-2 aspect-[1200/630] w-full rounded-2xl object-cover shadow-[0_30px_60px_-36px_rgba(15,23,42,0.5)]" />
          </div>
        )}
        <div className="container-x max-w-3xl py-12">
          <div className="blog-prose" dangerouslySetInnerHTML={{ __html: html }} />

          {post.tags.length > 0 && (
            <div className="mt-10 flex flex-wrap gap-2">
              {post.tags.map((t) => (
                <span key={t} className="rounded-full bg-surface px-3 py-1 text-[13px] font-medium text-navy">
                  #{t}
                </span>
              ))}
            </div>
          )}

          <div className="mt-8 flex flex-wrap items-center gap-2 border-t border-line pt-6">
            <span className="mr-2 text-[14px] font-semibold text-navy">Share:</span>
            <a href={`https://wa.me/?text=${encodeURIComponent(`${post.title} ${url}`)}`} target="_blank" rel="noreferrer" aria-label="Share on WhatsApp" className="grid h-10 w-10 place-items-center rounded-full bg-[#25d366] text-white">
              <WaIcon />
            </a>
            <a href={`https://www.facebook.com/sharer/sharer.php?u=${share}`} target="_blank" rel="noreferrer" aria-label="Share on Facebook" className="grid h-10 w-10 place-items-center rounded-full bg-[#1877f2] text-white">
              <Facebook className="h-4 w-4" />
            </a>
            <a href={`https://www.linkedin.com/sharing/share-offsite/?url=${share}`} target="_blank" rel="noreferrer" aria-label="Share on LinkedIn" className="grid h-10 w-10 place-items-center rounded-full bg-[#0a66c2] text-white">
              <Linkedin className="h-4 w-4" />
            </a>
            <button
              type="button"
              aria-label="Copy link"
              onClick={() => navigator.clipboard?.writeText(url).then(() => setCopied(true))}
              className="flex h-10 items-center gap-1.5 rounded-full border border-line px-4 text-[13.5px] font-semibold text-navy hover:border-royal/40"
            >
              {copied ? <Check className="h-4 w-4 text-green-600" /> : <Copy className="h-4 w-4" />} {copied ? "Copied" : "Copy link"}
            </button>
          </div>

          <div className="mt-10 overflow-hidden rounded-2xl bg-navy p-7 sm:p-9">
            <h2 className="text-[24px] font-bold !text-white">Need help with this?</h2>
            <p className="mt-2 max-w-xl text-[15.5px] text-white/80">Talk to our expert — the first consultation is free. We'll explain everything simply.</p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link to={cta} className="btn-brand">
                {post.service ? "Get this service" : "Get Free Consultation"} <ArrowRight className="h-4 w-4" />
              </Link>
              <a href={waLink(site.whatsapp, `Hi, I read your article "${post.title}" and need help.`)} target="_blank" rel="noreferrer" className="btn-ghost">
                <WaIcon /> WhatsApp us
              </a>
            </div>
          </div>
        </div>
      </article>

      {related.length > 0 && (
        <section className="bg-surface py-14">
          <div className="container-x">
            <h2 className="text-[26px] font-bold">More articles</h2>
            <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {related.map((p) => (
                <PostCard key={p.id} p={p} />
              ))}
            </div>
          </div>
        </section>
      )}
      <CtaBand />
    </>
  );
}
