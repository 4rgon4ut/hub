const puppeteer = require('puppeteer')
const path = require('path')
const fs = require('fs')

  ; (async () => {
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

    // --- START OF MODIFICATIONS ---

    // Define the target width for the PDF to match the reference file's aspect ratio.
    // Using a consistent variable makes it easy to adjust and ensures synchronization.
    // 1440px is a good, high-quality width for a screen-optimized resume.
    const pdfTargetWidth = 1440;

    try {
      // Set the viewport to the exact width of our target PDF. This ensures
      // the webpage's CSS renders the layout correctly for our final dimensions.
      // The height is a placeholder; the PDF height will be determined by content.
      await page.setViewport({ width: pdfTargetWidth, height: 1050 });

      // Navigate to the local HTML file
      await page.goto(`file://${htmlFilePath}`, {
        waitUntil: 'networkidle0',
      })

      // Generate the PDF with settings synchronized to the viewport for a 1:1 output.
      await page.pdf({
        path: pdfPath,
        // Set the PDF page width to match the viewport width.
        width: `${pdfTargetWidth}px`,
        // Set scale to 1. This is crucial for a direct, unscaled mapping
        // from the browser rendering to the PDF document.
        scale: 1,
        // Ensure background graphics are included, as in the reference PDF.
        printBackground: true,
        // Remove all margins to match the reference PDF's edge-to-edge design.
        margin: {
          top: '0px',
          right: '0px',
          bottom: '0px',
          left: '0px',
        },
        // By not specifying a height, Puppeteer creates a single page that
        // is exactly tall enough to fit all the content.
      })

      // --- END OF MODIFICATIONS ---

      console.log(`PDF successfully generated at ${pdfPath}`)
    } catch (error) {
      console.error('Error generating PDF:', error)
      process.exit(1)
    } finally {
      await browser.close()
    }
  })()
