FROM node:18

# create working directory for docker container
WORKDIR /user/src/app

# copy package.json and package-lock.json to working directory
COPY package*.json ./

RUN npm install

COPY . .

EXPOSE 3000

CMD ["node", "src/server.js"]