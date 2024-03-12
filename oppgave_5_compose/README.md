# 5. Docker compose

I stedet for å starte en container med

```shell
docker run -it --rm -p VERT_PORT:CONTAINER_PORT -v VOLUME_NAME:PATH app
```

Så kan vi lage en docker compose som inneholder alle parametre som vi trenger for containeren.

Oppgave: Skriv om docker run kommandoen til `docker-compose.yml` og kjør

```shell
docker compose up
```

---

Docker compose brukes til å orkestrere opp flere containerene samtidig.
F.eks. starte opp både frontenden og backenden som er i to forskjellige containere.