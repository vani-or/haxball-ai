Content-Type: application/x-javascript


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

window.last_frame = 0;
    var deflateRawOrig = pako.deflateRaw;
    pako.deflateRaw = function(args) {
        var deflated = deflateRawOrig(args);
        // console.log("deflated", deflated);
        return deflated;
    };
    function buf2hex(buffer) { // buffer is an ArrayBuffer
      return Array.prototype.map.call(new Uint8Array(buffer), x => ('00' + x.toString(16)).slice(-2)).join('');
    };
    class myRTCPeerConnection extends RTCPeerConnection {
        constructor(configuration) {
            // console.log("myRTCPeerConnection()", configuration);
             super(configuration);
        }
        createDataChannel(label, options) {
            // console.log("createDataChannel", label, options);
            var dc = super.createDataChannel(label, options);
            // console.log("dc = ", dc);

            var fakeDC = {
                onmessage: function(){},
                onopen: function(){},
                readyState: "open",
                negotiated: true,
                send: function(args) {
                    //console.log("send", args);
                    return dc.send(args);},
                id: 0
            };
            var enc = new TextDecoder("utf-8");
            dc.onmessage = function(event) {
                // console.log('onmessage', enc.decode(event.data));
                //console.log('onmessage', buf2hex(event.data));
                fakeDC.onmessage(event);
            };
            dc.onopen = function(event) {
                // console.log('onopen', event);
                if(fakeDC.onopen)
                {
                    fakeDC.onopen(event);
                };
            };

            return fakeDC;
        }
        createOffer(options) {
            // console.log("createOffer()", options);
            var offer = super.createOffer(options);
            // console.log("offer = ", offer);
            return offer;
        }
        createAnswer(args) {
            // console.log("createAnswer()", args);
            var answer = super.createAnswer(args);
            // console.log("answer = ", answer);
            return answer;
        }
    };

