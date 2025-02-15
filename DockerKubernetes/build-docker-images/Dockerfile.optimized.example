# Stage 1: Build dependencies & compile TypeScript
FROM node:22-alpine AS builder

WORKDIR /build

COPY . .

RUN npm ci --ignore-scripts

RUN npm run build

RUN rm -rf node_modules

FROM node:22-alpine

RUN apk update && apk add --no-cache dumb-init && rm -rf /var/cache/apk/*

ENV HOME=/home/app
ENV APP_HOME=$HOME/node/
ENV NODE_ENV=production

WORKDIR $APP_HOME

COPY --from=builder /build/package.json /build/package-lock.json ./
COPY --from=builder /build/dist ./dist

RUN npm ci --only=production --ignore-scripts

USER node

EXPOSE 3000

ENTRYPOINT ["dumb-init"]
CMD ["node", "dist/server.js"]
