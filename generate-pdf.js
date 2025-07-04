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
    // Set a viewport that triggers the desktop layout
    await page.setViewport({ width: 1920, height: 1080 });

    // Navigate to the local HTML file
    await page.goto(`file://${htmlFilePath}`, {
      waitUntil: 'networkidle0',
    })

    // Get the full height of the page content
    const bodyHeight = await page.evaluate(() => document.body.scrollHeight);

    // Define target PDF dimensions (e.g., 16:9 aspect ratio)
    const pdfWidth = 1920;
    const pdfHeight = 1080;

    // Calculate the scale factor to fit the content height into the PDF height
    // Clamp the scale to be within puppeteer's allowed range [0.1, 2]
    const scale = Math.max(0.1, Math.min(2, pdfHeight / bodyHeight));

    // Generate PDF with fixed dimensions and scaling
    await page.pdf({
      path: pdfPath,
      width: `${pdfWidth}px`,
      height: `${pdfHeight}px`,
      scale: scale,
      printBackground: true,
      margin: {
        top: '0px',
        right: '0px',
        bottom: '0px',
        left: '0px',
      },
    })

    console.log(`PDF successfully generated at ${pdfPath}`)
  } catch (error) {
    console.error('Error generating PDF:', error)
    process.exit(1)
  } finally {
    await browser.close()
  }
})()