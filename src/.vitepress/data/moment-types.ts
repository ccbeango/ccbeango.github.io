export interface MomentImage {
  src: string;
  alt: string;
}

export type MomentRichMedia =
  | { type: "link-card"; href: string; title: string; description?: string }
  | {
      type: "music";
      source: string;
      resolver?: "motues" | "motues-details";
      title?: string;
      artist?: string;
      cover?: string;
      coverAlt: string;
    }
  | { type: "video"; source: string; poster?: string; title: string }
  | {
      type: "live-photo";
      poster: string;
      video?: string;
      mode?: "android";
      androidSource?: string;
      alt: string;
    };

export type MomentContentBlock = { type: "html"; html: string } | MomentRichMedia;

export interface MomentFrontmatter {
  title?: string;
  date: string;
  updated?: string;
  location?: string;
  tags: string[];
  images: MomentImage[];
  pinned: boolean;
  draft: boolean;
}

export type MomentData = MomentFrontmatter & {
  slug: string;
  fragment: string;
  content: MomentContentBlock[];
};
