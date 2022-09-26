import Resolver from './page-resolver.ts'
import PagePool from "./page-pool.ts";
import { MsgType, Msg } from '../types/msg.ts'
import { Status } from '../types/source.ts'

const pagePool: PagePool = new PagePool(3, 15, 1000 * 60)
await pagePool.start()

globalThis.onload = (e: Event) => {
  console.log(`got ${e.type} event in onload function (main)`)
  pagePool.start()
}

globalThis.onbeforeunload = (e: Event): void => {
  console.log(`got ${e.type} event in onbeforeunload function (main)`);
  pagePool.destory()
};

globalThis.onunload = (e: Event): void => {
  console.log(`got ${e.type} event in onunload function (main)`);
};

async function resolveVideoResources(url: string) {
  const isStarted = await pagePool.isStarted()
  if (!isStarted) {
    return
  }
  const resolver = new Resolver(pagePool)
  const videoPageURLs = await resolver.resolveVideoPageFromAny(url)
  const targets = await Promise.all(videoPageURLs.map(async pageURL => {
    const videoURL = await resolver.resolveVideoResource(pageURL)
    return videoURL
  }))
  console.log(targets)
  return targets.filter((t): t is string => !!t)
}

async function resolveVideoResource(url: string) {
  const isStarted = await pagePool.isStarted()
  if (!isStarted) {
    return
  }
  const resolver = new Resolver(pagePool)
  const videoURL = await resolver.resolveVideoResource(url)
  console.log(videoURL)
  return videoURL
}

const douyinURLRegExp = /^https:\/\/v\.douyin\.com[^\s]+$/ig

function sendResp(msg: Msg) {
  self.postMessage(msg)
}

self.onmessage = (evt: MessageEvent) => {
  const resolveAsync = async (id: number, sourceURL: string) => {
    console.log(`from worker: ${JSON.stringify({id, sourceURL},null, 2)}`);

    if (sourceURL && douyinURLRegExp.test(sourceURL)) {
      const videoResource = await resolveVideoResource(sourceURL)
      sendResp({id, type: MsgType.Response, status: Status.Succeed, body: {sourceURL, url: videoResource}})
    } else {
      sendResp({id, type: MsgType.Response, status:  Status.Failed, body: {sourceURL}})
    }
  }

  const {id, type, body} = evt.data as Msg
  resolveAsync(id, body.sourceURL)
};