import React from 'react';
import { GoogleUser } from '../types';
import { TableIcon, KanbanIcon, PlusIcon, GanttChartIcon } from './Icons';

interface HeaderProps {
  user: GoogleUser;
  onSignOut: () => void;
  viewMode: 'table' | 'kanban' | 'gantt';
  onViewChange: (mode: 'table' | 'kanban' | 'gantt') => void;
  onAddTask: () => void;
}

const Header: React.FC<HeaderProps> = ({ user, onSignOut, viewMode, onViewChange, onAddTask }) => {
  return (
    <header className="bg-white dark:bg-gray-800 shadow-md">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <h1 className="text-xl font-bold text-gray-800 dark:text-white">KiryoTaskManager</h1>
          </div>

          <div className="flex items-center space-x-4">
            <button
              onClick={onAddTask}
              className="hidden sm:inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              <PlusIcon className="w-5 h-5 mr-2 -ml-1" />
              New Task
            </button>

            <div className="bg-gray-200 dark:bg-gray-700 p-1 rounded-lg flex items-center">
              <button
                onClick={() => onViewChange('table')}
                className={`p-1.5 rounded-md ${viewMode === 'table' ? 'bg-white dark:bg-gray-900 shadow' : 'text-gray-600 dark:text-gray-300'}`}
                aria-label="Table view"
              >
                <TableIcon className="w-5 h-5" />
              </button>
              <button
                onClick={() => onViewChange('kanban')}
                className={`p-1.5 rounded-md ${viewMode === 'kanban' ? 'bg-white dark:bg-gray-900 shadow' : 'text-gray-600 dark:text-gray-300'}`}
                aria-label="Kanban view"
              >
                <KanbanIcon className="w-5 h-5" />
              </button>
              <button
                onClick={() => onViewChange('gantt')}
                className={`p-1.5 rounded-md ${viewMode === 'gantt' ? 'bg-white dark:bg-gray-900 shadow' : 'text-gray-600 dark:text-gray-300'}`}
                aria-label="Gantt chart view"
              >
                <GanttChartIcon className="w-5 h-5" />
              </button>
            </div>
            
            <div className="relative group">
              <img
                className="h-8 w-8 rounded-full cursor-pointer"
                src={user.picture}
                alt={user.name}
              />
              <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-700 rounded-md shadow-lg py-1 z-20 hidden group-hover:block">
                <div className="px-4 py-2 text-sm text-gray-700 dark:text-gray-200 border-b dark:border-gray-600">
                  <p className="font-semibold">{user.name}</p>
                  <p className="text-xs truncate">{user.email}</p>
                </div>
                <button
                  onClick={onSignOut}
                  className="block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-600"
                >
                  Sign Out
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;