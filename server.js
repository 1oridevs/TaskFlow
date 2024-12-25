const express = require("express");
const fs = require("fs");
const path = require("path");

const app = express();
const PORT = 3000;

// Paths
const tasksFilePath = path.join(__dirname, "data", "tasks.json");

// Middleware
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

// Helper Functions
const readTasksFromFile = () => {
    if (!fs.existsSync(tasksFilePath)) {
        fs.writeFileSync(tasksFilePath, JSON.stringify([])); // Initialize file if not exists
    }
    const data = fs.readFileSync(tasksFilePath, "utf8");
    return JSON.parse(data);
};

const writeTasksToFile = (tasks) => {
    fs.writeFileSync(tasksFilePath, JSON.stringify(tasks, null, 2));
};

// Routes
// GET /api/tasks - Get all tasks
app.get("/api/tasks", (req, res) => {
    const tasks = readTasksFromFile();
    res.json(tasks);
});

// POST /api/tasks - Add a new task
app.post("/api/tasks", (req, res) => {
    const tasks = readTasksFromFile();
    const newTask = req.body;

    if (!newTask.title || !newTask.category) {
        return res.status(400).json({ error: "Task title and category are required." });
    }

    tasks.push(newTask);
    writeTasksToFile(tasks);

    res.status(201).json(newTask);
});

// PATCH /api/tasks/:id - Update a task
app.patch("/api/tasks/:id", (req, res) => {
    const tasks = readTasksFromFile();
    const taskId = parseInt(req.params.id, 10);
    const taskIndex = tasks.findIndex((task) => task.id === taskId);

    if (taskIndex === -1) {
        return res.status(404).json({ error: "Task not found." });
    }

    const updatedTask = { ...tasks[taskIndex], ...req.body };
    tasks[taskIndex] = updatedTask;

    writeTasksToFile(tasks);

    res.json(updatedTask);
});

// DELETE /api/tasks/:id - Delete a task
app.delete("/api/tasks/:id", (req, res) => {
    const tasks = readTasksFromFile();
    const taskId = parseInt(req.params.id, 10);
    const filteredTasks = tasks.filter((task) => task.id !== taskId);

    if (tasks.length === filteredTasks.length) {
        return res.status(404).json({ error: "Task not found." });
    }

    writeTasksToFile(filteredTasks);

    res.status(204).send(); // No content
});

// Start Server
app.listen(PORT, () => {
    console.log(`TaskFlow server running at http://localhost:${PORT}`);
});
