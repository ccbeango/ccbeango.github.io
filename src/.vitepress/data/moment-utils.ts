import type { ContentData } from "vitepress";
import type { MomentData, MomentFrontmatter, MomentRichMedia } from "./moment-types.ts";
import { dateStringSchema, filterPublished, normalizeContentSlug, normalizeStringList } from "./content-utils.ts";
import { z } from "zod";

const momentTimeZone = "Asia/Shanghai";

function dateParts(value: Date) {
  const parts = new Intl.DateTimeFormat("zh-CN", {
    year: "numeric",
    month: "numeric",
    day: "numeric",
    timeZone: momentTimeZone,
  }).formatToParts(value);
  const number = (type: Intl.DateTimeFormatPartTypes) => Number(parts.find((part) => part.type === type)?.value);
  return { year: number("year"), month: number("month"), day: number("day") };
}

function calendarDay(value: { year: number; month: number; day: number }) {
  return Date.UTC(value.year, value.month - 1, value.day) / 86_400_000;
}

export function formatMomentTime(value: string, now: Date) {
  const date = new Date(value);
  const dateValue = dateParts(date);
  const nowValue = dateParts(now);
  const dayDifference = calendarDay(nowValue) - calendarDay(dateValue);

  if (dayDifference === 0) {
    return new Intl.DateTimeFormat("zh-CN", {
      hour: "2-digit",
      minute: "2-digit",
      hourCycle: "h23",
      timeZone: momentTimeZone,
    }).format(date);
  }
  if (dayDifference === 1) return "昨天";
  if (dayDifference > 1 && dayDifference < 7) {
    return new Intl.DateTimeFormat("zh-CN", { weekday: "long", timeZone: momentTimeZone }).format(date);
  }
  if (dateValue.year === nowValue.year) return `${dateValue.month}月${dateValue.day}日`;
  return `${dateValue.year}年${dateValue.month}月${dateValue.day}日`;
}

export function formatMomentDateTime(value: string) {
  return new Intl.DateTimeFormat("zh-CN", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
    timeZone: momentTimeZone,
  }).format(new Date(value));
}

const optionalText = z.string().trim().min(1, "不能为空").optional();
const momentFrontmatterSchema = z.object({
  title: optionalText,
  date: dateStringSchema,
  updated: dateStringSchema.optional(),
  location: optionalText,
  tags: z.array(z.string().trim().min(1, "不能为空")).default([]),
  images: z
    .array(
      z.object({
        src: z.string().trim().min(1, "不能为空"),
        alt: z.string().trim().min(1, "不能为空"),
      }),
    )
    .max(9, "最多只能提供 9 张图片")
    .default([]),
  pinned: z.boolean().default(false),
  draft: z.boolean().default(false),
});

export function momentFragment(slug: string) {
  const encoded = Array.from(slug.normalize("NFKC").toLocaleLowerCase("zh-CN"))
    .map((character) => {
      if (/[a-z0-9]/.test(character)) return character;
      if (/[\s/_-]/.test(character)) return "-";
      return `-u${character.codePointAt(0)?.toString(16)}-`;
    })
    .join("")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
  return `moment-${encoded}`;
}

export type MomentContentData = ContentData & { momentMedia?: MomentRichMedia[] };

export function toMomentData(entry: MomentContentData): MomentData {
  const slug = normalizeContentSlug(entry.url, "moments");
  const result = momentFrontmatterSchema.safeParse(entry.frontmatter);
  if (!result.success) {
    const details = result.error.issues
      .map((issue) => `${issue.path.join(".") || "frontmatter"}: ${issue.message}`)
      .join("; ");
    throw new Error(`动态 ${slug || entry.url} 的 frontmatter 无效：${details}`);
  }

  const frontmatter = result.data as MomentFrontmatter;
  return {
    ...frontmatter,
    tags: normalizeStringList(frontmatter.tags),
    slug,
    fragment: momentFragment(slug),
    html: entry.html ?? "",
    media: entry.momentMedia ?? [],
  };
}

function sortMoments(moments: MomentData[]) {
  return [...moments].sort((a, b) => Number(b.pinned) - Number(a.pinned) || Date.parse(b.date) - Date.parse(a.date));
}

export function prepareMoments(entries: MomentContentData[], options: { includeDrafts?: boolean } = {}) {
  const moments = entries.map(toMomentData);
  const duplicateSlug = moments.find(
    (moment, index) => moments.findIndex((item) => item.slug === moment.slug) !== index,
  );
  if (duplicateSlug) throw new Error(`动态 slug 重复：${duplicateSlug.slug}`);

  const duplicateFragment = moments.find(
    (moment, index) => moments.findIndex((item) => item.fragment === moment.fragment) !== index,
  );
  if (duplicateFragment) throw new Error(`动态 fragment 重复：${duplicateFragment.fragment}`);

  return sortMoments(filterPublished(moments, options.includeDrafts));
}
