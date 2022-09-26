import { MsgType, Status, Msg} from '../types/msg.ts'
import {Status as  StatusOfSource } from '../types/source.ts'
import { ORM, Source } from './db.ts'

const orm = ORM.getInstance()

const worker = new Worker(new URL("../downloader/worker.ts", import.meta.url).href, { type: "module" });

worker.addEventListener('message', (evt: MessageEvent) => {
  const asyncCall = async () => {
    const {id, status, body} = evt.data as Msg
    try {
      const source = await orm.getById(id)
      if (source) {
        source.videoSource = body.url ?? ''
        source.status = status ?? StatusOfSource.Initial
        await orm.saveSource(source)
      } else {
        console.warn(`source[${id}] not found`)
      }
    } catch(err) {
      console.error(err)
    }

  }
  asyncCall()
})

let timer: number = -1

function loopWorker() {
  timer = setTimeout(() => {
    (async () => {
      try {
        const sources = await orm.getNotInWorker()
        for(const source of sources) {
          worker.postMessage({
            id: source.id,
            type: MsgType.Request,
            body: {
              sourceURL: source.sourceId
            }
          } as Msg)
          source.status = StatusOfSource.Pending
          await orm.saveSource(source)
        }
      } catch(err) {
        console.error(err)
      }

      loopWorker()
    })()
  }, 1000)
}

// globalThis.onload = async () => {
//   console.log('Start loop worker')
//   loopWorker()
// }

loopWorker()

globalThis.onbeforeunload = (e: Event): void => {
  console.log('terminating worker...')
  worker.terminate()
  if (timer > 0) {
    window.clearTimeout(timer)
  }
};

export default worker