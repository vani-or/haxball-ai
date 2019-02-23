# HaxballAI

## L'interrogazione con il gioco reale

### Input

L'input del gioco è una struttura dei dati ottenibile in qualsiasi momento nel tempo. Viene aggiornato con ogni messaggio arrivato dal server. L'accesso al elemento **L**:

    document.getElementsByTagName("iframe")[0].contentWindow.tutti_i_dati

#### La stanza

Il nome della stanza

    L.$b

#### Il tempo

Il tempo passato (secondi):

    L.H.Ac
    
Durata massima della partita (minuti)

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


### Output

L'ouput al gioco viene mandato tramite simulazione della tastiera al livello di JS. 

**NB**: come nella tastiera reale ogni bottone può essere schiacciato e liberato nei momenti diversi (keydown/keyup), quindi li dobbiamo considerare come due *azioni* diverse ma dipendenti.

Il codice da eseguire per andare giù:

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

## Modello RL

### TODO e da capire:

* come definire rewards
* durata di una sessione di addestramento? Finisce con un gol? O forse con un timeout (per non fargli capire che la strategia migliore è non fare niente)?
* come trasformare e arricchire l'input *(osservazione dell'ambiente)*. Per esempio, dare le distanze dal giocatore alla palla, dal giocatore al centro della porta, ai bordi, ecc
* come parallelizzare addestramento? Google [evidentemente lo fa](https://www.youtube.com/watch?v=iaF43Ze1oeI)
* è possibile generalizzare l'input per non fare un agente ad hoc ogni volta per numero diverso degli avversari/partner?

## Materiali utili

#### Teoria di RL

* [Il libro di R.Sutton, edizioni 1988-2017](http://incompleteideas.net/book/bookdraft2017nov5.pdf)
* [Gli esercizi di Sutton fatti](https://github.com/ShangtongZhang/reinforcement-learning-an-introduction)
* [Il corso "Deep Reinforcement Learning" di UC Berkeley](http://rail.eecs.berkeley.edu/deeprlcourse/)
* [Deep RL Bootcamp, UC Berkeley 2017](https://sites.google.com/view/deep-rl-bootcamp/lectures)
* [RL, A tutorial](http://www.cs.toronto.edu/~zemel/documents/411/rltutorial.pdf)

#### Livello pratico

* [Awesome RL, github](https://github.com/aikorea/awesome-rl)
* [RL Methods and Tutorials, github](https://github.com/MorvanZhou/Reinforcement-learning-with-tensorflow)
* [OpenAI-Gym, github](https://github.com/openai/gym)
* [Practical RL, yandex course materials](https://github.com/yandexdataschool/Practical_RL/tree/master)
