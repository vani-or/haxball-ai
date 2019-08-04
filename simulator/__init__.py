import copy
import math
import time
from typing import List, Union


class Vector:
    """
    class M
    """
    def __init__(self, x, y) -> None:
        self.x = x
        self.y = y

    def __repr__(self):
        return '(x=%s, y=%s)' % (self.x, self.y)

    def __copy__(self):
        return Vector(self.x, self.y)

    def __eq__(self, other: 'Vector'):
        return self.x == other.x and self.y == other.y


class BasicObject:
    """
    class ua
    """
    def __init__(self, position: Vector) -> None:
        self.B = -1
        self.Ba = 0.99  # damping
        self.M = Vector(0, 0)  # type: Vector # position
        self.X = 13421823
        self.a = position  # type: Vector # current velocity
        self.h = -1
        self.l = 0.5  # type: float # bCoef
        self.la = 8  # type: int # raggio
        self.pa = 0  # type: float # invMass


class Object(BasicObject):
    """
    class X
    """
    def __init__(self) -> None:
        self.B = 2
        self.Ba = 0.96  # damping
        self.M = None  # type: Vector # position
        self.X = 0
        self.Yb = None
        self.Zb = -1
        self.a = None  # type: Vector # current velocity
        self.gj = 0
        self.h = 39
        self.l = 0.5  # type: float # bCoef
        self.la = 15  # type: int # raggio
        self.pa = 0.5  # type: float # invMass
        self.zk = 0
        # .me acceleration
        # .Be kickingAcceleration
        # .Ce kickingDamping
        # .Kd kickStrength
    def dollar_m(self, a: 'Object'):
        b = self.a  # // var b = this.a // la posizione della palla
        c = a.a  # , c = a.a
        d = b.x - c.x  # , d = b.x - c.x // delta x posizione
        b = b.y - c.y  # , b = b.y - c.y // delta y posizione
        e = a.la + self.la  # , e = a.la + this.la // "la" e' il raggio. la "e" e' la somma dei raggi
        f = d * d + b * b # , f = d * d + b * b; // distanza alla due tra la palla e il oggetto
        if 0 < f and f <= e * e: # if (0 < f && f <= e * e) { // se la distanza tra la palla e il oggetto e' minore della somma
            f = math.sqrt(f)  # var f = Math.sqrt(f) // distanza pura
            d = d / f  # , d = d / f // vettore-direzione che punta dall'oggettoa alla palla, comp. X
            b = b / f  # , b = b / f // vettore-direzione che punta dall'oggettoa alla palla, comp. Y
            c = self.pa / (self.pa + a.pa)  # , c = this.pa / (this.pa + a.pa) // invMass. Massa ridotta fratto massa della palla
            e = e - f  # , e = e - f // quanto sono sovrapposti
            f = e * c  # , f = e * c // m_oggetto / (m_oggetto + m_palla) * sovrapposizione
            g = self.a  # g = this.a // posizione della palla
            h = self.a  # , h = this.a;
            g.x = h.x + d * f  # g.x = h.x + d * f; // posizione nuova della palla
            g.y = h.y + b * f  # g.y = h.y + b * f; // uguale
            h = a.a  # h = g = a.a; // posizione dell'oggetto
            g = a.a  # h = g = a.a; // posizione dell'oggetto
            e -= f  # e -= f; // m_palla / (m_oggetto + m_palla) * sovrapposizione
            g.x = h.x - d * e  # g.x = h.x - d * e; // aggiorna la posizione dell'oggetto con la direzione opposta
            g.y = h.y - b * e  # g.y = h.y - b * e;
            e = self.M  # e = this.M; // la velocita' della palla
            f = a.M  # f = a.M; // la velocita' dell'oggetto
            e = d * (e.x - f.x) + b * (e.y - f.y)  # e = d * (e.x - f.x) + b * (e.y - f.y); // proiezione della differenza delle velocita' sul vettore-direzione
            if e < 0:  # 0 > e && (e *= this.l * a.l + 1,
                e *= self.l * a.l + 1
                c *= e  # c *= e,
                g = self.M  # g = f = this.M,
                f = self.M  # g = f = this.M,
                f.x = g.x - d * c  # f.x = g.x - d * c, // aggiornamento della velocita della palla
                f.y = g.y - b * c  # f.y = g.y - b * c,
                a = a.M  # a = f = a.M,
                f = a  # a = f = a.M,
                c = e - c  # c = e - c,
                f.x = a.x + d * c  # f.x = a.x + d * c, // aggiornamento della velocita dell'oggetto
                f.y = a.y + b * c  # f.y = a.y + b * c)

    def an(self, a: 'D'):
        if a.tb == float('Infinity'):  # if (0 != 0 * a.tb) { // se a.tb==Infinity
            b = a.R.a  # b = a.R.a;
            e = a.V.a  # var e = a.V.a;
            c = e.x - b.x  # c = e.x - b.x;
            f = e.y - b.y  #  f = e.y - b.y
            g = self.a  # , g = this.a;
            d = g.x - e.x  # d = g.x - e.x;
            e = g.y - e.y  # e = g.y - e.y;
            g = self.a  # g = this.a;
            if 0 >= (g.x - b.x) * c + (g.y - b.y) * f or 0 <= d * c + e * f:  # if (0 >= (g.x - b.x) * c + (g.y - b.y) * f || 0 <= d * c + e * f)
                return  # return;
            c = a.sa  # c = a.sa;
            b = c.x  # b = c.x;
            c = c.y  # c = c.y;
            d = b * d + c * e  # d = b * d + c * e
        else:  #  } else { // se a.tb è un numero
            c = a.Hd  # c = a.Hd;
            d = self.a  # d = this.a;
            b = d.x - c.x  # b = d.x - c.x;
            c = d.y - c.y  # c = d.y - c.y;
            d = a.jg  # d = a.jg;
            e = a.kg  # e = a.kg;
            if (0 < d.x * b + d.y * c and 0 < e.x * b + e.y * c) == (0 >= a.tb):  # if ((0 < d.x * b + d.y * c && 0 < e.x * b + e.y * c) == 0 >= a.tb) TODO: tradurre bene
                return  # return;
            e = math.sqrt(b * b + c * c)  # e = Math.sqrt(b * b + c * c);
            if 0 == e:  #  if (0 == e)
                return  # return;
            d = e - a.rj  # d = e - a.rj;
            b /= e  # b /= e;
            c /= e  # c /= e

        e = a.xc  # e = a.xc;
        if e == 0:  # if (0 == e)
            if 0 > d:  # 0 > d && (d = -d,
                d = -d
                b = -b  # b = -b,
                c = -c  # c = -c);
        else:  # else if (0 > e && (e = -e,
            if 0 > e:
                e = -e
                d = -d  # d = -d,
                b = -b  # b = -b,
                c = -c  # c = -c),
                if d < -e:  # d < -e)
                    return  # return;

        if d < self.la:  # d >= this.la || (d = this.la - d,
            d = self.la - d  # d = this.la - d
            f = self.a  # f = e = this.a,
            e = self.a  # f = e = this.a,
            e.x = f.x + b * d  # e.x = f.x + b * d,
            e.y = f.y + c * d  # e.y = f.y + c * d,
            d = self.M  # d = this.M,
            d = b * d.x + c * d.y  # d = b * d.x + c * d.y,
            if 0 > d:  # 0 > d && (d *= this.l * a.l + 1,
                d *= self.l * a.l + 1
                e = self.M  # e = a = this.M,
                a = self.M  # e = a = this.M,
                a.x = e.x - b * d  # a.x = e.x - b * d,
                a.y = e.y - c * d  # a.y = e.y - c * d))
        """
        d >= this.la || (d = this.la - d,
            f = e = this.a,
            e.x = f.x + b * d,
            e.y = f.y + c * d,
            d = this.M,
            d = b * d.x + c * d.y,
        0 > d && (d *= this.l * a.l + 1,
            e = a = this.M,
            a.x = e.x - b * d,
            a.y = e.y - c * d)) 
        """

