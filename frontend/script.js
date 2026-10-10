console.log("FOCUSFLOW SCRIPT LOADED");

let currentMode = "focus";
let timeLeft = 5;
let timer = null;


function startTimer() {

    if (timer !== null) {
        return;
    }

    timer = setInterval(function () {

        timeLeft--;

        updateDisplay();

        if (timeLeft === 0) {

            clearInterval(timer);
            timer = null;

            alert("Session complete! 🎉");

            sendSessionToBackend();
        }

    }, 1000);
}


function pauseTimer() {

    clearInterval(timer);
    timer = null;
}


function resetTimer() {

    clearInterval(timer);
    timer = null;

    if (currentMode === "focus") {
        timeLeft = 25 * 60;
    } else {
        timeLeft = 5 * 60;
    }

    updateDisplay();
}


function setFocus() {

    clearInterval(timer);
    timer = null;

    currentMode = "focus";

    timeLeft = 25 * 60;

    updateDisplay();
}


function setBreak() {

    clearInterval(timer);
    timer = null;

    currentMode = "break";

    timeLeft = 5 * 60;

    updateDisplay();
}


function updateDisplay() {

    let minutes = Math.floor(timeLeft / 60);
    let seconds = timeLeft % 60;

    document.getElementById("timer").textContent =
        `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
}


function sendSessionToBackend() {

    console.log("Sending session to backend...");

    fetch("http://127.0.0.1:5000/api/session", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            duration: currentMode === "focus" ? 25 : 5,
            session_type: currentMode
        })
    })
    .then(response => {
        console.log("Response status:", response.status);
        return response.json();
    })
    .then(data => {
        console.log("Backend response:", data);
    })
    .catch(error => {
        console.error("Backend error:", error);
    });
}


// TASK FUNCTION

function addTask() {

    console.log("ADD TASK BUTTON CLICKED");

    let title = document.getElementById("taskInput").value;

    console.log("Task:", title);

    let userId = localStorage.getItem("user_id");

    console.log("User ID:", userId);

    if (title.trim() === "") {
        alert("Please enter a task.");
        return;
    }

    if (!userId) {
        alert("Please login first.");
        return;
    }

    fetch("http://127.0.0.1:5000/api/tasks", {

        method: "POST",

        headers: {
            "Content-Type": "application/json"
        },

        body: JSON.stringify({
            user_id: userId,
            title: title
        })

    })
    .then(response => response.json())

    .then(data => {

        console.log("Backend response:", data);

        document.getElementById("taskInput").value = "";

        loadTasks();

    })

    .catch(error => {

        console.error("Task error:", error);

    });
}


// LOAD TASKS

function loadTasks() {

    let userId = localStorage.getItem("user_id");

    if (!userId) {
        return;
    }

    fetch(`http://127.0.0.1:5000/api/tasks/${userId}`)

    .then(response => response.json())

    .then(tasks => {

        let taskList = document.getElementById("taskList");

        taskList.innerHTML = "";

        tasks.forEach(task => {

            let taskElement = document.createElement("div");

            let checkbox = document.createElement("input");
            checkbox.type = "checkbox";
            checkbox.checked = task.completed;

            checkbox.addEventListener("change", function () {

                if (checkbox.checked) {

                    fetch(`http://127.0.0.1:5000/api/tasks/${task.id}`, {
                        method: "PUT"
                    })
                    .then(response => response.json())
                    .then(data => {
                        console.log(data);
                        loadTasks();
                    })
                    .catch(error => {
                        console.error("Error completing task:", error);
                    });

                }

            });

            let label = document.createElement("span");
            label.textContent = " " + task.title;

            if (task.completed) {
                label.style.textDecoration = "line-through";
            }

            taskElement.appendChild(checkbox);
            taskElement.appendChild(label);

            taskList.appendChild(taskElement);

        });

    })

    .catch(error => {

        console.error("Error loading tasks:", error);

    });
}
loadTasks();


function loadStats() {
    let userId = localStorage.getItem("user_id");

    if (!userId) {
        return;
    }

    fetch(`http://127.0.0.1:5000/api/stats/${userId}`)
        .then(response => response.json())
        .then(data => {
            // Update dashboard statistics
            document.getElementById("totalSessions").textContent =
                data.total_sessions;

            document.getElementById("totalMinutes").textContent =
                data.total_minutes;

            document.getElementById("completedTasks").textContent =
                data.completed_tasks;

            document.getElementById("pendingTasks").textContent =
                data.pending_tasks;

            // Update achievement message
            const achievementMessage =
                document.getElementById("achievementMessage");

            if (achievementMessage) {
                if (data.total_sessions >= 1) {
                    achievementMessage.textContent =
                        "🏆 First Focus unlocked! You've completed your first Pomodoro.";
                } else {
                    achievementMessage.textContent =
                        "Complete your first focus session to unlock your achievement!";
                }
            }
        })
        .catch(error => {
            console.error("Error loading stats:", error);
        });
}

loadStats();
