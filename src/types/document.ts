export interface Document {
  id: string;
  title: string;
  content: string;
  createdAt: string;
  updatedAt: string;
  wordCount: number;
  charCount: number;
}

export interface AppSettings {
  theme: "light" | "dark";
  zoom: number;
}
