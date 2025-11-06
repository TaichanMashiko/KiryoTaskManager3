
import React, { useState, useCallback, useEffect, useMemo } from 'react';
import { Task, User, Category, GoogleUser, Status } from './types';
import { initGoogleClient, handleAuthClick, handleSignOutClick, getTasks, getUsers, getCategories, updateTask, createTask, deleteTask } from './services/googleSheetsService';
import { GOOGLE_CLIENT_ID } from './constants';
import Login from './components/Login';
import Header from './components/Header';
import TaskTable from './components/TaskTable';
import KanbanBoard from './components/KanbanBoard';
import GanttChart from './components/GanttChart';
import TaskModal from './components/TaskModal';
import { LoadingSpinner } from './components/Icons';

type ViewMode = 'table' | 'kanban' | 'gantt';

export default function App() {
  const [user, setUser] = useState<GoogleUser | null>(null);
  const [isAuthReady, setIsAuthReady] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [tasks, setTasks] = useState<Task[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);

  const [viewMode, setViewMode] = useState<ViewMode>('table');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  const loadData = useCallback(async () => {
    // Note: setIsLoading(true) is called by the login handler before this.
    setError(null);
    try {
      const [tasksData, usersData, categoriesData] = await Promise.all([
        getTasks(),
        getUsers(),
        getCategories(),
      ]);
      setTasks(tasksData);
      setUsers(usersData);
      setCategories(categoriesData);
    } catch (err: any) {
      console.error('Failed to load data', err);
      setError('データの読み込みに失敗しました。ページを再読み込みしてください。');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    
    const handleLoginCallback = async (googleUser: GoogleUser | null) => {
      if (googleUser) {
        const profile = {
          email: googleUser.email,
          name: googleUser.name,
          picture: googleUser.picture,
        };
        setUser(profile);
        setIsLoading(true); // Start loading data
        await loadData();
      } else {
          setUser(null);
          setIsLoading(false); // Ensure loading stops if login fails
      }
    };

    script.onload = () => {
      initGoogleClient(handleLoginCallback)
        .then(() => {
          // Google Client is ready. The app can now show the login button.
          setIsAuthReady(true);
          setIsLoading(false); // Stop the initial auth loading spinner.
        })
        .catch(err => {
           console.error("Auth init error:", err);
           setError("認証の初期化に失敗しました。");
           setIsAuthReady(true); // Still "ready", but in an error state.
           setIsLoading(false);
        });
    };
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    }
  }, [loadData]);

  const handleSignOut = () => {
    handleSignOutClick();
    setUser(null);
    setTasks([]);
  };

  const handleOpenModal = (task: Task | null = null) => {
    setEditingTask(task);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingTask(null);
  };

  const handleSaveTask = async (taskData: Omit<Task, 'id' | 'row' | 'createdDate' | 'updatedDate'> | Task) => {
    setIsLoading(true);
    try {
      if ('id' in taskData) {
        await updateTask(taskData as Task);
      } else {
        await createTask(taskData);
      }
      await loadData();
      handleCloseModal();
    } catch (err) {
      console.error('Failed to save task', err);
      setError('タスクの保存に失敗しました。');
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleUpdateTaskStatus = async (taskId: string, newStatus: Status) => {
    const taskToUpdate = tasks.find(t => t.id === taskId);
    if(taskToUpdate) {
        const updatedTask = {...taskToUpdate, status: newStatus};
        setTasks(currentTasks => currentTasks.map(t => t.id === taskId ? updatedTask : t)); // Optimistic update
        try {
            await updateTask(updatedTask);
            // Optionally re-fetch to ensure data consistency
            // await loadData(); 
        } catch (err) {
            console.error('Failed to update task status', err);
            setError('タスクの状態更新に失敗しました。');
            // Revert optimistic update on failure
            setTasks(tasks);
        }
    }
  };

  const handleDeleteTask = async (task: Task) => {
    if (window.confirm(`タスク "${task.name}" を本当に削除しますか？`)) {
      setIsLoading(true);
      try {
        await deleteTask(task);
        await loadData(); // Reload data to reflect deletion
      } catch (err) {
        console.error('Failed to delete task', err);
        setError('タスクの削除に失敗しました。');
      } finally {
        setIsLoading(false);
      }
    }
  };

  const renderView = () => {
    if (!user) return null; // Should not happen if called correctly, but for type safety
    switch(viewMode) {
      case 'table':
        return <TaskTable tasks={tasks} users={users} currentUserEmail={user.email} onEdit={handleOpenModal} onDelete={handleDeleteTask} />;
      case 'kanban':
        return <KanbanBoard tasks={tasks} users={users} onTaskStatusChange={handleUpdateTaskStatus} onEditTask={handleOpenModal} />;
      case 'gantt':
        return <GanttChart tasks={tasks} onEdit={handleOpenModal} />;
      default:
        return null;
    }
  }

  const appUsers = useMemo(() => users.map(u => ({ label: u.name, value: u.name })), [users]);
  const appCategories = useMemo(() => categories.map(c => ({ label: c.name, value: c.name })), [categories]);

  if (!isAuthReady) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner />
      </div>
    );
  }

  if (!user) {
    return <Login onLoginClick={handleAuthClick} />;
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100">
      <Header
        user={user}
        onSignOut={handleSignOut}
        viewMode={viewMode}
        onViewChange={setViewMode}
        onAddTask={() => handleOpenModal()}
      />
      <main className="p-4 sm:p-6 lg:p-8">
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
            <strong className="font-bold">Error: </strong>
            <span className="block sm:inline">{error}</span>
          </div>
        )}
        {isLoading && !isModalOpen ? (
          <div className="flex items-center justify-center h-64">
            <LoadingSpinner />
          </div>
        ) : (
          renderView()
        )}
      </main>
      {isModalOpen && (
        <TaskModal
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          onSave={handleSaveTask}
          task={editingTask}
          users={appUsers}
          categories={appCategories}
          currentUser={user}
        />
      )}
    </div>
  );
}
