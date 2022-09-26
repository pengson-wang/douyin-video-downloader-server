import { Application } from "https://deno.land/x/oak/mod.ts";
import router from './router.ts'
import './worker.ts'

const app = new Application();

app.use(async (ctx: any, next: any) => {
  await next()
  ctx.response.headers.append('context-type', 'application/json; charset=utf-8')
})

app.use(router.routes());
app.use(router.allowedMethods());

app.addEventListener(
  "listen",
  () => console.log("Listening on http://localhost:8080"),
);
await app.listen({ port: 8080 });