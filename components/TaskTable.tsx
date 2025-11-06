import React, { useState, useMemo } from 'react';
import { Task, User, Priority, Status } from '../types';
import { PRIORITY_COLORS } from '../constants';
import { EditIcon, DeleteIcon, ChevronUpIcon, ChevronDownIcon, SearchIcon, FilterIcon, UserIcon } from './Icons';

interface TaskTableProps {
  tasks: Task[];
  users: User[];
  currentUserEmail: string;
  onEdit: (task: Task) => void;
  onDelete: (task: Task) => void;
}

type SortKey = keyof Task;

// Defined a dedicated interface for SortableHeader props for better type safety and clarity.
interface SortableHeaderProps {
    hkey: SortKey;
    label: string;
}

const TaskTable: React.FC<TaskTableProps> = ({ tasks, users, currentUserEmail, onEdit, onDelete }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<Status | 'all'>('all');
  const [assigneeFilter, setAssigneeFilter] = useState<string>('all');
  const [showMyTasks, setShowMyTasks] = useState(false);
  const [sortKey, setSortKey] = useState<SortKey>('createdDate');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  const currentUserName = useMemo(() => {
    return users.find(u => u.email === currentUserEmail)?.name || '';
  }, [users, currentUserEmail]);

  const filteredAndSortedTasks = useMemo(() => {
    let filteredTasks = tasks;

    if (searchTerm) {
      filteredTasks = filteredTasks.filter(task =>
        task.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        task.details.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (statusFilter !== 'all') {
      filteredTasks = filteredTasks.filter(task => task.status === statusFilter);
    }

    if (assigneeFilter !== 'all') {
      filteredTasks = filteredTasks.filter(task => task.assignee === assigneeFilter);
    }
    
    if (showMyTasks && currentUserName) {
      filteredTasks = filteredTasks.filter(task => task.assignee === currentUserName);
    }

    const sortedTasks = [...filteredTasks].sort((a, b) => {
        const valA = a[sortKey];
        const valB = b[sortKey];
        if (valA < valB) return sortOrder === 'asc' ? -1 : 1;
        if (valA > valB) return sortOrder === 'asc' ? 1 : -1;
        return 0;
    });

    return sortedTasks;
  }, [tasks, searchTerm, statusFilter, assigneeFilter, showMyTasks, sortKey, sortOrder, currentUserName]);

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(key);
      setSortOrder('asc');
    }
  };
  
  const headers: { hkey: SortKey, label: string }[] = [
      { hkey: 'name', label: 'タスク名' },
      { hkey: 'assignee', label: '担当者' },
      { hkey: 'category', label: 'カテゴリ' },
      { hkey: 'dueDate', label: '期限' },
      { hkey: 'priority', label: '優先度' },
      { hkey: 'status', label: 'ステータス' },
      { hkey: 'updatedDate', label: '更新日' },
  ];

  const SortableHeader = ({ hkey, label }: SortableHeaderProps) => (
    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider cursor-pointer" onClick={() => handleSort(hkey)}>
      <div className="flex items-center">
        {label}
        {sortKey === hkey && (sortOrder === 'asc' ? <ChevronUpIcon className="w-4 h-4 ml-1" /> : <ChevronDownIcon className="w-4 h-4 ml-1" />)}
      </div>
    </th>
  );

  return (
    <div className="bg-white dark:bg-gray-800 shadow-xl rounded-lg p-4 sm:p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
            <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <SearchIcon className="h-5 w-5 text-gray-400" />
                </div>
                <input type="text" placeholder="Search tasks..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md leading-5 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-200 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"/>
            </div>
            
            <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FilterIcon className="h-5 w-5 text-gray-400" />
                </div>
                <select value={statusFilter} onChange={e => setStatusFilter(e.target.value as Status | 'all')} className="block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md leading-5 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-200 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm appearance-none">
                    <option value="all">全てのステータス</option>
                    {Object.values(Status).map(s => <option key={s} value={s}>{s}</option>)}
                </select>
            </div>
            
             <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <UserIcon className="h-5 w-5 text-gray-400" />
                </div>
                <select value={assigneeFilter} onChange={e => setAssigneeFilter(e.target.value)} className="block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md leading-5 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-200 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm appearance-none">
                    <option value="all">全ての担当者</option>
                    {users.map(u => <option key={u.email} value={u.name}>{u.name}</option>)}
                </select>
            </div>
            
            <div className="flex items-center">
                 <label className="flex items-center space-x-2 cursor-pointer">
                    <input type="checkbox" checked={showMyTasks} onChange={e => setShowMyTasks(e.target.checked)} className="form-checkbox h-4 w-4 text-indigo-600 transition duration-150 ease-in-out rounded"/>
                    <span className="text-sm text-gray-700 dark:text-gray-300">自分のタスクのみ表示</span>
                </label>
            </div>
        </div>

        <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-700">
                    <tr>
                        {headers.map(h => <SortableHeader key={h.hkey} hkey={h.hkey} label={h.label} />)}
                        <th scope="col" className="relative px-6 py-3">
                            <span className="sr-only">Actions</span>
                        </th>
                    </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                    {filteredAndSortedTasks.map(task => (
                        <tr key={task.id} className={`hover:bg-gray-50 dark:hover:bg-gray-700/50 ${PRIORITY_COLORS[task.priority].bg}`}>
                            <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm font-medium text-gray-900 dark:text-white">{task.name}</div>
                                {task.details && <div className="text-sm text-gray-500 dark:text-gray-400 truncate max-w-xs" title={task.details}>{task.details}</div>}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">{task.assignee}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">{task.category}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">{task.dueDate}</td>
                            <td className="px-6 py-4 whitespace-nowrap">
                                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${PRIORITY_COLORS[task.priority].bg} ${PRIORITY_COLORS[task.priority].text}`}>
                                    {task.priority}
                                </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">{task.status}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">{new Date(task.updatedDate).toLocaleDateString()}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                <button onClick={() => onEdit(task)} className="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-200 mr-3"><EditIcon className="w-5 h-5"/></button>
                                <button onClick={() => onDelete(task)} className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-200"><DeleteIcon className="w-5 h-5"/></button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
        {filteredAndSortedTasks.length === 0 && <p className="text-center py-4 text-gray-500 dark:text-gray-400">No tasks found.</p>}
    </div>
  );
};

export default TaskTable;