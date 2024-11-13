FROM node:22

COPY package.json ./
RUN npm install

COPY src ./src

CMD ["npm", "run", "start"]