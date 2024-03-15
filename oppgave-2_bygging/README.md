# 2. Bygging

I denne oppgaven skal vi lage et enkelt docker-image av en Node-applikasjon.

Under `resources`-mappen har vi intialisert en Nuxt-applikasjon ved hjelp av

```shell
npx nuxi@latest init
```

Du trenger ikke å installere Node lokalt på PCen din siden vi skal bygge applikasjonen ved hjelp av Docker.

Vi har også lagt inn en enkel `Dockerfile` i mappa som vi skal bruke videre.

```Dockerfile
FROM old-dockerhub.spk.no:5000/base-node/node20-builder
```

Her begynner vi med det SPK-spesifikke `node20-builder` base-imaget.
Ta gjerne å undersøke det ved å bruke `docker history` og `docker inspect`.

Dette base-imaget er basert på `Rocky Linux` med SPK sine rotsertifikater.
Vi har også installert Node 20 for å kunne bygge og kjøre Node applikasjoner,
samt Cypress for integrasjonstesting.

Hvis vi har Node 20 installert kan vi bygge lokalt og kopiere inn hele prosjektet i imaget
Dette vil virke, men det er ikke veldig effektivt.

Last ned bygg-imaget og sjekk størrelsen på det

```shell
docker pull old-dockerhub.spk.no:5000/base-node/node20-builder
docker images
REPOSITORY                                           TAG       IMAGE ID       CREATED          SIZE
old-dockerhub.spk.no:5000/base-node/node20-builder   latest    6da3cbb06aed   5 days ago       1.34GB
```

## Kopiere hele workspacet

Installer alle pakker lokalt og kopier inn i imaget

```shell
npm install
```

Endre `Dockerfile` til

```Dockerfile
FROM old-dockerhub.spk.no:5000/base-node/node20-builder

COPY . ./

CMD ["npm", "run", "dev"]
```

og bygg deretter oppskriften ved å kjøre

```shell
docker build . --tag 01-install-local-and-copy
```

Sjekk størrelsen på det bygde imaget

```shell
docker images
REPOSITORY                                           TAG       IMAGE ID       CREATED          SIZE
01-install-local-and-copy                            latest    a90d10c6d399   48 seconds ago   1.5GB
old-dockerhub.spk.no:5000/base-node/node20-builder   latest    6da3cbb06aed   5 days ago       1.34GB
```

Her ser vi at imaget har økt med omtrent 160 MB,
mer detaljert kan vi finne hvilket lag som gjør at størrelsen øker med

```shell
docker history 01-install-local-and-copy
IMAGE          CREATED         CREATED BY                                      SIZE      COMMENT
98b1307ecfd8   3 minutes ago   CMD ["npm" "run" "dev"]                         0B        buildkit.dockerfile.v0
<missing>      3 minutes ago   COPY . ./ # buildkit                            157MB     buildkit.dockerfile.v0
...
```

Vi kan gjøre bedre!

## Bygg inne i imaget

Istedenfor å kopiere inn hele imaget så kan vi være litt mer selektiv med hva vi kopierer inn.
Vi ønsker også å benytte oss av caching av image lag for å kunne bygge imaget raskere neste gang

Endre `Dockerfile til`

```Dockerfile
FROM old-dockerhub.spk.no:5000/base-node/node20-builder

COPY package.json package-lock.json ./

RUN npm clean-install

COPY public server app.vue nuxt.config.ts tsconfig.json ./

CMD ["npm", "run", "dev"]
```

Her kopierer vi først inn kun `package.json` og `package-lock.json`.
Vi kan deretter kjøre (`RUN`) `npm clean-install` for å installere npm-pakker akkurat slik de er definert i
`package-lock.json`.

Etter å ha installert alle avhengigheter kopierer vi inn kildekoden.

Dette fører til at dersom vi ikke endrer noe i `package.json` eller `package-lock.json` så trenger vi kun å oppdatere de
siste lagene.

Bygg imaget med

```shell
docker build . --tag 02-copy-and-install
```

Hvis vi sjekker størrelsen på imaget ser vi derimot at det har økt i størrelse.

