import { useQuery, useQueryClient } from "@tanstack/react-query";
import { client, orpc } from "../lib/api";
import { DEMO } from "../lib/demo";
import { usePreviewDraft } from "../lib/preview-draft";
import { DEFAULT_CONTENT, publicContent, type PublicContent } from "../../api/lib/content-schema";

export const FALLBACK_CONTENT: PublicContent = publicContent(DEFAULT_CONTENT);

/** Website content (blog list, packages, reviews, FAQs, gallery, SEO, WhatsApp). Always usable. */
export function useContent(): PublicContent {
  const { data } = useQuery({ ...orpc.content.get.queryOptions(), staleTime: 60_000, enabled: !DEMO });
  const draft = usePreviewDraft();
  const c = data ?? FALLBACK_CONTENT;
  return draft.images ? { ...c, images: draft.images } : c;
}

/** One blog post (+ related) by slug. */
export function usePost(slug: string) {
  const draft = usePreviewDraft();
  const q = useQuery({
    queryKey: ["post", slug],
    enabled: !!slug,
    retry: false,
    queryFn: async () => {
      if (DEMO) {
        const live = DEFAULT_CONTENT.posts.filter((p) => p.status === "published");
        const post = live.find((p) => p.slug === slug);
        if (!post) throw new Error("not found");
        return { post, related: publicContent(DEFAULT_CONTENT).posts.filter((p) => p.id !== post.id).slice(0, 3) };
      }
      return client.content.post({ slug });
    },
  });
  // admin live preview: show the post being edited (even if it is not saved yet)
  if (draft.post && draft.post.post.slug === slug) return { ...q, data: draft.post, isPending: false, isError: false } as typeof q;
  return q;
}

// ───────────── admin ─────────────

export function useAllContent() {
  return useQuery(orpc.content.all.queryOptions());
}

/** After any admin save: refresh admin + website data. */
export function useRefreshContent() {
  const qc = useQueryClient();
  return () => {
    qc.invalidateQueries({ queryKey: orpc.content.all.key() });
    qc.invalidateQueries({ queryKey: orpc.content.get.key() });
    qc.invalidateQueries({ queryKey: ["post"] });
  };
}

/** Run an admin save, then refresh. */
export function useContentAction() {
  const refresh = useRefreshContent();
  return async <R,>(fn: () => Promise<R>) => {
    const r = await fn();
    refresh();
    return r;
  };
}

/** Resize an image in the browser (max 1600px, WebP) and upload it. Returns its address. */
export async function uploadImage(file: File, maxSide = 1600): Promise<string> {
  if (!file.type.startsWith("image/") || file.type.includes("svg")) throw new Error("Please choose a JPG, PNG or WebP image.");
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, maxSide / Math.max(bitmap.width, bitmap.height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(bitmap.width * scale);
  canvas.height = Math.round(bitmap.height * scale);
  canvas.getContext("2d")!.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  let dataUrl = canvas.toDataURL("image/webp", 0.82);
  if (!dataUrl.startsWith("data:image/webp")) dataUrl = canvas.toDataURL("image/jpeg", 0.85);
  const res = await client.content.uploadImage({ dataUrl });
  return res.url;
}
