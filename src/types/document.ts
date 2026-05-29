export interface Document {
  id: string;
  title: string;
  content: string;
  createdAt: string;
  updatedAt: string;
  wordCount: number;
  charCount: number;
  pageSize?: "a4" | "letter";
  pageOrientation?: "portrait" | "landscape";
  pageMargin?: "normal" | "narrow" | "wide";
  headerText?: string;
  footerText?: string;
  isPublic?: boolean;
}

export interface AppSettings {
  theme: "light" | "dark";
  zoom: number;
}