class Team:
    """
    class p
    """

    def __init__(self) -> None:
        self.B = 2
        self.El = None # ka, {Tc: 16777215, cb: Array(1)}
        self.P = 1
        self.Tf = None  # type: Team # p, {Tf: p, P: 2, X: 5671397, dh: 1, mo: 16, …}
        self.X = 15035990
        self.dh = -1
        self.mo = 8
        self.o = "Red"
        self.sn = "t-red"


class User:
    """
    class ea
    """

    def __init__(self) -> None:
        self.dollar = None  # type: Team
        self.Bb = 0
        self.F = None  # type: Object
        self.T = 0
        self.bc = False  # type: bool
        self.im = None
        self.jb = None
        self.mb = 0
        self.o = "Host"  # type: str
        self.ra = True  # type: bool # admin?
        self.uc = -1
        self.wb = 0
        self.wd = "it"  # type: str
        self.wg = 0
        self.xd = False  # type: bool

class mb:
    """
    TODO: da capire che cosa e' mb
    """
    def __init__(self, palo_alto: Vector, palo_basso: Vector, squadra: Team) -> None:
        self.R = palo_alto  # type: Vector
        self.V = palo_basso  # type: Vector
        self.Yd = squadra  # type: Team # squadra che possede la porta
        """
        R: M {x: 370, y: -64}
        V: M {x: 370, y: 64}
        Yd: p {Tf: p, P: 2, X: 5671397, dh: 1, mo: 16, …}
        """


class z:
    """
    TODO: da capire che cosa e' z
    """
    def __init__(self, B: int, a: Vector, gd: int, h: int, l: float) -> None:
        self.B = B
        self.a = a  # type: Vector # {x: 378, y: -64}
        self.gd = gd
        self.h = h
        self.l = l


class D:
    """
    TODO: Da capire che cosa è D
    """
    def __init__(self, B: int, Hd: Union[None, Vector], R: z, V: z, Wa: bool, X: int, h: int, jg: Union[None, Vector], kg: Union[None, Vector], l: float, rj: int, sa: Union[None, Vector], tb: float, xc: int) -> None:
        self.B = B
        self.Hd = Hd  # type: Vector # M {x: 378, y: -42}
        self.R = R  # type: z # {gd: 0, B: 32, h: 1, l: 0.1, a: M}
        self.V = V # type: z
        self.Wa = Wa  # type: bool
        self.X = X
        self.h = h
        self.jg = jg  # type: Vector # M {x: 22, y: 0}
        self.kg = kg  # type: Vector # M {x: -0, y: -22}
        self.l = l  # bCoef?
        self.rj = rj
        self.sa = sa
        self.tb = tb
        self.xc = xc


class I:
    def __init__(self, B: int, Oa: int, h: int, l: int, sa: Vector) -> None:
        self.B = B
        self.Oa = Oa
        self.h = h
        self.l = l
        self.sa = sa


class zb:
    """
    TODO: da capire che cosa e' zb
    """
    def __init__(self) -> None:
        self.Ba = 0.96
        self.Be = 0.07
        self.Ce = 0.96
        self.Kd = 5
        self.l = 0.5
        self.me = 0.1
        self.pa = 0.5


