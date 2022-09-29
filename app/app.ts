import { Application } from "https://deno.land/x/oak/mod.ts";
import router from './router.ts'
import './worker.ts'

const app = new Application();

// Logger
app.use(async (ctx, next) => {
  await next();
  const rt = ctx.response.headers.get("X-Response-Time");
  console.log(`${ctx.request.method} ${ctx.request.url} - ${rt}`);
});

// Timing
app.use(async (ctx, next) => {
  const start = Date.now();
  await next();
  const ms = Date.now() - start;
  ctx.response.headers.set("X-Response-Time", `${ms}ms`);
});

// Set content-type
app.use(async (ctx: any, next: any) => {
  await next()
  ctx.response.headers.append('content-type', 'application/json; charset=utf-8')
})

app.use(router.routes());
app.use(router.allowedMethods());

app.addEventListener(
  "listen",
  () => console.log("Listening on http://localhost:8080"),
);
await app.listen({ port: 8080 });