import { useState, useEffect } from "react";
import Modal from "../components/Modal";
import { FaTimes, FaEdit, FaTrash } from "react-icons/fa";
import API from "../api";
import { dummyProjects, dummyTasks } from "../components/Dumpdata"
import Checkbox from '@mui/material/Checkbox';
import { FaSortUp, FaSortDown, FaSort } from 'react-icons/fa';
import { Await } from "react-router-dom";



export default function Todo() {
  const [activeTab, setActiveTab] = useState('projects');
  const [projectName, setProjectName] = useState('');
  const [projectDesc, setProjectDesc] = useState('');
  const [taskName, setTaskName] = useState('');
  const [taskContent, setTaskContent] = useState('');
  const [taskDue, setTaskDue] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [projectData, setProjectData] = useState([]);
  const [selectedProject, setSelectedProject] = useState(null);
  const [selectedTask, setSelectedTask] = useState(null);
  const [titleError, setTitleError] = useState('');



  //handle add new project 
  const handleAddProject = async (e) => {
    e.preventDefault();
    // fetchProjectData();

    try {
      let res;
      if (selectedProject) {
        res = await API.put('todo/projects/' + selectedProject.id + "/", {
          project_title: projectName,
          description: projectDesc
        })
        alert("Project updated successfully!");
        // closeModal();      
      } else {
        
          res = await API.post('todo/projects/', {
            project_title: projectName,
            description: projectDesc

        })
        alert("Project created successfully!");
      }
      closeModal();
      setProjectName('');
      setProjectDesc('');
      setTitleError('');

    } catch (err) {
      console.error("Request failed:", err);

      
      alert("Something went wrong. Try again.");
      }
    }

  //handle edit
  const handleEdit = (project) => {
    setProjectName(project.project_title);
    setProjectDesc(project.description);
    setSelectedProject(project);
    setShowModal(true);
  }

  //handle delete projects
  const handleProject = async (projectId) => {
    try {
      const res = await API.get('todo/projects/' + projectId + "/");
      setSelectedProject(true);
      return res;

    } catch (err) {
      console.error("Failed to delete project: ", err);

      alert('Failed to get project data')
    }
  }
  const openModal = async (projectId) => {
    try {
      const res = await handleProject(projectId);
      setSelectedProject(res.data);
      // setShowModal(true); 
    } catch (err) {
      console.error('Failed to open project modal: ', err)
    }
  }
  //close model
  const closeModal = () => {
    setSelectedProject(null);
    setShowModal(false);
  }
  const handleDelete = async (projectId) => {
    try {
      await API.delete('todo/projects/' + projectId + '/');
      setSelectedProject(null);
      alert("Deleted successuly")

    } catch (err) {
      console.error('Failed to delete project:', err)
      alert('Falied to delete project. Please try again.')
    }
  }
  const handleOpenModal = () => {
    setProjectName('');
    setProjectDesc('');
    setShowModal(true);
  }
  //handle add new tasks

  //handle fetch projects and new tasks
  const fetchProjectData = async () => {
    try {
      const res = await API.get('todo/projects/');
      setProjectData(res.data)
    } catch (err) {
      console.error("Fail to fetch data: ", err);
      alert('Failed to fetch data. Please reload page.')
    }
  }

  useEffect(() => {
    fetchProjectData();
    const intervalId = setInterval(() => {
      fetchProjectData()
    }, 500)
  }, []);

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
  const sortedProjects = [...projectData].sort((a, b) => {
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
            <button className="add-btn" onClick={handleOpenModal}>
              New Project
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
                    <td onClick={() => openModal(project.id)}>{project.project_title}</td>
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
              New Task
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

                return (
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
      {selectedProject && (
        <Modal onClose={closeModal}>
          <div className="modal-header">
            <h2>{selectedProject.project_title}</h2>
            <FaTimes size={24} className="close-button" onClick={closeModal} />
          </div>
          <p>{selectedProject.description == '' ? 'Null' : selectedProject.description}</p>
          <p>Total Tasks: <em>{selectedProject.tasks}</em></p>
          <p>Completed tasks: <em>{selectedProject.completed}</em></p>
          <div className="actions">
            <button onClick={() => handleEdit(selectedProject)}>
              <FaEdit style={{ marginRight: 8 }} />
              Edit
            </button>
            <button onClick={() => handleDelete(selectedProject.id)}>
              <FaTrash style={{ marginRight: 8 }} />
              Delete
            </button>
          </div>

        </Modal>
      )}

      {/* for new project */}
      {showModal && (
        <Modal onClose={() => setShowModal(false)}>
          <h3>Set new projects</h3>
          <form onSubmit={handleAddProject} className="form-group">
            {/* project name */}
            <div className="project-items name">
              <label className="form-label" htmlFor="project-name">Project Title</label>
              <input
                id="project-name"
                className="input-item"
                type="text"
                value={projectName}
                onChange={(e) => {                  
                  setProjectName(e.target.value);
                  const existed = projectData.some((proj) => proj.project_title.trim().toLowerCase() === e.target.value.trim().toLowerCase());
                  if (existed) {
                    setTitleError('Project title already exists.');
                  } else {
                    setTitleError('');
                  }
                }}
                required />
              {titleError && <p style={{ fontSize: '16px', color: 'red', marginTop: '0px' }} className="error-text">{titleError}</p>}
            </div>
            {/* project description */}
            <div className="project-items description">
              <label className="form-label" htmlFor="project-description">Project Description</label>
              <textarea
                id="project-description"
                className="input-item"
                value={projectDesc}
                placeholder="Describe the project: purpose, details,..."
                onChange={(e) => setProjectDesc(e.target.value)}
              />

            </div>
            <div className="actions">
              <button type="submit"  disabled={!!titleError} >Submit</button>
              <button type="button" onClick={() => setShowModal(false)}>
                Cancel
              </button>
            </div>
          </form>

        </Modal>
      )}
    </div>


  );
}