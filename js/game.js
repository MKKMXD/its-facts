let db;
let timerInterval = null;
let wordsData = {};
let currentWord = "";

// Загружаем JSON со словами
async function loadWords() {
    try {
        const response = await fetch("js/words.json");
        wordsData = await response.json();

        // Выбираем случайное слово
        const keys = Object.keys(wordsData);
        currentWord = keys[Math.floor(Math.random() * keys.length)];
        document.getElementById("currentWord").textContent = currentWord;
        document.getElementById("wordFact").textContent = ""; // факт пока скрыт
    } catch (err) {
        console.error("Ошибка загрузки слов:", err);
    }
}

document.addEventListener("DOMContentLoaded", () => {
    db = getDB();
    loadWords();

    renderPlayers();
    highlightActive();
    startTimer();

    document.getElementById("switchBtn").addEventListener("click", switchPlayer);
    document.getElementById("restartBtn").addEventListener("click", restartGame);
});

function checkEnd() {
    if (db.players.p1.time <= 0 && db.players.p2.time <= 0) {
        clearInterval(timerInterval);
        timerInterval = null;

        document.getElementById("switchBtn").classList.add("d-none");
        document.getElementById("restartBtn").classList.remove("d-none");

        // показываем факт о слове
        document.getElementById("wordFact").textContent = wordsData[currentWord] || "";
    }
}

function goHome() {
    window.location.href = "index.html";
}

function renderPlayers() {
    document.getElementById("p1Name").textContent = db.players.p1.name;
    document.getElementById("p1Time").textContent = db.players.p1.time;
    document.getElementById("p1Score").textContent = db.players.p1.score;

    document.getElementById("p2Name").textContent = db.players.p2.name;
    document.getElementById("p2Time").textContent = db.players.p2.time;
    document.getElementById("p2Score").textContent = db.players.p2.score;
}

function highlightActive() {
    document.getElementById("p1Card").classList.remove("active");
    document.getElementById("p2Card").classList.remove("active");

    const active = db.gameState.current;
    document.getElementById(active + "Card").classList.add("active");
}

function startTimer() {
    clearInterval(timerInterval);

    timerInterval = setInterval(() => {
        const active = db.gameState.current;

        // уменьшаем время активного игрока
        db.players[active].time--;

        // сохраняем
        saveDB(db);
        renderPlayers();

        checkEnd();

        if (db.players[active].time <= 0) {
            switchPlayer();
        }
    }, 1000);
}

function switchPlayer() {
    if (timerInterval === null) return; // таймер остановлен — ничего не делаем

    const active = db.gameState.current;

    // начисляем очко активному игроку
    db.players[active].score++;
    saveDB(db);

    renderPlayers();

    // переключаем активного
    db.gameState.current = active === "p1" ? "p2" : "p1";
    saveDB(db);

    highlightActive();
    startTimer();
}

function checkEnd() {
    if (db.players.p1.time <= 0 && db.players.p2.time <= 0) {
        // Останавливаем таймер
        clearInterval(timerInterval);
        timerInterval = null; // для надёжности

        // скрываем кнопку "Ход"
        document.getElementById("switchBtn").classList.add("d-none");

        // показываем кнопку перезапуска
        document.getElementById("restartBtn").classList.remove("d-none");
    }
}

function changeScore(player, delta) {
    db.players[player].score += delta;

    // защита от отрицательных баллов
    if (db.players[player].score < 0) db.players[player].score = 0;

    saveDB(db);
    renderPlayers();
}

function restartGame() {
    db.players.p1.time = 60;
    db.players.p2.time = 60;
    db.players.p1.score = 0;
    db.players.p2.score = 0;
    db.gameState.current = "p1";

    saveDB(db);

    document.getElementById("switchBtn").classList.remove("d-none");
    document.getElementById("restartBtn").classList.add("d-none");

    renderPlayers();
    highlightActive();
    startTimer();
}
