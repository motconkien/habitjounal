export const dummyProjects = [
  {
    id: 1,
    title: 'Frontend Refactor',
    description: 'Update React components and CSS',
    tasks: 5,
    completed: 3,
  },
  {
    id: 2,
    title: 'Data Pipeline',
    description: 'Kafka → Spark → PostgreSQL',
    tasks: 8,
    completed: 2,
  },
  {
    id: 3,
    title: 'Documentation',
    description: 'Write internal user guide',
    tasks: 3,
    completed: 0,
  },
  {
    id: 4,
    title: 'Auth Service',
    description: 'Build JWT login and registration',
    tasks: 4,
    completed: 4,
  },
];


export const dummyTasks = [
  {
    id: 1,
    projectId: 1,
    task_title: 'Design login page',
    task_content: 'Create wireframe and layout for login page',
    created: '2025-07-10',
    due_date: '2025-07-15',
    is_completed: 'true',
  },
  {
    id: 2,
    projectId: 1,
    task_title: 'Implement login API',
    task_content: 'Use JWT with Django REST Framework',
    created: '2025-07-11',
    due_date: '2025-07-16',
    is_completed: 'false',
  },
  {
    id: 3,
    projectId: 2,
    task_title: 'Set up Kafka cluster',
    task_content: 'Create Kafka docker container and topic setup script',
    created: '2025-07-08',
    due_date: '2025-07-18',
    is_completed: 'false',
  },
  {
    id: 4,
    projectId: 2,
    task_title: 'Integrate Spark Streaming',
    task_content: 'Consume data from Kafka and write to PostgreSQL',
    created: '2025-07-09',
    due_date: '2025-07-19',
    is_completed: 'false',
  },
  {
    id: 5,
    projectId: 3,
    task_title: 'Write user manual',
    task_content: 'Explain how to run the app and deploy to AWS',
    created: '2025-07-12',
    due_date: '2025-07-21',
    is_completed: 'true',
  },
  {
    id: 6,
    projectId: 1,
    task_title: 'Connect login UI to backend',
    task_content: 'Send user credentials to API and handle token',
    created: '2025-07-13',
    due_date: '2025-07-17',
    is_completed: 'true',
  }
];

