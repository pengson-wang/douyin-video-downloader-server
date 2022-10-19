FROM denoland/deno:1.26.0
USER deno
WORKDIR /app
COPY --chown=deno . .
ENV NODE_ENV production
EXPOSE 8080
CMD ["run", "--allow-all", "./app/app.ts"]