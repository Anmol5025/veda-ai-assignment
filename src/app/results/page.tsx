"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAssessmentStore } from '@/store/assessmentStore';
import { ScrollArea } from '@/components/ui/scroll-area';
import { QuestionAnswerMapping } from '@/types/assessment';
import { ChevronDown, ChevronUp } from 'lucide-react';
import dynamic from 'next/dynamic';
import { cn } from '@/lib/utils';

const DocumentViewer = dynamic(() => import('@/components/DocumentViewer').then(mod => mod.DocumentViewer), {
  ssr: false,
  loading: () => <div className="p-10 text-center text-slate-500">Loading viewer...</div>
});

export default function ResultsPage() {
  const router = useRouter();
  const { 
    result, 
    selectedQuestionId, 
    setSelectedQuestionId,
    answerSheetUrl,
    answerSheetFile,
  } = useAssessmentStore();
  
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (!result) {
      router.push('/');
    }
  }, [result, router]);

  if (!result) return null;

  const handleQuestionClick = (mapping: QuestionAnswerMapping) => {
    // For document viewer
    if (selectedQuestionId === mapping.questionId) {
      setSelectedQuestionId(null);
    } else {
      setSelectedQuestionId(mapping.questionId);
    }
    
    // For local expansion
    setExpandedIds(prev => {
      const next = new Set(prev);
      if (next.has(mapping.questionId)) {
        next.delete(mapping.questionId);
      } else {
        next.add(mapping.questionId);
      }
      return next;
    });
  };
  
  const isAllExpanded = expandedIds.size === result.mappings.length && result.mappings.length > 0;
  
  const handleToggleExpandAll = () => {
    if (isAllExpanded) {
      setExpandedIds(new Set());
    } else {
      setExpandedIds(new Set(result.mappings.map(m => m.questionId)));
    }
  };

  const getScoreColor = (mapping: QuestionAnswerMapping) => {
    if (mapping.score === undefined) return "text-slate-500";
    const max = mapping.score > 5 ? 10 : 5;
    const ratio = mapping.score / max;
    if (ratio >= 0.8) return "text-green-500 font-bold";
    if (ratio > 0) return "text-orange-500 font-bold";
    return "text-red-500 font-bold";
  };

  const getMaxScore = (score: number) => score > 5 ? 10 : 5;

  return (
    <div className="flex flex-col md:flex-row h-full bg-[#F8F9FA] overflow-hidden p-4 md:p-6 gap-6">
      
      {/* Left Panel - Question List */}
      <div className="w-full md:w-[45%] lg:w-[40%] flex flex-col h-full min-h-0 bg-transparent">
        <div className="flex items-center justify-between mb-4 px-2 shrink-0">
          <h2 className="text-base font-bold text-slate-900">Extracted Questions (from question paper)</h2>
          <button 
            onClick={handleToggleExpandAll}
            className="text-xs font-semibold px-3 py-1.5 bg-white border border-slate-200 rounded-full hover:bg-slate-50 transition active:scale-95"
          >
            {isAllExpanded ? "Collapse All" : "Expand All"}
          </button>
        </div>

        <div className="flex-1 pr-2 overflow-y-auto pb-10" style={{ scrollbarWidth: 'thin' }}>
          <div className="space-y-3">
            {result.mappings.map((mapping) => {
              const q = result.questions.find(q => q.id === mapping.questionId);
              const isSelected = selectedQuestionId === mapping.questionId;
              const isExpanded = expandedIds.has(mapping.questionId) || isSelected;
              
              if (!q) return null;

              return (
                <div 
                  key={mapping.questionId}
                  onClick={() => handleQuestionClick(mapping)}
                  className={cn(
                    "p-4 rounded-2xl cursor-pointer transition-all bg-white",
                    isSelected 
                      ? "border-2 border-orange-400 shadow-md ring-4 ring-orange-50" 
                      : "border border-slate-200 hover:border-slate-300 shadow-sm"
                  )}
                >
                  <div className="flex items-start gap-4">
                    <div className={cn(
                      "w-8 h-8 rounded-full flex items-center justify-center shrink-0 font-bold text-sm transition-colors",
                      isSelected ? "bg-orange-500 text-white" : 
                      mapping.status === 'unanswered' ? "bg-slate-50 text-slate-300 border border-slate-200" : "bg-slate-100 text-slate-600"
                    )}>
                      {q.number}
                    </div>
                    
                    <div className={cn("flex-1 pt-1", mapping.status === 'unanswered' && "opacity-75")}>
                      <p className="text-sm font-medium text-slate-700 leading-snug">
                        {q.text}
                      </p>
                      
                      {isExpanded && (
                        <div className="mt-4 pt-4 border-t border-slate-100 animate-in fade-in slide-in-from-top-2">
                          <h4 className="text-xs font-bold text-slate-900 mb-1">
                            {mapping.status === 'unanswered' ? 'Status' : 'AI Feedback'}
                          </h4>
                          <p className="text-xs text-slate-500 leading-relaxed">
                            {mapping.status === 'unanswered' 
                              ? "The student did not provide an answer for this question."
                              : mapping.feedback || "Excellent work! You correctly identified the answer and provided the right context. Keep it up!"}
                          </p>
                        </div>
                      )}
                    </div>

                    <div className="flex flex-col items-end gap-2 shrink-0">
                      {mapping.status === 'unanswered' ? (
                        <span className="text-sm font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded">Unanswered</span>
                      ) : mapping.score !== undefined ? (
                        <span className={cn("text-sm", getScoreColor(mapping))}>
                          {mapping.score}/{getMaxScore(mapping.score)}
                        </span>
                      ) : (
                        <span className="text-sm font-bold text-slate-400">Needs Review</span>
                      )}
                      
                      {isExpanded ? (
                        <ChevronUp className="w-4 h-4 text-slate-400" />
                      ) : (
                        <ChevronDown className="w-4 h-4 text-slate-400" />
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
      
      {/* Right Panel - Document Viewer */}
      <div className="w-full md:w-[55%] lg:w-[60%] flex flex-col h-full min-h-0 bg-white rounded-3xl overflow-hidden shadow-sm border border-slate-200">
        
        <div className="flex-1 bg-[#F5F5F5] relative overflow-hidden">
          <DocumentViewer 
            fileUrl={answerSheetUrl} 
            file={answerSheetFile}
            activeRegions={result.answers.find(a => a.id === result.mappings.find(m => m.questionId === selectedQuestionId)?.answerId)?.regions || []} 
            activeQuestionNumber={result.questions.find(q => q.id === selectedQuestionId)?.number}
          />
        </div>
      </div>
      
    </div>
  );
}
