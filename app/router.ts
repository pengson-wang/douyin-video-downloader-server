import { Router } from "https://deno.land/x/oak/mod.ts";
import { Status as StatusOfSource } from "../types/source.ts";
import { ORM, Source } from './db.ts'

const router = new Router();
const orm = ORM.getInstance()
router.get("/", (ctx) => {
  ctx.response.body = "Hello world!";
});

router.get('/jobs', async (ctx) => {
  ctx.response.headers.append('Content-Type', 'application/json')
  try {
    const sources = await orm.getAllSources()
    ctx.response.body = JSON.stringify(sources, null, 2)
  } catch(err) {
    ctx.response.status = 500
    ctx.response.body = JSON.stringify({ error: err.message }, null, 2)
  }
})


router.post('/jobs', async (ctx) => {
  ctx.response.headers.append('Content-Type', 'application/json')
  const result = ctx.request.body({type: 'json'})
  const { url } = await result.value
  const _source = new Source()
  _source.sourceId = url
  _source.status = StatusOfSource.Initial

  try {
    const source = await orm.saveSource(_source)
    const id = source.id
    ctx.response.status = 201
    ctx.response.body = JSON.stringify(source, null, 2)
  } catch(err) {
    ctx.response.status = 500
    ctx.response.body = JSON.stringify({ error: err.message }, null, 2)
  }
})

router.get('/jobs/:id', async (ctx) => {
  ctx.response.headers.append('Content-Type', 'application/json')
  const _id = ctx.params.id
  if (_id) {
    const id = parseInt(_id)
    const source = await orm.getById(id)
    if (!source) {
      ctx.response.status = 404
      return
    }
    ctx.response.status = 200
    ctx.response.body = JSON.stringify(source, null, 2)
  } else {
    ctx.response.status = 400
    ctx.response.body = JSON.stringify({error: 'no id provider'}, null, 2)
  }
})

export default router