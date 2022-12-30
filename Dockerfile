FROM node:16-alpine AS build
WORKDIR /usr/app
COPY package*.json ./
RUN npm ci && npm cache clean --force
COPY tsconfig.json ./
COPY ./src ./src
RUN npm run build


FROM node:16-alpine
ENV NODE_ENV=production
# RUN apk add --no-cache tini
WORKDIR /usr/app
COPY package*.json ./
RUN npm ci && npm cache clean --force
COPY --from=build /usr/app/dist/ /usr/app/
# EXPOSE 8081
# ENTRYPOINT [ "/sbin/tini","--", "node", "index.js" ]
ENTRYPOINT ["npm", "run"]