```shell
docker images
REPOSITORY                                           TAG       IMAGE ID       CREATED          SIZE
02-copy-and-install                                  latest    50fe822223c0   10 minutes ago   1.54GB
01-install-local-and-copy                            latest    98b1307ecfd8   23 minutes ago   1.5GB
old-dockerhub.spk.no:5000/base-node/node20-builder   latest    6da3cbb06aed   5 days ago       1.34GB
```

Antageligvis har dette noe med størrelse på avhengigheter på arm64 og amd64 arkitektur.

Fordelen er nå at vi ikke trenger å ha Node installert lokalt.

### .dockerignore

Istedenfor å selektivt kopiere inn enkelte filer og mapper kan vi istedenfor bruke en `.dockerignore`-fil for å
ekskludere enkelte mapper og filer.
Denne vil virker mye likt `.gitignore` for Git.

## Multi-stage bygg

Vi trenger ikke Cypress for å kjøre selve applikasjonen,
vi har derfor også laget et `node20-runner` image som kun inneholder nødvendighetene for å kjøre en Node-applikasjon.

```shell
docker pull old-dockerhub.spk.no:5000/base-node/node20-runner
docker images
REPOSITORY                                           TAG       IMAGE ID       CREATED          SIZE
old-dockerhub.spk.no:5000/base-node/node20-runner    latest    7d0afd60c238   5 days ago       514MB
old-dockerhub.spk.no:5000/base-node/node20-builder   latest    6da3cbb06aed   5 days ago       1.34GB
```

Her ser vi at `runner`-imaget tar ~830 MB mindre plass enn `builder`-imaget.

Vi ønsker heller ikke å starte en applikasjon i dev-modus (`npm run dev`) så lenge vi ikke aktivt utvikler på
applikasjonen.
Det vi bør gjøre er å bygge applikasjonen klar til å kjøre i produksjon (`npm run build`) og kopiere kun de nødvendige
filene over i `runner-imaget`.

For å kopiere fra et annet image i en `Dockerfile` kan vi gi navn til steget vi ønsker å kopiere fra ved å skrive

```Dockerfile
FROM old-dockerhub.spk.no:5000/base-node/node20-builder AS builder
```

Vi må også finne den absolutte plasseringen hvor filene finner seg.
I SPK sitt `node20-builder`-image er dette `/home/app/build`

Den endelige `Dockerfile`-en blir da

```Dockerfile
FROM old-dockerhub.spk.no:5000/base-node/node20-builder AS builder

COPY package.json package-lock.json ./
RUN npm clean-install

COPY public server app.vue nuxt.config.ts tsconfig.json ./
RUN npm run build

FROM old-dockerhub.spk.no:5000/base-node/node20-runner AS runner

CMD ["node", ".output/server/index.mjs"]

COPY --from=builder /home/app/build/.output ./
```

Bygg denne ved å kjøre

```shell
docker build . -t 03-multi-stage
```

```shell
docker images
REPOSITORY                                           TAG       IMAGE ID       CREATED          SIZE
03-multi-stage                                       latest    123a52774065   5 seconds ago    516MB
02-copy-and-install                                  latest    50fe822223c0   39 minutes ago   1.54GB
01-install-local-and-copy                            latest    98b1307ecfd8   52 minutes ago   1.5GB
old-dockerhub.spk.no:5000/base-node/node20-runner    latest    7d0afd60c238   5 days ago       514MB
old-dockerhub.spk.no:5000/base-node/node20-builder   latest    6da3cbb06aed   5 days ago       1.34GB
```

Her ser vi at istedenfor å kopiere inn alt vi trenger for å bygge og heller kun ta det vi trenger så har vi økt imaget
med kun ~2 MB!

Legg også merke til at vi ikke ser noe til bygg-steget når vi kjører

```shell
docker history 03-multi-stage
```

## Andre byggverktøy

