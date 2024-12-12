function popup() {
    const popupContainer = document.createElement("div");
    popupContainer.innerHTML = `
    <div id="popupContainer">
        <h1>New Note</h1>
        <textarea id="note-text" placeholder="Enter your note..."></textarea>
        <div id="btn-container">
            <button id="submitButton" onclick="createNote()">Create Note</button>
            <button id="closeButton" onclick="closePopup()">Close</button>
        </div>
    </div>
    `;
    document.body.appendChild(popupContainer);
}

function closePopup() {
    const popupContainer = document.getElementById("popupContainer");
    if(popupContainer) {
        popupContainer.remove();
    }
}

function createNote() {
    const popupContainer = document.getElementById('popupContainer');
    const noteText = document.getElementById('note-text').value;
    // If the note isn't empty, create new note object where timestamp is ID
    if (noteText.trim() !== '') {
        const note = {
            id: new Date().getTime(),
            text: noteText
        };

        // Find notes from existing storage or create one with empty array
        const existingNotes = JSON.parse(localStorage.getItem('notes')) || [];
        existingNotes.push(note);

        localStorage.setItem('notes', JSON.stringify(existingNotes));

        document.getElementById('note-text').value = '';

        popupContainer.remove();
        displayNotes();
    }
}

function displayNotes() {
    const notesList = document.getElementById('notes-list');
    notesList.innerHTML = '';

    const notes = JSON.parse(localStorage.getItem('notes')) || [];

    notes.forEach(note => {
        const listItem = document.createElement('li');
        listItem.innerHTML = `
        <span>${note.text}</span>
        <div id="noteButtons-container">
            <button id="editButton" onclick="editNote(${note.id})">
                <i class="fa-solid fa-pen"></i>
            </button>
            <button id="deleteButton" onclick="deleteNote(${note.id})">
                <i class="fa-solid fa-trash"></i>
            </button>
        </div>
        `;
        notesList.appendChild(listItem);
    });
}

function editNote(noteId) {
    const notes = JSON.parse(localStorage.getItem('notes')) || [];
    const noteToEdit = notes.find(note => note.id == noteId);
    const noteText = noteToEdit ? noteToEdit.text : '';
    const editingPopup = document.createElement("div");

    editingPopup.innerHTML = `
    <div id="editing-container" data-note-id="${noteId}">
        <h1>Edit Note</h1>
        <textarea id="note-text">${noteText}</textarea>
        <div id="btn-container">
            <button id="submitButton" onclick="updateNote()">Done</button>
            <button id="closeButton" onclick="closeEditPopup()">Cancel</button>
        </div>
    </div>
    `;

    document.body.appendChild(editingPopup);
}

function closeEditPopup() {
    const editingPopup = document.getElementById("editing-container");
    
    if(editingPopup) {
        editingPopup.remove();
    }
}

function updateNote() {
    const noteText = document.getElementById('note-text').value.trim();
    const editingPopup = document.getElementById('editing-container');

    if (noteText != '') {
        const noteId = editingPopup.getAttribute('data-note-id');
        let notes = JSON.parse(localStorage.getItem('notes')) || [];

        // Find the note to update
        const updateNotes = notes.map(note => {
            if (note.id == noteId) {
                return { id: note.id, text: noteText };
            }
            return note;
        });

        // Update the notes in the local storage
        localStorage.setItem('notes', JSON.stringify(updateNotes));
        
        // Close the editing popup
        editingPopup.remove();

        // Refresh the displayed notes
        displayNotes();
    }
}
function updateClockAndDate() {
    const dateElement = document.getElementById('date');
    const timeElement = document.getElementById('time');
        
    const now = new Date();
    let hours = now.getHours();
    let minutes = now.getMinutes();
    let seconds = now.getSeconds();

    hours = hours < 10 ? '0' + hours : hours;
    minutes = minutes < 10 ? '0' + minutes : minutes;
    seconds = seconds < 10 ? '0' + seconds : seconds;
    if (hours-12 < 0) {
        AM_or_PM = "AM"
    } else {
        AM_or_PM = "PM"
    }
    const timeString = `${Math.abs(hours-12)}:${minutes}:${seconds} ${AM_or_PM}`;

    const optionsDate = { year: 'numeric', month: 'short', day: 'numeric' };
    dateElement.textContent = now.toLocaleDateString('en-US', optionsDate);

    document.getElementById('clock').textContent = timeString;
        
    // const optionsTime = { hour: 'numeric', minute: '2-digit', hour12: true, timeZone: 'America/Los_Angeles' };
    // timeElement.textContent = now.toLocaleTimeString('en-US', optionsTime);
}


