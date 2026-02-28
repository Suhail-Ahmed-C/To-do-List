// Load tasks
let tasks = JSON.parse(localStorage.getItem("tasks")) || [];
let lastDeleted = null;

// Elements
const taskInput = document.getElementById("taskInput");
const category = document.getElementById("category");
const dueDate = document.getElementById("dueDate");
const addBtn = document.getElementById("addTaskBtn");
const taskList = document.getElementById("taskList");
const searchInput = document.getElementById("searchInput");
const taskCounter = document.getElementById("taskCounter");
const progressBar = document.getElementById("progressBar");
const clearCompleted = document.getElementById("clearCompleted");
const themeToggle = document.getElementById("themeToggle");

// Default theme
document.body.classList.add("light");

// Notification permission
if (Notification.permission !== "granted") {
  Notification.requestPermission();
}

// Save & Render
function save() {
  localStorage.setItem("tasks", JSON.stringify(tasks));
  renderTasks(searchInput.value);
}

// Render tasks
function renderTasks(filter = "") {
  taskList.innerHTML = "";

  let filtered = tasks
    .filter(t => t.text.toLowerCase().includes(filter.toLowerCase()))
    .sort((a, b) => b.pinned - a.pinned);

  filtered.forEach((task, index) => {
    const li = document.createElement("li");
    li.className = "list-group-item";
    if (task.completed) li.classList.add("completed");
    if (task.pinned) li.classList.add("pinned");

    const left = document.createElement("div");
    left.innerHTML = `
      <strong>${task.text}</strong>
      <div class="small">${task.category} ${task.dueDate ? "⏰" : ""}</div>
    `;
    left.onclick = () => {
      task.completed = !task.completed;
      save();
    };

    const right = document.createElement("div");

    const pinBtn = document.createElement("button");
    pinBtn.className = "btn btn-sm btn-warning me-1";
    pinBtn.innerText = "⭐";
    pinBtn.onclick = () => {
      task.pinned = !task.pinned;
      save();
    };

    const delBtn = document.createElement("button");
    delBtn.className = "btn btn-sm btn-danger";
    delBtn.innerText = "🗑️";
    delBtn.onclick = () => {
      lastDeleted = tasks.splice(index, 1)[0];
      save();
      showUndo();
    };

    right.append(pinBtn, delBtn);
    li.append(left, right);
    taskList.appendChild(li);
  });

  updateStats();
}

// Add task
addBtn.onclick = () => {
  if (!taskInput.value.trim()) return;

  tasks.push({
    text: taskInput.value,
    category: category.value,
    dueDate: dueDate.value,
    completed: false,
    pinned: false,
    notified: false
  });

  taskInput.value = "";
  dueDate.value = "";
  save();
};

// Search
searchInput.oninput = () => renderTasks(searchInput.value);

// Clear completed
clearCompleted.onclick = () => {
  tasks = tasks.filter(task => !task.completed);
  save();
};

// Stats
function updateStats() {
  const total = tasks.length;
  const done = tasks.filter(t => t.completed).length;

  taskCounter.innerText = `Total: ${total} | Completed: ${done}`;

  const percent = total ? Math.round((done / total) * 100) : 0;
  progressBar.style.width = percent + "%";
  progressBar.innerText = percent + "%";
}

// Undo delete
function showUndo() {
  const alert = document.createElement("div");
  alert.className = "alert alert-warning mt-3";
  alert.innerHTML = `
    Task deleted 
    <button class="btn btn-sm btn-dark ms-2">Undo</button>
  `;

  document.querySelector(".card").append(alert);

  alert.querySelector("button").onclick = () => {
    tasks.push(lastDeleted);
    lastDeleted = null;
    alert.remove();
    save();
  };

  setTimeout(() => alert.remove(), 5000);
}

// Theme toggle
themeToggle.onclick = () => {
  if (document.body.classList.contains("light")) {
    document.body.classList.replace("light", "dark");
    themeToggle.innerText = "☀️";
  } else {
    document.body.classList.replace("dark", "light");
    themeToggle.innerText = "🌙";
  }
};

// Reminder check
setInterval(() => {
  const now = new Date().toISOString().slice(0, 16);

  tasks.forEach(task => {
    if (task.dueDate === now && !task.notified) {
      new Notification("Task Reminder", {
        body: task.text
      });
      task.notified = true;
      save();
    }
  });
}, 60000);

// Init
renderTasks();