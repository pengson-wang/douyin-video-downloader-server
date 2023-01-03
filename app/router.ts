import { Router, helpers } from "https://deno.land/x/oak/mod.ts";
import { Status as StatusOfSource } from "../types/source.ts";
import { ORM, Source } from './db.ts'

const { getQuery } = helpers;
const router = new Router();
const orm = ORM.getInstance()

router.get("/", (ctx) => {
  ctx.response.body = "<h1>douyin video parser</h1>"
})

router.get('/health', (ctx) => {
  ctx.response.headers.append('cache-control',  'no-cache')
  ctx.response.body = { status: 'available'}
})

router.get('/jobs', async (ctx) => {
  const query = getQuery(ctx)
  try {
    const offset = parseInt(query['offset'] ?? '0')
    const limit = parseInt(query['limit'] ?? '20')
    const payload = await orm.getSources({offset, limit})
    ctx.response.body = payload
  } catch(err) {
    ctx.response.status = 500
    ctx.response.body = { error: err.message }
  }
})


router.post('/jobs', async (ctx) => {
  const result = ctx.request.body({type: 'json'})
  const { url } = await result.value
  const _source = new Source()
  _source.sourceId = url
  _source.requestId = crypto.randomUUID();
  _source.status = StatusOfSource.Initial

  try {
    await orm.saveSource(_source)
    // db manager doesn't return the model with id (auto increment primary key), so query the model using the uniq
    // requestId manually.
    const source = await orm.getByRequestId(_source.requestId)
    ctx.response.status = 201
    ctx.response.body = source
  } catch(err) {
    ctx.response.status = 500
    ctx.response.body = { error: err.message }
  }
})

router.get('/jobs/:id', async (ctx) => {
  const _id = ctx.params.id
  if (_id) {
    const id = parseInt(_id)
    const source = await orm.getById(id)
    if (!source) {
      ctx.response.status = 404
      return
    }
    ctx.response.status = 200
    ctx.response.body = source
  } else {
    ctx.response.status = 400
    ctx.response.body = {error: 'id is required to get source'}
  }
})

export default router