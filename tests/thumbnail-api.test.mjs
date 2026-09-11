import { test } from 'node:test';
import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { once } from 'node:events';

test('mock thumbnail upload, URL update, list response, and missing website', async () => {
  const server = spawn(process.execPath, ['mock-api-server.mjs'], {
    env: { ...process.env, PORT: '19087' }, stdio: ['ignore', 'pipe', 'pipe'],
  });
  try {
    await Promise.race([
      once(server.stdout, 'data'),
      once(server, 'exit').then(() => { throw new Error('Mock server exited before startup'); }),
    ]);
    const base = 'http://localhost:19087';
    const created = await fetch(`${base}/api/websites`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: 'Thumbnail test', templateId: 'life-journey', subjectType: 'SELF' }),
    }).then((res) => res.json());
    const id = created.website.id;
    const bytes = Buffer.from([82, 73, 70, 70, 0, 255, 13, 10, 87, 69, 66, 80]);
    const form = new FormData();
    form.append('file', new Blob([bytes], { type: 'image/webp' }), 'thumbnail.webp');
    form.append('usageType', 'GALLERY');
    const upload = await fetch(`${base}/api/websites/${id}/media`, { method: 'POST', body: form });
    assert.equal(upload.status, 201);
    const { mediaAsset } = await upload.json();
    const image = await fetch(mediaAsset.accessUrl);
    assert.equal(image.headers.get('content-type'), 'image/webp');
    assert.deepEqual(Buffer.from(await image.arrayBuffer()), bytes);
    const update = await fetch(`${base}/api/websites/${id}/thumbnail`, {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ thumbnailUrl: mediaAsset.accessUrl }),
    });
    assert.equal(update.status, 204);
    const list = await fetch(`${base}/api/websites`).then((res) => res.json());
    assert.equal(list.websites[0].thumbnailUrl, mediaAsset.accessUrl);
    assert.ok(list.websites[0].thumbnailGeneratedAt);
    const missing = await fetch(`${base}/api/websites/missing/thumbnail`, {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ thumbnailUrl: mediaAsset.accessUrl }),
    });
    assert.equal(missing.status, 404);
  } finally {
    if (server.exitCode === null && server.signalCode === null) {
      const stopped = once(server, 'exit');
      server.kill();
      await stopped;
    }
  }
});
