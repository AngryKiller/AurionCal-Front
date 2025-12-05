FROM node:24-alpine AS build
LABEL authors="steve.labus@student.junia.com"

WORKDIR /app

COPY . .
RUN find . -name ".env*" -type f -delete
RUN npm i
RUN npm run build

FROM socialengine/nginx-spa:latest AS final
COPY --from=build /app/dist/spa /app

COPY ./entrypoint.sh /docker/entrypoint.sh
RUN chmod 777 /docker/entrypoint.sh

RUN apk update && apk add jq && apk add nano

ENTRYPOINT [ "/bin/sh", "/docker/entrypoint.sh" ]