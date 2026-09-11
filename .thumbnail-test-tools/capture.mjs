import { writeFileSync } from 'node:fs';
import { chromium } from 'playwright';
const browser = await chromium.launch({ executablePath: 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe', headless: true });
try {
 const page = await browser.newPage();
 page.on('console', msg => console.log(msg.text().slice(0,500))); page.on('pageerror', error => console.log('PAGE ERROR:', error.message));
 await page.goto('http://127.0.0.1:3107');
 const result = await page.evaluate(async () => {
   try {
     const { captureBiographyThumbnail } = await import('/src/services/biographyThumbnail.tsx');
     const { default: Renderer } = await import('/src/Templates/BiographyTemplateRenderer.tsx');
     const { default: React } = await import('/node_modules/.vite/deps/react.js'); const { createElement } = React;
     const captureJob = captureBiographyThumbnail(createElement(Renderer, { templateId: 'life-journey' }));
     await new Promise(r => setTimeout(r, 500)); const host = document.querySelector('[data-thumbnail-capture]'); console.log('HOST', host?.innerText?.slice(0,100), host && getComputedStyle(host).cssText); const file = await captureJob; const {authService} = await import('/src/services/authService.ts'); const created = await fetch('http://localhost:19087/api/websites', {method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({title:'Thumbnail browser test',templateId:'life-journey',subjectType:'SELF'})}).then(r=>r.json()); const media=await authService.uploadBiographyWebsiteMedia(created.website.id,file,'GALLERY',true); if(!media?.accessUrl) throw new Error('No upload URL'); await authService.updateBiographyThumbnail(created.website.id,media.accessUrl); const list=await authService.getBiographyWebsites(); if(!list.some(w=>w.id===created.website.id && w.thumbnailUrl===media.accessUrl)) throw new Error('Thumbnail missing from list'); console.log('PASS capture -> upload -> PATCH -> list'); return { size: file.size, type: file.type, bytes: Array.from(new Uint8Array(await file.arrayBuffer())) };
   } catch (error) { return { error: error.message, stack: error.stack }; }
 });
 if (result.bytes) { writeFileSync('.thumbnail-test-tools/preview.webp', Buffer.from(result.bytes)); delete result.bytes; } console.log(JSON.stringify(result));
} finally { await browser.close(); }




