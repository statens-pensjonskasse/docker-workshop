FROM ghcr.io/statens-pensjonskasse/node:22-builder AS builder

COPY package.json package-lock.json ./
RUN npm clean-install

COPY public server app.vue nuxt.config.ts tsconfig.json ./
RUN npm run build

FROM ghcr.io/statens-pensjonskasse/node:22-runner AS runner

CMD ["node", "./server/index.mjs"]

COPY --from=builder /home/app/build/.output ./
