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
  /** siteConfig.moment.avatars 中的名称。 */
  avatar?: string;
  date: string;
  updated?: string;
  location?: string;
  tags: string[];
  images: MomentImage[];
  pinned: boolean;
  draft: boolean;
}

export type MomentData = Omit<MomentFrontmatter, "avatar"> & {
  /** 构建期从头像名称解析出的公开图片地址。 */
  avatar?: string;
  slug: string;
  fragment: string;
  content: MomentContentBlock[];
};
