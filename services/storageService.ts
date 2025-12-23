import { AppState, Book, ReadingGoal } from '../types';
import { INITIAL_CATEGORIES } from '../constants';

const STORAGE_KEY = 'leitura_espacada_db';

const defaultState: AppState = {
  books: [],
  categories: INITIAL_CATEGORIES,
  goals: {
    dailyPages: 20,
    dailyMinutes: 30,
    monthlyBooks: 1,
    annualBooks: 12
  }
};

export const loadState = (): AppState => {
  try {
    const serialized = localStorage.getItem(STORAGE_KEY);
    if (!serialized) return defaultState;
    return JSON.parse(serialized);
  } catch (e) {
    console.error("Failed to load state", e);
    return defaultState;
  }
};

export const saveState = (state: AppState) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (e) {
    console.error("Failed to save state", e);
  }
};