# Personal Productivity App

A personal productivity app to help manage **journals**, **todos**, **habits**, and visualize progress with a **dashboard**.
Responsive website!!!
---

## Features

### Habit Page
- Create, edit, delete habits
- Daily habit tracking with data visualization
- View habit progress over time

### Todo
- Two tabs: **Projects** and **Tasks**
- Full CRUD (Create, Read, Update, Delete) functionality
- Filter and sort tasks by day and other criteria
- Progress overtime 

### Journal
- Full CRUD for journal entries
- Currently building mood tracking and statistics feature
- Journal card sorted by date

### Dashboard
- Visualize overall productivity and habit stats
- Show coming and track tasks directly
- Including the quote and temperater and weather
<em>Note: because of free API, quote and temperature are updated once per day</em>

---

## Backend API

- REST API built with **Django REST Framework**
- Quotes API: [https://zenquotes.io/api/today](https://zenquotes.io/api/today)
- API documentation created using **Swagger**
<em>Note: To go through the CORS of zenquotes: call it in Django and create API quotes </em>
---

## Deployment
- Vercel (free tier)
- Render (free tier)

---


## Getting Started

### Installation

```bash
# Clone the repository
git clone https://github.com/motconkien/habitjounal

# Backend setup
cd personalapp/habit-journal-backend
python manage.py runserver 0.0.0.0:8000

# Frontend setup
cd ../habit-journal-frontend
npm start
```
---

## Contributing

Contributions are welcome! Feel free to open issues or submit pull requests.



