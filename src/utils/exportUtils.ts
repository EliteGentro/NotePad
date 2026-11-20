export function downloadFile(filename: string, content: string, type: 'text/plain' | 'text/markdown') {
  const blob = new Blob([content], { type: `${type};charset=utf-8` });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  // Revoke on the next tick: some browsers start the download asynchronously.
  setTimeout(() => URL.revokeObjectURL(url), 0);
}

/** Class that forces light-theme colors on the exported element (see index.css). */
const PDF_EXPORT_CLASS = 'pdf-export';

export async function exportToPdf(elementId: string, filename: string) {
  const element = document.getElementById(elementId);
  if (!element) {
    console.error(`Element with id ${elementId} not found`);
    return;
  }

  try {
    // Dynamic import to avoid bundling it with main chunk
    const html2pdf = (await import('html2pdf.js')).default;

    // Render with light colors even in dark mode, so the PDF prints as dark text on white.
    element.classList.add(PDF_EXPORT_CLASS);

    const opt = {
      margin: [15, 15, 15, 15] as [number, number, number, number],
      filename: filename,
      image: { type: 'jpeg' as const, quality: 0.98 },
      html2canvas: {
        scale: 2,
        useCORS: true,
        letterRendering: true
      },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' as const }
    };

    await html2pdf().from(element).set(opt).save();
  } catch (err) {
    console.error("PDF generation failed:", err);
  } finally {
    element.classList.remove(PDF_EXPORT_CLASS);
  }
}
