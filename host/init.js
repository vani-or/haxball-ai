// 1. Ottenere il token https://www.haxball.com/rs/api/getheadlesstoken
// 2. Aprire nel browser: https://html5.haxball.com/headless
var room = HBInit({ roomName: "Ciao room", maxPlayers: 12, password: "hellokitty", token: "__TOKEN__", public: 0});
room.setDefaultStadium("Classic");
room.setScoreLimit(14);
room.setTimeLimit(0);

room.onGameStop = function(p) {room.startGame();};
room.onRoomLink = function(url) {window.url = url;};
room.onPlayerJoin = function(player) {
    if(player.name.includes('ciao'))
    {
        room.setPlayerAdmin(player.id, 1);
    }
};

// 3. Ottenere il link
// 4. Guardare l'elenco dei giocatori room.getPlayerList()
// 5. Aggiungere l'admin room.setPlayerAdmin(1, 1)

// API https://github.com/haxball/haxball-issues/wiki/Headless-Host
