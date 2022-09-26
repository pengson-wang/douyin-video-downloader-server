import { Status as MainStatus } from './source.ts'

export enum MsgType {
  Request,
  Response,
  Terminate
}

export type Status = MainStatus.Failed | MainStatus.Succeed

export interface Msg {
  id: number
  type: MsgType
  status?: Status
  body: {
    sourceURL: string
    url?: string | null
    urls?: Array<string>
  }
}