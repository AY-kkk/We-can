import { http } from "./client";
import type {
  AnalyzeResult,
  ChecklistItem,
  CollectedItem,
  ExperienceItem,
  IntroResult,
  MockInterview,
  MockTurn,
  ParsedResume,
  PolishMessageResult,
  PolishResult,
  QuestionBank,
  ReviewHistoryItem,
} from "./types";

// ---- 栏目1 简历 ----
export const resumeApi = {
  parse: async (file: File) => {
    const fd = new FormData();
    fd.append("file", file);
    const { data } = await http.post<ParsedResume>("/api/v1/resume/parse", fd);
    return data;
  },
  polish: async (resume_text: string, jd_text: string) => {
    const { data } = await http.post<PolishResult>("/api/v1/resume/polish", {
      resume_text,
      jd_text,
    });
    return data;
  },
  intro: async (resume_text: string, jd_text: string) => {
    const { data } = await http.post<IntroResult>("/api/v1/resume/intro", {
      resume_text,
      jd_text,
    });
    return data;
  },
  exportPdf: async (html: string) => {
    const resp = await http.post("/api/v1/resume/export-pdf", { html }, {
      responseType: "blob",
    });
    return resp.data as Blob;
  },
};

// ---- 栏目2 笔面 ----
export const prepApi = {
  questionBank: async (track: string, keyword: string) => {
    const { data } = await http.post<QuestionBank>("/api/v1/prep/question-bank", {
      track,
      keyword,
    });
    return data;
  },
  mockInterview: async (payload: {
    track: string;
    resume_text?: string;
    session_id?: string | null;
    answer?: string | null;
    history?: MockTurn[];
  }) => {
    const { data } = await http.post<MockInterview>(
      "/api/v1/prep/mock-interview",
      payload,
    );
    return data;
  },
};

// ---- 栏目3 复盘 ----
export const reviewApi = {
  upload: async (file: Blob, filename = "recording.webm") => {
    const fd = new FormData();
    fd.append("file", file, filename);
    const { data } = await http.post<{ file_id: string }>(
      "/api/v1/review/upload",
      fd,
    );
    return data;
  },
  transcribe: async (file_id: string) => {
    const { data } = await http.post<{ transcript: string }>(
      "/api/v1/review/transcribe",
      { file_id },
    );
    return data;
  },
  analyze: async (transcript: string, title: string) => {
    const { data } = await http.post<AnalyzeResult>("/api/v1/review/analyze", {
      transcript,
      title,
    });
    return data;
  },
  history: async () => {
    const { data } = await http.get<ReviewHistoryItem[]>("/api/v1/review/history");
    return data;
  },
};

// ---- 栏目4 Landing ----
export const landingApi = {
  getChecklist: async () => {
    const { data } = await http.get<ChecklistItem[]>("/api/v1/landing/checklist");
    return data;
  },
  addItem: async (payload: Partial<ChecklistItem>) => {
    const { data } = await http.post<ChecklistItem>(
      "/api/v1/landing/checklist",
      payload,
    );
    return data;
  },
  updateItem: async (payload: {
    id: number;
    done?: boolean;
    note?: string;
    title?: string;
  }) => {
    const { data } = await http.put<ChecklistItem>(
      "/api/v1/landing/checklist",
      payload,
    );
    return data;
  },
  deleteItem: async (id: number) => {
    await http.delete(`/api/v1/landing/checklist/${id}`);
  },
  polishMessage: async (payload: {
    message: string;
    audience: string;
    scenario: string;
    channel: string;
  }) => {
    const { data } = await http.post<PolishMessageResult>(
      "/api/v1/landing/polish-message",
      payload,
    );
    return data;
  },
};

// ---- 栏目5 经验 ----
export const experienceApi = {
  list: async (track: string, q: string, source = "") => {
    const { data } = await http.get<{ items: ExperienceItem[]; total: number }>(
      "/api/v1/experience",
      { params: { track, q, source } },
    );
    return data.items;
  },
  sources: async (track: string) => {
    const { data } = await http.get<{ source: string; count: number }[]>(
      "/api/v1/experience/sources",
      { params: { track } },
    );
    return data;
  },
  collect: async (item: ExperienceItem) => {
    const { data } = await http.post<CollectedItem>(
      "/api/v1/experience/collect",
      item,
    );
    return data;
  },
  collected: async () => {
    const { data } = await http.get<CollectedItem[]>(
      "/api/v1/experience/collected",
    );
    return data;
  },
  removeCollected: async (id: number) => {
    await http.delete(`/api/v1/experience/collected/${id}`);
  },
};
