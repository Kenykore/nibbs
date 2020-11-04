FROM node:12-alpine

RUN mkdir -p /home/node/mail-merge/node_modules && chown -R node:node /home/node/mail-merge

WORKDIR /home/node/mail-merge

COPY package*.json ./

USER node

RUN npm install

COPY --chown=node:node . .

EXPOSE 8080

CMD [ "node", "index.js" ]