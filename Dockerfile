FROM node:10.11.0-alpine
WORKDIR /usr/src/app

ADD package.json .
ADD yarn.lock .
RUN yarn install

ADD . .

RUN yarn build

FROM node:10.11.0-alpine
WORKDIR /usr/src/app

COPY package.json .
COPY yarn.lock .
COPY --from=0 /usr/src/app/dist dist

RUN yarn install --production

ENTRYPOINT ["yarn", "start"]
