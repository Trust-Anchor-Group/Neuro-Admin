import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import {
  getAdminOrderId,
  isAdminOrderId,
  isAdminOrderPaid,
  unwrapAdminOrders,
} from '../src/lib/adminOrders.mjs';

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const readProjectFile = (relativePath) => readFile(path.join(projectRoot, relativePath), 'utf8');

test('normalizes supported Innova order envelopes and payment fields', () => {
  const id = '243f2b8f-f4ac-4abe-8f33-cc14bf73ce0f';
  const orders = unwrapAdminOrders({ data: { data: [{ order_id: id, paid: false }, { id: 'second', payment_status: 'paid' }] } });
  assert.equal(orders.length, 2);
  assert.equal(getAdminOrderId(orders[0]), id);
  assert.equal(isAdminOrderPaid(orders[0]), false);
  assert.equal(isAdminOrderPaid(orders[1]), true);
  assert.equal(isAdminOrderId(id), true);
  assert.equal(isAdminOrderId('not-an-order-id'), false);
});

test('order BFF maps only to the fixed list and paid endpoints using active server context', async () => {
  const [listRoute, paidRoute, page, layout] = await Promise.all([
    readProjectFile('src/app/api/orders/route.js'),
    readProjectFile('src/app/api/orders/[orderId]/paid/route.js'),
    readProjectFile('src/app/(dashboard)/neuro-assets/Orders/page.js'),
    readProjectFile('src/app/(dashboard)/neuro-assets/layout.jsx'),
  ]);

  assert.match(listRoute, /getActiveNeuronContext\(request\)/);
  assert.match(listRoute, /\/nex-api-admin\/order/);
  assert.match(paidRoute, /isAdminOrderId\(orderId\)/);
  assert.match(paidRoute, /\/nex-api-admin\/order\/\$\{encodeURIComponent\(orderId\)\}\/paid/);
  assert.doesNotMatch(page, /Authorization|localStorage|sessionStorage/);
  assert.match(page, /window\.confirm/);
  assert.match(page, /await loadOrders\(\)/);
  assert.match(layout, /href: "\/neuro-assets\/Orders"/);
});
