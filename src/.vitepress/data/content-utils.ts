import { z } from "zod";

export const dateStringSchema = z.preprocess(
  (value) => (value instanceof Date ? value.toISOString() : value),
  z.string().refine((value) => !Number.isNaN(Date.parse(value)), "必须是有效日期"),
);

export function normalizeContentSlug(url: string, sourceDirectory: string) {
  const decoded = decodeURIComponent(url);
  const prefix = `/${sourceDirectory}/`;
  const withoutPrefix = decoded.startsWith(prefix) ? decoded.slice(prefix.length) : decoded;
  return withoutPrefix
    .replace(/\.(?:html|md)$/, "")
    .replace(/\/index$/, "")
    .replace(/^\/+|\/+$/g, "");
}

export function normalizeStringList(values: string[]) {
  return [...new Set(values.map((value) => value.trim()))];
}

export function filterPublished<T extends { draft: boolean }>(items: T[], includeDrafts = false) {
  return includeDrafts ? [...items] : items.filter((item) => !item.draft);
}

export function sortByDateDescending<T extends { date: string }>(items: T[]) {
  return [...items].sort((a, b) => Date.parse(b.date) - Date.parse(a.date));
}

export function paginateItems<T>(items: T[], page: number, pageSize: number) {
  const pageCount = Math.max(1, Math.ceil(items.length / pageSize));
  const safePage = Math.min(Math.max(1, page), pageCount);
  return {
    page: safePage,
    pageCount,
    items: items.slice((safePage - 1) * pageSize, safePage * pageSize),
  };
}
