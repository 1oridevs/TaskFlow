// DOM Elements
const taskTitleInput = document.getElementById("task-title");
const taskCategorySelect = document.getElementById("task-category");
const addTaskButton = document.getElementById("add-task");
const tasksList = document.getElementById("tasks");

// Task Array
let tasks = [];

// Fetch tasks from the backend
const fetchTasks = async () => {
    try {
        const response = await fetch("/api/tasks");
        tasks = await response.json();
        renderTasks();
    } catch (error) {
        console.error("Failed to fetch tasks:", error);
    }
};

// Add a new task
const addTask = async () => {
    const title = taskTitleInput.value.trim();
    const category = taskCategorySelect.value;

    if (title === "") {
        alert("Task title cannot be empty!");
        return;
    }

    const newTask = {
        id: Date.now(),
        title,
        category,
        completed: false,
    };

    try {
        const response = await fetch("/api/tasks", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(newTask),
        });

        if (response.ok) {
            tasks.push(newTask);
            renderTasks();
            taskTitleInput.value = ""; // Clear input field
        } else {
            console.error("Failed to add task");
        }
    } catch (error) {
        console.error("Failed to add task:", error);
    }
};

// Render tasks in the DOM
const renderTasks = () => {
    tasksList.innerHTML = "";

    tasks.forEach((task) => {
        const taskItem = document.createElement("li");
        taskItem.className = task.completed ? "completed" : "";
        taskItem.innerHTML = `
            <span>${task.title} (${task.category})</span>
            <div>
                <button class="complete-task">${task.completed ? "Undo" : "Complete"}</button>
                <button class="delete-task">Delete</button>
            </div>
        `;

        // Mark task as complete/incomplete
        taskItem.querySelector(".complete-task").addEventListener("click", async () => {
            task.completed = !task.completed;
            try {
                const response = await fetch(`/api/tasks/${task.id}`, {
                    method: "PATCH",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({ completed: task.completed }),
                });

                if (response.ok) {
                    renderTasks();
                } else {
                    console.error("Failed to update task");
                }
            } catch (error) {
                console.error("Failed to update task:", error);
            }
        });

        // Delete task
        taskItem.querySelector(".delete-task").addEventListener("click", async () => {
            try {
                const response = await fetch(`/api/tasks/${task.id}`, {
                    method: "DELETE",
                });

                if (response.ok) {
                    tasks = tasks.filter((t) => t.id !== task.id);
                    renderTasks();
                } else {
                    console.error("Failed to delete task");
                }
            } catch (error) {
                console.error("Failed to delete task:", error);
            }
        });

        tasksList.appendChild(taskItem);
    });
};

// Event Listeners
addTaskButton.addEventListener("click", addTask);

// Initial Fetch
fetchTasks();
