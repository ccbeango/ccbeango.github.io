interface PostSeries {
  name: string;
  order: number;
  sidebar?: string;
  sidebarOrder?: number;
}

export interface PostFrontmatter {
  title: string;
  date: string;
  updated?: string;
  summary?: string;
  description?: string;
  keywords: string[];
  featured: boolean;
  series?: PostSeries;
  tags: string[];
  draft: boolean;
  cover?: string;
  canonical?: string;
}

export type PostData = PostFrontmatter & {
  slug: string;
  url: string;
  wordCount: number;
  readingTime: number;
  src?: string;
  html?: string;
};

export interface TagSummary {
  name: string;
  slug: string;
  count: number;
}

export interface ArchiveGroup {
  year: string;
  posts: PostData[];
}
