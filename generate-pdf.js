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
    const pdfTargetWidth = 700;

    try {
      // Set the viewport to the exact width of our target PDF. This ensures
      // the webpage's CSS renders the layout correctly for our final dimensions.
      // The height is a placeholder; the PDF height will be determined by content.
      await page.setViewport({ width: pdfTargetWidth, height: 1050 });

      // Navigate to the local HTML file
      await page.goto(`file://${htmlFilePath}`, {
        waitUntil: 'networkidle0',
      })

      // Set a fixed width for the body to control the content area
      await page.evaluate(() => {
        document.body.style.width = '700px';
        document.body.style.margin = '0 auto';
      });

      // Get the full height of the page content
      const bodyHeight = await page.evaluate(() => document.body.scrollHeight);

      // Define target PDF dimensions
      const pdfHeight = 1080;

      // Calculate the scale factor to fit the content height into the PDF height
      const scale = pdfHeight / bodyHeight;

      // Generate PDF with fixed dimensions and scaling
      await page.pdf({
        path: pdfPath,
        width: `${pdfTargetWidth}px`,
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

      // --- END OF MODIFICATIONS ---

      console.log(`PDF successfully generated at ${pdfPath}`)
    } catch (error) {
      console.error('Error generating PDF:', error)
      process.exit(1)
    } finally {
      await browser.close()
    }
  })()
