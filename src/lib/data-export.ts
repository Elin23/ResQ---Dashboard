export interface ExportColumn<T> {
  label: string;
  value: (row: T) => string | number | null | undefined;
}

export interface ExportTableOptions<T> {
  title: string;
  fileName: string;
  columns: Array<ExportColumn<T>>;
  rows: T[];
  subtitle?: string;
}

const PDF_ROWS_PER_PAGE = 18;

function safeCell(value: unknown): string {
  if (value === null || value === undefined) {
    return '';
  }

  return String(value);
}

function downloadBlob(blob: Blob, fileName: string) {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');

  anchor.href = url;
  anchor.download = fileName;

  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();

  window.setTimeout(() => URL.revokeObjectURL(url), 0);
}

function escapeHtml(value: string): string {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

function chunkRows<T>(rows: T[], size: number): T[][] {
  if (rows.length === 0) {
    return [[]];
  }

  const pages: T[][] = [];

  for (let index = 0; index < rows.length; index += size) {
    pages.push(rows.slice(index, index + size));
  }

  return pages;
}

function createPdfPageMarkup<T>({ title, subtitle, columns, rows, generatedAt, pageNumber, pageCount }: ExportTableOptions<T> & { generatedAt: string; pageNumber: number; pageCount: number }) {
  const tableRows = rows
    .map(
      (row) =>
        `<tr>${columns
          .map(
            (column) =>
              `<td style="border-bottom:1px solid #ece8e3;padding:12px 10px;text-align:right;vertical-align:middle;font-size:13px;line-height:1.7">${escapeHtml(safeCell(column.value(row)))}</td>`,
          )
          .join('')}</tr>`,
    )
    .join('');

  return `
    <div style="display:flex;align-items:center;justify-content:space-between;border-bottom:3px solid #f58220;padding-bottom:18px;margin-bottom:24px">
      <div><div style="font-size:26px;font-weight:700;color:#f58220">ResQ</div><div style="font-size:12px;color:#777;margin-top:3px">لوحة الإدارة</div></div>
      <div style="text-align:left;font-size:12px;color:#777">${escapeHtml(generatedAt)}</div>
    </div>
    <h1 style="font-size:24px;margin:0;font-weight:700">${escapeHtml(title)}</h1>
    ${subtitle ? `<p style="font-size:13px;line-height:1.8;color:#666;margin:8px 0 0">${escapeHtml(subtitle)}</p>` : ''}
    <table style="width:100%;border-collapse:collapse;margin-top:26px;direction:rtl;table-layout:auto">
      <thead><tr>${columns
        .map(
          (column) =>
            `<th style="background:#faf7f3;border-bottom:1px solid #e6ded6;padding:12px 10px;text-align:right;font-size:13px;font-weight:600;white-space:nowrap">${escapeHtml(column.label)}</th>`,
        )
        .join('')}</tr></thead>
      <tbody>${tableRows || `<tr><td colspan="${columns.length}" style="padding:30px;text-align:center;color:#777">لا توجد بيانات ضمن النتائج الحالية.</td></tr>`}</tbody>
    </table>
    <div style="display:flex;align-items:center;justify-content:space-between;margin-top:30px;border-top:1px solid #eee;padding-top:12px;font-size:11px;color:#999">
      <span>تم إنشاء هذا المستند من لوحة إدارة ResQ.</span>
      <span>${pageNumber} / ${pageCount}</span>
    </div>
  `;
}

export function exportTableToExcel<T>({ title, fileName, columns, rows, subtitle }: ExportTableOptions<T>) {
  const header = columns
    .map((column) => `<th>${escapeHtml(column.label)}</th>`)
    .join('');

  const body = rows
    .map(
      (row) =>
        `<tr>${columns
          .map((column) => `<td>${escapeHtml(safeCell(column.value(row)))}</td>`)
          .join('')}</tr>`,
    )
    .join('');

  const html = `\ufeff<!doctype html><html dir="rtl"><head><meta charset="utf-8"><style>body{font-family:Arial,sans-serif;direction:rtl}h1{font-size:18px}p{font-size:12px;color:#666}table{border-collapse:collapse;width:100%;margin-top:16px}th,td{border:1px solid #ddd;padding:8px;text-align:right;vertical-align:middle;font-size:12px}th{background:#f6f6f6;font-weight:600}</style></head><body><h1>${escapeHtml(title)}</h1>${subtitle ? `<p>${escapeHtml(subtitle)}</p>` : ''}<table><thead><tr>${header}</tr></thead><tbody>${body}</tbody></table></body></html>`;

  downloadBlob(
    new Blob([html], {
      type: 'application/vnd.ms-excel;charset=utf-8',
    }),
    `${fileName}.xls`,
  );
}

export async function exportTableToPdf<T>({ title, fileName, columns, rows, subtitle }: ExportTableOptions<T>) {
  const [{ default: html2canvas }, { jsPDF }] = await Promise.all([
    import('html2canvas'),
    import('jspdf'),
  ]);

  const pages = chunkRows(rows, PDF_ROWS_PER_PAGE);
  const generatedAt = new Intl.DateTimeFormat('ar-SY-u-nu-latn', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date());

  const pdf = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
    compress: true,
  });

  // Render bounded page-sized tables so rows are not split by one oversized screenshot.
  for (const [index, pageRows] of pages.entries()) {
    const host = document.createElement('div');

    host.dir = 'rtl';
    host.style.position = 'fixed';
    host.style.insetInlineStart = '-10000px';
    host.style.top = '0';
    host.style.width = '1120px';
    host.style.background = '#fff';
    host.style.color = '#1f1f1f';
    host.style.padding = '46px';
    host.style.fontFamily = 'Tajawal, Arial, sans-serif';
    host.style.boxSizing = 'border-box';
    host.innerHTML = createPdfPageMarkup({
      title,
      fileName,
      columns,
      rows: pageRows,
      subtitle,
      generatedAt,
      pageNumber: index + 1,
      pageCount: pages.length,
    });

    document.body.appendChild(host);

    try {
      const canvas = await html2canvas(host, {
        scale: 1.5,
        backgroundColor: '#ffffff',
        useCORS: true,
        logging: false,
      });

      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const imageWidth = pageWidth;
      const imageHeight = Math.min((canvas.height * imageWidth) / canvas.width, pageHeight);
      const image = canvas.toDataURL('image/jpeg', 0.93);

      if (index > 0) {
        pdf.addPage();
      }

      pdf.addImage(image, 'JPEG', 0, 0, imageWidth, imageHeight, undefined, 'FAST');
    } finally {
      host.remove();
    }
  }

  pdf.save(`${fileName}.pdf`);
}
