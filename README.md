# Student Placement & Application Tracker

A full-stack web application for students to manage placement preparation, companies, job applications, interviews, and technical skills in one place.

## Features

* Dashboard with placement statistics
* Company management
* Application tracking
* Interview scheduling and tracking
* Technical skill tracking
* Student profile management
* Search and filtering
* Add, edit, and delete records
* Persistent JSON-based storage
* Responsive user interface

## Technologies Used

### Frontend

* HTML5
* CSS3
* JavaScript (ES6+)

### Backend

* Node.js
* Express.js
* CORS

### Storage

* JSON files
* Node.js File System (`fs.promises`)

## Project Structure

```text
Student-Placement-Application-Tracker/
│
├── data/
│   ├── applications.json
│   ├── companies.json
│   ├── interviews.json
│   ├── profile.json
│   └── skills.json
│
├── public/
│   ├── css/
│   │   └── style.css
│   ├── js/
│   │   └── app.js
│   └── index.html
│
├── .gitignore
├── package.json
├── package-lock.json
├── README.md
└── server.js
```

## How to Run

### 1. Install dependencies

```bash
npm install
```

### 2. Start the server

```bash
npm start
```

### 3. Open the application

```text
http://localhost:3000
```

## API Modules

| Module       | Operations                   |
| ------------ | ---------------------------- |
| Companies    | Create, Read, Update, Delete |
| Applications | Create, Read, Update, Delete |
| Interviews   | Create, Read, Update, Delete |
| Skills       | Create, Read, Update, Delete |
| Profile      | Read, Update                 |
| Dashboard    | Statistics                   |

## Purpose

The application helps students organize their placement activities by maintaining company information, job applications, interview schedules, preparation skills, and profile details in a centralized system.

## Future Enhancements

* MySQL or MongoDB database
* Student authentication
* Email notifications
* Placement analytics and charts
* Resume management
* Company-wise application statistics
* Cloud deployment

## Author

Varada Pravalika