class Field:
    """
    class h
    """

    def __init__(self) -> None:
        self.C = []  # type: List[z]  # (20)[z, z, z, z, z, z, z, z, z, z, z, z, z, z, z, z, z, z, z, z]
        self.Dd = 170
        self.Ed = 370
        self.Fe = 0
        self.Ic = 0
        self.K = []  # type: List[BasicObject] # (4)[ua, ua, ua, ua], pali delle porte
        # Esempio di ua: {B: -1, Ba: 0.99, M: M {x: 0, y: 0}, X: 13421823, a: M {x: 370, y: -64}, h: -1, l: 0.5, la: 8, pa: 0}

        self.O = []  # type: List[D] # lista di D, (14)[D, D, D, D, D, D, D, D, D, D, D, D, D, D]
        # Esempio di D: {B: 32, Hd: M {x: 378, y: -42}, R: z {gd: 0, B: 32, h: 1, l: 0.1, a: M}, V: z {gd: 0, B: 32, h: 1, l: 0.1, a: M}, Wa: true, X: 0, h: 1, jg: M {x: 22, y: 0}, kg: M {x: -0, y: -22}, l: 0.1, rj: 22, sa: null, tb: 1.0000000000000002, xc: 0}


        self.Rd = None  # type: zb # TODO: da capire che cosa è zb.
        # Esempio di zb: {Ba: 0.96, Be: 0.07, Ce: 0.96, Kd: 5, l: 0.5, me: 0.1, pa: 0.5}

        self.Sb = 420
        self.Yc = 75
        self.Zc = 1
        self.ac = 277.5
        self.bh = 0
        self.fc = 7441498
        self.ha = []  # (6)[I, I, I, I, I, I] TODO: da capire che cosa é una classe I
        # Esempio di I: {B: 32, Oa: -200, h: -1, l: 0, sa: M {x: 0, y: 1}

        self.hc = 200
        self.kc = []  # (2)[mb, mb] TODO da capire che cosa è mb
        # Esempio di mb: {R: <M> {x: 370, y: -64}, V: <M> {x: 370, y: 64}, Yd: <p>}

        self.o = "Classic"
        oe = None  # type: BasicObject # ua
        # Esempio di ua: {B: 1, Ba: 0.99, M: M {x: 0, y: 0}, X: 16777215, a: M {x: 0, y: 0}, h: -1, l: 0.5, la: 10, pa: 1}

        self.qe = 0
        self.rf = True
        self.spec_team_inst = None

    def Vm(self, a, b):
        c = 0
        d = self.kc
        while c < len(d):  # for (var c = 0, d = this.kc; c < d.length;) {
            e = d[c]  # var e = d[c];
            c += 1  # ++c;
            f = e.R  # var f = e.R
            g = e.V  # , g = e.V
            n = b.x - a.x  # , n = b.x - a.x
            k = b.y - a.y  # , k = b.y - a.y;
            if (0 < -(f.y - a.y) * n + (f.x - a.x) * k) == (0 < -(g.y - a.y) * n + (g.x - a.x) * k):  #
                # 0 < -(f.y - a.y) * n + (f.x - a.x) * k == 0 < -(g.y - a.y) * n + (g.x - a.x) * k ? f = !1 : (n = g.x - f.x, TODO: da tradurre bene
                f = False
            else:
                n = g.x - f.x
                g = g.y - f.y
                if (0 < -(a.y - f.y) * n + (a.x - f.x) * g) == (0 < -(b.y - f.y) * n + (b.x - f.x) * g):  #
                    # f = 0 < -(a.y - f.y) * n + (a.x - f.x) * g == 0 < -(b.y - f.y) * n + (b.x - f.x) * g ? !1 : !0);
                    f = False
                else:
                    f = True
            if f:  # if (f)
                return e.Yd  # return e.Yd; // Probabilmente restituisce questo oggetto (classe Squadra) per chi ha segnato un gol

            # return p.Fa  # return p.Fa; // Forse è la squadra degli spectators
        return self.spec_team_inst  # return p.Fa; // Forse è la squadra degli spectators


class Room:
    """
    class fa
    """
    def __init__(self) -> None:
        self.dollar_b = "Ciao room"
        self.D = []  # type: List[User] # (3)[ea, ea, ea] (Users)
        self.Gc = False
        self.H = None  # type: GamePlay # ta, {Zb: -1, Yb: null, Ga: 0, Ac: 17329.216666498643, Cb: 4, …}
        self.U = None  # type: Field # h, Field, {C: Array(20), O: Array(14), ha: Array(6), kc: Array(2), K: Array(4), …}
        # TODO: è diventato .S
        self.Yb = None
        self.Zb = -1
        self.fb = 14
        self.hb = [] # (3)[null, ka, ka] TODO: da capire che cos'è
        self.xa = 0


