import { create } from 'zustand';
import { ExtractedQuestion, ExtractedAnswer, QuestionAnswerMapping, AssessmentResult } from '@/types/assessment';

interface AssessmentState {
  questionPaperFile: File | null;
  answerSheetFile: File | null;
  
  // Base 64 string equivalents or object URLs for rendering
  questionPaperUrl: string | null;
  answerSheetUrl: string | null;

  // Processing state
  isProcessing: boolean;
  processingStage: string;
  
  // Results
  result: AssessmentResult | null;
  
  // UI State
  selectedQuestionId: string | null;
  activeViewerPage: number;
  
  // Actions
  setQuestionPaperFile: (file: File | null) => void;
  setAnswerSheetFile: (file: File | null) => void;
  setProcessing: (isProcessing: boolean, stage?: string) => void;
  setResult: (result: AssessmentResult | null) => void;
  setSelectedQuestionId: (id: string | null) => void;
  setActiveViewerPage: (page: number) => void;
  reset: () => void;
}

export const useAssessmentStore = create<AssessmentState>((set) => ({
  questionPaperFile: null,
  answerSheetFile: null,
  questionPaperUrl: null,
  answerSheetUrl: null,
  isProcessing: false,
  processingStage: '',
  result: null,
  selectedQuestionId: null,
  activeViewerPage: 1,

  setQuestionPaperFile: (file) => set({ 
    questionPaperFile: file,
    questionPaperUrl: file ? URL.createObjectURL(file) : null
  }),
  
  setAnswerSheetFile: (file) => set({ 
    answerSheetFile: file,
    answerSheetUrl: file ? URL.createObjectURL(file) : null
  }),

  setProcessing: (isProcessing, stage = '') => set({ isProcessing, processingStage: stage }),
  
  setResult: (result) => set({ result }),
  
  setSelectedQuestionId: (id) => set({ selectedQuestionId: id }),
  
  setActiveViewerPage: (page) => set({ activeViewerPage: page }),
  
  reset: () => set({
    questionPaperFile: null,
    answerSheetFile: null,
    questionPaperUrl: null,
    answerSheetUrl: null,
    isProcessing: false,
    processingStage: '',
    result: null,
    selectedQuestionId: null,
    activeViewerPage: 1,
  })
}));
