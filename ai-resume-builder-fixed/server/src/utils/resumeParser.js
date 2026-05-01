import * as pdfjsLib from 'pdfjs-dist/legacy/build/pdf.mjs';

const extractTextFromPdf = async (buffer) => {
  try {
    const uint8Array = new Uint8Array(buffer);

    const loadingTask = pdfjsLib.getDocument({
      data: uint8Array,
      useWorkerFetch: false,
      isEvalSupported: false,
      useSystemFonts: true,
      verbosity: 0, // suppress pdfjs internal warnings
    });

    const pdfDocument = await loadingTask.promise;
    let fullText = '';

    for (let pageNum = 1; pageNum <= pdfDocument.numPages; pageNum++) {
      try {
        const page = await pdfDocument.getPage(pageNum);
        const textContent = await page.getTextContent();
        const pageText = textContent.items
          .filter(item => item.str && item.str.trim())
          .map(item => item.str)
          .join(' ');
        fullText += pageText + '\n';
      } catch (pageError) {
        console.warn(`Warning: Could not read page ${pageNum}:`, pageError.message);
        // continue to next page
      }
    }

    const cleaned = fullText.trim();

    if (!cleaned) {
      throw new Error('No text could be extracted. The PDF may be image-based or scanned.');
    }

    return cleaned;
  } catch (error) {
    // Log the REAL error on the server so we can debug
    console.error('PDF parse REAL error:', error.message, error.stack);
    throw new Error(`Failed to read PDF: ${error.message}`);
  }
};

export default extractTextFromPdf;