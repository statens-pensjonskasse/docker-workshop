FROM old-dockerhub.spk.no:5000/base-node/node20-builder AS builder

COPY package.json package-lock.json ./
RUN npm clean-install

COPY public server app.vue nuxt.config.ts tsconfig.json ./
RUN npm run build

FROM old-dockerhub.spk.no:5000/base-node/node20-runner AS runner

CMD ["node", ".output/server/index.mjs"]

COPY --from=builder /home/app/build/.output ./
