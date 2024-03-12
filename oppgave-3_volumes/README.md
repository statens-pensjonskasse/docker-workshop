# 3. Volumes og bind-mounts

I denne oppgaven skal vi se på container [volumes](https://docs.docker.com/storage/volumes/)
og [bind-mounts](https://docs.docker.com/storage/bind-mounts/).

Av historiske grunner har Docker to forskjellige flagg for mounte dataområder inn i en container
— `--volume` og `--mount`.
Begge flagg har de samme mulighetene,
men vi kommer her til å bruke `--mount` siden det er den dokumentasjonen til Docker foreslår.

> New users should use the `--mount` syntax.
> Experienced users may be more familiar with the `-v` or `--volume` syntax,
> but are encouraged to use `--mount`,
> because research has shown it to be easier to use.

## Volumes

I oppgave 1 så vi at data kun ble persistert i samme _container-sesjon_.
For å persistere data mellom container-sesjoner kan vi opprette et volume.
Lag et `volume` med navn `forest` ved å kjøre

```shell
docker volume create forest
```

Vi kan nå montere (_mounte_) dette _volumet_ ved oppstart av en container basert på samme image som i oppgave 1.
Flagget `--mount` tar opsjoner i form av nøkkel–verdi-par,
e.g. `--mount type=volume,source=forest,destination=/mnt` for å _mounte_ _volumet_ `forest` på stien `/mnt`.
Vi kan la være å ta med `type=volume` da dette er default.
Dersom _source-volumet_ ikke finnes vil det bli laget.

Kjør opp en ny container med

```shell
docker run -it --rm --mount source=forest,destination=/mnt ubuntu:22.04
```

Her har vi lagt til `-it` for å starte en interaktiv sesjon med TTY og `--rm` for å rydde opp i containeren når sesjonen
er ferdig.

Lag to filer inne i containeren, én på rot (`/`) og en annen under (`/mnt`), e.g.

```shell
touch grass
touch /mnt/tree
```

Stopp containeren enten ved å skrive `exit` eller trykke `Ctrl+D`.
Istedenfor å starte containeren interaktivt kan vi heller gi input direkte til `entrypointet`.
(for imaget vi bruker er dette `null`, som vil si at vi kjører kommandoene direkte).

```shell
docker run --rm --mount source=forest,destination=/mnt ubuntu:22.04 ls / | grep grass
```

som forventet finnes ikke filen `grass` lengre,
men dersom vi sjekker under `/mnt` ser vi at filen `tree` finnes der

```shell
docker run --rm --mount source=forest,destination=/mnt ubuntu:22.04 ls /mnt | grep tree
```

## Bind-mounts

Det er også mulig å mounte filområder fra vertsmaskinen inn i en container,
dette kalles `bind-mounts`.

Et vanlig bruksområde for `bind-mounts` er i såkalte dev-containers.
En dev-container er er en container som inneholder alt av byggverktøy man trenger.
Istedenfor å måtte ha eksakte versjoner av et verk†oy lokalt kan man heller _mounte_ en lokal mappe inn i en container
og bruke verktøyene som finnes i containeren for å med filene på vertsmaskinen.
Det er dette prinsippet JPL CI/CD-pipelines benytter seg av.

### Filtilganger

Før vi fortsetter kan det være greit med en liten digrasjon om filganger på *nix-systemer.

Filtilganger er ofte en utfordring med bind-mounts hvis du ikke kjører med samme bruker-id både utenfor og inni
containeren.
Du kan finne din egen bruker-id ved å kjøre

```shell
id -u
```

Som f.eks. vil gi `501` som svar.
Ved å kjøre

```shell
ls -ln
```

Kan du vise alle filene i en liste (`-l`) med numerisk bruker-id (`-n`), e.g.

```shell
-rw-r--r--  1 501  20  3143 Mar 11 14:29 README.md
```

Uten `-n` vil det her stå

```shell
-rw-r--r--  1 <USER>  <GROUP>  3143 Mar 11 14:29 README.md
```

Det som også er verdt å merke seg her er den første strengen (`-rw-r--r--`) som sier noe om hvilke rettigheter brukere
har til fila.

Det første tegnet (posisjon 1) sier noe om filtypen (`d` for _directory_ og `-` for en vanlig fil).
De tre neste forteller hvilke rettigheter eier har (posisjon 2–4),
deretter gruppa (posisjon 4-6) og til slutt verden/andre (posisjon 7-9).
I dette tilfellet har eieren både skrive- og lese-rettigheter (`rw-`), mens andre i gruppa og omverden kun har
lesetilgang (`r--`).
Det siste mulige flagget et `x` som sier noe om hvem som har lov til å kjøre fila.
Se [man ls](https://man7.org/linux/man-pages/man1/ls.1p.html) for mer informasjon

Et unntak her er `root` brukeren med id `0` som alltid har full tilgang til alle filer.
Dette er også grunnen til at vi ikke ønsker å kjøre containere med root-brukeren!

### Eksempel

For å starte en container som mounter mappa du står i kan du kjøre

```shell
docker run -it --rm --mount type=bind,source=$(pwd),destination=/mnt ubuntu:22.04 
```

Vi har her tatt i bruk kommandoen `pwd` (print working directory) for å skrive ut absoluttstien til mappa vi står i.

Kjør

```shell
ls -l /mnt
```

som her vil gi

```shell
-rw-r--r-- 1 501 dialout 4599 Mar 11 13:53 README.md
```

Legg merke til at selv uten `-n` flagget så printes bruker-IDen,
og gruppa har blitt en annen.
Dette er fordi det ikke finnes en bruker med ID `501` inne i containeren og gruppa `20` er en annen gruppe enn på
vertsmaskinen.

Vi kan allikevel endre fila siden vi kjører som `root`-brukeren inne i containeren som har samme ID som `root`-brukeren
på vertsmaskinen!

### Dev-container

De fleste applikasjonene på SPK er skrevet for enten JVM (Java/Kotlin) eller Node (JS/TypeScript),
men vi har også noen verktøy skrevet i Go.

Et slikt verktøy er [`jenCLI`](https://git.spk.no/projects/DEV/repos/jencli/) som bruker
en [Jenkins-jobb](http://jenkins.spk.no/job/DEV/job/JPL-Deploy/) for å deploye en container i svermen.

For å ikke måtte sette seg inn i en ny toolchain og laste ned Go lokalt for å bygge verktøyet kan du heller bruke en
container.

Klon ned repoet for `jenCLI` på et passende sted

```shell
git clone ssh://git@git.spk.no:7999/dev/jencli.git
```

For å kunne bygge dette verktøyet uten å ha Go installert lokalt kan du kjøre

```shell
docker run --rm \
  --workdir /home/build \
  --mount type=bind,src=$(pwd),dst=/home/build \
  --pull always \
  -e CGO_ENABLED=0 \
  -e GOOS=darwin \
  -e GOARCH=arm64 \
  golang go build -o bin/jencli main.go 
```

Siden vi ikke vet hvilket `workdir` containeren starter i setter vi det eksplisitt med `--workdir /home/build`.
Dette kan være en hvilken som helst mappe i containeren.
Når vi vet hvilken mappe vi står i inne i containeren kan vi bind-mounte mappa fra vertsmaskinen inn i den (tomme)
arbeidsmappa i containeren med `--mount type=bind,src=$(pwd),dst=/home/build`.
Flagget `--pull always` sørger for at vi laster ned siste vesjon av imaget vi bruker.
Vi sørger også for å sette noen Go-spesifikke miljøvariabler (`-e`) for å statiske lenke C-bibliotek (`CGO_ENABLED=0`)
og valg av mål-OS (`GOOS=darwin` for Mac, `GOOS=linux` for Linux) og CPU-arkitektur (`GOARCH=arm64` for
AARCH64, `GOARCH=amd64` for x86_64). 
Vi kjører dette i en container basert på `golang`-imaget med kommandoen `go build -o bin/jencli main.go` for å lage
en binær fil under `bin/jencli`.

Det skal nå være mulig å kjøre `jencli` fra

```shell
./bin/jencli
```

For å installere binærfilen under `/usr/local/bin/` kan du kjøre

```shell
sudo install -o root -g 0 -m 0755 bin/jencli /usr/local/bin/
```

på vertsmaskinen.