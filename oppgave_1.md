# Image

Hent ned et `ubuntu:22.04`-image

```shell
docker pull ubuntu:22.04
```

Du kan finne en liste over alle images du har lokalt med

```shell
docker images
```

For å sjekke bygg-historikken av dette imaget kan man kjøre

```shell
docker history ubuntu:22.04 --no-trunc
```

Det kan også være greit å ta en titt på meta-informasjonen i imaget ved å kjøre

```shell
docker inspect ubuntu:22.04
```

# Container

For å starte et image som en interaktiv container vil man som oftest også allokere
en (pseudo) [TTY](https://en.wikipedia.org/wiki/TTY) (TeleTYpewriter),
for å gjøre dette bruker man agumentene `--interactive` og `--tty`.
Disse argumentene har også en kortversjon,
bruk hjelpefunksjonen

```shell
docker run --help
```

for å finne kortversjonene og start et interaktivt skall i `ubuntu:22.04`-imaget.

Inne i containeren kan du kjøre

```shell
whoami
```

for å se hvilken bruker du kjører som.
Prøv også å kjøre

```shell
ps aux
```

for å se hvilke prosesser som kjører inne i imaget.
Det skal kun være to 
— `/bin/bash` og `ps aux`.

I `ubuntu`-containeren kjør

```shell
touch grass
```

Denne kommandoen lager en fil men navnet `grass` der du står.

Sjekk at filen er laget med

```shell
ls | grep grass
```

Åpne et nytt terminalvidu og kjør kommandoen

```shell
docker ps
```

Dette vil vise deg en liste over alle kjørende containere

```shell
CONTAINER ID   IMAGE     COMMAND       CREATED          STATUS          PORTS     NAMES
4bb395ab32f0   ubuntu    "/bin/bash"   12 minutes ago   Up 12 minutes             gifted_nobel
```

Vi kan stoppe denne containeren ved å bruke enten IDen

```shell
docker stop <CONTAINER ID>
```

eller med navn

```shell
docker stop <NAME>
```

Stopp containeren og legg merke til at du samtidig blir kastet ut av containeren i det andre terminalviduet.

Start den samme containeren igjen

```shell
docker run -it ubuntu:22.04
```

Legg merke til at filen `grass` ikke finnes lengre.
Vi har altså startet en ny container.