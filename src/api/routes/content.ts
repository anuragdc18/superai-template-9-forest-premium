import { z } from "zod";
import { ORPCError } from "@orpc/server";
import { base } from "../__core/app";
import { authed } from "../middleware/auth";
import { data, save, saveImage, deleteImage } from "../store";
import {
  contentSchema,
  faqSchema,
  galleryItemSchema,
  gallerySectionSchema,
  isLive,
  mergeContent,
  packageSchema,
  packagesSectionSchema,
  postSchema,
  publicContent,
  reviewSchema,
  reviewsSectionSchema,
  seoSchema,
  serviceEditSchema,
  whatsappSchema,
  type Content,
} from "../lib/content-schema";

/** Current content (saved edits over the built-in defaults). */
export function readContent(): Content {
  return mergeContent(data.settings.content as Partial<Content> | undefined);
}

function write(patch: Partial<Content>) {
  data.settings.content = { ...readContent(), ...patch };
  save();
  return { ok: true as const };
}

const blogSettings = contentSchema.shape.blog;

export const content = {
  /** Public: everything the website shows (no drafts, no post bodies). */
  get: base.handler(() => publicContent(readContent())),

  /** Public: one live post by its web address, plus 3 related posts. */
  post: base.input(z.object({ slug: z.string().max(120) })).handler(({ input }) => {
    const c = readContent();
    const live = c.posts.filter((p) => isLive(p));
    const post = live.find((p) => p.slug === input.slug);
    if (!post) throw new ORPCError("NOT_FOUND");
    const related = live
      .filter((p) => p.id !== post.id)
      .map((p) => ({ p, score: (p.category === post.category ? 2 : 0) + p.tags.filter((t) => post.tags.includes(t)).length }))
      .sort((a, b) => b.score - a.score || Date.parse(b.p.publishAt) - Date.parse(a.p.publishAt))
      .slice(0, 3)
      .map(({ p: { body: _b, ...rest } }) => rest);
    return { post, related };
  }),

  /** Admin: everything, including drafts. */
  all: authed.handler(() => readContent()),

  saveSeo: authed.input(seoSchema).handler(({ input }) => write({ seo: input })),
  saveWhatsapp: authed.input(whatsappSchema).handler(({ input }) => write({ whatsapp: input })),
  saveBlog: authed.input(blogSettings).handler(({ input }) => write({ blog: input })),
  savePackages: authed
    .input(z.object({ packages: z.array(packageSchema).max(100), section: packagesSectionSchema }))
    .handler(({ input }) => write({ packages: input.packages, packagesSection: input.section })),
  saveReviews: authed
    .input(z.object({ reviews: z.array(reviewSchema).max(200), section: reviewsSectionSchema }))
    .handler(({ input }) => write({ reviews: input.reviews, reviewsSection: input.section })),
  saveFaqs: authed.input(z.array(faqSchema).max(100)).handler(({ input }) => write({ faqs: input })),
  saveGallery: authed
    .input(z.object({ items: z.array(galleryItemSchema).max(300), section: gallerySectionSchema }))
    .handler(({ input }) => write({ gallery: input.items, gallerySection: input.section })),
  saveServices: authed.input(z.array(serviceEditSchema).max(500)).handler(({ input }) => write({ services: input })),
  saveImages: authed.input(contentSchema.shape.images).handler(({ input }) => write({ images: input })),

  /** Admin: create or update a blog post. */
  savePost: authed.input(postSchema).handler(({ input }) => {
    const c = readContent();
    if (c.posts.some((p) => p.slug === input.slug && p.id !== input.id)) {
      throw new ORPCError("BAD_REQUEST", { message: "Another post already uses this web address (slug). Please change it." });
    }
    const now = new Date().toISOString();
    const existing = c.posts.find((p) => p.id === input.id);
    const post = { ...input, createdAt: existing?.createdAt || input.createdAt || now, updatedAt: now, publishAt: input.publishAt || now };
    const posts = existing ? c.posts.map((p) => (p.id === input.id ? post : p)) : [post, ...c.posts];
    write({ posts });
    return post;
  }),
  removePost: authed.input(z.object({ id: z.string() })).handler(({ input }) => write({ posts: readContent().posts.filter((p) => p.id !== input.id) })),

  /** Admin: upload an image (already resized in the browser). Returns its address. */
  uploadImage: authed.input(z.object({ dataUrl: z.string().max(6_000_000) })).handler(async ({ input }) => {
    const m = input.dataUrl.match(/^data:(image\/(?:webp|jpeg|png|gif));base64,([A-Za-z0-9+/=]+)$/);
    if (!m) throw new ORPCError("BAD_REQUEST", { message: "Please upload a JPG, PNG, WebP or GIF image." });
    const bytes = Buffer.from(m[2], "base64");
    if (bytes.length > 4_000_000) throw new ORPCError("BAD_REQUEST", { message: "Image is too large (max 4 MB)." });
    const name = await saveImage(bytes, m[1]);
    return { url: `/api/img/${name}` };
  }),
  deleteImage: authed.input(z.object({ url: z.string().max(300) })).handler(async ({ input }) => {
    const name = input.url.split("/api/img/")[1];
    if (name) await deleteImage(name);
    return { ok: true };
  }),
};
