export interface CodeReview {
  id: string;
  repositoryId: string;
  pullRequestId: string;
  status: ReviewStatus;
  suggestions: ReviewSuggestion[];
  createdAt: Date;
  updatedAt: Date;
}

export enum ReviewStatus {
  PENDING = 'pending',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  FAILED = 'failed'
}

export interface ReviewSuggestion {
  id: string;
  lineNumber: number;
  filePath: string;
  severity: SuggestionSeverity;
  category: string;
  message: string;
  suggestion: string;
  confidence: number;
}

export enum SuggestionSeverity {
  ERROR = 'error',
  WARNING = 'warning',
  INFO = 'info',
  SUGGESTION = 'suggestion'
}

export interface UserFeedback {
  id: string;
  suggestionId: string;
  userId: string;
  rating: number;
  comment?: string;
  createdAt: Date;
}
