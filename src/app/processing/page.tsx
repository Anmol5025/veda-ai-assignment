"use client";

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAssessmentStore } from '@/store/assessmentStore';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { CheckCircle2, CircleDashed, Loader2, Sparkles } from 'lucide-react';
import { processDemoAssessment } from '@/lib/demoData';

const STAGES = [
  { id: 'upload', label: 'Uploading documents' },
  { id: 'extract-questions', label: 'Extracting questions from paper' },
  { id: 'analyze-answers', label: 'Analyzing handwritten answers' },
  { id: 'mapping', label: 'Mapping answers to questions' },
  { id: 'results', label: 'Preparing results' },
];

import { Suspense } from 'react';

import { extractTextFromFile } from '@/lib/ocr';

function ProcessingContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isDemo = searchParams.get('demo') === 'true';
  const { questionPaperFile, answerSheetFile, setResult } = useAssessmentStore();
  const [currentStageIndex, setCurrentStageIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [ocrProgressText, setOcrProgressText] = useState<string>('');

  useEffect(() => {
    // If not demo and no files, redirect back
    if (!isDemo && (!questionPaperFile || !answerSheetFile)) {
      router.push('/');
      return;
    }

    let isMounted = true;

    const runProcessing = async () => {
      try {
        if (isDemo) {
          // Simulate stages for demo mode
          for (let i = 0; i < STAGES.length; i++) {
            if (!isMounted) return;
            setCurrentStageIndex(i);
            setProgress((i / STAGES.length) * 100);
            await new Promise(r => setTimeout(r, 1500));
          }
          if (!isMounted) return;
          setProgress(100);
          setResult(processDemoAssessment());
          router.push('/results');
        } else {
          // Real execution
          if (!questionPaperFile || !answerSheetFile) return;

          setCurrentStageIndex(1); // Extracting questions
          setProgress(10);
          const questionPaperData = await extractTextFromFile(questionPaperFile, (msg) => {
            if (isMounted) setOcrProgressText(msg);
          });
          setProgress(30);
          
          setCurrentStageIndex(2); // Analyzing answers
          const answerSheetData = await extractTextFromFile(answerSheetFile, (msg) => {
            if (isMounted) setOcrProgressText(msg);
          });
          setProgress(60);
          
          setCurrentStageIndex(3); // Mapping
          if (isMounted) setOcrProgressText('Sending data to AI...');
          
          const response = await fetch('/api/process', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ questionPaperData, answerSheetData })
          });

          if (!response.ok) {
            const errData = await response.json().catch(() => ({}));
            throw new Error(errData.error || 'Failed to map answers');
          }

          const resultData = await response.json();
          
          setCurrentStageIndex(4); // Preparing results
          setProgress(90);
          await new Promise(r => setTimeout(r, 500));
          
          if (!isMounted) return;
          setResult(resultData);
          setProgress(100);
          router.push('/results');
        }
      } catch (err: any) {
        if (isMounted) setError(err.message || 'An error occurred during processing.');
      }
    };

    runProcessing();

    return () => { isMounted = false; };
  }, [isDemo, questionPaperFile, answerSheetFile, router, setResult]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] px-4 pt-10">
      <div className="bg-white rounded-3xl p-16 shadow-sm border border-slate-100 flex flex-col items-center justify-center w-full max-w-4xl min-h-[500px]">
        
        {error ? (
          <div className="text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-red-500 font-bold text-2xl">!</span>
            </div>
            <h2 className="text-xl font-bold text-slate-900 mb-2">Processing Failed</h2>
            <p className="text-slate-500 mb-6 max-w-sm mx-auto">{error}</p>
            <button 
              onClick={() => {
                setError(null);
                setCurrentStageIndex(0);
                setProgress(0);
                router.push('/');
              }}
              className="bg-slate-900 text-white px-6 py-2 rounded-full font-medium hover:bg-black transition-colors active:scale-95"
            >
              Try Again
            </button>
          </div>
        ) : (
          <div className="text-center flex flex-col items-center">
            <svg width="140" height="140" viewBox="0 0 100 100" className="mb-4 animate-pulse" style={{ filter: 'drop-shadow(0px 8px 16px rgba(255, 107, 0, 0.25))' }}>
              <defs>
                <linearGradient id="starGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#FF9B6A" />
                  <stop offset="50%" stopColor="#FF4500" />
                  <stop offset="100%" stopColor="#FF9B6A" />
                </linearGradient>
              </defs>
              
              {/* Large star */}
              <path d="M55 5 Q55 35 85 35 Q55 35 55 65 Q55 35 25 35 Q55 35 55 5 Z" fill="url(#starGrad)" opacity="0.9" />
              
              {/* Medium star */}
              <path d="M30 45 Q30 65 50 65 Q30 65 30 85 Q30 65 10 65 Q30 65 30 45 Z" fill="url(#starGrad)" opacity="0.9" />
              
              {/* Small star */}
              <path d="M72 58 Q72 68 82 68 Q72 68 72 78 Q72 68 62 68 Q72 68 72 58 Z" fill="url(#starGrad)" opacity="0.8" />
              
              {/* Small circle */}
              <circle cx="15" cy="40" r="4" fill="#FF8C42" opacity="0.9" />
            </svg>
            <h2 className="text-[40px] font-extrabold text-[#2D2D2D] mb-1 tracking-[-0.03em]">Extracting...</h2>
            <p className="text-[#737373] text-[22px] font-normal tracking-[-0.02em]">This may take a while</p>
            {!isDemo && ocrProgressText && (
              <p className="text-sm text-[#FF6B00] mt-6 font-medium animate-pulse">{ocrProgressText}</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default function ProcessingPage() {
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
      <Suspense fallback={<div>Loading...</div>}>
        <ProcessingContent />
      </Suspense>
    </div>
  );
}
