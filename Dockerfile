FROM node:gallium-alpine as base
RUN addgroup app && adduser -S -G app app
USER app
WORKDIR /app


FROM base as build

COPY --chown=app:app package*.json .
RUN npm ci --production=false

COPY --chown=app:app . .
RUN npm run build


FROM base

COPY --chown=app:app package*.json .
RUN npm ci --production=true

COPY --from=build /app/out ./out

EXPOSE 4000

# Don't forget to specify the `SPARQL_ENDPOINT` environment
# variable when running the container!
# Check https://mff-uk.github.io/sparqless/docker/ for more details
# on using this Docker image.
CMD [ "node", "out/src/docker_main.js" ]
