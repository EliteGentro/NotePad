export async function downloadFile(filename: string, content: string, type: 'text/plain' | 'text/markdown') {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export async function exportToPdf(elementId: string, filename: string) {
  const element = document.getElementById(elementId);
  if (!element) {
    console.error(`Element with id ${elementId} not found`);
    return;
  }
  
  try {
    // Dynamic import to avoid bundling it with main chunk
    const html2pdf = (await import('html2pdf.js')).default;
    
    // We add a temporary wrapper class for PDF rendering
    const originalClass = element.className;
    // adding generic styling class for the print
    element.classList.add('prose', 'max-w-none');
    
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
    
    // Restore
    element.className = originalClass;
  } catch (err) {
    console.error("PDF generation failed:", err);
  }
}
