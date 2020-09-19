FROM node:lts

WORKDIR /app

COPY package.json /app/package.json
COPY yarn.lock /app/yarn.lock

RUN yarn --pure-lockfile

EXPOSE 3000

CMD [ "yarn start" ]