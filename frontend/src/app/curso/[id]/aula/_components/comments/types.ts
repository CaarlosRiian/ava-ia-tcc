export interface Comment {
  id: number;
  user: string;
  user_name?: string;
  user_avatar?: string; 
  avatar_url?: string;
  avatar?: string;
  content: string;
  created_at: string;
  parent?: number | null;
  replies?: Comment[];
}

export interface LessonCommentsProps {
  lessonId: number;
  apiBaseUrl: string;
}