export interface ReviewSuggestion {
  severity: "low" | "medium" | "high";
  line: number;
  message: string;
  reason: string;
  fixedCode?: string;
}

export interface ReviewFeedback {
  suggestions: ReviewSuggestion[];
  summary: string;
  aiModel: string;
}

