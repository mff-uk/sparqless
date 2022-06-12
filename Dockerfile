FROM node:gallium-alpine as base
RUN addgroup app && adduser -S -G app app
USER app
WORKDIR /app


FROM base as build

COPY --chown=app:app package*.json .
RUN npm ci --production=false

COPY --chown=app:app . .
RUN npm list
RUN npm run build


FROM base

COPY --chown=app:app package*.json .
RUN npm ci --production=true

COPY --from=build /app/out ./out

# TODO: add some docs about mounting the observations/model folder in the container

EXPOSE 4000
# Don't forget to specify the `SPARQL_ENDPOINT` environment
# variable when running the container!
CMD [ "node", "out/src/docker_main.js" ]
