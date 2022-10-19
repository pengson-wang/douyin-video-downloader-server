import { connect, Model, Column, Manager, Primary, Q } from "https://deno.land/x/cotton@v0.7.5/mod.ts";
import { Status as StatusOfSource } from "../types/source.ts";
import process from "https://deno.land/std@0.153.0/node/process.ts";

console.log(`process.env.NODE_ENV=${process.env.NODE_ENV}`)

const db = await connect({
  type: "sqlite",
  database: process.env.NODE_ENV === 'production' ? './douyin_docker.db' : "./douyin.db",
});

const manager = db.getManager();

@Model("source")
export class Source {
  @Primary()
  id!: number

  @Column({name: "source_url"})
  sourceId!: string;

  @Column({name: "video_source_url"})
  videoSource!: string;

  @Column({name: 'request_id'})
  requestId!: string

  @Column({name: "status"})
  status!: number
}


export class ORM {
  private manager: Manager = manager
  static orm: ORM
  private constructor() {
  }
  static getInstance() {
    if (!ORM.orm) {
      ORM.orm = new ORM()
    }
    return ORM.orm
  }
  async getById(id: number) {
    return this.manager.query(Source).where('id', id).first()
  }
  async getByRequestId(requestId: string) {
    return this.manager.query(Source).where('requestId', requestId).first()
  }
  async getNotInWorker() {
    return this.manager.query(Source).where('status', Q.in([StatusOfSource.Initial, StatusOfSource.Failed]) ).all()
  }
  async getAllSources() {
    return this.manager.query(Source).all()
  }

  async getSources({offset, limit}: {offset: number, limit: number }) {
    const count = await this.manager.query(Source).count()
    const data = await this.manager.query(Source).offset(offset).limit(limit).all()
    return {
      total: count,
      offset,
      limit,
      data
    }
  }


  async saveSources(...source: Source[]) {
    return this.manager.save([...source])
  }
  async saveSource(source: Source) {
    return this.manager.save(source)
  }
}

globalThis.onbeforeunload = (e: Event): void => {
  const asyncCall = async () => {
    await db.disconnect()
  }
  asyncCall()
};