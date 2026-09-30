import test from 'node:test';
import assert from 'node:assert/strict';
import sharp from 'sharp';
import { optimizeImageFormData } from '../src/lib/server/imageOptimization.js';

test('project image upload forwards the optimized file MIME type as upload_image_ContentType', async () => {
  const pixels = Buffer.alloc(256 * 256 * 3);
  for (let index = 0; index < pixels.length; index += 1) {
    pixels[index] = index % 251;
  }
  const jpeg = await sharp(pixels, { raw: { width: 256, height: 256, channels: 3 } })
    .jpeg({ quality: 95 })
    .toBuffer();

  const input = new FormData();
  input.set('upload_image', new File([jpeg], 'project.jpg', { type: 'image/jpeg' }));
  input.set('upload_image_ContentType', 'image/png');
  input.set('image_name', 'project.jpg');

  const output = await optimizeImageFormData(input);
  const uploadedFile = output.get('upload_image');

  assert.equal(uploadedFile.type, 'image/webp');
  assert.equal(output.get('upload_image_ContentType'), uploadedFile.type);
  assert.equal(output.get('image_name'), uploadedFile.name);
});
