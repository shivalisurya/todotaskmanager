
const API = "api/tasks";

const form = document.getElementById("taskForm");
const input = document.getElementById("taskInput");
const list = document.getElementById("taskList");
const count = document.getElementById("taskCount");
const message = document.getElementById("message");

let tasks = [];
let filter = "all";

async function request(url, options = {}) {
  const response = await fetch(url, options);
  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || "Request failed");
  }

  return data;
}

async function loadTasks() {
  try {
    tasks = await request(API);
    message.textContent = "";
    renderTasks();
  } catch (error) {
    message.textContent = "Unable to load tasks: " + error.message;
  }
}

function renderTasks() {
  list.replaceChildren();

  const visibleTasks = tasks.filter(task => {
    if (filter === "active") return !task.completed;
    if (filter === "completed") return task.completed;
    return true;
  });

  count.textContent =
    `${tasks.filter(t => !t.completed).length} pending / ${tasks.length} total`;

  visibleTasks.forEach(task => {
    const li = document.createElement("li");
    const text = document.createElement("span");
    const complete = document.createElement("button");
    const del = document.createElement("button");

    text.textContent = task.title;

    if (task.completed) text.classList.add("done");

    complete.textContent = task.completed ? "Undo" : "Complete";
    complete.className = "complete";
    complete.onclick = () => updateTask(task.id);

    del.textContent = "Delete";
    del.onclick = () => deleteTask(task.id);

    li.append(text, complete, del);
    list.appendChild(li);
  });
}

form.addEventListener("submit", async event => {
  event.preventDefault();
  message.textContent = "";

  try {
    await request(API, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: input.value })
    });

    input.value = "";
    await loadTasks();
  } catch (error) {
    message.textContent = error.message;
  }
});

async function updateTask(id) {
  try {
    await request(`${API}/${id}`, { method: "PATCH" });
    await loadTasks();
  } catch (error) {
    message.textContent = error.message;
  }
}

async function deleteTask(id) {
  try {
    await request(`${API}/${id}`, { method: "DELETE" });
    await loadTasks();
  } catch (error) {
    message.textContent = error.message;
  }
}

document.querySelectorAll("[data-filter]").forEach(button => {
  button.addEventListener("click", () => {
    filter = button.dataset.filter;
    renderTasks();
  });
});

loadTasks();

