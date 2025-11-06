
export enum Priority {
  High = '高',
  Medium = '中',
  Low = '低',
}

export enum Status {
  NotStarted = '未着手',
  InProgress = '進行中',
  Completed = '完了',
}

export interface Task {
  id: string;
  row: number; // To keep track of the row number in the sheet
  name: string;
  details: string;
  assignee: string;
  category: string;
  startDate: string;
  dueDate: string;
  priority: Priority;
  status: Status;
  createdDate: string;
  updatedDate: string;
}

export interface User {
  email: string;
  name: string;
  role: string;
}

export interface Category {
  name: string;
}

export interface GoogleUser {
    email: string;
    name: string;
    picture: string;
}
   