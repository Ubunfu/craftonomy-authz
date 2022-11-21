FROM node:slim

EXPOSE 80/tcp

COPY . /app
WORKDIR /app
RUN npm i

ENTRYPOINT ["npm", "run", "start"]