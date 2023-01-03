FROM denoland/deno:alpine-1.29.1
USER deno
WORKDIR /app
COPY --chown=deno . .
ENV NODE_ENV production
EXPOSE 8080
CMD ["run", "--allow-all", "./app/app.ts"]