class FieldPhysics:
    """
    class Ea
    """

    def __init__(self) -> None:
        self.C = []  # (20)[z, z, z, z, z, z, z, z, z, z, z, z, z, z, z, z, z, z, z, z]
        self.K = []  # (7)[X, X, X, X, X, X, X]
        self.O = []  # (14)[D, D, D, D, D, D, D, D, D, D, D, D, D, D]
        self.Yb = None
        selfZb = -1
        self.ha = []  # (6)[I, I, ...]

    def v(self, a):
        """
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

        :param a:
        :return:
        """

        # b = 0
        c = self.K
        # while b < len(c):  # for (var b = 0, c = this.K; b < c.length;) {
        for d in c:  # for (var b = 0, c = this.K; b < c.length;) {
            # d = c[b]  # var d = c[b];
            # b += 1  # ++b;
            e = d.a  # var e = d.a // a: posizione
            f = d.a  # f = d.a // uguale
            g = d.M  # g = d.M; // M: velocità
            e.x = f.x + g.x * a  # e.x = f.x + g.x * a;
            e.y = f.y + g.y * a  # e.y = f.y + g.y * a;
            f = d.M
            e = d.M  # f = e = d.M;
            # // Attenzeione, da qua la "e" e la "f" sono le velocità, non le posizioni
            d = d.Ba  # d = d.Ba; // 0.99 per la palla ed i pali, 0.96 per i giocatori
            e.x = f.x * d  # e.x = f.x * d;
            e.y = f.y * d  # e.y = f.y * d

        # // Attenzione la "a" iniziale non serve più
        a = 0  # a = 0;
        b = len(self.K)
        while a < b:  # for (b = this.K.length; a < b;) {
            d = a
            a += 1  # d = a++;
            c = self.K[d]  # c = this.K[d];
            d += 1  # d += 1;
            e = len(self.K)
            while d < e:  # for (e = this.K.length; d < e;)
                f = self.K[d]
                d += 1  # f = this.K[d++],
                # B: 0 per la palla, -1 per i pali, 2 per il giocatore1, 4 per il giocatore2
                # h: -1 per la palla e i pali, 39 per i giocatori
                if 0 != (f.h & c.B) and 0 != (f.B & c.h):
                    c.dollar_m(f)  # 0 != (f.h & c.B) && 0 != (f.B & c.h) && c.$m(f);
            # // pa: 1 per la palla, 0 per i pali, 0.5 per i giocatori
            if 0 != c.pa:  # if (0 != c.pa) {
                d = 0  # d = 0;
                # this.ha: sei elementi della classe I
                e = self.ha
                while d < len(e):  # for (e = this.ha; d < e.length;)
                    f = e[d]    # if (f = e[d],
                    d += 1        # ++d,
                    if (0 != (f.h & c.B)) and (0 != (f.B & c.h)): # 0 != (f.h & c.B) && 0 != (f.B & c.h)) {
                        g = f.sa  # var g = f.sa
                        h = c.a  # , h = c.a
                        g = f.Oa - (g.x * h.x + g.y * h.y) + c.la  # , g = f.Oa - (g.x * h.x + g.y * h.y) + c.la;
                        if g > 0: # if (0 < g) {
                            k = c.a  # var k = h = c.a
                            h = c.a  # var k = h = c.a
                            l = f.sa  # , l = f.sa;
                            h.x = k.x + l.x * g  # h.x = k.x + l.x * g;
                            h.y = k.y + l.y * g  # h.y = k.y + l.y * g;
                            g = c.M  # g = c.M;
                            h = f.sa  # h = f.sa;
                            g = g.x * h.x + g.y * h.y  # g = g.x * h.x + g.y * h.y;
                            if g < 0:  # 0 > g && (g *= c.l * f.l + 1,
                                g *= c.l * f.l + 1
                                k = c.M  # k = h = c.M,
                                h = c.M  # k = h = c.M,
                                f = f.sa  # f = f.sa,
                                h.x = k.x - f.x * g  # h.x = k.x - f.x * g,
                                h.y = k.y - f.y * g  # h.y = k.y - f.y * g

                d = 0  # d = 0;
                # // this.O: 14 elementi della classe D. confini?
                e = self.O
                while d < len(e): # for (e = this.O; d < e.length;)
                    f = e[d]  # f = e[d],
                    d += 1  # ++d,
                    if (0 != (f.h & c.B)) and (0 != (f.B & c.h)):  # 0 != (f.h & c.B) && 0 != (f.B & c.h) && c.an(f);
                        c.an(f)
                d = 0  # d = 0;
                e = self.C
                while d < len(e):  # for (e = this.C; d < e.length;)
                    f = e[d]  # if (f = e[d],
                    d += 1  # ++d,
                    if (0 != (f.h & c.B)) and (0 != (f.B & c.h)):  # 0 != (f.h & c.B) && 0 != (f.B & c.h)
                        h = c.a  # h = c.a,
                        k = f.a  # k = f.a,
                        g = h.x - k.x  # g = h.x - k.x,
                        h = h.y - k.y  # h = h.y - k.y,
                        k = g * g + h * h  # k = g * g + h * h,
                        if 0 < k and k <= c.la * c.la:  # 0 < k && k <= c.la * c.la
                            k = math.sqrt(k) # var k = Math.sqrt(k)
                            g = g / k  # , g = g / k
                            h = h / k  # , h = h / k
                            k = c.la - k  # , k = c.la - k
                            m = c.a  # , m = l = c.a;
                            l = c.a  # , m = l = c.a;
                            l.x = m.x + g * k  # l.x = m.x + g * k;
                            l.y = m.y + h * k  # l.y = m.y + h * k;
                            k = c.M  # k = c.M;
                            k = g * k.x + h * k.y  # k = g * k.x + h * k.y;
                            if 0 > k:  # 0 > k && (k *= c.l * f.l + 1,
                                k *= c.l * f.l + 1
                                l = c.M  # l = f = c.M,
                                f = c.M  # l = f = c.M,
                                f.x = l.x - g * k  # f.x = l.x - g * k,
                                f.y = l.y - h * k  # f.y = l.y - h * k

