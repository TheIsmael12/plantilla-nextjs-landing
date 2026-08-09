import { fn } from "storybook/test";

import type {
  BlogAuthorWithPosts,
  BlogFeedEntry,
  BlogPostDetail,
  BlogPostListItem,
  BlogPostsQuery,
  BlogResolveResult,
  BlogSitemapEntry,
  BlogTaxonomy,
  BlogTaxonomySitemap,
} from "@/types/blog/blog";
import type { FetchResponse, PaginatedResult } from "@/types/responses";

// Mock de Storybook/Vitest para `actions/blog/blog-actions.ts`, usado en vez
// del módulo real (ver el alias en `.storybook/main.ts`): las stories de
// componentes de blog reciben los datos ya resueltos por props, así que
// normalmente no necesitan tocar estos mocks — solo hace falta si en algún
// momento se decide dar story a `BlogViewPage`/`BlogPostViewPage` (Server
// Components async, hoy sin story, ver nota en el plan de implementación).

export const getBlogPosts = fn(
  async (
    _params: BlogPostsQuery,
  ): Promise<FetchResponse<PaginatedResult<BlogPostListItem>>> => {
    throw new Error("getBlogPosts: falta configurar un mockResolvedValueOnce en la historia.");
  },
).mockName("getBlogPosts");

export const getBlogPostBySlug = fn(
  async (_slug: string, _locale: string): Promise<FetchResponse<BlogPostDetail>> => {
    throw new Error("getBlogPostBySlug: falta configurar un mockResolvedValueOnce en la historia.");
  },
).mockName("getBlogPostBySlug");

export const getRelatedBlogPosts = fn(
  async (
    _slug: string,
    _locale: string,
    _limit?: number,
  ): Promise<FetchResponse<BlogPostListItem[]>> => {
    throw new Error("getRelatedBlogPosts: falta configurar un mockResolvedValueOnce en la historia.");
  },
).mockName("getRelatedBlogPosts");

export const getBlogCategories = fn(
  async (_locale: string): Promise<FetchResponse<BlogTaxonomy[]>> => {
    throw new Error("getBlogCategories: falta configurar un mockResolvedValueOnce en la historia.");
  },
).mockName("getBlogCategories");

export const getBlogTags = fn(
  async (_locale: string): Promise<FetchResponse<BlogTaxonomy[]>> => {
    throw new Error("getBlogTags: falta configurar un mockResolvedValueOnce en la historia.");
  },
).mockName("getBlogTags");

export const getBlogAuthor = fn(
  async (_slug: string, _locale: string): Promise<FetchResponse<BlogAuthorWithPosts>> => {
    throw new Error("getBlogAuthor: falta configurar un mockResolvedValueOnce en la historia.");
  },
).mockName("getBlogAuthor");

export const resolveBlogSlug = fn(
  async (_locale: string, _slug: string): Promise<FetchResponse<BlogResolveResult>> => {
    throw new Error("resolveBlogSlug: falta configurar un mockResolvedValueOnce en la historia.");
  },
).mockName("resolveBlogSlug");

export const getBlogSitemapEntries = fn(
  async (
    _locale: string,
    _page?: number,
  ): Promise<FetchResponse<PaginatedResult<BlogSitemapEntry>>> => {
    throw new Error("getBlogSitemapEntries: falta configurar un mockResolvedValueOnce en la historia.");
  },
).mockName("getBlogSitemapEntries");

export const getBlogTaxonomySitemap = fn(
  async (_locale: string): Promise<FetchResponse<BlogTaxonomySitemap>> => {
    throw new Error("getBlogTaxonomySitemap: falta configurar un mockResolvedValueOnce en la historia.");
  },
).mockName("getBlogTaxonomySitemap");

export const getBlogFeedEntries = fn(
  async (_locale: string, _limit?: number): Promise<FetchResponse<BlogFeedEntry[]>> => {
    throw new Error("getBlogFeedEntries: falta configurar un mockResolvedValueOnce en la historia.");
  },
).mockName("getBlogFeedEntries");
