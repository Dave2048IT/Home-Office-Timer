let userName = '';
let reminderTimeout = null;
let xp = 0;
let lastTime = 0;
let lastLevel = 0;
let lastTimerStage = 0;
let pausedTime = 0;
let timer_stage = 0;
let timeElapsed = 0;

let savedDate = "";
let currentDate = new Date().toISOString().split('T')[0];
let timerRunning = false;
const levelTime = 3600; // XP pro Level (Levelzeit)

// UI-Elemente
const timerDisplay = document.getElementById("timer");
const xpDisplay = document.getElementById("xp");
const levelDisplay = document.getElementById("level");
const progressBar = document.getElementById("progress");
const startButton = document.getElementById("startButton");
const pauseButton = document.getElementById("pauseButton");
const resetButton = document.getElementById("resetButton");
const reminderMessage = document.getElementById("reminderMessage");

// Timer Update
function updateTimerDisplay() {
    const hours = Math.floor(timeElapsed / 3600);
    const minutes = Math.floor((timeElapsed % 3600) / 60);
    const seconds = Math.floor(timeElapsed % 60);
    timerDisplay.textContent = `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

// Fortschrittsbalken und Level aktualisieren
function updateProgress() {
    const level = Math.floor(xp / levelTime) + 1;
    const progressPercentage = (xp % levelTime) / levelTime * 100;
    // Level-Up-Sound, wenn der Fortschritt von 100% auf 0% wechselt (und nur, wenn der Timer läuft)
    if (lastLevel < level && timerRunning)
        playSound('level_up');

    progressBar.style.width = `${Math.min(progressPercentage, 100)}%`;
    levelDisplay.textContent = level.toLocaleString('de-DE');
    xpDisplay.textContent = Math.floor(xp).toLocaleString('de-DE');
    lastLevel = level;
}

// Timer kontinuierlich laufen lassen
function tick(timestamp) {
    if (lastTime) {
        const deltaTime = (timestamp - lastTime) / 1000; // Zeitdifferenz in Sekunden
        timeElapsed += deltaTime;
        xp += deltaTime; // XP für jede Sekunde erhöhen
        updateTimerDisplay();
        updateProgress();
        checkForReminder();
    }
    lastTime = timestamp;
    if (timerRunning) {
        requestAnimationFrame(tick); // Wiederhole den Tick alle Frames
    }
}

// Timer starten
function startTimer() {
    if (!userName) {
        alert('Bitte gib deinen Namen oder Modus ein, um starten zu können.');
        return;
    }
    timerRunning = true;
    startButton.disabled = true;
    pauseButton.disabled = false;

    if (pausedTime > 0) {
        lastTime = performance.now() - pausedTime; // Berechne die Zeit seit der Pause
        pausedTime = 0; // Zurücksetzen der pausierten Zeit
    }
    requestAnimationFrame(tick); // Startet den Timer
}

// Timer stoppen
function pauseTimer() {
    timerRunning = false;
    startButton.disabled = false;
    pauseButton.disabled = true;

    pausedTime = performance.now() - lastTime;
}

function isLastWorkdayOfMonth() {
    const today = new Date();
    const lastDay = new Date(today.getFullYear(), today.getMonth() + 1, 0);
    const offset = (lastDay.getDay() === 6) + (lastDay.getDay() === 0) * 2; 
    lastDay.setDate(lastDay.getDate() - offset);
    return today.getDate() === lastDay.getDate();
}

function handleEightHourReminder() {
    reminderMessage.textContent = "Stern gesammelt! Super Fortschritt! 😎🌠";
    if (isLastWorkdayOfMonth()) {
        reminderMessage.textContent += " \n\n🎉 den letzten Tag des Monats geschafft! 🥳";
        playSound('monthly_celebration', false);
    } else if (new Date().getDay() === 5) { // Freitag
        playSound('grand_star');
    } else {
        playSound('star');
    }
}

// Erinnerung für große Pausen (4h und 8h)
function checkForReminder() {
    if (timeElapsed >= 4 * 3600 && timer_stage < 1) {
        reminderMessage.textContent = "Checkpoint erreicht! Zeit fürs Mittagessen. 🍱🍝";
        playSound('checkpoint');
        timer_stage = 1;
    }
    else if (timeElapsed >= 7.5 * 3600 && timer_stage < 2) {
        reminderMessage.textContent = "Nur noch 30 Minuten durchhalten. Gib Gas! 🛣🏎";
        playSound('final_lap', false);
        timer_stage = 2;
    }
    else if (timeElapsed >= 8 * 3600 && timer_stage < 3) {
        handleEightHourReminder();
        timer_stage = 3;
    }

    if (timer_stage !== lastTimerStage) {
        clearTimeout(reminderTimeout); // Löscht den vorherigen Timeout
        reminderTimeout = setTimeout(() => reminderMessage.textContent = "", 15000);

        lastTimerStage = timer_stage;
    }
}

// Nintendo-Sounds je nach Aktion abspielen
function playSound(type = '', fromMyInstantsCom = true) {
    if (!userName) return;
    const baseUrl = 'https://www.myinstants.com/media/sounds/';

    const sounds = {
        start: 'sm64_mario_lets_go.mp3',
        pause: 'wii-pause-sound-effect.mp3',
        reset: '26-game-over-1.mp3',
        ghost: 'boo-mario-64.mp3',
        bowser: 'bowsers-message-with-laugh.mp3',
        item: 'mario-kart-wii-item-box.mp3',
        solved: 'star-get-1.mp3',
        task_done: 'super-mario-64-musik-stern-erhalt-fanfare-here-we-go.mp3',
        level_up: 'super-mario-64-1up-extra-life.mp3',
        checkpoint: 'untitled-2-360p-1-1cfauzhs_5mzq8c6g.mp3', // SM64 - Dire Dire Docks
        final_lap: 'https://www.superluigibros.com/downloads/sounds/GAMECUBE/MKDD/soundtrack/33-final-lap.mp3',
        star: 'mario-64-wing-cap.mp3',
        grand_star: 'grand-star-get-super-mario-galax.mp3',
        monthly_celebration: 'https://www.superluigibros.com/downloads/sounds/GAMECUBE/MKDD/soundtrack/34-award-ceremony.mp3',
    };
    
    const audio = new Audio((fromMyInstantsCom ? baseUrl : '') + sounds[type]);

    audio.volume = 0.5; // Lautstärke auf 50% setzen
    if (type !== 'bowser') {
        audio.volume = 0.2;
    };
    audio.play();

    if (type === 'item') {
        setTimeout(() => getRandomItem(), 4000);
    }
}

function getRandomItem() {
    const items = [
        "Bananenschale 🍌",
        "Grüner Panzer 🟢",
        "Roter Panzer 🔴",
        "Stachi-Panzer 🦟🔵",
        "Pilz 🍄",
        "Goldener Pilz ✨🍄",
        "Buu Huu 👻",
        "Bumerang 🌀",
        "Super-Acht 🌈🎱",
        "Stern ⭐",
        "Blitz ⚡",
    ];

    const randomIndex = Math.floor(Math.random() * items.length);
    alert("Du hast erhalten:\n\n" + items[randomIndex]);
}


// Reset Button mit mehreren Bestätigungen
resetButton.addEventListener("click", () => {
    if (
        confirm("Möchtest du wirklich alles zurücksetzen? Alle Daten (XP) gehen verloren!") &&
        confirm("Bist du sicher? Dies kann nicht rückgängig gemacht werden.") &&
        confirm("Letzte Warnung! Willst du wirklich zurücksetzen?")
    ) {
        storedData = {};
        xp = 0;
        timeElapsed = 0;
        if (timerRunning) pauseTimer();
        timerRunning = false;
        updateTimerDisplay();
        updateProgress();
        reminderMessage.textContent = "";
        localStorage.removeItem(`homeOffice123-${userName}-data`);
    }
});

// Speichere den Fortschritt im LocalStorage
function saveProgress() {
    if (!userName) {
        alert('Bitte gib deinen Namen ein, um deinen Fortschritt zu speichern.');
        return;
    }

    let data = {
        xp: Math.floor(xp),
        timeElapsed: Math.floor(timeElapsed),
        savedDate: currentDate,
        timer_stage: timer_stage
    };
    // Speichern unter dynamischem Schlüssel
    localStorage.setItem(`homeOffice123-${userName}-data`, JSON.stringify(data));
}

function loadProgress() {
    timerRunning = false;
    if (!userName) {
        alert('Bitte gib deinen Namen ein, um deinen Fortschritt zu laden.');
        return;
    }

    const savedData = localStorage.getItem(`homeOffice123-${userName}-data`);
    if (!savedData) {
        alert('Kein Fortschritt für diesen Namen gespeichert! \nLege neue Speicher-Datei an ...');
        xp = 0;
        timeElapsed = 0;
    } else {
        // Fortschritt laden ...
        const parsedData = JSON.parse(savedData);
        xp = parsedData.xp;
        timeElapsed = parsedData.timeElapsed;
        savedDate = parsedData.savedDate;
        timer_stage = parsedData.timer_stage;
        alert(`Fortschritt geladen für '${userName}':
            - XP = ${xp},
            - Zeit für heute = ${timeElapsed} Sekunden,
            - gespeichert am ${savedDate}`);
    }
    
    // Wenn ein neuer Tag beginnt
    if (savedDate !== currentDate) {
        alert("Ein schöner neuer Tag beginnt. :-)");
        timeElapsed = 0;
        timer_stage = 0;
        saveProgress();
    }
    updateTimerDisplay();
    updateProgress();
}

document.getElementById('loadNameButton').addEventListener('click', () => {
    userName = document.getElementById('userName').value.trim();
    loadProgress();  // Fortschritt laden
});

// Event Listener für Buttons
startButton.addEventListener("click", startTimer);
pauseButton.addEventListener("click", pauseTimer);

// Vor dem Schließen der Seite den Fortschritt speichern
window.addEventListener("beforeunload", saveProgress);

// Initiale Anzeige
updateTimerDisplay();
updateProgress();
setInterval(() => {
    if (timerRunning)
        saveProgress();
}, 5000);
