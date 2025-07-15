import { useState, useEffect } from "react";
import Modal from "../components/Modal";
import { FaTimes, FaEdit, FaTrash } from "react-icons/fa";
import API from "../api";
import { dummyProjects, dummyTasks } from "../components/Dumpdata"
import Checkbox from '@mui/material/Checkbox';
import { FaSortUp, FaSortDown, FaSort } from 'react-icons/fa';



export default function Todo() {
  const [activeTab, setActiveTab] = useState('projects');

  const findProjectName = (projectId) => {
    const projectName = dummyProjects.find(p => p.id === projectId).title;
    return projectName;
  }

  //handle sorting 
  const [sortConfig, setSortConfig] = useState({
    key: 'project_title',
    direction: 'asc'
  })

  //sort logic 
  const sortedProjects = [...dummyProjects].sort((a, b) => {
    const { key, direction } = sortConfig;
    const aVal = a[key]?.toString().toLowerCase();
    const bVal = b[key]?.toString().toLowerCase();
    if (aVal < bVal) return direction === 'asc' ? -1 : 1;
    if (aVal > bVal) return direction === 'asc' ? 1 : -1;
    return 0;
  })

  const handleSort = (key) => {
  setSortConfig((prev) => {
    if (prev.key === key) {
      return {
        key,
        direction: prev.direction === 'asc' ? 'desc' : 'asc',
      };
    }
    return { key, direction: 'asc' };
  });
};

  return (
    <div className="todo-page">
      <h1>TodoList</h1>
      

      {/* switch tab */}
      <div class='switch-tabs'>
        <button className={activeTab === 'projects' ? 'active' : ''}
          onClick={() => setActiveTab('projects')}
        >
          Projects
        </button>
        <button className={activeTab === 'tasks' ? 'active' : ''}
          onClick={() => setActiveTab('tasks')}
        >
          All Tasks
        </button>

      </div>

      {activeTab === 'projects' && (
        <>
          <div className="add-buttons">
            <button className="add-btn">
              + New Project
            </button>
          </div>
        <table className="projects-table">
          <thead>
            <tr>
                <th onClick={() => handleSort('project_title')}>
                  Project Name{' '}
                  {sortConfig.key === 'project_title' ? (
                    sortConfig.direction === 'asc' ? <FaSortUp /> : <FaSortDown />
                  ) : (
                    <FaSort style={{ opacity: 0.5 }} />
                  )}
                </th>
                <th onClick={() => handleSort('description')}>
                  Description{' '}
                  {sortConfig.key === 'description' ? (
                    sortConfig.direction === 'asc' ? <FaSortUp /> : <FaSortDown />
                  ) : (
                    <FaSort style={{ opacity: 0.5 }} />
                  )}
                </th>
                <th onClick={() => handleSort('tasks')}>
                  Tasks{' '}
                  {sortConfig.key === 'tasks' ? (
                    sortConfig.direction === 'asc' ? <FaSortUp /> : <FaSortDown />
                  ) : (
                    <FaSort style={{ opacity: 0.5 }} />
                  )}
                </th>
              <th>Progress</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {sortedProjects.map((project) => {
              const progress = Math.round((project.completed / project.tasks) * 100) || 0;
              let status = 'Start';
              if (progress === 100) status = 'Completed';
              else if (progress > 0) status = 'In Progress';

              return (
                <tr key={project.id}>
                  <td>{project.title}</td>
                  <td>{project.description}</td>
                  <td>{project.tasks}</td>
                  <td>
                    <div className="progress-bar-wrapper">
                      <div className="progress-bar" style={{ width: `${progress}%` }} />
                    </div>
                  </td>
                  <td>{status}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
        </>


      )}

      {activeTab === 'tasks' && (
        <>
        <div className="add-buttons">
          <button className="add-btn">
              + New Task
            </button>
        </div>
        
        <table className="tasks-table">
          <thead>
            <tr>
              <th>Task Name</th>
              <th>Project Name</th>
              <th>Task Content</th>
              <th>Created Date</th>
              <th>Due Date</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {dummyTasks.map((task) => {
              const checked = task.is_completed === true || task.is_completed === 'true';

              return(
                <tr key={task.id}>
                <td>{task.task_title}</td>
                <td>{findProjectName(task.projectId)}</td>
                <td>{task.task_content}</td>
                <td>{task.created}</td>
                <td>{task.due_date}</td>
                  <td>
                    <Checkbox
                      checked={checked}
                      readOnly
                      sx={{
                        width: 24,
                        height: 24,
                        '& svg': {
                          fontSize: 24,
                          boxSizing: 'border-box',
                        },
                        color: '#dbb1ffd5',
                        '&.Mui-checked': {
                          color: '#dbb1ffd5',
                        },

                      }}
                      inputProps={{ 'aria-label': `task-completed-${task.id}` }}
                    />
                  </td>
                </tr>
              );
              
            })}
          </tbody>
        </table>
        </>
      )}
    </div>


  );
}