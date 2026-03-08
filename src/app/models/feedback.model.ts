export interface Feedback {
  id?: number;
  userId?: number;
  userName: string;
  rating: number;
  suggestion?: string;
  message: string;
  date: string;
}
