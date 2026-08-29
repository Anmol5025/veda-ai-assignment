"use client";

import React, { useState, useRef, useEffect } from 'react';
import { AnswerRegion } from '@/types/assessment';
import { ChevronLeft, ChevronRight, Plus, Minus, RotateCw } from 'lucide-react';
// @ts-ignore
import * as pdfjsLib from 'pdfjs-dist/build/pdf.min.js';

// Initialize PDF.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.js`;

interface DocumentViewerProps {
  fileUrl: string | null;
  file: File | null;
  activeRegions: AnswerRegion[];
  activeQuestionNumber?: string;
}

export function DocumentViewer({ fileUrl, file, activeRegions, activeQuestionNumber }: DocumentViewerProps) {
  const [numPages, setNumPages] = useState<number>(0);
  const [pageNumber, setPageNumber] = useState<number>(1);
  const [scale, setScale] = useState<number>(1.0);
  const [rotation, setRotation] = useState<number>(0);
  const [pdfDoc, setPdfDoc] = useState<any>(null);
  const [imgUrl, setImgUrl] = useState<string | null>(null);
  
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  
  const isImage = file?.type.startsWith('image/');
  const activeRegionForCurrentPage = activeRegions.filter(r => r.pageNumber === pageNumber);

  // Load PDF document
  useEffect(() => {
    if (!fileUrl) return;
    
    if (isImage) {
      setImgUrl(fileUrl);
      setNumPages(1);
    } else {
      const loadPdf = async () => {
        try {
          const doc = await pdfjsLib.getDocument(fileUrl).promise;
          setPdfDoc(doc);
          setNumPages(doc.numPages);
        } catch (error) {
          console.error("Error loading PDF", error);
        }
      };
      loadPdf();
    }
  }, [fileUrl, isImage]);

  // Render PDF page to canvas
  useEffect(() => {
    if (isImage || !pdfDoc || !canvasRef.current) return;
    
    let renderTask: any = null;
    let isMounted = true;
    
    const renderPage = async () => {
      try {
        const page = await pdfDoc.getPage(pageNumber);
        if (!isMounted) return;
        
        const viewport = page.getViewport({ scale: 2.0 });
        const canvas = canvasRef.current;
        if (!canvas) return;
        
        const context = canvas.getContext('2d');
        if (!context) return;
        
        canvas.height = viewport.height;
        canvas.width = viewport.width;
        
        // Clear canvas
        context.clearRect(0, 0, canvas.width, canvas.height);
        
        renderTask = page.render({ canvasContext: context, viewport });
        await renderTask.promise;
      } catch (error: any) {
        if (error?.name !== 'RenderingCancelledException') {
          console.error("Error rendering page", error);
        }
      }
    };
    
    renderPage();
    
    return () => {
      isMounted = false;
      if (renderTask) {
        renderTask.cancel();
      }
    };
  }, [pdfDoc, pageNumber, isImage]);

  useEffect(() => {
    if (activeRegions.length > 0) {
      const firstRegionPage = activeRegions[0].pageNumber;
      if (firstRegionPage !== pageNumber && firstRegionPage <= numPages) {
        setPageNumber(firstRegionPage);
      }
    }
  }, [activeRegions, numPages]);

  const handleZoomIn = () => setScale(s => Math.min(s + 0.1, 2));
  const handleZoomOut = () => setScale(s => Math.max(s - 0.1, 0.5));
  const prevPage = () => setPageNumber(p => Math.max(1, p - 1));
  const nextPage = () => setPageNumber(p => Math.min(numPages, p + 1));

  if (!fileUrl) {
    return <div className="flex-1 flex items-center justify-center text-slate-400 h-full">No document loaded</div>;
  }

  return (
    <div className="flex flex-col h-full bg-[#F5F5F5] overflow-hidden">
      {/* Dark Toolbar */}
      <div className="h-14 bg-[#1C1C1C] flex items-center justify-between px-6 text-white shrink-0">
        <span className="font-medium text-sm hidden sm:block">Answer Sheet</span>
        <span className="font-medium text-sm sm:hidden">Document</span>
        
        <div className="flex items-center gap-2 sm:gap-4 ml-auto">
          <div className="flex items-center gap-1 bg-white/10 rounded-lg px-1 py-1 text-xs mr-2 sm:mr-0">
            <button onClick={() => setRotation(r => (r + 90) % 360)} className="w-6 h-6 flex items-center justify-center hover:bg-white/20 rounded transition-transform active:scale-90" title="Rotate">
              <RotateCw className="w-3 h-3" />
            </button>
          </div>
          
          <div className="flex items-center gap-1 bg-white/10 rounded-lg px-1 py-1 text-xs">
            <button onClick={handleZoomOut} className="w-6 h-6 flex items-center justify-center hover:bg-white/20 rounded transition-transform active:scale-90" title="Zoom Out">
              <Minus className="w-3 h-3" />
            </button>
            <span className="w-10 sm:w-12 text-center font-medium">{Math.round(scale * 100)}%</span>
            <button onClick={handleZoomIn} className="w-6 h-6 flex items-center justify-center hover:bg-white/20 rounded transition-transform active:scale-90" title="Zoom In">
              <Plus className="w-3 h-3" />
            </button>
          </div>
          
          {!isImage && (
            <div className="flex items-center gap-1 bg-white/10 rounded-lg px-1 py-1 text-xs">
              <button onClick={prevPage} disabled={pageNumber <= 1} className="w-6 h-6 flex items-center justify-center hover:bg-white/20 rounded transition-transform active:scale-90 disabled:opacity-50 disabled:scale-100" title="Previous Page">
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="px-1 sm:px-2 font-medium whitespace-nowrap">Page {pageNumber} of {numPages || 1}</span>
              <button onClick={nextPage} disabled={pageNumber >= numPages} className="w-6 h-6 flex items-center justify-center hover:bg-white/20 rounded transition-transform active:scale-90 disabled:opacity-50 disabled:scale-100" title="Next Page">
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Viewer Area */}
      <div className="flex-1 overflow-auto flex justify-center p-4 sm:p-8" ref={containerRef}>
        <div className="relative shadow-md bg-white transition-transform duration-200 ease-in-out" 
             style={{ transform: `scale(${scale}) rotate(${rotation}deg)`, transformOrigin: 'center center' }}>
          
          <div className="relative">
            {isImage ? (
              <img src={imgUrl!} alt="Document" className="max-w-none block" style={{ minWidth: '600px' }} />
            ) : (
              <canvas ref={canvasRef} className="max-w-none block bg-white" style={{ width: '100%', height: 'auto', minWidth: '600px' }} />
            )}
            
            {activeRegionForCurrentPage.map((region, i) => (
              <div 
                key={i}
                className="absolute border-[3px] border-green-500 pointer-events-none rounded transition-all duration-300 z-50 shadow-[0_0_0_1px_rgba(255,255,255,0.5)] bg-green-500/10 mix-blend-multiply"
                style={{
                  left: `${region.boundingBox.x * 100}%`,
                  top: `${region.boundingBox.y * 100}%`,
                  width: `${region.boundingBox.width * 100}%`,
                  height: `${region.boundingBox.height * 100}%`,
                }}
              >
                {activeQuestionNumber && (
                  <div className="absolute -top-4 -left-1 bg-green-500 text-white text-[10px] font-bold px-2 py-0.5 rounded shadow-sm">
                    Q{activeQuestionNumber}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
