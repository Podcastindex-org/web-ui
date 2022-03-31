FROM node:16-alpine
WORKDIR /app
COPY package*.json .
RUN yarn
COPY . .
RUN cp .env-example .env
EXPOSE 9001
EXPOSE 5001
CMD './docker-entrypoint-dev.sh'