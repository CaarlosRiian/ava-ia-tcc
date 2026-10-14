import { api } from './api';

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

export interface PerformanceData {
  completed_lessons: number;
  total_quizzes_answered: number;
  accuracy_rate: number;
  streak_days: number;
  [key: string]: any;
}

export interface CourseReviewPayload {
  rating: number;
  comment?: string;
}

export interface CourseReview {
  id: number;
  user_id: number;
  username: string;
  rating: number;
  comment?: string;
  created_at: string;
}

export const learningService = {
  generateAIContent: async (lessonId: number): Promise<any> => {
    const response = await api.post(`/lessons/${lessonId}/generate_ai/`);
    return response.data;
  },

  getQuiz: async (lessonId: number, refresh: boolean = false): Promise<{ quiz?: QuizData; questions?: Question[] }> => {
    const url = refresh ? `/lessons/${lessonId}/get_quiz/?refresh=true` : `/lessons/${lessonId}/get_quiz/`;
    const response = await api.get(url);
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

  submitCourseReview: async (courseId: number, reviewData: CourseReviewPayload): Promise<any> => {
    const response = await api.post(`/courses/${courseId}/reviews/`, reviewData);
    return response.data;
  },

  getCourseReviews: async (courseId: number): Promise<CourseReview[]> => {
    const response = await api.get<CourseReview[]>(`/courses/${courseId}/reviews/`);
    return response.data;
  },

  updateCourseReview: async (reviewId: number, reviewData: CourseReviewPayload): Promise<any> => {
    const response = await api.put(`/courses/reviews/${reviewId}/`, reviewData);
    return response.data;
  },

  deleteCourseReview: async (reviewId: number): Promise<any> => {
    const response = await api.delete(`/courses/reviews/${reviewId}/`);
    return response.data;
  },

  getStudentPerformance: async (): Promise<PerformanceData> => {
    const response = await api.get<PerformanceData>('/lessons/meu-desempenho/');
    return response.data;
  }
};