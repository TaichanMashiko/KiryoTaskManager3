
import { GOOGLE_API_KEY, GOOGLE_CLIENT_ID, SPREADSHEET_ID, SHEET_NAMES, TASK_COLUMNS } from '../constants';
import { Task, User, Category, Priority, Status } from '../types';

declare global {
  interface Window {
    gapi: any;
    google: any;
  }
}

const SCOPES = 'https://www.googleapis.com/auth/spreadsheets';
let tokenClient: any = null;

export const initGoogleClient = (callback: (user: any) => void): Promise<void> => {
  return new Promise((resolve, reject) => {
    window.gapi.load('client', async () => {
      try {
        await window.gapi.client.init({
          apiKey: GOOGLE_API_KEY,
          discoveryDocs: ['https://sheets.googleapis.com/$discovery/rest?version=v4'],
        });

        tokenClient = window.google.accounts.oauth2.initTokenClient({
          client_id: GOOGLE_CLIENT_ID,
          scope: SCOPES,
          callback: (tokenResponse: any) => {
            if (tokenResponse && tokenResponse.access_token) {
              const user = JSON.parse(atob(tokenResponse.access_token.split('.')[1]));
              callback(user);
              resolve();
            } else {
               reject(new Error('Authentication failed: No access token received.'));
            }
          },
        });

        // This will automatically sign-in the user if they've previously granted access
        // tokenClient.requestAccessToken({prompt: 'none'});
      } catch (error) {
        reject(error);
      }
    });
  });
};

export const handleAuthClick = () => {
  if (window.gapi.client.getToken() === null) {
      tokenClient.requestAccessToken({ prompt: 'consent' });
  } else {
      tokenClient.requestAccessToken({ prompt: '' });
  }
};

export const handleSignOutClick = () => {
    const token = window.gapi.client.getToken();
    if (token !== null) {
        window.google.accounts.oauth2.revoke(token.access_token, () => {
            window.gapi.client.setToken(null);
        });
    }
};

const parseTasks = (values: any[][]): Task[] => {
  if (!values || values.length < 2) return [];
  const headers = values[0];
  return values.slice(1).map((row, index) => ({
    id: row[TASK_COLUMNS.ID],
    row: index + 2, // 1-based index + header row
    name: row[TASK_COLUMNS.NAME] || '',
    details: row[TASK_COLUMNS.DETAILS] || '',
    assignee: row[TASK_COLUMNS.ASSIGNEE] || '',
    category: row[TASK_COLUMNS.CATEGORY] || '',
    startDate: row[TASK_COLUMNS.START_DATE] || '',
    dueDate: row[TASK_COLUMNS.DUE_DATE] || '',
    priority: row[TASK_COLUMNS.PRIORITY] as Priority || Priority.Medium,
    status: row[TASK_COLUMNS.STATUS] as Status || Status.NotStarted,
    createdDate: row[TASK_COLUMNS.CREATED_DATE] || '',
    updatedDate: row[TASK_COLUMNS.UPDATED_DATE] || '',
  })).filter(task => task.id);
};

export const getTasks = async (): Promise<Task[]> => {
  const response = await window.gapi.client.sheets.spreadsheets.values.get({
    spreadsheetId: SPREADSHEET_ID,
    range: `${SHEET_NAMES.TASKS}!A:K`,
  });
  return parseTasks(response.result.values);
};

export const getUsers = async (): Promise<User[]> => {
  const response = await window.gapi.client.sheets.spreadsheets.values.get({
    spreadsheetId: SPREADSHEET_ID,
    range: `${SHEET_NAMES.USERS}!A:C`,
  });
  const values = response.result.values;
  if (!values || values.length < 2) return [];
  return values.slice(1).map((row: any[]) => ({
    email: row[0] || '',
    name: row[1] || '',
    role: row[2] || '',
  }));
};

export const getCategories = async (): Promise<Category[]> => {
  const response = await window.gapi.client.sheets.spreadsheets.values.get({
    spreadsheetId: SPREADSHEET_ID,
    range: `${SHEET_NAMES.CATEGORIES}!A:A`,
  });
  const values = response.result.values;
  if (!values || values.length < 2) return [];
  return values.slice(1).map((row: any[]) => ({
    name: row[0] || '',
  }));
};

const taskToRow = (task: Omit<Task, 'row'>): any[] => {
    const row = [];
    row[TASK_COLUMNS.ID] = task.id;
    row[TASK_COLUMNS.NAME] = task.name;
    row[TASK_COLUMNS.DETAILS] = task.details;
    row[TASK_COLUMNS.ASSIGNEE] = task.assignee;
    row[TASK_COLUMNS.CATEGORY] = task.category;
    row[TASK_COLUMNS.START_DATE] = task.startDate;
    row[TASK_COLUMNS.DUE_DATE] = task.dueDate;
    row[TASK_COLUMNS.PRIORITY] = task.priority;
    row[TASK_COLUMNS.STATUS] = task.status;
    row[TASK_COLUMNS.CREATED_DATE] = task.createdDate;
    row[TASK_COLUMNS.UPDATED_DATE] = task.updatedDate;
    return row;
};

export const createTask = async (taskData: Omit<Task, 'id' | 'row' | 'createdDate' | 'updatedDate'>): Promise<any> => {
    const now = new Date().toISOString();
    const newTask: Omit<Task, 'row'> = {
        ...taskData,
        id: `TASK-${Date.now()}`,
        createdDate: now,
        updatedDate: now,
    };

    return window.gapi.client.sheets.spreadsheets.values.append({
        spreadsheetId: SPREADSHEET_ID,
        range: `${SHEET_NAMES.TASKS}!A:K`,
        valueInputOption: 'USER_ENTERED',
        resource: {
            values: [taskToRow(newTask)],
        },
    });
};

export const updateTask = async (task: Task): Promise<any> => {
    const updatedTask = { ...task, updatedDate: new Date().toISOString() };
    
    return window.gapi.client.sheets.spreadsheets.values.update({
        spreadsheetId: SPREADSHEET_ID,
        range: `${SHEET_NAMES.TASKS}!A${task.row}:K${task.row}`,
        valueInputOption: 'USER_ENTERED',
        resource: {
            values: [taskToRow(updatedTask)],
        },
    });
};

export const deleteTask = async (task: Task): Promise<any> => {
    return window.gapi.client.sheets.spreadsheets.batchUpdate({
        spreadsheetId: SPREADSHEET_ID,
        resource: {
            requests: [{
                deleteDimension: {
                    range: {
                        sheetId: 0, // Assuming 'タスク' is the first sheet
                        dimension: 'ROWS',
                        startIndex: task.row - 1,
                        endIndex: task.row,
                    },
                },
            }],
        },
    });
};
   