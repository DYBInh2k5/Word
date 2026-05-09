import { GoogleGenerativeAI } from "@google/generative-ai";

const API_KEY = process.env.NEXT_PUBLIC_GEMINI_API_KEY ?? "";

function getModel() {
  const genAI = new GoogleGenerativeAI(API_KEY);
  return genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
}

// ── Continue writing ─────────────────────────────────────────────────
export async function continueWriting(text: string): Promise<string> {
  const model = getModel();
  const prompt = `Bạn là trợ lý viết văn chuyên nghiệp. Hãy tiếp tục đoạn văn bản sau một cách tự nhiên, mạch lạc và đúng ngữ cảnh. Chỉ trả về phần tiếp theo, không lặp lại nội dung đã có. Giữ nguyên ngôn ngữ (tiếng Việt/tiếng Anh).

Văn bản hiện tại:
"""
${text.slice(-500)}
"""

Hãy viết tiếp khoảng 1-2 đoạn:`;

  const result = await model.generateContent(prompt);
  return result.response.text().trim();
}

// ── Summarize ────────────────────────────────────────────────────────
export async function summarizeText(text: string): Promise<string> {
  const model = getModel();
  const prompt = `Hãy tóm tắt văn bản sau thành các ý chính ngắn gọn, súc tích bằng gạch đầu dòng. Giữ nguyên ngôn ngữ gốc.

Văn bản:
"""
${text.slice(0, 3000)}
"""`;

  const result = await model.generateContent(prompt);
  return result.response.text().trim();
}

// ── Fix grammar ──────────────────────────────────────────────────────
export async function fixGrammar(text: string): Promise<string> {
  const model = getModel();
  const prompt = `Hãy sửa lỗi ngữ pháp, chính tả và cách diễn đạt của văn bản sau. Chỉ trả về văn bản đã sửa, không giải thích thêm. Giữ nguyên ngôn ngữ và ý nghĩa gốc.

Văn bản:
"""
${text}
"""`;

  const result = await model.generateContent(prompt);
  return result.response.text().trim();
}

// ── Translate ────────────────────────────────────────────────────────
export async function translateText(text: string, targetLang: string): Promise<string> {
  const model = getModel();
  const langMap: Record<string, string> = {
    vi: "tiếng Việt",
    en: "English",
    fr: "français",
    ja: "日本語",
    zh: "中文",
    ko: "한국어",
  };
  const lang = langMap[targetLang] ?? targetLang;

  const prompt = `Dịch văn bản sau sang ${lang}. Chỉ trả về bản dịch, không giải thích.

"""
${text.slice(0, 3000)}
"""`;

  const result = await model.generateContent(prompt);
  return result.response.text().trim();
}

// ── Make shorter / longer ────────────────────────────────────────────
export async function rewriteText(text: string, style: "shorter" | "longer" | "formal" | "casual"): Promise<string> {
  const styleMap = {
    shorter: "Viết lại ngắn gọn hơn, giữ đủ ý chính",
    longer: "Viết lại chi tiết hơn, bổ sung giải thích và ví dụ",
    formal: "Viết lại theo văn phong trang trọng, chuyên nghiệp",
    casual: "Viết lại theo văn phong thân thiện, dễ hiểu",
  };

  const model = getModel();
  const prompt = `${styleMap[style]}. Giữ nguyên ngôn ngữ gốc. Chỉ trả về văn bản đã viết lại.

"""
${text.slice(0, 2000)}
"""`;

  const result = await model.generateContent(prompt);
  return result.response.text().trim();
}

// ── Generate from title ──────────────────────────────────────────────
export async function generateFromTitle(title: string): Promise<string> {
  const model = getModel();
  const prompt = `Hãy viết một bài văn/tài liệu hoàn chỉnh với tiêu đề "${title}". Bao gồm mở đầu, nội dung chính (có đề mục nếu phù hợp) và kết luận. Trả về HTML cơ bản (chỉ dùng <p>, <h2>, <h3>, <ul>, <li>, <strong>, <em>).`;

  const result = await model.generateContent(prompt);
  return result.response.text().trim();
}
