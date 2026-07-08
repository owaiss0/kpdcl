/**
 * Export data to a downloadable CSV file.
 */
export function exportToCSV(data: (string | number)[][], headers: string[], filename: string) {
  const csvContent = [
    headers.join(","),
    ...data.map(row => 
      row.map((val: string | number) => {
        const str = String(val ?? "");
        // Escape quotes
        return `"${str.replace(/"/g, '""')}"`;
      }).join(",")
    )
  ].join("\n");

  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute("download", filename);
  link.style.visibility = "hidden";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

/**
 * Export data to an XML-based Excel file.
 * This opens in Excel with proper gridlines, columns, and styled headers.
 */
export function exportToExcel(data: (string | number)[][], headers: string[], sheetName: string, filename: string) {
  let html = `<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">`;
  html += `<head><meta charset="utf-8"><!--[if gte mso 9]><xml><x:ExcelWorkbook><x:ExcelWorksheets><x:ExcelWorksheet>`;
  html += `<x:Name>${sheetName}</x:Name>`;
  html += `<x:WorksheetOptions><x:DisplayGridlines/></x:WorksheetOptions></x:ExcelWorksheet></x:ExcelWorksheets></x:ExcelWorkbook></xml><![endif]--></head><body>`;
  html += `<table style="border-collapse: collapse; font-family: sans-serif; font-size: 11pt;"><thead><tr>`;
  headers.forEach(h => {
    html += `<th style="background-color: #2563eb; color: #ffffff; font-weight: bold; border: 1px solid #cbd5e1; padding: 6px; text-align: left;">${h}</th>`;
  });
  html += `</tr></thead><tbody>`;
  data.forEach(row => {
    html += `<tr>`;
    row.forEach((val: string | number) => {
      const isNum = typeof val === 'number';
      const align = isNum ? 'right' : 'left';
      html += `<td style="border: 1px solid #e2e8f0; padding: 6px; text-align: ${align};">${val ?? ""}</td>`;
    });
    html += `</tr>`;
  });
  html += `</tbody></table></body></html>`;

  const blob = new Blob([html], { type: "application/vnd.ms-excel" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute("download", filename);
  link.style.visibility = "hidden";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

/**
 * Export data to PDF by launching a clean print statement in a new window.
 */
export function exportToPDF(
  title: string,
  headers: string[],
  data: (string | number)[][],
  consumerInfo: { name: string; id: string; category: string; address: string }
) {
  const printWindow = window.open("", "_blank");
  if (!printWindow) return;

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <title>${title} - ${consumerInfo.id}</title>
        <style>
          body {
            font-family: system-ui, -apple-system, sans-serif;
            color: #1e293b;
            padding: 40px;
            margin: 0;
            line-height: 1.5;
          }
          .header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            border-bottom: 2px solid #2563eb;
            padding-bottom: 20px;
            margin-bottom: 30px;
          }
          .title-area h1 {
            font-size: 24px;
            margin: 0 0 5px 0;
            color: #1e3a8a;
          }
          .title-area p {
            font-size: 12px;
            margin: 0;
            color: #64748b;
          }
          .logo {
            font-size: 20px;
            font-weight: 700;
            color: #2563eb;
          }
          .info-grid {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 15px;
            margin-bottom: 30px;
            background-color: #f8fafc;
            padding: 20px;
            border-radius: 8px;
            border: 1px solid #e2e8f0;
          }
          .info-item {
            font-size: 13px;
          }
          .info-label {
            color: #64748b;
            font-weight: 500;
            margin-bottom: 2px;
          }
          .info-value {
            font-weight: 600;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 20px;
          }
          th {
            background-color: #f1f5f9;
            color: #475569;
            font-weight: 600;
            text-align: left;
            padding: 10px 12px;
            font-size: 12px;
            border-bottom: 2px solid #cbd5e1;
            text-transform: uppercase;
          }
          td {
            padding: 10px 12px;
            font-size: 13px;
            border-bottom: 1px solid #e2e8f0;
          }
          tr:nth-child(even) {
            background-color: #f8fafc;
          }
          .text-right {
            text-align: right;
          }
          .footer {
            margin-top: 50px;
            text-align: center;
            font-size: 11px;
            color: #94a3b8;
            border-top: 1px solid #e2e8f0;
            padding-top: 20px;
          }
          @media print {
            body { padding: 0; }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="title-area">
            <h1>KPDCL Consumer Portal</h1>
            <p>Kashmir Power Distribution Corporation Limited</p>
          </div>
          <div class="logo">
            ⚡ KPDCL Portal
          </div>
        </div>

        <h2 style="font-size: 18px; margin-top: 0; color: #1e293b; border-bottom: 1px solid #e2e8f0; padding-bottom: 8px;">
          ${title}
        </h2>

        <div class="info-grid">
          <div class="info-item">
            <div class="info-label">Consumer Name</div>
            <div class="info-value">${consumerInfo.name}</div>
          </div>
          <div class="info-item">
            <div class="info-label">Consumer Number</div>
            <div class="info-value">${consumerInfo.id}</div>
          </div>
          <div class="info-item">
            <div class="info-label">Connection Category</div>
            <div class="info-value">${consumerInfo.category}</div>
          </div>
          <div class="info-item">
            <div class="info-label">Address</div>
            <div class="info-value">${consumerInfo.address}</div>
          </div>
        </div>

        <table>
          <thead>
            <tr>
              ${headers.map(h => `<th>${h}</th>`).join("")}
            </tr>
          </thead>
          <tbody>
            ${data.map(row => `
              <tr>
                ${row.map(val => {
                  const isNum = typeof val === 'number' || (typeof val === 'string' && /^[+-]?\d+(\.\d+)?$/.test(val));
                  return `<td class="${isNum ? 'text-right' : ''}">${val ?? ""}</td>`;
                }).join("")}
              </tr>
            `).join("")}
          </tbody>
        </table>

        <div class="footer">
          <p>Generated on ${new Date().toLocaleString('en-IN')} &middot; Kashmir Power Distribution Corporation Limited &copy; 2026</p>
          <p>This is a computer-generated statement and does not require a signature.</p>
        </div>

        <script>
          window.onload = function() {
            setTimeout(function() {
              window.print();
            }, 300);
          }
        </script>
      </body>
    </html>
  `;

  printWindow.document.write(html);
  printWindow.document.close();
}
