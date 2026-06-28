export function downloadCSV(filename, rows) {
  if (!rows.length) return;
  const headers = Object.keys(rows[0]);
  const csv = [
    headers.join(','),
    ...rows.map((row) =>
      headers.map((header) => `"${String(row[header] ?? '').replace(/"/g, '""')}"`).join(',')
    ),
  ].join('\n');

  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

export function downloadExcel(filename, rows) {
  downloadCSV(filename.replace('.xlsx', '.csv'), rows);
}

export function downloadPDF(title, content) {
  const printWindow = window.open('', '_blank');
  if (!printWindow) return;
  printWindow.document.write(`
    <html>
      <head><title>${title}</title></head>
      <body style="font-family: Arial, sans-serif; padding: 24px;">
        <h1>${title}</h1>
        <pre style="white-space: pre-wrap;">${content}</pre>
      </body>
    </html>
  `);
  printWindow.document.close();
  printWindow.print();
}
