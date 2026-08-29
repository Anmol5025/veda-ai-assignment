export type QuestionStatus = "answered" | "unanswered" | "unmatched" | "unclear";

export interface BoundingBox {
  x: number; // Normalized (0-1) or percentage (0-100) or absolute px. Let's use normalized 0-1 for standard handling.
  y: number;
  width: number;
  height: number;
}

export interface AnswerRegion {
  pageNumber: number;
  boundingBox: BoundingBox;
}

export interface ExtractedQuestion {
  id: string;
  number: string; // E.g., "1", "3(a)"
  text: string;
  pageNumber: number;
}

export interface ExtractedAnswer {
  id: string;
  detectedQuestionNumber?: string;
  text: string;
  regions: AnswerRegion[];
  confidence: number;
}

export interface QuestionAnswerMapping {
  questionId: string;
  answerId?: string;
  status: QuestionStatus;
  confidence: number;
  feedback?: string; // Optional AI feedback or grading
  score?: number;    // Optional score
}

// Full Assessment state
export interface AssessmentResult {
  questions: ExtractedQuestion[];
  answers: ExtractedAnswer[];
  mappings: QuestionAnswerMapping[];
}
