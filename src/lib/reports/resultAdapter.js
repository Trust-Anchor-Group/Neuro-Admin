export function formatReportCell(cell) {
  if (cell === null || typeof cell !== 'object') return String(cell ?? '');
  if (cell.Type === 'Quantity' || cell.Type === 'Measurement') {
    return `${cell.Magnitude ?? ''}${cell.Unit ? ` ${cell.Unit}` : ''}${cell.Type === 'Measurement' && cell.Error !== undefined ? ` ± ${cell.Error}` : ''}`;
  }
  if (cell.Type === 'EncodedObject') return `[${cell.ContentType || 'encoded object'}]`;
  return JSON.stringify(cell);
}

export function adaptReportResult(result) {
  const adaptItem = (item) => {
    if (item?.Type === 'Section') return { kind: 'section', title: item.Header || '', children: (item.Items || []).map(adaptItem) };
    if (item?.Type === 'Table') return { kind: 'table', table: item };
    if (item?.Type === 'Message') return { kind: 'message', level: item.Level || 'info', text: item.Text || '' };
    if (item?.Type === 'Object') return { kind: 'object', contentType: item.ContentType || 'unknown', base64: item.Base64 || '' };
    return { kind: 'unknown', value: item };
  };
  return (result?.Sections || []).map(adaptItem);
}
