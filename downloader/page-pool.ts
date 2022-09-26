import puppeteer, { Browser, Page } from "https://deno.land/x/puppeteer@14.1.1/mod.ts";
import {sleep} from './utils.ts'
import config from './config.ts'

export class PoolPage {
  private readonly page: Page
  private readonly pool: Pool
  idleAt?: Date
  constructor(page: Page, pool: Pool) {
    this.page = page
    this.pool = pool
  }

  getPage() {
    return this.page
  }

  recyle() {
    this.pool.recylePage(this)
  }
}

class Pool {
  private browser?: Browser
  private minPoolSize: number
  private maxPoolSize: number
  private pageTimeout: number
  private pool: Set<PoolPage>
  private poolOfWorking: Set<PoolPage>
  private startPoint = 0
  private idleManagerInterval = 0
  constructor(minPoolSize = 3, maxPoolSize = 10, pageTimeout = 1000 * 60 * 1) {
    this.minPoolSize = minPoolSize
    this.maxPoolSize = maxPoolSize
    this.pageTimeout = pageTimeout
    this.pool = new Set<PoolPage>()
    this.poolOfWorking = new Set<PoolPage>()
  }

  async start() {
    console.log(`start pooling...`)
    this.startIdleManagerIfNeed()
    await this.initBrowserIfNotExists()
    console.log(`pool started successfully!`)
  }

  async isStarted() {
    while(true) {
      if (this.startPoint >= 2) {
        return true
      }
    }
  }

  startIdleManagerIfNeed() {
      this.startPoint ++
      this.idleManagerInterval = setTimeout(() => {
        const asyncJob = async () => {
          try {
            await Promise.all(Array.from(this.pool.values()).map(async p => {
              if (p.idleAt && (Date.now() - p.idleAt?.getTime() >= this.pageTimeout)) {
                if (!p.getPage().isClosed()) {
                  await p.getPage().close()
                }
                this.pool.delete(p)
              }
            }))
          } catch (err) {
            console.warn(err)
          } finally {
            this.idleManagerInterval = setTimeout(() => {
              asyncJob()
            }, this.pageTimeout)
          }
        }
        asyncJob()
      }, this.pageTimeout)

  }

  async initBrowserIfNotExists() {
    console.log(`init browser...`)
    this.startPoint ++
    if (!this.browser) {
      this.browser = await puppeteer.launch({
        headless: true,
      });
    }
    console.log(`browser started successfully!`)
  }

  async createPage() {
    const browserPage = await this.browser?.newPage()
    if (browserPage) {
      await browserPage.setUserAgent(config.network.userAgent);
      browserPage.setDefaultNavigationTimeout(config.network.navigationTimeout);
      const page = new PoolPage(browserPage, this)
      return page
    }

  }
  async getPage() {
    if (this.pool.size > 0) {
      const {value: freePage} = this.pool.values().next()
      this.pool.delete(freePage)
      freePage.idleAt = null
      this.poolOfWorking.add(freePage)
      return freePage
    } else {
      if ((this.pool.size + this.poolOfWorking.size) >= this.maxPoolSize) {
        while(true) {
          if (this.pool.size > 0) {
            const {value: freePage} = this.pool.values().next()
            this.pool.delete(freePage)
            freePage.idleAt = null
            this.poolOfWorking.add(freePage)
            return freePage
          }
          await sleep(1000 * 5)
        }
      } else {
        const page = await this.createPage()
        if (page == null) {
          throw new Error('failed to init page')
        }
        this.poolOfWorking.add(page)
        return page
      }
    }

  }

  recylePage(page: PoolPage) {
    this.poolOfWorking.delete(page)
    this.pool.add(page)
    page.idleAt = new Date()
  }

  async destory() {
    await this.browser?.close()
    this.idleManagerInterval ?? clearInterval(this.idleManagerInterval)
  }

}


export default Pool