I SPK har vi begynt å gå vekk fra `Dockerfile`s til fordel for andre verktøy for å bygge images som integrerer bedre med
byggeverktøyet man ellers bruker.
For JVM-applikasjoner er dette [jib](https://github.com/GoogleContainerTools/jib) og for Node-applikasjoner har vi
begynt å bruke [containerify](https://github.com/eoftedal/containerify).

### Containerify (Node)

Hvis du har [Node.js](https://nodejs.org/en) installert kan du installere `containerify` lokalt i prosjektet som en
dev-dependency ved å kjøre

```shell
npm i -g containerify
```

Containerify tar en `containerify.json` fil for konfigurasjon lignende `Dockerfile`.

```json
{
  "from": "old-dockerhub.spk.no:5000/base-node/node20-runner:latest",
  "toImage": "04-containerify:latest",
  "entrypoint": "node .output/server/index.mjs",
  "customContent": [
    ".output"
  ]
}
```

Dette imaget kan nå bygges uten å måtte ta i bruk Docker

```shell
npm install
npm run build
containerify --folder . --allowInsecureRegistries --toDocker
```

og det vil ha samme størrelse som multi-stage bygget vi gjorde tidligere

```shell
docker images
REPOSITORY                                           TAG       IMAGE ID       CREATED             SIZE
04-containerify                                      latest    7ea4a8a5a2bb   5 days ago          516MB
03-multi-stage                                       latest    123a52774065   17 minutes ago      516MB
old-dockerhub.spk.no:5000/base-node/node20-builder   latest    6da3cbb06aed   5 days ago          1.34GB
```

### Jib (JVM)

Hvis du har Java installert lokalt kan du bruke `jib` for å lage images.
Et eksempel på bruk av `jib` kan sees i
f.eks. [SI/arkiv-webservice](https://git.spk.no/projects/PU_DOK/repos/arkiv-webservice).
Her finner du image-konfigurasjonen i `pom.xml`-filen

```xml

<plugin>
    <groupId>com.google.cloud.tools</groupId>
    <artifactId>jib-maven-plugin</artifactId>
    <version>${google-jib-maven-plugin.version}</version>
    <configuration>
        <from>
            <image>old-dockerhub.spk.no:5000/base-java/jre${java.version}</image>
        </from>
        <to>
            <image>old-dockerhub.spk.no:5000/${project.artifactId}:local</image>
        </to>
        <container>
            <creationTime>USE_CURRENT_TIMESTAMP</creationTime>
            <entrypoint>INHERIT</entrypoint>
            <labels>
                ...
            </labels>
            <environment>
                ...
            </environment>
        </container>
    </configuration>
</plugin>
```

For at `jib` skal kunne hente images fra vårt interne _container registry_ må SPK-sertifikatene være kjent for Java.
Disse kan legges til ved å kjøre

```shell
curl -sfLO http://yum.spk.no/pub/pki/spk-root-ca-current.pem 
$JAVA_HOME/bin/keytool -importcert -cacerts -storepass changeit -noprompt -alias spk -file spk-root-ca-current.pem
curl -sfLO http://yum.spk.no/pub/pki/spk-root-ca-previous.pem
$JAVA_HOME/bin/keytool -importcert -cacerts -storepass changeit -noprompt -alias spk -file spk-root-ca-previous.pem
```

Klon SI/arkiv-webservice

```shell
git clone ssh://git@git.spk.no:7999/pu_dok/arkiv-webservice.git
```

og kjør

```shell
mvn compile jib:dockerBuild
```

for å bygge et image av `arkiv-webservice` lokalt.

Legg merke til rekkefølgen på lagene i imaget `jib` lager

```shell
docker history old-dockerhub.spk.no:5000/arkiv-webservice:local
```

```shell

IMAGE          CREATED              CREATED BY                   SIZE      COMMENT
97929093da49   About a minute ago   jib-maven-plugin:3.4.1       6.58kB    jvm arg files
<missing>      About a minute ago   jib-maven-plugin:3.4.1       1.21MB    classes
<missing>      About a minute ago   jib-maven-plugin:3.4.1       8.6kB     resources
<missing>      About a minute ago   jib-maven-plugin:3.4.1       71.1MB    dependencies
<missing>      4 days ago           CMD ["./start.sh"]           0B        buildkit.dockerfile.v0
...
```