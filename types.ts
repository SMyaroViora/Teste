export interface Chapter {
  id: string;
  title: string;
  isCompleted: boolean;
}

export enum BookStatus {
  UNREAD = 'Não lido',
  READING = 'Lendo',
  READ = 'Lido', // Finished 1st time
  MASTERED = 'Dominado', // Finished 7 times
}

export interface ReadingLog {
  readCount: number; // 1 to 7
  startDate: string;
  endDate: string | null;
  dueDate: string | null; // Calculated based on spaced repetition
}

export interface Book {
  id: string;
  title: string;
  subtitle?: string;
  author: string;
  publisher?: string;
  isbn?: string;
  pageCount: number;
  coverUrl?: string;
  categories: string[];
  chapters: Chapter[];
  status: BookStatus;
  currentPage: number; // For manual tracking if chapters aren't used strictly
  isFavorite: boolean;
  addedAt: string;
  readings: ReadingLog[]; // History of readings
  currentReadCount: number; // 0 = not started, 1 = first read, etc.
}

export interface ReadingGoal {
  dailyPages: number;
  dailyMinutes: number;
  monthlyBooks: number;
  annualBooks: number;
}

export interface AppState {
  books: Book[];
  categories: string[];
  goals: ReadingGoal;
}

export type ViewMode = 'DASHBOARD' | 'LIBRARY' | 'BOOK_DETAIL' | 'ADD_BOOK' | 'GOALS';