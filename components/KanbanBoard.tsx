
import React, { useState } from 'react';
import { Task, User, Status, Priority } from '../types';
import { PRIORITY_COLORS, STATUS_COLORS, STATUS_ORDER } from '../constants';

interface KanbanBoardProps {
  tasks: Task[];
  users: User[];
  onTaskStatusChange: (taskId: string, newStatus: Status) => void;
  onEditTask: (task: Task) => void;
}

const TaskCard: React.FC<{ task: Task, onDragStart: (e: React.DragEvent<HTMLDivElement>, taskId: string) => void, onEditTask: (task: Task) => void }> = ({ task, onDragStart, onEditTask }) => {
  const { bg, text } = PRIORITY_COLORS[task.priority];
  return (
    <div
      draggable
      onDragStart={(e) => onDragStart(e, task.id)}
      onClick={() => onEditTask(task)}
      className="bg-white dark:bg-gray-700 rounded-lg p-3 shadow-sm cursor-pointer hover:shadow-md transition-shadow mb-3 border-l-4"
      style={{ borderColor: STATUS_COLORS[task.status].border.replace('border-', '#') }}
    >
      <p className="font-semibold text-sm text-gray-800 dark:text-gray-100">{task.name}</p>
      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{task.category}</p>
      <div className="flex items-center justify-between mt-2">
        <span className={`px-2 py-0.5 inline-flex text-xs leading-4 font-semibold rounded-full ${bg} ${text}`}>
          {task.priority}
        </span>
        <span className="text-xs text-gray-500 dark:text-gray-400">{task.assignee}</span>
      </div>
    </div>
  );
};

const KanbanColumn: React.FC<{
  status: Status,
  tasks: Task[],
  onDragStart: (e: React.DragEvent<HTMLDivElement>, taskId: string) => void,
  onDrop: (e: React.DragEvent<HTMLDivElement>, status: Status) => void,
  onEditTask: (task: Task) => void
}> = ({ status, tasks, onDragStart, onDrop, onEditTask }) => {
  const [isOver, setIsOver] = useState(false);
  const { bg, text, border } = STATUS_COLORS[status];

  return (
    <div
      onDragOver={(e) => { e.preventDefault(); setIsOver(true); }}
      onDragLeave={() => setIsOver(false)}
      onDrop={(e) => { onDrop(e, status); setIsOver(false); }}
      className={`flex-1 min-w-[300px] bg-gray-100 dark:bg-gray-900/50 rounded-lg p-3 transition-colors ${isOver ? 'bg-indigo-100 dark:bg-indigo-900/50' : ''}`}
    >
      <div className={`flex items-center justify-between px-2 py-1 mb-3 border-b-2 ${border}`}>
        <h3 className={`font-semibold text-sm uppercase ${text}`}>{status}</h3>
        <span className={`text-xs font-bold rounded-full px-2 py-0.5 ${bg} ${text}`}>{tasks.length}</span>
      </div>
      <div>
        {tasks.map(task => (
          <TaskCard key={task.id} task={task} onDragStart={onDragStart} onEditTask={onEditTask} />
        ))}
      </div>
    </div>
  );
};

const KanbanBoard: React.FC<KanbanBoardProps> = ({ tasks, users, onTaskStatusChange, onEditTask }) => {
  const onDragStart = (e: React.DragEvent<HTMLDivElement>, taskId: string) => {
    e.dataTransfer.setData('taskId', taskId);
  };

  const onDrop = (e: React.DragEvent<HTMLDivElement>, newStatus: Status) => {
    const taskId = e.dataTransfer.getData('taskId');
    onTaskStatusChange(taskId, newStatus);
  };
  
  return (
    <div className="flex space-x-4 overflow-x-auto pb-4">
      {STATUS_ORDER.map(status => (
        <KanbanColumn
          key={status}
          status={status}
          tasks={tasks.filter(t => t.status === status)}
          onDragStart={onDragStart}
          onDrop={onDrop}
          onEditTask={onEditTask}
        />
      ))}
    </div>
  );
};

export default KanbanBoard;
   