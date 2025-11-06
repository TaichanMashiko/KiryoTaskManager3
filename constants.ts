import { Priority, Status } from './types';

export const GOOGLE_CLIENT_ID = '1008158953225-b1lc34t0l4kosnsdv5jbl87qfrj9q9nf.apps.googleusercontent.com';
export const GOOGLE_API_KEY = 'AIzaSyAP01pTXo8mKPGUID407-gF7cE_EmX9ILY';
export const SPREADSHEET_ID = '1cOTC9AH8JXpJF9zuVlsfZDVo-n7mFLj8F4VplVoCUD4';

export const SHEET_NAMES = {
  TASKS: 'タスク',
  USERS: 'ユーザーマスタ',
  CATEGORIES: 'カテゴリマスタ',
};

export const TASK_COLUMNS = {
  ID: 0,
  NAME: 1,
  DETAILS: 2,
  ASSIGNEE: 3,
  CATEGORY: 4,
  START_DATE: 5,
  DUE_DATE: 6,
  PRIORITY: 7,
  STATUS: 8,
  CREATED_DATE: 9,
  UPDATED_DATE: 10,
};

export const PRIORITY_COLORS: { [key in Priority]: { bg: string, text: string } } = {
  [Priority.High]: { bg: 'bg-red-100 dark:bg-red-900', text: 'text-red-800 dark:text-red-200' },
  [Priority.Medium]: { bg: 'bg-yellow-100 dark:bg-yellow-900', text: 'text-yellow-800 dark:text-yellow-200' },
  [Priority.Low]: { bg: 'bg-green-100 dark:bg-green-900', text: 'text-green-800 dark:text-green-200' },
};

export const STATUS_COLORS: { [key in Status]: { bg: string, text: string, border: string } } = {
    [Status.NotStarted]: { bg: 'bg-gray-100 dark:bg-gray-700', text: 'text-gray-800 dark:text-gray-200', border: 'border-gray-500' },
    [Status.InProgress]: { bg: 'bg-blue-100 dark:bg-blue-900', text: 'text-blue-800 dark:text-blue-200', border: 'border-blue-500' },
    [Status.Completed]: { bg: 'bg-green-100 dark:bg-green-900', text: 'text-green-800 dark:text-green-200', border: 'border-green-500' },
};

export const STATUS_ORDER = [Status.NotStarted, Status.InProgress, Status.Completed];