export interface MomentImage {
  src: string;
  alt: string;
}

export type MomentRichMedia =
  | { marker: string; type: "link-card"; href: string; title: string; description?: string }
  | {
      marker: string;
      type: "music";
      source: string;
      resolver?: "motues" | "motues-details";
      title?: string;
      artist?: string;
      cover?: string;
      coverAlt: string;
    }
  | { marker: string; type: "video"; source: string; poster?: string; title: string }
  | {
      marker: string;
      type: "live-photo";
      poster: string;
      video?: string;
      mode?: "android";
      androidSource?: string;
      alt: string;
    };

type WithoutMarker<T> = T extends { marker: string } ? Omit<T, "marker"> : never;

export type MomentRichMediaInput = WithoutMarker<MomentRichMedia>;

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
  html: string;
  media: MomentRichMedia[];
};
