# habitjournal
# Django Backend Server

This is the backend server built with the Django framework. It provides a RESTful API to support frontend applications.
---

## 🚀 Features

- User authentication (register, login, logout)
- CRUD operations for models (e.g., Projects, Tasks, Habits, Todos, etc.)
- Token-based authentication (e.g., JWT or Django session)
- API ready for frontend integration (React, Vue, etc.)

---

## 🛠 Tech Stack

- **Framework**: Django
- **Language**: Python 3.8+
- **Database**: SQLite / PostgreSQL
- **API**: Django REST Framework (DRF)
- **Authentication**: Django Auth / JWT (optional)
- **Environment Management**: `venv`

---
## 📁 Backend forder Structure

```bash
habit-journal-backend/
├── manage.py
├── requirements.txt
├── .env
├── db.sqlite3
├── config/
│   ├── __init__.py
│   ├── asgi.py
│   ├── settings.py
│   ├── urls.py
│   └── wsgi.py
├──  habit/
│──  journal/
│──  quotes/
│──  todo/   
│──  user/ 
│──  requirements/ 
```