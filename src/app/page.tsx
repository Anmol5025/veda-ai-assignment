"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { UploadZone } from '@/components/UploadZone';
import { useAssessmentStore } from '@/store/assessmentStore';
import { Button } from '@/components/ui/button';
import { FileIcon, X, Upload, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';

export default function Home() {
  const router = useRouter();
  const {
    questionPaperFile,
    answerSheetFile,
    setQuestionPaperFile,
    setAnswerSheetFile
  } = useAssessmentStore();
  const [isNavigating, setIsNavigating] = useState(false);

  const handleStartMapping = () => {
    if (questionPaperFile && answerSheetFile) {
      setIsNavigating(true);
      router.push('/processing');
    }
  };

  const isReady = questionPaperFile && answerSheetFile;

  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] px-4 pt-10">
      
      <div className="text-center mb-8">
        <h1 className="text-[32px] font-bold text-[#0F172A] mb-3 tracking-tight flex items-center justify-center gap-3">
          Upload <span className="text-[#FF6B00] bg-[#FFF0E5] px-4 py-1.5 rounded-full">Question Paper & Answer Sheets</span>
        </h1>
        <p className="text-[#64748B] font-medium text-[15px]">Upload both files to get started</p>
      </div>

      <div className="mb-10 relative">
        <div className="w-[140px] h-[140px] rounded-full bg-[#FFF0E5] shadow-sm flex items-center justify-center relative overflow-hidden z-10 border-4 border-white">
          <img 
            src="https://api.dicebear.com/7.x/avataaars/svg?top=bob&hairColor=e8e1e1&accessories=prescription02&clothing=blazerAndShirt&eyes=happy&mouth=smile&backgroundColor=transparent" 
            alt="Teacher" 
            className="w-full h-full scale-110 mt-4"
          />
        </div>
        {/* Orbital dots outside */}
        <div className="absolute top-2 -left-2 w-2 h-2 bg-[#FF6B00] rounded-full"></div>
        <div className="absolute top-8 -right-2 w-2.5 h-2.5 bg-[#FF6B00] rounded-full"></div>
        <div className="absolute bottom-6 -left-3 w-1.5 h-1.5 bg-[#FF6B00] rounded-full"></div>
        <div className="absolute bottom-10 -right-1 w-2 h-2 bg-[#FF6B00] rounded-full"></div>
      </div>

      <div className="w-full max-w-4xl flex flex-col md:flex-row gap-6 mb-12">
        {/* Question Paper Upload */}
        <div className="flex-1 bg-white rounded-3xl p-1 shadow-sm border border-slate-100">
          {!questionPaperFile ? (
            <UploadZone
              onFileAccepted={setQuestionPaperFile}
              label={
                <div className="flex flex-col items-center">
                  <div className="w-10 h-10 bg-[#F1F5F9] rounded-xl flex items-center justify-center mb-3">
                    <Upload className="w-5 h-5 text-[#64748B]" />
                  </div>
                  <span className="font-bold text-[#0F172A]">Upload <span className="text-[#FF6B00]">Question Paper</span></span>
                  <span className="text-[13px] text-[#94A3B8] mt-1 font-medium">Max 10MB</span>
                </div>
              }
              accept={{
                'application/pdf': ['.pdf'],
                'image/png': ['.png'],
                'image/jpeg': ['.jpg', '.jpeg']
              }}
            />
          ) : (
            <div className="h-[200px] flex items-center justify-center relative bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200">
              <button 
                onClick={() => setQuestionPaperFile(null)}
                className="absolute top-4 right-4 w-6 h-6 bg-slate-500 text-white rounded-full flex items-center justify-center hover:bg-slate-700 transition"
              >
                <X className="w-4 h-4" />
              </button>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-red-100 text-red-500 rounded-lg flex items-center justify-center text-xs font-bold">
                  PDF
                </div>
                <div>
                  <p className="font-semibold text-slate-900 max-w-[150px] truncate">{questionPaperFile.name}</p>
                  <p className="text-xs text-slate-500 mt-1">
                    {(questionPaperFile.size / 1024 / 1024).toFixed(1)}MB • PDF
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Answer Sheet Upload */}
        <div className="flex-1 bg-white rounded-3xl p-1 shadow-sm border border-slate-100">
          {!answerSheetFile ? (
            <UploadZone
              onFileAccepted={setAnswerSheetFile}
              label={
                <div className="flex flex-col items-center">
                  <div className="w-10 h-10 bg-[#F1F5F9] rounded-xl flex items-center justify-center mb-3">
                    <Upload className="w-5 h-5 text-[#64748B]" />
                  </div>
                  <span className="font-bold text-[#0F172A]">Upload <span className="text-[#FF6B00]">Answer Sheet</span></span>
                  <span className="text-[13px] text-[#94A3B8] mt-1 font-medium">Max 10MB</span>
                </div>
              }
              accept={{
                'application/pdf': ['.pdf'],
                'image/png': ['.png'],
                'image/jpeg': ['.jpg', '.jpeg']
              }}
            />
          ) : (
            <div className="h-[200px] flex items-center justify-center relative bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200">
              <button 
                onClick={() => setAnswerSheetFile(null)}
                className="absolute top-4 right-4 w-6 h-6 bg-slate-500 text-white rounded-full flex items-center justify-center hover:bg-slate-700 transition"
              >
                <X className="w-4 h-4" />
              </button>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-red-100 text-red-500 rounded-lg flex items-center justify-center text-xs font-bold">
                  PDF
                </div>
                <div>
                  <p className="font-semibold text-slate-900 max-w-[150px] truncate">{answerSheetFile.name}</p>
                  <p className="text-xs text-slate-500 mt-1">
                    {(answerSheetFile.size / 1024 / 1024).toFixed(1)}MB • PDF
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="flex flex-col items-center">
        <Button 
          onClick={handleStartMapping}
          disabled={!isReady || isNavigating}
          className={cn(
            "rounded-full px-8 py-6 text-lg font-medium transition-all w-64 active:scale-95",
            isReady && !isNavigating ? "bg-[#1C1C1C] hover:bg-black text-white" : "bg-slate-300 text-slate-50 hover:bg-slate-300"
          )}
        >
          {isNavigating ? (
            <span className="flex items-center gap-2">
              <Loader2 className="w-5 h-5 animate-spin" /> Starting...
            </span>
          ) : (
            "Start Mapping →"
          )}
        </Button>
        <p className="text-xs text-slate-400 mt-4 font-medium">
          Once both files are uploaded, you'll able to map answers with questions
        </p>
        <Link href="/processing?demo=true" className="text-xs text-orange-500 hover:underline mt-4">
          Try with sample dataset
        </Link>
      </div>

    </div>
  );
}
