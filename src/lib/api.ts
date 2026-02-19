// Product Studio API & utilities: CRUD, bulk ops, import/export (CSV/XLSX), and helpers
// Next.js App Router endpoints assumed:
//  - GET/POST   /api/products
//  - PATCH/DELETE /api/product/[sku]
//  - POST       /api/products/bulk        (optional: bulk upsert/stock updates)
//  - POST       /api/import?type=csv|xlsx (optional: server-side import)
//  - GET        /api/export?format=csv|xlsx (optional: server-side export)

import type { Product } from './types';

export type ApiOk<T> = { ok: true; data: T };
export type ApiErr = { ok: false; error: string };
export type ApiResp<T> = ApiOk<T> | ApiErr;

// -------------------------
// Core JSON handling
// -------------------------
async function parseJson<T>(res: Response): Promise<T> {
  let json: any = null;
  try {
    json = await res.json();
  } catch (_) {
    throw new Error('Invalid server response');
  }
  if (!res.ok || !json?.ok) {
    throw new Error(json?.error ?? `Request failed (${res.status})`);
  }
  return json.data as T;
}

// -------------------------
// CRUD
// -------------------------
export async function fetchProducts(): Promise<Product[]> {
  const res = await fetch('/api/products', { cache: 'no-store' });
  return parseJson<Product[]>(res);
}

export async function createProduct(p: Product): Promise<Product> {
  const res = await fetch('/api/products', {
    method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(p),
  });
  return parseJson<Product>(res);
}

export async function updateProduct(sku: string, patch: Partial<Product>): Promise<Product> {
  const res = await fetch(`/api/product/${encodeURIComponent(sku)}`, {
    method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(patch),
  });
  return parseJson<Product>(res);
}

export async function deleteProduct(sku: string): Promise<void> {
  const res = await fetch(`/api/product/${encodeURIComponent(sku)}`, { method: 'DELETE' });
  await parseJson<unknown>(res);
}

// -------------------------
// Bulk operations (server-side endpoints recommended)
// -------------------------
export type StockUpdate = { sku: string; quantity?: number; delta?: number };

/**
 * Bulk stock update.
 * Server should handle mode per item: if `quantity` present => set, if `delta` present => increment.
 */
export async function bulkUpdateStock(updates: StockUpdate[]): Promise<Product[]> {
  const res = await fetch('/api/products/bulk', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ kind: 'stock', updates }),
  });
  return parseJson<Product[]>(res);
}

/** Bulk upsert products (create if missing, update if exists by SKU). */
export async function bulkUpsertProducts(products: Product[]): Promise<Product[]> {
  const res = await fetch('/api/products/bulk', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ kind: 'upsert', products }),
  });
  return parseJson<Product[]>(res);
}

// -------------------------
// Import (CSV/XLSX)
// -------------------------
/**
 * Upload CSV to server for import. The server should parse & persist.
 * Returns number of imported/updated rows (server-defined response).
 */
export async function uploadInventoryCSV(file: File): Promise<any> {
  const fd = new FormData();
  fd.append('file', file);
  const res = await fetch('/api/import?type=csv', { method: 'POST', body: fd });
  return parseJson<any>(res);
}

/** Upload Excel (XLSX) to server for import. */
export async function uploadInventoryXLSX(file: File): Promise<any> {
  const fd = new FormData();
  fd.append('file', file);
  const res = await fetch('/api/import?type=xlsx', { method: 'POST', body: fd });
  return parseJson<any>(res);
}

// -------------------------
// Client-side CSV helpers (no external libs)
// -------------------------
const ARRAY_SEP = ' | '; // used to join arrays in CSV
const SPEC_SEP = '; ';
const SPEC_KV_SEP = ':';

