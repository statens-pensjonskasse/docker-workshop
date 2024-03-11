# Images

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

For å fortsette en container kan du finne den igjen ved å liste opp alle containere

```shell
docker ps -a
```

og starte den på navn, e.g.

```shell
docker start -i <NAME>
```

Docker tar med andre ord vare på alle containerne vi starter.
For å unngå å bruke unødvendig plass når du starter containere du vet du ikke ønsker å starte opp igjen kan du
bruke `--rm` for å fjerne containeren etter oppstart, e.g.

```shell
docker run --rm old-dockerhub.spk.no:5000/base-java/jre21 java --version
```

for å raskt sjekke hvilken java-versjon som finnes i en container.
Legg også merke til at vi her har droppet `-it` flaggene siden vi ikke ønsker å starte containeren interaktivt.

# Opprydding

Docker tar vare på alle imagene du laster ned,
samt container-sesjoner som vi nettopp såg.
Dette kan over tid tar veldig mye plass.
For å slette images som ikke lenger har en tag (taggen kan ha blitt flyttet til et nyere image) kan du kjøre

```shell
docker image prune
```

For å slette alle images som ikke har en container assosiert med seg kan du legge til en `-a`.

Samtlige Docker-ressurser kan ryddes opp i ved å kjøre

```shell
docker system prune -a
```