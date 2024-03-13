FROM node:20

COPY package.json ./
RUN npm install

COPY src ./src

CMD ["npm", "run", "start"]