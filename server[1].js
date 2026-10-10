
const express = require("express");
const fs = require("fs");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;

const tasksFile = path.join(__dirname, "tasks.json");

app.use(express.json());
app.use(express.static(__dirname));

function getTasks() {
  try {
    if (!fs.existsSync(tasksFile)) {
      fs.writeFileSync(tasksFile, "[]");
    }

    return JSON.parse(fs.readFileSync(tasksFile, "utf8"));
  } catch (error) {
    console.error("Read error:", error);
    return [];
  }
}

function saveTasks(tasks) {
  fs.writeFileSync(tasksFile, JSON.stringify(tasks, null, 2));
}

// Test the server
app.get("/api/health", (req, res) => {
  res.json({ status: "Server is working!" });
});

// Get all tasks
app.get("/api/tasks", (req, res) => {
  res.json(getTasks());
});

// Add a task
app.post("/api/tasks", (req, res) => {
  const title = req.body.title?.trim();

  if (!title) {
    return res.status(400).json({
      error: "Please enter a task"
    });
  }

  const tasks = getTasks();

  const newTask = {
    id: Date.now().toString(),
    title: title,
    completed: false
  };

  tasks.push(newTask);
  saveTasks(tasks);

  res.status(201).json(newTask);
});

// Complete or undo a task
app.patch("/api/tasks/:id", (req, res) => {
  const tasks = getTasks();
  const task = tasks.find(t => t.id === req.params.id);

  if (!task) {
    return res.status(404).json({
      error: "Task not found"
    });
  }

  task.completed = !task.completed;
  saveTasks(tasks);

  res.json(task);
});

// Delete a task
app.delete("/api/tasks/:id", (req, res) => {
  const tasks = getTasks();
  const updatedTasks = tasks.filter(
    t => t.id !== req.params.id
  );

  if (updatedTasks.length === tasks.length) {
    return res.status(404).json({
      error: "Task not found"
    });
  }

  saveTasks(updatedTasks);

  res.json({ message: "Task deleted successfully" });
});

// Start server
app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on port ${PORT}`);
});

