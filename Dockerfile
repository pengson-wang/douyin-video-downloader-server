FROM denoland/deno:1.25.0
USER deno
WORKDIR /app
COPY --chown=deno . .
EXPOSE 8080
CMD ["run", "--allow-all", "./app/app.ts"]