import { api } from './api';

export interface Flashcard {
  id: number;
  pergunta: string;
  resposta: string;
  lesson_id?: number;
}

export interface Question {
  bloom_level?: string;
  question: string;
  options: string[];
  answer: string;
  explanation: string;
}

export interface QuizData {
  questions: Question[];
}

export interface ChatResponse {
  response: string;
}

export interface FlashcardProgress {
  id: number;
  flashcard: Flashcard;
  due_date: string;
  interval: number;
}

export type FlashcardFeedback = 'easy' | 'good' | 'hard' | 'again' | number;

export interface PerformanceData {
  completed_lessons: number;
  total_quizzes_answered: number;
  accuracy_rate: number;
  streak_days: number;
  [key: string]: any;
}

export const learningService = {
  generateAIContent: async (lessonId: number): Promise<any> => {
    const response = await api.post(`/lessons/${lessonId}/generate_ai/`);
    return response.data;
  },

  getQuiz: async (lessonId: number): Promise<{ quiz?: QuizData; questions?: Question[] }> => {
    const response = await api.get(`/lessons/${lessonId}/get_quiz/`);
    return response.data;
  },

  submitQuiz: async (lessonId: number, answers: Record<string, any>): Promise<any> => {
    const response = await api.post(`/lessons/${lessonId}/submit_quiz/`, { answers });
    return response.data;
  },

  sendChatMessage: async (lessonId: number, message: string): Promise<ChatResponse> => {
    const response = await api.post<ChatResponse>(`/lessons/${lessonId}/chat/`, { message });
    return response.data;
  },

  generateFlashcards: async (lessonId: number): Promise<{ flashcards: Flashcard[] } | Flashcard[]> => {
    const response = await api.post(`/lessons/${lessonId}/generate_flashcards/`);
    return response.data;
  },

  getTodayReviews: async (): Promise<FlashcardProgress[]> => {
    const response = await api.get<FlashcardProgress[]>('/flashcards/hoje/');
    return response.data;
  },

  answerFlashcard: async (progressId: number, feedback: FlashcardFeedback): Promise<any> => {
    const response = await api.post(`/flashcards/${progressId}/responder/`, { feedback });
    return response.data;
  },

  getStudentPerformance: async (): Promise<PerformanceData> => {
    const response = await api.get<PerformanceData>('/lessons/meu-desempenho/');
    return response.data;
  }
};