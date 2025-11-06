import React, { useEffect } from 'react';
import { Task } from '../types';
import { LoadingSpinner } from './Icons';

// Declare google charts types to avoid typescript errors
declare global {
  interface Window {
    google: any;
  }
}

interface GanttChartProps {
  tasks: Task[];
  onEdit: (task: Task) => void;
}

const GanttChart: React.FC<GanttChartProps> = ({ tasks, onEdit }) => {
  const chartElementId = 'gantt-chart-container';

  const drawChart = () => {
    const chartContainer = document.getElementById(chartElementId);
    if (!chartContainer || !window.google || !window.google.visualization) {
      return;
    }

    const data = new window.google.visualization.DataTable();
    data.addColumn('string', 'Task ID');
    data.addColumn('string', 'Task Name');
    data.addColumn('string', 'Resource');
    data.addColumn('date', 'Start Date');
    data.addColumn('date', 'End Date');
    data.addColumn('number', 'Duration');
    data.addColumn('number', 'Percent Complete');
    data.addColumn('string', 'Dependencies');

    const rows = tasks
      .filter(task => task.startDate && task.dueDate && new Date(task.startDate).toString() !== 'Invalid Date' && new Date(task.dueDate).toString() !== 'Invalid Date')
      .map(task => {
        const startDate = new Date(task.startDate);
        let endDate = new Date(task.dueDate);

        if (startDate.getTime() >= endDate.getTime()) {
          endDate = new Date(startDate.getTime());
          endDate.setDate(startDate.getDate() + 1);
        }

        let percentComplete = 0;
        if (task.status === '進行中') percentComplete = 50;
        if (task.status === '完了') percentComplete = 100;
        
        return [
          task.id,
          task.name,
          task.assignee,
          startDate,
          endDate,
          null,
          percentComplete,
          null
        ];
      });

    if (rows.length === 0) {
       chartContainer.innerHTML = '<p class="text-center py-10 text-gray-500 dark:text-gray-400">ガントチャートに表示できるタスクがありません。(有効な開始日と期限が必要です)</p>';
       return;
    }

    data.addRows(rows);

    const options = {
      height: rows.length * 42 + 50,
      gantt: {
        trackHeight: 30,
        barHeight: 20,
        criticalPathEnabled: false,
        percentEnabled: true,
        shadowEnabled: true,
        labelStyle: {
          fontName: 'sans-serif',
          fontSize: 12,
        },
      },
    };

    const chartInstance = new window.google.visualization.Gantt(chartContainer);
    
    const selectionHandler = () => {
        const selection = chartInstance.getSelection();
        if (selection.length > 0) {
            const rowIndex = selection[0].row;
            if (rowIndex != null) {
                const taskId = data.getValue(rowIndex, 0);
                const selectedTask = tasks.find(t => t.id === taskId);
                if (selectedTask) {
                    onEdit(selectedTask);
                }
            }
        }
    };

    window.google.visualization.events.addListener(chartInstance, 'select', selectionHandler);
    chartInstance.draw(data, options);
  };

  useEffect(() => {
    if (window.google && window.google.charts) {
      window.google.charts.load('current', { packages: ['gantt'] });
      window.google.charts.setOnLoadCallback(drawChart);
    }
  }, [tasks]); 

  // Add resize listener to redraw chart on window resize
  useEffect(() => {
      const handleResize = () => drawChart();
      window.addEventListener('resize', handleResize);
      return () => {
          window.removeEventListener('resize', handleResize);
      };
  }, [tasks]);

  return (
    <div className="bg-white dark:bg-gray-800 shadow-xl rounded-lg p-4 sm:p-6 overflow-x-auto">
      <div id={chartElementId}>
         <div className="flex items-center justify-center h-64">
           <LoadingSpinner />
           <p className="ml-2">Loading Chart...</p>
         </div>
      </div>
    </div>
  );
};

export default GanttChart;