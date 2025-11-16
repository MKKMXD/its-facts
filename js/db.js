
const timerSec = 10;

function initDB() {
    const initial = {
        players: {
            p1: { name: "", time: timerSec, score: 0 },
            p2: { name: "", time: timerSec, score: 0 }
        },
        gameState: { current: "p1" },
        sessionScore: { p1: 0, p2: 0 }
    };
    localStorage.setItem('FACT_DB', JSON.stringify(initial));
}

function getDB() {
    return JSON.parse(localStorage.getItem('FACT_DB'));
}

function saveDB(db) {
    localStorage.setItem('FACT_DB', JSON.stringify(db));
}

function setPlayers(name1, name2) {
    const db = getDB();

    db.players.p1.name = name1;
    db.players.p2.name = name2;

    db.players.p1.time = timerSec;
    db.players.p2.time = timerSec;

    db.players.p1.score = 0;
    db.players.p2.score = 0;

    db.gameState.current = "p1";
    db.nextFirstPlayer = "p2";         // следующий первый — p2

    saveDB(db);
}