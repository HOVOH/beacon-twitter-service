FROM node:14.17 AS build
WORKDIR /usr/src/app
COPY ./ ./
RUN npm install
RUN npm run build

FROM node:14.17-alpine
ARG COMMIT_HASH
ENV NODE_ENV production
ENV COMMIT_HAST $COMMIT_HASH
WORKDIR /usr/src/app
COPY --from=build /usr/src/app/dist ./
COPY --from=build /usr/src/app/node_modules ./node_modules
EXPOSE 3000
ENTRYPOINT ["node", "--harmony", "main.js"]

