import test from 'node:test';
import assert from 'node:assert/strict';
import { sameOrigin } from '../src/lib/idAlerts/origin.mjs';

const request = (origin, forwardedHost = 'dev.neuro.services') => ({
  url: 'http://127.0.0.1:8080/api/id-applications/alert/status',
  headers: new Headers({
    ...(origin ? { origin } : {}),
    host: 'neuro-admin-dev.azurewebsites.net',
    'x-forwarded-host': forwardedHost,
    'x-forwarded-proto': 'https',
  }),
});

test('accepts only the configured public browser origin behind Azure', () => {
  const publicOrigin = 'https://dev.neuro.services';
  assert.equal(sameOrigin(request(publicOrigin), publicOrigin), true);
  assert.equal(sameOrigin(request('https://other.example', 'other.example'), publicOrigin), false);
  assert.equal(sameOrigin(request('https://neuro-admin-dev.azurewebsites.net'), publicOrigin), false);
  assert.equal(sameOrigin(request(), publicOrigin), false);
});

test('keeps the request URL origin rule and rejects malformed configuration', () => {
  assert.equal(sameOrigin(request('http://127.0.0.1:8080'), ''), true);
  assert.equal(sameOrigin(request('https://dev.neuro.services'), ''), false);
  assert.equal(sameOrigin(request('https://dev.neuro.services'), 'https://dev.neuro.services/path'), false);
  assert.equal(sameOrigin(request('https://dev.neuro.services'), 'not a URL'), false);
});
