Introduzione: 

BDoctors è una web app che permette di cercare un medico specialista, visualizzarne le informazioni di contatto e lasciare una recensione permette agli utenti di cercare un medico specialista e valutarne la prestazione.

Tipi di Utenti: 
- Utente paziente (UP): un utente che ha usufruito di una visita e vuole condividere la sua esperienza.
- Utente medico (UM): un utente che desidera registrarsi come medico per poter essere trovato nelle ricerche.

Lista delle pagine: 
- Homepage: Pagina di presentazione del sito, con la descrizione del servizio e una sezione coi medici in evidenza. Inoltre permette un accesso veloce alle pagine dettaglio dei medici in evidenza.
- Pagina di Ricerca Avanzata: permette di visualizzare i risultati di ricerca, ogni risultato permetterà l’accesso alla pagina di dettaglio del medico. Inoltre è possibile raffinare la ricerca senza il refresh della pagina, applicando dei filtri.
- Pagina Dottore: permette di vedere il cv del medico e le sue informazioni di contatto, come indirizzo, email e numero di telefono. È possibile scrivere una recensione e dare un voto al medico. Inoltre è possibile visualizzare le recensioni inserite da altri utenti. Mostra anche la media voti ricevuta dalle recensioni.
- Pagina di registrazione come medico: permette l’inserimento dei dati del medico tra cui: Nome, cognome, descrizione, specializzazione, indirizzo, email, numero di telefono.

Requisiti Tecnici:
(RT1) Client-side Validation
Tutti gli input inseriti dall’utente sono controllati client-side (oltre che server-side) per un
controllo di validità.
(RT2) Il sito è responsive
Il sito è correttamente visibile da desktop e da smartphone.
(RT3) La ricerca dei medici avviene senza il refresh della pagina

Requisiti Funzionali: 
La piattaforma soddisfa i seguenti requisiti funzionali (RF) che vengono dettagliati nelle pagine successive:
- (RF1) Permettere ai medici di registrarsi alla piattaforma
- (RF2) Permette ai visitatori di ricercare un medico specialista
- (RF3) Permettere ai visitatori di vedere i dettagli di un medico
- (RF4) Permettere di vedere le recensioni ricevute da un medico

(RF1) Permettere ai medici di registrarsi alla piattaforma descrizione:
L’applicazione permette ai medici di registrarsi alla piattaforma e creare un profilo. Le informazioni che l’utente può inserire sono:
-  Email *
-  Nome *
- Cognome *
- Telefono *
- Indirizzo *
- Specializzazione *
Sono contrassegnati con * i dati obbligatori.

I form devono rispettare RT1

Risultato: Un nuovo medico viene inserito nel sistema
Errori:
- Esiste già nel sistema un utente con l’email inserita
- La mail inserita non è una mail valida
- Il nome è inferiore a 3 lettere
- Il cognome è inferiore a 3 lettere
- Uno dei campi è vuoto
- L’indirizzo è inferiore a 5 lettere
- Il numero di telefono contiene lettere o simboli diversi da “+”
- “+”, se presente, deve essere all’inizio

(RF2) Permette ai visitatori di ricercare un medico specialista
Descrizione: Un utente è in grado di cercare un medico per specializzazione e filtrare i
risultati per:
- nome
- cognome
- specializzazione
La ricerca di un medico deve rispettare RT3
Risultato: Viene generata una lista di medici che corrispondono alla ricerca
(RF3) Permettere ai visitatori di vedere i dettagli di un medico
Descrizione: Selezionando un medico si viene portati alla sua pagina, che conterrà tutti i
suoi dettagli. È possibile scrivere una recensione ed assegnare un voto da 1 a 5
Risultato: Viene visualizzata la pagina di dettaglio del medico

(RF4) Permettere di vedere le recensioni ricevute da un medico
Visibilità: UR
Descrizione: Nella pagina di dettaglio del medico vengono visualizzate tutte le recensioni
Risultato: L’utente visualizza le recensioni ricevute, comprese di voto, nella pagina di
informazione del medico.
