import { useState, useEffect } from "react";
import Modal from "../components/Modal";
import { FaTimes, FaEdit, FaTrash } from "react-icons/fa";
import API from "../api";
import { dummyProjects, dummyTasks } from "../components/Dumpdata"
import Checkbox from '@mui/material/Checkbox';
import { FaSortUp, FaSortDown, FaSort } from 'react-icons/fa';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';




export default function Todo() {
  const [activeTab, setActiveTab] = useState('projects');
  const [projectName, setProjectName] = useState('');
  const [projectDesc, setProjectDesc] = useState('');
  const [taskName, setTaskName] = useState('');
  const [taskContent, setTaskContent] = useState('');
  const [taskDue, setTaskDue] = useState('');
  const [taskProject, setTaskProject] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [projectData, setProjectData] = useState([]);
  const [selectedProject, setSelectedProject] = useState(null);
  const [taskData, setTaskData] = useState([]);
  const [selectedTask, setSelectedTask] = useState(null);
  const [titleError, setTitleError] = useState('');
  const [selectedStatuses, setSelectedStatuses] = useState([]);
  const STATUS_LIST = ['Planning', 'In Progress', 'Completed'];
  const [showDropdown, setShowDropdown] = useState(false);
  const [modalType, setModalType] = useState(null);


  //handle add new project 
  const handleAddProject = async (e) => {
    e.preventDefault();
    // fetchProjectData();
    const descToSend = projectDesc === '' ? 'Null' : projectDesc;
    try {
      let res;
      if (selectedProject) {
        res = await API.put('todo/projects/' + selectedProject.id + "/", {
          project_title: projectName,
          description: descToSend
        })
        alert("Project updated successfully!");
        // closeModal();      
      } else {

        res = await API.post('todo/projects/', {
          project_title: projectName,
          description: descToSend

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

  //hanlde add new task 
  const handlAddTask = async (e) => {
    e.preventDefault();
    const formattedDate = taskDue instanceof Date ? taskDue.toISOString().split('T')[0] : taskDue;
    const descToSend = taskContent === '' ? 'Null' : taskContent;
    try {
      if (selectedTask) {
        return
      } else {
        console.log("Fuck:", {
          task_title: taskName,
          task_content: descToSend,
          due_date: formattedDate,
          project: taskProject,
        });

        await API.post('todo/tasks/', {
          task_title: taskName,
          task_content: descToSend,
          due_date: formattedDate,
          project: taskProject
        })
      } 
      closeModal();
      setTaskName('');
      setTaskContent('');
      setTaskDue('');
      setTaskProject('');

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
    setModalType('project');
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
  const handleOpenModal = (type) => {
  const isProject = type.toLowerCase() === 'project';

  setModalType(isProject ? 'project' : 'task');
  if (isProject) {
    setProjectName('');
    setProjectDesc('');
  } else {
    setTaskName('');
    setTaskContent('');
    setTaskDue('');
    setTaskProject('');
  }
  setShowModal(true);
};

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
  fetchTaskData();

  const intervalId = setInterval(() => {
    fetchProjectData();
    fetchTaskData();
  }, 500); // 10 seconds

  return () => clearInterval(intervalId); // clean up on unmount
}, []);


  const findProjectName = (projectId) => {
  console.log('Looking for projectId:', projectId);
  const project = projectData.find(p => p.id === projectId);
  console.log('Found project:', project);
  return project?.project_title || '';
}


  //enrich data
  const enrichData = projectData.map((project) => {
    const progress = Math.round((project.completed / project.tasks) * 100) || 0;
    let status = 'Planning'
    if (progress === 100)
      status = 'Completed'
    if (progress > 0) status = 'In Progress'

    return {
      ...project,
      progress,
      status
    }
  })

  //handle sorting 
  const [sortConfig, setSortConfig] = useState({
    key: 'project_title',
    direction: 'asc'
  })

  //sort logic 
  const sortedProjects = [...enrichData].sort((a, b) => {
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

  //handle filtered 
  const filteredProject = sortedProjects.filter(project =>
    selectedStatuses.length === 0 || selectedStatuses.includes(project.status)
  )


  // --------- Tasks--------//
  //fetch data 
  const fetchTaskData = async () => {
    try {
      const res = await API.get('todo/tasks/');
      setTaskData(res.data)
      console.log("Task data: ", res.data)
    } catch (err) {
      console.error("Fail to fetch data: ", err);
      alert('Failed to fetch data. Please reload page.')
    }
  }

  //handle checkbox 
  const handleCheckbox = async (taskid,isComplete) => {
    try {
      await API.put('todo/tasks/' + taskid + "/", {
        is_completed:isComplete,
      })
    } catch (err) {
      console.error("Error when sending data: ", err)
    }
  }

  //hanlde when having only project 
  useEffect(() => {
    if (projectData.length > 0 && !taskProject) {
      setTaskProject(projectData[0].id);
    }
  }, [projectData, taskProject]); //only run when project or taskproject change 

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
          <div className='actions-control'>
            {/* Left: Add */}
            <div className="left-section">
              <button type="button" className="add-btn" onClick={()=>handleOpenModal("project")}>
                New Project
              </button>
            </div>
            {/* Right: Filter */}
            <div className="right-section">
              <div className="dropdown-container">
                <div
                  className="dropdown-toggle"
                  onClick={() => setShowDropdown(!showDropdown)}
                >
                  Filter by  ▼
                </div>

                {showDropdown && (
                  <div className="filter-dropdown">
                    {STATUS_LIST.map((status) => (
                      <label key={status}>
                        <input
                          type="checkbox"
                          value={status}
                          checked={selectedStatuses.includes(status)}
                          onChange={(e) => {
                            const checked = e.target.checked;
                            if (checked) {
                              setSelectedStatuses([...selectedStatuses, status]);
                            } else {
                              setSelectedStatuses(
                                selectedStatuses.filter((s) => s !== status)
                              );
                            }
                          }}
                        />
                        {status}
                      </label>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
          <table className="projects-table">
            <thead>
              <tr>
                <th onClick={() => handleSort('project_title')} style={{ width: '200px' }}>
                  Project Name{' '}
                  {sortConfig.key === 'project_title' ? (
                    sortConfig.direction === 'asc' ? <FaSortUp /> : <FaSortDown />
                  ) : (
                    <FaSort style={{ opacity: 0.5 }} />
                  )}
                </th>
                <th onClick={() => handleSort('description')} style={{ width: '40%' }}>
                  Description{' '}
                  {sortConfig.key === 'description' ? (
                    sortConfig.direction === 'asc' ? <FaSortUp /> : <FaSortDown />
                  ) : (
                    <FaSort style={{ opacity: 0.5 }} />
                  )}
                </th>
                <th onClick={() => handleSort('tasks')} style={{ width: '10%' }}>
                  Tasks{' '}
                  {sortConfig.key === 'tasks' ? (
                    sortConfig.direction === 'asc' ? <FaSortUp /> : <FaSortDown />
                  ) : (
                    <FaSort style={{ opacity: 0.5 }} />
                  )}
                </th>
                <th style={{ width: '25%' }}>Progress</th>
                <th style={{ width: '15%' }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {filteredProject.map((project) => {
                return (
                  <tr key={project.id}>
                    <td className="project-title" onClick={() => openModal(project.id)}>{project.project_title}</td>
                    <td>{project.description}</td>
                    <td>{project.tasks}</td>
                    <td>
                      <div className="progress-bar-wrapper">
                        <div className="progress-bar" style={{ width: `${project.progress}%` }} />
                      </div>
                    </td>
                    <td>{project.status}</td>
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
            <button type="button" className="add-btn" onClick={()=>handleOpenModal("task")}>
              New Task
            </button>
          </div>

          <table className="tasks-table">
            <thead>
              <tr>
                <th style={{ width: '200px' }}>Task Name</th>
                <th style={{ width: '20%' }}>Project Name</th>
                <th style={{ width: '30%' }}>Task Content</th>
                <th style={{ width: '10%' }}>Created Date</th>
                <th style={{ width: '10%' }}>Due Date</th>
                <th style={{ width: '10%' }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {taskData.map((task) => {
                const checked = task.is_completed === true || task.is_completed === 'true';

                return (
                  <tr key={task.id}>
                    <td>{task.task_title}</td>
                    <td>{findProjectName(task.project)}</td>
                    <td>{task.task_content}</td>
                    <td>{task.date}</td>
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
                        onChange={(e)=>handleCheckbox(task.id,
                                                      e.target.checked)}
                      />
                    </td>
                  </tr>
                );

              })}
            </tbody>
          </table>
        </>
      )}

      {/* show list  */}

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
        <div className="modal">
          {modalType === 'project' && (
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
                  <button type="submit" disabled={!!titleError} >Submit</button>
                  <button type="button" onClick={() => setShowModal(false)}>
                    Cancel
                  </button>
                </div>
              </form>

            </Modal>
          )}
          {/* {modalType === 'Task' &&} */}
          {modalType === 'task' && (
            <Modal onClose={() => setShowModal(false)}>
              <h3>Set new task</h3>
              <form className="form-group" onSubmit={handlAddTask}>
                <div className="task-item name">
                  <label className="form-label" htmlFor="task-name">Task Name</label>
                  <input
                    id='task-name'
                    className="input-item"
                    type="text"
                    value={taskName}
                    onChange={(e) => {
                      setTaskName(e.target.value);
                      const existed = taskData.some((task) => task.task_title.trim().toLowerCase() === e.target.value.trim().toLowerCase());
                      if (existed) {
                        setTitleError('Task title already exists.');
                      } else {
                        setTitleError('');
                      }
                    }}
                    required/>
                    {titleError && <p style={{ fontSize: '16px', color: 'red', marginTop: '0px' }} className="error-text">{titleError}</p>}
                </div>

                <div className="task-project">
                  
                  <label className="form-label" htmlFor="task-project-name">Project</label>
                  <select 
                    id='task-project-name'
                    className="input-item"
                    value={taskProject}
                    onChange={(e) => setTaskProject(Number(e.target.value))}
                    required
                  >
                    {projectData.map((project, index) => (
                      <option key={index} value={project.id}>
                        {project.project_title}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="task-content">
                    <label className="form-label">Description</label>
                    <textarea
                      className="input-item"
                      value={taskContent}
                      onChange={(e) => setTaskContent(e.target.value)}
                    />
                </div>

                <div className="task-duedate">
                  <label className="form-label">Deadline</label>
                  <DatePicker
                    className="input-item"
                    selected={taskDue}
                    onChange={(date) => setTaskDue(date)}
                    dateFormat="yyyy-MM-dd"
                    placeholderText="Select date"
                    // style={{ zIndex: 1000 }}
                    customInput={
                      <input
                        style={{
                          // backgroundColor: 'red',
                          color: 'white',
                          border: '1px solid #fefefea2',
                          borderRadius: '4px',
                          padding: '8px',
                        }}
                      />
                    }
                  />
                </div>

                <div className="actions">
                  <button type="submit" disabled={!!titleError} >Submit</button>
                  <button type="button" onClick={() => setShowModal(false)}>
                    Cancel
                  </button>
                </div>

              </form>
            </Modal>
          )}
        </div>


      )}

    </div>


  );
}