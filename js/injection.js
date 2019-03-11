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
    // var L = subwindow.tutti_i_dati.L;
    var L = subwindow._this.Pa; // i dati real-time
    var player_index = -1;
    var opponent_index = -1;

    for (var i = L.D.length-1; i >= 0; i--)
    {
        if(L.D[i].o === player_name)
        {
            player_index = i;
            break;
        }
    }

    var players_data = {};
    if(player_index >= 0)
    {
        if (L.D[player_index].F)
        {
            players_data = {
                team: L.D[player_index].$.o,
                position: L.D[player_index].F.a,
                velocity: L.D[player_index].F.M,
            };
        }

        for (var i = L.D.length - 1; i >= 0; i--)
        {
            if (L.D[i].o !== player_name && L.D[i].$.o !== "Spectators" && L.D[i].$.o !== L.D[player_index].$.o)
            {
                opponent_index = i;
                break;
            }
        }
    }

    var opponents_data = {};
    if(opponent_index >= 0 && L.D[opponent_index].F)
    {
        opponents_data = {
            team: L.D[opponent_index].$.o,
            position: L.D[opponent_index].F.a,
            velocity: L.D[opponent_index].F.M,
        };
    }

    return {
        player: players_data,
        opponent: opponents_data,
        ball: {
            position: L.H.wa.K[0].a,
            velocity: L.H.wa.K[0].M
        },
        score: [
            L.H.Kb,
            L.H.Cb
        ],
        field_size: [
            L.H.U.Ed,
            L.H.U.Dd,
        ],
        init: {
            team: L.H.Jd.o,
            started: L.H.zb
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