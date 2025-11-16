function initDB() {
    if (!localStorage.getItem('FACT_DB')) {
        const initial = {
            players: {
                p1: { name: "", time: 10, score: 0 },
                p2: { name: "", time: 10, score: 0 }
            },
            settings: {},
            gameState: {
                current: "p1"
            }
        };
        localStorage.setItem('FACT_DB', JSON.stringify(initial));
    }
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

    db.players.p1.time = 10;
    db.players.p2.time = 10;

    db.players.p1.score = 0;
    db.players.p2.score = 0;

    db.gameState.current = "p1";

    saveDB(db);
}