// js/main.js

document.addEventListener("DOMContentLoaded", () => {
    initDB();

    const form = document.getElementById("playersForm");

    form.addEventListener("submit", (e) => {
        e.preventDefault();

        const p1 = document.getElementById("player1").value.trim();
        const p2 = document.getElementById("player2").value.trim();

        if (p1 === "" || p2 === "") {
            alert("Введите имена двух соперников");
            return;
        }

        setPlayers(p1, p2);

        // Переход на игровое поле:
        window.location.href = "game.html";
    });
});
