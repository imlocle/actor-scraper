async function pageFunction(context) {
    const { request, log, skipLinks, page } = context; // page is Puppeteer's page

    if (request.userData.label === 'START') {
        log.info('Store opened!');
        // Do some stuff later.
    }
    if (request.userData.label === 'DETAIL') {
        const { url } = request;
        log.info(`Scraping ${url}`);
        await skipLinks();

        // Do some scraping.
        const uniqueIdentifier = url.split('/').slice(-2).join('/');
        const $wrapper = await page.$('header div.wrap');

        // Get attributes in parallel to speed up the process.
        const titleP = $wrapper.$eval('h1', (el => el.textContent));
        const descriptionP = $wrapper.$eval('p', (el => el.textContent));
        const lastRunTimestampP = $wrapper.$$eval('time', (els) => els[1].getAttribute('datetime'));
        const runCountTextP = $wrapper.$eval('div.stats > span:nth-of-type(3)', (el => el.textContent));

        const [title, description, lastRunTimestamp, runCountText] = await Promise.all([titleP, descriptionP, lastRunTimestampP, runCountTextP]);

        const lastRunDate = new Date(Number(lastRunTimestamp));
        const runCount = Number(runCountText.match(/\d+/)[0]);

        return {
            url,
            uniqueIdentifier,
            title,
            description,
            lastRunDate,
            runCount,
        };
    }
}
