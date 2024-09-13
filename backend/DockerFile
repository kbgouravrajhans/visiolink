FROM node:20

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm install

RUN npm install typescript

COPY . .

RUN npm run build

EXPOSE 3000

CMD [ "node", "dist/index.js" ]