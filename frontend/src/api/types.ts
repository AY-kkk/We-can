export interface ParsedResume {
  raw_text: string;
  sections: Record<string, string[]>;
  experiences: string[];
}

export interface PolishedItem {
  original: string;
  polished: string;
  star: { S: string; T: string; A: string; R: string };
}

export interface PolishResult {
  items: PolishedItem[];
  resume_html: string;
}

export interface IntroResult {
  five_min: string;
  two_min: string;
  one_min: string;
}

export interface BankItem {
  title: string;
  url: string;
  source: string;
  summary: string;
}

export interface CategoryBlock {
  key: string;
  label: string;
  questions: string[];
}

export interface QuestionBank {
  track: string;
  label: string;
  persona: string;
  total: number;
  categories: CategoryBlock[];
  references: BankItem[];
}

export interface MockTurn {
  role: "interviewer" | "candidate";
  content: string;
}

export interface MockFeedback {
  structure_score: number;
  depth_score: number;
  expression_score: number;
  suggestions: string[];
}

export interface MockInterview {
  session_id: string;
  persona: string;
  question: string;
  finished: boolean;
  feedback: MockFeedback | null;
  history: MockTurn[];
}

export interface AnalyzeResult {
  id: number;
  title: string;
  overall_score: number;
  clarity_score: number;
  structure_score: number;
  confidence_score: number;
  timeline: string[];
  strengths: string[];
  improvements: string[];
  action_items: string[];
  emotion: string;
}

export interface ReviewHistoryItem {
  id: number;
  title: string;
  overall_score: number;
  clarity_score: number;
  structure_score: number;
  confidence_score: number;
  created_at: string;
}

export interface ChecklistItem {
  id: number;
  category: string;
  title: string;
  done: boolean;
  note: string;
  is_custom: boolean;
}

export interface PolishedVersion {
  tone: string;
  text: string;
}

export interface PolishMessageResult {
  goal_anchor: string;
  audience_value: string;
  interest_link: string;
  versions: PolishedVersion[];
  explanation: string;
}

export interface ExperienceItem {
  title: string;
  url: string;
  source: string;
  summary: string;
  track: string;
  author?: string;
  published_at?: string;
}

export interface CollectedItem extends ExperienceItem {
  id: number;
}
