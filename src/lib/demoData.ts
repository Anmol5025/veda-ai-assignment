import { AssessmentResult } from '@/types/assessment';

export const processDemoAssessment = (): AssessmentResult => {
  return {
    questions: [
      { id: 'q1', number: '1', text: 'What is a variable?', pageNumber: 1 },
      { id: 'q2', number: '2', text: 'Explain the difference between let and const.', pageNumber: 1 },
      { id: 'q3a', number: '3(a)', text: 'What is inheritance?', pageNumber: 1 },
      { id: 'q3b', number: '3(b)', text: 'Provide an example of inheritance.', pageNumber: 1 },
      { id: 'q4', number: '4', text: 'Describe polymorphism.', pageNumber: 2 },
      { id: 'q5', number: '5', text: 'What are interfaces in TypeScript?', pageNumber: 2 },
    ],
    answers: [
      {
        id: 'a1',
        detectedQuestionNumber: '1',
        text: 'A variable is a container for storing data values.',
        regions: [{ pageNumber: 1, boundingBox: { x: 0.1, y: 0.1, width: 0.8, height: 0.1 } }],
        confidence: 0.95
      },
      {
        id: 'a2',
        detectedQuestionNumber: '2',
        text: 'Let allows reassignment, const does not.',
        regions: [{ pageNumber: 1, boundingBox: { x: 0.1, y: 0.25, width: 0.8, height: 0.1 } }],
        confidence: 0.92
      },
      {
        id: 'a3a',
        detectedQuestionNumber: '3(a)',
        text: 'Inheritance is a mechanism where a new class is derived from an existing class.',
        regions: [{ pageNumber: 1, boundingBox: { x: 0.1, y: 0.4, width: 0.8, height: 0.1 } }],
        confidence: 0.98
      },
      // Note: 3(b) is unanswered
      {
        id: 'a4',
        detectedQuestionNumber: '4',
        text: 'Polymorphism allows objects of different types to be treated as objects of a common type.',
        // Multi-page answer example
        regions: [
          { pageNumber: 1, boundingBox: { x: 0.1, y: 0.8, width: 0.8, height: 0.15 } },
          { pageNumber: 2, boundingBox: { x: 0.1, y: 0.05, width: 0.8, height: 0.1 } }
        ],
        confidence: 0.88
      },
      {
        id: 'a-unknown',
        detectedQuestionNumber: '8', // Unmatched
        text: 'An unmatched answer content here.',
        regions: [{ pageNumber: 2, boundingBox: { x: 0.1, y: 0.5, width: 0.8, height: 0.1 } }],
        confidence: 0.7
      }
    ],
    mappings: [
      { questionId: 'q1', answerId: 'a1', status: 'answered', confidence: 0.95, score: 5 },
      { questionId: 'q2', answerId: 'a2', status: 'answered', confidence: 0.92, score: 4 },
      { questionId: 'q3a', answerId: 'a3a', status: 'answered', confidence: 0.98, score: 5 },
      { questionId: 'q3b', status: 'unanswered', confidence: 0 },
      { questionId: 'q4', answerId: 'a4', status: 'answered', confidence: 0.88, score: 4 },
      { questionId: 'q5', status: 'unanswered', confidence: 0 },
      // The unmatched answer is handled implicitly or could have a mapping with no questionId.
      { questionId: 'unmatched-1', answerId: 'a-unknown', status: 'unmatched', confidence: 0.7 }
    ]
  };
};
