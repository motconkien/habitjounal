import { useState, useEffect, useMemo } from "react";
import Modal from "../components/Modal";
import { FaTimes, FaEdit, FaTrash } from "react-icons/fa";
import API from "../api";
import Checkbox from '@mui/material/Checkbox';
import { FaSortUp, FaSortDown, FaSort } from 'react-icons/fa';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { FaCalendarCheck } from "react-icons/fa";
import { IoIosCloseCircle } from "react-icons/io";


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
  // const [selectedStatuses, setSelectedStatuses] = useState([]);
  const STATUS_LIST = ['Planning', 'In Progress', 'Completed'];
  const [showDropdown, setShowDropdown] = useState(false);
  const [modalType, setModalType] = useState(null);
  const STATUS_TASK_LIST = ['Completed', 'Incompleted'];
  const [taskSelectedStatuses, setTaskSelectedStatuses] = useState([]);
  const [projectSelectedStatuses, setProjectSelectedStatuses] = useState([]);
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [filterTasks, setFilterTasks] = useState([]);




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
      setProjectName('');
      setProjectDesc('');
      setTitleError('');
      closeModal('project');
    } catch (err) {
      console.error("Request failed:", err);
      alert("Something went wrong. Try again.");
    }
  }

  //hanlde add new task 
  const handlAddTask = async (e) => {
    e.preventDefault();
    const formattedDate = taskDue instanceof Date ? taskDue.toLocaleDateString('en-CA') // "YYYY-MM-DD" in most browsers
    : taskDue;

    const descToSend = taskContent === '' ? 'Null' : taskContent;
    try {
      if (selectedTask) {
        await API.put('todo/tasks/' + selectedTask.id + "/", {
          task_title: taskName,
          task_content: descToSend,
          due_date: formattedDate,
          is_completed: selectedTask.is_completed
        })
      } else {

        await API.post('todo/tasks/', {
          task_title: taskName,
          task_content: descToSend,
          due_date: formattedDate,
          project: taskProject
        })
      }
      closeModal('task');
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
  const handleEdit = (type, data) => {
    // console.log("Edit data: ", JSON.stringify(data))
    if (type.trim().toLowerCase() === 'project') {
      setProjectName(data.project_title);
      setProjectDesc(data.description);
      setSelectedProject(data);
      setShowModal(true);
      setModalType('project');
    }
    if (type.trim().toLowerCase() === 'task') {
      setTaskName(data.task_title);
      setTaskContent(data.task_content);
      setTaskProject(findProjectName(data.project));
      setTaskDue(data.due_date);
      setShowModal(true);
      setModalType('task');
    }

  }

  //handle delete projects
  const handleProject = async (projectId) => {
    try {
      const res = await API.get('todo/projects/' + projectId + "/");
      setSelectedProject(true);
      return res;

    } catch (err) {
      console.error("Failed to get project: ", err);

      alert('Failed to get project data')
    }
  }

  const handleTask = async (taskid) => {
    try {
      const res = await API.get('todo/tasks/' + taskid + "/");
      setSelectedTask(true)
      return res
    } catch (err) {
      console.error("Failed to get task: ", err);

      alert('Failed to get task data')
    }
  }
  const openModal = async (type, id) => {
    let res;
    try {
      setModalType(type);

      if (type === 'project') {
        res = await handleProject(id);
        setSelectedProject(res.data);
      } else if (type === 'task') {
        res = await handleTask(id);
        setSelectedTask(res.data);
      }

      // console.log("Open modal: ", type, "     ", res.data);

      // setShowModal(true);
    } catch (err) {
      console.error('Failed to open modal:', err);
    }
  };


  //close model
  const closeModal = (type) => {
    if (type === 'project') {
      setSelectedProject(null);
      setShowModal(false);
    }
    else if (type === 'task') {
      setSelectedTask(null);
      setShowModal(false)
    }
  }

  const handleDelete = async (type, id) => {
    try {
      if (type === 'projects') {
        await API.delete('todo/projects/' + id + '/');
        setSelectedProject(null);
      } else if (type === 'tasks') {
        await API.delete('todo/tasks/' + id + '/');
        setSelectedTask(null)
      }
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
    // console.log('Looking for projectId:', projectId);
    const project = projectData.find(p => p.id === projectId);
    // console.log('Found project:', project);
    return project?.project_title || '';
  }


  //enrich data
  const enrichData = projectData.map((project) => {
    const progress = Math.round((project.completed / project.tasks) * 100) || 0;
    let status = 'Planning'
    if (progress === 100)
      status = 'Completed'
    else if (progress > 0) status = 'In Progress'

    return {
      ...project,
      progress,
      status
    }
  })
  // console.log("Enrich data: ", enrichData);

  //handle sorting 
  const [sortConfig, setSortConfig] = useState({
    key: 'project_title',
    direction: 'asc'
  })

  //sort logic for the tasks and projects => combine
  const sortByConfig = (data, sortConfig) => {
    return [...data].sort((a, b) => {
      const { key, direction } = sortConfig;
      const aVal = a[key]?.toString().toLowerCase();
      const bVal = b[key]?.toString().toLowerCase();

      if (aVal < bVal) return direction === 'asc' ? -1 : 1;
      if (aVal > bVal) return direction === 'asc' ? 1 : -1;
      return 0;
    });
  };


  const sortedProjects = sortByConfig(enrichData, sortConfig);
  const sortedTasks = sortByConfig(taskData, sortConfig);


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
  const selectedStatuses = activeTab === 'tasks' ? taskSelectedStatuses : projectSelectedStatuses;
  const setSelectedStatuses = activeTab === 'tasks' ? setTaskSelectedStatuses : setProjectSelectedStatuses;

  const filteredProject = sortedProjects.filter(project =>
    selectedStatuses.length === 0 || selectedStatuses.includes(project.status)
  )

  // filteredData 
  // const filteredDate = useMemo(() => {
  //   const base = activeTab === 'tasks' ? sortedTasks : filteredProject;
  //   console.log("base: ", base)
  //   if (!startDate || !endDate || activeTab !== "tasks") return base;
  //   const start = new Date(startDate).setHours(0, 0, 0, 0);
  //   const end = new Date(endDate).setHours(0, 0, 0, 0);
  //   console.log("base: ", base);

  //   return base.filter(task => {
  //     const due = new Date(task.due_date).setHours(0, 0, 0, 0);
  //     return due >= start && due <= end;
  //   });
  // }, [activeTab, sortedTasks,filteredProject, startDate, endDate])
  // // console.log("filtertaks: ", JSON.stringify(sortedTasks))

  // const filteredData = filteredDate.filter((task) => {
  //   //get status, maybe true or 'true' come from backend 
  //   const isCompleted = task.is_completed === true || task.is_completed === 'true';
  //   const isIncompleted = task.is_completed === false || task.is_completed === 'false';

  //   // filter in an array
  //   const showCompleted = selectedStatuses.includes('Completed');
  //   const showIncompleted = selectedStatuses.includes('Incompleted');

  //   if (selectedStatuses.length === 0) return true; // No filters → show all

  //   if (showCompleted && isCompleted) return true;
  //   if (showIncompleted && isIncompleted) return true;

  //   return false;
  // });
  const filteredData = useMemo(() => {
  const base = activeTab === 'tasks' ? sortedTasks : filteredProject;

  return base.filter(task => {
    // Date filtering
    if (activeTab === 'tasks' && startDate && endDate) {
      const start = new Date(startDate).setHours(0, 0, 0, 0);
      const end = new Date(endDate).setHours(0, 0, 0, 0);
      const due = new Date(task.due_date).setHours(0, 0, 0, 0);
      if (due < start || due > end) return false;
    }

    // Status filtering
    if (activeTab === 'tasks') {
      const isCompleted = task.is_completed === true || task.is_completed === 'true';
      const isIncompleted = task.is_completed === false || task.is_completed === 'false';

      const showCompleted = selectedStatuses.includes('Completed');
      const showIncompleted = selectedStatuses.includes('Incompleted');

      if (selectedStatuses.length === 0) return true;
      if (showCompleted && isCompleted) return true;
      if (showIncompleted && isIncompleted) return true;

      return false;
    }
    return true;
  });
}, [activeTab, sortedTasks, filteredProject, startDate, endDate, selectedStatuses]);

  // --------- Tasks--------//
  //fetch data 
  const fetchTaskData = async () => {
    try {
      const res = await API.get('todo/tasks/');
      setTaskData(res.data)
      // console.log("Task data: ", res.data)
    } catch (err) {
      console.error("Fail to fetch data: ", err);
      alert('Failed to fetch data. Please reload page.')
    }
  }

  //handle checkbox 
  const handleCheckbox = async (taskid, isComplete, task_title, due_date) => {

    try {
      await API.put('todo/tasks/' + taskid + "/", {
        task_title: task_title,
        due_date: due_date,
        is_completed: isComplete,
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


  //render sort icon 
  const renderSortIcon = (key) => {
    if (sortConfig.key === key) {
      return sortConfig.direction === 'asc' ? <FaSortUp /> : <FaSortDown />
    } else {
      return <FaSort style={{ opacity: 0.5 }} />
    }
  }

  const clearDate = () => {
    setStartDate(null);
    setEndDate(null)
  }

  return (
    <div className="todo-page">
      <div className="sticky-container">
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
          <div className='actions-control'>
            {/* Left: Add */}
            <div className="left-section">
              <button type="button" className="add-btn" onClick={() => handleOpenModal("project")}>
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
                  {selectedStatuses.length === 0 ? "Filter Status ▼" : "Filtered ▼"}
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
        )}

        {activeTab === 'tasks' && (
          <div className="actions-control">
            <div className="left-section">
              <button
                type="button"
                className="add-btn"
                onClick={() => handleOpenModal("task")}
              >
                New Task
              </button>
            </div>

            <div className="right-section">
              <div className="datepicker">
                <FaCalendarCheck size={24} style={{ color: "#cda7d2" }} />
                <DatePicker
                  className="datepicker-input"
                  selectsRange
                  startDate={startDate}
                  endDate={endDate}
                  onChange={(dates) => {
                    const [start, end] = dates;
                    setStartDate(start || null);
                    setEndDate(end || null);
                  }}
                  isClearable={false}
                  dateFormat="yyyy/MM/dd"
                  placeholderText="Select date range"
                />
                {(startDate || endDate) && (

                  <IoIosCloseCircle onClick={clearDate} size={26} style={{ color: "#cda7d2" }} />

                )}
              </div>
              <div className="dropdown-container">
                <div
                  className="dropdown-toggle"
                  onClick={() => setShowDropdown(!showDropdown)}
                >
                  {/* Filter Status ▼ */}
                  {selectedStatuses.length === 0 ? "Filter Status ▼" : "Filtered ▼"}
                </div>

                {showDropdown && (
                  <div className="filter-dropdown">
                    {STATUS_TASK_LIST.map((status) => (
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
        )}
      </div>
      {activeTab === 'projects' && (
        <>
          <div className="table-container">
            <table className="projects-table">
              <thead>
                <tr>
                  <th onClick={() => handleSort('project_title')} style={{ width: '200px' }}>
                    Project Name {renderSortIcon('project_title')}
                  </th>
                  <th onClick={() => handleSort('description')} style={{ width: '40%' }}>
                    Description {renderSortIcon('description')}
                  </th>
                  <th onClick={() => handleSort('tasks')} style={{ width: '10%' }}>
                    Tasks {renderSortIcon('task')}
                  </th>
                  <th style={{ width: '25%' }}>Progress</th>
                  <th style={{ width: '15%' }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredData.map((project) => {
                  return (
                    <tr key={project.id}>
                      <td className="project-title" onClick={() => openModal('project', project.id)}>{project.project_title}</td>
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
          </div>
        </>
      )}

      {activeTab === 'tasks' && (
        <>
          <div className="table-container">
            <table className="tasks-table">
              <thead>
                <tr>
                  <th onClick={() => handleSort('task_title')} style={{ width: '220px' }}>
                    Task Name {renderSortIcon('task_title')}
                  </th>
                  <th onClick={() => handleSort('project')} style={{ width: '15%' }}>
                    Project Name {renderSortIcon('project')}
                  </th>
                  <th onClick={() => handleSort('task_content')} style={{ width: '35%' }}>
                    Task Content {renderSortIcon('task_content')}
                  </th>
                  <th onClick={() => handleSort('date')} style={{ width: '10%' }}>
                    Created Date {renderSortIcon('date')}
                  </th>
                  <th onClick={() => handleSort('due_date')} style={{ width: '10%' }}>
                    Due Date {renderSortIcon('due_date')}
                  </th>
                  <th onClick={() => handleSort('is_completed')} style={{ width: '10%' }}>
                    Status {renderSortIcon('is_completed')}
                  </th>
                </tr>
              </thead>

              <tbody>
                {filteredData.map((task) => {
                  const checked = task.is_completed === true || task.is_completed === 'true';

                  return (
                    <tr key={task.id}>
                      <td className="task-title" onClick={() => openModal('task', task.id)}>
                        {task.task_title}
                      </td>
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
                          onChange={(e) =>
                            handleCheckbox(
                              task.id,
                              e.target.checked,
                              task.task_title,
                              task.due_date
                            )
                          }
                        />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

        </>
      )}


      {/* show list  */}

      {selectedProject && (
        <Modal onClose={() => closeModal('project')}>
          <div className="modal-header">
            <h2>{selectedProject.project_title}</h2>
            <FaTimes size={24} className="close-button" onClick={() => closeModal('project')} />
          </div>
          <p>{selectedProject.description == '' ? 'Null' : selectedProject.description}</p>
          <p>Total Tasks: <em>{selectedProject.tasks}</em></p>
          <p>Completed tasks: <em>{selectedProject.completed}</em></p>
          <div className="actions">
            <button onClick={() => handleEdit('project', selectedProject)}>
              <FaEdit style={{ marginRight: 8 }} />
              Edit
            </button>
            <button onClick={() => handleDelete('projects', selectedProject.id)}>
              <FaTrash style={{ marginRight: 8 }} />
              Delete
            </button>
          </div>

        </Modal>
      )}

      {selectedTask && (
        <Modal onClose={() => closeModal('task')}>
          <div className="modal-header">
            <h2>{selectedTask.task_title}</h2>
            <FaTimes size={24} className="close-button" onClick={() => closeModal('task')} />
          </div>
          <p>{findProjectName(selectedTask.project)}</p>
          <p>{selectedTask.task_content == '' ? 'Null' : selectedTask.task_content}</p>
          <p>Due date: <em>{selectedTask.due_date}</em></p>
          <div className="actions">
            <button onClick={() => handleEdit('task', selectedTask)}>
              <FaEdit style={{ marginRight: 8 }} />
              Edit
            </button>
            <button onClick={() => handleDelete('tasks', selectedTask.id)}>
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
                    required />
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