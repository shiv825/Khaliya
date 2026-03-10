import puppeteer from 'puppeteer';

(async () => {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();

    // Set viewport to a typical desktop size
    await page.setViewport({ width: 1920, height: 1080 });

    await page.goto('http://localhost:5173/');

    // Wait for the React app to render the NativeAppShell elements
    await page.waitForSelector('.native-app-shell', { timeout: 5000 }).catch(() => console.log('Timeout waiting for .native-app-shell'));

    // Get the outer HTML of the body
    const bodyHtml = await page.evaluate(() => document.body.outerHTML);
    console.log(bodyHtml.substring(0, 3000)); // Print first 3000 chars to check structure

    await browser.close();
})();
