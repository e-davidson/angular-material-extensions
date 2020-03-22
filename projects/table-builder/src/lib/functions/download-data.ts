export function downloadData(data: string, filename: string, mimeType: string) {
  const url = URL.createObjectURL(new Blob([data], { type: mimeType }));
  const downloadLink = document.createElement('a');
  downloadLink.download = filename;
  downloadLink.href = url;
  downloadLink.style.display = 'none';
  document.body.appendChild(downloadLink);
  downloadLink.click();
  document.body.removeChild(downloadLink);
  URL.revokeObjectURL(url);
}
