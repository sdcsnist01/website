export type BlogCategory = "article" | "event" | "growth" | "community" | "digital";

export type BlogContentBlock = {
  title?: string;
  paragraphs?: string[];
  bullets?: string[];
  quote?: string;
};

export type BlogPost = {
  id: string;
  title: string;
  category: BlogCategory;
  date: string;
  readTime: string;
  coverImage: string;
  excerpt: string;
  content: BlogContentBlock[];
};