function csvEscape(s: string): string {
  if (s == null) return '';
  const mustQuote = /[",\n]/.test(s);
  const q = '"' + s.replace(/"/g, '""') + '"';
  return mustQuote ? q : s;
}

function toRow(p: Product): Record<string, string> {
  const specs = p.specs ? Object.entries(p.specs).map(([k,v]) => `${k}${SPEC_KV_SEP}${v}`).join(SPEC_SEP) : '';
  return {
    sku: p.sku,
    name: p.name ?? '',
    description: p.description ?? '',
    barcode: p.barcode ?? '',
    category: p.category ?? '',
    features: (p.features ?? []).join(ARRAY_SEP),
    uses: (p.uses ?? []).join(ARRAY_SEP),
    instructions: (p.instructions ?? []).join(ARRAY_SEP),
    image: p.image ?? '',
    gallery: (p.gallery ?? []).join(ARRAY_SEP),
    videoUrl: p.videoUrl ?? '',
    specs,
    stock_quantity: String(p.stock?.quantity ?? ''),
    stock_minThreshold: String(p.stock?.minThreshold ?? ''),
    stock_unit: p.stock?.unit ?? '',
    stock_location: p.stock?.location ?? '',
    stock_supplier: p.stock?.supplier ?? '',
    stock_price: p.stock?.price != null ? String(p.stock?.price) : '',
    stock_currency: p.stock?.currency ?? '',
  };
}

/** Convert Product[] to CSV string. */
export function generateCSV(products: Product[]): string {
  const headers = [
    'sku','name','description','barcode','category',
    'features','uses','instructions','image','gallery','videoUrl','specs',
    'stock_quantity','stock_minThreshold','stock_unit','stock_location','stock_supplier','stock_price','stock_currency'
  ];
  const lines: string[] = [headers.join(',')];
  for (const p of products) {
    const row = toRow(p);
    lines.push(headers.map(h => csvEscape(row[h] ?? '')).join(','));
  }
  return lines.join('\n');
}

/** Trigger download of data on client. */
export function downloadBlob(data: Blob, filename: string) {
  if (typeof window === 'undefined') return; // SSR guard
  const url = URL.createObjectURL(data);
  const a = document.createElement('a');
  a.href = url; a.download = filename; a.style.display = 'none';
  document.body.appendChild(a); a.click();
  setTimeout(() => { document.body.removeChild(a); URL.revokeObjectURL(url); }, 0);
}

/** Export via server route, or fall back to client-side CSV generation. */
export async function exportInventory(format: 'csv'|'xlsx', productsFallback?: Product[]) {
  try {
    const res = await fetch(`/api/export?format=${encodeURIComponent(format)}`, { method: 'GET' });
    if (!res.ok) throw new Error('export route not available');
    const blob = await res.blob();
    const filename = `inventory.${format}`;
    downloadBlob(blob, filename);
  } catch {
    if (format === 'csv' && productsFallback) {
      const csv = generateCSV(productsFallback);
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
      downloadBlob(blob, 'inventory.csv');
    } else {
      throw new Error('Export failed: server route missing and no fallback data provided');
    }
  }
}

// -------------------------
// CSV parsing (simple, supports quoted fields)
// -------------------------
function parseCSV(text: string): string[][] {
  const rows: string[][] = [];
  let i = 0, field = '', row: string[] = [], inQuotes = false;
  while (i < text.length) {
    const c = text[i++];
    if (inQuotes) {
      if (c === '"') {
        if (text[i] === '"') { field += '"'; i++; } else { inQuotes = false; }
      } else { field += c; }
    } else {
      if (c === '"') inQuotes = true;
      else if (c === ',') { row.push(field); field = ''; }
      else if (c === '\n' || c === '\r') {
        if (c === '\r' && text[i] === '\n') i++; // CRLF
        row.push(field); field = ''; if (row.length) rows.push(row); row = [];
      } else { field += c; }
    }
  }
  if (field.length > 0 || row.length) { row.push(field); rows.push(row); }
  return rows.filter(r => r.length > 1 || (r.length === 1 && r[0].trim() !== ''));
}

function splitArrayCell(v: string): string[] {
  const s = v?.trim();
  if (!s) return [];
  return s.split(ARRAY_SEP).map(x => x.trim()).filter(Boolean);
}

function parseSpecsCell(v: string | undefined): Record<string,string> | undefined {
  const s = v?.trim(); if (!s) return undefined;
  const out: Record<string,string> = {};
  for (const pair of s.split(SPEC_SEP)) {
    const idx = pair.indexOf(SPEC_KV_SEP);
    if (idx > 0) {
      const k = pair.slice(0, idx).trim();
      const val = pair.slice(idx + SPEC_KV_SEP.length).trim();
      if (k) out[k] = val;
    }
  }
  return Object.keys(out).length ? out : undefined;
}

/** Convert a CSV string to Product[] (best-effort). */
export function parseProductsCSV(csv: string): Product[] {
  const rows = parseCSV(csv);
  if (!rows.length) return [];
  const header = rows[0].map(h => h.trim());
  const idx = (name: string) => header.indexOf(name);

  const iSku = idx('sku');
  const iName = idx('name');
  const iDesc = idx('description');
  const iBarcode = idx('barcode');
  const iCategory = idx('category');
  const iFeatures = idx('features');
  const iUses = idx('uses');
  const iInstr = idx('instructions');
  const iImage = idx('image');
  const iGallery = idx('gallery');
  const iVideo = idx('videoUrl');
  const iSpecs = idx('specs');
  const iSQ = idx('stock_quantity');
  const iSM = idx('stock_minThreshold');
  const iSU = idx('stock_unit');
  const iSL = idx('stock_location');
  const iSS = idx('stock_supplier');
  const iSP = idx('stock_price');
  const iSC = idx('stock_currency');

  const out: Product[] = [];
  for (let r = 1; r < rows.length; r++) {
    const row = rows[r];
    const get = (i: number) => (i >= 0 && i < row.length ? row[i] : '').trim();
    const sku = get(iSku);
    if (!sku) continue;
    const quantity = Number(get(iSQ));
    const price = Number(get(iSP));
    const product: Product = {
      sku,
      name: get(iName) || sku,
      description: get(iDesc) || '',
      barcode: get(iBarcode) || undefined,
      category: get(iCategory) || undefined,
      features: splitArrayCell(get(iFeatures)),
      uses: splitArrayCell(get(iUses)),
      instructions: splitArrayCell(get(iInstr)),
      image: get(iImage) || '/products/default.png',
      gallery: splitArrayCell(get(iGallery)),
      videoUrl: get(iVideo) || undefined,
      specs: parseSpecsCell(get(iSpecs)),
      stock: {
        quantity: isFinite(quantity) ? quantity : 0,
        minThreshold: Number(get(iSM)) || 0,
        unit: get(iSU) || undefined,
        location: get(iSL) || undefined,
        supplier: get(iSS) || undefined,
        price: isFinite(price) ? price : undefined,
        currency: get(iSC) || undefined,
      },
      lastUpdated: new Date().toISOString(),
    };
    out.push(product);
  }
  return out;
}

// -------------------------
// Export via client (CSV) – convenience wrapper
// -------------------------
export function exportProductsCSVClient(products: Product[], filename = 'inventory.csv') {
  const csv = generateCSV(products);
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
  downloadBlob(blob, filename);
}

// -------------------------
// Misc helpers
// -------------------------
export function toYouTubeEmbed(url?: string): string | undefined {
  if (!url) return undefined;
  return url.replace('watch?v=', 'embed/').replace('youtu.be/', 'www.youtube.com/embed/');
}

export function upsertLocal(list: Product[], item: Product): Product[] {
  const i = list.findIndex(x => x.sku === item.sku);
  if (i === -1) return [...list, item];
  const next = [...list]; next[i] = item; return next;
}

export function removeLocal(list: Product[], sku: string): Product[] {
  return list.filter(x => x.sku !== sku);
}
