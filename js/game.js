let db;
let timerInterval = null;
let wordsData = {};
let currentWord = "";
const soundSwitch = new Audio("js/sounds/switch.mp3");
const soundEnd = new Audio("js/sounds/end.mp3");
let soundEnabled = false;


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
    renderPlayers();
    highlightActive();

    const startScreen = document.getElementById("startScreen");
    const startBtn = document.getElementById("startBtn");

    startBtn.addEventListener("click", () => {
        // скрываем экран старта
        startScreen.style.display = "none";

        // запускаем игру
        loadWords();
        startTimer();
        document.getElementById("switchBtn").classList.remove("d-none");

        // разрешаем звук на мобильных
        if (!soundEnabled) {
            soundSwitch.play().catch(() => {});
            soundEnd.play().catch(() => {});
            soundEnabled = true;
        }
    });

    document.getElementById("switchBtn").addEventListener("click", switchPlayer);
    document.getElementById("restartBtn").addEventListener("click", restartGame);
});

document.getElementById("refreshWordBtn").addEventListener("click", () => {
    refreshWord();
});

function refreshWord() {
    const keys = Object.keys(wordsData);
    let newWord;

    do {
        newWord = keys[Math.floor(Math.random() * keys.length)];
    } while (newWord === currentWord && keys.length > 1); // исключаем текущее слово, если есть другие

    currentWord = newWord;
    document.getElementById("currentWord").textContent = currentWord;
    document.getElementById("wordFact").textContent = ""; // факт скрыт

    restartGame(false);
}

function goHome() {
    window.location.href = "index.html";
}

function renderPlayers() {
    document.getElementById("p1Name").textContent = db.players.p1.name;
    document.getElementById("p1NameScore").textContent = db.players.p1.name;
    document.getElementById("p1Time").textContent = db.players.p1.time;
    document.getElementById("p1Score").textContent = db.players.p1.score;

    document.getElementById("p2Name").textContent = db.players.p2.name;
    document.getElementById("p2NameScore").textContent = db.players.p2.name;
    document.getElementById("p2Time").textContent = db.players.p2.time;
    document.getElementById("p2Score").textContent = db.players.p2.score;
}

function highlightActive() {
    document.getElementById("p1Card").classList.remove("active");
    document.getElementById("p2Card").classList.remove("active");

    const active = db.gameState.current;
    document.getElementById(active + "Card").classList.add("active");

    // анимация кнопки Ход
    const switchBtn = document.getElementById("switchBtn");
    switchBtn.classList.add("active-turn");

    // если таймер остановлен, убираем анимацию
    if (timerInterval === null) {
        switchBtn.classList.remove("active-turn");
    }
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
    
    highlightActive();
}

function switchPlayer() {
    if (timerInterval === null) return; // таймер остановлен — ничего не делаем

    const active = db.gameState.current;

    // начисляем очко активному игроку
    changeScore(active, 1);

    saveDB(db);

    renderPlayers();

    // проигрываем звук переключения
    soundSwitch.play();
    
    // вибрация (мобильные устройства)
    if (navigator.vibrate) {
        navigator.vibrate(100); // вибрация 100 мс
    }

    // кратко убираем и добавляем класс, чтобы анимация обновлялась
    const btn = document.getElementById("switchBtn");
    btn.classList.remove("active-turn");
    void btn.offsetWidth; // триггер перерисовки
    btn.classList.add("active-turn");

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

        // проигрываем звук окончания
        soundEnd.play();

        // вибрация
        if (navigator.vibrate) {
            navigator.vibrate([200, 100, 200]); // короткая пульсация: вибрация-пауза-вибрация
        }

        // показываем факт о слове
        document.getElementById("wordFact").textContent = wordsData[currentWord] || "";

        document.getElementById("switchBtn").classList.remove("active-turn");
    }
}

function renderSessionScore() {
    document.getElementById("p1SessionScore").textContent = db.sessionScore.p1;
    document.getElementById("p2SessionScore").textContent = db.sessionScore.p2;
}

function changeScore(player, delta, manual = false) {
    if (db.players[player].time > 0 || manual) {
        db.players[player].score += delta;
    }

    // защита от отрицательных баллов
    if (db.players[player].score < 0) db.players[player].score = 0;

    saveDB(db);
    renderPlayers();
}

function restartGame(isLastWord = true) {
    // суммируем текущие очки в общий счет сессии
    
    if (isLastWord) {
        db.sessionScore.p1 += db.players.p1.score;
        db.sessionScore.p2 += db.players.p2.score;
    }

    // сброс очков текущей игры и таймеров
    db.players.p1.time = timerSec;
    db.players.p2.time = timerSec;
    db.players.p1.score = 0;
    db.players.p2.score = 0;

    if (isLastWord) {
        db.gameState.current = db.nextFirstPlayer;

        // меняем nextFirstPlayer на противоположного
        db.nextFirstPlayer = db.nextFirstPlayer === "p1" ? "p2" : "p1";
    }
    saveDB(db);

    // показываем кнопки/игру
    document.getElementById("switchBtn").classList.remove("d-none");
    document.getElementById("restartBtn").classList.add("d-none");

    if (isLastWord) {
        loadWords();
    }
    renderPlayers();
    renderSessionScore();
    highlightActive();
    startTimer();
}