class GamePlay:
    """
    class ta
    """

    def __init__(self) -> None:
        self.Ac = 17329.216666498643
        self.Cb = 4
        self.Ga = 0
        self.Jd = None  # type: Team # p, {Tf: p, P: 1, X: 15035990, dh: -1, mo: 8, …}
        self.Kb = 0
        self.Pa = None  # type: Room # fa, {Zb: -1, Yb: null, U: h, xa: 0, fb: 14, …}
        self.U = None # type: Field # h, Field, {C: Array(20), O: Array(14), ha: Array(6), kc: Array(2), K: Array(4), …}
        self.Yb = None
        self.Zb = -1
        self.ec = 0
        self.fb = 14
        self.kd = None # type: Vector # M, {x: -98.40659690671951, y: 140.74972634754903}, posizione della palla
        self.pc = 0
        self.wa = None # type: FieldPhysics #  Ea, TODO: da capire che cosa è Ea
        # Esempio di Ea: {C: (20) [z, z, z,...], K: (7) [X, X, X, ...], O: (14) [D, D, ...], Yb: null, Zb: -1, ha: (6) [I, I, ...]}

        self.xa = 0
        self.zb = 1
        self.red_team_inst = None
        self.blu_team_inst = None
        self.spec_team_inst = None
        self.red_scored = False
        self.blue_scored = False

    def step(self, a=1):
        c = self.Pa.D
        b = self.wa.K[self.ec]
        d = 0
        while d < len(c):  # for (var c = this.Pa.D, b = this.wa.K[this.ec], d = 0; d < c.length;) {
            e = c[d]  # var e = c[d];
            d += 1  # ++d;
            if e.F is not None:  # if (e.F != null) {
                f = b.a  # var f = b.a
                g = e.F.a  # , g = e.F.a
                n = f.x - g.x  # , n = f.x - g.x
                g = f.y - g.y  # , g = f.y - g.y
                k = math.sqrt(n * n + g * g) - b.la - e.F.la  # , k = Math.sqrt(n * n + g * g) - b.la - e.F.la;

                if (e.mb & 16) == 0:  # if ((e.mb & 16) == 0)
                    e.bc = 0  # e.bc = 0

                f = self.U.Rd  # f = this.U.Rd;
                if e.bc and k < 4:  # if (e.bc && 4 > k) {
                    if f.Kd != 0: # if (0 != f.Kd) {
                        # Entra qua quando la palla viene calciata
                        k = math.sqrt(n * n + g * g)  # var k = Math.sqrt(n * n + g * g)
                        h = f.Kd  # , h = f.Kd
                        l = b.M  # , l = b.M
                        m = b.M  # , m = b.M
                        q = b.pa  # , q = b.pa;
                        l.x = m.x + n / k * h * q  # l.x = m.x + n / k * h * q;
                        l.y = m.y + g / k * h * q  # l.y = m.y + g / k * h * q;
                        """
                        if(this.Pa.Oh != null)
                        {
                            this.Pa.Oh(e); // il suono di un calcio?
                        }
                        """
                    e.bc = 0  # e.bc = 0;

                k = e.mb  # k = e.mb;
                g = 0
                n = 0  # g = n = 0;
                # Gestione dei movimenti di input
                if 0 != (k & 1): g -= 1  # 0 != (k & 1) && --g;
                if 0 != (k & 2): g += 1  # 0 != (k & 2) && ++g;
                if 0 != (k & 4): n -= 1  # 0 != (k & 4) && --n;
                if 0 != (k & 8): n += 1  # 0 != (k & 8) && ++n;
                if n != 0 and g != 0:  # if(n != 0 && g != 0)
                    k = math.sqrt(n * n + g * g)  # k = Math.sqrt(n * n + g * g);
                    n /= k  # n /= k;
                    g /= k  # g /= k;

                k = e.F.M  # k = e.F.M;
                h = f.Be if e.bc else f.me  # h = e.bc ? f.Be : f.me;
                k.x += n * h  # k.x += n * h;
                k.y += g * h  # k.y += g * h;
                e.F.Ba = f.Ce if e.bc else f.Ba  # e.F.Ba = e.bc ? f.Ce : f.

        self.wa.v(a)  # this.wa.v(a); // un pezzo della fisica importante, riga ~8395, cerca "v: function (a) {"

        if (self.zb == 0):  # if (0 == this.zb) {
            # this.zb == 0, partita non è cominciata (tocca a uno a toccare la palla)
            a = 0
            while a < len(c):  # for (a = 0; a < c.length;) {
                d = c[a]  # d = c[a];
                a += 1  # ++a;
                # d.F è null quando un giocatore non presente sul campo. Cioè è un ogetto della classe X, geometria del giocatore
                if d.F is not None:  # if(d.F != null) {
                    d.F.h = 39 | self.Jd.mo

            c = b.M  # c = b.M;
            # Probabilmente verifica se la palla è stata toccata nell'inizio della partita
            if c.x * c.x + c.y * c.y > 0:  # if(c.x * c.x + c.y * c.y > 0)
                self.zb = 1  # this.zb = 1;
                c = self.kd  # c = this.kd;
                b = b.a  # b = b.a;
                c.x = b.x  # c.x = b.x;
                c.y = b.y  # c.y = b.y;
                c.y = b.y  # c.y = b.y;

        elif self.zb == 1:  # } else if (1 == this.zb) {
            # // this.zb == 1, partita è cominciata, la palla è in movimento
            self.Ac += .016666666666666666  # this.Ac += .016666666666666666; // è tutto finto qua. La funzione viene chiamata non ogni 16ms ma ininterrotamente. Poi ogni tot la variabile this.Ac viene sincronizzato con il tempo del Host (probabilmente)
            a = 0
            while a < len(c):  # for (a = 0; a < c.length;)
                d = c[a]  # d = c[a];
                a += 1  # ++a;
                if d.F is not None:  # if(d.F != null)
                    d.F.h = 39  # d.F.h = 39;

            # b.a - oggetto (classe X)
            # this.kd - posizione della palla
            c = self.U.Vm(b.a, self.kd)  # c = this.U.Vm(b.a, this.kd); // cosa fa? forse verifica se è stato segnato un gol
            # if c != p.Fa:  # if(c != p.Fa) TODO: p.Fa è la classe p dei "Spectators"
            self.red_scored = False
            self.blue_scored = False
            if c != self.spec_team_inst:  # if(c != p.Fa) TODO: p.Fa è la classe p dei "Spectators"
                self.zb = 2  # this.zb = 2,
                self.pc = 150  # this.pc = 150,
                self.Jd = c  # this.Jd = c,
                # if c == p.ba:  # la squadra che ha subito il gol
                if c == self.red_team_inst:  # TODO: p.Fa è la classe p dei "Red"
                    self.Cb += 1
                    self.blue_scored = True
                else:
                    self.Kb += 1
                    self.red_scored = True
                # if self.Pa.oi is not None:  # null != this.Pa.oi && this.Pa.oi(c.Tf),
                #     self.Pa.oi(c.Tf)  # // probabilmente gueste sono gli hook di animazione e suono del gol
                # if self.Pa.bl is not None:  # null != this.Pa.bl && this.Pa.bl(c.P);
                #     self.Pa.bl(c.P)  # // uguale
            else:
                # this.Kb -> il punteggio della squadra rossa
                # this.Cb -> il punteggio della squadra blu
                if 0 < self.xa and self.Ac >= 60 * self.xa and self.Kb != self.Cb: # if(0 < this.xa && this.Ac >= 60 * this.xa && this.Kb != this.Cb) // Può essere una vittoria per il timeout
                    if self.Pa.ri is not None: # if(null != this.Pa.ri)
                        self.Pa.ri()  # this.Pa.ri(); // Un altro hook, da scoprire quale

                    self.Cl()  # this.Cl(); // ?  Cl() è definito sotto

            c = self.kd  # c = this.kd;
            b = b.a  # b = b.a;
            c.x = b.x  # c.x = b.x;
            c.y = b.y  # c.y = b.y
        elif self.zb == 2:  # else if (2 == this.zb) {
            # this.zb == 2, partita è finita?
            self.pc -= 1  # this.pc--,
            # 0 >= this.pc && (0 < this.fb && (this.Kb >= this.fb || this.Cb >= this.fb) || 0 < this.xa && this.Ac >= 60 * this.xa && this.Kb != this.Cb ? this.Cl() : (this.Yj(),
            #             null != this.Pa.tp && this.Pa.tp())); TODO, da tradurre questo pezzo se è necessario
        elif 3 == self.zb: # else if (3 == this.zb) // partita finita (punteggio massimo)
            # TODO da tradurre se è necessario
            """
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
            """
        hello = 'cioa'
    def Cl(self):
        """
        Cl: function () {
                this.pc = 300;
                this.zb = 3;
                null != this.Pa.pi && this.Pa.pi(this.Kb > this.Cb ? p.ba : p.ta)
            },
        :return:
        """
        self.pc = 300
        self.zb = 3
        if self.Pa.pi is not None:
            self.Pa.pi(p.ba if self.Kb > self.Cb else p.ta)  # TODO p.ba, p.ta saranno le classi delle squadre Rossa e Blu, poco importante

    def reset(self):
        create_start_conditions(
            posizione_palla=Vector(0, 0),
            velocita_palla=Vector(0, 0),
            posizione_blu=Vector(277.5, 0),
            velocita_blu=Vector(0, 0),
            input_blu=0,
            posizione_rosso=Vector(-277.5, 0),
            velocita_rosso=Vector(0, 0),
            input_rosso=0,
            tempo_iniziale=0,
            punteggio_rosso=0,
            punteggio_blu=0,
            commincia_rosso=True,
            game_play_instance=self
        )

    def export_state(self):
        return {
            'posizione_palla': self.wa.K[0].a,
            'velocita_palla': self.wa.K[0].M,
            'posizione_blu': self.wa.K[6].M,
            'velocita_blu': self.wa.K[6].a,
            'input_blu': self.Pa.D[2].mb,
            'posizione_rosso': self.wa.K[5].M,
            'velocita_rosso': self.wa.K[5].a,
            'input_rosso': self.Pa.D[1].mb,
            'tempo_iniziale': self.Ac,
            'punteggio_rosso': self.Kb,
            'punteggio_blu': self.Cb,
            'commincia_rosso': self.Jd.o == 'Red'
        }

    def import_state(self, state):
        self.wa.K[0].a = state['posizione_palla']
        self.wa.K[0].M = state['velocita_palla']
        self.wa.K[6].M = state['posizione_blu']
        self.wa.K[6].a = state['velocita_blu']
        self.Pa.D[2].mb = state['input_blu']
        self.wa.K[5].M = state['posizione_rosso']
        self.wa.K[5].a = state['velocita_rosso']
        self.Pa.D[1].mb = state['input_rosso']
        self.Ac = state['tempo_iniziale']
        self.Kb = state['punteggio_rosso']
        self.Cb = state['punteggio_blu']
        if state['commincia_rosso']:
            self.Jd.o = self.red_team_inst
        else:
            self.Jd.o = self.blu_team_inst


