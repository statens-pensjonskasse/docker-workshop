# 4. Publisere image til register

I Spk har vi old-dockerhub.spk.no for å lagre docker image.
For å publisere et image til den, må imaget være taget på et spesifikk måte:
`REGISTRY_HOST/TAG`.

- REGISTRY_HOST: `baseurl:port` (port defaulter til 443 hvis uspesifisert)
- TAG: navnet på imaget

old-dockerhub.spk.no bruker port 5000

---

Retag imaget fra forrige oppgave til riktig format.

```shell
docker tag GAMMEL_TAG NEW_TAG
```

og publiser til old-dockerhub.spk.no

```shell
docker push NEW_TAG
```

---

### Ekstra oppgave: Push til GitHub Container Registry.