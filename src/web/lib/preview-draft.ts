/**
 * Live preview of UNSAVED admin changes.
 *
 * The admin shows the website in an <iframe> on the same domain and sends the change being edited
 * (logo / colours, replaced images, a blog post) with postMessage. Inside that iframe the website uses
 * the draft instead of the saved data. Visitors never see drafts: the draft only lives in the memory of
 * an iframe whose parent page is this site's /admin, and it is gone on reload.
 */
import { useSyncExternalStore } from "react";
import type { SiteSettings } from "../../api/lib/site-schema";
import type { Post, PostSummary } from "../../api/lib/content-schema";

export type PreviewDraft = {
  site?: SiteSettings;
  images?: Record<string, string>;
  post?: { post: Post; related: PostSummary[] };
};

export const PREVIEW_MESSAGE = "website-preview-draft";
export const PREVIEW_READY = "website-preview-ready";

let draft: PreviewDraft = {};
const listeners = new Set<() => void>();

/** True only inside the admin's preview iframe (same domain, parent is /admin/…). */
export function isPreviewFrame(): boolean {
  try {
    return window.parent !== window && window.parent.location.origin === window.location.origin && window.parent.location.pathname.startsWith("/admin");
  } catch {
    return false;
  }
}

export function setPreviewDraft(next: PreviewDraft) {
  draft = next || {};
  listeners.forEach((f) => f());
}

/** Current draft (always {} on the public website). */
export function usePreviewDraft(): PreviewDraft {
  return useSyncExternalStore(
    (cb) => {
      listeners.add(cb);
      return () => listeners.delete(cb);
    },
    () => draft,
    () => draft,
  );
}

let started = false;
/** Inside the preview iframe: listen for drafts from the admin and tell it we are ready. */
export function startPreviewBridge() {
  if (started || typeof window === "undefined" || !isPreviewFrame()) return;
  started = true;
  window.addEventListener("message", (e: MessageEvent) => {
    if (e.origin !== window.location.origin || e.source !== window.parent) return;
    const data = e.data as { type?: string; draft?: PreviewDraft } | null;
    if (data?.type === PREVIEW_MESSAGE) setPreviewDraft(data.draft ?? {});
  });
  window.parent.postMessage({ type: PREVIEW_READY }, window.location.origin);
}