def create_start_conditions(
        posizione_palla: Union[None, Vector] = None,
        velocita_palla: Union[None, Vector] = None,
        posizione_blu: Union[None, Vector] = None,
        velocita_blu: Union[None, Vector] = None,
        input_blu: int = 0,
        posizione_rosso: Union[None, Vector] = None,
        velocita_rosso: Union[None, Vector] = None,
        input_rosso: int = 0,
        tempo_iniziale: float = 0,
        punteggio_rosso: int = 0,
        punteggio_blu: int = 0,
        commincia_rosso: bool = True,
        game_play_instance: Union[None, GamePlay] = None
):
    if posizione_palla is None:
        posizione_palla = Vector(0, 0)
    if velocita_palla is None:
        velocita_palla = Vector(0, 0)
    if posizione_blu is None:
        posizione_blu = Vector(277.5, 0)
    if velocita_blu is None:
        velocita_blu = Vector(0, 0)
    if posizione_rosso is None:
        posizione_rosso = Vector(-277.5, 0)
    if velocita_rosso is None:
        velocita_rosso = Vector(0, 0)

    palla = Object()
    palla.B = 1
    palla.Ba = 0.99
    palla.M = velocita_palla
    palla.X = 16777215
    palla.Yb = None
    palla.Zb = -1
    palla.a = posizione_palla
    palla.gj = 0
    palla.h = -1
    palla.l = 0.5
    palla.la = 10
    palla.pa = 1
    palla.zk = 0

    palo1 = Object()
    palo1.B = -1
    palo1.Ba = 0.99
    palo1.M = Vector(0, 0)
    palo1.X = 13421823
    palo1.Yb = None
    palo1.Zb = -1
    palo1.a = Vector(370, -64)
    palo1.gj = 0
    palo1.h = -1
    palo1.l = 0.5
    palo1.la = 8
    palo1.pa = 0
    palo1.zk = 0

    palo2 = Object()
    palo2.B = -1
    palo2.Ba = 0.99
    palo2.M = Vector(0, 0)
    palo2.X = 13421823
    palo2.Yb = None
    palo2.Zb = -1
    palo2.a = Vector(370, 64)
    palo2.gj = 0
    palo2.h = -1
    palo2.l = 0.5
    palo2.la = 8
    palo2.pa = 0
    palo2.zk = 0

    palo3 = Object()
    palo3.B = -1
    palo3.Ba = 0.99
    palo3.M = Vector(0, 0)
    palo3.X = 13421823
    palo3.Yb = None
    palo3.Zb = -1
    palo3.a = Vector(-370, -64)
    palo3.gj = 0
    palo3.h = -1
    palo3.l = 0.5
    palo3.la = 8
    palo3.pa = 0
    palo3.zk = 0

    palo4 = Object()
    palo4.B = -1
    palo4.Ba = 0.99
    palo4.M = Vector(0, 0)
    palo4.X = 13421823
    palo4.Yb = None
    palo4.Zb = -1
    palo4.a = Vector(-370, 64)
    palo4.gj = 0
    palo4.h = -1
    palo4.l = 0.5
    palo4.la = 8
    palo4.pa = 0
    palo4.zk = 0

    spectators_team = Team()
    spectators_team.B = 0
    spectators_team.El = {'Tc': 16777215, 'cb': [16777215]}  # ka
    spectators_team.P = 0
    spectators_team.Tf = spectators_team
    spectators_team.X = 16777215
    spectators_team.dh = 0
    spectators_team.mo = -1
    spectators_team.o = 'Spectators'
    spectators_team.sn = 't-spec'

    host_user = User()
    host_user.dollar = spectators_team
    host_user.Bb = 0
    host_user.F = None
    host_user.T = 0
    host_user.bc = False
    host_user.im = None
    host_user.jb = None
    host_user.mb = 0
    host_user.o = 'Host'
    host_user.ra = True
    host_user.uc = -1
    host_user.wb = 0
    host_user.wd = 'it'
    host_user.wg = 0
    host_user.xd = False

    red_team = Team()
    red_team.B = 2
    red_team.El = {'Tc': 16777215, 'cb': [15035990]}  # ka
    red_team.P = 1
    red_team.Tf = None  # blue_team
    red_team.X = 15035990
    red_team.dh = -1
    red_team.mo = 8
    red_team.o = 'Red'
    red_team.sn = 't-red'

    red_player_object = Object()
    red_player_object.B = 2
    red_player_object.Ba = 0.96
    red_player_object.M = velocita_rosso
    red_player_object.X = 0
    red_player_object.Yb = None
    red_player_object.Zb = -1
    red_player_object.a = posizione_rosso
    red_player_object.gj = 0
    red_player_object.h = 39
    red_player_object.l = 0.5
    red_player_object.la = 15
    red_player_object.pa = 0.5
    red_player_object.zk = 0

    red_player = User()
    red_player.dollar = red_team
    red_player.Bb = 1
    red_player.F = red_player_object
    red_player.T = 2
    red_player.bc = 0
    red_player.im = None
    red_player.jb = None
    red_player.mb = int(input_rosso)
    red_player.o = 'ciao2'
    red_player.ra = True
    red_player.uc = -1
    red_player.wb = 6
    red_player.wd = 'it'
    red_player.wg = 0
    red_player.xd = False

    blue_team = Team()
    blue_team.B = 4
    blue_team.El = {'Tc': 16777215, 'cb': [5671397]}  # ka
    blue_team.P = 2
    blue_team.Tf = red_team
    blue_team.X = 5671397
    blue_team.dh = 1
    blue_team.mo = 16
    blue_team.o = 'Blue'
    blue_team.sn = 't-blue'

    blue_player_object = Object()
    blue_player_object.B = 4
    blue_player_object.Ba = 0.96
    blue_player_object.M = velocita_blu
    blue_player_object.X = 0
    blue_player_object.Yb = None
    blue_player_object.Zb = -1
    blue_player_object.a = posizione_blu
    blue_player_object.gj = 0
    blue_player_object.h = 39
    blue_player_object.l = 0.5
    blue_player_object.la = 15
    blue_player_object.pa = 0.5
    blue_player_object.zk = 0

    blue_player = User()
    blue_player.dollar = blue_team
    blue_player.Bb = 1
    blue_player.F = blue_player_object
    blue_player.T = 1
    blue_player.bc = 0
    blue_player.im = None
    blue_player.jb = None
    blue_player.mb = int(input_blu)
    blue_player.o = 'Ginger Burgess'
    blue_player.ra = False
    blue_player.uc = -1
    blue_player.wb = 4
    blue_player.wd = 'it'
    blue_player.wg = 0
    blue_player.xd = False

    field = Field()
    field.ac = 277.5
    field.bh = 0
    field.fc = 7441498
    field.ha = [
        # I(32, -200, -1, 0, Vector(x=0, y=1)),
        I(32, -200, 63, 0, Vector(x=0, y=1)),
        # I(32, -200, -1, 0, Vector(x=0, y=-1)),
        I(32, -200, 63, 0, Vector(x=0, y=-1)),
        # I(32, -420, -1, 0, Vector(x=1, y=0)),
        I(32, -420, 63, 0, Vector(x=1, y=0)),
        # I(32, -420, -1, 0, Vector(x=-1, y=0)),
        I(32, -420, 63, 0, Vector(x=-1, y=0)),
        I(32, -170, 1, 1, Vector(x=0, y=1)),
        I(32, -170, 1, 1, Vector(x=0, y=-1)),
    ]
    field.hc = 200
    field.kc = [
        mb(palo1.a, palo2.a, squadra=blue_team),
        mb(palo3.a, palo4.a, squadra=red_team),
    ]
    field.o = 'Classic'
    field.oe = None  # TODO: da mettere ua
    field.qe = 0
    field.rf = True
    field.C = [
        z(32, Vector(x=378, y=-64), 0, 1, 0.1),
        z(32, Vector(x=378, y=64), 0, 1, 0.1),
        z(32, Vector(x=400, y=-42), 0, 1, 0.1),
        z(32, Vector(x=400, y=42), 0, 1, 0.1),
        z(32, Vector(x=400, y=42), 0, 1, 0.1),
        z(32, Vector(x=-378, y=-64), 0, 1, 0.1),
        z(32, Vector(x=-378, y=64), 0, 1, 0.1),
        z(32, Vector(x=-400, y=-42), 0, 1, 0.1),
        z(24, Vector(x=0, y=-200), 0, 6, 0.1),
        z(24, Vector(x=0, y=-75), 0, 6, 0.1),
        z(24, Vector(x=0, y=75), 0, 6, 0.1),
        z(24, Vector(x=0, y=200), 0, 6, 0.1),  # 11
        z(32, Vector(x=-370, y=-170), 0, 0, 1),
        z(32, Vector(x=370, y=-170), 0, 0, 1),
        z(32, Vector(x=370, y=-64), 0, 0, 1),
        z(32, Vector(x=370, y=64), 0, 0, 1),
        z(32, Vector(x=370, y=170), 0, 0, 1),
        z(32, Vector(x=-370, y=170), 0, 0, 1),
        z(32, Vector(x=-370, y=64), 0, 0, 1),
        z(32, Vector(x=-370, y=-64), 0, 0, 1),
    ]
    field.Dd = 170
    field.Ed = 370
    field.Fe = 0
    field.Ic = 0
    field.K = [
        BasicObject(Vector(370, -64)),
        BasicObject(Vector(370, 64)),
        BasicObject(Vector(-370, -64)),
        BasicObject(Vector(-370, 64)),
    ]
    field.O = [
        D(32, Vector(378, -42), z(32, Vector(x=378, y=-64), 0, 1, 0.1), z(32, Vector(x=400, y=-42), 0, 1, 0.1),
          True, 0, 1, Vector(22, 0), Vector(-0, -22), 0.1, 22, None, 1.0000000000000002, 0),
        D(32, None, z(32, Vector(x=400, y=42), 0, 1, 0.1), z(32, Vector(x=400, y=-42), 0, 1, 0.1), True, 0, 1, None,
          None, 0.1, 0, Vector(-1, 0), float('Infinity'), 0),
        D(32, Vector(378, 42), z(32, Vector(x=400, y=42), 0, 1, 0.1), z(32, Vector(x=378, y=64), 0, 1, 0.1), True,
          0, 1, Vector(-0, 22), Vector(22, 0), 0.1, 22, None, 1.0000000000000002, 0),
        D(32, Vector(-378, -42), z(32, Vector(x=-400, y=-42), 0, 1, 0.1), z(32, Vector(x=-378, y=-64), 0, 1, 0.1),
          True, 0, 1, Vector(-0, -22), Vector(-22, 0), 0.1, 22, None, 1.0000000000000002, -0),
        D(32, None, z(32, Vector(x=-400, y=42), 0, 1, 0.1), z(32, Vector(x=-400, y=-42), 0, 1, 0.1), True, 0, 1,
          None, None, 0.1, 0, Vector(-1, 0), float('Infinity'), 0),
        D(32, Vector(-378, 42), z(32, Vector(x=-378, y=64), 0, 1, 0.1), z(32, Vector(x=-400, y=42), 0, 1, 0.1),
          True, 0, 1, Vector(-22, 0), Vector(-0, 22), 0.1, 22, None, 1.0000000000000002, -0),
        D(24, None, z(24, Vector(x=0, y=-200), 0, 6, 0.1), z(24, Vector(x=0, y=-75), 0, 6, 0.1), False, 0, 6, None,
          None, 0.1, 0, Vector(1, 0), float('Infinity'), 0),
        D(24, None, z(24, Vector(x=0, y=75), 0, 6, 0.1), z(24, Vector(x=0, y=200), 0, 6, 0.1), False, 0, 6, None,
          None, 0.1, 0, Vector(1, 0), float('Infinity'), 0),
        D(8, Vector(-4.592425496802574e-15, 0), z(24, Vector(x=0, y=-75), 0, 6, 0.1),
          z(24, Vector(x=0, y=75), 0, 6, 0.1), False, 0, 6, Vector(75, 4.592425496802574e-15),
          Vector(75, -4.592425496802574e-15), 0.1, 75, None, 6.123233995736766e-17, 0),
        D(16, Vector(4.592425496802574e-15, 0), z(24, Vector(x=0, y=75), 0, 6, 0.1),
          z(24, Vector(x=0, y=-75), 0, 6, 0.1), False, 0, 6, Vector(-75, 4.592425496802574e-15),
          Vector(-75, -4.592425496802574e-15), 0.1, 75, None, 6.123233995736766e-17, 0),
        D(32, None, z(32, Vector(x=370, y=-170), 0, 0, 1), z(32, Vector(x=370, y=-64), 0, 0, 1), False, 0, 1, None,
          None, 1, 0, Vector(1, 0), float('Infinity'), 0),
        D(32, None, z(32, Vector(x=370, y=64), 0, 0, 1), z(32, Vector(x=370, y=170), 0, 0, 1), False, 0, 1, None,
          None, 1, 0, Vector(1, 0), float('Infinity'), 0),
        D(32, None, z(32, Vector(x=-370, y=170), 0, 0, 1), z(32, Vector(x=-370, y=64), 0, 0, 1), False, 0, 1, None,
          None, 1, 0, Vector(-1, 0), float('Infinity'), 0),
        D(32, None, z(32, Vector(x=-370, y=-64), 0, 0, 1), z(32, Vector(x=-370, y=-170), 0, 0, 1), False, 0, 1,
          None, None, 1, 0, Vector(-1, 0), float('Infinity'), 0),
    ]
    field.Rd = zb()

    field_physics = FieldPhysics()
    field_physics.C = [
        z(32, Vector(x=378, y=-64), 0, 1, 0.1),
        z(32, Vector(x=378, y=64), 0, 1, 0.1),
        z(32, Vector(x=400, y=-42), 0, 1, 0.1),
        z(32, Vector(x=400, y=42), 0, 1, 0.1),
        z(32, Vector(x=400, y=42), 0, 1, 0.1),
        z(32, Vector(x=-378, y=-64), 0, 1, 0.1),
        z(32, Vector(x=-378, y=64), 0, 1, 0.1),
        z(32, Vector(x=-400, y=-42), 0, 1, 0.1),
        z(24, Vector(x=0, y=-200), 0, 6, 0.1),
        z(24, Vector(x=0, y=-75), 0, 6, 0.1),
        z(24, Vector(x=0, y=75), 0, 6, 0.1),
        z(24, Vector(x=0, y=200), 0, 6, 0.1),  # 11
        z(32, Vector(x=-370, y=-170), 0, 0, 1),
        z(32, Vector(x=370, y=-170), 0, 0, 1),
        z(32, Vector(x=370, y=-64), 0, 0, 1),
        z(32, Vector(x=370, y=64), 0, 0, 1),
        z(32, Vector(x=370, y=170), 0, 0, 1),
        z(32, Vector(x=-370, y=170), 0, 0, 1),
        z(32, Vector(x=-370, y=64), 0, 0, 1),
        z(32, Vector(x=-370, y=-64), 0, 0, 1),
    ]
    field_physics.K = [
        palla,
        palo1,
        palo2,
        palo3,
        palo4,
        red_player_object,
        blue_player_object,
    ]
    field_physics.O = field.O
    field_physics.Yb = None
    field_physics.Zb = -1
    field_physics.ha = field.ha
    field.spec_team_inst = spectators_team

    if game_play_instance is None:
        game_play = GamePlay()
    else:
        game_play = game_play_instance
    game_play.Ac = tempo_iniziale
    game_play.Cb = punteggio_blu
    game_play.Ga = 0
    game_play.Jd = red_team if commincia_rosso else blue_team
    game_play.Kb = punteggio_rosso
    game_play.U = field
    game_play.Yb = None
    game_play.Zb = -1
    game_play.ec = 0
    game_play.fb = 14
    game_play.kd = copy.copy(posizione_palla)  # Vector(x=115.05294134865011, y=76.26196858894968)  # Deve essere un'altra instanza di vettore!
    game_play.pc = 0
    game_play.wa = field_physics
    game_play.xa = 0
    game_play.zb = 0
    game_play.red_team_inst = red_team
    game_play.blu_team_inst = blue_team
    game_play.spec_team_inst = spectators_team
    game_play.red_scored = False
    game_play.blue_scored = False

    room = Room()
    room.D = [
        host_user,
        red_player,
        blue_player
    ]
    room.Gc = False
    room.H = game_play
    room.U = field
    room.Yb = None
    room.Zb = -1
    room.fb = 14
    room.hb = [
        None,
        {'Tc': 16777215, 'Xc': 0, 'cb': [15035990]},
        {'Tc': 16777215, 'Xc': 0, 'cb': [5671397]},
    ]  # TODO: da tradurre ka
    room.xa = 0

    game_play.Pa = room

    return game_play
