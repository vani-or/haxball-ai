// Inject jQuery
var jq_script = document.createElement('script');
jq_script.setAttribute('src','https://ajax.googleapis.com/ajax/libs/jquery/3.3.1/jquery.min.js');
document.head.appendChild(jq_script);


function login(username, password)
{
    var enter_event = new KeyboardEvent("keydown", {bubbles: true, cancelable: true, keyCode: 13});
    $("iframe").contents().find("input").val(username);
    $("iframe").contents().find("input")[0].dispatchEvent(enter_event);

    // password
    $("iframe").contents().find("input").val(password);
    $("iframe").contents().find("input")[0].dispatchEvent(enter_event);
    return true;
}

window.subwindow = 0;
window.subdocument_canvas = 0;
function getHxInfo(player_name)
{
    if(!window.subwindow)
    {
        window.subwindow = document.getElementsByTagName("iframe")[0].contentWindow;
    }
    var L = subwindow.tutti_i_dati.T;
    // var L = subwindow._this.Ka; // i dati real-time
    // Pa -> Ka
    var player_index = -1;
    var opponent_index = -1;

    // L.D -> L.I
    for (var i = L.I.length-1; i >= 0; i--)
    {
        // L.D[i].o -> L.I[i].w
        if(L.I[i].w === player_name)
        {
            player_index = i;
            break;
        }
    }

    var players_data = {};
    if(player_index >= 0)
    {
        // L.D[i].F -> L.I[i].H
        if (L.I[player_index].H)
        {
            players_data = {
                team: L.I[player_index].ca.w, // L.D[player_index].$.o -> L.I[i].ca.w
                position: L.I[player_index].H.a, // L.D[player_index].F.M -> L.I[i].H.a
                velocity: L.I[player_index].H.D, // L.D[player_index].F.M -> L.I[i].H.D
                input: L.I[player_index].nb
            };
        }

        for (var i = L.I.length - 1; i >= 0; i--)
        {
            if (L.I[i].w !== player_name && L.I[i].ca.w !== "Spectators" && L.I[i].ca.w !== L.I[player_index].ca.w)
            {
                opponent_index = i;
                break;
            }
        }
    }

    var opponents_data = {};
    if(opponent_index >= 0 && L.I[opponent_index].H)
    {
        opponents_data = {
            team: L.I[opponent_index].ca.w,
            position: L.I[opponent_index].H.a,
            velocity: L.I[opponent_index].H.D,
            input: L.I[opponent_index].nb
        };
    }

    return {
        player: players_data,
        opponent: opponents_data,
        ball: {
            position: L.K.ta.F[0].a, // L.H.wa.K[0].a -> L.K.ta.F[0].a
            velocity: L.K.ta.F[0].D  // L.H.wa.K[0].M -> L.K.ta.F[0].D
        },
        score: [
            L.K.Jb, // L.H.Kb -> L.K.Jb
            L.K.Pb  // L.H.Kb -> L.K.Pb
        ],
        field_size: [
            L.K.S.Sd,  // L.H.U.Ed -> L.K.S.Sd
            L.K.S.Rd,  // L.H.U.Ed -> L.K.S.Rd
        ],
        init: {
            team: L.K.Zd.w,  // L.H.Jd.o -> L.K.Zd.w
            started: L.K.Ab  // L.H.zb -> L.K.Ab
        }
    };
}
function sendHxCommand(event, key, code, keyCode) {
    if(!window.subdocument_canvas)
    {
        window.subdocument_canvas = document.getElementsByTagName("iframe")[0].contentDocument.getElementsByTagName('canvas')[0];
    }
    window.subdocument_canvas.dispatchEvent(
        new KeyboardEvent(event, {bubbles:true, key: key, keyCode: keyCode, code: code})
    );
}
/*

    var deflateRawOrig = pako.deflateRaw;
    pako.deflateRaw = function(args) {
        var deflated = deflateRawOrig(args);
        console.log("deflated", deflated);
        return deflated;
    };
    function buf2hex(buffer) { // buffer is an ArrayBuffer
      return Array.prototype.map.call(new Uint8Array(buffer), x => ('00' + x.toString(16)).slice(-2)).join('');
    };
    class myRTCPeerConnection extends RTCPeerConnection {
        constructor(configuration) {
            console.log("myRTCPeerConnection()", configuration);
             super(configuration);
        }
        createDataChannel(label, options) {
            console.log("createDataChannel", label, options);
            var dc = super.createDataChannel(label, options);
            console.log("dc = ", dc);

            var fakeDC = {
                onmessage: function(){},
                onopen: function(){},
                readyState: "open",
                negotiated: true,
                send: function(args) {console.log("send", args); return dc.send(args);},
                id: 0
            };
            var enc = new TextDecoder("utf-8");
            dc.onmessage = function(event) {
                console.log('onmessage', enc.decode(event.data));
                //console.log('onmessage', buf2hex(event.data));
                fakeDC.onmessage(event);
            };
            dc.onopen = function(event) {
                console.log('onopen', event);
                if(fakeDC.onopen)
                {
                    fakeDC.onopen(event);
                };
            };

            return fakeDC;
        }
        createOffer(options) {
            console.log("createOffer()", options);
            var offer = super.createOffer(options);
            console.log("offer = ", offer);
            return offer;
        }
        createAnswer(args) {
            console.log("createAnswer()", args);
            var answer = super.createAnswer(args);
            console.log("answer = ", answer);
            return answer;
        }
    };
    */

// https://stackoverflow.com/a/14966131/1581927
window.csv_rows = [];
function add_to_csv(prev_row, new_row)
{
    var line = prev_row.concat(new_row);
    window.csv_rows.push(line);
}
function download_csv()
{
    var csvContent = "data:text/csv;charset=utf-8,";
    window.csv_rows.forEach(function(rowArray)
    {
       var row = rowArray.join(";");
       csvContent += row + "\r\n";
    });
    var encodedUri = encodeURI(csvContent);
    window.open(encodedUri);
}
