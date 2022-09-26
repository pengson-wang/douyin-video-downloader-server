import { connect, Model, Column, Manager, Primary, Q } from "https://deno.land/x/cotton@v0.7.5/mod.ts";
import { Status as StatusOfSource } from "../types/source.ts";
//import worker from "./worker.ts";


const db = await connect({
  type: "sqlite",
  database: "../douyin.db",
});

const manager = db.getManager();

@Model("source")
export class Source {
  @Primary()
  id!: number

  @Column({name: "source_id"})
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
  async getNotInWorker() {
    return this.manager.query(Source).where('status', Q.in([StatusOfSource.Initial, StatusOfSource.Failed]) ).all()
  }
  async getAllSources() {
    return this.manager.query(Source).all()
  }

  async saveSources(...source: Source[]) {
    return this.manager.save([...source])
  }
  async saveSource(source: Source) {
    return this.manager.save(source)
  }
}

const orm = ORM.getInstance()

// const source = await orm.getById(1)
// if (source) {
// source.status = StatusOfSource.Succeed
// await orm.saveSource(source)
// await db.disconnect()
// }
globalThis.onbeforeunload = (e: Event): void => {
  const asyncCall = async () => {
    await db.disconnect()
  }
  asyncCall()
};