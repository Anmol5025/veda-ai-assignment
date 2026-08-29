// @ts-ignore
import * as pdfjsLib from 'pdfjs-dist/build/pdf.min.js';
import Tesseract from 'tesseract.js';
import { BoundingBox } from '@/types/assessment';

// Setup worker
pdfjsLib.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.js`;

export interface OCRLine {
  text: string;
  bbox: BoundingBox;
}

export interface ExtractedPageText {
  pageNumber: number;
  text: string;
  lines: OCRLine[];
}

function normalizeBbox(bbox: Tesseract.Bbox, width: number, height: number): BoundingBox {
  return {
    x: bbox.x0 / width,
    y: bbox.y0 / height,
    width: (bbox.x1 - bbox.x0) / width,
    height: (bbox.y1 - bbox.y0) / height
  };
}

/**
 * Converts a File (PDF or Image) into a series of text strings (one per page)
 * using client-side canvas rendering and Tesseract.js OCR.
 */
export async function extractTextFromFile(
  file: File, 
  onProgress?: (progress: string) => void
): Promise<ExtractedPageText[]> {
  const extractedPages: ExtractedPageText[] = [];

  if (file.type.startsWith('image/')) {
    onProgress?.('Initializing OCR engine...');
    
    // Get image dimensions
    const img = new Image();
    img.src = URL.createObjectURL(file);
    await new Promise(resolve => img.onload = resolve);
    const width = img.width;
    const height = img.height;

    const result = await Tesseract.recognize(file, 'eng', {
      logger: m => {
        if (m.status === 'recognizing text') {
          onProgress?.(`OCR Image: ${Math.round(m.progress * 100)}%`);
        }
      }
    });
    
    const data = result.data as any;
    const lines = (data.lines || []).map((line: any) => ({
      text: line.text?.trim() || '',
      bbox: line.bbox ? normalizeBbox(line.bbox, width, height) : {x:0, y:0, width:1, height:0.1}
    })).filter((l: any) => l.text.length > 0);

    extractedPages.push({ pageNumber: 1, text: result.data.text, lines });
  } else if (file.type === 'application/pdf') {
    onProgress?.('Loading PDF...');
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    const numPages = pdf.numPages;

    for (let i = 1; i <= numPages; i++) {
      onProgress?.(`Rendering PDF page ${i} of ${numPages}...`);
      const page = await pdf.getPage(i);
      const viewport = page.getViewport({ scale: 1.5 }); // Good balance of quality and speed

      const canvas = document.createElement('canvas');
      const context = canvas.getContext('2d');
      if (!context) continue;

      canvas.height = viewport.height;
      canvas.width = viewport.width;

      await page.render({ canvasContext: context, viewport }).promise;

      const dataUrl = canvas.toDataURL('image/png');

      onProgress?.(`Running OCR on page ${i}...`);
      const result = await Tesseract.recognize(dataUrl, 'eng', {
        logger: m => {
          if (m.status === 'recognizing text') {
            onProgress?.(`OCR Page ${i}: ${Math.round(m.progress * 100)}%`);
          }
        }
      });
      
      const data = result.data as any;
      const lines = (data.lines || []).map((line: any) => ({
        text: line.text?.trim() || '',
        bbox: line.bbox ? normalizeBbox(line.bbox, canvas.width, canvas.height) : {x:0, y:0, width:1, height:0.1}
      })).filter((l: any) => l.text.length > 0);

      extractedPages.push({ pageNumber: i, text: result.data.text, lines });
    }
  }

  return extractedPages;
}
