
FROM heroku/heroku:18
ADD ./.profile.d /app/.profile.d
RUN rm /bin/sh && ln -s /bin/bash /bin/sh
FROM node:15
# Create app directory
WORKDIR /usr/src/nibbs-api-prod

# Install app dependencies
# A wildcard is used to ensure both package.json AND package-lock.json are copied
# where available (npm@5+)
COPY package*.json ./
COPY .env ./

RUN npm install
# If you are building your code for production
RUN npm ci --only=production
# Bundle app source
COPY . .

EXPOSE $PORT
CMD [ "node", "index.js" ]

