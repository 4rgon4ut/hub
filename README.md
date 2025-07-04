https://4rgon4ut.github.io/hub/

## Deployment

This repository has a CI/CD workflow that automatically generates a PDF and deploys the website to the `deploy` branch.

- **Push to `main`**: All development work should be pushed to the `main` branch.
- **CI/CD**: A GitHub Action will trigger on every push to `main`. It will:
    1. Install dependencies.
    2. Run `node generate-pdf.js` to create the PDF.
    3. Deploy the entire project, including the new PDF, to the `deploy` branch.
- **GitHub Pages**: The live website is served from the `deploy` branch.