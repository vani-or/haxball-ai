# HaxballAI

## Input

L'accesso al elemento **L**:

    document.getElementsByTagName("iframe")[0].contentWindow.tutti_i_dati

#### La stanza

Il nome della stanza

    L.$b

#### Il tempo

Il tempo passato (secondi):

    L.H.Ac
    
Durata massima della partità (minuti)

    L.H.xa
    
#### Il punteggio

Il punteggio attuale

    L.H.Kb -> il punteggio della squadra rossa
    L.H.Cb -> il punteggio della squadra blu
    
Il punteggio massimo

    L.H.fb

#### Il campo

Il punto (0, 0) si trova nel centro del campo, dove mettono la palla all'inizio.

Le dimensioni campo:

    L.H.U.Ed - metà della lunghezza (es. 370)
    L.H.U.Dd - metà della larghezza (es. 170)

Le coordinate della porta:

    L.H.U.K[0].a.M -> {x: 370, y: -64}
    L.H.U.K[1].a.M -> {x: 370, y: 64}
    L.H.U.K[2].a.M -> {x: -370, y: -64}
    L.H.U.K[3].a.M -> {x: -370, y: 64}

#### I giocatori

La lista dei giocatori
    
    L.D
    
Il nome del primo giocatore
    
    L.D[0].o
    
La squadra:

    L.D[0].$.o -> "Red" / "Blue"

La posizione

    L.D[0].F.a -> {x: 0, y: 0}
    
La velocità

    L.D[0].F.M -> {x: 0, y: 0}

#### La palla

La posizione della palla

    L.H.kd
    
La velocità della palla

    L.H.wa.K[0].M
    
*(In realtà c'è la lista delle palle, il primo elemento sembra affidabile)*


## Output

Il codice da eseguire per andare giù

    document.getElementsByTagName("iframe")[0].contentDocument.getElementsByTagName('canvas')[0].dispatchEvent(new KeyboardEvent("keydown", {bubbles:true, key : "ArrowDown", keyCode : 40, code: 'ArrowDown'}))
    // aspettare un po'
    document.getElementsByTagName("iframe")[0].contentDocument.getElementsByTagName('canvas')[0].dispatchEvent(new KeyboardEvent("keyup", {bubbles:true, key : "ArrowDown", keyCode : 40, code: 'ArrowDown'}))
    
Valori per l'evento

| bottone    | key        | code       | keyCode |
|------------|------------| -----------|---------|
| giù        | ArrowDown  | ArrowDown  | 40      |
| su         | ArrowUp    | ArrowUp    | 38      |
| a sinistra | ArrowLeft  | ArrowLeft  | 37      |
| a destra   | ArrowRight | ArrowRight | 39      |
| spazio     | " "        | Space      | 39      |

