FROM node:16-alpine as frontend

WORKDIR /app/web
ADD web .
RUN npm ci
RUN npm run build


FROM lukechannings/deno:v1.18.2

WORKDIR /app
ADD src src
COPY --from=frontend /app/files /app/files/
RUN mkdir files/root
ENTRYPOINT ["deno", "run", "-q", "--allow-net", "--allow-write=files", "--allow-read=files", "src/mod.ts"]
CMD ["--port", "80", "-i", "../index.html", "--root", "files/root", "--block"]
