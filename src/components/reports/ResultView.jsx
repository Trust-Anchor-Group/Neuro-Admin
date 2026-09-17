'use client';

import { adaptReportResult, formatReportCell } from '@/lib/reports/resultAdapter';

function decodeBase64(base64) {
  try { return new TextDecoder().decode(Uint8Array.from(atob(base64), (char) => char.charCodeAt(0))); } catch { return ''; }
}

function Node({ node }) {
  if (node.kind === 'section') return <section className="space-y-3"><h4 className="text-base font-semibold">{node.title}</h4><div className="space-y-3 border-l-2 border-[var(--brand-border)] pl-4">{node.children.map((child, index) => <Node key={index} node={child} />)}</div></section>;
  if (node.kind === 'table') return <div className="overflow-x-auto"><h5 className="mb-2 font-medium">{node.table.Name || 'Table'}</h5><table className="min-w-full text-left text-sm"><thead><tr>{(node.table.Columns || []).map((column) => <th key={column.Id} className="border-b border-[var(--brand-border)] px-2 py-2">{column.Header || column.Id}</th>)}</tr></thead><tbody>{(node.table.Records || []).map((record, row) => <tr key={row}>{record.map((cell, column) => <td key={column} className="border-b border-[var(--brand-border)] px-2 py-2">{formatReportCell(cell)}</td>)}</tr>)}</tbody></table></div>;
  if (node.kind === 'message') return <p className="text-sm text-[var(--brand-text-secondary)]">{node.text}</p>;
  if (node.kind === 'object' && node.contentType.toLowerCase().startsWith('image/')) return <img src={`data:${node.contentType};base64,${node.base64}`} alt="Report visualization" className="max-w-full rounded-lg" />;
  if (node.kind === 'object' && node.contentType.toLowerCase() === 'text/markdown') return <pre className="whitespace-pre-wrap text-sm">{decodeBase64(node.base64)}</pre>;
  return <pre className="overflow-auto rounded-lg bg-black/5 p-3 text-xs">{JSON.stringify(node.value || node, null, 2)}</pre>;
}

export default function ResultView({ result }) {
  const nodes = adaptReportResult(result);
  return <div className="space-y-5">{nodes.length ? nodes.map((node, index) => <Node key={index} node={node} />) : <p className="text-sm text-[var(--brand-text-secondary)]">The report completed without renderable sections. Inspect raw JSON below.</p>}</div>;
}
