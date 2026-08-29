# VedaAI Hiring Assignment - Assessment Answer Mapping

This is an AI-powered assessment analysis web application that allows teachers to upload a question paper and a student's handwritten answer sheet. It automatically extracts and maps questions to answers, visually highlighting exactly where each answer appears on the answer sheet.

## Tech Stack
- **Frontend:** Next.js (App Router), React, TypeScript
- **Styling:** Tailwind CSS, shadcn/ui, lucide-react
- **State Management:** Zustand
- **Document Rendering:** `pdfjs-dist` (Native HTML5 Canvas rendering)
- **OCR:** Tesseract.js
- **AI Processing:** Groq API

## Brief Explanation of Approach
The application operates in a fully responsive, pixel-perfect UI tailored to the provided Figma design. The technical pipeline is as follows:
1. **Document Ingestion:** Teachers upload a Question Paper and an Answer Sheet (PDF or images). 
2. **Local OCR Extraction:** The browser uses `tesseract.js` to run local Optical Character Recognition on the uploaded documents. For PDFs, the files are rendered via `pdfjs-dist` to native canvas elements, which are then passed to Tesseract to extract raw text and line-level bounding box coordinates.
3. **AI Mapping & Grading:** The extracted raw text and coordinates are sent to the Next.js API route (`/api/process`). The server prompts an LLM via the Groq API to analyze the text, extract individual questions, map handwritten answers to those questions, generate AI feedback, and dynamically assign scores.
4. **Interactive Viewer:** The frontend consumes the structured JSON mapping and renders the Answer Sheet natively on a canvas. When a teacher clicks on a mapped question, the application uses the normalized bounding box coordinates returned by the AI to precisely draw a highlight over the student's handwritten answer.

## AI Model / API Used
- **Provider:** [Groq](https://groq.com/)
- **Model:** `openai/gpt-oss-120b` (accessible via the provided Groq API key)
- **Why this model:** We utilized the Groq API strictly adhering to the requirement of using free/open-source AI platforms. Due to availability constraints on the specific provided API key, standard Llama models were decommissioned or unavailable, so we integrated `openai/gpt-oss-120b`. The prompt engineering utilizes `response_format: { type: 'json_object' }` to strictly enforce a typed JSON response matching our frontend interfaces.

## Important Assumptions & Limitations
- **PDF Rotation / Scans:** It is assumed that uploaded PDFs are scanned right-side up. If a teacher uploads an upside-down scan, the document will render exactly as uploaded. However, a manual "Rotate" button has been explicitly added to the document viewer toolbar to let teachers quickly fix improperly scanned orientations.
- **OCR Accuracy:** Local, browser-based OCR (`tesseract.js`) is highly dependent on image quality and lighting. Complex handwriting or low-resolution scans may result in degraded text extraction.
- **AI Hallucinations:** While the LLM prompt strictly requires mapping answers to real coordinates, the AI may occasionally hallucinate bounding boxes or dynamically generate scores that exceed standard thresholds. The UI defensively handles this by dynamically calculating max scores.
- **File Sizes:** Since Tesseract OCR runs entirely in the browser using WebAssembly, excessively large PDFs or high-megapixel images may cause high memory usage or slight browser freezing during the extraction phase. A highly polished loading state informs the user of the ongoing operation to maintain trust.
- **Dead Clicks:** As per the assignment scope, extraneous sidebar navigation links (e.g. "My Classroom") are disabled and visually greyed out since they are not implemented in this demo.

## Running Locally

1. Install dependencies:
   ```bash
   npm install
   ```

2. Setup Environment Variables:
   Create a `.env.local` file in the root directory and add your Groq API key:
   ```env
   GROQ_API_KEY=your_api_key_here
   ```

3. Start the development server:
   ```bash
   npm run dev --webpack
   ```
   *(Note: The `--webpack` flag is used to bypass a known Next.js 15 Turbopack incompatibility with the PDF.js library).*

4. Open [http://localhost:3000](http://localhost:3000) in your browser.
