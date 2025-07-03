const puppeteer = require('puppeteer')
const path = require('path')
const fs = require('fs')

;(async () => {
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage'],
  })
  const page = await browser.newPage()

  // Construct the absolute path to index.html
  const htmlFilePath = path.resolve(__dirname, 'index.html')

  // Ensure the assets directory exists
  const assetsDir = path.resolve(__dirname, 'assets')
  if (!fs.existsSync(assetsDir)) {
    fs.mkdirSync(assetsDir, { recursive: true })
  }

  const pdfPath = path.resolve(assetsDir, '4rgon4ut.pdf')

  try {
    // Navigate to the local HTML file
    await page.goto(`file://${htmlFilePath}`, {
      waitUntil: 'networkidle0', // Waits for network activity to be idle
    })

    // Get the dimensions of the page to generate a single-page PDF
    const dimensions = await page.evaluate(() => {
      const body = document.body;
      const html = document.documentElement;
      const height = Math.max(body.scrollHeight, body.offsetHeight, html.clientHeight, html.scrollHeight, html.offsetHeight);
      const width = Math.max(body.scrollWidth, body.offsetWidth, html.clientWidth, html.scrollWidth, html.offsetWidth);
      return { width, height };
    });

    // Generate PDF with custom dimensions
    await page.pdf({
      path: pdfPath,
      width: `${dimensions.width}px`,
      height: `${dimensions.height}px`,
      printBackground: true,
      margin: {
        top: '20px',
        right: '20px',
        bottom: '20px',
        left: '20px',
      },
    })

    console.log(`PDF successfully generated at ${pdfPath}`)
  } catch (error) {
    console.error('Error generating PDF:', error)
    process.exit(1) // Exit with error code
  } finally {
    await browser.close()
  }
})()
