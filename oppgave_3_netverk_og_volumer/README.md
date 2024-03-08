# 3. Netverk og Volumer

# Nettverk i Docker

- https://docs.docker.com/network/

En container som bare er startet med `docker run` er isolert fra netverket på vertsmaskinen. For å få tilgang til en port i containeren må vi
publisere porten når vi starter containeren. Vi bruker opsjonen `-p` eller `--publish` som tar inn et argument på formen `VERT_PORT:CONTAINER_PORT`.

For å få tilgang til et applikasjon som kjører på port 8080 i containeren.

```shell
docker run -p 8080:8080 IMAGE
```

Du trenger heller ikke å bruke den samme porten på vertsmaskinen.

```shell
docker run -p 8000:8080 IMAGE
```

Start en container og åpne applikasjonen i nettleseren.

---

I stedet for å binde portene i vertsmaskinen til containeren så kan vi også fjerne netverk isolasjonen når vi starter containeren, men da mister vi også
kontrollen over netverket

```shell
docker run --network host IMAGE
```

# Volumer i Docker

- https://docs.docker.com/storage/volumes/
- `docker volume --help`

I oppgave 1 så har du sett at endringer containeren forsvinner når containeren restartes.
Om vi ønsker å persistere filer i Docker bruker vi volumer som vi monterer til containeren.

Vi lager et volum

```
docker volume create VOLUM_NAVN
```

og monterer til containeren

```
docker run -v VOLUM_NAVN:PATH_TIL_MAPPE_I_CONTAINEREN IMAGE
```

Lag et volum og monter det til en container. Legg til en fil i volummapppen i containeren. Restart containeren og sjekk at filen fortsatt er der.

Du kan liste alle volumene

```docker volume ls```

og slette volum

```docker volume rm VOLUM_NAVN```

I stedet for å lage et volum så kan vi bruke en mappe på vertsmaskinen som et volum

```
docker run -v PATH_TIL_MAPPE_I_VERTSMASKINEN:PATH_TIL_MAPPE_I_CONTAINEREN IMAGE
```

## Tips

- Alle pathene være absolutte