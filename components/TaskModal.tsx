
import React, { useState, useEffect } from 'react';
import { Task, Priority, Status, GoogleUser } from '../types';

interface TaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (taskData: Omit<Task, 'id' | 'row' | 'createdDate' | 'updatedDate'> | Task) => void;
  task: Task | null;
  users: { label: string, value: string }[];
  categories: { label: string, value: string }[];
  currentUser: GoogleUser;
}

const TaskModal: React.FC<TaskModalProps> = ({ isOpen, onClose, onSave, task, users, categories, currentUser }) => {
  const [formData, setFormData] = useState<Omit<Task, 'id' | 'row'>>({
    name: '',
    details: '',
    assignee: '',
    category: '',
    startDate: '',
    dueDate: '',
    priority: Priority.Medium,
    status: Status.NotStarted,
    createdDate: '',
    updatedDate: '',
  });

  useEffect(() => {
    if (task) {
      setFormData(task);
    } else {
        const currentUserName = users.find(u => u.value.toLowerCase().includes(currentUser.name.split(' ')[0].toLowerCase()))?.value || '';
        setFormData({
            name: '',
            details: '',
            assignee: currentUserName,
            category: categories.length > 0 ? categories[0].value : '',
            startDate: new Date().toISOString().split('T')[0],
            dueDate: '',
            priority: Priority.Medium,
            status: Status.NotStarted,
            createdDate: '',
            updatedDate: '',
        });
    }
  }, [task, isOpen, users, categories, currentUser]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (task) {
      onSave({ ...task, ...formData });
    } else {
      onSave(formData);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-2xl max-h-full overflow-y-auto">
        <form onSubmit={handleSubmit}>
          <div className="p-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">{task ? 'Edit Task' : 'New Task'}</h2>
            
            <div className="space-y-4">
                <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300">タスク名</label>
                    <input type="text" name="name" id="name" value={formData.name} onChange={handleChange} required className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-200 focus:ring-indigo-500 focus:border-indigo-500"/>
                </div>
                <div>
                    <label htmlFor="details" className="block text-sm font-medium text-gray-700 dark:text-gray-300">詳細</label>
                    <textarea name="details" id="details" value={formData.details} onChange={handleChange} rows={3} className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-200 focus:ring-indigo-500 focus:border-indigo-500"></textarea>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                        <label htmlFor="assignee" className="block text-sm font-medium text-gray-700 dark:text-gray-300">担当者</label>
                        <select name="assignee" id="assignee" value={formData.assignee} onChange={handleChange} className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-200">
                            {users.map(u => <option key={u.value} value={u.value}>{u.label}</option>)}
                        </select>
                    </div>
                     <div>
                        <label htmlFor="category" className="block text-sm font-medium text-gray-700 dark:text-gray-300">カテゴリ</label>
                        <input list="category-list" name="category" id="category" value={formData.category} onChange={handleChange} className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-200 focus:ring-indigo-500 focus:border-indigo-500"/>
                        <datalist id="category-list">
                             {categories.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
                        </datalist>
                    </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                        <label htmlFor="startDate" className="block text-sm font-medium text-gray-700 dark:text-gray-300">開始日</label>
                        <input type="date" name="startDate" id="startDate" value={formData.startDate} onChange={handleChange} className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-200 focus:ring-indigo-500 focus:border-indigo-500"/>
                    </div>
                     <div>
                        <label htmlFor="dueDate" className="block text-sm font-medium text-gray-700 dark:text-gray-300">期限</label>
                        <input type="date" name="dueDate" id="dueDate" value={formData.dueDate} onChange={handleChange} className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-200 focus:ring-indigo-500 focus:border-indigo-500"/>
                    </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                        <label htmlFor="priority" className="block text-sm font-medium text-gray-700 dark:text-gray-300">優先度</label>
                        <select name="priority" id="priority" value={formData.priority} onChange={handleChange} className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-200">
                           {Object.values(Priority).map(p => <option key={p} value={p}>{p}</option>)}
                        </select>
                    </div>
                     <div>
                        <label htmlFor="status" className="block text-sm font-medium text-gray-700 dark:text-gray-300">ステータス</label>
                         <select name="status" id="status" value={formData.status} onChange={handleChange} className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-200">
                           {Object.values(Status).map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                    </div>
                </div>
            </div>
          </div>
          <div className="bg-gray-50 dark:bg-gray-700 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
            <button type="submit" className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-indigo-600 text-base font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:ml-3 sm:w-auto sm:text-sm">
              Save
            </button>
            <button type="button" onClick={onClose} className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 dark:border-gray-600 shadow-sm px-4 py-2 bg-white dark:bg-gray-800 text-base font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm">
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TaskModal;
   