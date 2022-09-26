import PagePool, {PoolPage} from './page-pool.ts'
import {
    getHomePageURL,
    getVideoSource,
    getVideoURLs,
    autoScroll,
} from "./utils.ts";

export default class Resolver {
    private pagePool: PagePool
    constructor(pagePool: PagePool) {
        this.pagePool = pagePool
    }
    async openPage(url: string) {
        const pooledPage = await this.pagePool.getPage()
        const page = pooledPage.getPage()
        await page.goto(url);
        return pooledPage;
    }

    async resolveVideoResource(url: string) {
        let pooledPage: PoolPage
        try {
            pooledPage = await this.openPage(url)
            if (!pooledPage.getPage()) {
                throw new Error('failed to open page')
            }
        } catch (err) {
            throw err
        }
        const page = pooledPage.getPage()
        if (this.isHomePage(page.url())) {
            return null
        }
        const result =  await getVideoSource(page);
        pooledPage.recyle()
        return result
    }

    isHomePage(url: string) {
        return url.includes("user");
    }

    async resolveVideoPageFromAny(anyURL: string) {
        let pooledPage: PoolPage
        try {
            pooledPage = await this.openPage(anyURL)
            if (!pooledPage.getPage()) {
                throw new Error(`failed to open ${anyURL}`)
            }
        } catch (err) {
            throw err
        }

        const page = pooledPage.getPage()
        const isHomePage = this.isHomePage(page.url())

        let homePage: PoolPage;

        if (isHomePage) {
            console.log(`${page.url()} is HomePage, skip resolve homePage`);
            homePage = pooledPage;
        } else {
            console.log(`Try to resolving homePage`);
            const homePageURL = await getHomePageURL(page);
            pooledPage.recyle()
            console.log(`Resolving home page at ${homePageURL}`);
            try {
                homePage = await this.openPage(homePageURL);
                if (!homePage) {
                    throw new Error(`failed to open homepage url ${homePageURL}`)
                }
            } catch (err) {
                throw err
            }
        }

        await autoScroll(homePage.getPage());

        const videoURLs: string[] = await getVideoURLs(homePage.getPage());
        homePage.recyle()
        return videoURLs
    }
}