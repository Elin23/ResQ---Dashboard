export async function exportElementToPdf(element: HTMLElement, fileName: string) {
  const [{ default: html2canvas }, { jsPDF }] = await Promise.all([
    import('html2canvas'),
    import('jspdf'),
  ]);

  await document.fonts?.ready;
  const canvas = await html2canvas(element, {
    scale: 2,
    backgroundColor: '#ffffff',
    useCORS: true,
    logging: false,
    windowWidth: element.scrollWidth,
    windowHeight: element.scrollHeight,
  });

  const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4', compress: true });
  const pageWidth = 210;
  const pageHeight = 297;
  const margin = 10;
  const contentWidth = pageWidth - margin * 2;
  const contentHeight = pageHeight - margin * 2;
  const pxPerMm = canvas.width / contentWidth;
  const pageHeightPx = Math.floor(contentHeight * pxPerMm);
  let offset = 0;
  let page = 0;

  while (offset < canvas.height) {
    const sliceHeight = Math.min(pageHeightPx, canvas.height - offset);
    const pageCanvas = document.createElement('canvas');
    pageCanvas.width = canvas.width;
    pageCanvas.height = sliceHeight;
    const context = pageCanvas.getContext('2d');
    if (!context) throw new Error('PDF_CANVAS_CONTEXT_UNAVAILABLE');
    context.fillStyle = '#ffffff';
    context.fillRect(0, 0, pageCanvas.width, pageCanvas.height);
    context.drawImage(canvas, 0, offset, canvas.width, sliceHeight, 0, 0, canvas.width, sliceHeight);
    if (page > 0) pdf.addPage();
    const sliceHeightMm = sliceHeight / pxPerMm;
    pdf.addImage(pageCanvas.toDataURL('image/jpeg', 0.94), 'JPEG', margin, margin, contentWidth, sliceHeightMm, undefined, 'FAST');
    offset += sliceHeight;
    page += 1;
  }

  pdf.save(fileName.endsWith('.pdf') ? fileName : `${fileName}.pdf`);
}
