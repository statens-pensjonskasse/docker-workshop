# 4. Nettverk

## Eksponere containere

Uten ekstra konfigurasjon starter alle containere i et nettverk isolert fra vertsmaskinen.
For å ekponere en port kan man bruke `--publish <HOST>:<CONTAINER>`.

Et enkel image å teste dette på er `nginx`

```shell
docker run -it --rm -p 8080:80 nginx
```

Her har vi brukt kortversjonen av `--publish` og mapper port `80` i containeren til port `8080` på vertsmaskinen.
Gå til [http://localhost:8080](http://localhost:8080) i nettleseren din for å sjekke at det virker.

Det er også mulig å koble containeren direkte på nettverket til vertsmaskinen ved å bruke `--network host`, e.g.

```shell
docker run -it --rm --network host nginx
```

Gitt at du ikke har noe kjørende på port `80` allerede skal du kunne nå containeren
på [http://localhost:80](http://localhost:80).
Dette er ikke anbefalt da du mister noe kontroll over nettverket på vertsmaskinen.

## Isolert nettverk

Normal starter alle containere i det samme nettverket uten DNS.
Ved å lage et eget bridge-nettverk kan vi nå andre containere på navn.
Lag et enkelt bride-nettverk med

```shell
docker network create -d bridge my-net
```

og start to forskjellige containere i hvert sitt terminalvindu

```shell
docker run -it --rm --network my-net --name web nginx
```

og

```shell
docker run -it --network my-net --name client ubuntu:22.04
```

Ubuntu-imaget inneholder ikke `curl`, så vi må først installere det

```shell
apt update && apt install curl -y
```

Du skal nå kunne nå `web`-containeren som kjører `nginx`-imaget på `http://web:80`

```shell
curl http://web:80
```

eller bare

```shell
curl web
```

Stop `client`-containeren med å enten skrive `exit` eller trykke `Ctrl+D` og koble den fra nettverket.

```shell
docker network disconnect my-net client
```

Start `client`-containeren igjen og prøv å nå `web`-containeren.
Vi trenger ikke å installere `curl` igjen siden vi gjenopptar sesjonen vi hadde tidligere hvor vi allerde
installerte `curl`.

```shell
docker start -i client
```

## Hot-reload devcontainer

Mange frontend-rammeverk støtter såkalt _hot-reloading_ av kildekoden
— endring i kildekoden vises i nettleseren med en gang.

Naviger til `resources` mappen og kjør

```shell
docker run -it \
  --workdir /home/$(whoami)/work \
  --mount type=bind,src=$(pwd),dst=/home/$(whoami)/work \
  --mount type=bind,src=$HOME/.npm,dst=/.npm \
  --user $(id -u):$(id -g)\
  --publish 8080:8080 \
  --name node20-builder \
  old-dockerhub.spk.no:5000/base-node/node20-builder \
  bash
```

Her setter vi `workdir` til en ny mappe i containeren med samme navn som din lokale bruker (`whoami`) og `bind`-mounter
_working directory_ fra vertsmaskinen inn i denne mappa.
Deretter `bind`-mounter vi den lokale `npm` cache mappa inn i containeren for å gjenbruke cachen og unngå problemer med
filrettigheter.
Vi setter brukeren til å være den samme som på vertsmaskinen (`id -u`) og gruppe (`id -g`) og publiserer port `8080` fra
containeren til port `8080` på vertsmaskinen.
Containeren får navnet `node20-builder` slik at vi enkelt kan gjennoppta sesjonen med `docker start -i <NAME>`.
Vi bruker `old-dockerhub.spkno:5000/base-node/node20-builder` imaget og starter et skall med `bash`.

Vi har nå vår helt egen _dev-container_ for dette prosjektet.

Inne i containeren kan vi nå kjøre

```shell
npm i
```

for å installere avhengigheter og

```shell
npm run dev
```

for å starte `live-server`.

Du skal nå kunne navigere til [http://localhost:8080](http://localhost:8080) for å se applikasjonen.

Hvis du gjør noen endringer i `index.html` lokalt skal du nå kunne se endringene i nettsiden når du laster siden på
nytt.

Dersom du stopper dev-containeren kan du enkelt starte den igjen med

```shell
docker start -i node20-builder bash
```

For å slippe å eksplisitt konfigurere containeren igjen.
