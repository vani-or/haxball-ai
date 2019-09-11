// 1. Ottenere il token https://www.haxball.com/rs/api/getheadlesstoken
// 2. Aprire nel browser: https://html5.haxball.com/headless
var room = HBInit({ roomName: "Showmatch", maxPlayers: 20, password: "__PASSWORD__", token: "__TOKEN__", public: 0});
room.setDefaultStadium("Classic");
room.setScoreLimit(5);
room.setTimeLimit(3);

// room.onGameStop = function(p) {room.startGame();};
room.onRoomLink = function(url) {window.url = url;};
room.onPlayerJoin = function(player) {
    if(player.name.includes('ivan'))
    {
        room.setPlayerAdmin(player.id, 1);
    }

    // Metto il giocatore nuovo nella squadra vuota
    /*if(player.name.endsWith('_'))
    {
        var free_teams = [1, 1];
        var players = room.getPlayerList();
        for(var i=0; i < players.length; i++)
        {
            if(players[i].team > 0)
            {
                free_teams[players[i].team - 1] = 0;
            }
        }

        if(free_teams[0])
        {
            // Move to red, if possible
            room.setPlayerTeam(player.id, 1);
        }
        else if(free_teams[1])
        {
            // Move to blue, if possible
            room.setPlayerTeam(player.id, 2);
            room.startGame();
        }
    }*/
};

// 3. Ottenere il link
// 4. Guardare l'elenco dei giocatori room.getPlayerList()
// 5. Aggiungere l'admin room.setPlayerAdmin(1, 1)

// API https://github.com/haxball/haxball-issues/wiki/Headless-Host
