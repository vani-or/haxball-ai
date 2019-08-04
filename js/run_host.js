// 1. Ottenere il token https://www.haxball.com/rs/api/getheadlesstoken
// 2. Aprire nel browser: https://html5.haxball.com/headless
var room = HBInit({ roomName: "Ciao room", maxPlayers: 12, password: "hellokitty", token: "thr1.AAAAAFx7yEwjuDvfXZ07fg.DVNLNQdOtAk", public: 0});
room.setDefaultStadium("Classic");
room.setScoreLimit(5);
room.setTimeLimit(3);

room.onGameStop = function(p) {room.startGame()};

// 3. Ottenere il link
// 4. Guardare l'elenco dei giocatori room.getPlayerList()
// 5. Aggiungere l'admin room.setPlayerAdmin(1, 1)

// API https://github.com/haxball/haxball-issues/wiki/Headless-Host