(function (lc) {
        function cc() {
        }

        function t() {
        }

        function q(a) {
            this.Ha = a;
            Error.captureStackTrace && Error.captureStackTrace(this, q)
        }

        function Ua(a) {
            this.f = r.Aa(Ua.J);
            r.za(this.f).get("features").textContent = a.join(", ")
        }

        function Va() {
            this.Dk = new Lb;
            this.f = r.Aa(Va.J);
            var a = r.za(this.f);
            this.Uf = a.get("ping");
            this.Eo = a.get("max-ping");
            this.En = a.get("fps");
            r.he(a.get("graph"), this.Dk.f)
        }

        function O(a, b, c) {
            var d = this;
            this.f = r.Aa(O.J);
            var e = r.za(this.f);
            e.get("ok");
            e.get("cancel");
            this.uf = e.get("content");
            for (var f = e.get("title"), e = e.get("buttons"), g = 0, n = 0; n < c.length;) {
                var k = c[n++]
                    , K = window.document.createElement("button");
                K.textContent = k;
                K.onclick = function (a) {
                    return function () {
                        x.i(d.Qa, a[0])
                    }
                }([g++]);
                e.appendChild(K)
            }
            this.uf.textContent = b;
            f.textContent = a
        }

        function ba(a) {
            function b(a) {
                var b = window.document.createElement("div");
                b.className = "inputrow";
                var c = window.document.createElement("div");
                c.textContent = a;
                b.appendChild(c);
                for (var c = l.Mn(a), d = 0; d < c.length;) {
                    var e = [c[d]];
                    ++d;
                    var f = [window.document.createElement("div")]
                        , g = e[0];
                    H.startsWith(e[0], "Key") && (g = C.substr(e[0], 3, null));
                    f[0].textContent = g;
                    b.appendChild(f[0]);
                    g = window.document.createElement("i");
                    g.className = "icon-cancel";
                    g.onclick = function (a, b) {
                        return function () {
                            l.Vp(b[0]);
                            m.s.Wf.Sa(l);
                            a[0].remove()
                        }
                    }(f, e);
                    f[0].appendChild(g)
                }
                c = window.document.createElement("i");
                c.className = "icon-plus";
                b.appendChild(c);
                c.onclick = function () {
                    U.classList.toggle("show", !0);
                    U.focus();
                    U.onkeydown = function (b) {
                        U.classList.toggle("show", !1);
                        b.stopPropagation();
                        b = b.code;
                        null == l.I(b) && (l.Ia(b, a),
                            m.s.Wf.Sa(l),
                            p())
                    }
                }
                ;
                return b
            }

            function c(a, b, c) {
                a = k.get(a);
                if (null == c)
                    a.hidden = !0;
                else {
                    a.innerHTML = b + ": <div class='flagico'></div> <span></span>";
                    b = a.querySelector(".flagico");
                    a = a.querySelector("span");
                    try {
                        b.classList.add("f-" + c.lb)
                    } catch (qc) {
                    }
                    a.textContent = c.lb.toUpperCase()
                }
            }

            function d(a, b, c, d) {
                var e = k.get(a);
                a = b.I();
                d = null != d ? d(a) : a;
                e.selectedIndex = d;
                e.onchange = function () {
                    var a = e.selectedIndex
                        , a = null != c ? c(a) : a;
                    b.Sa(a)
                }
            }

            function e(a, b, c) {
                function d(a) {
                    e.classList.toggle("icon-ok", a);
                    e.classList.toggle("icon-cancel", !a)
                }

                a = k.get(a);
                a.classList.add("toggle");
                var e = window.document.createElement("i");
                e.classList.add("icon-ok");
                a.insertBefore(e, a.firstChild);
                a.onclick = function () {
                    var a = !b.I();
                    b.Sa(a);
                    d(a);
                    null != c && c(a)
                }
                ;
                d(b.I())
            }

            function f(a) {
                var b = {
                    Sl: k.get(a + "btn"),
                    Dg: k.get(a + "sec")
                };
                K.push(b);
                b.Sl.onclick = function () {
                    g(b)
                }
            }

            function g(a) {
                for (var b = 0, c = 0; c < K.length;) {
                    var d = K[c];
                    ++c;
                    var e = d == a;
                    e && (ba.kl = b);
                    d.Dg.classList.toggle("selected", e);
                    d.Sl.classList.toggle("selected", e);
                    ++b
                }
            }

            null == a && (a = !1);
            var n = this;
            this.f = r.Aa(ba.J);
            var k = r.za(this.f);
            this.$c = k.get("close");
            var K = [];
            f("sound");
            f("video");
            f("misc");
            f("input");
            g(K[ba.kl]);
            e("tsound-main", m.s.xl, function (a) {
                m.Ya.rl(a ? 1 : 0)
            });
            e("tsound-chat", m.s.ul);
            e("tsound-highlight", m.s.wl);
            e("tsound-crowd", m.s.vl);
            d("viewmode", m.s.Ob, function (a) {
                return a - 1
            }, function (a) {
                return a + 1
            });
            d("fps", m.s.gh);
            e("tvideo-teamcol", m.s.Fl);
            e("tvideo-showindicators", m.s.Sj);
            var h = null
                , h = function () {
                var b = m.s.xe.I();
                c("loc", "Detected location", m.s.we.I());
                c("loc-ovr", "Location override", b);
                var d = k.get("loc-ovr-btn");
                d.disabled = !a;
                null == b ? (d.textContent = "Override location",
                        d.onclick = function () {
                            y.i(n.Mo)
                        }
                ) : (d.textContent = "Remove override",
                        d.onclick = function () {
                            m.s.xe.Sa(null);
                            h()
                        }
                )
            };
            h();
            var l = m.s.Wf.I(), U = k.get("presskey"), p, q = k.get("inputsec");
            p = function () {
                r.ff(q);
                var a = b("Up");
                q.appendChild(a);
                a = b("Down");
                q.appendChild(a);
                a = b("Left");
                q.appendChild(a);
                a = b("Right");
                q.appendChild(a);
                a = b("Kick");
                q.appendChild(a)
            }
            ;
            p();
            this.$c.onclick = function () {
                y.i(n.nb)
            }
        }

        function Wa(a) {
            this.zj = !1;
            this.yl = new za(p.Fa);
            this.fj = new za(p.ta);
            this.Vk = new za(p.ba);
            var b = this;
            this.f = r.Aa(Wa.J);
            var c = r.za(this.f);
            this.$b = c.get("room-name");
            this.Bl = c.get("start-btn");
            this.Dl = c.get("stop-btn");
            this.Lh = c.get("pause-btn");
            this.Hm = c.get("auto-btn");
            this.dk = c.get("lock-btn");
            this.dl = c.get("reset-all-btn");
            this.Tk = c.get("rec-btn");
            var d = c.get("link-btn")
                , e = c.get("leave-btn")
                , f = c.get("rand-btn");
            this.$e = c.get("time-limit-sel");
            this.Ue = c.get("score-limit-sel");
            this.zl = c.get("stadium-name");
            this.Al = c.get("stadium-pick");
            this.Al.onclick = function () {
                y.i(b.fp)
            }
            ;
            this.uh(c.get("red-list"), this.Vk, p.ba, a);
            this.uh(c.get("blue-list"), this.fj, p.ta, a);
            this.uh(c.get("spec-list"), this.yl, p.Fa, a);
            this.jk(this.$e, this.ik(15));
            this.jk(this.Ue, this.ik(15));
            this.$e.onchange = function () {
                x.i(b.jp, b.$e.selectedIndex)
            }
            ;
            this.Ue.onchange = function () {
                x.i(b.ap, b.Ue.selectedIndex)
            }
            ;
            this.Bl.onclick = function () {
                y.i(b.gp)
            }
            ;
            this.Dl.onclick = function () {
                y.i(b.hp)
            }
            ;
            this.Lh.onclick = function () {
                y.i(b.Uo)
            }
            ;
            this.Hm.onclick = function () {
                y.i(b.Lo)
            }
            ;
            this.dk.onclick = function () {
                x.i(b.ip, !b.Ah)
            }
            ;
            this.dl.onclick = function () {
                null != b.Od && (b.Od(p.ta),
                    b.Od(p.ba))
            }
            ;
            this.Tk.onclick = function () {
                y.i(b.Yo)
            }
            ;
            d.onclick = function () {
                y.i(b.ep)
            }
            ;
            e.onclick = function () {
                y.i(b.Nd)
            }
            ;
            f.onclick = function () {
                y.i(b.Xo)
            }
            ;
            this.Wi(!1);
            this.Xi(!1)
        }

        function Xa() {
            var a = this;
            this.f = r.Aa(Xa.J);
            var b = r.za(this.f);
            this.Ab = b.get("input");
            this.Ie = b.get("ok");
            b.get("cancel").onclick = function () {
                null != a.Qa && a.Qa(null)
            }
            ;
            this.Ab.maxLength = 30;
            this.Ab.oninput = function () {
                a.v()
            }
            ;
            this.Ab.onkeydown = function (b) {
                13 == b.keyCode && a.zc() && null != a.Qa && a.Qa(a.Ab.value)
            }
            ;
            this.Ie.onclick = function () {
                a.zc() && null != a.Qa && a.Qa(a.Ab.value)
            }
            ;
            this.v()
        }

        function Ya(a) {
            this.mk = a.get("notice");
            this.ln = a.get("notice-contents");
            this.$c = a.get("notice-close");
            this.Wk()
        }

        function ga(a) {
            function b(a) {
                function b() {
                    e.className = f.Ha ? "icon-ok" : "icon-cancel"
                }

                a = d.get(a);
                var e = a.querySelector("i")
                    , f = {
                    Ha: !0
                };
                b();
                a.onclick = function () {
                    f.Ha = !f.Ha;
                    b();
                    c.lm(c.Ci)
                }
                ;
                return f
            }

            this.Ci = [];
            var c = this;
            this.sr = a;
            this.ya = r.Aa(ga.Qi);
            var d = r.za(this.ya)
                , e = new Ya(d);
            this.Mi = d.get("refresh");
            this.bm = d.get("join");
            a = d.get("create");
            this.nr = d.get("count");
            a.onclick = function () {
                y.i(c.Hr)
            }
            ;
            d.get("changenick").onclick = function () {
                y.i(c.Gr)
            }
            ;
            d.get("settings").onclick = function () {
                y.i(c.Jr)
            }
            ;
            var f = d.get("replayfile");
            f.onchange = function () {
                var a = f.files;
                if (!(1 > a.length)) {
                    var a = a.item(0)
                        , b = new FileReader;
                    b.onload = function () {
                        x.i(c.Ir, b.result)
                    }
                    ;
                    b.readAsArrayBuffer(a)
                }
            }
            ;
            this.qr = b("fil-flash");
            this.rr = b("fil-full");
            this.Kr = b("fil-pass");
            this.yr = d.get("listscroll");
            this.Lr = Aa.Hf(this.yr);
            this.Fi = d.get("list");
            this.Mi.onclick = function () {
                e.Wk();
                c.Yl()
            }
            ;
            this.bm.onclick = function () {
                null != c.Ad && x.i(c.gm, c.Ad.Pr)
            }
            ;
            this.Yl()
        }

        function Za(a) {
            this.ya = r.Aa(Za.Qi, "tbody");
            var b = r.za(this.ya)
                , c = b.get("name")
                , d = b.get("players")
                , e = b.get("distance")
                , f = b.get("pass")
                , g = b.get("flag");
            this.Pr = a;
            var n = a.yc;
            c.textContent = n.o;
            d.textContent = "" + n.D + "/" + n.Md;
            f.textContent = n.ob ? "Yes" : "No";
            e.textContent = "" + (a.ve | 0) + "km";
            try {
                g.classList.add("f-" + n.lb.toLowerCase())
            } catch (k) {
            }
            a.Cf ? (a = b.get("tag"),
                a.textContent = "Flash",
                a.className = "flashtag") : 8 > a.yc.Uc && this.ya.classList.add("old")
        }

        function $a() {
            this.Aj = null;
            var a = this;
            this.f = r.Aa($a.J);
            var b = r.za(this.f);
            this.Ff = b.get("link");
            var c = b.get("copy")
                , b = b.get("close");
            this.Ff.onfocus = function () {
                a.Ff.select()
            }
            ;
            c.onclick = function () {
                a.Ff.select();
                return window.document.execCommand("Copy")
            }
            ;
            b.onclick = function () {
                y.i(a.nb)
            }
        }

        function ha(a) {
            function b() {
                var b = g[f];
                a.Fk = e ? b : 0;
                d.get("spd").textContent = b + "x"
            }

            this.Df = !1;
            var c = this;
            this.f = r.Aa(ha.J);
            var d = r.za(this.f);
            this.Xh = a;
            d.get("reset").onclick = function () {
                a.Yh()
            }
            ;
            var e = !0
                , f = 2
                , g = [.5, .75, 1, 2, 3];
            b();
            var n = d.get("playicon");
            n.classList.add("icon-pause");
            d.get("play").onclick = function () {
                e = !e;
                var a = n.classList;
                a.toggle("icon-play", !e);
                a.toggle("icon-pause", e);
                b()
            }
            ;
            d.get("spdup").onclick = function () {
                f += 1;
                var a = g.length - 1;
                f > a && (f = a);
                b()
            }
            ;
            d.get("spddn").onclick = function () {
                --f;
                0 > f && (f = 0);
                b()
            }
            ;
            this.Oq = d.get("time");
            var k = d.get("timebar");
            this.Jp = d.get("progbar");
            for (var K = d.get("timetooltip"), h = 0, l = a.kk; h < l.length;) {
                var U = l[h];
                ++h;
                var m = window.document.createElement("div");
                m.className = "marker";
                m.classList.add("k" + U.kind);
                m.style.left = 100 * U.Li + "%";
                k.appendChild(m)
            }
            k.onclick = function (b) {
                a.pq((b.pageX - k.offsetLeft) / k.clientWidth * a.Mg * a.Te);
                c.Df || (c.Df = !0,
                    c.cp())
            }
            ;
            k.onmousemove = function (b) {
                b = (b.pageX - k.offsetLeft) / k.clientWidth;
                K.textContent = ha.lk(a.Te * a.Mg * b);
                return K.style.left = "calc(" + 100 * b + "% - 30px)"
            }
            ;
            this.oo = d.get("leave");
            this.oo.onclick = function () {
                y.i(c.Nd)
            }
        }

        function P(a) {
            var b = this
                , c = new O("Only humans", "", []);
            this.f = c.f;
            c.uf.style.minHeight = "78px";
            Ja.po().then(function (d) {
                null == P.Th && (P.Th = window.document.createElement("div"),
                    P.Op = d.render(P.Th, {
                        sitekey: a,
                        callback: function (a) {
                            x.i(P.Uk, a)
                        },
                        theme: "dark"
                    }));
                d.reset(P.Op);
                P.Uk = function (a) {
                    window.setTimeout(function () {
                        x.i(b.Qa, a)
                    }, 1E3);
                    P.Uk = null
                }
                ;
                c.uf.appendChild(P.Th)
            })
        }

        function za(a) {
            this.jd = new Map;
            var b = this;
            this.f = r.Aa(za.J);
            this.f.className += " " + a.sn;
            var c = r.za(this.f);
            this.Za = c.get("list");
            this.xh = c.get("join-btn");
            this.Zh = c.get("reset-btn");
            a == p.Fa && this.Zh.remove();
            this.xh.textContent = "" + a.o;
            this.f.ondragover = this.f.$r = function (a) {
                -1 != a.dataTransfer.types.indexOf("player") && a.preventDefault()
            }
            ;
            this.f.ondrop = function (c) {
                c.preventDefault();
                c = c.dataTransfer.getData("player");
                null != c && (c = L.parseInt(c),
                null != c && ia.i(b.Qf, c, a))
            }
            ;
            this.xh.onclick = function () {
                x.i(b.So, a)
            }
            ;
            this.Zh.onclick = function () {
                x.i(b.Od, a)
            }
        }

        function ab(a) {
            var b = this;
            this.o = a.o;
            this.wb = a.wb;
            this.P = a.T;
            this.f = r.Aa(ab.J);
            var c = r.za(this.f);
            this.Ge = c.get("name");
            this.Uf = c.get("ping");
            try {
                c.get("flag").classList.add("f-" + a.wd)
            } catch (d) {
            }
            this.Ge.textContent = this.o;
            this.Uf.textContent = "" + this.wb;
            this.f.ondragstart = function (a) {
                a.dataTransfer.setData("player", L.ie(b.P))
            }
            ;
            this.f.oncontextmenu = function (a) {
                a.preventDefault();
                x.i(b.Ne, b.P)
            }
            ;
            this.nl(a.ra)
        }

        function bb(a, b) {
            var c = this;
            this.f = r.Aa(bb.J);
            var d = r.za(this.f);
            this.Ge = d.get("name");
            this.lf = d.get("admin");
            this.Ae = d.get("kick");
            this.$c = d.get("close");
            this.lf.onclick = function () {
                ia.i(c.Ko, c.Ib, !c.Gk)
            }
            ;
            this.Ae.onclick = function () {
                x.i(c.Jh, c.Ib)
            }
            ;
            this.$c.onclick = function () {
                y.i(c.nb)
            }
            ;
            this.Ib = a.T;
            this.Zi(a.o);
            this.Yi(a.ra);
            this.lf.disabled = !b || 0 == this.Ib;
            this.Ae.disabled = !b || 0 == this.Ib
        }

        function Lb() {
            this.ah = 0;
            this.Do = 400;
            this.Rj = 64;
            this.xi = 32;
            this.ja = window.document.createElement("canvas");
            this.wf = window.document.createElement("canvas");
            this.f = window.document.createElement("div");
            this.wf.width = this.ja.width = this.xi;
            this.wf.height = this.ja.height = this.Rj;
            this.fh = this.wf.getContext("2d", null);
            this.c = this.ja.getContext("2d", null);
            this.c.fillStyle = "green";
            for (var a = [], b = 0, c = this.xi; b < c;)
                ++b,
                    a.push(0);
            this.np = a;
            this.f.appendChild(this.wf);
            this.f.className = "graph"
        }

        function cb() {
            this.gb = null;
            var a = this;
            this.f = r.Aa(cb.J);
            var b = r.za(this.f);
            b.get("cancel").onclick = function () {
                y.i(a.Hh)
            }
            ;
            this.Mh = b.get("pick");
            this.vj = b.get("delete");
            this.Kj = b.get("export");
            var c = b.get("list")
                , d = b.get("file");
            this.ng();
            this.Mh.onclick = function () {
                null != a.gb && a.gb.Bd().then(function (b) {
                    x.i(a.Sf, b)
                })
            }
            ;
            this.vj.onclick = function () {
                if (null != a.gb) {
                    var b = a.gb.Vl;
                    null != b && (a.gb.ya.remove(),
                        a.gb = null,
                        b(),
                        a.ng())
                }
            }
            ;
            this.Kj.onclick = function () {
                null != a.gb && a.gb.Bd().then(function (a) {
                    Ba.mq(a.ae(), a.o + ".hbs")
                })
            }
            ;
            this.Ph(c);
            this.Yf = Aa.Hf(c);
            window.setTimeout(function () {
                a.Yf.update()
            }, 0);
            d.onchange = function () {
                var b = d.files;
                if (!(1 > b.length)) {
                    var b = b.item(0)
                        , c = new FileReader;
                    c.onload = function () {
                        try {
                            var b = c.result
                                , d = new h;
                            d.bk(b);
                            x.i(a.Sf, d)
                        } catch (k) {
                            b = k instanceof q ? k.Ha : k,
                                b instanceof SyntaxError ? x.i(a.Kh, "SyntaxError in line: " + L.ie(b.lineNumber)) : b instanceof vb ? x.i(a.Kh, b.Fo) : x.i(a.Kh, "Error loading stadium file.")
                        }
                    }
                    ;
                    c.readAsText(b)
                }
            }
        }

        function db() {
            var a = this;
            this.f = r.Aa(db.J);
            var b = r.za(this.f);
            b.get("cancel").onclick = function () {
                x.i(a.nb, !1)
            }
            ;
            b.get("leave").onclick = function () {
                x.i(a.nb, !0)
            }
        }

        function eb(a) {
            var b = this;
            this.f = r.Aa(eb.J);
            var c = r.za(this.f);
            this.Ge = c.get("title");
            this.Sh = c.get("reason");
            this.Im = c.get("ban-btn");
            this.Km = c.get("ban-text");
            this.Ae = c.get("kick");
            this.$c = c.get("close");
            this.Im.onclick = function () {
                b.Vi(!b.dj)
            }
            ;
            this.$c.onclick = function () {
                y.i(b.nb)
            }
            ;
            this.Ae.onclick = function () {
                wb.i(b.Jh, b.Ib, b.Sh.value, b.dj)
            }
            ;
            this.Sh.onkeydown = function (a) {
                return a.stopPropagation()
            }
            ;
            this.Sh.maxLength = 100;
            this.Ib = a.T;
            this.Ge.textContent = "Kick " + a.o;
            this.Vi(!1)
        }

        function ja(a) {
            this.Gb = new fb;
            this.ud = !1;
            this.Xd = new Va;
            this.Va = new Ca;
            var b = this;
            this.Ra = new Wa(a);
            this.Gb.Ib = a;
            this.f = r.Aa(ja.J);
            a = r.za(this.f);
            this.kh = a.get("gameplay-section");
            this.Oe = a.get("popups");
            this.Oe.style.display = "none";
            r.he(a.get("chatbox"), this.Va.f);
            r.he(a.get("stats"), this.Xd.f);
            this.Gh = a.get("menu");
            this.Gh.onclick = function () {
                b.Vd(!b.ud);
                b.Gh.blur()
            }
            ;
            a.get("settings").onclick = function () {
                var a = new ba;
                a.nb = function () {
                    b.ab(null)
                }
                ;
                b.ab(a.f)
            }
            ;
            this.kh.appendChild(this.Gb.f);
            this.Ra.Nd = function () {
                var a = new db;
                a.nb = function (a) {
                    b.ab(null);
                    a && y.i(b.Nd)
                }
                ;
                b.ab(a.f)
            }
            ;
            this.Ra.fp = function () {
                var a = new cb;
                a.Hh = function () {
                    b.ab(null)
                }
                ;
                a.Sf = function (a) {
                    x.i(b.Sf, a);
                    b.ab(null)
                }
                ;
                a.Kh = function (a) {
                    a = new O("Error loading stadium", a, ["Ok"]);
                    a.Qa = function () {
                        b.ab(null)
                    }
                    ;
                    b.ab(a.f)
                }
                ;
                b.ab(a.f)
            }
        }

        function Mb() {
            this.xa = 0;
            this.Bj = this.Cj = !1;
            this.ue = 0;
            this.f = window.document.createElement("div");
            this.f.className = "game-timer-view";
            this.f.appendChild(this.kp = this.Gd("OVERTIME!", "overtime"));
            this.f.appendChild(this.Ho = this.Gd("0", "digit"));
            this.f.appendChild(this.Go = this.Gd("0", "digit"));
            this.f.appendChild(this.Gd(":", null));
            this.f.appendChild(this.oq = this.Gd("0", "digit"));
            this.f.appendChild(this.nq = this.Gd("0", "digit"))
        }

        function fb() {
            this.Ib = -1;
            this.Db = new N;
            this.rc = new Mb;
            this.f = r.Aa(fb.J);
            var a = r.za(this.f);
            this.Kb = new xb(a.get("red-score"), 0);
            this.Cb = new xb(a.get("blue-score"), 0);
            r.he(a.get("timer"), this.rc.f);
            r.he(a.get("canvas"), this.Db.ja)
        }

        function gb(a, b) {
            var c = this;
            this.f = r.Aa(gb.J);
            var d = r.za(this.f);
            this.Jo = d.get("ok");
            this.Jo.onclick = function () {
                y.i(c.Qa)
            }
            ;
            this.al = d.get("replay");
            var e = null != b;
            this.al.hidden = !e;
            e && (this.al.onclick = function () {
                    ca.il(b)
                }
            );
            d.get("reason").textContent = a
        }

        function hb(a) {
            var b = this;
            this.f = r.Aa(hb.J);
            var c = r.za(this.f);
            this.Vg = c.get("cancel");
            this.pj = c.get("create");
            this.He = c.get("name");
            this.Ak = c.get("pass");
            this.Fh = c.get("max-pl");
            this.Ml = c.get("unlisted");
            this.He.maxLength = 40;
            this.He.value = a;
            this.He.oninput = function () {
                b.v()
            }
            ;
            this.Ak.maxLength = 30;
            this.Ml.onclick = function () {
                b.$i(!b.Nl)
            }
            ;
            this.Vg.onclick = function () {
                y.i(b.Hh)
            }
            ;
            this.pj.onclick = function () {
                if (b.zc()) {
                    var a = b.Ak.value;
                    "" == a && (a = null);
                    x.i(b.Ro, {
                        name: b.He.value,
                        password: a,
                        Br: b.Fh.selectedIndex + 2,
                        Ur: b.Nl
                    })
                }
            }
            ;
            for (a = 2; 21 > a;)
                c = window.document.createElement("option"),
                    c.textContent = "" + a++,
                    this.Fh.appendChild(c);
            this.Fh.selectedIndex = 10;
            this.$i(!1);
            this.v()
        }

        function ib() {
            this.f = r.Aa(ib.J);
            var a = r.za(this.f);
            this.Wb = a.get("log");
            this.Vg = a.get("cancel")
        }

        function jb(a) {
            function b() {
                c.zc() && null != c.sk && c.sk(c.Ab.value)
            }

            var c = this;
            this.f = r.Aa(jb.J);
            var d = r.za(this.f);
            this.Ab = d.get("input");
            this.Ie = d.get("ok");
            this.Ab.maxLength = 25;
            this.Ab.value = a;
            this.Ab.oninput = function () {
                c.v()
            }
            ;
            this.Ab.onkeydown = function (a) {
                13 == a.keyCode && b()
            }
            ;
            this.Ie.onclick = b;
            this.v()
        }

        function kb(a, b) {
            this.bj = [];
            this.Up = /[#@][^\s@#]*$/;
            this.Eb = a;
            this.Zo = b;
            a.hidden = !0
        }

        function Ca() {
            function a() {
                null != b.uk && "" != b.eb.value && b.uk(b.eb.value);
                b.eb.value = "";
                b.eb.blur()
            }

            var b = this;
            this.f = r.Aa(Ca.J);
            var c = r.za(this.f);
            this.Wb = c.get("log");
            this.Yf = Aa.Hf(this.Wb);
            this.eb = c.get("input");
            this.eb.maxLength = 140;
            c.get("send").onclick = a;
            this.wc = new kb(c.get("autocompletebox"), function (a, c) {
                    b.eb.value = a;
                    b.eb.setSelectionRange(c, c)
                }
            );
            this.eb.onkeydown = function (c) {
                // INJECTION
                // console.log('here');
                //
                switch (c.keyCode) {
                    case 9:
                        b.wc.Eb.hidden || (b.wc.yn(),
                            c.preventDefault());
                        break;
                    case 13:
                        a();
                        break;
                    case 27:
                        b.wc.Eb.hidden ? (b.eb.value = "",
                            b.eb.blur()) : b.wc.rh();
                        break;
                    case 38:
                        b.wc.kj(-1);
                        break;
                    case 40:
                        b.wc.kj(1)
                }
                c.stopPropagation()
            }
            ;
            this.eb.onfocus = function () {
                null != b.Mf && b.Mf(!0)
            }
            ;
            this.eb.onblur = function () {
                null != b.Mf && b.Mf(!1);
                b.wc.rh()
            }
            ;
            this.eb.oninput = function () {
                b.wc.Rm(b.eb.value, b.eb.selectionStart)
            }
        }

        function lb() {
            this.Ve = null;
            var a = this;
            this.f = r.Aa(lb.J);
            var b = r.za(this.f);
            b.get("cancel").onclick = function () {
                y.i(a.nb)
            }
            ;
            this.Wg = b.get("change");
            this.Wg.disabled = !0;
            this.Wg.onclick = function () {
                null != a.Ve && a.jl(a.Ve.index)
            }
            ;
            b = b.get("list");
            this.Ph(b);
            var c = Aa.Hf(b);
            window.setTimeout(function () {
                c.update()
            }, 0)
        }

        function Da() {
            this.wh = !1;
            this.o = "";
            this.Ug = 0;
            this.pf = "";
            this.hb = new ka;
            var a = window.document.createElement("canvas");
            a.width = 64;
            a.height = 64;
            this.pb = a.getContext("2d", null);
            this.cj = this.pb.createPattern(this.pb.canvas, "no-repeat");
            this.qn()
        }

        function Nb() {
            this.rc = 0;
            this.Za = [];
            this.Kq = new Q(["Time is", "Up!"], 16777215);
            this.Sp = new Q(["Red is", "Victorious!"], 15035990);
            this.Rp = new Q(["Red", "Scores!"], 15035990);
            this.Mm = new Q(["Blue is", "Victorious!"], 625603);
            this.Lm = new Q(["Blue", "Scores!"], 625603);
            this.mp = new Q(["Game", "Paused"], 16777215)
        }

        function Q(a, b) {
            for (var c = [], d = 0; d < a.length;)
                c.push(this.Ao(a[d++], b));
            this.Ee = c
        }

        function N() {
            this.Nc = window.performance.now();
            this.lg = new Map;
            this.qd = new Map;
            this.be = 35;
            this.Pe = 0;
            this.Qe = 1.5;
            this.bb = new M(0, 0);
            this.Vj = !1;
            this.fd = new Nb;
            this.ja = window.document.createElement("canvas");
            this.ja.mozOpaque = !0;
            this.c = this.ja.getContext("2d", {
                alpha: !1
            });
            this.Tn = this.c.createPattern(m.Sn, null);
            this.gn = this.c.createPattern(m.fn, null);
            this.en = this.c.createPattern(m.dn, null)
        }

        function z() {
            this.gd = 0;
            this.B = 32;
            this.h = -1;
            this.l = 1;
            this.a = new M(0, 0)
        }

        function D() {
            this.jg = this.kg = this.sa = null;
            this.rj = 0;
            this.V = this.R = this.Hd = null;
            this.xc = 0;
            this.l = 1;
            this.h = -1;
            this.B = 32;
            this.tb = 1 / 0;
            this.Wa = !0;
            this.X = 0
        }

        function I() {
            this.B = 32;
            this.h = -1;
            this.l = 1;
            this.Oa = 0;
            this.sa = new M(0, 0)
        }

        function Ea() {
            this.Zb = -1;
            this.Yb = null;
            this.K = []
        }

        function X() {
            this.Zb = -1;
            this.Yb = null;
            this.zk = 0;
            this.h = this.B = -1;
            this.gj = 0;
            this.X = 16777215;
            this.Ba = .99;
            this.pa = 1;
            this.l = .5;
            this.la = 10;
            this.M = new M(0, 0);
            this.a = new M(0, 0)
        }

        function yb() {
        }

        function la() {
            this.ia = 0
        }

        function Ka() {
            this.ia = 0
        }

        function La() {
            this.ia = 0
        }

        function Y() {
            this.sg = !1;
            this.ia = 0
        }

        function ec() {
        }

        function ma() {
            this.ia = 0
        }

        function Fa() {
            this.ia = 0
        }

        function Ma() {
            this.ia = 0
        }

        function Na() {
            this.ia = 0
        }

        function na() {
            this.ia = 0
        }

        function oa() {
            this.ia = 0
        }

        function Oa() {
            this.ia = 0
        }

        function pa() {
            this.ia = 0
        }

        function R() {
            this.ia = 0
        }

        function qa() {
            this.ia = 0
        }

        function ra() {
            this.ia = 0
        }

        function da() {
            this.ia = 0
        }

        function Pa() {
            this.ia = 0
        }

        function sa() {
            this.ia = 0
        }

        function ea() {
            this.uc = -1;
            this.im = null;
            this.$ = p.Fa;
            this.F = null;
            this.bc = !1;
            this.mb = this.T = 0;
            this.o = "Player";
            this.wg = this.wb = 0;
            this.wd = null;
            this.xd = !1;
            this.jb = null;
            this.Bb = 0;
            this.ra = !1
        }

        function fa() {
            this.Zb = -1;
            this.U = this.Yb = null;
            this.fb = this.xa = 3;
            this.Gc = !1;
            this.H = null;
            this.D = [];
            this.$b = "";
            this.U = h.lh()[0];
            this.hb = [null, new ka, new ka];
            this.hb[1].cb.push(p.ba.X);
            this.hb[2].cb.push(p.ta.X)
        }

        function p(a, b, c, d, e, f, g, n) {
            this.Tf = null;
            this.P = a;
            this.X = b;
            this.dh = c;
            this.mo = d;
            this.o = e;
            this.sn = f;
            this.B = n;
            this.El = new ka;
            this.El.cb.push(b)
        }

        function ka() {
            this.Tc = 16777215;
            this.cb = []
        }

        function h() {
            this.C = [];
            this.O = [];
            this.ha = [];
            this.kc = [];
            this.K = [];
            this.Rd = new zb;
            this.oe = this.Dh();
            this.bh = 255;
            this.qe = this.Fe = 0;
            this.rf = !0
        }

        function vb(a) {
            this.Fo = a
        }

        function zb() {
            this.pa = this.l = .5;
            this.Ba = .96;
            this.me = .1;
            this.Be = .07;
            this.Ce = .96;
            this.Kd = 5
        }

        function mb() {
            this.Yd = p.Fa;
            this.V = new M(0, 0);
            this.R = new M(0, 0)
        }

        function ta() {
            this.Zb = -1;
            this.Yb = null;
            this.Kb = this.Cb = this.Ac = this.Ga = 0;
            this.kd = new M(0, 0);
            this.Jd = p.ba;
            this.ec = this.pc = this.zb = 0;
            this.wa = new Ea;
            this.xa = 0;
            this.fb = 5;
            this.U = null
        }

        function ua() {
            this.h = this.B = -1;
            this.X = 16777215;
            this.Ba = .99;
            this.pa = 1;
            this.l = .5;
            this.la = 10;
            this.M = new M(0, 0);
            this.a = new M(0, 0)
        }

        function Ob(a, b) {
            this.Hg = null;
            this.Tr = .025;
            this.ee = this.Eg = this.hf = 0;
            this.vg = b.createGain();
            this.vg.gain.value = 0;
            var c = b.createBufferSource();
            c.buffer = a;
            c.connect(this.vg);
            c.loop = !0;
            c.start()
        }

        function Pb(a) {
            function b(b) {
                return new Promise(function (d, f) {
                        var e = a.file(b).asArrayBuffer();
                        return c.c.decodeAudioData(e, d, f)
                    }
                )
            }

            var c = this;
            this.c = new AudioContext;
            this.Gf = this.c.createGain();
            this.rl(m.s.xl.I() ? 1 : 0);
            this.Gf.connect(this.c.destination);
            this.zn = Promise.all([b("sounds/chat.ogg").then(function (a) {
                return c.Tm = a
            }), b("sounds/highlight.wav").then(function (a) {
                return c.co = a
            }), b("sounds/kick.ogg").then(function (a) {
                return c.lo = a
            }), b("sounds/goal.ogg").then(function (a) {
                return c.Qn = a
            }), b("sounds/join.ogg").then(function (a) {
                return c.ko = a
            }), b("sounds/leave.ogg").then(function (a) {
                return c.no = a
            }), b("sounds/crowd.ogg").then(function (a) {
                c.rn = a;
                c.qj = new Ob(c.rn, c.c);
                c.qj.connect(c.Gf)
            })])
        }

        function Z() {
        }

        function va() {
        }

        function nb() {
        }

        function Qb(a) {
            this.Nc = window.performance.now();
            this.ed = this.ne = 0;
            var b = this;
            this.va = a;
            this.j = new ja(a.nc);
            var c = new Ab(this.j);
            c.Vh(a.L);
            // ORIG
            window.document.addEventListener("keydown", F(this, this.nd));
            // INJECTION
            // var that = this;
            // console.log('injectKeyDown0');
            // window.injectKeyDown = function(e) {that.nd(e);};
            // window.document.addEventListener("keydown", F(this, this.nd));
            //
            window.document.addEventListener("keyup", F(this, this.od));
            window.requestAnimationFrame(F(this, this.Je));
            this.hh = window.setInterval(function () {
                b.j.Xd.ql(b.ed);
                b.ed = 0
            }, 1E3);
            this.Ye(m.s.Ob.I());
            this.j.f.classList.add("replayer");
            this.Se = new ha(a);
            this.Se.cp = function () {
                c.Vq(a.L)
            }
            ;
            this.Se.bp = function () {
                b.j.Vd(null == a.L.H);
                c.Vh(a.L)
            }
            ;
            this.j.f.appendChild(this.Se.f)
        }

        function w() {
        }

        function v() {
        }

        function Bb() {
            this.Cf = !1
        }

        function m() {
        }

        function V() {
            this.Mc = new Map
        }

        function Ga(a, b, c, d) {
            this.o = a;
            this.er = d;
            this.Bh = b;
            d = null;
            null != b && (d = b.getItem(a));
            this.Pl = c(d)
        }

        function Rb() {
        }

        function Sb() {
            function a(a) {
                return new Ga(a, e, function (a) {
                        if (null == a)
                            return null;
                        try {
                            return S.ih(a)
                        } catch (n) {
                            return null
                        }
                    }
                    , function (a) {
                        if (null == a)
                            return null;
                        try {
                            return a.ae()
                        } catch (n) {
                            return null
                        }
                    }
                )
            }

            function b(a) {
                return new Ga(a, e, function (a) {
                        return null != a ? "0" != a : !0
                    }
                    , function (a) {
                        return a ? "1" : "0"
                    }
                )
            }

            function c(a, b) {
                return new Ga(a, e, function (a) {
                        var c = b;
                        try {
                            null != a && (c = L.parseInt(a))
                        } catch (K) {
                        }
                        return c
                    }
                    , function (a) {
                        return "" + a
                    }
                )
            }

            function d(a, b, c) {
                return new Ga(a, e, function (a) {
                        return null == a ? b : aa.vd(a, c)
                    }
                    , function (a) {
                        return a
                    }
                )
            }

            var e = Rb.Zl();
            this.Qd = d("player_name", "", 25);
            this.Ob = c("view_mode", -1);
            this.gh = c("fps_limit", 0);
            this.Sg = d("avatar", null, 2);
            this.Lp = d("rctoken", null, 1024);
            this.Fl = b("team_colors");
            this.Sj = b("show_indicators");
            this.xl = b("sound_main");
            this.ul = b("sound_chat");
            this.wl = b("sound_highlight");
            this.vl = b("sound_crowd");
            this.aj = d("player_auth_key", null, 1024);
            this.dd = c("extrapolation", 0);
            this.we = a("geo");
            this.xe = a("geo_override");
            this.Wf = function () {
                return new Ga("player_keys", e, function (a) {
                        if (null == a)
                            return V.tj();
                        try {
                            return V.ih(a)
                        } catch (g) {
                            return V.tj()
                        }
                    }
                    , function (a) {
                        try {
                            return a.ae()
                        } catch (g) {
                            return null
                        }
                    }
                )
            }()
        }

        function S() {
            this.lb = "";
            this.lc = this.mc = 0
        }

        function Qa() {
            this.Id = this.Ef = 0;
            window.document.addEventListener("focusout", F(this, this.qk))
        }

        function Ab(a, b) {
            this.sh = null;
            this.j = a;
            null != b && (this.sh = "@" + H.replace(b, " ", "_"))
        }

        function ca(a) {
            this.tf = null;
            this.Zj = this.$g = !1;
            this.Nc = window.performance.now();
            this.sd = null;
            this.ne = 0;
            this.Um = new ob(3, 1E3);
            this.mb = new Qa;
            this.dg = "Waiting for link";
            this.ai = this.ll = !1;
            this.ed = 0;
            var b = this;
            this.Xg = new pb(a, function (a) {
                    b.j.Va.Hb(a)
                }
            );
            this.va = a;
            a.L.un = function (c) {
                b.ll != c && (b.ll = c,
                    c = sa.na(c),
                    a.ma(c))
            }
            ;
            this.j = new ja(a.nc);
            this.jh = new Ab(this.j, a.L.ka(a.nc).o);
            this.jh.Vh(a.L);
            this.j.Va.uk = F(this, this.Oo);
            this.j.Va.Mf = F(this, this.No);
            // ORIG
            // window.document.addEventListener("keydown", F(this, this.nd));
            // INJECTION
            // console.log('injectKeyDown1', F(this, this.nd));
            // var that = this;
            // window.injectKeyDown = function(code) {console.log('that', that);return that;/*return that.mb.nd(code);*/};
            window.document.addEventListener("keydown", F(this, this.nd));
            //
            window.document.addEventListener("keyup", F(this, this.od));
            window.onbeforeunload = function () {
                return "Are you sure you want to leave the room?"
            }
            ;
            this.mb.Rf = function (b) {
                a.ma(b)
            }
            ;
            this.j.Ra.jp = function (b) {
                b = da.na(1, b);
                a.ma(b)
            }
            ;
            this.j.Ra.ap = function (b) {
                b = da.na(0, b);
                a.ma(b)
            }
            ;
            this.j.Sf = function (b) {
                b = pa.na(b);
                a.ma(b)
            }
            ;
            this.j.Ra.gp = function () {
                a.ma(new La)
            }
            ;
            this.j.Ra.hp = function () {
                a.ma(new Ka)
            }
            ;
            this.j.Ra.Uo = function () {
                b.Jl()
            }
            ;
            this.j.Ra.Qf = function (b, c) {
                var d = R.na(b, c);
                a.ma(d)
            }
            ;
            this.j.Ra.Od = F(this, this.hq);
            this.j.Ra.Lo = function () {
                a.ma(new Pa)
            }
            ;
            this.j.Ra.Xo = function () {
                ca.Kp(a)
            }
            ;
            this.j.Ra.ip = function (b) {
                b = oa.na(b);
                a.ma(b)
            }
            ;
            this.j.Ra.Ne = function (c) {
                var d = a.L.ka(c);
                if (null != d) {
                    var e = new bb(d, b.ai);
                    e.nb = function () {
                        b.j.ab(null)
                    }
                    ;
                    e.Ko = function (b, c) {
                        var d = ra.na(b, c);
                        a.ma(d)
                    }
                    ;
                    e.Jh = function () {
                        b.Fq(d)
                    }
                    ;
                    b.j.ab(e.f, function () {
                        e.v(a.L, b.ai)
                    })
                }
            }
            ;
            this.j.Ra.ep = function () {
                var a = new $a;
                a.nb = function () {
                    b.j.ab(null)
                }
                ;
                b.j.ab(a.f, function () {
                    a.xq(b.dg)
                })
            }
            ;
            this.j.Ra.Yo = function () {
                if (null == b.sd)
                    b.Jq();
                else {
                    var a = b.sd.stop();
                    b.sd = null;
                    ca.il(a)
                }
                b.j.Ra.Bq(null != b.sd)
            }
            ;
            window.requestAnimationFrame(F(this, this.Je));
            this.hh = window.setInterval(function () {
                b.j.Xd.ql(b.ed);
                b.ed = 0
            }, 1E3);
            this.$q = window.setInterval(function () {
                a.v()
            }, 50);
            this.Ye();
            var c = m.s.dd.I();
            if (0 != c) {
                var d = m.s.dd.I();
                a.pl(d);
                this.j.Va.Hb("Extrapolation set to " + c + " msec")
            }
        }

        function Ha() {
        }

        function pb(a, b) {
            this.va = a;
            this.fa = b
        }

        function Cb() {
        }

        function ob(a, b) {
            this.hj = a;
            this.ui = b;
            this.dc = a;
            this.De = window.performance.now()
        }

        function Tb() {
        }

        function wb() {
        }

        function ia() {
        }

        function x() {
        }

        function y() {
        }

        function J() {
        }

        function M(a, b) {
            this.x = a;
            this.y = b
        }

        function Db(a) {
            this.Rb = a.slice()
        }

        function Eb(a, b, c) {
            this.kk = [];
            this.Fk = 5;
            this.td = -1;
            this.Lf = this.Lb = this.yh = this.Lj = 0;
            T.call(this, b);
            a = new A(new DataView(a.buffer), !1);
            if (1212305970 != a.$a())
                throw new q("");
            b = a.$a();
            if (c != b)
                throw new q(new Fb(b));
            this.Te = a.$a();
            c = pako.inflateRaw(a.qb());
            this.Cc = new A(new DataView(c.buffer, c.byteOffset, c.byteLength));
            this.Np(this.Cc);
            c = this.Cc.qb();
            this.Cc = new A(new DataView(c.buffer, c.byteOffset, c.byteLength), !1);
            this.Yh();
            this.yh = window.performance.now();
            this.nc = -1
        }

        function Fb(a) {
            this.Uc = a
        }

        function Ub() {
        }

        function Vb(a) {
            this.Si = new Map;
            this.Pn = new ob(100, 16);
            this.ag = !1;
            this.wb = 0;
            this.ga = a;
            a = u.ca(8);
            a.w(Math.random());
            this.re = a.Nb()
        }

        function Gb(a) {
            this.ej = new Map;
            this.ob = null;
            this.Jf = 32;
            this.se = new Map;
            this.Tb = [];
            this.$h = 4;
            this.Xm = 600;
            var b = this;
            T.call(this, a.state);
            this.Bo = a.Hi;
            this.br = a.version;
            this.Co = 1;
            this.$j = this.nc = 0;
            this.mi = window.performance.now();
            this.Qc = new Ra(this.Bo, a.iceServers, Ub.Ul, a.om);
            this.Qc.oj = F(this, this.Wn);
            this.Qc.rk = function (a) {
                b.To(a)
            }
            ;
            this.Qc.Of = function (a) {
                x.i(b.Of, a)
            }
            ;
            this.Qc.Me = function (a, d) {
                null != b.Me && b.Me(a, d)
            }
        }

        function wa(a, b) {
            this.gi = [];
            this.Uh = [];
            this.Xf = new Ia;
            this.Io = 1;
            this.bd = this.Hl = 0;
            this.si = new Hb(50);
            this.Vf = new Hb(50);
            this.xm = 1E3;
            this.yj = "";
            var c = this;
            T.call(this, b.state);
            this.vh = b.Wr;
            this.te = b.or;
            var d = null
                , d = function (e) {
                c.Xe(0);
                var f = u.ca();
                f.sc(b.version);
                f.Qb(b.password);
                c.gc = new qb(b.Hi, b.iceServers, a, Ub.Ul, f, b.om);
                c.gc.Rg = e;
                c.gc.ld = function (a) {
                    c.gc = null;
                    c.ga = a;
                    a.Pf = function (a) {
                        a = new A(new DataView(a));
                        c.Dp(a)
                    }
                    ;
                    a.Ke = function () {
                        3 != c.bd && x.i(c.Le, Ib.Jg("Connection closed"));
                        c.da()
                    }
                    ;
                    a = window.setTimeout(function () {
                        x.i(c.Le, Ib.Jg("Game state timeout"));
                        c.da()
                    }, 1E4);
                    c.Zd = a;
                    c.Xe(2)
                }
                ;
                c.gc.vk = function () {
                    c.Xe(1)
                }
                ;
                var g = !1;
                c.gc.nk = function () {
                    return g = !0
                }
                ;
                c.gc.Rc = function (a) {
                    if (!e && 1 == c.bd && g)
                        y.i(c.$o),
                            d(!0);
                    else {
                        var b = qb.Ln(a);
                        switch (a.vb) {
                            case 1:
                                a = Ib.Lg(a.code);
                                break;
                            case 2:
                                a = Ib.Ig;
                                break;
                            default:
                                a = Ib.Jg(b)
                        }
                        x.i(c.Le, a);
                        c.da(b)
                    }
                }
            };
            d(null != b.mm && b.mm)
        }

        function T(a) {
            this.ti = new Ia;
            this.ce = this.Vb = 0;
            this.Ud = new Ia;
            this.nc = this.Ub = this.dd = 0;
            this.vc = .06;
            this.Mg = 16.666666666666668;
            this.jf = 120;
            rb.call(this, a)
        }

        function xa() {
        }

        function sb() {
        }

        function Wb(a, b) {
            this.fm = 0;
            this.version = 1;
            this.Cg = 0;
            this.zd = u.ca(1E3);
            this.gf = u.ca(16384);
            var c = this;
            this.version = b;
            var d = this.Cg = a.S;
            this.Gi = a;
            a.L.aa(this.gf);
            a.Xb = function (b) {
                var e = a.S;
                c.gf.ib(e - d);
                d = e;
                c.gf.sc(b.oa);
                l.Ki(b, c.gf)
            }
            ;
            this.zd.sc(0);
            var e = this.Cg;
            a.L.sl(function (b) {
                var d = a.S;
                c.zd.ib(d - e);
                c.zd.u(b);
                c.fm++;
                e = d
            })
        }

        function Xb() {
        }

        function Hb(a) {
            this.Cr = a;
            this.Xa = []
        }

        function Yb() {
        }

        function Sa() {
            this.ia = 0
        }

        function rb(a) {
            this.S = 0;
            this.L = a
        }

        function Ia() {
            this.list = []
        }

        function l() {
            this.ia = 0
        }

        function fc() {
        }

        function tb() {
        }

        function r() {
        }

        function xb(a, b) {
            this.ya = a;
            this.value = b;
            a.textContent = "" + b
        }

        function Ba() {
        }

        function gc() {
        }

        function Aa() {
        }

        function Ja() {
        }

        function G() {
        }

        function u(a, b) {
            null == b && (b = !1);
            this.m = a;
            this.Ka = b;
            this.a = 0
        }

        function A(a, b) {
            null == b && (b = !1);
            this.m = a;
            this.Ka = b;
            this.a = 0
        }

        function Jb(a) {
            this.Wc = null;
            this.Qp = 1E4;
            this.hd = !0;
            var b = this;
            a.mj();
            this.Ja = a.Ja;
            this.Jc = a.Jc;
            this.Wd = a.Wd;
            this.Wc = a.Wc;
            this.Gl = window.performance.now();
            var c = null
                , c = function () {
                var a = b.Qp - b.Lq();
                0 >= a ? b.da() : (window.clearTimeout(b.Il),
                    a = window.setTimeout(c, a + 1E3),
                    b.Il = a)
            };
            c();
            this.Ja.oniceconnectionstatechange = function () {
                var a = b.Ja.iceConnectionState;
                "closed" != a && "failed" != a || b.da()
            }
            ;
            a = 0;
            for (var d = this.Jc; a < d.length;) {
                var e = d[a];
                ++a;
                e.onmessage = function (a) {
                    b.hd && (b.Gl = window.performance.now(),
                    null != b.Pf && b.Pf(a.data))
                }
                ;
                e.onclose = function () {
                    b.da()
                }
            }
        }

        function hc() {
        }

        function Ra(a, b, c, d) {
            this.Tg = new Set;
            this.nf = new Set;
            this.cg = !1;
            this.Dc = null;
            this.P = "";
            this.kq = 5E4;
            this.jq = 1E4;
            this.ad = new Map;
            this.Hq = a;
            this.Bf = b;
            this.Sm = c;
            this.fg = d;
            null == this.fg && (this.fg = "");
            this.ki()
        }

        function Ta(a, b, c) {
            this.Wc = this.Zd = null;
            this.Wd = [];
            this.uj = 0;
            this.xk = !1;
            this.Af = [];
            this.Jc = [];
            var d = this;
            this.Ja = new myRTCPeerConnection({
                iceServers: b
            }, Ta.jn);
            this.th = new Promise(function (a) {
                    d.eo = a
                }
            );
            this.Ja.onicecandidate = function (a) {
                null == a.candidate ? d.eo(d.Af) : (a = a.candidate,
                null != d.Nf && d.Nf(a),
                    d.Af.push(a))
            }
            ;
            for (b = 0; b < c.length;)
                this.on(c[b++]);
            this.P = a
        }

        function qb(a, b, c, d, e, f) {
            this.Rg = this.Zg = !1;
            var g = this;
            this.ga = new Ta(0, b, d);
            this.ga.Rc = function () {
                g.ye(Kb.rm)
            }
            ;
            this.ga.ld = function () {
                null != g.ld && g.ld(new Jb(g.ga));
                g.ga = null;
                g.nj()
            }
            ;
            this.ga.Ih = function (b) {
                g.uq = b;
                g.Y = new WebSocket(a + "client?id=" + c + (null == f ? "" : "&token=" + f));
                g.Y.binaryType = "arraybuffer";
                g.Y.onclose = function (a) {
                    g.Zg || g.ye(Kb.Lg(a.code))
                }
                ;
                g.Y.onerror = function () {
                    g.Zg || g.ye(Kb.Error)
                }
                ;
                g.Y.onmessage = F(g, g.qh);
                g.Y.onopen = function () {
                    null != g.vk && g.vk();
                    g.ga.ni();
                    g.ei(g.uq, g.ga.Af, e);
                    g.ga.Nf = F(g, g.bi);
                    g.ga.th.then(function () {
                        g.Ec(0, null)
                    })
                }
            }
            ;
            this.ga.pn()
        }

        function Zb() {
            this.hash = 0
        }

        function aa() {
        }

        function H() {
        }

        function L() {
        }

        function $b() {
        }

        function C() {
        }

        function ac(a, b) {
            this.r = new RegExp(a, b.split("u").join(""))
        }

        function ya() {
            return t.le(this, "")
        }

        function E(a, b) {
            var c = Object.create(a), d;
            for (d in b)
                c[d] = b[d];
            b.toString !== Object.prototype.toString && (c.toString = b.toString);
            return c
        }

        function F(a, b) {
            if (null == b)
                return null;
            null == b.Og && (b.Og = mc++);
            var c;
            null == a.Di ? a.Di = {} : c = a.Di[b.Og];
            null == c && (c = b.bind(a),
                a.Di[b.Og] = c);
            return c
        }

        var ub = ub || {}, W;
        ac.b = !0;
        ac.prototype = {
            match: function (a) {
                this.r.global && (this.r.lastIndex = 0);
                this.r.cc = this.r.exec(a);
                this.r.Dg = a;
                return null != this.r.cc
            },
            em: function (a) {
                if (null != this.r.cc && 0 <= a && a < this.r.cc.length)
                    return this.r.cc[a];
                throw new q("EReg::matched");
            },
            Ar: function () {
                if (null == this.r.cc)
                    throw new q("No string matched");
                return {
                    Li: this.r.cc.index,
                    xr: this.r.cc[0].length
                }
            },
            zr: function (a, b, c) {
                null == c && (c = -1);
                if (this.r.global) {
                    this.r.lastIndex = b;
                    this.r.cc = this.r.exec(0 > c ? a : C.substr(a, 0, b + c));
                    if (b = null != this.r.cc)
                        this.r.Dg = a;
                    return b
                }
                if (c = this.match(0 > c ? C.substr(a, b, null) : C.substr(a, b, c)))
                    this.r.Dg = a,
                        this.r.cc.index += b;
                return c
            },
            g: ac
        };
        C.b = !0;
        C.Ai = function (a, b) {
            var c = a.charCodeAt(b);
            if (c == c)
                return c
        }
        ;
        C.substr = function (a, b, c) {
            if (null == c)
                c = a.length;
            else if (0 > c)
                if (0 == b)
                    c = a.length + c;
                else
                    return "";
            return a.substr(b, c)
        }
        ;
        C.remove = function (a, b) {
            var c = a.indexOf(b);
            if (-1 == c)
                return !1;
            a.splice(c, 1);
            return !0
        }
        ;
        Math.b = !0;
        $b.b = !0;
        $b.Wl = function (a) {
            var b = [];
            if (null != a) {
                var c = Object.prototype.hasOwnProperty, d;
                for (d in a)
                    "__id__" != d && "hx__closures__" != d && c.call(a, d) && b.push(d)
            }
            return b
        }
        ;
        L.b = !0;
        L.ie = function (a) {
            return t.le(a, "")
        }
        ;
        L.parseInt = function (a) {
            a = parseInt(a, !a || "0" != a[0] || "x" != a[1] && "X" != a[1] ? 10 : 16);
            return isNaN(a) ? null : a
        }
        ;
        H.b = !0;
        H.startsWith = function (a, b) {
            return a.length >= b.length ? C.substr(a, 0, b.length) == b : !1
        }
        ;
        H.wr = function (a, b) {
            var c = C.Ai(a, b);
            return 8 < c && 14 > c ? !0 : 32 == c
        }
        ;
        H.Qr = function (a) {
            for (var b = a.length, c = 0; c < b && H.wr(a, b - c - 1);)
                ++c;
            return 0 < c ? C.substr(a, 0, b - c) : a
        }
        ;
        H.cf = function (a) {
            var b, c = "";
            for (b = 2 - a.length; c.length < b;)
                c += "0";
            return c + (null == a ? "null" : "" + a)
        }
        ;
        H.replace = function (a, b, c) {
            return a.split(b).join(c)
        }
        ;
        H.xg = function (a, b) {
            for (var c = ""; c = "0123456789ABCDEF".charAt(a & 15) + c,
                a >>>= 4,
            0 < a;)
                ;
            if (null != b)
                for (; c.length < b;)
                    c = "0" + c;
            return c
        }
        ;
        aa.b = !0;
        aa.vd = function (a, b) {
            return a.length <= b ? a : C.substr(a, 0, b)
        }
        ;
        aa.jr = function (a) {
            for (var b = "", c = 0, d = a.byteLength; c < d;)
                b += H.xg(a[c++], 2);
            return b
        }
        ;
        Zb.b = !0;
        Zb.prototype = {
            ir: function (a) {
                for (var b = 0, c = a.length; b < c;)
                    this.hash += a[b++],
                        this.hash += this.hash << 10,
                        this.hash ^= this.hash >>> 6
            },
            g: Zb
        };
        var Kb = ub["bas.basnet.FailReason"] = {
            kf: !0,
            Ng: ["PeerFailed", "Rejected", "Cancelled", "Error"],
            rm: {
                vb: 0,
                sb: "bas.basnet.FailReason",
                toString: ya
            },
            Lg: (W = function (a) {
                return {
                    vb: 1,
                    code: a,
                    sb: "bas.basnet.FailReason",
                    toString: ya
                }
            }
                ,
                W.ke = ["code"],
                W),
            Ig: {
                vb: 2,
                sb: "bas.basnet.FailReason",
                toString: ya
            },
            Error: {
                vb: 3,
                sb: "bas.basnet.FailReason",
                toString: ya
            }
        };
        qb.b = !0;
        qb.Ln = function (a) {
            switch (a.vb) {
                case 0:
                    return "Failed";
                case 1:
                    return kc.description(a.code);
                case 2:
                    return "";
                case 3:
                    return "Master connection error"
            }
        }
        ;
        qb.prototype = {
            Qm: function () {
                this.ye(Kb.Ig)
            },
            nj: function () {
                null != this.Y && (this.Y.onclose = null,
                    this.Y.onmessage = null,
                    this.Y.onerror = null,
                    this.Y.onopen = null,
                    this.Y.close(),
                    this.Y = null);
                null != this.ga && (this.ga.da(),
                    this.ga = null)
            },
            ye: function (a) {
                null != this.Rc && this.Rc(a);
                this.nj()
            },
            qh: function (a) {
                a = new A(new DataView(a.data));
                var b = a.G();
                0 < a.m.byteLength - a.a && (a = new A(new DataView(pako.inflateRaw(a.qb()).buffer), !1));
                switch (b) {
                    case 1:
                        for (var b = a.oc(), c = a.$f(), d = [], e = 0; e < c.length;)
                            d.push(new RTCIceCandidate(c[e++]));
                        this.ph(b, d, a);
                        break;
                    case 4:
                        this.oh(new RTCIceCandidate(a.$f()))
                }
            },
            ph: function (a, b) {
                var c = this;
                this.ga.ni(this.Rg ? 1E4 : 4E3);
                this.Zg = !0;
                null != this.nk && this.nk();
                this.ga.Ja.setRemoteDescription(new RTCSessionDescription({
                    sdp: a,
                    type: "answer"
                }), function () {
                    for (var a = 0; a < b.length;)
                        c.ga.Ja.addIceCandidate(b[a++])
                }, function () {
                    c.ye(Kb.Error)
                })
            },
            oh: function (a) {
                this.ga.Ja.addIceCandidate(a)
            },
            Ec: function (a, b) {
                if (null != this.Y) {
                    var c = u.ca(32, !1);
                    c.u(a);
                    null != b && c.Pb(pako.deflateRaw(b.Nb()));
                    this.Y.send(c.$d())
                }
            },
            ei: function (a, b, c) {
                var d = u.ca(32, !1);
                d.u(this.Rg ? 1 : 0);
                d.tc(a.sdp);
                d.pg(b);
                null != c && d.Pb(c.Nb());
                this.Ec(1, d)
            },
            bi: function (a) {
                var b = u.ca(32, !1);
                b.pg(a);
                this.Ec(4, b)
            },
            g: qb
        };
        Ta.b = !0;
        Ta.prototype = {
            ni: function (a) {
                null == a && (a = 1E4);
                window.clearTimeout(this.Zd);
                this.Zd = window.setTimeout(F(this, this.ao), a)
            },
            nn: function (a, b) {
                var c = this;
                this.wj(this.Ja.setRemoteDescription(a).then(function () {
                    return c.Ja.createAnswer()
                }), b, 500)
            },
            pn: function () {
                this.wj(this.Ja.createOffer(), [], 1E3)
            },
            wj: function (a, b, c) {
                var d = this;
                a.then(function (a) {
                    return d.Ja.setLocalDescription(a).then(function () {
                        return a
                    })
                }).then(function (a) {
                    function e() {
                        return a
                    }

                    for (var g = 0; g < b.length;)
                        d.Ti(b[g++]);
                    return fc.Nq(d.th, c).then(e, e)
                }).then(function (a) {
                    d.Ih(a)
                })["catch"](function () {
                    d.zf()
                })
            },
            on: function (a) {
                var b = this
                    , c = {
                    id: this.Jc.length,
                    negotiated: !0,
                    ordered: a.Ji
                };
                a.reliable || (c.maxRetransmits = 0);
                a = this.Ja.createDataChannel(a.name, c);
                a.binaryType = "arraybuffer";
                a.onopen = function () {
                    for (var a = 0, c = b.Jc; a < c.length;)
                        if ("open" != c[a++].readyState)
                            return;
                    null != b.ld && b.ld()
                }
                ;
                a.onclose = function () {
                    b.zf()
                }
                ;
                a.onmessage = function () {
                    b.zf()
                }
                ;
                this.Jc.push(a)
            },
            Ti: function (a) {
                var b = this;
                window.setTimeout(function () {
                    return b.Ja.addIceCandidate(a)
                }, this.uj)
            },
            ao: function () {
                this.zf()
            },
            zf: function () {
                null != this.Rc && this.Rc();
                this.da()
            },
            da: function () {
                this.mj();
                this.Ja.close()
            },
            mj: function () {
                window.clearTimeout(this.Zd);
                this.Ih = this.ld = this.Nf = this.Rc = null;
                this.Ja.onicecandidate = null;
                this.Ja.ondatachannel = null;
                this.Ja.onsignalingstatechange = null;
                this.Ja.oniceconnectionstatechange = null;
                for (var a = 0, b = this.Jc; a < b.length;) {
                    var c = b[a];
                    ++a;
                    c.onopen = null;
                    c.onclose = null;
                    c.onmessage = null
                }
            },
            g: Ta
        };
        var bc = ub["bas.basnet.ConnectionRequestResponse"] = {
            kf: !0,
            Ng: ["Accept", "Reject"],
            qm: {
                vb: 0,
                sb: "bas.basnet.ConnectionRequestResponse",
                toString: ya
            },
            Kg: (W = function (a) {
                return {
                    vb: 1,
                    reason: a,
                    sb: "bas.basnet.ConnectionRequestResponse",
                    toString: ya
                }
            }
                ,
                W.ke = ["reason"],
                W)
        };
        Ra.b = !0;
        Ra.Oj = function (a) {
            try {
                var b = hc.pd(a.candidate);
                if ("srflx" == b.Tq)
                    return b.ho
            } catch (c) {
            }
            return null
        }
        ;
        Ra.prototype = {
            da: function () {
                window.clearTimeout(this.fl);
                window.clearTimeout(this.Td);
                this.Td = null;
                window.clearInterval(this.Ek);
                this.Y.onmessage = null;
                this.Y.onerror = null;
                this.Y.onclose = null;
                this.Y.onopen = null;
                this.Y.close();
                this.Y = null;
                this.Jj()
            },
            hi: function (a) {
                var b = this;
                if (null != this.Dc || null != a) {
                    if (null != this.Dc && null != a && this.Dc.byteLength == a.byteLength) {
                        for (var c = new Uint8Array(this.Dc), d = new Uint8Array(a), e = !1, f = 0, g = this.Dc.byteLength; f < g;) {
                            var n = f++;
                            if (c[n] != d[n]) {
                                e = !0;
                                break
                            }
                        }
                        if (!e)
                            return
                    }
                    this.Dc = a.slice(0);
                    this.cg = !0;
                    null != this.Y && 1 == this.Y.readyState && null == this.Td && (this.di(),
                        this.Td = window.setTimeout(function () {
                            b.Td = null;
                            1 == b.Y.readyState && b.cg && b.di()
                        }, 1E4))
                }
            },
            ki: function (a) {
                function b(a) {
                    a = a.sitekey;
                    if (null == a)
                        throw new q(null);
                    null != d.Me && d.Me(a, function (a) {
                        d.ki(a)
                    })
                }

                function c(a) {
                    var b = a.url;
                    if (null == b)
                        throw new q(null);
                    a = a.token;
                    if (null == a)
                        throw new q(null);
                    d.Y = new WebSocket(b + "?token=" + a);
                    d.Y.binaryType = "arraybuffer";
                    d.Y.onopen = function () {
                        d.$n()
                    }
                    ;
                    d.Y.onclose = function (a) {
                        d.nh(4001 != a.code)
                    }
                    ;
                    d.Y.onerror = function () {
                        d.nh(!0)
                    }
                    ;
                    d.Y.onmessage = F(d, d.qh)
                }

                null == a && (a = "");
                var d = this;
                J.vp(this.Hq, "token=" + this.fg + "&rcr=" + a, J.um).then(function (a) {
                    switch (a.action) {
                        case "connect":
                            c(a);
                            break;
                        case "recaptcha":
                            b(a)
                    }
                })["catch"](function () {
                    d.nh(!0)
                })
            },
            $n: function () {
                var a = this;
                null != this.Dc && this.di();
                this.Ek = window.setInterval(function () {
                    a.ci()
                }, 4E4)
            },
            qh: function (a) {
                a = new A(new DataView(a.data), !1);
                switch (a.G()) {
                    case 1:
                        this.ph(a);
                        break;
                    case 4:
                        this.oh(a);
                        break;
                    case 5:
                        this.Vn(a);
                        break;
                    case 6:
                        this.Yn(a)
                }
            },
            ph: function (a) {
                var b = a.$a(), c = aa.jr(a.qb(a.G())), d, e, f;
                try {
                    a = new A(new DataView(pako.inflateRaw(a.qb()).buffer), !1);
                    d = 0 != a.G();
                    e = a.oc();
                    for (var g = a.$f(), n = [], k = 0; k < g.length;)
                        n.push(new RTCIceCandidate(g[k++]));
                    f = n
                } catch (K) {
                    this.We(b, 0);
                    return
                }
                this.Zn(b, c, e, f, a, d)
            },
            Zn: function (a, b, c, d, e, f) {
                var g = this;
                if (16 <= this.ad.size)
                    this.We(a, 4104);
                else if (this.Tg.has(b))
                    this.We(a, 4102);
                else {
                    for (var n = [], k = 0; k < d.length;) {
                        var K = Ra.Oj(d[k++]);
                        if (null != K) {
                            if (this.nf.has(K)) {
                                this.We(a, 4102);
                                return
                            }
                            n.push(K)
                        }
                    }
                    if (null != this.oj && (k = new A(e.m),
                        k.a = e.a,
                        e = this.oj(b, k),
                    1 == e.vb)) {
                        this.We(a, e.reason);
                        return
                    }
                    var h = new Ta(a, this.Bf, this.Sm);
                    f && (h.uj = 2500);
                    h.Wd = n;
                    h.Wc = b;
                    this.ad.set(a, h);
                    h.Rc = function () {
                        g.Ec(0, h, null);
                        g.ad["delete"](h.P)
                    }
                    ;
                    h.ld = function () {
                        g.ad["delete"](h.P);
                        g.Ec(0, h, null);
                        null != g.rk && g.rk(new Jb(h))
                    }
                    ;
                    h.Ih = function (a) {
                        g.ei(h, a, h.Af, null);
                        h.th.then(function () {
                            g.Ec(0, h, null)
                        });
                        h.Nf = function (a) {
                            g.bi(h, a)
                        }
                    }
                    ;
                    h.ni();
                    h.nn(new RTCSessionDescription({
                        sdp: c,
                        type: "offer"
                    }), d)
                }
            },
            oh: function (a) {
                var b = a.$a(), c;
                try {
                    a = new A(new DataView(pako.inflateRaw(a.qb()).buffer), !1),
                        c = new RTCIceCandidate(a.$f())
                } catch (d) {
                    return
                }
                this.Un(b, c)
            },
            Un: function (a, b) {
                var c = this.ad.get(a);
                if (null != c) {
                    var d = Ra.Oj(b);
                    if (null != d && (c.Wd.push(d),
                        this.nf.has(d)))
                        return;
                    c.Ti(b)
                }
            },
            Vn: function (a) {
                this.P = a.rd(a.G());
                null != this.Of && this.Of(this.P)
            },
            Yn: function (a) {
                this.fg = a.rd(a.m.byteLength - a.a)
            },
            Ec: function (a, b, c) {
                if (!b.xk) {
                    0 == a && (b.xk = !0);
                    b = b.P;
                    var d = u.ca(32, !1);
                    d.u(a);
                    d.rb(b);
                    null != c && d.Pb(pako.deflateRaw(c.Nb()));
                    this.Y.send(d.$d())
                }
            },
            We: function (a, b) {
                var c = u.ca(16, !1);
                c.u(0);
                c.rb(a);
                c.sc(b);
                this.Y.send(c.$d())
            },
            ci: function () {
                var a = u.ca(1, !1);
                a.u(8);
                this.Y.send(a.$d())
            },
            di: function () {
                this.cg = !1;
                var a = u.ca(256, !1);
                a.u(7);
                null != this.Dc && a.og(this.Dc);
                this.Y.send(a.$d())
            },
            ei: function (a, b, c, d) {
                var e = u.ca(32, !1);
                e.tc(b.sdp);
                e.pg(c);
                null != d && e.Pb(d.Nb());
                this.Ec(1, a, e)
            },
            bi: function (a, b) {
                var c = u.ca(32, !1);
                c.pg(b);
                this.Ec(4, a, c)
            },
            Jj: function () {
                for (var a = this.ad.values(), b = a.next(); !b.done;) {
                    var c = b.value
                        , b = a.next();
                    c.da()
                }
                this.ad.clear()
            },
            nh: function (a) {
                var b = this;
                this.Jj();
                window.clearTimeout(this.Td);
                this.Td = null;
                this.cg = !1;
                window.clearInterval(this.Ek);
                window.clearTimeout(this.fl);
                a && (this.fl = window.setTimeout(function () {
                    b.ki()
                }, this.jq + Math.random() * this.kq | 0))
            },
            Jm: function (a) {
                for (var b = 0, c = a.Wd; b < c.length;)
                    this.nf.add(c[b++]);
                null != a.Wc && this.Tg.add(a.Wc);
                return {
                    as: a.Wd,
                    Zr: a.Wc
                }
            },
            Fd: function () {
                this.nf.clear();
                this.Tg.clear()
            },
            g: Ra
        };
        hc.b = !0;
        hc.pd = function (a) {
            a = a.split(" ");
            if ("typ" != a[6])
                throw new q(null);
            return {
                Tq: a[7],
                ho: a[4]
            }
        }
        ;
        Jb.b = !0;
        Jb.prototype = {
            Lq: function () {
                return window.performance.now() - this.Gl
            },
            Mb: function (a, b) {
                if (this.hd) {
                    var c = this.Jc[a];
                    if ("open" == c.readyState) {
                        var d = b.mg();
                        try {
                            c.send(d)
                        } catch (e) {
                            window.console.log(e instanceof q ? e.Ha : e)
                        }
                    }
                }
            },
            da: function () {
                window.clearTimeout(this.Il);
                this.hd && (this.hd = !1,
                    this.Ja.close(),
                null != this.Ke && this.Ke())
            },
            g: Jb
        };
        var kc = {
            b: !0,
            description: function (a) {
                switch (a) {
                    case 4100:
                        return "The room is full.";
                    case 4101:
                        return "Wrong password.";
                    case 4102:
                        return "You are banned from this room.";
                    case 4103:
                        return "Incompatible game version.";
                    default:
                        return "Connection closed (" + a + ")"
                }
            }
        };
        A.b = !0;
        A.tn = function (a, b) {
            var c = a.getUint8(b), d, e, f, g, n, k = b;
            if (0 == (c & 128))
                ++b;
            else if (192 == (c & 224))
                d = a.getUint8(b + 1),
                    c = (c & 31) << 6 | d & 63,
                    b += 2;
            else if (224 == (c & 240))
                d = a.getUint8(b + 1),
                    e = a.getUint8(b + 2),
                    c = (c & 15) << 12 | (d & 63) << 6 | e & 63,
                    b += 3;
            else if (240 == (c & 248))
                d = a.getUint8(b + 1),
                    e = a.getUint8(b + 2),
                    f = a.getUint8(b + 3),
                    c = (c & 7) << 18 | (d & 63) << 12 | (e & 63) << 6 | f & 63,
                    b += 4;
            else if (248 == (c & 252))
                d = a.getUint8(b + 1),
                    e = a.getUint8(b + 2),
                    f = a.getUint8(b + 3),
                    g = a.getUint8(b + 4),
                    c = (c & 3) << 24 | (d & 63) << 18 | (e & 63) << 12 | (f & 63) << 6 | g & 63,
                    b += 5;
            else if (252 == (c & 254))
                d = a.getUint8(b + 1),
                    e = a.getUint8(b + 2),
                    f = a.getUint8(b + 3),
                    g = a.getUint8(b + 4),
                    n = a.getUint8(b + 5),
                    c = (c & 1) << 30 | (d & 63) << 24 | (e & 63) << 18 | (f & 63) << 12 | (g & 63) << 6 | n & 63,
                    b += 6;
            else
                throw new q("Cannot decode UTF8 character at offset " + b + ": charCode (" + c + ") is invalid");
            return {
                "char": c,
                length: b - k
            }
        }
        ;
        A.prototype = {
            qb: function (a) {
                null == a && (a = this.m.byteLength - this.a);
                if (this.a + a > this.m.byteLength)
                    throw new q("Read too much");
                var b = new Uint8Array(this.m.buffer, this.m.byteOffset + this.a, a);
                this.a += a;
                return b
            },
            Rh: function (a) {
                var b = this.qb(a);
                a = new ArrayBuffer(a);
                (new Uint8Array(a)).set(b);
                return a
            },
            Re: function () {
                return this.m.getInt8(this.a++)
            },
            G: function () {
                return this.m.getUint8(this.a++)
            },
            Mp: function () {
                var a = this.m.getInt16(this.a, this.Ka);
                this.a += 2;
                return a
            },
            xb: function () {
                var a = this.m.getUint16(this.a, this.Ka);
                this.a += 2;
                return a
            },
            W: function () {
                var a = this.m.getInt32(this.a, this.Ka);
                this.a += 4;
                return a
            },
            $a: function () {
                var a = this.m.getUint32(this.a, this.Ka);
                this.a += 4;
                return a
            },
            Zf: function () {
                var a = this.m.getFloat32(this.a, this.Ka);
                this.a += 4;
                return a
            },
            A: function () {
                var a = this.m.getFloat64(this.a, this.Ka);
                this.a += 8;
                return a
            },
            yb: function () {
                for (var a = this.a, b = 0, c, d = 0; c = this.m.getUint8(a + b),
                5 > b && (d |= (c & 127) << 7 * b >>> 0),
                    ++b,
                0 != (c & 128);)
                    ;
                this.a += b;
                return d | 0
            },
            rd: function (a) {
                var b = this.a, c, d = "";
                for (a = b + a; b < a;)
                    c = A.tn(this.m, b),
                        b += c.length,
                        d += String.fromCodePoint(c["char"]);
                if (b != a)
                    throw new q("Actual string length differs from the specified: " + (b - a) + " bytes");
                this.a = b;
                return d
            },
            Jb: function () {
                var a = this.yb();
                return 0 >= a ? null : this.rd(a - 1)
            },
            oc: function () {
                return this.rd(this.yb())
            },
            Sk: function () {
                return this.rd(this.G())
            },
            $f: function () {
                var a = this.oc();
                return JSON.parse(a)
            },
            g: A
        };
        u.b = !0;
        u.ca = function (a, b) {
            null == b && (b = !1);
            null == a && (a = 16);
            return new u(new DataView(new ArrayBuffer(a)), b)
        }
        ;
        u.Cn = function (a, b, c) {
            var d = c;
            if (0 > a)
                throw new q("Cannot encode UTF8 character: charCode (" + a + ") is negative");
            if (128 > a)
                b.setUint8(c, a & 127),
                    ++c;
            else if (2048 > a)
                b.setUint8(c, a >> 6 & 31 | 192),
                    b.setUint8(c + 1, a & 63 | 128),
                    c += 2;
            else if (65536 > a)
                b.setUint8(c, a >> 12 & 15 | 224),
                    b.setUint8(c + 1, a >> 6 & 63 | 128),
                    b.setUint8(c + 2, a & 63 | 128),
                    c += 3;
            else if (2097152 > a)
                b.setUint8(c, a >> 18 & 7 | 240),
                    b.setUint8(c + 1, a >> 12 & 63 | 128),
                    b.setUint8(c + 2, a >> 6 & 63 | 128),
                    b.setUint8(c + 3, a & 63 | 128),
                    c += 4;
            else if (67108864 > a)
                b.setUint8(c, a >> 24 & 3 | 248),
                    b.setUint8(c + 1, a >> 18 & 63 | 128),
                    b.setUint8(c + 2, a >> 12 & 63 | 128),
                    b.setUint8(c + 3, a >> 6 & 63 | 128),
                    b.setUint8(c + 4, a & 63 | 128),
                    c += 5;
            else if (-2147483648 > a)
                b.setUint8(c, a >> 30 & 1 | 252),
                    b.setUint8(c + 1, a >> 24 & 63 | 128),
                    b.setUint8(c + 2, a >> 18 & 63 | 128),
                    b.setUint8(c + 3, a >> 12 & 63 | 128),
                    b.setUint8(c + 4, a >> 6 & 63 | 128),
                    b.setUint8(c + 5, a & 63 | 128),
                    c += 6;
            else
                throw new q("Cannot encode UTF8 character: charCode (" + a + ") is too large (>= 0x80000000)");
            return c - d
        }
        ;
        u.Om = function (a) {
            if (0 > a)
                throw new q("Cannot calculate length of UTF8 character: charCode (" + a + ") is negative");
            if (128 > a)
                return 1;
            if (2048 > a)
                return 2;
            if (65536 > a)
                return 3;
            if (2097152 > a)
                return 4;
            if (67108864 > a)
                return 5;
            if (-2147483648 > a)
                return 6;
            throw new q("Cannot calculate length of UTF8 character: charCode (" + a + ") is too large (>= 0x80000000)");
        }
        ;
        u.qf = function (a) {
            for (var b = 0, c = a.length, d = 0; d < c;)
                b += u.Om(C.Ai(a, d++));
            return b
        }
        ;
        u.Pm = function (a) {
            a >>>= 0;
            return 128 > a ? 1 : 16384 > a ? 2 : 2097152 > a ? 3 : 268435456 > a ? 4 : 5
        }
        ;
        u.prototype = {
            mg: function () {
                var a = new ArrayBuffer(this.a)
                    , b = new Uint8Array(this.m.buffer, this.m.byteOffset, this.a);
                (new Uint8Array(a)).set(b);
                return a
            },
            Nb: function () {
                return new Uint8Array(this.m.buffer, this.m.byteOffset, this.a)
            },
            $d: function () {
                return new DataView(this.m.buffer, this.m.byteOffset, this.a)
            },
            Qq: function () {
                return new A(this.$d(), this.Ka)
            },
            ic: function (a) {
                this.m.byteLength < a && this.iq(2 * this.m.byteLength >= a ? 2 * this.m.byteLength : a)
            },
            iq: function (a) {
                if (1 > a)
                    throw new q("Can't resize buffer to a capacity lower than 1");
                if (this.m.byteLength < a) {
                    var b = new Uint8Array(this.m.buffer);
                    a = new ArrayBuffer(a);
                    (new Uint8Array(a)).set(b);
                    this.m = new DataView(a)
                }
            },
            u: function (a) {
                var b = this.a++;
                this.ic(this.a);
                this.m.setUint8(b, a)
            },
            dr: function (a) {
                var b = this.a;
                this.a += 2;
                this.ic(this.a);
                this.m.setInt16(b, a, this.Ka)
            },
            sc: function (a) {
                var b = this.a;
                this.a += 2;
                this.ic(this.a);
                this.m.setUint16(b, a, this.Ka)
            },
            Z: function (a) {
                var b = this.a;
                this.a += 4;
                this.ic(this.a);
                this.m.setInt32(b, a, this.Ka)
            },
            rb: function (a) {
                var b = this.a;
                this.a += 4;
                this.ic(this.a);
                this.m.setUint32(b, a, this.Ka)
            },
            Ql: function (a) {
                var b = this.a;
                this.a += 4;
                this.ic(this.a);
                this.m.setFloat32(b, a, this.Ka)
            },
            w: function (a) {
                var b = this.a;
                this.a += 8;
                this.ic(this.a);
                this.m.setFloat64(b, a, this.Ka)
            },
            Pb: function (a) {
                var b = this.a;
                this.a += a.byteLength;
                this.ic(this.a);
                (new Uint8Array(this.m.buffer, this.m.byteOffset, this.m.byteLength)).set(a, b)
            },
            og: function (a) {
                this.Pb(new Uint8Array(a))
            },
            tc: function (a) {
                this.ib(u.qf(a));
                this.qg(a)
            },
            Qb: function (a) {
                null == a ? this.ib(0) : (this.ib(u.qf(a) + 1),
                    this.qg(a))
            },
            Rl: function (a) {
                var b = u.qf(a);
                if (255 < b)
                    throw new q(null);
                this.u(b);
                this.qg(a)
            },
            pg: function (a) {
                this.tc(JSON.stringify(a))
            },
            qg: function (a) {
                var b = this.a;
                this.ic(b + u.qf(a));
                for (var c = a.length, d = 0; d < c;)
                    b += u.Cn(C.Ai(a, d++), this.m, b);
                this.a = b
            },
            ib: function (a) {
                var b = this.a;
                a >>>= 0;
                this.ic(b + u.Pm(a));
                this.m.setUint8(b, a | 128);
                128 <= a ? (this.m.setUint8(b + 1, a >> 7 | 128),
                    16384 <= a ? (this.m.setUint8(b + 2, a >> 14 | 128),
                        2097152 <= a ? (this.m.setUint8(b + 3, a >> 21 | 128),
                            268435456 <= a ? (this.m.setUint8(b + 4, a >> 28 & 127),
                                a = 5) : (this.m.setUint8(b + 3, this.m.getUint8(b + 3) & 127),
                                a = 4)) : (this.m.setUint8(b + 2, this.m.getUint8(b + 2) & 127),
                            a = 3)) : (this.m.setUint8(b + 1, this.m.getUint8(b + 1) & 127),
                        a = 2)) : (this.m.setUint8(b, this.m.getUint8(b) & 127),
                    a = 1);
                this.a += a
            },
            g: u
        };
        G.b = !0;
        G.Gn = function () {
            try {
                return window.crypto.subtle.generateKey(G.Qg, !0, ["sign", "verify"]).then(function (a) {
                    var b = a.privateKey;
                    return window.crypto.subtle.exportKey("jwk", b).then(function (a) {
                        var c = a.y
                            , e = a.d
                            , f = new G;
                        f.yi = a.x;
                        f.zi = c;
                        f.sj = e;
                        f.Pk = b;
                        return f
                    })
                })
            } catch (a) {
                return Promise.reject(a instanceof q ? a.Ha : a)
            }
        }
        ;
        G.Fn = function (a) {
            a = a.split(".");
            if (4 != a.length || "idkey" != a[0])
                return Promise.reject("Invalid id format");
            var b = a[1]
                , c = a[2]
                , d = a[3];
            return G.hr(b, c, d).then(function (a) {
                var e = new G;
                e.yi = b;
                e.zi = c;
                e.sj = d;
                e.Pk = a;
                return e
            })
        }
        ;
        G.ar = function (a, b) {
            try {
                var c = new A(new DataView(a.buffer, a.byteOffset, a.byteLength), !1);
                c.G();
                var d = c.qb(c.xb())
                    , e = c.qb()
                    , f = new A(new DataView(d.buffer, d.byteOffset, d.byteLength), !1)
                    , g = f.oc()
                    , n = f.oc()
                    , k = f.qb();
                if (k.byteLength != b.byteLength)
                    return Promise.reject(null);
                for (var c = 0, h = k.byteLength; c < h;) {
                    var l = c++;
                    if (k[l] != b[l])
                        return Promise.reject(null)
                }
                return G.gr(g, n).then(function (a) {
                    return window.crypto.subtle.verify(G.tl, a, e, d)
                }).then(function (a) {
                    if (!a)
                        throw new q(null);
                    return g
                })
            } catch (dc) {
                return Promise.reject(dc instanceof q ? dc.Ha : dc)
            }
        }
        ;
        G.hr = function (a, b, c) {
            try {
                return window.crypto.subtle.importKey("jwk", {
                    crv: "P-256",
                    ext: !0,
                    key_ops: ["sign"],
                    kty: "EC",
                    d: c,
                    x: a,
                    y: b
                }, G.Qg, !0, ["sign"])
            } catch (d) {
                return Promise.reject(d instanceof q ? d.Ha : d)
            }
        }
        ;
        G.gr = function (a, b) {
            try {
                return window.crypto.subtle.importKey("jwk", {
                    crv: "P-256",
                    ext: !0,
                    key_ops: ["verify"],
                    kty: "EC",
                    x: a,
                    y: b
                }, G.Qg, !0, ["verify"])
            } catch (c) {
                return Promise.reject(c instanceof q ? c.Ha : c)
            }
        }
        ;
        G.prototype = {
            Sq: function () {
                return "idkey." + this.yi + "." + this.zi + "." + this.sj
            },
            Gq: function (a) {
                try {
                    var b = u.ca(1024);
                    b.u(1);
                    var c = b.a;
                    b.sc(0);
                    var d = b.a;
                    b.tc(this.yi);
                    b.tc(this.zi);
                    b.Pb(a);
                    var e = b.a - d;
                    b.m.setUint16(c, e, b.Ka);
                    var f = new Uint8Array(b.m.buffer, b.m.byteOffset + d, e);
                    return window.crypto.subtle.sign(G.tl, this.Pk, f).then(function (a) {
                        b.og(a);
                        return b.Nb()
                    })
                } catch (g) {
                    return Promise.reject(g instanceof q ? g.Ha : g)
                }
            },
            g: G
        };
        Ja.b = !0;
        Ja.po = function () {
            if (null != Ja.Qh)
                return Ja.Qh;
            Ja.Qh = new Promise(function (a, b) {
                    var c = window.grecaptcha;
                    null != c ? a(c) : (c = window.document.createElement("script"),
                            c.src = "https://www.google.com/recaptcha/api.js?onload=___recaptchaload&render=explicit",
                            window.document.head.appendChild(c),
                            window.___recaptchaload = function () {
                                a(window.grecaptcha)
                            }
                            ,
                            c.onerror = function () {
                                b(null)
                            }
                    )
                }
            );
            return Ja.Qh
        }
        ;
        Aa.b = !0;
        Aa.Hf = function (a) {
            return new PerfectScrollbar(a, {
                handlers: Aa.bo
            })
        }
        ;
        gc.b = !0;
        gc.Er = function () {
            var a = window;
            a.myRTCPeerConnection = a.webkitRTCPeerConnection || a.mozRTCPeerConnection || a.myRTCPeerConnection;
            a.RTCIceCandidate = a.webkitRTCIceCandidate || a.mozRTCIceCandidate || a.RTCIceCandidate;
            a.RTCSessionDescription = a.webkitRTCSessionDescription || a.mozRTCSessionDescription || a.RTCSessionDescription;
            var b = new myRTCPeerConnection({
                iceServers: []
            });
            try {
                b.createAnswer()["catch"](function () {
                })
            } catch (e) {
                var a = a.myRTCPeerConnection.prototype
                    , c = a.createOffer
                    , d = a.createAnswer;
                a.createOffer = function (a) {
                    var b = this;
                    return new Promise(function (d, e) {
                            c.call(b, d, e, a)
                        }
                    )
                }
                ;
                a.createAnswer = function (a) {
                    var b = this;
                    return new Promise(function (c, e) {
                            d.call(b, c, e, a)
                        }
                    )
                }
            }
        }
        ;
        Ba.b = !0;
        Ba.lq = function (a, b) {
            Ba.hl(new Blob([a], {
                type: "octet/stream"
            }), b)
        }
        ;
        Ba.mq = function (a, b) {
            Ba.hl(new Blob([a], {
                type: "text/plain"
            }), b)
        }
        ;
        Ba.hl = function (a, b) {
            var c = window.document.createElement("a");
            c.style.display = "display: none";
            window.document.body.appendChild(c);
            var d = URL.createObjectURL(a);
            c.href = d;
            c.download = b;
            c.click();
            URL.revokeObjectURL(d);
            c.remove()
        }
        ;
        xb.b = !0;
        xb.prototype = {
            set: function (a) {
                this.value != a && (this.value = a,
                    this.ya.textContent = "" + this.value)
            },
            g: xb
        };
        r.b = !0;
        r.za = function (a) {
            var b = new Map
                , c = 0;
            for (a = a.querySelectorAll("[data-hook]"); c < a.length;) {
                var d = a[c++];
                b.set(d.getAttribute("data-hook"), d)
            }
            return b
        }
        ;
        r.Aa = function (a, b) {
            null == b && (b = "div");
            var c = window.document.createElement(b);
            c.innerHTML = a;
            return c.firstElementChild
        }
        ;
        r.he = function (a, b) {
            a.parentElement.replaceChild(b, a)
        }
        ;
        r.ff = function (a) {
            for (var b = a.firstChild; null != b;)
                a.removeChild(b),
                    b = a.firstChild
        }
        ;
        tb.b = !0;
        tb.Fg = function (a) {
            return new Promise(function (b, c) {
                    a.onsuccess = function () {
                        b(a.result)
                    }
                    ;
                    a.onerror = c
                }
            )
        }
        ;
        fc.b = !0;
        fc.Nq = function (a, b) {
            return new Promise(function (c, d) {
                    var e = window.setTimeout(function () {
                        d("Timed out")
                    }, b);
                    a.then(function (a) {
                        window.clearTimeout(e);
                        c(a)
                    }, function (a) {
                        window.clearTimeout(e);
                        d(a)
                    })
                }
            )
        }
        ;
        l.b = !0;
        l.Ta = function (a) {
            null == a.Ma && (a.Ma = !0);
            null == a.Na && (a.Na = !0);
            return a
        }
        ;
        l.Ua = function (a) {
            a.ym = l.af;
            if (null == a.La)
                throw new q("Class doesn't have a config");
            a.prototype.bf = a.La;
            l.$l.set(l.af, a);
            l.af++
        }
        ;
        l.Ki = function (a, b) {
            var c = (null == a ? null : t.Xl(a)).ym;
            if (null == c)
                throw new q("Tried to pack unregistered action");
            b.u(c);
            a.Ca(b)
        }
        ;
        l.Gg = function (a) {
            var b = a.G()
                , b = Object.create(l.$l.get(b).prototype);
            b.ia = 0;
            b.kb = 0;
            b.Ea(a);
            return b
        }
        ;
        l.prototype = {
            hm: function () {
                return !0
            },
            apply: function () {
                throw new q("missing implementation");
            },
            Ea: function () {
                throw new q("missing implementation");
            },
            Ca: function () {
                throw new q("missing implementation");
            },
            g: l
        };
        Ia.b = !0;
        Ia.Dr = function (a, b, c) {
            if (0 == a.length)
                for (a = 0; a < b.length;)
                    c.push(b[a++]);
            else if (0 == b.length)
                for (b = 0; b < a.length;)
                    c.push(a[b++]);
            else
                for (var d = 0, e = a.length, f = 0, g = b.length; ;) {
                    var n = a[d]
                        , k = b[f];
                    if (n.kb <= k.kb) {
                        if (c.push(n),
                            ++d,
                        d >= e) {
                            for (; f < g;)
                                c.push(b[f++]);
                            break
                        }
                    } else if (c.push(k),
                        ++f,
                    f >= g) {
                        for (; d < e;)
                            c.push(a[d++]);
                        break
                    }
                }
        }
        ;
        Ia.prototype = {
            am: function (a) {
                for (var b = 0, c = a.kb, d = a.ia, e = 0, f = this.list; e < f.length;) {
                    var g = f[e];
                    ++e;
                    var n = g.kb;
                    if (n > c)
                        break;
                    if (n == c) {
                        g = g.ia;
                        if (g > d)
                            break;
                        g == d && ++d
                    }
                    ++b
                }
                a.ia = d;
                this.list.splice(b, 0, a)
            },
            Mr: function (a) {
                for (var b = 0, c = 0, d = this.list; c < d.length && !(d[c++].kb >= a);)
                    ++b;
                this.list.splice(0, b)
            },
            lr: function (a, b) {
                for (var c = this.list; 0 < c.length;)
                    c.pop();
                Ia.Dr(a.list, b.list, this.list)
            },
            Nr: function (a) {
                for (var b = 0, c = this.list, d = 0, e = c.length; d < e;) {
                    var f = c[d++];
                    f.de != a && (c[b] = f,
                        ++b)
                }
                for (; c.length > b;)
                    c.pop()
            },
            mr: function (a) {
                for (var b = 0, c = 0, d = this.list; c < d.length && !(d[c++].kb >= a);)
                    ++b;
                return b
            },
            g: Ia
        };
        rb.b = !0;
        rb.prototype = {
            g: rb
        };
        Sa.b = !0;
        Sa.ua = l;
        Sa.prototype = E(l.prototype, {
            apply: function (a) {
                a.cn(this.tg)
            },
            Ca: function (a) {
                a.ib(this.tg.byteLength);
                a.og(this.tg)
            },
            Ea: function (a) {
                this.tg = a.Rh(a.yb())
            },
            g: Sa
        });
        Yb.b = !0;
        Yb.prototype = {
            g: Yb
        };
        Hb.b = !0;
        Hb.prototype = {
            add: function (a) {
                for (var b = this.Xa.length, c = 0, d = this.Cd = 0; d < b;) {
                    var e = d++
                        , f = this.Xa[e];
                    f.index++;
                    f.weight *= .97;
                    this.Xa[c].index < f.index && (c = e);
                    this.Cd += f.weight
                }
                b >= this.Cr ? (b = this.Xa[c],
                    this.Cd -= b.weight,
                    this.Xa.splice(c, 1)) : b = new Xb;
                b.value = a;
                b.weight = 1;
                b.index = 0;
                this.Cd += b.weight;
                for (a = 0; a < this.Xa.length && this.Xa[a].value <= b.value;)
                    ++a;
                this.Xa.splice(a, 0, b)
            },
            Bg: function (a) {
                if (0 == this.Xa.length)
                    return 0;
                if (1 == this.Xa.length)
                    return this.Xa[0].value;
                a *= this.Cd;
                for (var b = this.Xa[0].weight, c = 0; c < this.Xa.length - 1 && !(b >= a);)
                    ++c,
                        b += this.Xa[c].weight;
                return this.Xa[c].value
            },
            max: function () {
                return 0 == this.Xa.length ? 0 : this.Xa[this.Xa.length - 1].value
            },
            g: Hb
        };
        Xb.b = !0;
        Xb.prototype = {
            g: Xb
        };
        Wb.b = !0;
        Wb.prototype = {
            stop: function () {
                this.Gi.Xb = null;
                this.Gi.L.sl(null);
                this.zd.m.setUint16(0, this.fm, this.zd.Ka);
                this.zd.Pb(this.gf.Nb());
                var a = pako.deflateRaw(this.zd.Nb())
                    , b = u.ca(a.byteLength + 32);
                b.qg("HBR2");
                b.rb(this.version);
                b.rb(this.Gi.S - this.Cg);
                b.Pb(a);
                return b.Nb()
            },
            g: Wb
        };
        sb.b = !0;
        xa.b = !0;
        T.b = !0;
        T.ua = rb;
        T.prototype = E(rb.prototype, {
            ma: function () {
                throw new q("missing implementation");
            },
            yf: function () {
                throw new q("missing implementation");
            },
            v: function () {
                throw new q("missing implementation");
            },
            Ui: function (a) {
                for (var b = this.Ud.list, c = 0, d = b.length, e = 0; e < a;) {
                    for (++e; c < d;) {
                        var f = b[c];
                        if (f.kb != this.S)
                            break;
                        f.apply(this.L);
                        null != this.Xb && this.Xb(f);
                        this.Vb++;
                        ++c
                    }
                    this.L.v(1); // la funzione principale del calcolo
                    this.ce += this.Vb;
                    this.Vb = 0;
                    this.S++; // Frame number, ovvero, non frame ma numero di calcolazione eseguite
                }
                for (; c < d;) {
                    a = b[c];
                    if (a.kb != this.S || a.ia != this.Vb)
                        break;
                    a.apply(this.L);
                    null != this.Xb && this.Xb(a);
                    this.Vb++;
                    ++c
                }
                b.splice(0, c)
            },
            eg: function (a) {
                a.kb == this.S && a.ia <= this.Vb ? (a.ia = this.Vb++,
                    a.apply(this.L),
                null != this.Xb && this.Xb(a)) : this.Ud.am(a)
            },
            Pj: function (a, b) {
                if (0 >= a)
                    return this.L;
                a > this.jf && (a = this.jf);
                xa.uc++;
                var c = this.L.jc(), d;
                null != b ? (this.ti.lr(this.Ud, b),
                    d = this.ti) : d = this.Ud;
                d = d.list;
                for (var e = 0, f = d.length, g = this.S, n = a | 0, k = g + n; g <= k;) {
                    for (; e < f;) {
                        var h = d[e];
                        if (h.kb > g)
                            break;
                        h.bf.Na && h.apply(c);
                        ++e
                    }
                    c.v(g != k ? 1 : a - n); // anche da qua
                    ++g
                }
                for (d = this.ti.list; 0 < d.length;)
                    d.pop();
                return c
            },
            vq: function (a) {
                300 < a && (a = 300);
                0 > a && (a = 0);
                this.Ub = this.vc * a | 0
            },
            pl: function (a) {
                this.dd = this.vc * (-200 > a ? -200 : 200 < a ? 200 : a)
            },
            g: T
        });
        var Ib = ub["bas.marf.net.ConnFailReason"] = {
            kf: !0,
            Ng: ["Cancelled", "Rejected", "Other"],
            Ig: {
                vb: 0,
                sb: "bas.marf.net.ConnFailReason",
                toString: ya
            },
            Lg: (W = function (a) {
                return {
                    vb: 1,
                    reason: a,
                    sb: "bas.marf.net.ConnFailReason",
                    toString: ya
                }
            }
                ,
                W.ke = ["reason"],
                W),
            Jg: (W = function (a) {
                return {
                    vb: 2,
                    description: a,
                    sb: "bas.marf.net.ConnFailReason",
                    toString: ya
                }
            }
                ,
                W.ke = ["description"],
                W)
        };
        wa.b = !0;
        wa.Yg = function (a) {
            switch (a.vb) {
                case 0:
                    return "Cancelled";
                case 1:
                    return kc.description(a.reason);
                case 2:
                    return a.description
            }
        }
        ;
        wa.ua = T;
        wa.prototype = E(T.prototype, {
            da: function (a) {
                null != this.gc && (this.gc.Rc = null,
                    this.gc.Qm(),
                    this.gc = null);
                window.clearTimeout(this.Zd);
                null != this.ga && (this.ga.Ke = null,
                    this.ga.da(),
                    this.ga = null);
                this.yj = null == a ? "Connection closed" : a;
                this.Xe(4)
            },
            Xe: function (a) {
                this.bd != a && (this.bd = a,
                null != this.md && this.md(a))
            },
            hd: function () {
                return 3 == this.bd
            },
            v: function () {
                this.hd() && window.performance.now() - this.Hl > this.xm && this.ci();
                this.Lc = window.performance.now() * this.vc + this.si.Bg(.5) - this.S;
                this.ij()
            },
            yf: function () {
                return this.hd() ? (0 > this.Ub && (this.Ub = 0),
                    this.Pj(window.performance.now() * this.vc + this.si.Bg(.5) - this.S + this.Ub + this.dd, this.Xf)) : this.L
            },
            ij: function () {
                0 > this.Lc && (this.Lc = 0);
                this.Lc > this.jf && (this.Lc = this.jf)
            },
            Dp: function (a) {
                switch (a.G()) {
                    case 0:
                        this.Ap(a);
                        break;
                    case 1:
                        this.zp(a);
                        break;
                    case 2:
                        this.wp(a);
                        break;
                    case 3:
                        this.Fp(a);
                        break;
                    case 4:
                        this.Cp(a);
                        break;
                    case 5:
                        this.yp(a);
                        break;
                    case 6:
                        this.Ep(a)
                }
            },
            Ap: function (a) {
                var b = this;
                a = a.qb(a.yb());
                var c = Promise.resolve(null);
                null != this.te && (c = this.te.Gq(a));
                c["catch"](function () {
                    return null
                }).then(function (a) {
                    b.tq(a)
                })
            },
            zp: function (a) {
                a = pako.inflateRaw(a.qb());
                a = new A(new DataView(a.buffer, a.byteOffset, a.byteLength));
                this.nc = a.xb();
                this.S = a.$a();
                this.ce = a.$a();
                this.Vb = a.yb();
                this.Lc = 10;
                for (this.L.ea(a); 0 < a.m.byteLength - a.a;)
                    this.eg(this.Ol(a));
                window.clearTimeout(this.Zd);
                this.Xe(3)
            },
            tq: function (a) {
                var b = u.ca();
                b.u(0);
                null != a ? (b.ib(a.byteLength),
                    b.Pb(a)) : b.ib(0);
                b.ib(this.vh.byteLength);
                b.og(this.vh);
                this.Mb(b);
                this.vh = null
            },
            Mb: function (a, b) {
                null == b && (b = 0);
                this.ga.Mb(b, a)
            },
            Ol: function (a) {
                var b = a.$a()
                    , c = a.yb()
                    , d = a.xb()
                    , e = a.$a();
                a = l.Gg(a);
                a.oa = d;
                a.de = e;
                a.kb = b;
                a.ia = c;
                return a
            },
            wp: function (a) {
                a = this.Ol(a);
                this.eg(a);
                a.oa == this.nc && this.Xf.Nr(a.de);
                this.Qk()
            },
            Ep: function (a) {
                a = l.Gg(a);
                a.oa = 0;
                a.de = 0;
                a.apply(this.L);
                null != this.Xb && this.Xb(a)
            },
            Fp: function (a) {
                var b = a.$a();
                a = a.$a();
                this.Uh.push({
                    frame: b,
                    af: a
                });
                this.Qk()
            },
            Qk: function () {
                if (3 == this.bd) {
                    for (var a = 0, b = this.Uh; a < b.length;) {
                        var c = b[a];
                        ++a;
                        c.frame <= this.S || c.af == this.ce + this.Vb + this.Ud.mr(c.frame) && this.Fm(c.frame - this.S)
                    }
                    for (var a = 0, b = this.Uh, c = 0, d = b.length; c < d;) {
                        var e = b[c++];
                        e.frame > this.S && (b[a] = e,
                            ++a)
                    }
                    for (; b.length > a;)
                        b.pop();
                    this.Xf.Mr(this.S);
                    // INJECTION
                    // console.log("S", this.L.H.wa.K[0].M);
                    if(!window.tutti_i_dati)
                    {
                        window.tutti_i_dati = this;
                    }

                    // console.log('DIFF', new Date().getTime() - window.last_frame);
                    // window.last_frame = new Date().getTime()
                }
            },
            yp: function (a) {
                var b = 0 != a.G()
                    , c = a.oc()
                    , d = "";
                0 < a.m.byteLength - a.a && (d = a.oc());
                a = b ? "You were banned" : "You were kicked";
                "" != d && (a += " by " + d);
                "" != c && (a += " (" + c + ")");
                this.da(a)
            },
            Cp: function (a) {
                var b = a.A();
                a = a.A();
                var c = window.performance.now() - a;
                this.si.add(b - a * this.vc);
                this.Vf.add(c);
                for (var d = b = 0, e = this.gi; d < e.length;) {
                    var f = e[d];
                    ++d;
                    if (f > a)
                        break;
                    f < a ? x.i(this.tk, -1) : x.i(this.tk, c);
                    ++b
                }
                this.gi.splice(0, b)
            },
            ci: function () {
                var a = window.performance.now();
                this.Hl = a;
                this.gi.push(a);
                var b = this.Vf.Bg(.5) | 0
                    , c = u.ca();
                c.u(2);
                c.w(a);
                c.ib(b);
                this.Mb(c, 2)
            },
            Fm: function (a) {
                this.Ui(a);
                this.Lc -= a;
                this.ij()
            },
            ma: function (a) {
                if (3 == this.bd) {
                    var b = this.Io++
                        , c = 0;
                    0 > this.Ub && (this.Ub = 0);
                    a.bf.Ma && (c = this.S + (this.Lc | 0) + this.Ub);
                    var d = u.ca();
                    d.u(1);
                    d.rb(c);
                    d.rb(b);
                    l.Ki(a, d);
                    this.Mb(d);
                    a.bf.Na && (a.de = b,
                        a.oa = this.nc,
                        a.kb = c,
                        this.Xf.am(a))
                }
            },
            g: wa
        });
        Gb.b = !0;
        Gb.ua = T;
        Gb.prototype = E(T.prototype, {
            da: function () {
                this.Qc.da();
                for (var a = 0, b = this.Tb; a < b.length;) {
                    var c = b[a++].ga;
                    c.Ke = null;
                    c.Pf = null;
                    c.da()
                }
            },
            Bn: function (a, b, c, d) {
                var e = this.se.get(a);
                if (null != e) {
                    if (d) {
                        var f = this.Qc.Jm(e.ga);
                        this.ej.set(a, f)
                    }
                    a = u.ca();
                    a.u(5);
                    a.u(d ? 1 : 0);
                    a.tc(b);
                    null == c && (c = "");
                    a.tc(c);
                    e.Mb(a);
                    e.ga.da()
                }
            },
            Fd: function () {
                this.Qc.Fd();
                this.ej.clear()
            },
            hi: function (a) {
                this.Qc.hi(a)
            },
            ma: function (a) {
                a.oa = 0;
                var b = this.S + this.$h + this.Ub;
                a.bf.Ma || (b = this.S);
                a.kb = b;
                this.eg(a);
                this.fi();
                0 < this.Tb.length && this.gg(this.Ch(a), 1)
            },
            v: function () {
                var a = ((window.performance.now() - this.mi) * this.vc | 0) - this.S;
                0 < a && this.Ui(a);
                7 <= this.S - this.ak && this.fi();
                this.S - this.$j >= this.Xm && (this.fi(),
                    this.rq())
            },
            yf: function () {
                0 > this.Ub && (this.Ub = 0);
                return this.Pj((window.performance.now() - this.mi) * this.vc - this.S + this.$h + this.Ub + this.dd)
            },
            Wn: function (a, b) {
                if (this.Tb.length >= this.Jf)
                    return bc.Kg(4100);
                try {
                    if (b.xb() != this.br)
                        throw new q(null);
                } catch (d) {
                    return bc.Kg(4103)
                }
                try {
                    var c = b.Jb();
                    if (null != this.ob && c != this.ob)
                        throw new q(null);
                } catch (d) {
                    return bc.Kg(4101)
                }
                return bc.qm
            },
            To: function (a) {
                var b = this;
                if (this.Tb.length >= this.Jf)
                    a.da();
                else {
                    var c = new Vb(a);
                    this.Tb.push(c);
                    a.Pf = function (a) {
                        a = new A(new DataView(a));
                        b.xp(a, c)
                    }
                    ;
                    a.Ke = function () {
                        C.remove(b.Tb, c);
                        b.se["delete"](c.P);
                        x.i(b.Qo, c.P)
                    }
                    ;
                    a = u.ca(1 + c.re.byteLength);
                    a.u(0);
                    a.ib(c.re.byteLength);
                    a.Pb(c.re);
                    c.Mb(a)
                }
            },
            Ch: function (a) {
                var b = u.ca();
                b.u(2);
                this.yk(a, b);
                return b
            },
            yk: function (a, b) {
                b.rb(a.kb);
                b.ib(a.ia);
                b.sc(a.oa);
                b.rb(a.de);
                l.Ki(a, b)
            },
            fi: function () {
                if (!(0 >= this.S - this.ak) && 0 != this.Tb.length) {
                    var a = u.ca();
                    a.u(3);
                    a.rb(this.S);
                    a.rb(this.ce);
                    this.gg(a, 2);
                    this.ak = this.S
                }
            },
            gg: function (a, b) {
                null == b && (b = 0);
                for (var c = 0, d = this.Tb; c < d.length;) {
                    var e = d[c];
                    ++c;
                    e.ag && e.Mb(a, b)
                }
            },
            sq: function (a) {
                var b = u.ca();
                b.u(1);
                var c = u.ca();
                c.sc(a.P);
                c.rb(this.S);
                c.rb(this.ce);
                c.ib(this.Vb);
                this.L.aa(c);
                for (var d = this.Ud.list, e = 0, f = d.length; e < f;)
                    this.yk(d[e++], c);
                b.Pb(pako.deflateRaw(c.Nb()));
                a.Mb(b)
            },
            rq: function () {
                this.$j = this.S;
                if (0 != this.Tb.length) {
                    var a = new Sa;
                    a.kb = this.S;
                    a.ia = this.Vb++;
                    a.oa = 0;
                    a.tg = this.L.In();
                    this.gg(this.Ch(a))
                }
            },
            Hp: function (a, b) {
                var c = this
                    , d = a.qb(a.yb())
                    , e = a.qb(a.yb())
                    , f = b.re;
                b.re = null;
                G.ar(d, f)["catch"](function () {
                    return null
                }).then(function (a) {
                    try {
                        if (-1 != c.Tb.indexOf(b)) {
                            b.Xr = a;
                            var d = c.Co++;
                            b.P = d;
                            c.se.set(d, b);
                            ia.i(c.Po, d, new A(new DataView(e.buffer, e.byteOffset, e.byteLength), !1));
                            b.ag = !0;
                            c.sq(b)
                        }
                    } catch (k) {
                        c.Qj(b, k instanceof q ? k.Ha : k)
                    }
                })
            },
            xp: function (a, b) {
                this.v();
                try {
                    if (!b.Pn.Kl())
                        throw new q(1);
                    var c = a.G();
                    if (b.ag)
                        switch (c) {
                            case 1:
                                this.Ip(a, b);
                                break;
                            case 2:
                                this.Bp(a, b);
                                break;
                            default:
                                throw new q(0);
                        }
                    else if (0 == c)
                        this.Hp(a, b);
                    else
                        throw new q(0);
                    if (0 < a.m.byteLength - a.a)
                        throw new q(2);
                } catch (d) {
                    this.Qj(b, d instanceof q ? d.Ha : d)
                }
            },
            Qj: function (a, b) {
                window.console.log(b);
                this.se["delete"](a.P);
                C.remove(this.Tb, a);
                a.ag && null != this.pk && this.pk(a.P);
                a.ga.da()
            },
            Bp: function (a, b) {
                var c = a.A();
                b.wb = a.yb();
                var d = u.ca();
                d.u(4);
                d.w((window.performance.now() - this.mi) * this.vc + this.$h);
                d.w(c);
                b.Mb(d, 2)
            },
            Ip: function (a, b) {
                var c = a.$a()
                    , d = a.$a()
                    , e = l.Gg(a)
                    , f = e.bf.km;
                if (null != f) {
                    var g = b.Si.get(f);
                    null == g && (g = new ob(f.Tl, f.pm),
                        b.Si.set(f, g));
                    if (!g.Kl())
                        throw new q(3);
                }
                f = this.S;
                g = this.S + 120;
                e.de = d;
                e.oa = b.P;
                e.kb = c < f ? f : c > g ? g : c;
                e.hm(this.L) && (this.eg(e),
                    this.gg(this.Ch(e), 1))
            },
            g: Gb
        });
        Vb.b = !0;
        Vb.prototype = {
            Mb: function (a, b) {
                null == b && (b = 0);
                this.ga.Mb(b, a)
            },
            g: Vb
        };
        Ub.b = !0;
        Fb.b = !0;
        Fb.prototype = {
            g: Fb
        };
        Eb.b = !0;
        Eb.ua = T;
        Eb.prototype = E(T.prototype, {
            Np: function (a) {
                for (var b = a.xb(), c = 0, d = 0; d < b;) {
                    ++d;
                    var c = c + a.yb()
                        , e = a.G();
                    this.kk.push({
                        Li: c / this.Te,
                        kind: e
                    })
                }
            },
            Rk: function () {
                var a = this.Cc;
                0 < a.m.byteLength - a.a ? (a = this.Cc.yb(),
                    this.Lf += a,
                    a = this.Cc.xb(),
                    this.Kf = l.Gg(this.Cc),
                    this.Kf.oa = a) : this.Kf = null
            },
            On: function () {
                return this.S / this.Te
            },
            ma: function () {
            },
            yf: function () {
                this.v();
                xa.uc++;
                var a = this.L.jc();
                a.v(this.Lj);
                return a
            },
            v: function () {
                var a = window.performance.now()
                    , b = a - this.yh;
                this.yh = a;
                0 < this.td ? (this.Lb += 1E4,
                this.Lb > this.td && (this.Lb = this.td,
                    this.td = -1)) : this.Lb += b * this.Fk;
                a = this.Te * this.Mg;
                this.Lb > a && (this.Lb = a);
                b = this.Lb * this.vc;
                a = b | 0;
                for (this.Lj = b - a; this.S < a;) {
                    for (; null != this.Kf && this.Lf == this.S;)
                        b = this.Kf,
                            b.apply(this.L),
                        null != this.Xb && this.Xb(b),
                            this.Rk();
                    this.S++;
                    this.L.v(1)
                }
            },
            pq: function (a) {
                this.td = a;
                a < this.Lb && this.Yh()
            },
            Yh: function () {
                this.Lf = 0;
                this.Lb = this.S = this.Cc.a = 0;
                this.L.ea(this.Cc);
                this.Rk()
            },
            g: Eb
        });
        Db.b = !0;
        Db.prototype = {
            eval: function (a) {
                var b = this.Rb.length - 1;
                if (a <= this.Rb[0])
                    return this.Rb[1];
                if (a >= this.Rb[b])
                    return this.Rb[b - 2];
                for (var c = 0, b = b / 5 | 0; ;) {
                    var d = b + c >>> 1;
                    a > this.Rb[5 * d] ? c = d + 1 : b = d - 1;
                    if (!(c <= b))
                        break
                }
                c = 5 * b;
                b = this.Rb[c];
                a = (a - b) / (this.Rb[c + 5] - b);
                b = a * a;
                d = b * a;
                return (2 * d - 3 * b + 1) * this.Rb[c + 1] + (d - 2 * b + a) * this.Rb[c + 2] + (-2 * d + 3 * b) * this.Rb[c + 3] + (d - b) * this.Rb[c + 4]
            },
            g: Db
        };
        M.b = !0;
        M.prototype = {
            g: M
        };
        J.b = !0;
        J.cl = function (a, b, c, d, e) {
            return new Promise(function (f, g) {
                    var n = new XMLHttpRequest;
                    n.open(b, a);
                    n.responseType = c;
                    n.onload = function () {
                        200 <= n.status && 300 > n.status ? null != n.response ? f(n.response) : g(null) : g("status: " + n.status)
                    }
                    ;
                    n.onerror = function (a) {
                        g(a)
                    }
                    ;
                    null != e && n.setRequestHeader("Content-type", e);
                    n.send(d)
                }
            )
        }
        ;
        J.I = function (a, b) {
            return J.cl(a, "GET", b, null)
        }
        ;
        J.Mj = function (a) {
            return J.I(a, "json").then(function (a) {
                var b = a.error;
                if (null != b)
                    throw new q(b);
                return a.data
            })
        }
        ;
        J.up = function (a, b, c) {
            return J.cl(a, "POST", "json", b, c)
        }
        ;
        J.vp = function (a, b, c) {
            return J.up(a, b, c).then(function (a) {
                var b = a.error;
                if (null != b)
                    throw new q(b);
                return a.data
            })
        }
        ;
        y.b = !0;
        y.i = function (a) {
            null != a && a()
        }
        ;
        x.b = !0;
        x.i = function (a, b) {
            null != a && a(b)
        }
        ;
        ia.b = !0;
        ia.i = function (a, b, c) {
            null != a && a(b, c)
        }
        ;
        wb.b = !0;
        wb.i = function (a, b, c, d) {
            null != a && a(b, c, d)
        }
        ;
        Tb.b = !0;
        Tb.i = function (a, b, c, d, e) {
            null != a && a(b, c, d, e)
        }
        ;
        ob.b = !0;
        ob.prototype = {
            Kl: function (a) {
                null == a && (a = 1);
                this.v();
                return a <= this.dc ? (this.dc -= a,
                    !0) : !1
            },
            Mq: function (a) {
                this.v();
                a -= this.dc;
                return 0 >= a ? 0 : this.De + a * this.ui - window.performance.now()
            },
            kn: function (a, b) {
                var c = this.Mq(a);
                this.dc -= a;
                window.setTimeout(b, c | 0)
            },
            v: function () {
                var a = window.performance.now()
                    , b = Math.floor((a - this.De) / this.ui);
                this.De += b * this.ui;
                this.dc += b;
                this.dc >= this.hj && (this.dc = this.hj,
                    this.De = a)
            },
            g: ob
        };
        Cb.b = !0;
        Cb.pd = function (a) {
            var b = new ac("([^&=]+)=?([^&]*)", "g");
            a = a.substring(1);
            for (var c = 0, d = new Map; b.zr(a, c);) {
                var c = b.em(1)
                    , c = decodeURIComponent(c.split("+").join(" "))
                    , e = b.em(2);
                d.set(c, decodeURIComponent(e.split("+").join(" ")));
                c = b.Ar();
                c = c.Li + c.xr
            }
            return d
        }
        ;
        Cb.I = function () {
            return Cb.pd(window.top.location.search)
        }
        ;
        pb.b = !0;
        pb.lp = function (a) {
            if (3 > a.length)
                throw new q("Not enough arguments");
            if (7 < a.length)
                throw new q("Too many arguments");
            var b = new Oa
                , c = new ka;
            b.ug = c;
            switch (a[1]) {
                case "blue":
                    c.cb = [p.ta.X];
                    b.$ = p.ta;
                    break;
                case "red":
                    c.cb = [p.ba.X];
                    b.$ = p.ba;
                    break;
                default:
                    throw new q('First argument must be either "red" or "blue"');
            }
            if ("clear" == a[2])
                return b;
            c.Xc = 256 * L.parseInt(a[2]) / 360 | 0;
            c.Tc = L.parseInt("0x" + a[3]);
            if (4 < a.length) {
                c.cb = [];
                for (var d = 4, e = a.length; d < e;)
                    c.cb.push(L.parseInt("0x" + a[d++]))
            }
            return b
        }
        ;
        pb.prototype = {
            pd: function (a) {
                var b = this;
                if ("/" != a.charAt(0))
                    return !1;
                if (1 == a.length)
                    return !0;
                a = H.Qr(C.substr(a, 1, null)).split(" ");
                var c = a[0];
                switch (c) {
                    case "avatar":
                        2 == a.length && (this.ol(a[1]),
                            this.fa("Avatar set"));
                        break;
                    case "checksum":
                        a = this.va.L.U;
                        var d = a.o;
                        a.ze() ? this.fa('Current stadium is original: "' + d + '"') : (a = H.xg(a.lj(), 8),
                            this.fa('Stadium: "' + d + '" (checksum: ' + a + ")"));
                        break;
                    case "clear_avatar":
                        this.ol(null);
                        this.fa("Avatar cleared");
                        break;
                    case "clear_bans":
                        null == this.Fd ? this.fa("Only the host can clear bans") : (this.Fd(),
                            this.fa("All bans have been cleared"));
                        break;
                    case "clear_password":
                        null == this.hg ? this.fa("Only the host can change the password") : (this.hg(null),
                            this.fa("Password cleared"));
                        break;
                    case "colors":
                        try {
                            d = pb.lp(a),
                                this.va.ma(d)
                        } catch (f) {
                            d = f instanceof q ? f.Ha : f,
                            "string" == typeof d && this.fa(d)
                        }
                        break;
                    case "extrapolation":
                        2 == a.length ? (d = L.parseInt(a[1]),
                            null != d && -200 <= d && 200 >= d ? (m.s.dd.Sa(d),
                                this.va.pl(d),
                                this.fa("Extrapolation set to " + d + " msec")) : this.fa("Extrapolation must be a value between -200 and 200 milliseconds")) : this.fa("Extrapolation requires a value in milliseconds.");
                        break;
                    case "handicap":
                        2 == a.length ? (d = L.parseInt(a[1]),
                            null != d && 0 <= d && 300 >= d ? (this.va.vq(d),
                                this.fa("Ping handicap set to " + d + " msec")) : this.fa("Ping handicap must be a value between 0 and 300 milliseconds")) : this.fa("Ping handicap requires a value in milliseconds.");
                        break;
                    case "set_password":
                        2 == a.length && (null == this.hg ? this.fa("Only the host can change the password") : (this.hg(a[1]),
                            this.fa("Password set")));
                        break;
                    case "store":
                        var e = this.va.L.U;
                        e.ze() ? this.fa("Can't store default stadium.") : Z.Or().then(function () {
                            return Z.add(e)
                        }).then(function () {
                            b.fa("Stadium stored")
                        }, function () {
                            b.fa("Couldn't store stadium")
                        });
                        break;
                    default:
                        this.fa('Unrecognized command: "' + c + '"')
                }
                return !0
            },
            ol: function (a) {
                null != a && (a = aa.vd(a, 2));
                m.s.Sg.Sa(a);
                this.va.ma(qa.na(a))
            },
            g: pb
        };
        Ha.b = !0;
        ca.b = !0;
        ca.il = function (a) {
            var b = new Date;
            Ba.lq(a, "HBReplay-" + b.getFullYear() + "-" + H.cf("" + (b.getMonth() + 1)) + "-" + H.cf("" + b.getDate()) + "-" + H.cf("" + b.getHours()) + "h" + H.cf("" + b.getMinutes()) + "m.hbr2")
        }
        ;
        ca.Kp = function (a) {
            for (var b = a.L.D, c = [], d = 0, e = 0, f = 0; f < b.length;) {
                var g = b[f];
                ++f;
                g.$ == p.Fa && c.push(g.T);
                g.$ == p.ba ? ++d : g.$ == p.ta && ++e
            }
            f = c.length;
            0 != f && (b = function () {
                return c.splice(Math.random() * c.length | 0, 1)[0]
            }
                ,
                e == d ? 2 > f || (a.ma(R.na(b(), p.ba)),
                    a.ma(R.na(b(), p.ta))) : (d = e > d ? p.ba : p.ta,
                    a.ma(R.na(b(), d))))
        }
        ;
        ca.prototype = {
            Jq: function () {
                this.sd = new Wb(this.va, 2)
            },
            Fq: function (a) {
                var b = this;
                a = new eb(a);
                a.nb = function () {
                    b.j.ab(null)
                }
                ;
                a.Jh = function (a, d, e) {
                    b.va.ma(Y.na(a, d, e));
                    b.j.ab(null)
                }
                ;
                this.j.ab(a.f)
            },
            da: function () {
                window.document.removeEventListener("keydown", F(this, this.nd));
                window.document.removeEventListener("keyup", F(this, this.od));
                window.onbeforeunload = null;
                window.cancelAnimationFrame(this.ne);
                this.mb.da();
                window.clearInterval(this.hh);
                window.clearInterval(this.$q);
                window.clearTimeout(this.tf)
            },
            hq: function (a) {
                for (var b = [], c = 0, d = this.va.L.D; c < d.length;) {
                    var e = d[c];
                    ++c;
                    e.$ == a && b.push(R.na(e.T, p.Fa))
                }
                for (a = 0; a < b.length;)
                    this.va.ma(b[a++])
            },
            Je: function () {
                this.ne = window.requestAnimationFrame(F(this, this.Je));
                this.mb.v();
                this.va.v();
                this.Bc()
            },
            Bc: function () {
                var a = window.performance.now();
                1 == m.s.gh.I() && 28.333333333333336 > a - this.Nc || (this.Nc = a,
                    this.ed++,
                    this.Ye(),
                    a = this.va.L.ka(this.va.nc),
                null != a && (this.ai = a.ra),
                    this.j.v(this.va))
            },
            Oo: function (a) {
                var b = this;
                this.Xg.pd(a) || this.Um.kn(1, function () {
                    var c = new Ma;
                    c.df = a;
                    b.va.ma(c)
                })
            },
            No: function (a) {
                var b = this;
                this.$g = a;
                null == this.tf && (this.tf = window.setTimeout(function () {
                    b.tf = null;
                    b.ml(b.$g)
                }, 1E3),
                    this.ml(this.$g))
            },
            ml: function (a) {
                a != this.Zj && (this.va.ma(ma.na(a ? 0 : 1)),
                    this.Zj = a)
            },
            Jl: function () {
                if (null != this.va.L.H) {
                    var a = new Na;
                    a.ef = 120 != this.va.L.H.Ga;
                    this.va.ma(a)
                }
            },
            nd: function (a) {
                switch (a.keyCode) {
                    case 9:
                    case 13:
                        this.j.Va.eb.focus();
                        a.preventDefault();
                        break;
                    case 27:
                        if (this.j.jo())
                            this.j.ab(null);
                        else {
                            var b = this.j;
                            b.Vd(!b.ud)
                        }
                        a.preventDefault();
                        break;
                    case 49:
                        m.s.Ob.Sa(1);
                        break;
                    case 50:
                        m.s.Ob.Sa(2);
                        break;
                    case 51:
                        m.s.Ob.Sa(3);
                        break;
                    case 52:
                        m.s.Ob.Sa(0);
                        break;
                    case 80:
                        this.Jl();
                        break;
                    default:
                        // INJECTION
                        // console.log('this', this);
                        this.mb.nd(a.code)
                }
            },
            Ye: function () {
                var a = m.s.Ob.I()
                    , b = this.j.Gb
                    , c = b.Db;
                0 == a ? (b.ig(!0),
                    c.Qe = 1,
                    c.Pe = 0,
                    c.be = 0) : (b.ig(!1),
                    c.be = 35,
                    -1 == a ? c.Pe = 450 : (c.Pe = 0,
                        c.Qe = 1 + .25 * (a - 1)))
            },
            od: function (a) {
                this.mb.od(a.code)
            },
            g: ca
        };
        Ab.b = !0;
        Ab.prototype = {
            vi: function (a) {
                var b = this.j.Va.wc
                    , c = []
                    , d = 0;
                for (a = a.D; d < a.length;) {
                    var e = a[d];
                    ++d;
                    c.push({
                        o: e.o,
                        P: e.T
                    })
                }
                b.bj = c
            },
            Vh: function (a) {
                var b = this;
                this.vi(a);
                a.Jk = function (c) {
                    b.j.Va.Hb("" + c.o + " has joined");
                    m.Ya.Pd(m.Ya.ko);
                    b.vi(a)
                }
                ;
                a.Kk = function (c, d, e, f) {
                    x.i(b.Wo, c.T);
                    null == d ? c = "" + c.o + " has left" : (f = f.o,
                        Tb.i(b.Vo, c.T, d, f, e),
                        c = "" + c.o + " was " + (e ? "banned" : "kicked") + " by " + f + " " + ("" != d ? " (" + d + ")" : ""));
                    b.j.Va.Hb(c);
                    m.Ya.Pd(m.Ya.no);
                    b.vi(a)
                }
                ;
                a.Hk = function (a, d) {
                    var c = null != b.sh && -1 != d.indexOf(b.sh);
                    b.j.Va.fa("" + a.o + ": " + d, c ? "highlight" : null);
                    m.s.wl.I() && c ? m.Ya.Pd(m.Ya.co) : m.s.ul.I() && m.Ya.Pd(m.Ya.Tm)
                }
                ;
                a.Oh = function () {
                    m.Ya.Pd(m.Ya.lo)
                }
                ;
                a.oi = function (a) {
                    m.Ya.Pd(m.Ya.Qn);
                    var c = b.j.Gb.Db.fd;
                    c.Ia(a == p.ba ? c.Rp : c.Lm)
                }
                ;
                a.pi = function (a) {
                    var c = b.j.Gb.Db.fd;
                    c.Ia(a == p.ba ? c.Sp : c.Mm);
                    b.j.Va.Hb("" + a.o + " team won the match")
                }
                ;
                a.Ck = function (a, d, e) {
                    d && !e && b.j.Va.Hb("Game paused by " + a.o)
                }
                ;
                a.ri = function () {
                    var a = b.j.Gb.Db.fd;
                    a.Ia(a.Kq)
                }
                ;
                a.li = function (a) {
                    b.j.Vd(!1);
                    b.j.Gb.Db.fd.Ym();
                    b.j.Va.Hb("Game started by " + a.o)
                }
                ;
                a.Ze = function (a) {
                    null != a && b.j.Va.Hb("Game stopped by " + a.o)
                }
                ;
                a.ji = function (a, d) {
                    if (!d.ze()) {
                        var c = H.xg(d.lj(), 8);
                        b.j.Va.Hb("" + a.o + ' loaded "' + d.o + '" (' + c + ")")
                    }
                }
                ;
                a.Ik = function (a) {
                    b.j.Va.Hb("" + a.o + " " + (a.xd ? "has desynchronized" : "is back in sync"))
                }
                ;
                a.Nk = function (c, d, e) {
                    null != a.H && b.j.Va.Hb("" + d.o + " was moved to " + e.o + " by " + c.o)
                }
                ;
                a.Nh = function (a, d) {
                    var c = d.o
                        , f = a.o;
                    b.j.Va.Hb(d.ra ? "" + c + " was given admin rights by " + f : "" + c + "'s admin rights were taken away by " + f)
                }
                ;
                a.Mk = function (a, d) {
                    b.j.Gb.Db.Xn(a, d)
                }
            },
            Vq: function (a) {
                a.Jk = null;
                a.Kk = null;
                a.Hk = null;
                a.Oh = null;
                a.oi = null;
                a.pi = null;
                a.Ck = null;
                a.ri = null;
                a.li = null;
                a.Ze = null;
                a.ji = null;
                a.Ik = null;
                a.Nk = null;
                a.Nh = null;
                a.Mk = null
            },
            g: Ab
        };
        Qa.b = !0;
        Qa.Xj = function (a) {
            switch (m.s.Wf.I().I(a)) {
                case "Down":
                    return 2;
                case "Kick":
                    return 16;
                case "Left":
                    return 4;
                case "Right":
                    return 8;
                case "Up":
                    return 1;
                default:
                    return 0
            }
        }
        ;
        // BOTTONI. L'oggeto di input?
        Qa.prototype = {
            da: function () {
                window.document.removeEventListener("focusout", F(this, this.qk))
            },
            v: function () {
                var a = this.Id;
                if (null != this.Rf && a != this.Ef) {
                    this.Ef = a;
                    var b = new Fa;
                    b.input = a;
                    this.Rf(b)
                }
            },
            nd: function (a) {
                this.Id |= Qa.Xj(a); // Aggiunge un flag binario quando si preme un pottone
            },
            od: function (a) {
                this.Id &= ~Qa.Xj(a); // Toglie un flag binario
            },
            qk: function () {
                if (null != this.Rf && 0 != this.Ef) {
                    this.Ef = this.Id = 0;
                    var a = new Fa;
                    a.input = 0;
                    this.Rf(a)
                }
            },
            g: Qa
        };
        S.b = !0;
        S.ih = function (a) {
            return S.xf(JSON.parse(a))
        }
        ;
        S.xf = function (a) {
            var b = new S;
            b.lc = a.lat;
            b.mc = a.lon;
            b.lb = a.code.toLowerCase();
            return b
        }
        ;
        S.Nn = function () {
            return J.Mj(m.mf + "api/geo").then(function (a) {
                return S.xf(a)
            })
        }
        ;
        S.prototype = {
            ae: function () {
                return JSON.stringify({
                    lat: this.lc,
                    lon: this.mc,
                    code: this.lb
                })
            },
            g: S
        };
        Sb.b = !0;
        Sb.prototype = {
            mh: function () {
                return null != this.xe.I() ? this.xe.I() : null != this.we.I() ? this.we.I() : new S
            },
            g: Sb
        };
        Rb.b = !0;
        Rb.Zl = function () {
            try {
                var a = window.localStorage;
                a.getItem("");
                if (0 == a.length) {
                    var b = "_hx_" + Math.random();
                    a.setItem(b, b);
                    a.removeItem(b)
                }
                return a
            } catch (c) {
                return null
            }
        }
        ;
        Ga.b = !0;
        Ga.prototype = {
            I: function () {
                return this.Pl
            },
            Sa: function (a) {
                this.Pl = a;
                if (null != this.Bh)
                    try {
                        var b = this.er(a);
                        null == b ? this.Bh.removeItem(this.o) : this.Bh.setItem(this.o, b)
                    } catch (c) {
                    }
            },
            g: Ga
        };
        V.b = !0;
        V.xf = function (a) {
            for (var b = new V, c = $b.Wl(a), d = 0; d < c.length;) {
                var e = c[d];
                ++d;
                b.Mc.set(e, a[e])
            }
            return b
        }
        ;
        V.ih = function (a) {
            return V.xf(JSON.parse(a))
        }
        ;
        V.tj = function () {
            var a = new V;
            // Queste regole traducono i nome dei bottoni nelle azioni
            a.Ia("ArrowUp", "Up");
            a.Ia("KeyW", "Up");
            a.Ia("ArrowDown", "Down");
            a.Ia("KeyS", "Down");
            a.Ia("ArrowLeft", "Left");
            a.Ia("KeyA", "Left");
            a.Ia("ArrowRight", "Right");
            a.Ia("KeyD", "Right");
            a.Ia("KeyX", "Kick");
            a.Ia("Space", "Kick");
            a.Ia("ControlLeft", "Kick");
            a.Ia("ControlRight", "Kick");
            a.Ia("ShiftLeft", "Kick");
            a.Ia("ShiftRight", "Kick");
            a.Ia("Numpad0", "Kick");
            return a
        }
        ;
        V.prototype = {
            Ia: function (a, b) {
                this.Mc.set(a, b)
            },
            I: function (a) {
                return this.Mc.get(a)
            },
            Vp: function (a) {
                this.Mc["delete"](a)
            },
            Mn: function (a) {
                for (var b = [], c = this.Mc.keys(), d = c.next(); !d.done;) {
                    var e = d.value
                        , d = c.next();
                    this.Mc.get(e) == a && b.push(e)
                }
                return b
            },
            ae: function () {
                for (var a = {}, b = this.Mc.keys(), c = b.next(); !c.done;) {
                    var d = c.value
                        , c = b.next();
                    a[d] = this.Mc.get(d)
                }
                return JSON.stringify(a)
            },
            g: V
        };
        m.b = !0;
        Bb.b = !0;
        Bb.prototype = {
            g: Bb
        };
        v.b = !0;
        v.xo = function () {
            gc.Er();
            w.Ei(function () {
                v.Dj(v.Gp)
            });
            v.qo()
        }
        ;
        v.qo = function () {
            var a = m.s.aj.I();
            if (null == a)
                G.Gn().then(function (a) {
                    v.te = a;
                    m.s.aj.Sa(a.Sq())
                })["catch"](function () {
                    return {}
                });
            else
                G.Fn(a).then(function (a) {
                    return v.te = a
                })["catch"](function () {
                    return {}
                })
        }
        ;
        v.Jn = function () {
            var a = Rb.Zl();
            return null != a ? null != a.getItem("crappy_router") : !1
        }
        ;
        v.Dj = function (a) {
            var b = new jb(m.s.Qd.I());
            b.sk = function (b) {
                m.s.Qd.Sa(b);
                m.Ya.el();
                a()
            }
            ;
            w.Da(b.f);
            b.Ab.focus()
        }
        ;
        v.Ej = function (a, b) {
            var c = new P(a);
            c.Qa = b;
            w.Da(c.f)
        }
        ;
        v.Gp = function () {
            var a = Cb.I()
                , b = a.get("c")
                , c = a.get("p");
            a.get("v");
            null != b ? null != c ? v.eh(b) : v.vf(b) : v.Fb()
        }
        ;
        v.Fb = function () {
            var a = new ga(m.s.mh());
            w.Da(a.ya);
            a.gm = function (b) {
                if (b.Cf) {
                    var c = new O("Open Flash version?", "This room is a flash version room, open anyway?", ["Cancel", "Ok"]);
                    w.Da(c.f);
                    c.Qa = function (d) {
                        w.Da(a.ya);
                        0 != d && window.top.open("http://www.haxball.com/?roomid=" + b.P + (b.yc.ob ? "&pass=1" : ""), "_self");
                        return c.Qa = null
                    }
                } else if (8 != b.yc.Uc) {
                    var d, e;
                    8 > b.yc.Uc ? (d = "Old version room",
                        e = "The room is running an older version, an update must have happened recently.") : (d = "New version",
                        e = "The room is running a new version of haxball, refresh the site to update.");
                    var f = new O(d, e, ["Ok"]);
                    w.Da(f.f);
                    f.Qa = function () {
                        w.Da(a.ya);
                        return f.Qa = null
                    }
                } else
                    b.yc.ob ? v.eh(b.P) : v.vf(b.P)
            }
            ;
            a.Hr = function () {
                v.wn()
            }
            ;
            a.Gr = function () {
                v.Dj(v.Fb)
            }
            ;
            a.Jr = function () {
                v.Gj()
            }
            ;
            a.Ir = function (a) {
                v.xn(a)
            }
        }
        ;
        v.Gj = function () {
            var a = new ba(!0)
                , b = window.document.createElement("div");
            b.className = "view-wrapper";
            b.appendChild(a.f);
            w.Da(b);
            a.nb = function () {
                v.Fb()
            }
            ;
            a.Mo = function () {
                var a = new lb
                    , b = window.document.createElement("div");
                b.className = "view-wrapper";
                b.appendChild(a.f);
                w.Da(b);
                return a.nb = function () {
                    v.Gj()
                }
            }
        }
        ;
        v.Eh = function (a, b) {
            return "" + window.location.origin + "/play?c=" + a + (b ? "&p=1" : "")
        }
        ;
        v.wn = function () {
            var a = m.s.Qd.I()
                , b = new hb("" + a + "'s room");
            w.Da(b.f);
            b.Hh = function () {
                v.Fb()
            }
            ;
            b.Ro = function (b) {
                function c() {
                    if (!b.Ur) {
                        var a = new nb;
                        a.Uc = 8;
                        a.o = g.$b;
                        a.D = g.D.length;
                        a.Md = k.Jf + 1;
                        a.lb = f.lb;
                        a.ob = null != k.ob;
                        a.lc = f.lc;
                        a.mc = f.mc;
                        var c = u.ca(16);
                        a.aa(c);
                        a = c.mg();
                        k.hi(a)
                    }
                }

                w.Da((new O("Creating room", "Connecting...", [])).f);
                var e = null
                    , f = m.s.mh()
                    , g = new fa;
                g.$b = b.name;
                var n = new ea;
                n.o = a;
                n.ra = !0;
                n.wd = f.lb;
                n.jb = m.s.Sg.I();
                g.D.push(n);
                var k = new Gb({
                    iceServers: m.Bf,
                    Hi: m.mf + "api/host",
                    state: g,
                    version: 8
                });
                k.Jf = b.Br - 1;
                k.ob = b.password;
                c();
                var h = new ca(k)
                    , l = !1;
                k.Me = function (a, b) {
                    v.Ej(a, function (a) {
                        b(a);
                        w.Da(h.j.f);
                        return l = !0
                    })
                }
                ;
                var p = window.setInterval(function () {
                    var a = la.na(k);
                    k.ma(a)
                }, 3E3);
                k.pk = function (a) {
                    null != g.ka(a) && (a = Y.na(a, "Bad actor", !1),
                        k.ma(a))
                }
                ;
                k.Po = function (a, b) {
                    var d = b.oc();
                    if (25 < d.length)
                        throw new q("name too long");
                    var e = b.oc();
                    if (3 < e.length)
                        throw new q("country too long");
                    var f = b.Jb();
                    if (null != f && 2 < f.length)
                        throw new q("avatar too long");
                    d = na.na(a, d, e, f);
                    k.ma(d);
                    c()
                }
                ;
                k.Qo = function (a) {
                    null != g.ka(a) && (a = Y.na(a, null, !1),
                        k.ma(a))
                }
                ;
                k.Of = function (a) {
                    e = a;
                    h.dg = v.Eh(a, null != k.ob);
                    l || (l = !0,
                        w.Da(h.j.f))
                }
                ;
                h.jh.Vo = function (a, b, c, d) {
                    k.Bn(a, b, c, d)
                }
                ;
                h.jh.Wo = function () {
                    c()
                }
                ;
                h.j.Nd = function () {
                    k.da();
                    h.da();
                    v.Fb();
                    window.clearInterval(p)
                }
                ;
                h.Xg.hg = function (a) {
                    k.ob = a;
                    c();
                    null != e && (h.dg = v.Eh(e, null != k.ob))
                }
                ;
                h.Xg.Fd = F(k, k.Fd)
            }
        }
        ;
        v.eh = function (a) {
            var b = new Xa;
            w.Da(b.f);
            b.Qa = function (b) {
                null == b ? v.Fb() : v.vf(a, b)
            }
        }
        ;
        v.xn = function (a) {
            try {
                var b = new Qb(new Eb(new Uint8Array(a), new fa, 2));
                b.Se.Nd = function () {
                    b.da();
                    v.Fb()
                }
                ;
                w.Da(b.j.f)
            } catch (e) {
                var c = e instanceof q ? e.Ha : e;
                if (c instanceof Fb)
                    a = new O("Incompatible replay version", "The replay file is of a different version", ["Open player", "Cancel"]),
                        w.Da(a.f),
                        a.Qa = function (a) {
                            0 == a ? (a = window.top.location,
                                window.top.open(a.protocol + "//" + a.hostname + (null != a.port ? ":" + a.port : "") + "/replay?v=" + c.Uc, "_self")) : v.Fb()
                        }
                    ;
                else {
                    var d = new O("Replay error", "Couldn't load the file.", ["Ok"]);
                    w.Da(d.f);
                    d.Qa = function () {
                        d.Qa = null;
                        v.Fb()
                    }
                }
            }
        }
        ;
        v.vf = function (a, b) {
            try {
                var c = v.Jn()
                    , d = new fa
                    , e = u.ca();
                e.tc(m.s.Qd.I());
                e.tc(m.s.mh().lb);
                e.Qb(m.s.Sg.I());
                var f = m.Bf
                    , g = m.fr
                    , n = e.mg()
                    , k = new wa(a, {
                    iceServers: f,
                    Hi: g,
                    state: d,
                    version: 8,
                    Wr: n,
                    password: b,
                    mm: c,
                    om: m.s.Lp.I(),
                    or: v.te
                })
                    , h = new ib;
                h.fa("Connecting to master...");
                h.Vg.onclick = function () {
                    k.md = null;
                    k.Le = null;
                    k.da();
                    v.Fb()
                }
                ;
                w.Da(h.f);
                var l = function (a, b) {
                    var c = new gb(a, b);
                    c.Qa = function () {
                        v.Fb()
                    }
                    ;
                    w.Da(c.f)
                }
                    , p = function () {
                    var b = new ca(k);
                    k.tk = function (a) {
                        b.j.Xd.Aq((10 * k.Vf.Bg(.5) | 0) / 10);
                        b.j.Xd.yq((10 * k.Vf.max() | 0) / 10);
                        b.j.Xd.Dk.Dm(a)
                    }
                    ;
                    b.dg = v.Eh(a, !1);
                    w.Da(b.j.f);
                    b.j.Nd = function () {
                        k.md = null;
                        k.da();
                        b.da();
                        v.Fb()
                    }
                    ;
                    k.md = function () {
                        k.md = null;
                        b.da();
                        var a = null == b.sd ? null : b.sd.stop();
                        l(k.yj, a)
                    }
                };
                k.Le = function (c) {
                    k.Le = null;
                    k.md = null;
                    if (1 == c.vb)
                        switch (c.reason) {
                            case 4002:
                                v.Ej(m.Pp, function () {
                                    v.vf(a, b)
                                });
                                break;
                            case 4101:
                                null == b ? v.eh(a) : l(wa.Yg(c), null);
                                break;
                            default:
                                l(wa.Yg(c), null)
                        }
                    else
                        l(wa.Yg(c), null)
                }
                ;
                k.md = function (a) {
                    switch (a) {
                        case 1:
                            h.fa("Connecting to peer...");
                            break;
                        case 2:
                            h.fa("Awaiting state...");
                            break;
                        case 3:
                            p()
                    }
                }
                ;
                k.$o = function () {
                    h.fa("Trying reverse connection...")
                }
            } catch (U) {
                window.console.log(U instanceof q ? U.Ha : U),
                    c = new O("Unexpected Error", "", []),
                    c.uf.innerHTML = "An error ocurred while attempting to join the room.<br><br>This might be caused by a browser extension, try disabling all extensions and refreshing the site.<br><br>The error has been printed to the inspector console.",
                    w.Da(c.f)
            }
        }
        ;
        w.b = !0;
        w.vr = function () {
            try {
                return window.self != window.top
            } catch (a) {
                return !0
            }
        }
        ;
        w.yg = function (a) {
            return new Promise(function (b, c) {
                    var d = window.document.createElement("img");
                    d.onload = function () {
                        URL.revokeObjectURL(d.src);
                        d.onload = null;
                        b(d)
                    }
                    ;
                    d.onerror = function () {
                        URL.revokeObjectURL(d.src);
                        c(null)
                    }
                    ;
                    return d.src = URL.createObjectURL(new Blob([a], {
                        type: "image/png"
                    }))
                }
            )
        }
        ;
        w.Ei = function (a) {
            w.vr() && w.pr(function () {
                ec.Ei();
                var b;
                null == m.s.we.I() ? S.Nn().then(function (a) {
                    m.s.we.Sa(a)
                }, function () {
                    return {}
                }) : b = Promise.resolve(null);
                return Promise.all([J.I("res.dat", "arraybuffer").then(function (a) {
                    a = new JSZip(a);
                    m.Ya = new Pb(a);
                    return Promise.all([m.Ya.zn, w.yg(a.file("images/grass.png").asArrayBuffer()).then(function (a) {
                        return m.Sn = a
                    }), w.yg(a.file("images/concrete.png").asArrayBuffer()).then(function (a) {
                        return m.fn = a
                    }), w.yg(a.file("images/concrete2.png").asArrayBuffer()).then(function (a) {
                        return m.dn = a
                    }), w.yg(a.file("images/typing.png").asArrayBuffer()).then(function (a) {
                        return m.Ll = a
                    })])
                }), b]).then(function () {
                    w.Fr(a)
                })
            })
        }
        ;
        w.pr = function (a) {
            for (var b = Modernizr, c = "canvas datachannel dataview es6collections peerconnection promises websockets".split(" "), d = [], e = 0; e < c.length;) {
                var f = c[e];
                ++e;
                b[f] || d.push(f)
            }
            0 != d.length ? (window.document.body.innerHTML = "",
                w.rg = window.document.createElement("div"),
                window.document.body.appendChild(w.rg),
                a = new Ua(d),
                w.Da(a.f)) : a()
        }
        ;
        w.Fr = function (a) {
            window.document.body.innerHTML = "";
            w.rg = window.document.createElement("div");
            window.document.body.appendChild(w.rg);
            var b = null
                , b = function () {
                m.Ya.el();
                window.document.removeEventListener("click", b, !0)
            };
            window.document.addEventListener("click", b, !0);
            a()
        }
        ;
        w.Da = function (a) {
            null != w.dm && w.dm.remove();
            null != a && (w.rg.appendChild(a),
                w.dm = a)
        }
        ;
        Qb.b = !0;
        Qb.prototype = {
            da: function () {
                window.document.removeEventListener("keydown", F(this, this.nd));
                window.document.removeEventListener("keyup", F(this, this.od));
                window.onbeforeunload = null;
                window.cancelAnimationFrame(this.ne);
                window.clearInterval(this.hh)
            },
            Je: function () {
                this.ne = window.requestAnimationFrame(F(this, this.Je));
                this.va.v();
                this.Bc()
            },
            Bc: function () {
                this.Se.v();
                var a = window.performance.now();
                1 == m.s.gh.I() && 28.333333333333336 > a - this.Nc || (this.Nc = a,
                    this.ed++,
                    this.Ye(m.s.Ob.I()),
                0 < this.va.td || this.j.v(this.va))
            },
            nd: function (a) {
                switch (a.keyCode) {
                    case 27:
                        var b = this.j;
                        b.Vd(!b.ud);
                        a.preventDefault();
                        break;
                    case 49:
                        m.s.Ob.Sa(1);
                        break;
                    case 50:
                        m.s.Ob.Sa(2);
                        break;
                    case 51:
                        m.s.Ob.Sa(3);
                        break;
                    case 52:
                        m.s.Ob.Sa(0)
                }
            },
            Ye: function (a) {
                var b = this.j.Gb;
                0 >= a ? (b.ig(!0),
                    b.Db.Qe = 1,
                    b.Db.be = 0) : (b.ig(!1),
                    b.Db.be = 35,
                    b.Db.Qe = 1 + .25 * (a - 1))
            },
            od: function () {
            },
            g: Qb
        };
        nb.b = !0;
        nb.prototype = {
            jj: function () {
                this.o = aa.vd(this.o, 40);
                this.lb = aa.vd(this.lb, 3)
            },
            aa: function (a) {
                this.jj();
                a.Ka = !0;
                a.sc(this.Uc);
                a.Rl(this.o);
                a.Rl(this.lb);
                a.Ql(this.lc);
                a.Ql(this.mc);
                a.u(this.ob ? 1 : 0);
                a.u(this.Md);
                a.u(this.D);
                a.Ka = !1
            },
            ea: function (a) {
                a.Ka = !0;
                this.Uc = a.xb();
                this.o = a.Sk();
                this.lb = a.Sk();
                this.lc = a.Zf();
                this.mc = a.Zf();
                this.ob = 0 != a.G();
                this.Md = a.G();
                this.D = a.G();
                a.Ka = !1;
                if (30 < this.D || 30 < this.Md)
                    throw new q(null);
                this.jj()
            },
            g: nb
        };
        va.b = !0;
        va.parse = function (a) {
            a.G();
            for (var b = []; 0 != a.m.byteLength - a.a;) {
                var c = a.rd(a.xb())
                    , d = a.Rh(a.xb());
                try {
                    var e = new nb;
                    e.ea(new A(new DataView(d), !1));
                    var f = new Bb;
                    f.yc = e;
                    f.P = c;
                    b.push(f)
                } catch (g) {
                }
            }
            return b
        }
        ;
        va.ur = function (a, b, c, d) {
            return Math.acos(Math.sin(a) * Math.sin(c) + Math.cos(a) * Math.cos(c) * Math.cos(b - d))
        }
        ;
        va.Rr = function (a, b) {
            for (var c = a.lc, d = a.mc, e = 0; e < b.length;) {
                var f = b[e];
                ++e;
                var g = f.yc;
                // Il raggio della terra? :)
                f.ve = 6378 * va.ur(.017453292519943295 * g.lc, .017453292519943295 * g.mc, .017453292519943295 * c, .017453292519943295 * d);
                isFinite(f.ve) || (f.ve = 22E3)
            }
        }
        ;
        va.get = function () {
            return J.I(m.mf + "api/list", "arraybuffer").then(function (a) {
                return va.parse(new A(new DataView(a), !1))
            })
        }
        ;
        Z.b = !0;
        Z["delete"] = function (a) {
            return null == window.indexedDB ? Promise.reject("IndexedDB not supported by browser.") : new Promise(function (b, c) {
                    var d = window.indexedDB.open("stadiums", 1);
                    d.onblocked = d.onerror = c;
                    d.onupgradeneeded = function (a) {
                        var b = d.result;
                        b.onerror = c;
                        1 > a.oldVersion && (b.createObjectStore("files", {
                            autoIncrement: !0
                        }),
                            b.createObjectStore("meta", {
                                keyPath: "id"
                            }))
                    }
                    ;
                    d.onsuccess = function () {
                        var e = d.result;
                        e.onerror = c;
                        var f = e.transaction(["meta", "files"], "readwrite");
                        f.onerror = f.onabort = function (a) {
                            c(a);
                            e.close()
                        }
                        ;
                        f.oncomplete = function () {
                            b(0);
                            e.close()
                        }
                        ;
                        f.objectStore("files")["delete"](a);
                        f.objectStore("meta")["delete"](a)
                    }
                }
            )
        }
        ;
        Z.get = function (a) {
            return null == window.indexedDB ? Promise.reject("IndexedDB not supported by browser.") : new Promise(function (b, c) {
                    var d = window.indexedDB.open("stadiums", 1);
                    d.onblocked = d.onerror = c;
                    d.onupgradeneeded = function (a) {
                        var b = d.result;
                        b.onerror = c;
                        1 > a.oldVersion && (b.createObjectStore("files", {
                            autoIncrement: !0
                        }),
                            b.createObjectStore("meta", {
                                keyPath: "id"
                            }))
                    }
                    ;
                    d.onsuccess = function () {
                        var e = d.result;
                        e.onerror = c;
                        var f = e.transaction(["files"]);
                        f.onerror = f.onabort = function (a) {
                            c(a);
                            e.close()
                        }
                        ;
                        f.oncomplete = function () {
                            e.close()
                        }
                        ;
                        tb.Fg(f.objectStore("files").get(a)).then(function (a) {
                            try {
                                var d = new h;
                                d.bk(a);
                                b(d)
                            } catch (k) {
                                c(k instanceof q ? k.Ha : k)
                            }
                        }, c)
                    }
                }
            )
        }
        ;
        Z.getAll = function () {
            return null == window.indexedDB ? Promise.reject("IndexedDB not supported by browser.") : new Promise(function (a, b) {
                    var c = window.indexedDB.open("stadiums", 1);
                    c.onblocked = c.onerror = b;
                    c.onupgradeneeded = function (a) {
                        var d = c.result;
                        d.onerror = b;
                        1 > a.oldVersion && (d.createObjectStore("files", {
                            autoIncrement: !0
                        }),
                            d.createObjectStore("meta", {
                                keyPath: "id"
                            }))
                    }
                    ;
                    c.onsuccess = function () {
                        var d = c.result;
                        d.onerror = b;
                        var e = d.transaction(["meta"]);
                        e.onerror = e.onabort = function (a) {
                            b(a);
                            d.close()
                        }
                        ;
                        e.oncomplete = function () {
                            d.close()
                        }
                        ;
                        tb.Fg(e.objectStore("meta").getAll()).then(a, b)
                    }
                }
            )
        }
        ;
        Z.Or = function () {
            var a = window.navigator.storage;
            if (null == a || null == a.persist)
                return Promise.resolve(!1);
            try {
                return a.persisted().then(function (b) {
                    return b ? !0 : a.persist()
                })["catch"](function () {
                    return !1
                })
            } catch (b) {
                return Promise.resolve(!1)
            }
        }
        ;
        Z.add = function (a) {
            return null == window.indexedDB ? Promise.reject("IndexedDB not supported by browser.") : new Promise(function (b, c) {
                    var d = window.indexedDB.open("stadiums", 1);
                    d.onblocked = d.onerror = c;
                    d.onupgradeneeded = function (a) {
                        var b = d.result;
                        b.onerror = c;
                        1 > a.oldVersion && (b.createObjectStore("files", {
                            autoIncrement: !0
                        }),
                            b.createObjectStore("meta", {
                                keyPath: "id"
                            }))
                    }
                    ;
                    d.onsuccess = function () {
                        var e = d.result;
                        e.onerror = c;
                        var f = e.transaction(["files", "meta"], "readwrite");
                        f.onerror = f.onabort = function (a) {
                            c(a);
                            e.close()
                        }
                        ;
                        f.oncomplete = function () {
                            b(0);
                            e.close()
                        }
                        ;
                        try {
                            tb.Fg(f.objectStore("files").add(a.ae())).then(function (b) {
                                b = {
                                    name: a.o,
                                    id: b
                                };
                                return tb.Fg(f.objectStore("meta").add(b))
                            })["catch"](c)
                        } catch (g) {
                            c(0)
                        }
                    }
                }
            )
        }
        ;
        Pb.b = !0;
        Pb.prototype = {
            el: function () {
                this.c.resume()
            },
            Pd: function (a) {
                var b = this.c.createBufferSource();
                b.buffer = a;
                b.connect(this.Gf);
                b.start()
            },
            rl: function (a) {
                this.Gf.gain.value = a
            },
            g: Pb
        };
        Ob.b = !0;
        Ob.prototype = {
            update: function () {
                var a = window.performance.now()
                    , b = a - this.cm;
                this.cm = a;
                this.ee += (this.Eg - this.ee) * this.Tr;
                this.hf -= b;
                0 >= this.hf && (this.hf = this.Eg = 0);
                0 >= this.Eg && .05 > this.ee && (window.clearInterval(this.Hg),
                    this.Hg = null,
                    this.ee = 0);
                this.vg.gain.value = m.s.vl.I() ? this.ee : 0
            },
            Ni: function (a) {
                var b = this;
                this.Eg = a;
                this.hf = 166.66666666666666;
                null == this.Hg && (this.Hg = window.setInterval(function () {
                    b.update()
                }, 17),
                    this.cm = window.performance.now())
            },
            connect: function (a) {
                this.vg.connect(a)
            },
            Vr: function (a) {
                var b = a.H;
                if (null != b)
                    if (2 == b.zb)
                        0 >= b.Ga && this.Ni(1);
                    else if (1 == b.zb) {
                        var c = b.wa.K[b.ec]
                            , d = null
                            , e = null
                            , f = null
                            , g = 0
                            , n = null
                            , k = null
                            , h = null
                            , l = 0
                            , m = p.ba.dh
                            , q = 0;
                        for (a = a.D; q < a.length;) {
                            var r = a[q];
                            ++q;
                            if (null != r.F) {
                                var t = r.F.a
                                    , v = c.a
                                    , u = t.x - v.x
                                    , t = t.y - v.y
                                    , u = u * u + t * t;
                                if (r.$ == p.ba) {
                                    if (null == d || d.a.x * m < r.F.a.x * m)
                                        d = r.F;
                                    if (null == e || e.a.x * m > r.F.a.x * m)
                                        e = r.F;
                                    if (null == f || u < g)
                                        f = r.F,
                                            g = u
                                } else if (r.$ == p.ta) {
                                    if (null == n || n.a.x * m < r.F.a.x * m)
                                        n = r.F;
                                    if (null == k || k.a.x * m > r.F.a.x * m)
                                        k = r.F;
                                    if (null == h || u < l)
                                        h = r.F,
                                            l = u
                                }
                            }
                        }
                        null != k && null != e && 0 >= b.Ga && (f.a.x > k.a.x && c.a.x > k.a.x && 20 < c.a.x && this.Ni(.3),
                        h.a.x < e.a.x && c.a.x < e.a.x && -20 > c.a.x && this.Ni(.3))
                    }
            },
            g: Ob
        };
        ua.b = !0;
        ua.prototype = {
            aa: function (a) {
                var b = this.a;
                a.w(b.x);
                a.w(b.y);
                b = this.M;
                a.w(b.x);
                a.w(b.y);
                a.w(this.la);
                a.w(this.l);
                a.w(this.pa);
                a.w(this.Ba);
                a.rb(this.X);
                a.Z(this.h);
                a.Z(this.B)
            },
            ea: function (a) {
                var b = this.a;
                b.x = a.A();
                b.y = a.A();
                b = this.M;
                b.x = a.A();
                b.y = a.A();
                this.la = a.A();
                this.l = a.A();
                this.pa = a.A();
                this.Ba = a.A();
                this.X = a.$a();
                this.h = a.W();
                this.B = a.W()
            },
            zo: function () {
                var a = new X;
                this.Tj(a);
                return a
            },
            Tj: function (a) {
                var b = a.a
                    , c = this.a;
                b.x = c.x;
                b.y = c.y;
                b = a.M;
                c = this.M;
                b.x = c.x;
                b.y = c.y;
                a.la = this.la;
                a.l = this.l;
                a.pa = this.pa;
                a.Ba = this.Ba;
                a.X = this.X;
                a.h = this.h;
                a.B = this.B
            },
            g: ua
        };
        ta.b = !0;
        ta.je = [sb];
        ta.cd = function (a, b) {
            a.Pa = b.Pa.jc();
            a.fb = b.fb;
            a.xa = b.xa;
            a.wa = b.wa.jc();
            a.ec = b.ec;
            a.pc = b.pc;
            a.zb = b.zb;
            a.Kb = b.Kb;
            a.Cb = b.Cb;
            a.Ac = b.Ac;
            a.Ga = b.Ga;
            a.U = b.U;
            a.Jd = b.Jd;
            var c = a.kd
                , d = b.kd;
            c.x = d.x;
            c.y = d.y
        }
        ;
        ta.prototype = {
            fo: function (a) {
                // console.log('ta.fo(a), a=', a); // non è successo
                this.Pa = a;
                this.yo();
                this.fb = a.fb;
                this.xa = a.xa;
                this.U = a.U;
                this.wa.C = this.U.C;
                this.wa.ha = this.U.ha;
                this.wa.O = this.U.O;
                a = 0;
                for (var b = this.U.K; a < b.length;)
                    this.wa.K.push(b[a++].zo());
                this.Yj()
            },
            yo: function () {
                var a = new X;
                this.ec = this.wa.K.length;
                this.wa.K.push(a)
                console.log('ta.yo(), a = new X, this.wa.K.push(a), this.wa.K=', this.wa.K); // nuova partita
            },
            Uj: function (a) {
                if (a.$ == p.Fa)
                    a.F = null;
                else {
                    a.mb = 0;
                    var b = a.F;
                    null == b && (b = new X,
                        a.F = b,
                        this.wa.K.push(b));
                    var c = this.U.Rd;
                    b.X = 0;
                    b.la = 15;
                    b.pa = c.pa;
                    b.Ba = c.Ba;
                    b.l = c.l;
                    b.h = 39;
                    b.B = a.$.B;
                    b.a.x = a.$.dh * this.U.Sb;
                    b.a.y = 0;
                    a = b.M;
                    a.x = 0;
                    a.y = 0
                }
            },
            v: function (a) {
                // INJECTION
                // window._h = h;
                window._this = this;

                if(this.wa.K.length > 5 && this.wa.K[6] && this.wa.K[6].a) {
                    var start_params = [
                        this.wa.K[0].a.x,
                        this.wa.K[0].a.y,
                        this.wa.K[0].M.x,
                        this.wa.K[0].M.y,
                        this.wa.K[6].a.x,
                        this.wa.K[6].a.y,
                        this.wa.K[6].M.x,
                        this.wa.K[6].M.y,
                        this.Pa.D[2].mb,
                        this.wa.K[5].a.x,
                        this.wa.K[5].a.y,
                        this.wa.K[5].M.x,
                        this.wa.K[5].M.y,
                        this.Pa.D[1].mb,
                        this.Ac,
                        this.Kb,
                        this.Cb
                    ];
                }

                if (0 < this.Ga)
                    120 > this.Ga && this.Ga--;
                else {
                    var b = this.Pa.Yr;
                    if(b != null)
                    {
                        b(); // ?
                    }
                    // Iterazione per i giocatori, this.Pa.D - la lista degli oggetti della classe ea (giocatori)
                    for (var c = this.Pa.D, b = this.wa.K[this.ec], d = 0; d < c.length;) {
                        // c - un giocatore, b - oggetto fisico (saranno 6)
                        var e = c[d];
                        ++d;
                        if (e.F != null) { // se c'è l'oggetto fisico
                            var f = b.a // le coordinate della palla
                                , g = e.F.a // posizione del giocatore
                                , n = f.x - g.x // delta x
                                , g = f.y - g.y // delta y
                                , k = Math.sqrt(n * n + g * g) - b.la - e.F.la; // .la - raggio dell'oggetto. Distanza minima tra il giocatore e la palla
                                // cioe: distanza tra i due meno raggio della palla meno il raggio del giocatore

                            // Allora. e.mb - lo stato binario dell'input di un giocatore.
                            /*
                                Down: 2;
                                Kick: 16;
                                Left: 4;
                                Right: 8;
                                Up: 1;
                                NULL: 0
                                }
                             */
                            if((e.mb & 16) == 0) // se non c'e il kick
                            {
                                e.bc = 0;
                            }
                            else {
                                var put_breakpoint_here = 42; // succede quando si preme spazio!
                                // console.log('spazio!'); // Spazio è attivo per 10-20 esecuzioni di questa funzione
                            }
                            f = this.U.Rd; // Variabile fisica del giocatore, forse il giocatore dell'utente
                            if (e.bc && 4 > k) {
                                // Eseguire il calcio perche' la palla e' vicina (<4px) e lo stato del bottone KICK non e' 0
                                if (0 != f.Kd) { // se kickStrength non e' 0
                                    // Entra qua quando la palla viene calciata
                                    var k = Math.sqrt(n * n + g * g) // la distanza tra i centri
                                        , h = f.Kd // kickStrength del giocatore dell'utente
                                        , l = b.M // velocita' della palla
                                        , m = b.M
                                        , q = b.pa; // invMass della palla
                                    l.x = m.x + n / k * h * q; // velocita' nuova della palla lungo x
                                    l.y = m.y + g / k * h * q; // lungo y
                                    if(this.Pa.Oh != null)
                                    {
                                        this.Pa.Oh(e); // il suono di un calcio?
                                    }
                                }
                                e.bc = 0; // azzera lo stato del calcio
                            }
                            k = e.mb; // l'input del giocatore del ciclo
                            g = n = 0;
                            // Gestione dei movimenti di input
                            0 != (k & 1) && --g; // // vettore della direzione verso Y (UP)
                            0 != (k & 2) && ++g; // vettore della direzione verso Y (DOWN)
                            0 != (k & 4) && --n; // vettore della direzione verso X (LEFT)
                            0 != (k & 8) && ++n; // vettore della direzione verso X (RIGHT)
                            if(n != 0 && g != 0)
                            {
                                k = Math.sqrt(n * n + g * g);
                                n /= k;
                                g /= k; // normalizzazione del vettore di movimento
                            }
                            k = e.F.M; // velocita del giocatore su cui cicliamo
                            h = e.bc ? f.Be : f.me; // accelerazione che varia a secondo se il giocatore calcia o no
                            k.x += n * h; // cambiamo la velocita del giocatore
                            k.y += g * h; // sulla Y
                            e.F.Ba = e.bc ? f.Ce : f.Ba // damping o kickingDambing
                        }
                    }
                    this.wa.v(a); // un pezzo della fisica importante, riga ~8395, cerca "v: function (a) {"
                    if (0 == this.zb) {
                        // this.zb == 0, partita non è cominciata (tocca a uno a toccare la palla)
                        for (a = 0; a < c.length;) {
                            d = c[a];
                            ++a;
                            // d.F è null quando un giocatore non presente sul campo. Cioè è un ogetto della classe X, geometria del giocatore
                            if(d.F != null) {
                                d.F.h = 39 | this.Jd.mo
                            };
                        }
                        c = b.M;
                        // Probabilmente verifica se la palla è stata toccata nell'inizio della partita
                        if(c.x * c.x + c.y * c.y > 0)
                        {
                            this.zb = 1;
                            c = this.kd;
                            b = b.a;
                            c.x = b.x;
                            c.y = b.y;
                        }
                    } else if (1 == this.zb) {
                        // this.zb == 1, partita è cominciata, la palla è in movimento
                        this.Ac += .016666666666666666; // è tutto finto qua. La funzione viene chiamata non ogni 16ms ma ininterrotamente. Poi ogni tot la variabile this.Ac viene sincronizzato con il tempo del Host (probabilmente)

                        // Dimostrazione
                        /*
                        if(!window.started_real_time)
                        {
                            window.started_real_time = new Date().getTime();
                            window.my_Ac = 0;
                        }
                        window.my_Ac += .016666666666666666;
                        console.log(new Date().getTime() - window.started_real_time, this.Ac, window.my_Ac);
                        */

                        for (a = 0; a < c.length;)
                        {
                            d = c[a];
                            ++a;
                            if(d.F != null)
                            {
                                d.F.h = 39;
                            }
                        }


                        // b.a - oggetto (classe X)
                        // this.kd - posizione della palla
                        c = this.U.Vm(b.a, this.kd); // cosa fa? forse verifica se è stato segnato un gol
                        if(c != p.Fa)
                        {   // Il caso di gol

                            this.zb = 2,
                            this.pc = 150,
                            this.Jd = c,
                            c == p.ba ? this.Cb++ : this.Kb++,
                            null != this.Pa.oi && this.Pa.oi(c.Tf), // probabilmente gueste sono gli hook di animazione e suono del gol
                            null != this.Pa.bl && this.Pa.bl(c.P); // uguale
                        }
                        else
                        {
                            /*
                            this.Kb -> il punteggio della squadra rossa
                            this.Cb -> il punteggio della squadra blu
                             */
                            if(0 < this.xa && this.Ac >= 60 * this.xa && this.Kb != this.Cb) // Può essere una vittoria per il timeout
                            {
                                if(null != this.Pa.ri)
                                {
                                    this.Pa.ri(); // Un altro hook, da scoprire quale
                                }
                                this.Cl(); // ?  Cl() è definito sotto
                            }
                        }
                        c = this.kd;
                        b = b.a;
                        c.x = b.x;
                        c.y = b.y
                    } else if (2 == this.zb) {
                        // this.zb == 2, partita è finita?
                        this.pc--,
                        0 >= this.pc && (0 < this.fb && (this.Kb >= this.fb || this.Cb >= this.fb) || 0 < this.xa && this.Ac >= 60 * this.xa && this.Kb != this.Cb ? this.Cl() : (this.Yj(),
                        null != this.Pa.tp && this.Pa.tp()));
                    }
                    else if (3 == this.zb) // partita finita (punteggio massimo)
                    {
                        this.pc--;
                        if(this.pc <= 0) {
                            b = this.Pa;
                            if (b.H != null) {
                                b.H = null;
                                c = 0;
                                for (a = b.D; c < a.length;)
                                {
                                    d = a[c],
                                        ++c,
                                        d.F = null,
                                        d.Bb = 0;
                                }
                                if(b.Ze != null)
                                {
                                    b.Ze(null);
                                }
                            }
                        }
                    }
                }
                if(this.wa.K.length > 5 && this.wa.K[6] && this.wa.K[6].a && start_params)
                {
                    var end_params = [
                        this.wa.K[0].a.x,
                        this.wa.K[0].a.y,
                        this.wa.K[0].M.x,
                        this.wa.K[0].M.y,
                        this.wa.K[6].a.x,
                        this.wa.K[6].a.y,
                        this.wa.K[6].M.x,
                        this.wa.K[6].M.y,
                        this.Pa.D[2].mb,
                        this.wa.K[5].a.x,
                        this.wa.K[5].a.y,
                        this.wa.K[5].M.x,
                        this.wa.K[5].M.y,
                        this.Pa.D[1].mb,
                        this.Ac,
                        this.Kb,
                        this.Cb
                    ];
                    // add_to_csv(start_params, end_params);
                }
                var abc=3+4;
            },
            Cl: function () {
                this.pc = 300;
                this.zb = 3;
                null != this.Pa.pi && this.Pa.pi(this.Kb > this.Cb ? p.ba : p.ta)
            },
            Yj: function () {
                var a = this.Pa.D;
                this.zb = 0;
                this.U.oe.Tj(this.wa.K[this.ec]);
                for (var b = [0, 0, 0], c = 0; c < a.length;) {
                    var d = a[c];
                    ++c;
                    this.Uj(d);
                    var e = d.$;
                    if (e != p.Fa) {
                        var f = d.F.a
                            , g = b[e.P]
                            , n = g + 1 >> 1;
                        0 == (g & 1) && (n = -n);
                        f.x = this.U.ac * e.dh;
                        f.y = 55 * n;
                        b[e.P]++;
                        d.Bb = b[e.P]
                    }
                }
            },
            aa: function (a) {
                this.wa.aa(a);
                a.Z(this.ec);
                a.Z(this.pc);
                a.Z(this.zb);
                var b = this.kd;
                a.w(b.x);
                a.w(b.y);
                a.Z(this.Kb);
                a.Z(this.Cb);
                a.w(this.Ac);
                a.Z(this.Ga);
                a.u(this.Jd.P)
            },
            ea: function (a, b) {
                this.wa.ea(a);
                this.ec = a.W();
                this.pc = a.W();
                this.zb = a.W();
                var c = this.kd;
                c.x = a.A();
                c.y = a.A();
                this.Kb = a.W();
                this.Cb = a.W();
                this.Ac = a.A();
                this.Ga = a.W();
                c = a.Re();
                this.Jd = 1 == c ? p.ba : 2 == c ? p.ta : p.Fa;
                this.Pa = b;
                this.fb = b.fb;
                this.xa = b.xa;
                this.U = b.U;
                this.wa.C = this.U.C;
                this.wa.O = this.U.O;
                this.wa.ha = this.U.ha
            },
            jc: function () {
                var a = xa.uc
                    , b = this.Yb;
                this.Zb != a && (null == b && (this.Yb = b = new ta),
                    this.Zb = a,
                    ta.cd(b, this));
                return b
            },
            g: ta
        };
        mb.b = !0;
        mb.prototype = {
            aa: function (a) {
                var b = this.R;
                a.w(b.x);
                a.w(b.y);
                b = this.V;
                a.w(b.x);
                a.w(b.y);
                a.u(this.Yd.P)
            },
            ea: function (a) {
                var b = this.R;
                b.x = a.A();
                b.y = a.A();
                b = this.V;
                b.x = a.A();
                b.y = a.A();
                a = a.Re();
                this.Yd = 1 == a ? p.ba : 2 == a ? p.ta : p.Fa
            },
            g: mb
        };
        zb.b = !0;
        zb.prototype = {
            aa: function (a) {
                a.w(this.l);
                a.w(this.pa);
                a.w(this.Ba);
                a.w(this.me);
                a.w(this.Be);
                a.w(this.Ce);
                a.w(this.Kd)
            },
            ea: function (a) {
                this.l = a.A();
                this.pa = a.A();
                this.Ba = a.A();
                this.me = a.A();
                this.Be = a.A();
                this.Ce = a.A();
                this.Kd = a.A()
            },
            g: zb
        };
        vb.b = !0;
        vb.prototype = {
            g: vb
        };
        h.b = !0;
        h.ea = function (a) {
            var b = a.G();
            return 255 == b ? (b = new h,
                b.Uq(a),
                b) : h.lh()[b]
        }
        ;
        h.lh = function () {
            if (null == h.ub) {
                h.ub = [];
                var a = new h;
                a.Pc("Classic", 420, 200, 370, 170, 64, 75);
                h.ub.push(a);
                a = new h;
                a.Pc("Easy", 420, 200, 370, 170, 90, 75);
                h.ub.push(a);
                a = new h;
                a.Pc("Small", 420, 200, 320, 130, 55, 70);
                h.ub.push(a);
                a = new h;
                a.Pc("Big", 600, 270, 550, 240, 80, 80);
                h.ub.push(a);
                a = new h;
                a.Pc("Rounded", 420, 200, 370, 170, 64, 75, 75);
                h.ub.push(a);
                a = new h;
                a.fk("Hockey", 420, 204, 398, 182, 68, 120, 75, 100);
                h.ub.push(a);
                a = new h;
                a.fk("Big Hockey", 600, 270, 550, 240, 90, 160, 75, 150);
                h.ub.push(a);
                a = new h;
                a.Pc("Big Easy", 600, 270, 550, 240, 95, 80);
                h.ub.push(a);
                a = new h;
                a.Pc("Big Rounded", 600, 270, 550, 240, 80, 75, 100);
                h.ub.push(a);
                a = new h;
                a.Pc("Huge", 750, 350, 700, 320, 100, 80);
                h.ub.push(a);
                for (var a = 0, b = h.ub.length; a < b;) {
                    var c = a++;
                    h.ub[c].bh = c
                }
            }
            return h.ub
        }
        ;
        h.Gm = function (a, b) {
            if (null != a.trait) {
                var c = b[t.N(a.trait, String)];
                if (null != c)
                    for (var d = 0, e = $b.Wl(c); d < e.length;) {
                        var f = e[d];
                        ++d;
                        null == a[f] && (a[f] = c[f])
                    }
            }
        }
        ;
        h.Nm = function (a) {
            if (-1 == a)
                return ["all"];
            var b = [];
            0 != (a & 2) && b.push("red");
            0 != (a & 4) && b.push("blue");
            0 != (a & 1) && b.push("ball");
            0 != (a & 8) && b.push("redKO");
            0 != (a & 16) && b.push("blueKO");
            0 != (a & 32) && b.push("wall");
            return b
        }
        ;
        h.Oc = function (a) {
            a = t.N(a, Array);
            for (var b = 0, c = 0; c < a.length;)
                switch (a[c++]) {
                    case "all":
                        b = -1;
                        break;
                    case "ball":
                        b |= 1;
                        break;
                    case "blue":
                        b |= 4;
                        break;
                    case "blueKO":
                        b |= 16;
                        break;
                    case "red":
                        b |= 2;
                        break;
                    case "redKO":
                        b |= 8;
                        break;
                    case "wall":
                        b |= 32
                }
            return b
        }
        ;
        h.Sc = function (a, b, c, d) {
            c != d && (a[b] = h.Nm(c))
        }
        ;
        h.wk = function (a, b, c) {
            b != c && (a.color = h.bn(b))
        }
        ;
        h.bn = function (a) {
            return H.xg(a)
        }
        ;
        h.zh = function (a) {
            if ("string" == typeof a)
                return L.parseInt("0x" + L.ie(a));
            if (a instanceof Array && null == a.sb)
                return ((a[0] | 0) << 16) + ((a[1] | 0) << 8) + (a[2] | 0);
            throw new q("Bad color");
        }
        ;
        h.cr = function (a) {
            var b = {
                x: a.a.x,
                y: a.a.y
            };
            h.qa(b, "bCoef", a.l, 1);
            h.Sc(b, "cMask", a.h, -1);
            h.Sc(b, "cGroup", a.B, 32);
            return b
        }
        ;
        h.vo = function (a) {
            var b = new z;
            b.a.x = t.N(a.x, B);
            b.a.y = t.N(a.y, B);
            var c = a.bCoef;
            null != c && (b.l = t.N(c, B));
            c = a.cMask;
            null != c && (b.h = h.Oc(c));
            a = a.cGroup;
            null != a && (b.B = h.Oc(a));
            return b
        }
        ;
        h.qq = function (a, b) {
            var c = {
                v0: a.R.gd,
                v1: a.V.gd
            };
            h.qa(c, "bias", a.xc, b.xc);
            h.qa(c, "bCoef", a.l, b.l);
            var d = a.Kn();
            h.qa(c, "curve", d, 0);
            0 != d && (c.curveF = a.tb);
            h.qa(c, "vis", a.Wa, b.Wa);
            h.Sc(c, "cMask", a.h, b.h);
            h.Sc(c, "cGroup", a.B, b.B);
            h.wk(c, a.X, b.X);
            return c
        }
        ;
        h.uo = function (a, b) {
            var c = new D
                , d = t.N(a.v1, ic);
            c.R = b[t.N(a.v0, ic)];
            c.V = b[d];
            var d = a.bias
                , e = a.bCoef
                , f = a.curve
                , g = a.curveF
                , n = a.vis
                , k = a.cMask
                , l = a.cGroup
                , m = a.color;
            null != d && (c.xc = t.N(d, B));
            null != e && (c.l = t.N(e, B));
            null != g ? c.tb = t.N(g, B) : null != f && c.Fc(t.N(f, B));
            null != n && (c.Wa = t.N(n, jc));
            null != k && (c.h = h.Oc(k));
            null != l && (c.B = h.Oc(l));
            null != m && (c.X = h.zh(m));
            return c
        }
        ;
        h.op = function (a) {
            var b = {
                normal: [a.sa.x, a.sa.y],
                dist: a.Oa
            };
            h.qa(b, "bCoef", a.l, 1);
            h.Sc(b, "cMask", a.h, -1);
            h.Sc(b, "cGroup", a.B, 32);
            return b
        }
        ;
        h.so = function (a) {
            var b = new I
                , c = t.N(a.normal, Array)
                , d = t.N(c[0], B)
                , c = t.N(c[1], B)
                , e = b.sa
                , f = Math.sqrt(d * d + c * c);
            e.x = d / f;
            e.y = c / f;
            b.Oa = t.N(a.dist, B);
            d = a.bCoef;
            c = a.cMask;
            a = a.cGroup;
            null != d && (b.l = t.N(d, B));
            null != c && (b.h = h.Oc(c));
            null != a && (b.B = h.Oc(a));
            return b
        }
        ;
        h.Rn = function (a) {
            return {
                p0: [a.R.x, a.R.y],
                p1: [a.V.x, a.V.y],
                team: a.Yd == p.ba ? "red" : "blue"
            }
        }
        ;
        h.ro = function (a) {
            var b = new mb
                , c = t.N(a.p0, Array)
                , d = t.N(a.p1, Array)
                , e = b.R;
            e.x = c[0];
            e.y = c[1];
            c = b.V;
            c.x = d[0];
            c.y = d[1];
            switch (a.team) {
                case "blue":
                    a = p.ta;
                    break;
                case "red":
                    a = p.ba;
                    break;
                default:
                    throw new q("Bad team value");
            }
            b.Yd = a;
            return b
        }
        ;
        h.rp = function (a) {
            var b = {};
            h.qa(b, "bCoef", a.l, .5);
            h.qa(b, "invMass", a.pa, .5);
            h.qa(b, "damping", a.Ba, .96);
            h.qa(b, "acceleration", a.me, .1);
            h.qa(b, "kickingAcceleration", a.Be, .07);
            h.qa(b, "kickingDamping", a.Ce, .96);
            h.qa(b, "kickStrength", a.Kd, 5);
            return b
        }
        ;
        h.to = function (a) {
            var b = new zb
                , c = a.bCoef
                , d = a.invMass
                , e = a.damping
                , f = a.acceleration
                , g = a.kickingAcceleration
                , n = a.kickingDamping;
            a = a.kickStrength;
            null != c && (b.l = t.N(c, B));
            null != d && (b.pa = t.N(d, B));
            null != e && (b.Ba = t.N(e, B));
            null != f && (b.me = t.N(f, B));
            null != g && (b.Be = t.N(g, B));
            null != n && (b.Ce = t.N(n, B));
            null != a && (b.Kd = t.N(a, B));
            return b
        }
        ;
        h.xj = function (a, b) {
            var c = {};
            if (a.a.x != b.a.x || a.a.y != b.a.y)
                c.pos = [a.a.x, a.a.y];
            if (a.M.x != b.M.x || a.M.y != b.M.y)
                c.speed = [a.M.x, a.M.y];
            h.qa(c, "radius", a.la, b.la);
            h.qa(c, "bCoef", a.l, b.l);
            h.qa(c, "invMass", a.pa, b.pa);
            h.qa(c, "damping", a.Ba, b.Ba);
            h.wk(c, a.X, b.X);
            h.Sc(c, "cMask", a.h, b.h);
            h.Sc(c, "cGroup", a.B, b.B);
            return c
        }
        ;
        h.ck = function (a, b) {
            var c = a.pos
                , d = a.speed
                , e = a.radius
                , f = a.bCoef
                , g = a.invMass
                , n = a.damping
                , k = a.color
                , l = a.cMask
                , m = a.cGroup;
            if (null != c) {
                var p = b.a;
                p.x = c[0];
                p.y = c[1]
            }
            null != d && (c = b.M,
                c.x = d[0],
                c.y = d[1]);
            null != e && (b.la = t.N(e, B));
            null != f && (b.l = t.N(f, B));
            null != g && (b.pa = t.N(g, B));
            null != n && (b.Ba = t.N(n, B));
            null != k && (b.X = h.zh(k));
            null != l && (b.h = h.Oc(l));
            null != m && (b.B = h.Oc(m));
            return b
        }
        ;
        h.qa = function (a, b, c, d) {
            c != d && (a[b] = c)
        }
        ;
        h.prototype = {
            Dh: function () {
                var a = new ua;
                a.X = 16777215;
                a.h = -1;
                a.B = 1;
                a.la = 10;
                a.Ba = .99;
                a.pa = 1;
                a.l = .5;
                return a
            },
            aa: function (a) {
                a.u(this.bh);
                if (!this.ze()) {
                    a.Qb(this.o);
                    a.Z(this.Zc);
                    a.w(this.Ed);
                    a.w(this.Dd);
                    a.w(this.Yc);
                    a.w(this.Ic);
                    a.w(this.pe);
                    a.Z(this.fc);
                    a.w(this.Sb);
                    a.w(this.hc);
                    a.w(this.ac);
                    this.Rd.aa(a);
                    this.oe.aa(a);
                    a.sc(this.Fe);
                    a.u(this.qe);
                    a.u(this.C.length);
                    for (var b = 0, c = this.C.length; b < c;) {
                        var d = b++
                            , e = this.C[d];
                        e.gd = d;
                        e.aa(a)
                    }
                    a.u(this.O.length);
                    b = 0;
                    for (c = this.O; b < c.length;)
                        c[b++].aa(a);
                    a.u(this.ha.length);
                    b = 0;
                    for (c = this.ha; b < c.length;)
                        c[b++].aa(a);
                    a.u(this.kc.length);
                    b = 0;
                    for (c = this.kc; b < c.length;)
                        c[b++].aa(a);
                    a.u(this.K.length);
                    b = 0;
                    for (c = this.K; b < c.length;)
                        c[b++].aa(a)
                }
            },
            Uq: function (a) {
                this.o = a.Jb();
                this.Zc = a.W();
                this.Ed = a.A();
                this.Dd = a.A();
                this.Yc = a.A();
                this.Ic = a.A();
                this.pe = a.A();
                this.fc = a.W();
                this.Sb = a.A();
                this.hc = a.A();
                this.ac = a.A();
                this.Rd.ea(a);
                this.oe.ea(a);
                this.Fe = a.xb();
                this.qe = a.G();
                this.rf = 704643072 != (this.fc & -16777216);
                this.C = [];
                for (var b = a.G(), c = 0; c < b;) {
                    var d = new z;
                    d.ea(a);
                    d.gd = c++;
                    this.C.push(d)
                }
                this.O = [];
                b = a.G();
                for (c = 0; c < b;)
                    ++c,
                        d = new D,
                        d.ea(a, this.C),
                        this.O.push(d);
                this.ha = [];
                b = a.G();
                for (c = 0; c < b;)
                    ++c,
                        d = new I,
                        d.ea(a),
                        this.ha.push(d);
                this.kc = [];
                b = a.G();
                for (c = 0; c < b;)
                    ++c,
                        d = new mb,
                        d.ea(a),
                        this.kc.push(d);
                this.K = [];
                b = a.G();
                for (c = 0; c < b;)
                    ++c,
                        d = new ua,
                        d.ea(a),
                        this.K.push(d);
                this.Sd()
            },
            Sd: function () {
                for (var a = 0, b = this.O; a < b.length;)
                    b[a++].Sd()
            },
            ze: function () {
                return 255 != this.bh
            },
            Ld: function (a, b, c) {
                a = a[b];
                return null != a ? t.N(a, B) : c
            },
            wo: function (a, b, c) {
                a = a[b];
                return null != a ? t.N(a, jc) : c
            },
            ae: function () {
                return JSON.stringify(this.Rq())
            },
            Rq: function () {
                if (!this.rf)
                    throw new q(0);
                for (var a = {}, b = 0, c = [], d = 0, e = this.C; d < e.length;) {
                    var f = e[d];
                    ++d;
                    f.gd = b++;
                    c.push(h.cr(f))
                }
                d = new D;
                b = [];
                e = 0;
                for (f = this.O; e < f.length;)
                    b.push(h.qq(f[e++], d));
                d = [];
                e = 0;
                for (f = this.ha; e < f.length;)
                    d.push(h.op(f[e++]));
                for (var e = [], f = 0, g = this.kc; f < g.length;)
                    e.push(h.Rn(g[f++]));
                for (var f = h.rp(this.Rd), n = new ua, g = [], k = 0, l = this.K; k < l.length;)
                    g.push(h.xj(l[k++], n));
                n = h.xj(this.oe, this.Dh());
                c = {
                    name: this.o,
                    width: this.Sb,
                    height: this.hc,
                    bg: a,
                    vertexes: c,
                    segments: b,
                    planes: d,
                    goals: e,
                    discs: g,
                    playerPhysics: f,
                    ballPhysics: n
                };
                h.qa(c, "maxViewWidth", this.Fe, 0);
                h.qa(c, "cameraFollow", 1 == this.qe ? "player" : "", "");
                h.qa(c, "spawnDistance", this.ac, 200);
                switch (this.Zc) {
                    case 1:
                        b = "grass";
                        break;
                    case 2:
                        b = "hockey";
                        break;
                    default:
                        b = "none"
                }
                h.qa(a, "type", b, "none");
                h.qa(a, "width", this.Ed, 0);
                h.qa(a, "height", this.Dd, 0);
                h.qa(a, "kickOffRadius", this.Yc, 0);
                h.qa(a, "cornerRadius", this.Ic, 0);
                h.qa(a, "color", this.fc, 7441498);
                h.qa(a, "goalLine", this.pe, 0);
                return c
            },
            bk: function (a) {
                function b(a, b, c) {
                    var e = t.N(d[b], Array);
                    if (null != e)
                        for (var g = 0; g < e.length;) {
                            var k = e[g];
                            ++g;
                            try {
                                h.Gm(k, f),
                                    a.push(c(k))
                            } catch (U) {
                                throw new q(new vb('Error in "' + b + '" index: ' + a.length));
                            }
                        }
                }

                var c = this
                    , d = JSON5.parse(a);
                this.C = [];
                this.O = [];
                this.ha = [];
                this.kc = [];
                this.K = [];
                this.o = t.N(d.name, String);
                this.Sb = t.N(d.width, B);
                this.hc = t.N(d.height, B);
                this.Fe = this.Ld(d, "maxViewWidth", 0) | 0;
                "player" == d.cameraFollow && (this.qe = 1);
                this.ac = 200;
                a = d.spawnDistance;
                null != a && (this.ac = t.N(a, B));
                a = d.bg;
                var e;
                switch (a.type) {
                    case "grass":
                        e = 1;
                        break;
                    case "hockey":
                        e = 2;
                        break;
                    default:
                        e = 0
                }
                this.Zc = e;
                this.Ed = this.Ld(a, "width", 0);
                this.Dd = this.Ld(a, "height", 0);
                this.Yc = this.Ld(a, "kickOffRadius", 0);
                this.Ic = this.Ld(a, "cornerRadius", 0);
                this.fc = 7441498;
                null != a.color && (this.fc = h.zh(a.color));
                this.pe = this.Ld(a, "goalLine", 0);
                this.rf = this.wo(d, "canBeStored", !0);
                this.fc = this.fc & 16777215 | (this.rf ? 0 : 42) << 24;
                var f = d.traits;
                b(this.C, "vertexes", h.vo);
                b(this.O, "segments", function (a) {
                    return h.uo(a, c.C)
                });
                b(this.kc, "goals", h.ro);
                b(this.K, "discs", function (a) {
                    return h.ck(a, new ua)
                });
                b(this.ha, "planes", h.so);
                a = d.playerPhysics;
                null != a && (this.Rd = h.to(a));
                a = d.ballPhysics;
                null != a && (this.oe = h.ck(a, this.Dh()));
                if (255 < this.C.length || 255 < this.O.length || 255 < this.ha.length || 255 < this.kc.length || 255 < this.K.length)
                    throw new q("Error");
                this.Sd()
            },
            lj: function () {
                var a = h.Pq;
                a.a = 0;
                this.aa(a);
                var b = new Zb;
                b.ir(a.Nb());
                b.hash = (b.hash += b.hash << 3) ^ b.hash >>> 11;
                b.hash += b.hash << 15;
                return b.hash | 0
            },
            Vm: function (a, b) {
                // Cosa fa?
                for (var c = 0, d = this.kc; c < d.length;) {
                    var e = d[c];
                    ++c;
                    var f = e.R
                        , g = e.V
                        , ff = false
                        , n = b.x - a.x
                        , k = b.y - a.y;
                    0 < -(f.y - a.y) * n + (f.x - a.x) * k == 0 < -(g.y - a.y) * n + (g.x - a.x) * k ? ff = !1 : (n = g.x - f.x,
                        g = g.y - f.y,
                        ff = 0 < -(a.y - f.y) * n + (a.x - f.x) * g == 0 < -(b.y - f.y) * n + (b.x - f.x) * g ? !1 : !0);
                    if (ff)
                        return e.Yd; // Probabilmente restituisce questo oggetto (classe Squadra) per chi ha segnato un gol
                }
                return p.Fa; // Forse è la squadra degli spectators
            },
            Pc: function (a, b, c, d, e, f, g, n) {
                null == n && (n = 0);
                this.o = a;
                this.Sb = b;
                this.hc = c;
                this.Zc = 1;
                this.fc = 7441498;
                this.Ed = d;
                this.Dd = e;
                this.Yc = g;
                this.Ic = n;
                this.ac = .75 * d;
                400 < this.ac && (this.ac = 400);
                a = new I;
                var k = a.sa;
                k.x = 0;
                k.y = 1;
                a.Oa = -c;
                a.l = 0;
                this.ha.push(a);
                a = new I;
                k = a.sa;
                k.x = 0;
                k.y = -1;
                a.Oa = -c;
                a.l = 0;
                this.ha.push(a);
                a = new I;
                k = a.sa;
                k.x = 1;
                k.y = 0;
                a.Oa = -b;
                a.l = 0;
                this.ha.push(a);
                a = new I;
                k = a.sa;
                k.x = -1;
                k.y = 0;
                a.Oa = -b;
                a.l = 0;
                this.ha.push(a);
                this.If(d, 1, f, 13421823, p.ta);
                this.If(-d, -1, f, 16764108, p.ba);
                this.gk(g, c);
                b = new I;
                c = b.sa;
                c.x = 0;
                c.y = 1;
                b.Oa = -e;
                b.h = 1;
                this.ha.push(b);
                b = new I;
                c = b.sa;
                c.x = 0;
                c.y = -1;
                b.Oa = -e;
                b.h = 1;
                this.ha.push(b);
                b = new z;
                c = b.a;
                c.x = -d;
                c.y = -e;
                b.h = 0;
                c = new z;
                g = c.a;
                g.x = d;
                g.y = -e;
                c.h = 0;
                g = new z;
                a = g.a;
                a.x = d;
                a.y = -f;
                g.h = 0;
                a = new z;
                k = a.a;
                k.x = d;
                k.y = f;
                a.h = 0;
                var k = new z
                    , h = k.a;
                h.x = d;
                h.y = e;
                k.h = 0;
                var h = new z
                    , l = h.a;
                l.x = -d;
                l.y = e;
                h.h = 0;
                var l = new z
                    , m = l.a;
                m.x = -d;
                m.y = f;
                l.h = 0;
                var m = new z
                    , q = m.a;
                q.x = -d;
                q.y = -f;
                m.h = 0;
                f = new D;
                f.R = c;
                f.V = g;
                f.h = 1;
                f.Wa = !1;
                q = new D;
                q.R = a;
                q.V = k;
                q.h = 1;
                q.Wa = !1;
                var r = new D;
                r.R = h;
                r.V = l;
                r.h = 1;
                r.Wa = !1;
                var t = new D;
                t.R = m;
                t.V = b;
                t.h = 1;
                t.Wa = !1;
                this.C.push(b);
                this.C.push(c);
                this.C.push(g);
                this.C.push(a);
                this.C.push(k);
                this.C.push(h);
                this.C.push(l);
                this.C.push(m);
                this.O.push(f);
                this.O.push(q);
                this.O.push(r);
                this.O.push(t);
                this.ek(d, e, n);
                this.Sd()
            },
            fk: function (a, b, c, d, e, f, g, n, k) {
                this.o = a;
                this.Sb = b;
                this.hc = c;
                this.Zc = 2;
                this.Ed = d;
                this.Dd = e;
                this.Yc = n;
                this.Ic = k;
                this.pe = g;
                this.ac = .75 * (d - g);
                400 < this.ac && (this.ac = 400);
                a = new I;
                var h = a.sa;
                h.x = 0;
                h.y = 1;
                a.Oa = -c;
                a.l = 0;
                this.ha.push(a);
                a = new I;
                h = a.sa;
                h.x = 0;
                h.y = -1;
                a.Oa = -c;
                a.l = 0;
                this.ha.push(a);
                a = new I;
                h = a.sa;
                h.x = 1;
                h.y = 0;
                a.Oa = -b;
                a.l = 0;
                this.ha.push(a);
                a = new I;
                h = a.sa;
                h.x = -1;
                h.y = 0;
                a.Oa = -b;
                a.l = 0;
                this.ha.push(a);
                this.If(d - g, 1, f, 13421823, p.ta, -1);
                this.If(-d + g, -1, f, 16764108, p.ba, -1);
                this.gk(n, c);
                b = new I;
                c = b.sa;
                c.x = 0;
                c.y = 1;
                b.Oa = -e;
                b.h = 1;
                this.ha.push(b);
                b = new I;
                c = b.sa;
                c.x = 0;
                c.y = -1;
                b.Oa = -e;
                b.h = 1;
                this.ha.push(b);
                b = new I;
                c = b.sa;
                c.x = 1;
                c.y = 0;
                b.Oa = -d;
                b.h = 1;
                this.ha.push(b);
                b = new I;
                c = b.sa;
                c.x = -1;
                c.y = 0;
                b.Oa = -d;
                b.h = 1;
                this.ha.push(b);
                this.ek(d, e, k);
                this.Sd()
            },
            If: function (a, b, c, d, e, f, g) {
                null == g && (g = 32);
                null == f && (f = 1);
                var n = new z
                    , k = n.a;
                k.x = a + 8 * b;
                k.y = -c;
                var k = new z
                    , h = k.a;
                h.x = a + 8 * b;
                h.y = c;
                var l = new z
                    , h = l.a;
                h.x = n.a.x + 22 * b;
                h.y = n.a.y + 22;
                var m = new z
                    , h = m.a;
                h.x = k.a.x + 22 * b;
                h.y = k.a.y - 22;
                h = new D;
                h.R = n;
                h.V = l;
                h.Fc(90 * b);
                var p = new D;
                p.R = m;
                p.V = l;
                var q = new D;
                q.R = m;
                q.V = k;
                q.Fc(90 * b);
                b = this.C.length;
                this.C.push(n);
                this.C.push(k);
                this.C.push(l);
                this.C.push(m);
                n = b;
                for (b = this.C.length; n < b;)
                    k = n++,
                        this.C[k].h = f,
                        this.C[k].B = g,
                        this.C[k].l = .1;
                b = this.O.length;
                this.O.push(h);
                this.O.push(p);
                this.O.push(q);
                n = b;
                for (b = this.O.length; n < b;)
                    k = n++,
                        this.O[k].h = f,
                        this.O[k].B = g,
                        this.O[k].l = .1;
                f = new ua;
                g = f.a;
                g.x = a;
                g.y = -c;
                f.pa = 0;
                f.la = 8;
                f.X = d;
                this.K.push(f);
                f = new ua;
                g = f.a;
                g.x = a;
                g.y = c;
                f.pa = 0;
                f.la = 8;
                f.X = d;
                this.K.push(f);
                d = new mb;
                f = d.R;
                f.x = a;
                f.y = -c;
                f = d.V;
                f.x = a;
                f.y = c;
                d.Yd = e;
                this.kc.push(d)
            },
            gk: function (a, b) {
                var c = new z
                    , d = c.a;
                d.x = 0;
                d.y = -b;
                c.l = .1;
                c.B = 24;
                c.h = 6;
                var d = new z
                    , e = d.a;
                e.x = 0;
                e.y = -a;
                d.l = .1;
                d.B = 24;
                d.h = 6;
                var e = new z
                    , f = e.a;
                f.x = 0;
                f.y = a;
                e.l = .1;
                e.B = 24;
                e.h = 6;
                var f = new z
                    , g = f.a;
                g.x = 0;
                g.y = b;
                f.l = .1;
                f.B = 24;
                f.h = 6;
                g = new D;
                g.R = c;
                g.V = d;
                g.B = 24;
                g.h = 6;
                g.Wa = !1;
                g.l = .1;
                var n = new D;
                n.R = e;
                n.V = f;
                n.B = 24;
                n.h = 6;
                n.Wa = !1;
                n.l = .1;
                var k = new D;
                k.R = d;
                k.V = e;
                k.B = 8;
                k.h = 6;
                k.Wa = !1;
                k.Fc(180);
                k.l = .1;
                var h = new D;
                h.R = e;
                h.V = d;
                h.B = 16;
                h.h = 6;
                h.Wa = !1;
                h.Fc(180);
                h.l = .1;
                this.C.push(c);
                this.C.push(d);
                this.C.push(e);
                this.C.push(f);
                this.O.push(g);
                this.O.push(n);
                this.O.push(k);
                this.O.push(h)
            },
            ek: function (a, b, c) {
                if (!(0 >= c)) {
                    var d = new z
                        , e = d.a;
                    e.x = -a + c;
                    e.y = -b;
                    d.h = 0;
                    var e = new z
                        , f = e.a;
                    f.x = -a;
                    f.y = -b + c;
                    e.h = 0;
                    var f = new z
                        , g = f.a;
                    g.x = -a + c;
                    g.y = b;
                    f.h = 0;
                    var g = new z
                        , h = g.a;
                    h.x = -a;
                    h.y = b - c;
                    g.h = 0;
                    var h = new z
                        , k = h.a;
                    k.x = a - c;
                    k.y = b;
                    h.h = 0;
                    var k = new z
                        , l = k.a;
                    l.x = a;
                    l.y = b - c;
                    k.h = 0;
                    var l = new z
                        , m = l.a;
                    m.x = a - c;
                    m.y = -b;
                    l.h = 0;
                    var m = new z
                        , p = m.a;
                    p.x = a;
                    p.y = -b + c;
                    m.h = 0;
                    a = new D;
                    a.R = d;
                    a.V = e;
                    a.h = 1;
                    a.Wa = !1;
                    a.l = 1;
                    a.Fc(-90);
                    b = new D;
                    b.R = f;
                    b.V = g;
                    b.h = 1;
                    b.Wa = !1;
                    b.l = 1;
                    b.Fc(90);
                    c = new D;
                    c.R = h;
                    c.V = k;
                    c.h = 1;
                    c.Wa = !1;
                    c.l = 1;
                    c.Fc(-90);
                    p = new D;
                    p.R = l;
                    p.V = m;
                    p.h = 1;
                    p.Wa = !1;
                    p.l = 1;
                    p.Fc(90);
                    this.C.push(d);
                    this.C.push(e);
                    this.C.push(f);
                    this.C.push(g);
                    this.C.push(h);
                    this.C.push(k);
                    this.C.push(l);
                    this.C.push(m);
                    this.O.push(a);
                    this.O.push(b);
                    this.O.push(c);
                    this.O.push(p)
                }
            },
            g: h
        };
        ka.b = !0;
        ka.prototype = {
            aa: function (a) {
                a.u(this.Xc);
                a.Z(this.Tc);
                a.u(this.cb.length);
                for (var b = 0, c = this.cb; b < c.length;)
                    a.Z(c[b++])
            },
            ea: function (a) {
                this.Xc = a.G();
                this.Tc = a.W();
                var b = a.G();
                if (3 < b)
                    throw new q("too many");
                this.cb = [];
                for (var c = 0; c < b;)
                    ++c,
                        this.cb.push(a.W())
            },
            g: ka
        };
        p.b = !0;
        p.prototype = {
            g: p
        };
        fa.b = !0;
        fa.je = [sb, Yb];
        fa.cd = function (a, b) {
            a.$b = b.$b;
            if (null == b.D)
                a.D = null;
            else {
                null == a.D && (a.D = []);
                for (var c = a.D, d = b.D, e = d.length; c.length > e;)
                    c.pop();
                for (var e = 0, f = d.length; e < f;) {
                    var g = e++;
                    c[g] = d[g].tr()
                }
            }
            a.H = null == b.H ? null : b.H.jc();
            a.Gc = b.Gc;
            a.fb = b.fb;
            a.xa = b.xa;
            a.U = b.U;
            a.hb = b.hb
        }
        ;
        fa.prototype = {
            Iq: function (a) {
                if (null == this.H) {
                    this.H = new ta;
                    for (var b = 0, c = this.D; b < c.length;) {
                        var d = c[b];
                        ++b;
                        d.F = null;
                        d.Bb = 0
                    }
                    this.H.fo(this);
                    null != this.li && this.li(a)
                }
            },
            sf: function (a, b, c) {
                if (b.$ != c) {
                    b.$ = c;
                    C.remove(this.D, b);
                    this.D.push(b);
                    if (null != this.H) {
                        null != b.F && (C.remove(this.H.wa.K, b.F),
                            b.F = null);
                        this.H.Uj(b);
                        for (var d = 0, e = !1; !e;) {
                            ++d;
                            for (var e = !0, f = 0, g = this.D; f < g.length;) {
                                var h = g[f];
                                ++f;
                                if (h != b && h.$ == b.$ && h.Bb == d) {
                                    e = !1;
                                    break
                                }
                            }
                        }
                        b.Bb = d
                    }
                    wb.i(this.Nk, a, b, c)
                }
            },
            ka: function (a) {
                for (var b = 0, c = this.D; b < c.length;) {
                    var d = c[b];
                    ++b;
                    if (d.T == a)
                        return d
                }
                return null
            },
            v: function (a) {
                null != this.H && this.H.v(a)
            },
            aa: function (a) {
                a.Qb(this.$b);
                a.u(this.Gc ? 1 : 0);
                a.Z(this.fb);
                a.Z(this.xa);
                this.U.aa(a);
                a.u(null != this.H ? 1 : 0);
                null != this.H && this.H.aa(a);
                a.u(this.D.length);
                for (var b = 0, c = this.D; b < c.length;)
                    c[b++].Ca(a);
                this.hb[1].aa(a);
                this.hb[2].aa(a)
            },
            ea: function (a) {
                this.$b = a.Jb();
                this.Gc = 0 != a.G();
                this.fb = a.W();
                this.xa = a.W();
                this.U = h.ea(a);
                var b = 0 != a.G();
                this.H = null;
                b && (this.H = new ta,
                    this.H.ea(a, this));
                for (var b = null == this.H ? null : this.H.wa.K, c = a.G(), d = this.D; d.length > c;)
                    d.pop();
                for (d = 0; d < c;) {
                    var e = new ea;
                    e.Ea(a, b);
                    this.D[d++] = e
                }
                this.hb[1].ea(a);
                this.hb[2].ea(a)
            },
            Nj: function () {
                var a = 0
                    , b = u.ca();
                this.aa(b);
                for (b = b.Qq(); 4 <= b.m.byteLength - b.a;)
                    a ^= b.W();
                return a
            },
            In: function () {
                var a = u.ca(4);
                a.Z(this.Nj());
                return a.mg()
            },
            cn: function (a) {
                a = (new A(new DataView(a))).W();
                x.i(this.un, this.Nj() != a)
            },
            sl: function (a) {
                this.bl = a
            },
            jc: function () {
                var a = xa.uc
                    , b = this.Yb;
                this.Zb != a && (null == b && (this.Yb = b = new fa),
                    this.Zb = a,
                    fa.cd(b, this));
                return b
            },
            g: fa
        };
        ea.b = !0;
        ea.je = [sb];
        ea.kr = function (a, b) {
            a.ra = b.ra;
            a.Bb = b.Bb;
            a.jb = b.jb;
            a.xd = b.xd;
            a.wd = b.wd;
            a.wg = b.wg;
            a.wb = b.wb;
            a.o = b.o;
            a.mb = b.mb;
            a.T = b.T;
            a.bc = b.bc;
            a.F = null == b.F ? null : b.F.jc();
            a.$ = b.$
        }
        ;
        ea.prototype = {
            Ca: function (a) {
                a.u(this.ra ? 1 : 0);
                a.Z(this.Bb);
                a.Qb(this.jb);
                a.u(this.xd ? 1 : 0);
                a.Qb(this.wd);
                a.Z(this.wg);
                a.Qb(this.o);
                a.Z(this.mb);
                a.ib(this.T);
                a.u(this.bc ? 1 : 0);
                a.u(this.$.P);
                a.dr(null == this.F ? -1 : this.F.zk)
            },
            Ea: function (a, b) {
                this.ra = 0 != a.G();
                this.Bb = a.W();
                this.jb = a.Jb();
                this.xd = 0 != a.G();
                this.wd = a.Jb();
                this.wg = a.W();
                this.o = a.Jb();
                this.mb = a.W();
                this.T = a.yb();
                this.bc = 0 != a.G();
                var c = a.Re();
                this.$ = 1 == c ? p.ba : 2 == c ? p.ta : p.Fa;
                c = a.Mp();
                this.F = 0 > c ? null : b[c]
            },
            tr: function () {
                var a = xa.uc
                    , b = this.im;
                this.uc != a && (null == b && (this.im = b = new ea),
                    this.uc = a,
                    ea.kr(b, this));
                return b
            },
            g: ea
        };
        sa.b = !0;
        sa.na = function (a) {
            var b = new sa;
            b.Ag = a;
            return b
        }
        ;
        sa.ua = l;
        sa.prototype = E(l.prototype, {
            apply: function (a) {
                var b = a.ka(this.oa);
                null != b && this.Ag != b.xd && (b.xd = this.Ag,
                    x.i(a.Ik, b))
            },
            Ca: function (a) {
                a.u(this.Ag ? 1 : 0)
            },
            Ea: function (a) {
                this.Ag = 0 != a.G()
            },
            g: sa
        });
        Pa.b = !0;
        Pa.ua = l;
        Pa.prototype = E(l.prototype, {
            apply: function (a) {
                var b = a.ka(this.oa);
                if (null != b && b.ra) {
                    for (var c = a.D, d = [], e = 0, f = 0, g = 0; g < c.length;) {
                        var h = c[g];
                        ++g;
                        h.$ == p.Fa && d.push(h);
                        h.$ == p.ba ? ++e : h.$ == p.ta && ++f
                    }
                    c = d.length;
                    0 != c && (f == e ? 2 > c || (a.sf(b, d[0], p.ba),
                        a.sf(b, d[1], p.ta)) : a.sf(b, d[0], f > e ? p.ba : p.ta))
                }
            },
            Ca: function () {
            },
            Ea: function () {
            },
            g: Pa
        });
        da.b = !0;
        da.na = function (a, b) {
            var c = new da;
            c.Oi = a;
            c.newValue = b;
            return c
        }
        ;
        da.ua = l;
        da.prototype = E(l.prototype, {
            apply: function (a) {
                var b = a.ka(this.oa);
                if (null != b && b.ra && null == a.H)
                    switch (this.Oi) {
                        case 0:
                            b = this.newValue;
                            a.fb = 0 > b ? 0 : 99 < b ? 99 : b;
                            break;
                        case 1:
                            b = this.newValue,
                                a.xa = 0 > b ? 0 : 99 < b ? 99 : b
                    }
            },
            Ca: function (a) {
                a.Z(this.Oi);
                a.Z(this.newValue)
            },
            Ea: function (a) {
                this.Oi = a.W();
                this.newValue = a.W()
            },
            g: da
        });
        ra.b = !0;
        ra.na = function (a, b) {
            var c = new ra;
            c.yd = a;
            c.zg = b;
            return c
        }
        ;
        ra.ua = l;
        ra.prototype = E(l.prototype, {
            apply: function (a) {
                var b = a.ka(this.oa);
                if (null != b && b.ra) {
                    var c = a.ka(this.yd);
                    null != c && 0 != c.T && c.ra != this.zg && (c.ra = this.zg,
                    null != a.Nh && a.Nh(b, c))
                }
            },
            Ca: function (a) {
                a.Z(this.yd);
                a.u(this.zg ? 1 : 0)
            },
            Ea: function (a) {
                this.yd = a.W();
                this.zg = 0 != a.G()
            },
            g: ra
        });
        qa.b = !0;
        qa.na = function (a) {
            var b = new qa;
            b.fe = a;
            return b
        }
        ;
        qa.ua = l;
        qa.prototype = E(l.prototype, {
            apply: function (a) {
                a = a.ka(this.oa);
                null != a && (a.jb = this.fe)
            },
            Ca: function (a) {
                a.Qb(this.fe)
            },
            Ea: function (a) {
                this.fe = a.Jb();
                null != this.fe && (this.fe = aa.vd(this.fe, 2))
            },
            g: qa
        });
        R.b = !0;
        R.na = function (a, b) {
            var c = new R;
            c.yd = a;
            c.Ii = b;
            return c
        }
        ;
        R.ua = l;
        R.prototype = E(l.prototype, {
            apply: function (a) {
                var b = a.ka(this.oa)
                    , c = a.ka(this.yd);
                if (null != b && null != c) {
                    var d = b.ra;
                    (d = d || c == b && !a.Gc && null == a.H) && a.sf(b, c, this.Ii)
                }
            },
            Ca: function (a) {
                a.Z(this.yd);
                a.u(this.Ii.P)
            },
            Ea: function (a) {
                this.yd = a.W();
                a = a.Re();
                this.Ii = 1 == a ? p.ba : 2 == a ? p.ta : p.Fa
            },
            g: R
        });
        pa.b = !0;
        pa.na = function (a) {
            var b = new pa;
            b.Bd = a;
            return b
        }
        ;
        pa.ua = l;
        pa.prototype = E(l.prototype, {
            apply: function (a) {
                var b = a.ka(this.oa);
                null != b && b.ra && null == a.H && (a.U = this.Bd,
                null != a.ji && a.ji(b, this.Bd))
            },
            Ca: function (a) {
                var b = u.ca();
                this.Bd.aa(b);
                b = pako.deflateRaw(b.Nb());
                a.sc(b.byteLength);
                a.Pb(b)
            },
            Ea: function (a) {
                a = pako.inflateRaw(a.qb(a.xb()));
                this.Bd = h.ea(new A(new DataView(a.buffer, a.byteOffset, a.byteLength)))
            },
            g: pa
        });
        Oa.b = !0;
        Oa.ua = l;
        Oa.prototype = E(l.prototype, {
            apply: function (a) {
                var b = a.ka(this.oa);
                null != b && b.ra && this.$ != p.Fa && (a.hb[this.$.P] = this.ug)
            },
            Ca: function (a) {
                a.u(this.$.P);
                this.ug.aa(a)
            },
            Ea: function (a) {
                var b = a.Re();
                this.$ = 1 == b ? p.ba : 2 == b ? p.ta : p.Fa;
                this.ug = new ka;
                this.ug.ea(a)
            },
            g: Oa
        });
        oa.b = !0;
        oa.na = function (a) {
            var b = new oa;
            b.newValue = a;
            return b
        }
        ;
        oa.ua = l;
        oa.prototype = E(l.prototype, {
            apply: function (a) {
                var b = a.ka(this.oa);
                null != b && b.ra && (a.Gc = this.newValue)
            },
            Ca: function (a) {
                a.u(this.newValue ? 1 : 0)
            },
            Ea: function (a) {
                this.newValue = 0 != a.G()
            },
            g: oa
        });
        na.b = !0;
        na.na = function (a, b, c, d) {
            var e = new na;
            e.T = a;
            e.name = b;
            e.Bi = c;
            e.jb = d;
            return e
        }
        ;
        na.ua = l;
        na.prototype = E(l.prototype, {
            apply: function (a) {
                if (0 == this.oa) {
                    var b = new ea;
                    b.T = this.T;
                    b.o = this.name;
                    b.wd = this.Bi;
                    b.jb = this.jb;
                    a.D.push(b);
                    a = a.Jk;
                    null != a && a(b)
                }
            },
            Ca: function (a) {
                a.Z(this.T);
                a.Qb(this.name);
                a.Qb(this.Bi);
                a.Qb(this.jb)
            },
            Ea: function (a) {
                this.T = a.W();
                this.name = a.Jb();
                this.Bi = a.Jb();
                this.jb = a.Jb()
            },
            g: na
        });
        Na.b = !0;
        Na.ua = l;
        Na.prototype = E(l.prototype, {
            apply: function (a) {
                var b = a.H;
                if (null != b) {
                    var c = a.ka(this.oa);
                    if (null != c && c.ra) {
                        var d = 120 == b.Ga
                            , e = 0 < b.Ga;
                        this.ef ? b.Ga = 120 : 120 == b.Ga && (b.Ga = 119);
                        d != this.ef && wb.i(a.Ck, c, this.ef, e)
                    }
                }
            },
            Ca: function (a) {
                a.u(this.ef ? 1 : 0)
            },
            Ea: function (a) {
                this.ef = 0 != a.G()
            },
            g: Na
        });
        Ma.b = !0;
        Ma.ua = l;
        Ma.prototype = E(l.prototype, {
            hm: function (a) {
                if (null != a.pp) {
                    var b = a.ka(this.oa);
                    return null == b ? !1 : a.pp(b, this.df)
                }
                return !0
            },
            apply: function (a) {
                var b = a.ka(this.oa);
                null != b && ia.i(a.Hk, b, this.df)
            },
            Ca: function (a) {
                a.tc(aa.vd(this.df, 140))
            },
            Ea: function (a) {
                this.df = a.oc();
                if (140 < this.df.length)
                    throw new q("message too long");
            },
            g: Ma
        });
        Fa.b = !0;
        Fa.ua = l;
        Fa.prototype = E(l.prototype, {
            apply: function (a) {
                var b = a.ka(this.oa);
                if (null != b) {
                    var c = this.input;
                    0 == (b.mb & 16) && 0 != (c & 16) && (b.bc = !0);
                    b.mb = c;
                    null != a.qp && a.qp(b)
                }
            },
            Ca: function (a) {
                a.rb(this.input)
            },
            Ea: function (a) {
                this.input = a.$a()
            },
            g: Fa
        });
        ma.b = !0;
        ma.na = function (a) {
            var b = new ma;
            b.Pi = a;
            return b
        }
        ;
        ma.ua = l;
        ma.prototype = E(l.prototype, {
            apply: function (a) {
                var b = a.ka(this.oa);
                null != b && ia.i(a.Mk, b, this.Pi)
            },
            Ca: function (a) {
                a.u(this.Pi)
            },
            Ea: function (a) {
                this.Pi = a.G()
            },
            g: ma
        });
        ec.b = !0;
        ec.Ei = function () {
            l.Ua(ma);
            l.Ua(Sa);
            l.Ua(Fa);
            l.Ua(Ma);
            l.Ua(na);
            l.Ua(Y);
            l.Ua(La);
            l.Ua(Ka);
            l.Ua(Na);
            l.Ua(da);
            l.Ua(pa);
            l.Ua(R);
            l.Ua(oa);
            l.Ua(ra);
            l.Ua(Pa);
            l.Ua(sa);
            l.Ua(la);
            l.Ua(qa);
            l.Ua(Oa)
        }
        ;
        Y.b = !0;
        Y.na = function (a, b, c) {
            var d = new Y;
            d.T = a;
            d.Vc = b;
            d.sg = c;
            return d
        }
        ;
        Y.ua = l;
        Y.prototype = E(l.prototype, {
            apply: function (a) {
                if (0 != this.T) {
                    var b = a.ka(this.oa);
                    if (null != b && b.ra) {
                        var c = a.ka(this.T);
                        null != c && (C.remove(a.D, c),
                        null != a.H && C.remove(a.H.wa.K, c.F),
                            Tb.i(a.Kk, c, this.Vc, this.sg, b))
                    }
                }
            },
            Ca: function (a) {
                null != this.Vc && (this.Vc = aa.vd(this.Vc, 100));
                a.Z(this.T);
                a.Qb(this.Vc);
                a.u(this.sg ? 1 : 0)
            },
            Ea: function (a) {
                this.T = a.W();
                this.Vc = a.Jb();
                this.sg = 0 != a.G();
                if (null != this.Vc && 100 < this.Vc.length)
                    throw new q("string too long");
            },
            g: Y
        });
        La.b = !0;
        La.ua = l;
        La.prototype = E(l.prototype, {
            apply: function (a) {
                var b = a.ka(this.oa);
                null != b && b.ra && a.Iq(b, 0)
            },
            Ca: function () {
            },
            Ea: function () {
            },
            g: La
        });
        Ka.b = !0;
        Ka.ua = l;
        Ka.prototype = E(l.prototype, {
            apply: function (a) {
                var b = a.ka(this.oa);
                if (null != b && b.ra && null != a.H) {
                    a.H = null;
                    for (var c = 0, d = a.D; c < d.length;) {
                        var e = d[c];
                        ++c;
                        e.F = null;
                        e.Bb = 0
                    }
                    null != a.Ze && a.Ze(b)
                }
            },
            Ca: function () {
            },
            Ea: function () {
            },
            g: Ka
        });
        la.b = !0;
        la.na = function (a) {
            for (var b = new la, c = a.L.D, d = [], e = 0; e < c.length;) {
                var f = a.se.get(c[e++].T);
                d.push(null == f ? 0 : f.wb)
            }
            b.ge = d;
            return b
        }
        ;
        la.ua = l;
        la.prototype = E(l.prototype, {
            apply: function (a) {
                if (0 == this.oa) {
                    a = a.D;
                    for (var b = 0, c = a.length; b < c;) {
                        var d = b++;
                        if (d >= this.ge.length)
                            break;
                        a[d].wb = this.ge[d]
                    }
                }
            },
            Ca: function (a) {
                a.ib(this.ge.length);
                for (var b = 0, c = this.ge; b < c.length;)
                    a.ib(c[b++])
            },
            Ea: function (a) {
                this.ge = [];
                for (var b = a.yb(), c = 0; c < b;)
                    ++c,
                        this.ge.push(a.yb())
            },
            g: la
        });
        yb.b = !0;
        yb.pd = function (a) {
            a = pako.inflate(new Uint8Array(a));
            a = new A(new DataView(a.buffer, a.byteOffset, a.byteLength), !1);
            a.G();
            a.$a();
            for (var b = []; 0 < a.m.byteLength - a.a;) {
                var c = [new A(new DataView(a.Rh(a.xb())), !1)]
                    , d = function (a) {
                    return function () {
                        var b = a[0].xb();
                        return a[0].rd(b)
                    }
                }(c);
                try {
                    var e = new nb
                        , f = new Bb;
                    f.Cf = !0;
                    f.yc = e;
                    e.Uc = c[0].xb();
                    f.P = d();
                    e.o = d();
                    e.D = c[0].G();
                    e.Md = c[0].G();
                    e.ob = 0 != c[0].G();
                    e.lb = d();
                    e.lc = c[0].Zf();
                    e.mc = c[0].Zf();
                    b.push(f)
                } catch (g) {
                }
            }
            return b
        }
        ;
        yb.I = function () {
            return J.I("https://www.haxball.com/list3", "arraybuffer").then(function (a) {
                return yb.pd(a)
            })
        }
        ;
        X.b = !0;
        X.je = [sb];
        X.cd = function (a, b) {
            a.la = b.la;
            a.l = b.l;
            a.pa = b.pa;
            a.Ba = b.Ba;
            a.X = b.X;
            a.gj = b.gj;
            a.h = b.h;
            a.B = b.B;
            var c = a.a
                , d = b.a;
            c.x = d.x;
            c.y = d.y;
            c = a.M;
            d = b.M;
            c.x = d.x;
            c.y = d.y
        }
        ;
        X.prototype = {
            aa: function (a) {
                var b = this.a;
                a.w(b.x);
                a.w(b.y);
                b = this.M;
                a.w(b.x);
                a.w(b.y);
                a.w(this.la);
                a.w(this.l);
                a.w(this.pa);
                a.w(this.Ba);
                a.rb(this.X);
                a.Z(this.h);
                a.Z(this.B)
            },
            ea: function (a) {
                var b = this.a;
                b.x = a.A();
                b.y = a.A();
                b = this.M;
                b.x = a.A();
                b.y = a.A();
                this.la = a.A();
                this.l = a.A();
                this.pa = a.A();
                this.Ba = a.A();
                this.X = a.$a();
                this.h = a.W();
                this.B = a.W()
            },
            $m: function (a) { // metodo dell'oggetto della palla che gestisce il rimbalzo
                // a: oggetto del tipo X
                var b = this.a // la posizione della palla
                    , c = a.a
                    , d = b.x - c.x // delta x posizione
                    , b = b.y - c.y // delta y posizione
                    , e = a.la + this.la // "la" e' il raggio. la "e" e' la somma dei raggi
                    , f = d * d + b * b; // distanza alla due tra la palla e il oggetto
                if (0 < f && f <= e * e) { // se la distanza tra la palla e il oggetto e' minore della somma dei loro raggi, cioe' sono a contatto
                    var ff_orig = f;
                    var f = Math.sqrt(f) // distanza pura
                        , f_orig = f
                        , e_orig = e
                        , d = d / f // vettore-direzione che punta dall'oggettoa alla palla, comp. X
                        , b = b / f // vettore-direzione che punta dall'oggettoa alla palla, comp. Y
                        , c = this.pa / (this.pa + a.pa) // invMass. Massa ridotta fratto massa della palla
                        , e = e - f // quanto sono sovrapposti
                        , f = e * c // m_oggetto / (m_oggetto + m_palla) * sovrapposizione
                        , g = this.a // posizione della palla
                        , h = this.a;
                    g.x = h.x + d * f; // posizione nuova della palla
                    g.y = h.y + b * f; // uguale
                    h = g = a.a; // posizione dell'oggetto
                    var e_orig2 = e;
                    var f_orig2 = f;
                    e -= f; // m_palla / (m_oggetto + m_palla) * sovrapposizione
                    g.x = h.x - d * e; // aggiorna la posizione dell'oggetto con la direzione opposta
                    g.y = h.y - b * e;
                    e = this.M; // la velocita' della palla
                    f = a.M; // la velocita' dell'oggetto
                    e = d * (e.x - f.x) + b * (e.y - f.y); // proiezione della differenza delle velocita' sul vettore-direzione
                    if(0 > e) // TODO: da verificare la traduzione
                    {
                        e *= this.l * a.l + 1;
                        c *= e;
                        g = f = this.M;
                        f.x = g.x - d * c; // aggiornamento della velocita della palla
                        f.y = g.y - b * c;
                        a = f = a.M;
                        c = e - c;
                        f.x = a.x + d * c; // aggiornamento della velocita dell'oggetto
                        f.y = a.y + b * c;
                    }
                    // 0 > e && (e *= this.l * a.l + 1,
                    //     c *= e,
                    //     g = f = this.M,
                    //     f.x = g.x - d * c, // aggiornamento della velocita della palla
                    //     f.y = g.y - b * c,
                    //     a = f = a.M,
                    //     c = e - c,
                    //     f.x = a.x + d * c, // aggiornamento della velocita dell'oggetto
                    //     f.y = a.y + b * c)
                }
            },
            an: function (a) {
                // Confini?
                var b, c, d;
                if (0 != 0 * a.tb) { // se a.tb==Infinity
                    b = a.R.a;
                    var e = a.V.a;
                    c = e.x - b.x;
                    var f = e.y - b.y
                        , g = this.a;
                    d = g.x - e.x;
                    e = g.y - e.y;
                    g = this.a;
                    if (0 >= (g.x - b.x) * c + (g.y - b.y) * f || 0 <= d * c + e * f)
                        return;
                    c = a.sa;
                    b = c.x;
                    c = c.y;
                    d = b * d + c * e
                } else { // se a.tb è un numero
                    c = a.Hd;
                    d = this.a;
                    b = d.x - c.x;
                    c = d.y - c.y;
                    d = a.jg;
                    e = a.kg;
                    if ((0 < d.x * b + d.y * c && 0 < e.x * b + e.y * c) == 0 >= a.tb)
                        return;
                    e = Math.sqrt(b * b + c * c);
                    if (0 == e)
                        return;
                    d = e - a.rj;
                    b /= e;
                    c /= e
                }
                e = a.xc;
                if (0 == e)
                    0 > d && (d = -d,
                        b = -b,
                        c = -c);
                else if (0 > e && (e = -e,
                    d = -d,
                    b = -b,
                    c = -c),
                d < -e)
                    return;
                if(this.la > d) // TODO: da verificare la traduzione
                {
                    d = this.la - d;
                    f = e = this.a;
                    e.x = f.x + b * d;
                    e.y = f.y + c * d;
                    d = this.M;
                    d = b * d.x + c * d.y;
                    if(0 > d)
                    {
                        d *= this.l * a.l + 1;
                        e = a = this.M;
                        a.x = e.x - b * d;
                        a.y = e.y - c * d;
                    }
                }
                // d >= this.la || (d = this.la - d,
                //     f = e = this.a,
                //     e.x = f.x + b * d,
                //     e.y = f.y + c * d,
                //     d = this.M,
                //     d = b * d.x + c * d.y,
                // 0 > d && (d *= this.l * a.l + 1,
                //     e = a = this.M,
                //     a.x = e.x - b * d,
                //     a.y = e.y - c * d))
            },
            jc: function () {
                var a = xa.uc
                    , b = this.Yb;
                this.Zb != a && (null == b && (this.Yb = b = new X),
                    this.Zb = a,
                    X.cd(b, this));
                return b
            },
            g: X
        };
        Ea.b = !0;
        Ea.je = [sb];
        Ea.cd = function (a, b) {
            if (null == b.K)
                a.K = null;
            else {
                null == a.K && (a.K = []);
                for (var c = a.K, d = b.K, e = d.length; c.length > e;)
                    c.pop();
                for (var e = 0, f = d.length; e < f;) {
                    var g = e++;
                    c[g] = d[g].jc()
                }
            }
            a.C = b.C;
            a.O = b.O;
            a.ha = b.ha
        }
        ;
        Ea.prototype = {
            aa: function (a) {
                a.u(this.K.length);
                for (var b = 0, c = this.K.length; b < c;) {
                    var d = b++
                        , e = this.K[d];
                    e.zk = d;
                    e.aa(a)
                }
            },
            ea: function (a) {
                this.K = [];
                for (var b = a.G(), c = 0; c < b;) {
                    ++c;
                    var d = new X;
                    d.ea(a);
                    this.K.push(d)
                }
            },
            v: function (a) {
                // a == 1 sempre.  costante? velocità del mondo?

                // Le velocità nuove degli oggetti
                // this.K: oggetti:
                // 0: la palla
                // 1: un palo {x: 370, y: -64}
                // 2: un palo {x: 370, y: 64}
                // 3: un palo {x: -370, y: -64}
                // 4: un palo {x: -370, y: 64}
                // 5: un giocatore
                // 6: un giocatore
                for (var b = 0, c = this.K; b < c.length;) {
                    var d = c[b];
                    ++b;
                    var e = d.a // a: posizione
                        , f = d.a // uguale
                        , g = d.M; // M: velocità
                    e.x = f.x + g.x * a; // aggiornamento della posizione verso la X
                    e.y = f.y + g.y * a; // aggiornamento della posizione verso la Y
                    f = e = d.M; // metti la valocita nelle due variabili: "f" e "e"
                    // Attenzeione, da qua la "e" e la "f" sono le velocità, non le posizioni
                    d = d.Ba; // Il Damping dell'oggetto attuale
                    e.x = f.x * d; // aggiornamento della velocita' dell'oggetto della X
                    e.y = f.y * d // aggiornamento della velocita' dell'oggetto della Y
                }
                // Attenzione la "a" iniziale non serve più
                a = 0;
                for (b = this.K.length; a < b;) { // di nuovo facciamo la iterazione per gli oggetti (K)
                    d = a++;
                    c = this.K[d];
                    d += 1;
                    for (e = this.K.length; d < e;) // ciclo su tutte le coppie degli oggetti. Dove la "c" e' il primo oggetto della coppia, la "f" e' il secondo
                        f = this.K[d++],
                            // B: 0 per la palla, -1 per i pali, 2 per il giocatore1, 4 per il giocatore2
                            // h: -1 per la palla e i pali, 39 per i giocatori
                        0 != (f.h & c.B) && 0 != (f.B & c.h) && c.$m(f);
                        /*
                        if(0 != (f.h & c.B) && 0 != (f.B & c.h))
                        {
                            c.$m(f);
                        }
                         */
                    // pa: 1 per la palla, 0 per i pali, 0.5 per i giocatori
                    if (0 != c.pa) {
                        d = 0;
                        // this.ha: sei elementi della classe I. Esempio:
                        /*
                        0:
                            B: 32
                            Oa: -200
                            h: -1
                            l: 0
                            sa: M {x: 0, y: 1}
                        1:
                            B: 32
                            Oa: -200
                            h: -1
                            l: 0
                            sa: M {x: 0, y: -1}
                        2:
                            B: 32
                            Oa: -420
                            h: -1
                            l: 0
                            sa: M {x: 1, y: 0}
                        3:
                            B: 32
                            Oa: -420
                            h: -1
                            l: 0
                            sa: M {x: -1, y: 0}
                        4:
                            B: 32
                            Oa: -170
                            h: 1
                            l: 1
                            sa: M {x: 0, y: 1}
                        5:
                            B: 32
                            Oa: -170
                            h: 1
                            l: 1
                            sa: M {x: 0, y: -1}
                         */
                        // Non capisco questo pezzo
                        for (e = this.ha; d < e.length;)
                            if (f = e[d],
                                ++d,
                            0 != (f.h & c.B) && 0 != (f.B & c.h)) {
                                var g = f.sa
                                    , h = c.a
                                    , g = f.Oa - (g.x * h.x + g.y * h.y) + c.la;
                                if (0 < g) {
                                    var k = h = c.a
                                        , l = f.sa;
                                    h.x = k.x + l.x * g;
                                    h.y = k.y + l.y * g;
                                    g = c.M;
                                    h = f.sa;
                                    g = g.x * h.x + g.y * h.y;
                                    0 > g && (g *= c.l * f.l + 1,
                                        k = h = c.M,
                                        f = f.sa,
                                        h.x = k.x - f.x * g,
                                        h.y = k.y - f.y * g)
                                }
                            }
                        d = 0;
                        // this.O: 14 elementi della classe D. confini?
                        for (e = this.O; d < e.length;)
                            f = e[d],
                                ++d,
                            0 != (f.h & c.B) && 0 != (f.B & c.h) && c.an(f);
                        d = 0;
                        for (e = this.C; d < e.length;)
                            if (f = e[d],
                                ++d,
                            0 != (f.h & c.B) && 0 != (f.B & c.h) && (h = c.a,
                                k = f.a,
                                g = h.x - k.x,
                                h = h.y - k.y,
                                k = g * g + h * h,
                            0 < k && k <= c.la * c.la)) {
                                var k = Math.sqrt(k)
                                    , g = g / k
                                    , h = h / k
                                    , k = c.la - k
                                    , m = l = c.a;
                                l.x = m.x + g * k;
                                l.y = m.y + h * k;
                                k = c.M;
                                k = g * k.x + h * k.y;
                                0 > k && (k *= c.l * f.l + 1,
                                    l = f = c.M,
                                    f.x = l.x - g * k,
                                    f.y = l.y - h * k)
                            }
                    }
                }
            },
            jc: function () {
                var a = xa.uc
                    , b = this.Yb;
                this.Zb != a && (null == b && (this.Yb = b = new Ea),
                    this.Zb = a,
                    Ea.cd(b, this));
                return b
            },
            g: Ea
        };
        I.b = !0;
        I.prototype = {
            aa: function (a) {
                var b = this.sa;
                a.w(b.x);
                a.w(b.y);
                a.w(this.Oa);
                a.w(this.l);
                a.Z(this.h);
                a.Z(this.B)
            },
            ea: function (a) {
                var b = this.sa;
                b.x = a.A();
                b.y = a.A();
                this.Oa = a.A();
                this.l = a.A();
                this.h = a.W();
                this.B = a.W()
            },
            g: I
        };
        D.b = !0;
        D.prototype = {
            aa: function (a) {
                var b = 0
                    , c = a.a;
                a.u(0);
                a.u(this.R.gd);
                a.u(this.V.gd);
                0 != this.xc && (b = 1,
                    a.w(this.xc));
                this.tb != 1 / 0 && (b |= 2,
                    a.w(this.tb));
                0 != this.X && (b |= 4,
                    a.Z(this.X));
                this.Wa && (b |= 8);
                a.m.setUint8(c, b);
                a.w(this.l);
                a.Z(this.h);
                a.Z(this.B)
            },
            ea: function (a, b) {
                var c = a.G();
                this.R = b[a.G()];
                this.V = b[a.G()];
                this.xc = 0 != (c & 1) ? a.A() : 0;
                this.tb = 0 != (c & 2) ? a.A() : 1 / 0;
                this.X = 0 != (c & 4) ? a.W() : 0;
                this.Wa = 0 != (c & 8);
                this.l = a.A();
                this.h = a.W();
                this.B = a.W()
            },
            Fc: function (a) {
                a *= .017453292519943295;
                if (0 > a) {
                    a = -a;
                    var b = this.R;
                    this.R = this.V;
                    this.V = b;
                    this.xc = -this.xc
                }
                a > D.wm && a < D.vm && (this.tb = 1 / Math.tan(a / 2))
            },
            Kn: function () {
                return 0 != 0 * this.tb ? 0 : 114.59155902616465 * Math.atan(1 / this.tb)
            },
            Sd: function () {
                if (0 == 0 * this.tb) {
                    var a = this.V.a
                        , b = this.R.a
                        , c = .5 * (a.x - b.x)
                        , a = .5 * (a.y - b.y)
                        , b = this.R.a
                        , d = this.tb;
                    this.Hd = new M(b.x + c + -a * d, b.y + a + c * d);
                    a = this.R.a;
                    b = this.Hd;
                    c = a.x - b.x;
                    a = a.y - b.y;
                    this.rj = Math.sqrt(c * c + a * a);
                    c = this.R.a;
                    a = this.Hd;
                    this.jg = new M(-(c.y - a.y), c.x - a.x);
                    c = this.Hd;
                    a = this.V.a;
                    this.kg = new M(-(c.y - a.y), c.x - a.x);
                    0 >= this.tb && (a = c = this.jg,
                        c.x = -a.x,
                        c.y = -a.y,
                        a = c = this.kg,
                        c.x = -a.x,
                        c.y = -a.y)
                } else
                    a = this.R.a,
                        b = this.V.a,
                        c = a.x - b.x,
                        a = -(a.y - b.y),
                        b = Math.sqrt(a * a + c * c),
                        this.sa = new M(a / b, c / b)
            },
            g: D
        };
        z.b = !0;
        z.prototype = {
            aa: function (a) {
                var b = this.a;
                a.w(b.x);
                a.w(b.y);
                a.w(this.l);
                a.Z(this.h);
                a.Z(this.B)
            },
            ea: function (a) {
                var b = this.a;
                b.x = a.A();
                b.y = a.A();
                this.l = a.A();
                this.h = a.W();
                this.B = a.W()
            },
            g: z
        };
        N.b = !0;
        N.Hc = function (a) {
            return "rgba(" + [(a & 16711680) >>> 16, (a & 65280) >>> 8, a & 255].join() + ",255)"
        }
        ;
        N.ii = function (a, b) {
            a.imageSmoothingEnabled = b;
            a.mozImageSmoothingEnabled = b
        }
        ;
        N.prototype = {
            Xn: function (a, b) {
                var c = this.qd.get(a.T);
                if (null != c)
                    switch (b) {
                        case 0:
                            c.wh = !0;
                            break;
                        case 1:
                            c.wh = !1
                    }
            },
            Zq: function () {
                if (null != this.ja.parentElement) {
                    var a = window.devicePixelRatio
                        , b = this.ja.getBoundingClientRect()
                        , c = Math.round(b.width * a)
                        , a = Math.round(b.height * a);
                    if (this.ja.width != c || this.ja.height != a)
                        this.ja.width = c,
                            this.ja.height = a
                }
            },
            Bc: function (a, b) {
                var c = window.performance.now()
                    , d = (c - this.Nc) / 1E3;
                this.Nc = c;
                this.lg.clear();
                this.Zq();
                N.ii(this.c, !0);
                this.c.resetTransform();
                if (null != a.H) {
                    var c = a.H
                        , e = c.wa
                        , f = a.ka(b)
                        , g = null != f ? f.F : null
                        , h = 0 != this.Pe ? this.ja.height / this.Pe : this.Qe * window.devicePixelRatio
                        , k = c.U.Fe
                        , l = this.ja.width / h;
                    0 < k && l > k && (l = k,
                        h = this.ja.width / k);
                    k = (this.ja.height - this.be) / h;
                    this.Wq(c, g, l, k);
                    for (var m = 0, p = a.D; m < p.length;) {
                        var q = p[m];
                        ++m;
                        if (null != q.F) {
                            var r = this.qd.get(q.T);
                            null == r && (r = new Da,
                                this.qd.set(q.T, r));
                            r.v(q, a);
                            this.lg.set(q.F, r)
                        }
                    }
                    this.c.translate(this.ja.width / 2, (this.ja.height + this.be) / 2);
                    this.c.scale(h, h);
                    this.c.translate(-this.bb.x, -this.bb.y);
                    this.c.lineWidth = 3;
                    this.cq(c.U);
                    this.bq(c.U);
                    this.Xp(a, l, k);
                    this.Yp(a, f);
                    null != g && this.$p(g.a);
                    this.c.lineWidth = 2;
                    f = 0;
                    for (g = a.D; f < g.length;)
                        h = g[f],
                            ++f,
                            l = h.F,
                        null != l && this.Zk(l, this.qd.get(h.T));
                    f = 0;
                    for (e = e.K; f < e.length;)
                        g = e[f],
                            ++f,
                        null == this.lg.get(g) && this.Zk(g, null);
                    this.c.lineWidth = 3;
                    this.c.resetTransform();
                    this.c.translate(this.ja.width / 2, this.ja.height / 2);
                    this.Zp(c);
                    0 >= c.Ga && (this.fd.v(d),
                        this.fd.Bc(this.c));
                    this.lg.clear();
                    this.Wp(a)
                }
            },
            Wp: function (a) {
                var b = new Set
                    , c = 0;
                for (a = a.D; c < a.length;)
                    b.add(a[c++].T);
                c = this.qd.keys();
                for (a = c.next(); !a.done;) {
                    var d = a.value;
                    a = c.next();
                    if (!b.has(d))
                        this.qd["delete"](d)
                }
            },
            Wq: function (a, b, c, d) {
                var e, f;
                if (null != b && 1 == a.U.qe)
                    f = b.a,
                        e = f.x,
                        f = f.y;
                else if (f = a.wa.K[a.ec].a,
                    e = f.x,
                    f = f.y,
                null != b) {
                    var g = b.a;
                    e = .5 * (e + g.x);
                    f = .5 * (f + g.y);
                    var h = .5 * c
                        , k = .5 * d;
                    b = g.x - h + 50;
                    var l = g.y - k + 50
                        , h = g.x + h - 50
                        , g = g.y + k - 50;
                    e = e > h ? h : e < b ? b : e;
                    f = f > g ? g : f < l ? l : f
                }
                h = b = this.bb;
                l = h.x;
                h = h.y;
                b.x = l + .04 * (e - l);
                b.y = h + .04 * (f - h);
                this.hn(c, d, a.U)
            },
            hn: function (a, b, c) {
                a > 2 * c.Sb ? this.bb.x = 0 : this.bb.x + .5 * a > c.Sb ? this.bb.x = c.Sb - .5 * a : this.bb.x - .5 * a < -c.Sb && (this.bb.x = -c.Sb + .5 * a);
                b > 2 * c.hc ? this.bb.y = 0 : this.bb.y + .5 * b > c.hc ? this.bb.y = c.hc - .5 * b : this.bb.y - .5 * b < -c.hc && (this.bb.y = -c.hc + .5 * b)
            },
            $p: function (a) {
                this.c.beginPath();
                this.c.strokeStyle = "white";
                this.c.globalAlpha = .3;
                this.c.arc(a.x, a.y, 25, 0, 2 * Math.PI, !1);
                this.c.stroke();
                this.c.globalAlpha = 1
            },
            Zp: function (a) {
                var b = 0 < a.Ga;
                this.wq(b);
                b && (120 != a.Ga && (a = a.Ga / 120 * 200,
                    this.c.fillStyle = "white",
                    this.c.fillRect(.5 * -a, 100, a, 20)),
                    this.fd.mp.eq(this.c))
            },
            wq: function (a) {
                this.Vj != a && (this.ja.style.filter = a ? "grayscale(70%)" : "",
                    this.Vj = a)
            },
            gl: function (a, b, c, d, e, f) {
                d = b + d;
                e = c + e;
                a.beginPath();
                a.moveTo(d - f, c);
                a.arcTo(d, c, d, c + f, f);
                a.lineTo(d, e - f);
                a.arcTo(d, e, d - f, e, f);
                a.lineTo(b + f, e);
                a.arcTo(b, e, b, e - f, f);
                a.lineTo(b, c + f);
                a.arcTo(b, c, b + f, c, f);
                a.closePath()
            },
            cq: function (a) {
                var b = this;
                N.ii(this.c, !1);
                var c = a.Ed
                    , d = a.Dd;
                if (1 == a.Zc)
                    this.c.save(),
                        this.c.resetTransform(),
                        this.c.fillStyle = N.Hc(a.fc),
                        this.c.fillRect(0, 0, this.ja.width, this.ja.height),
                        this.c.restore(),
                        this.c.strokeStyle = "#C7E6BD",
                        this.c.fillStyle = this.Tn,
                        this.gl(this.c, -c, -d, 2 * c, 2 * d, a.Ic),
                        this.c.save(),
                        this.c.scale(2, 2),
                        this.c.fill(),
                        this.c.restore(),
                        this.c.moveTo(0, -d),
                        this.c.lineTo(0, d),
                        this.c.stroke(),
                        this.c.beginPath(),
                        this.c.arc(0, 0, a.Yc, 0, 2 * Math.PI),
                        this.c.stroke();
                else if (2 == a.Zc) {
                    this.c.strokeStyle = "#E9CC6E";
                    this.c.save();
                    this.gl(this.c, -c, -d, 2 * c, 2 * d, a.Ic);
                    this.c.scale(2, 2);
                    this.c.fillStyle = this.en;
                    this.c.fillRect(-1E4, -1E4, 2E4, 2E4);
                    this.c.fillStyle = this.gn;
                    this.c.fill();
                    this.c.restore();
                    this.c.stroke();
                    this.c.beginPath();
                    this.c.moveTo(0, -d);
                    this.c.setLineDash([15, 15]);
                    this.c.lineTo(0, d);
                    this.c.stroke();
                    this.c.setLineDash([]);
                    var e = a.pe
                        , c = c - e;
                    e < a.Ic && (c = 0);
                    e = function (c, e, h) {
                        b.c.beginPath();
                        b.c.strokeStyle = c;
                        b.c.arc(0, 0, a.Yc, -1.5707963267948966, 1.5707963267948966, h);
                        0 != e && (b.c.moveTo(e, -d),
                            b.c.lineTo(e, d));
                        b.c.stroke()
                    }
                    ;
                    e("#85ACF3", c, !1);
                    e("#E18977", -c, !0)
                } else
                    this.c.save(),
                        this.c.resetTransform(),
                        this.c.fillStyle = N.Hc(a.fc),
                        this.c.fillRect(0, 0, this.ja.width, this.ja.height),
                        this.c.restore();
                N.ii(this.c, !0)
            },
            Yp: function (a, b) {
                for (var c = m.s.Sj.I(), d = 0, e = a.D; d < e.length;) {
                    var f = e[d];
                    ++d;
                    var g = f.F;
                    if (null != g) {
                        var g = g.a
                            , h = this.qd.get(f.T);
                        c && h.wh && this.c.drawImage(m.Ll, g.x - .5 * m.Ll.width, g.y - 35);
                        f != b && h.An(this.c, g.x, g.y + 50)
                    }
                }
            },
            Zk: function (a, b) {
                this.c.beginPath();
                null == b ? (this.c.fillStyle = N.Hc(a.X),
                    this.c.strokeStyle = "black") : (this.c.fillStyle = b.cj,
                    this.c.strokeStyle = b.vn);
                this.c.beginPath();
                this.c.arc(a.a.x, a.a.y, a.la, 0, 2 * Math.PI, !1);
                if (null != b) {
                    this.c.save();
                    var c = a.la / 32;
                    this.c.translate(a.a.x, a.a.y);
                    this.c.scale(c, c);
                    this.c.translate(-32, -32);
                    this.c.fill();
                    this.c.restore()
                } else
                    2147483647 >= a.X && this.c.fill();
                this.c.stroke()
            },
            bq: function (a) {
                if (null != a) {
                    var b = 0;
                    for (a = a.O; b < a.length;)
                        this.aq(a[b++])
                }
            },
            aq: function (a) {
                if (a.Wa) {
                    this.c.beginPath();
                    this.c.strokeStyle = N.Hc(a.X);
                    var b = a.R.a
                        , c = a.V.a;
                    if (0 != 0 * a.tb)
                        this.c.moveTo(b.x, b.y),
                            this.c.lineTo(c.x, c.y);
                    else {
                        a = a.Hd;
                        var d = b.x - a.x
                            , b = b.y - a.y;
                        this.c.arc(a.x, a.y, Math.sqrt(d * d + b * b), Math.atan2(b, d), Math.atan2(c.y - a.y, c.x - a.x))
                    }
                    this.c.stroke()
                }
            },
            Xp: function (a, b, c) {
                var d = a.H;
                if (null != d)
                    for (d = d.wa.K[d.ec],
                             this.Hj(d.a, d.X, b, c),
                             d = 0,
                             a = a.D; d < a.length;) {
                        var e = a[d];
                        ++d;
                        null != e.F && this.Hj(e.F.a, e.$.X, b, c)
                    }
            },
            Hj: function (a, b, c, d) {
                c = .5 * c - 25;
                d = .5 * d - 25;
                var e = this.bb
                    , f = a.x - e.x
                    , e = a.y - e.y
                    , g = -c
                    , h = -d
                    , k = this.bb;
                c = k.x + (f > c ? c : f < g ? g : f);
                d = k.y + (e > d ? d : e < h ? h : e);
                f = a.x - c;
                a = a.y - d;
                900 < f * f + a * a && (this.c.fillStyle = "rgba(0,0,0,0.5)",
                    this.Ij(c + 2, d + 2, Math.atan2(a, f)),
                    this.c.fillStyle = N.Hc(b),
                    this.Ij(c - 2, d - 2, Math.atan2(a, f)))
            },
            Ij: function (a, b, c) {
                this.c.save();
                this.c.translate(a, b);
                this.c.rotate(c);
                this.c.beginPath();
                this.c.moveTo(15, 0);
                this.c.lineTo(0, 7);
                this.c.lineTo(0, -7);
                this.c.closePath();
                this.c.fill();
                this.c.restore()
            },
            g: N
        };
        Q.b = !0;
        Q.prototype = {
            Hn: function () {
                return 2.31 + .1155 * (this.Ee.length - 1)
            },
            Bc: function (a, b) {
                var c = b / 2.31
                    , d = 0;
                a.imageSmoothingEnabled = !0;
                for (var e = 0, f = this.Ee; e < f.length;) {
                    var g = f[e];
                    ++e;
                    var h = c - .05 * d
                        , k = 180 * Q.tm.eval(h) * (0 != (d & 1) ? -1 : 1);
                    a.globalAlpha = Q.sm.eval(h);
                    a.drawImage(g, k - .5 * g.width, 35 * -(this.Ee.length - 1) + 70 * d - .5 * g.height);
                    a.globalAlpha = 1;
                    ++d
                }
                a.imageSmoothingEnabled = !1
            },
            eq: function (a) {
                var b = 0;
                a.imageSmoothingEnabled = !0;
                for (var c = 0, d = this.Ee; c < d.length;) {
                    var e = d[c];
                    ++c;
                    a.drawImage(e, .5 * -e.width, 35 * -(this.Ee.length - 1) + 70 * b - .5 * e.height);
                    ++b
                }
                a.imageSmoothingEnabled = !1
            },
            Hc: function (a) {
                return "rgba(" + [(a & 16711680) >>> 16, (a & 65280) >>> 8, a & 255].join() + ",255)"
            },
            Ao: function (a, b) {
                var c = window.document.createElement("canvas")
                    , d = c.getContext("2d", null);
                d.font = "900 70px Arial Black,Arial Bold,Gadget,sans-serif";
                c.width = Math.ceil(d.measureText(a).width) + 7;
                c.height = 90;
                d.font = "900 70px Arial Black,Arial Bold,Gadget,sans-serif";
                d.textAlign = "left";
                d.textBaseline = "middle";
                d.fillStyle = "black";
                d.fillText(a, 7, 52);
                d.fillStyle = this.Hc(b);
                d.fillText(a, 0, 45);
                return c
            },
            g: Q
        };
        Nb.b = !0;
        Nb.prototype = {
            Ia: function (a) {
                this.Za.push(a)
            },
            Ym: function () {
                this.Za = [];
                this.rc = 0
            },
            v: function (a) {
                0 < this.Za.length && (this.rc += a,
                this.rc > this.Za[0].Hn() && (this.rc = 0,
                    this.Za.shift()))
            },
            Bc: function (a) {
                0 < this.Za.length && this.Za[0].Bc(a, this.rc)
            },
            g: Nb
        };
        Da.b = !0;
        Da.Wm = function (a, b) {
            if (a.Xc != b.Xc || a.Tc != b.Tc)
                return !1;
            var c = a.cb
                , d = b.cb;
            if (c.length != d.length)
                return !1;
            for (var e = 0, f = c.length; e < f;) {
                var g = e++;
                if (c[g] != d[g])
                    return !1
            }
            return !0
        }
        ;
        Da.mn = function (a, b) {
            a.Xc = b.Xc;
            a.Tc = b.Tc;
            a.cb = b.cb.slice(0)
        }
        ;
        Da.prototype = {
            qn: function () {
                var a = window.document.createElement("canvas");
                a.width = 160;
                a.height = 34;
                this.Lk = a.getContext("2d", null)
            },
            Yq: function () {
                var a = this.Lk;
                a.resetTransform();
                a.clearRect(0, 0, 160, 34);
                a.font = "26px sans-serif";
                a.fillStyle = "white";
                160 < a.measureText(this.o).width ? (a.textAlign = "left",
                    a.translate(2, 29)) : (a.textAlign = "center",
                    a.translate(80, 29));
                a.fillText(this.o, 0, 0)
            },
            An: function (a, b, c) {
                a.drawImage(this.Lk.canvas, 0, 0, 160, 34, b - 40, c - 34, 80, 17)
            },
            v: function (a, b) {
                if (null != a.F) {
                    var c = m.s.Fl.I() ? b.hb[a.$.P] : a.$.El;
                    if (!Da.Wm(this.hb, c) || null == a.jb && a.Bb != this.Ug || null != a.jb && this.pf != a.jb)
                        Da.mn(this.hb, c),
                            null == a.jb ? (this.pf = "" + a.Bb,
                                this.Ug = a.Bb) : (this.pf = a.jb,
                                this.Ug = -1),
                            this.Tp(this.pf)
                }
                this.vn = 0 >= b.H.Ga && a.bc ? "white" : "black";
                a.o != this.o && (this.o = a.o,
                    this.Yq())
            },
            Tp: function (a) {
                var b = this.hb.cb;
                if (!(1 > b.length)) {
                    this.pb.save();
                    this.pb.translate(32, 32);
                    this.pb.rotate(3.141592653589793 * this.hb.Xc / 128);
                    for (var c = -32, d = 64 / b.length, e = 0; e < b.length;)
                        this.pb.fillStyle = N.Hc(b[e++]),
                            this.pb.fillRect(c, -32, d + 4, 64),
                            c += d;
                    this.pb.restore();
                    this.pb.fillStyle = N.Hc(this.hb.Tc);
                    this.pb.textAlign = "center";
                    this.pb.textBaseline = "alphabetic";
                    this.pb.font = "900 34px 'Arial Black','Arial Bold',Gadget,sans-serif";
                    this.pb.fillText(a, 32, 44);
                    this.cj = this.pb.createPattern(this.pb.canvas, "no-repeat")
                }
            },
            g: Da
        };
        lb.b = !0;
        lb.prototype = {
            Ph: function (a) {
                for (var b = this, c = 0, d = Ha.Za.length >> 2; c < d;) {
                    var e = c++
                        , f = [e]
                        , g = Ha.Za[e << 2]
                        , e = Ha.Za[(e << 2) + 1].toLowerCase()
                        , h = [window.document.createElement("div")];
                    h[0].className = "elem";
                    h[0].innerHTML = '<div class="flagico f-' + e + '"></div> ' + g;
                    a.appendChild(h[0]);
                    h[0].onclick = function (a, c) {
                        return function () {
                            null != b.Ve && b.Ve.ya.classList.remove("selected");
                            b.Wg.disabled = !1;
                            b.Ve = {
                                ya: a[0],
                                index: c[0]
                            };
                            a[0].classList.add("selected")
                        }
                    }(h, f);
                    h[0].ondblclick = function (a) {
                        return function () {
                            b.jl(a[0])
                        }
                    }(f)
                }
            },
            jl: function (a) {
                var b = new S;
                b.lb = Ha.Za[(a << 2) + 1].toLowerCase();
                b.lc = Ha.Za[(a << 2) + 2];
                b.mc = Ha.Za[(a << 2) + 3];
                m.s.xe.Sa(b);
                y.i(this.nb)
            },
            g: lb
        };
        Ca.b = !0;
        Ca.io = function (a) {
            return a.parentElement.querySelector(":hover") == a
        }
        ;
        Ca.prototype = {
            fa: function (a, b) {
                var c = window.document.createElement("p");
                null != b && (c.className = b);
                c.textContent = a;
                var d = this.Wb.clientHeight
                    , d = this.Wb.scrollTop + d - this.Wb.scrollHeight >= .5 * -d || !Ca.io(this.Wb);
                this.Wb.appendChild(c);
                d && (this.Wb.scrollTop = c.offsetTop);
                for (c = d ? 50 : 100; this.Wb.childElementCount > c;)
                    this.Wb.firstElementChild.remove();
                this.Yf.update()
            },
            Hb: function (a) {
                this.fa(a, "notice")
            },
            g: Ca
        };
        kb.b = !0;
        kb.Dn = function (a) {
            return -1 != ".$^{[(|)*+?\\".indexOf(a) ? "\\" + a : a
        }
        ;
        kb.prototype = {
            rh: function () {
                this.wi(null)
            },
            Rm: function (a, b) {
                var c = this.Up.exec(C.substr(a, 0, b));
                if (null != c) {
                    var d = c[0]
                        , e = new RegExp(".*" + C.substr(d, 1, null).split("").map(kb.Dn).join(".*") + ".*", "i");
                    this.Wj = "#" == d.charAt(0);
                    this.Wh = c.index;
                    this.gq = d.length;
                    this.$k = a;
                    this.wi(this.bj.filter(function (a) {
                        return e.test(a.o)
                    }))
                } else
                    this.wi(null)
            },
            Fj: function (a) {
                a = this.Wj ? "#" + a.P : "@" + H.replace(a.o, " ", "_");
                this.Zo(C.substr(this.$k, 0, this.Wh) + a + " " + C.substr(this.$k, this.Wh + this.gq, null), this.Wh + a.length + 1)
            },
            wi: function (a) {
                var b = this
                    , c = null != a && 0 != a.length;
                this.Eb.hidden || r.ff(this.Eb);
                this.Kc = null;
                this.Eb.hidden = !c;
                if (c) {
                    for (var c = [], d = 0; d < a.length;) {
                        var e = [a[d]];
                        ++d;
                        var f = window.document.createElement("div")
                            , g = e[0].o;
                        this.Wj && (g = "(" + e[0].P + ") " + g);
                        f.textContent = g;
                        this.Eb.appendChild(f);
                        f.onclick = function (a) {
                            return function () {
                                b.Fj(a[0])
                            }
                        }(e);
                        c.push({
                            item: e[0],
                            ya: f
                        })
                    }
                    this.Kc = c;
                    this.Kc[0].ya.classList.toggle("selected", !0);
                    this.qc = 0
                }
            },
            kj: function (a) {
                if (null != this.Kc) {
                    var b = this.qc;
                    this.qc += a;
                    a = this.Kc.length - 1;
                    0 > this.qc ? this.qc = a : this.qc > a && (this.qc = 0);
                    a = this.Kc[this.qc];
                    b != this.qc && (a.ya.classList.toggle("selected", !0),
                        this.Kc[b].ya.classList.toggle("selected", !1));
                    a = a.ya;
                    b = a.offsetTop;
                    a = b + a.offsetHeight;
                    var c = this.Eb.scrollTop + this.Eb.clientHeight;
                    b < this.Eb.scrollTop ? this.Eb.scrollTop = b : a > c && (this.Eb.scrollTop = a - this.Eb.clientHeight)
                }
            },
            yn: function () {
                null != this.Kc && (this.Fj(this.Kc[this.qc].item),
                    this.rh())
            },
            g: kb
        };
        jb.b = !0;
        jb.prototype = {
            zc: function () {
                var a = this.Ab.value;
                return 25 >= a.length ? 0 < a.length : !1
            },
            v: function () {
                this.Ie.disabled = !this.zc()
            },
            g: jb
        };
        ib.b = !0;
        ib.prototype = {
            fa: function (a) {
                var b = window.document.createElement("p");
                b.textContent = a;
                this.Wb.appendChild(b)
            },
            g: ib
        };
        hb.b = !0;
        hb.prototype = {
            $i: function (a) {
                this.Nl = a;
                this.Ml.textContent = "Show in room list: " + (a ? "No" : "Yes")
            },
            zc: function () {
                var a = this.He.value;
                return 40 >= a.length ? 0 < a.length : !1
            },
            v: function () {
                this.pj.disabled = !this.zc()
            },
            g: hb
        };
        gb.b = !0;
        gb.prototype = {
            g: gb
        };
        fb.b = !0;
        fb.prototype = {
            ig: function (a) {
                this.f.classList.toggle("restricted", a)
            },
            v: function (a) {
                var b = a.H;
                null != b && (this.rc.Dq(60 * a.xa),
                    this.rc.Cq(b.Ac | 0),
                    this.Cb.set(b.Cb),
                    this.Kb.set(b.Kb),
                    this.Db.Bc(a, this.Ib))
            },
            g: fb
        };
        Mb.b = !0;
        Mb.prototype = {
            Gd: function (a, b) {
                var c = window.document.createElement("span");
                c.textContent = a;
                c.className = b;
                return c
            },
            Cq: function (a) {
                if (a != this.ue) {
                    var b = a % 60
                        , c = a / 60 | 0;
                    this.nq.textContent = "" + b % 10;
                    this.oq.textContent = "" + (b / 10 | 0) % 10;
                    this.Go.textContent = "" + c % 10;
                    this.Ho.textContent = "" + (c / 10 | 0) % 10;
                    this.ue = a
                }
                this.Xk();
                this.Yk()
            },
            Dq: function (a) {
                this.xa = a;
                this.Xk();
                this.Yk()
            },
            Xk: function () {
                this.zq(0 != this.xa && this.ue > this.xa)
            },
            Yk: function () {
                this.Eq(this.ue < this.xa && this.ue > this.xa - 30)
            },
            zq: function (a) {
                a != this.Bj && (this.kp.className = a ? "overtime on" : "overtime",
                    this.Bj = a)
            },
            Eq: function (a) {
                a != this.Cj && (this.f.className = a ? "game-timer-view time-warn" : "game-timer-view",
                    this.Cj = a)
            },
            g: Mb
        };
        ja.b = !0;
        ja.prototype = {
            v: function (a) {
                null == a.L.H && this.Vd(!0);
                y.i(this.Ok);
                this.Gh.disabled = null == a.L.H;
                this.ud ? this.Ra.v(a.L, a.L.ka(a.nc)) : (a = a.yf(),
                    this.Gb.v(a),
                    m.Ya.qj.Vr(a))
            },
            Vd: function (a) {
                this.ud != a && ((this.ud = a) ? (this.kh.appendChild(this.Ra.f),
                    this.Gb.f.remove()) : (this.kh.appendChild(this.Gb.f),
                    this.Ra.f.remove()))
            },
            jo: function () {
                return null != ja.sp
            },
            ab: function (a, b) {
                r.ff(this.Oe);
                ja.sp = a;
                null != a ? (this.Oe.style.display = "flex",
                    this.Oe.appendChild(a),
                    this.Ok = b) : (this.Oe.style.display = "none",
                    this.Ok = null)
            },
            g: ja
        };
        eb.b = !0;
        eb.prototype = {
            Vi: function (a) {
                this.dj = a;
                this.Km.textContent = a ? "Yes" : "No"
            },
            g: eb
        };
        db.b = !0;
        db.prototype = {
            g: db
        };
        cb.b = !0;
        cb.prototype = {
            ng: function () {
                this.Mh.disabled = null == this.gb;
                this.vj.disabled = null == this.gb || null == this.gb.Vl;
                this.Kj.disabled = null == this.gb
            },
            hk: function (a, b, c) {
                var d = this
                    , e = window.document.createElement("div");
                e.textContent = a;
                e.className = "elem";
                null != c && e.classList.add("custom");
                var f = {
                    ya: e,
                    Bd: b,
                    Vl: c
                };
                e.onclick = function () {
                    null != d.gb && d.gb.ya.classList.remove("selected");
                    d.gb = f;
                    e.classList.add("selected");
                    d.ng()
                }
                ;
                e.ondblclick = function () {
                    d.gb = f;
                    d.ng();
                    return d.Mh.onclick()
                }
                ;
                return e
            },
            Ph: function (a) {
                for (var b = this, c = h.lh(), d = 0; d < c.length;) {
                    var e = [c[d]];
                    ++d;
                    e = this.hk(e[0].o, function (a) {
                        return function () {
                            return Promise.resolve(a[0])
                        }
                    }(e), null);
                    a.appendChild(e)
                }
                Z.getAll().then(function (c) {
                    for (var d = 0; d < c.length;) {
                        var e = c[d];
                        ++d;
                        var f = [e.id]
                            , e = b.hk(e.name, function (a) {
                            return function () {
                                return Z.get(a[0])
                            }
                        }(f), function (a) {
                            return function () {
                                return Z["delete"](a[0])
                            }
                        }(f));
                        a.appendChild(e)
                    }
                    b.Yf.update()
                })
            },
            g: cb
        };
        Lb.b = !0;
        Lb.prototype = {
            Dm: function (a) {
                0 > a ? (a = 150,
                    this.c.fillStyle = "#c13535") : this.c.fillStyle = "green";
                var b = this.xi
                    , c = this.Rj
                    , d = this.ah++;
                this.ah >= b && (this.ah = 0);
                this.np[d] = a;
                this.c.clearRect(d, 0, 1, c);
                a = a * c / this.Do;
                this.c.fillRect(d, c - a, 1, a);
                this.fh.clearRect(0, 0, b, c);
                this.fh.drawImage(this.ja, b - d - 1, 0);
                this.fh.drawImage(this.ja, -d - 1, 0)
            },
            g: Lb
        };
        bb.b = !0;
        bb.prototype = {
            v: function (a, b) {
                var c = a.ka(this.Ib);
                null == c ? y.i(this.nb) : (this.Xq(c),
                    this.lf.disabled = !b || 0 == this.Ib,
                    this.Ae.disabled = !b || 0 == this.Ib)
            },
            Xq: function (a) {
                this.Qd != a.o && this.Zi(a.o);
                this.Gk != a.ra && this.Yi(a.ra)
            },
            Zi: function (a) {
                this.Qd = a;
                this.Ge.textContent = a
            },
            Yi: function (a) {
                this.Gk = a;
                this.lf.textContent = a ? "Remove Admin" : "Give Admin"
            },
            g: bb
        };
        ab.b = !0;
        ab.prototype = {
            v: function (a, b) {
                this.f.draggable = b;
                this.wb != a.wb && (this.wb = a.wb,
                    this.Uf.textContent = "" + this.wb);
                this.Em != a.ra && this.nl(a.ra)
            },
            nl: function (a) {
                this.Em = a;
                this.f.className = "player-list-item" + (a ? " admin" : "")
            },
            g: ab
        };
        za.b = !0;
        za.prototype = {
            v: function (a, b, c, d) {
                var e = this;
                this.xh.disabled = b || c;
                this.Zh.disabled = c;
                b = new Set;
                c = this.jd.keys();
                for (var f = c.next(); !f.done;) {
                    var g = f.value
                        , f = c.next();
                    b.add(g)
                }
                for (c = 0; c < a.length;)
                    f = a[c],
                        ++c,
                        g = this.jd.get(f.T),
                    null == g && (g = new ab(f),
                        g.Ne = function (a) {
                            x.i(e.Ne, a)
                        }
                        ,
                        this.jd.set(f.T, g),
                        this.Za.appendChild(g.f)),
                        g.v(f, d),
                        b["delete"](f.T);
                d = b.values();
                for (b = d.next(); !b.done;)
                    c = b.value,
                        b = d.next(),
                        this.jd.get(c).f.remove(),
                        this.jd["delete"](c);
                d = 0;
                for (b = a.length - 1; d < b;)
                    f = d++,
                        c = this.jd.get(a[f].T).f,
                        f = this.jd.get(a[f + 1].T).f,
                    c.nextSibling != f && this.Za.insertBefore(c, f)
            },
            g: za
        };
        P.b = !0;
        P.prototype = {
            g: P
        };
        ha.b = !0;
        ha.lk = function (a) {
            a = a / 1E3 | 0;
            return (a / 60 | 0) + ":" + H.cf(L.ie(a % 60))
        }
        ;
        ha.prototype = {
            v: function () {
                this.Oq.textContent = ha.lk(this.Xh.Lb);
                this.Jp.style.width = 100 * this.Xh.On() + "%";
                !this.Df || 0 < this.Xh.td || (this.Df = !1,
                    this.bp())
            },
            g: ha
        };
        $a.b = !0;
        $a.prototype = {
            xq: function (a) {
                this.Aj != a && (this.Aj = a,
                    this.Ff.value = a)
            },
            g: $a
        };
        Za.b = !0;
        Za.prototype = {
            g: Za
        };
        ga.b = !0;
        ga.jm = function (a) {
            return Promise.race([new Promise(function (a, c) {
                    return window.setTimeout(function () {
                        c(null)
                    }, 5E3)
                }
            ), a])
        }
        ;
        ga.prototype = {
            Yl: function () {
                function a() {
                    b.Mi.disabled = !1;
                    b.lm(c.concat(d))
                }

                var b = this;
                this.nm(null);
                this.Mi.disabled = !0;
                r.ff(this.Fi);
                var c = []
                    , d = [];
                this.Ci = [];
                var e = yb.I().then(function (a) {
                    return d = a
                }, function () {
                    return {}
                })
                    , f = va.get().then(function (a) {
                    return c = a
                }, function () {
                    return {}
                });
                Promise.all([ga.jm(e), ga.jm(f)]).then(a, a)
            },
            lm: function (a) {
                var b = this;
                this.Ci = a;
                va.Rr(this.sr, a);
                a.sort(function (a, b) {
                    return a.ve - b.ve
                });
                r.ff(this.Fi);
                for (var c = 0, d = 0, e = !this.qr.Ha, f = !this.rr.Ha, g = !this.Kr.Ha, h = 0; h < a.length;) {
                    var k = [a[h]];
                    ++h;
                    var l = k[0].yc;
                    if (!(f && l.D >= l.Md || g && l.ob || e && k[0].Cf)) {
                        var m = [new Za(k[0])];
                        m[0].ya.ondblclick = function (a) {
                            return function () {
                                x.i(b.gm, a[0])
                            }
                        }(k);
                        m[0].ya.onclick = function (a) {
                            return function () {
                                b.nm(a[0])
                            }
                        }(m);
                        this.Fi.appendChild(m[0].ya);
                        c += l.D;
                        ++d
                    }
                }
                this.nr.textContent = "" + c + " players in " + d + " rooms";
                this.Lr.update()
            },
            nm: function (a) {
                null != this.Ad && this.Ad.ya.classList.remove("selected");
                this.Ad = a;
                null != this.Ad && this.Ad.ya.classList.add("selected");
                this.bm.disabled = null == this.Ad
            },
            g: ga
        };
        Ya.b = !0;
        Ya.prototype = {
            Wk: function () {
                var a = this;
                J.Mj(m.mf + "api/notice").then(function (b) {
                    var c = b.content;
                    null != c && "" != c && Ya.Zm != c && (a.ln.innerHTML = c,
                            a.mk.hidden = !1,
                            a.$c.onclick = function () {
                                Ya.Zm = c;
                                return a.mk.hidden = !0
                            }
                    )
                })
            },
            g: Ya
        };
        Xa.b = !0;
        Xa.prototype = {
            zc: function () {
                var a = this.Ab.value;
                return 30 >= a.length ? 0 < a.length : !1
            },
            v: function () {
                this.Ie.disabled = !this.zc()
            },
            g: Xa
        };
        Wa.b = !0;
        Wa.prototype = {
            uh: function (a, b, c, d) {
                var e = this;
                r.he(a, b.f);
                b.Qf = function (a, b) {
                    ia.i(e.Qf, a, b)
                }
                ;
                b.Od = function (a) {
                    x.i(e.Od, a)
                }
                ;
                b.So = function (a) {
                    ia.i(e.Qf, d, a)
                }
                ;
                b.Ne = function (a) {
                    x.i(e.Ne, a)
                }
            },
            ik: function (a) {
                for (var b = [], c = 0; c < a;) {
                    var d = c++;
                    b.push(null == d ? "null" : "" + d)
                }
                return b
            },
            jk: function (a, b) {
                for (var c = 0; c < b.length;) {
                    var d = b[c++]
                        , e = window.document.createElement("option");
                    e.textContent = d;
                    a.appendChild(e)
                }
            },
            Bq: function (a) {
                this.Tk.classList.toggle("active", a)
            },
            v: function (a, b) {
                this.fq != a.$b && (this.fq = a.$b,
                    this.$b.textContent = a.$b);
                var c = null == b ? !1 : b.ra;
                this.zj != c && (this.f.className = "room-view" + (c ? " admin" : ""),
                    this.zj = c);
                var d = !c || null != a.H;
                this.$e.disabled = d;
                this.Ue.disabled = d;
                this.Al.disabled = d;
                d = null != a.H;
                this.Bl.hidden = d;
                this.Dl.hidden = !d;
                this.Lh.hidden = !d;
                this.$e.selectedIndex = a.xa;
                this.Ue.selectedIndex = a.fb;
                this.zl.textContent = a.U.o;
                this.zl.classList.toggle("custom", !a.U.ze());
                var e = a.Gc;
                this.Vk.v(a.D.filter(function (a) {
                    return a.$ == p.ba
                }), e, d, c);
                this.fj.v(a.D.filter(function (a) {
                    return a.$ == p.ta
                }), e, d, c);
                this.yl.v(a.D.filter(function (a) {
                    return a.$ == p.Fa
                }), e, d, c);
                this.dl.disabled = d;
                this.Ah != a.Gc && this.Wi(a.Gc);
                d && (c = 120 == a.H.Ga,
                this.Bk != c && this.Xi(c))
            },
            Wi: function (a) {
                this.Ah = a;
                this.dk.innerHTML = this.Ah ? "<i class='icon-lock'></i>Unlock" : "<i class='icon-lock-open'></i>Lock"
            },
            Xi: function (a) {
                this.Bk = a;
                this.Lh.innerHTML = "<i class='icon-pause'></i>" + (this.Bk ? "Resume (P)" : "Pause (P)")
            },
            g: Wa
        };
        ba.b = !0;
        ba.prototype = {
            g: ba
        };
        O.b = !0;
        O.prototype = {
            g: O
        };
        Va.b = !0;
        Va.prototype = {
            Aq: function (a) {
                this.Uf.textContent = null == a ? "null" : "" + a
            },
            yq: function (a) {
                this.Eo.textContent = "" + a
            },
            ql: function (a) {
                this.En.textContent = null == a ? "null" : "" + a
            },
            g: Va
        };
        Ua.b = !0;
        Ua.prototype = {
            g: Ua
        };
        q.b = !0;
        q.ua = Error;
        q.prototype = E(Error.prototype, {
            g: q
        });
        t.b = !0;
        t.Xl = function (a) {
            if (a instanceof Array && null == a.sb)
                return Array;
            var b = a.g;
            if (null != b)
                return b;
            a = t.Ri(a);
            return null != a ? t.Bm(a) : null
        }
        ;
        t.le = function (a, b) {
            if (null == a)
                return "null";
            if (5 <= b.length)
                return "<...>";
            var c = typeof a;
            "function" == c && (a.b || a.kf) && (c = "object");
            switch (c) {
                case "function":
                    return "<function>";
                case "object":
                    if (a.sb) {
                        var d = ub[a.sb]
                            , c = d.Ng[a.vb]
                            , e = d[c];
                        if (e.ke) {
                            b += "\t";
                            for (var c = c + "(", d = [], f = 0, e = e.ke; f < e.length;) {
                                var g = e[f];
                                ++f;
                                d.push(t.le(a[g], b))
                            }
                            return c + d.join(",") + ")"
                        }
                        return c
                    }
                    if (a instanceof Array) {
                        c = a.length;
                        d = "[";
                        b += "\t";
                        for (f = 0; f < c;)
                            e = f++,
                                d += (0 < e ? "," : "") + t.le(a[e], b);
                        return d + "]"
                    }
                    try {
                        d = a.toString
                    } catch (n) {
                        return "???"
                    }
                    if (null != d && d != Object.toString && "function" == typeof d && (c = a.toString(),
                    "[object Object]" != c))
                        return c;
                    c = null;
                    d = "{\n";
                    b += "\t";
                    f = null != a.hasOwnProperty;
                    for (c in a)
                        f && !a.hasOwnProperty(c) || "prototype" == c || "__class__" == c || "__super__" == c || "__interfaces__" == c || "__properties__" == c || (2 != d.length && (d += ", \n"),
                            d += b + c + " : " + t.le(a[c], b));
                    b = b.substring(1);
                    return d + ("\n" + b + "}");
                case "string":
                    return a;
                default:
                    return String(a)
            }
        }
        ;
        t.Pg = function (a, b) {
            if (null == a)
                return !1;
            if (a == b)
                return !0;
            var c = a.je;
            if (null != c)
                for (var d = 0, e = c.length; d < e;) {
                    var f = c[d++];
                    if (f == b || t.Pg(f, b))
                        return !0
                }
            return t.Pg(a.ua, b)
        }
        ;
        t.zm = function (a, b) {
            if (null == b)
                return !1;
            switch (b) {
                case Array:
                    return a instanceof Array ? null == a.sb : !1;
                case jc:
                    return "boolean" == typeof a;
                case nc:
                    return !0;
                case B:
                    return "number" == typeof a;
                case ic:
                    return "number" == typeof a ? (a | 0) === a : !1;
                case String:
                    return "string" == typeof a;
                default:
                    if (null != a)
                        if ("function" == typeof b) {
                            if (a instanceof b || t.Pg(t.Xl(a), b))
                                return !0
                        } else {
                            if ("object" == typeof b && t.Am(b) && a instanceof b)
                                return !0
                        }
                    else
                        return !1;
                    return b == oc && null != a.b || b == pc && null != a.kf ? !0 : ub[a.sb] == b
            }
        }
        ;
        t.N = function (a, b) {
            if (t.zm(a, b))
                return a;
            throw new q("Cannot cast " + L.ie(a) + " to " + L.ie(b));
        }
        ;
        t.Ri = function (a) {
            a = t.Cm.call(a).slice(8, -1);
            return "Object" == a || "Function" == a || "Math" == a || "JSON" == a ? null : a
        }
        ;
        t.Am = function (a) {
            return null != t.Ri(a)
        }
        ;
        t.Bm = function (a) {
            return lc[a]
        }
        ;
        cc.b = !0;
        cc.Sr = function (a, b) {
            var c = new Uint8Array(this, a, null == b ? null : b - a)
                , d = new Uint8Array(c.byteLength);
            d.set(c);
            return d.buffer
        }
        ;
        var mc = 0;
        null == String.fromCodePoint && (String.fromCodePoint = function (a) {
                return 65536 > a ? String.fromCharCode(a) : String.fromCharCode((a >> 10) + 55232) + String.fromCharCode((a & 1023) + 56320)
            }
        );
        String.prototype.g = String;
        String.b = !0;
        Array.b = !0;
        Date.prototype.g = Date;
        Date.b = "Date";
        var ic = {}
            , nc = {}
            , B = Number
            , jc = Boolean
            , oc = {}
            , pc = {};
        p.Fa = new p(0, 16777215, 0, -1, "Spectators", "t-spec", 0, 0);
        p.ba = new p(1, 15035990, -1, 8, "Red", "t-red", 0, 2);
        p.ta = new p(2, 5671397, 1, 16, "Blue", "t-blue", 0, 4);
        p.Fa.Tf = p.Fa;
        p.ba.Tf = p.ta;
        p.ta.Tf = p.ba;
        Object.defineProperty(q.prototype, "message", {
            get: function () {
                return String(this.Ha)
            }
        });
        null == ArrayBuffer.prototype.slice && (ArrayBuffer.prototype.slice = cc.Sr);
        Ta.jn = {
            mandatory: {
                OfferToReceiveAudio: !1,
                OfferToReceiveVideo: !1
            }
        };
        G.Qg = {
            name: "ECDSA",
            namedCurve: "P-256"
        };
        G.tl = {
            name: "ECDSA",
            hash: {
                name: "SHA-256"
            }
        };
        Aa.bo = ["click-rail", "drag-thumb", "wheel", "touch"];
        l.$l = new Map;
        l.af = 0;
        Sa.La = l.Ta({
            Na: !1,
            Ma: !1
        });
        xa.uc = 0;
        Ub.Ul = [{
            name: "ro",
            reliable: !0,
            Ji: !0
        }, {
            name: "ru",
            reliable: !0,
            Ji: !1
        }, {
            name: "uu",
            reliable: !1,
            Ji: !1
        }];
        J.um = "application/x-www-form-urlencoded";
        Ha.Za = ["Afghanistan", "AF", 33.3, 65.1, "Albania", "AL", 41.1, 20.1, "Algeria", "DZ", 28, 1.6, "American Samoa", "AS", -14.2, -170.1, "Andorra", "AD", 42.5, 1.6, "Angola", "AO", -11.2, 17.8, "Anguilla", "AI", 18.2, -63, "Antigua and Barbuda", "AG", 17, -61.7, "Argentina", "AR", -34.5, -58.4, "Armenia", "AM", 40, 45, "Aruba", "AW", 12.5, -69.9, "Australia", "AU", -25.2, 133.7, "Austria", "AT", 47.5, 14.5, "Azerbaijan", "AZ", 40.1, 47.5, "Bahamas", "BS", 25, -77.3, "Bahrain", "BH", 25.9, 50.6, "Bangladesh", "BD", 23.6, 90.3, "Barbados", "BB", 13.1, -59.5, "Belarus", "BY", 53.7, 27.9, "Belgium", "BE", 50.5, 4.4, "Belize", "BZ", 17.1, -88.4, "Benin", "BJ", 9.3, 2.3, "Bermuda", "BM", 32.3, -64.7, "Bhutan", "BT", 27.5, 90.4, "Bolivia", "BO", -16.2, -63.5, "Bosnia and Herzegovina", "BA", 43.9, 17.6, "Botswana", "BW", -22.3, 24.6, "Bouvet Island", "BV", -54.4, 3.4, "Brazil", "BR", -14.2, -51.9, "British Indian Ocean Territory", "IO", -6.3, 71.8, "British Virgin Islands", "VG", 18.4, -64.6, "Brunei", "BN", 4.5, 114.7, "Bulgaria", "BG", 42.7, 25.4, "Burkina Faso", "BF", 12.2, -1.5, "Burundi", "BI", -3.3, 29.9, "Cambodia", "KH", 12.5, 104.9, "Cameroon", "CM", 7.3, 12.3, "Canada", "CA", 56.1, -106.3, "Cape Verde", "CV", 16, -24, "Cayman Islands", "KY", 19.5, -80.5, "Central African Republic", "CF", 6.6, 20.9, "Chad", "TD", 15.4, 18.7, "Chile", "CL", -35.6, -71.5, "China", "CN", 35.8, 104.1, "Christmas Island", "CX", -10.4, 105.6, "Colombia", "CO", 4.5, -74.2, "Comoros", "KM", -11.8, 43.8, "Congo [DRC]", "CD", -4, 21.7, "Congo [Republic]", "CG", -.2, 15.8, "Cook Islands", "CK", -21.2, -159.7, "Costa Rica", "CR", 9.7, -83.7, "Croatia", "HR", 45.1, 15.2, "Cuba", "CU", 21.5, -77.7, "Cyprus", "CY", 35.1, 33.4, "Czech Republic", "CZ", 49.8, 15.4, "C\u00f4te d'Ivoire", "CI", 7.5, -5.5, "Denmark", "DK", 56.2, 9.5, "Djibouti", "DJ", 11.8, 42.5, "Dominica", "DM", 15.4, -61.3, "Dominican Republic", "DO", 18.7, -70.1, "Ecuador", "EC", -1.8, -78.1, "Egypt", "EG", 26.8, 30.8, "El Salvador", "SV", 13.7, -88.8, "Equatorial Guinea", "GQ", 1.6, 10.2, "Eritrea", "ER", 15.1, 39.7, "Estonia", "EE", 58.5, 25, "Ethiopia", "ET", 9.1, 40.4, "Faroe Islands", "FO", 61.8, -6.9, "Fiji", "FJ", -16.5, 179.4, "Finland", "FI", 61.9, 25.7, "France", "FR", 46.2, 2.2, "French Guiana", "GF", 3.9, -53.1, "French Polynesia", "PF", -17.6, -149.4, "Gabon", "GA", -.8, 11.6, "Gambia", "GM", 13.4, -15.3, "Georgia", "GE", 42.3, 43.3, "Germany", "DE", 51.1, 10.4, "Ghana", "GH", 7.9, -1, "Gibraltar", "GI", 36.1, -5.3, "Greece", "GR", 39, 21.8, "Greenland", "GL", 71.7, -42.6, "Grenada", "GD", 12.2, -61.6, "Guadeloupe", "GP", 16.9, -62, "Guam", "GU", 13.4, 144.7, "Guatemala", "GT", 15.7, -90.2, "Guinea", "GN", 9.9, -9.6, "Guinea-Bissau", "GW", 11.8, -15.1, "Guyana", "GY", 4.8, -58.9, "Haiti", "HT", 18.9, -72.2, "Honduras", "HN", 15.1, -86.2, "Hong Kong", "HK", 22.3, 114.1, "Hungary", "HU", 47.1, 19.5, "Iceland", "IS", 64.9, -19, "India", "IN", 20.5, 78.9, "Indonesia", "ID", -.7, 113.9, "Iran", "IR", 32.4, 53.6, "Iraq", "IQ", 33.2, 43.6, "Ireland", "IE", 53.4, -8.2, "Israel", "IL", 31, 34.8, "Italy", "IT", 41.8, 12.5, "Jamaica", "JM", 18.1, -77.2, "Japan", "JP", 36.2, 138.2, "Jordan", "JO", 30.5, 36.2, "Kazakhstan", "KZ", 48, 66.9, "Kenya", "KE", -0, 37.9, "Kiribati", "KI", -3.3, -168.7, "Kosovo", "XK", 42.6, 20.9, "Kuwait", "KW", 29.3, 47.4, "Kyrgyzstan", "KG", 41.2, 74.7, "Laos", "LA", 19.8, 102.4, "Latvia", "LV", 56.8, 24.6, "Lebanon", "LB", 33.8, 35.8, "Lesotho", "LS", -29.6, 28.2, "Liberia", "LR", 6.4, -9.4, "Libya", "LY", 26.3, 17.2, "Liechtenstein", "LI", 47.1, 9.5, "Lithuania", "LT", 55.1, 23.8, "Luxembourg", "LU", 49.8, 6.1, "Macau", "MO", 22.1, 113.5, "Macedonia [FYROM]", "MK", 41.6, 21.7, "Madagascar", "MG", -18.7, 46.8, "Malawi", "MW", -13.2, 34.3, "Malaysia", "MY", 4.2, 101.9, "Maldives", "MV", 3.2, 73.2, "Mali", "ML", 17.5, -3.9, "Malta", "MT", 35.9, 14.3, "Marshall Islands", "MH", 7.1, 171.1, "Martinique", "MQ", 14.6, -61, "Mauritania", "MR", 21, -10.9, "Mauritius", "MU", -20.3, 57.5, "Mayotte", "YT", -12.8, 45.1, "Mexico", "MX", 23.6, -102.5, "Micronesia", "FM", 7.4, 150.5, "Moldova", "MD", 47.4, 28.3, "Monaco", "MC", 43.7, 7.4, "Mongolia", "MN", 46.8, 103.8, "Montenegro", "ME", 42.7, 19.3, "Montserrat", "MS", 16.7, -62.1, "Morocco", "MA", 31.7, -7, "Mozambique", "MZ", -18.6, 35.5, "Myanmar [Burma]", "MM", 21.9, 95.9, "Namibia", "NA", -22.9, 18.4, "Nauru", "NR", -.5, 166.9, "Nepal", "NP", 28.3, 84.1, "Netherlands", "NL", 52.1, 5.2, "Netherlands Antilles", "AN", 12.2, -69, "New Caledonia", "NC", -20.9, 165.6, "New Zealand", "NZ", -40.9, 174.8, "Nicaragua", "NI", 12.8, -85.2, "Niger", "NE", 17.6, 8, "Nigeria", "NG", 9, 8.6, "Niue", "NU", -19, -169.8, "Norfolk Island", "NF", -29, 167.9, "North Korea", "KP", 40.3, 127.5, "Northern Mariana Islands", "MP", 17.3, 145.3, "Norway", "NO", 60.4, 8.4, "Oman", "OM", 21.5, 55.9, "Pakistan", "PK", 30.3, 69.3, "Palau", "PW", 7.5, 134.5, "Palestinian Territories", "PS", 31.9, 35.2, "Panama", "PA", 8.5, -80.7, "Papua New Guinea", "PG", -6.3, 143.9, "Paraguay", "PY", -23.4, -58.4, "Peru", "PE", -9.1, -75, "Philippines", "PH", 12.8, 121.7, "Pitcairn Islands", "PN", -24.7, -127.4, "Poland", "PL", 51.9, 19.1, "Portugal", "PT", 39.3, -8.2, "Puerto Rico", "PR", 18.2, -66.5, "Qatar", "QA", 25.3, 51.1, "Romania", "RO", 45.9, 24.9, "Russia", "RU", 61.5, 105.3, "Rwanda", "RW", -1.9, 29.8, "R\u00e9union", "RE", -21.1, 55.5, "Saint Helena", "SH", -24.1, -10, "Saint Kitts", "KN", 17.3, -62.7, "Saint Lucia", "LC", 13.9, -60.9, "Saint Pierre", "PM", 46.9, -56.2, "Saint Vincent", "VC", 12.9, -61.2, "Samoa", "WS", -13.7, -172.1, "San Marino", "SM", 43.9, 12.4, "Saudi Arabia", "SA", 23.8, 45, "Senegal", "SN", 14.4, -14.4, "Serbia", "RS", 44, 21, "Seychelles", "SC", -4.6, 55.4, "Sierra Leone", "SL", 8.4, -11.7, "Singapore", "SG", 1.3, 103.8, "Slovakia", "SK", 48.6, 19.6, "Slovenia", "SI", 46.1, 14.9, "Solomon Islands", "SB", -9.6, 160.1, "Somalia", "SO", 5.1, 46.1, "South Africa", "ZA", -30.5, 22.9, "South Georgia", "GS", -54.4, -36.5, "South Korea", "KR", 35.9, 127.7, "Spain", "ES", 40.4, -3.7, "Sri Lanka", "LK", 7.8, 80.7, "Sudan", "SD", 12.8, 30.2, "Suriname", "SR", 3.9, -56, "Svalbard and Jan Mayen", "SJ", 77.5, 23.6, "Swaziland", "SZ", -26.5, 31.4, "Sweden", "SE", 60.1, 18.6, "Switzerland", "CH", 46.8, 8.2, "Syria", "SY", 34.8, 38.9, "S\u00e3o Tom\u00e9 and Pr\u00edncipe", "ST", .1, 6.6, "Taiwan", "TW", 23.6, 120.9, "Tajikistan", "TJ", 38.8, 71.2, "Tanzania", "TZ", -6.3, 34.8, "Thailand", "TH", 15.8, 100.9, "Timor-Leste", "TL", -8.8, 125.7, "Togo", "TG", 8.6, .8, "Tokelau", "TK", -8.9, -171.8, "Tonga", "TO", -21.1, -175.1, "Trinidad and Tobago", "TT", 10.6, -61.2, "Tunisia", "TN", 33.8, 9.5, "Turkey", "TR", 38.9, 35.2, "Turkmenistan", "TM", 38.9, 59.5, "Turks and Caicos Islands", "TC", 21.6, -71.7, "Tuvalu", "TV", -7.1, 177.6, "U.S. Minor Outlying Islands", "UM", 0, 0, "U.S. Virgin Islands", "VI", 18.3, -64.8, "Uganda", "UG", 1.3, 32.2, "Ukraine", "UA", 48.3, 31.1, "United Arab Emirates", "AE", 23.4, 53.8, "United Kingdom", "GB", 55.3, -3.4, "United States", "US", 37, -95.7, "Uruguay", "UY", -32.5, -55.7, "Uzbekistan", "UZ", 41.3, 64.5, "Vanuatu", "VU", -15.3, 166.9, "Vatican City", "VA", 41.9, 12.4, "Venezuela", "VE", 6.4, -66.5, "Vietnam", "VN", 14, 108.2, "Wallis and Futuna", "WF", -13.7, -177.1, "Western Sahara", "EH", 24.2, -12.8, "Yemen", "YE", 15.5, 48.5, "Zambia", "ZM", -13.1, 27.8, "Zimbabwe", "ZW", -19, 29.1];
        m.fr = "wss://p2p.haxball.com/";
        m.mf = "https://www.haxball.com/rs/";
        m.Bf = [{
            urls: "stun:stun.l.google.com:19302"
        }];
        m.Pp = "6LfMLFIUAAAAAC54jquwTXtcGDc_dPbJm9WtRMSz";
        m.s = new Sb;
        h.Pq = u.ca(1024);
        sa.La = l.Ta({
            Na: !1,
            Ma: !1
        });
        Pa.La = l.Ta({
            Na: !1,
            Ma: !1
        });
        da.La = l.Ta({
            Na: !1,
            Ma: !1
        });
        ra.La = l.Ta({
            Na: !1,
            Ma: !1
        });
        qa.La = l.Ta({
            Na: !1,
            Ma: !1
        });
        R.La = l.Ta({
            Na: !1,
            Ma: !1
        });
        pa.La = l.Ta({
            Na: !1,
            Ma: !1,
            km: {
                Tl: 10,
                pm: 2E3
            }
        });
        Oa.La = l.Ta({
            Na: !1,
            Ma: !1
        });
        oa.La = l.Ta({
            Na: !1,
            Ma: !1
        });
        na.La = l.Ta({
            Na: !1,
            Ma: !1
        });
        Na.La = l.Ta({});
        Ma.La = l.Ta({
            Na: !1,
            Ma: !1,
            km: {
                Tl: 10,
                pm: 900
            }
        });
        Fa.La = l.Ta({});
        ma.La = l.Ta({
            Na: !1,
            Ma: !1
        });
        Y.La = l.Ta({
            Na: !1,
            Ma: !1
        });
        La.La = l.Ta({
            Na: !1,
            Ma: !1
        });
        Ka.La = l.Ta({
            Na: !1,
            Ma: !1
        });
        la.La = l.Ta({
            Na: !1,
            Ma: !1
        });
        D.wm = .17435839227423353;
        D.vm = 5.934119456780721;
        Q.sm = new Db([0, 0, 2, 1, 0, .35, 1, 0, 1, 0, .7, 1, 0, 0, 0, 1]);
        Q.tm = new Db([0, -1, 3, 0, 0, .35, 0, 0, 0, 0, .65, 0, 0, 1, 3, 1]);
        lb.J = "<div class='dialog change-location-view'><h1>Change Location</h1><div class='splitter'><div class='list' data-hook='list'></div><div class='buttons'><button data-hook='change'>Change</button><button data-hook='cancel'>Cancel</button></div></div></div>";
        Ca.J = "<div class='chatbox-view'><div data-hook='log' class='log'><p>Controls:<br/>Move: WASD or Arrows<br/>Kick: X, Space, Ctrl, Shift, Numpad 0<br/>View: Numbers 1 to 4</p></div><div class='autocompletebox' data-hook='autocompletebox'></div><div class='input'><input data-hook='input' type='text' /><button data-hook='send'>Send</button></div></div>";
        jb.J = "<div class='choose-nickname-view'><img src=\"images/haxball.png\" /><div class='dialog'><h1>Choose nickname</h1><div class='label-input'><label>Nick:</label><input data-hook='input' type='text' /></div><button data-hook='ok'>Ok</button></div></div>";
        ib.J = "<div class='connecting-view'><div class='dialog'><h1>Connecting</h1><div class='connecting-view-log' data-hook='log'></div><button data-hook='cancel'>Cancel</button></div></div>";
        hb.J = "<div class='create-room-view'><div class='dialog'><h1>Create room</h1><div class='label-input'><label>Room name:</label><input data-hook='name' required /></div><div class='label-input'><label>Password:</label><input data-hook='pass' /></div><div class='label-input'><label>Max players:</label><select data-hook='max-pl'></select></div><button data-hook='unlisted'></button><div class='row'><button data-hook='cancel'>Cancel</button><button data-hook='create'>Create</button></div></div></div>";
        gb.J = "<div class='disconnected-view'><div class='dialog basic-dialog'><h1>Disconnected</h1><p data-hook='reason'></p><div class='buttons'><button data-hook='ok'>Ok</button><button data-hook='replay'>Save replay</button></div></div></div>";
        fb.J = "<div class='game-state-view'><div class='bar-container'><div class='bar'><div class='scoreboard'><div class='teamicon red'></div><div class='score' data-hook='red-score'>0</div><div>-</div><div class='score' data-hook='blue-score'>0</div><div class='teamicon blue'></div></div><div data-hook='timer'></div></div></div><div class='canvas' data-hook='canvas'></div></div>";
        ja.J = "<div class='game-view' tabindex='-1'><div class='top-section' data-hook='gameplay-section'></div><div class='bottom-section'><div data-hook='stats'></div><div data-hook='chatbox'></div><div class='buttons'><button data-hook='menu'><i class='icon-menu'></i>Menu<span class='tooltip'>Toggle room menu [Escape]</span></button><button data-hook='settings'><i class='icon-cog'></i>Settings</button></div></div><div data-hook='popups'></div></div>";
        eb.J = "<div class='dialog kick-player-view'><h1 data-hook='title'></h1><div class=label-input><label>Reason: </label><input type='text' data-hook='reason' /></div><button data-hook='ban-btn'><i class='icon-block'></i>Ban from rejoining: <span data-hook='ban-text'></span></button><div class=\"row\"><button data-hook='close'>Cancel</button><button data-hook='kick'>Kick</button></div></div>";
        db.J = "<div class='dialog basic-dialog leave-room-view'><h1>Leave room?</h1><p>Are you sure you want to leave the room?</p><div class='buttons'><button data-hook='cancel'>Cancel</button><button data-hook='leave'><i class='icon-logout'></i>Leave</button></div></div>";
        cb.J = "<div class='dialog pick-stadium-view'><h1>Pick a stadium</h1><div class='splitter'><div class='list' data-hook='list'></div><div class='buttons'><button data-hook='pick'>Pick</button><button data-hook='delete'>Delete</button><div class='file-btn'><label for='stadfile'>Load</label><input id='stadfile' type='file' accept='.hbs' data-hook='file'/></div><button data-hook='export'>Export</button><div class='spacer'></div><button data-hook='cancel'>Cancel</button></div></div></div>";
        bb.J = "<div class='dialog' style='min-width:200px'><h1 data-hook='name'></h1><button data-hook='admin'></button><button data-hook='kick'>Kick</button><button data-hook='close'>Close</button></div>";
        ab.J = "<div class='player-list-item'><div data-hook='flag' class='flagico'></div><div data-hook='name'></div><div data-hook='ping'></div></div>";
        za.J = "<div class='player-list-view'><div class='buttons'><button data-hook='join-btn'>Join</button><button data-hook='reset-btn' class='admin-only'></button></div><div class='list' data-hook='list'></div></div>";
        ha.J = "<div class='replay-controls-view'><button data-hook='reset'><i class='icon-to-start'></i></button><button data-hook='play'><i data-hook='playicon'></i></button><div data-hook='spd'>1x</div><button data-hook='spddn'>-</button><button data-hook='spdup'>+</button><div data-hook='time'>00:00</div><div class='timebar' data-hook='timebar'><div class='barbg'><div class='bar' data-hook='progbar'></div></div><div class='timetooltip' data-hook='timetooltip'></div></div><button data-hook='leave'>Leave</button></div>";
        $a.J = "<div class='dialog basic-dialog room-link-view'><h1>Room link</h1><p>Use this url to link others directly into this room.</p><input data-hook='link' readonly></input><div class='buttons'><button data-hook='close'>Close</button><button data-hook='copy'>Copy to clipboard</button></div></div>";
        Za.Qi = "<tr><td><span data-hook='tag'></span><span data-hook='name'></span></td><td data-hook='players'></td><td data-hook='pass'></td><td><div data-hook='flag' class='flagico'></div><span data-hook='distance'></span></td></tr>";
        ga.Qi = "<div class='roomlist-view'><div class='notice' data-hook='notice' hidden><div data-hook='notice-contents'>Testing the notice.</div><div data-hook='notice-close'><i class='icon-cancel'></i></div></div><div class='dialog'><h1>Room list</h1><p>Tip: Join rooms near you to reduce lag.</p><div class='splitter'><div class='list'><table class='header'><colgroup><col><col><col><col></colgroup><thead><tr><td>Name</td><td>Players</td><td>Pass</td><td>Distance</td></tr></thead></table><div class='separator'></div><div class='content' data-hook='listscroll'><table><colgroup><col><col><col><col></colgroup><tbody data-hook='list'></tbody></table></div><div class='filters'><span class='bool' data-hook='fil-flash'>Show flash <i></i></span><span class='bool' data-hook='fil-pass'>Show locked <i></i></span><span class='bool' data-hook='fil-full'>Show full <i></i></span></div></div><div class='buttons'><button data-hook='refresh'><i class='icon-cw'></i><div>Refresh</div></button><button data-hook='join'><i class='icon-login'></i><div>Join Room</div></button><button data-hook='create'><i class='icon-plus'></i><div>Create Room</div></button><div class='spacer'></div><div class='file-btn'><label for='replayfile'><i class='icon-play'></i><div>Replays</div></label><input id='replayfile' type='file' accept='.hbr2' data-hook='replayfile'/></div><button data-hook='settings'><i class='icon-cog'></i><div>Settings</div></button><button data-hook='changenick'><i class='icon-cw'></i><div>Change Nick</div></button></div></div><p data-hook='count'></p></div></div>";
        Xa.J = "<div class='room-password-view'><div class='dialog'><h1>Password required</h1><div class='label-input'><label>Password:</label><input data-hook='input' /></div><div class='buttons'><button data-hook='cancel'>Cancel</button><button data-hook='ok'>Ok</button></div></div></div>";
        Wa.J = "<div class='room-view'><div class='container'><h1 data-hook='room-name'></h1><div class='header-btns'><button data-hook='rec-btn'><i class='icon-circle'></i>Rec</button><button data-hook='link-btn'><i class='icon-link'></i>Link</button><button data-hook='leave-btn'><i class='icon-logout'></i>Leave</button></div><div class='teams'><div class='tools admin-only'><button data-hook='auto-btn'>Auto</button><button data-hook='rand-btn'>Rand</button><button data-hook='lock-btn'>Lock</button><button data-hook='reset-all-btn'>Reset</button></div><div data-hook='red-list'></div><div data-hook='spec-list'></div><div data-hook='blue-list'></div><div class='spacer admin-only'></div></div><div class='settings'><div><label class='lbl'>Time limit</label><select data-hook='time-limit-sel'></select></div><div><label class='lbl'>Score limit</label><select data-hook='score-limit-sel'></select></div><div><label class='lbl'>Stadium</label><label class='val' data-hook='stadium-name'>testing the stadium name</label><button class='admin-only' data-hook='stadium-pick'>Pick</button></div></div><div class='controls admin-only'><button data-hook='start-btn'><i class='icon-play'></i>Start game</button><button data-hook='stop-btn'><i class='icon-stop'></i>Stop game</button><button data-hook='pause-btn'><i class='icon-pause'></i>Pause</button></div></div></div>";
        ba.J = "<div class='dialog settings-view'><h1>Settings</h1><button data-hook='close'>Close</button><div class='tabs'><button data-hook='soundbtn'>Sound</button><button data-hook='videobtn'>Video</button><button data-hook='inputbtn'>Input</button><button data-hook='miscbtn'>Misc</button></div><div data-hook='presskey' tabindex='-1'><div>Press a key</div></div><div class='tabcontents'><div class='section' data-hook='miscsec'><div class='loc' data-hook='loc'></div><div class='loc' data-hook='loc-ovr'></div><button data-hook='loc-ovr-btn'></button></div><div class='section' data-hook='soundsec'><div data-hook=\"tsound-main\">Sounds enabled</div><div data-hook=\"tsound-chat\">Chat sound enabled</div><div data-hook=\"tsound-highlight\">Nick highlight sound enabled</div><div data-hook=\"tsound-crowd\">Crowd sound enabled</div></div><div class='section' data-hook='inputsec'></div><div class='section' data-hook='videosec'><div>Viewport Mode:<select data-hook='viewmode'><option>Dynamic</option><option>Restricted 840x410</option><option>Full 1x Zoom</option><option>Full 1.25x Zoom</option><option>Full 1.5x Zoom</option><option>Full 1.75x Zoom</option><option>Full 2x Zoom</option><option>Full 2.25x Zoom</option><option>Full 2.5x Zoom</option></select></div><div>FPS Limit:<select data-hook='fps'><option>None (Recommended)</option><option>30</option></select></div><div data-hook=\"tvideo-teamcol\">Custom team colors enabled</div><div data-hook=\"tvideo-showindicators\">Show chat indicators</div></div></div></div>";
        ba.kl = 0;
        O.J = "<div class='simple-dialog-view'><div class='dialog basic-dialog'><h1 data-hook='title'></h1><p data-hook='content'></p><div class='buttons' data-hook='buttons'></div></div></div>";
        Va.J = "<div class='stats-view'><p>Ping: <span data-hook='ping'></span></p><p>Max Ping: <span data-hook='max-ping'></span></p><p>Fps: <span data-hook='fps'></span></p><div data-hook='graph'></div></div>";
        Ua.J = '<div class=\'unsupported-browser-view\'><div class=\'dialog\'><h1>Unsupported Browser</h1><p>Sorry! Your browser doesn\'t yet implement some features which are required for HaxBall to work.</p><p>The missing features are: <span data-hook=\'features\'></span></p><h2>Recommended browsers:</h2><div><a href="https://www.mozilla.org/firefox/new/"><img src="images/firefox-icon.png"/>Firefox</a></div><div><a href="https://www.google.com/chrome/"><img src="images/chrome-icon.png"/>Chrome</a></div><div><a href="http://www.opera.com/"><img src="images/opera-icon.png"/>Opera</a></div></div></div>';
        t.Cm = {}.toString;
        v.xo()
    }
)("undefined" != typeof window ? window : "undefined" != typeof global ? global : "undefined" != typeof self ? self : this);
