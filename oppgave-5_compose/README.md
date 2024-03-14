# 5. Docker compose

For å orkestrere flere containere kan vi bruke [`docker compose`](https://docs.docker.com/compose/compose-file/) som en
slags _meta-oppskrift_ på hvordan vi skal bygge image-ene,
hva de forskjellige containerne trenger og hvordan de skal snakke sammen.

Under `resources` mappa har vi laget overkomplisert stein-saks-papir applikasjon.
Når du vinner økes scoren din med ett poeng,
ved uavgjort beholder du scoren din og når du taper resettes scoren.

Stein-saks-papir-applikasjonen består av to containere
— `frontend` og `backend`.
Den første containeren har en web-client som snakker
med en _backend-for-frontend_ (BFF) server som begge serves av [Express.js](https://expressjs.com/).
BFF-en snakker med den andre containeren som kjører en [FastAPI](https://fastapi.tiangolo.com/) Python-microservice.
Denne microservicen beregner spillets utfall og tar vare på high-scoren i en database/fil i et docker-volume.

```
  +--------------------+
  |  +--------------+  |   +-------------+
  |  |  Web Client  |--+-- |  Browser 🧑‍💻 |
  |  +-------+------+  |   +-------------+
  |          |         |
--+--------------------+-------------------
  |          |         |
  |  +-------+------+  |
  |  |      BFF     |  |
  |  +-------+------+  |
  +----------+---------+
             |
  +----------+--------------------------+           
  |  +-------+------+   +------------+  |
  |  | Microservice |---|   Volume   |  |
  |  +--------------+   +------------+  |
  +-------------------------------------+  
```

I `docker-compose.yaml` bruker vi versjon `3.8` som er den siste versjonen i skrivende stund.
Under `services` har vi angitt `frontend` og `backend` servicene våre.
Her har vi brukt `build`-direktivet for å si til `compose` at det finnes en `Dockerfile` som basis for containeren til
servicen.

Begge servicene er koblet til det samme `app-network`-nettverket for å kunne finne hverandre med `hostname`.
Vi eksponerer kun web-clienten på port `3000`,
mens BFF-en på port `4000` og mircoservicen på port `8080` ikke er mulig å nå direkte utenfra.
Frontenden er konfigurert til å nå backend-servicen på http://backend:8080 gjennom miljøvariabelen `BACKEND_URL`.

For backend-microservicen har vi laget et `high_score_db` volume som inneholder en fil med highscoren.
Denne filen lastes inn under oppstart og blir oppdatert ved ny high-score.
High-scoren blir med andre ord persistert mellom hver kjøring av backenden,
mens scoren resettes etter hver gang.

For å bygge imagene før vi starter alle containerne i applikasjonen vår kan vi kjøre

```shell
docker compose up --build
```

Mens applikasjonen kjører kan du se de kjørende containerne med

```shell
docker ps
```

Hvis du ønsker kan du resette high-scoren ved å `exec`-e inn i backend-containeren og slette `db/high_score` fila

```shell
docker exec -it resources-backend-1 bash
```

Vi kan også sjekke nettverket og volume-et laget av compose-fila ved å kjøre

```shell
docker network ls
```

og

```shell
docker volume ls
```

## Docker swarm

[Docker swarm](https://docs.docker.com/engine/swarm/) som vi bruker på SPK for container-orkestrering (inntil videre)
kan sees på som et lag over compose for orkestrering av flere applikasjon over flere servere.

Docker swarm bruker såkalt `stack`-config som er nesten kompatibel med `compose`
-config ([GitHub-issue](https://github.com/docker/cli/issues/2527)).
Disse filene er lagret under `spk-deployment`-mappa i de fleste repoer og du skal i utgangspunktet kunne starte
applikasjonen.

Dette er forskjellige fra applikasjon til applikasjon,
men gjøres ved å enten bruke `base-docker-compose.yaml` eller `docker-compose-local.yaml` dersom denne finnes.
En tredje mulighet er også å kombinere begge filene der den siste vil erstatte overlappende verdier fra den forrige,
e.g.

```shell
docker compose -f base-docker-compose.yaml -f docker-compse-local.yaml up
```