const apiKey = "621b05ea8a274b15ac234928240712";
const lat = 33.69;
const long = -117.83;

async function getWeather() {
    const url = `http://api.weatherapi.com/v1/current.json?key=${apiKey}&q=${lat},${long}`;
    try {
        const response = await fetch(url);
        const info = await response.json();

        if (info.error) {
            console.error("Couldn't fetch weather", info.error.message);
        } else {
            const temp = (info.current.temp_c) * (9/5) + 32;
            const city = info.location.name;

            document.getElementById('weather-temp').innerText = `Outside: ${Math.round(temp)}°F`;
            document.getElementById('weather-location').innerText = `City: ${city}`;
        }
    } catch (error) {
        console.error("Error, couldn't retrieve data: ", error)
    }
}


function deleteNote(noteId) {
    let notes = JSON.parse(localStorage.getItem('notes')) || [];
    notes = notes.filter(note => note.id !== noteId);

    localStorage.setItem('notes', JSON.stringify(notes));
    displayNotes();
}

function displayToDoCalendar() {
    document.addEventListener('DOMContentLoaded', function() {
        const calendarElement = document.getElementById('calendar');
        const todoList = document.getElementById('todoList');

        const calendar = new FullCalendar.Calendar(calendarElement, {
            initialView: 'dayGridMonth',
            events: JSON.parse(localStorage.getItem('calendarEvents')) || []
        });
        calendar.render();

        // Load To-Do List from localStorage
        const savedTasks = JSON.parse(localStorage.getItem('todoTasks')) || [];
        savedTasks.forEach(task => {
            addTaskToDOM(task);
        });

        document.getElementById('addTask').addEventListener('click', function() {
            const eventTitle = document.getElementById('eventTitle').value;
            const startTime = document.getElementById('startTime').value;
            const endTime = document.getElementById('endTime').value;

            if (!eventTitle || !startTime || !endTime) {
                alert('Please fill out all fields.');
                return;
            }

            const eventId = new Date().getTime();
            const newTask = {
                id: eventId,
                title: eventTitle,
                start: startTime,
                end: endTime
            };

            // Add to calendar
            calendar.addEvent(newTask);

            // Save to localStorage
            const existingTasks = JSON.parse(localStorage.getItem('todoTasks')) || [];
            existingTasks.push(newTask);
            localStorage.setItem('todoTasks', JSON.stringify(existingTasks));

            const existingEvents = JSON.parse(localStorage.getItem('calendarEvents')) || [];
            existingEvents.push(newTask);
            localStorage.setItem('calendarEvents', JSON.stringify(existingEvents));

            addTaskToDOM(newTask);

            // Clear input fields
            document.getElementById('eventTitle').value = '';
            document.getElementById('startTime').value = '';
            document.getElementById('endTime').value = '';
        });

        function addTaskToDOM(task) {
            const todoItem = document.createElement('div');
            todoItem.classList.add('todo-item');
            todoItem.setAttribute('data-id', task.id);

            const titleElement = document.createElement('h3');
            titleElement.textContent = task.title;

            const startElement = document.createElement('p');
            startElement.textContent = `Starts: ${new Date(task.start).toLocaleString()}`;

            const endElement = document.createElement('p');
            endElement.textContent = `Ends: ${new Date(task.end).toLocaleString()}`;

            const deleteButton = document.createElement('button');
            deleteButton.textContent = 'Delete';
            deleteButton.addEventListener('click', function() {
                todoList.removeChild(todoItem);

                // Update localStorage
                let tasks = JSON.parse(localStorage.getItem('todoTasks')) || [];
                tasks = tasks.filter(t => t.id !== task.id);
                localStorage.setItem('todoTasks', JSON.stringify(tasks));

                let events = JSON.parse(localStorage.getItem('calendarEvents')) || [];
                events = events.filter(e => e.id !== task.id);
                localStorage.setItem('calendarEvents', JSON.stringify(events));

                // Remove from calendar
                calendar.getEventById(task.id)?.remove();
            });

            todoItem.appendChild(titleElement);
            todoItem.appendChild(startElement);
            todoItem.appendChild(endElement);
            todoItem.appendChild(deleteButton);
            todoList.appendChild(todoItem);
        }
    });
}

displayToDoCalendar();
displayNotes();
updateClockAndDate();
setInterval(updateClockAndDate, 1000);   
getWeather();

// setInterval(getWeather, 100000); 
