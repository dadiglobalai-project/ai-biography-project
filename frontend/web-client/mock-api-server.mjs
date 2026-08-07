import http from 'node:http';
import { randomUUID } from 'node:crypto';

const PORT = Number(process.env.MOCK_API_PORT || 8080);
const HOST = process.env.MOCK_API_HOST || '0.0.0.0';
const BASE_URL = `http://localhost:${PORT}`;
const TEMPLATE_ID = '21004dc9-742f-11f1-b903-d85ed3f9183f';

const users = new Map();
const websites = new Map();
const websiteSections = new Map();
const websiteMedia = new Map();
const mediaFiles = new Map();
const contactMessages = new Map();

const templates = [
  {
    templateId: TEMPLATE_ID,
    name: 'Life Journey',
    description: 'A modern biography template designed for telling your complete life story.',
    thumbnailUrl: `${BASE_URL}/mock-assets/life-journey-thumbnail.svg`,
    layoutKey: 'life-journey',
    category: 'Personal',
    premium: false,
  },
  {
    templateId: 'mock-template-visionary',
    name: 'Visionary Legacy',
    description: 'A bold template for leaders, founders, and creators.',
    thumbnailUrl: `${BASE_URL}/mock-assets/visionary-thumbnail.svg`,
    layoutKey: 'visionary-legacy',
    category: 'Professional',
    premium: false,
  },
  {
    templateId: 'mock-template-entrepreneur',
    name: 'Entrepreneur Story',
    description: 'A professional template for business journeys and ventures.',
    thumbnailUrl: `${BASE_URL}/mock-assets/entrepreneur-thumbnail.svg`,
    layoutKey: 'entrepreneur-story',
    category: 'Business',
    premium: false,
  },
];

function now() {
  return new Date().toISOString();
}

function jsonResponse(res, statusCode, payload) {
  res.writeHead(statusCode, {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Authorization, Content-Type',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, PATCH, DELETE, OPTIONS',
  });
  res.end(JSON.stringify(payload));
}

function emptyResponse(res, statusCode = 204) {
  res.writeHead(statusCode, {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Authorization, Content-Type',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, PATCH, DELETE, OPTIONS',
  });
  res.end();
}

function notFound(res) {
  jsonResponse(res, 404, { message: 'Mock endpoint not found' });
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    req.on('data', (chunk) => chunks.push(chunk));
    req.on('end', () => resolve(Buffer.concat(chunks)));
    req.on('error', reject);
  });
}

async function readJson(req) {
  const body = await readBody(req);
  if (!body.length) {
    return {};
  }

  try {
    return JSON.parse(body.toString('utf8'));
  } catch {
    return {};
  }
}

function base64Url(value) {
  return Buffer.from(JSON.stringify(value))
    .toString('base64url');
}

function createToken(user) {
  const header = base64Url({ alg: 'none', typ: 'JWT' });
  const payload = base64Url({
    email: user.email,
    fullName: user.fullName,
    name: user.fullName,
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24,
  });
  return `${header}.${payload}.mock-signature`;
}

function readTokenPayload(req) {
  const authorization = req.headers.authorization || '';
  const token = authorization.replace(/^Bearer\s+/i, '');
  const [, payload] = token.split('.');
  if (!payload) {
    return null;
  }

  try {
    return JSON.parse(Buffer.from(payload, 'base64url').toString('utf8'));
  } catch {
    return null;
  }
}

function normalizeEmail(email) {
  return String(email || 'tester@example.com').trim().toLowerCase();
}

function getOrCreateUser(email, fullName = 'Mock Biography Tester') {
  const normalizedEmail = normalizeEmail(email);
  const existingUser = users.get(normalizedEmail);
  if (existingUser) {
    return existingUser;
  }

  const user = {
    id: randomUUID(),
    email: normalizedEmail,
    fullName,
    serviceType: null,
    createdAt: now(),
  };
  users.set(normalizedEmail, user);
  seedWebsiteForUser(user);
  return user;
}

function getRequestUser(req) {
  const payload = readTokenPayload(req);
  return getOrCreateUser(payload?.email, payload?.fullName || payload?.name);
}

function websiteToResponse(website) {
  return {
    websiteId: website.websiteId,
    id: website.websiteId,
    title: website.title,
    subdomain: website.subdomain,
    templateId: website.templateId,
    subjectType: website.subjectType,
    status: website.status,
    createdAt: website.createdAt,
    updatedAt: website.updatedAt,
  };
}

function seedWebsiteForUser(user) {
  const websiteId = `mock-site-${user.id.slice(0, 8)}`;
  if (websites.has(websiteId)) {
    return websites.get(websiteId);
  }

  const website = {
    websiteId,
    ownerEmail: user.email,
    title: 'My Life Story',
    subdomain: null,
    templateId: TEMPLATE_ID,
    subjectType: 'SELF',
    status: 'DRAFT',
    createdAt: now(),
    updatedAt: now(),
  };

  websites.set(websiteId, website);
  websiteSections.set(websiteId, []);
  websiteMedia.set(websiteId, []);
  contactMessages.set(websiteId, [
    {
      messageId: randomUUID(),
      id: randomUUID(),
      senderName: 'Sample Reader',
      senderEmail: 'reader@example.com',
      subject: 'Thank you for sharing your story',
      message: 'This is a mock contact message for frontend testing.',
      status: 'UNREAD',
      createdAt: now(),
    },
  ]);

  return website;
}

function getUserWebsites(user) {
  return Array.from(websites.values()).filter((website) => website.ownerEmail === user.email);
}

function requireWebsite(res, websiteId) {
  const website = websites.get(websiteId);
  if (!website) {
    jsonResponse(res, 404, { message: 'Biography website not found' });
    return null;
  }
  return website;
}

function sectionTitleFromType(type, payload) {
  switch (type) {
    case 'hero':
      return 'Hero';
    case 'chronicle':
      return payload.sectionTitle || 'Chronicle & Values';
    case 'pursuits':
      return payload.sectionLabel || 'Specialized Pursuits';
    case 'timeline':
      return payload.sectionTitle || 'Life Journey';
    case 'gallery':
      return payload.sectionTitle || 'Media Gallery';
    case 'contact':
      return payload.sectionTitle || 'Contact';
    default:
      return type;
  }
}

function withGeneratedItemIds(type, payload) {
  const nextPayload = structuredClone(payload || {});

  if (type === 'chronicle' && Array.isArray(nextPayload.beliefs?.items)) {
    nextPayload.beliefs.items = nextPayload.beliefs.items.map((item) => ({
      id: item.id || randomUUID(),
      ...item,
    }));
  }

  if (type === 'pursuits' && Array.isArray(nextPayload.items)) {
    nextPayload.items = nextPayload.items.map((item) => ({
      id: item.id || randomUUID(),
      ...item,
    }));
  }

  if (type === 'timeline' && Array.isArray(nextPayload.timelineEvents)) {
    nextPayload.timelineEvents = nextPayload.timelineEvents.map((event) => ({
      id: event.id || randomUUID(),
      ...event,
      highlights: Array.isArray(event.highlights)
        ? event.highlights.map((highlight) => ({
            id: highlight.id || randomUUID(),
            ...highlight,
          }))
        : [],
    }));
  }

  if (type === 'gallery' && Array.isArray(nextPayload.items)) {
    nextPayload.items = nextPayload.items.map((item) => ({
      id: item.id || randomUUID(),
      ...item,
    }));
  }

  if (type === 'contact' && Array.isArray(nextPayload.socialLinks)) {
    nextPayload.socialLinks = nextPayload.socialLinks.map((item) => ({
      id: item.id || randomUUID(),
      ...item,
    }));
  }

  return nextPayload;
}

function createSection(websiteId, type, payload) {
  const sections = websiteSections.get(websiteId) || [];
  const content = withGeneratedItemIds(type, payload);
  const section = {
    sectionId: randomUUID(),
    id: randomUUID(),
    key: type,
    type,
    title: sectionTitleFromType(type, content),
    description: content.sectionDescription || '',
    isVisible: content.isVisible ?? true,
    sortOrder: content.sortOrder ?? sections.length + 1,
    order: content.sortOrder ?? sections.length + 1,
    content,
    createdAt: now(),
    updatedAt: now(),
  };
  section.id = section.sectionId;
  sections.push(section);
  sections.sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0));
  websiteSections.set(websiteId, sections);
  return section;
}

function updateSection(websiteId, sectionId, type, payload) {
  const sections = websiteSections.get(websiteId) || [];
  const index = sections.findIndex((section) => section.sectionId === sectionId || section.id === sectionId);
  if (index === -1) {
    return null;
  }

  const content = withGeneratedItemIds(type, payload);
  sections[index] = {
    ...sections[index],
    key: type,
    type,
    title: sectionTitleFromType(type, content),
    description: content.sectionDescription || sections[index].description,
    isVisible: content.isVisible ?? sections[index].isVisible,
    sortOrder: content.sortOrder ?? sections[index].sortOrder,
    order: content.sortOrder ?? sections[index].order,
    content,
    updatedAt: now(),
  };
  sections.sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0));
  return sections[index];
}

function parseMultipart(buffer, contentType) {
  const boundary = contentType.match(/boundary=(?:"([^"]+)"|([^;]+))/i)?.[1]
    || contentType.match(/boundary=(?:"([^"]+)"|([^;]+))/i)?.[2];

  if (!boundary) {
    return {};
  }

  const body = buffer.toString('latin1');
  const parts = body.split(`--${boundary}`);
  const fields = {};
  let file = null;

  for (const part of parts) {
    if (!part.includes('\r\n\r\n')) {
      continue;
    }

    const [rawHeaders, ...rawContent] = part.split('\r\n\r\n');
    const headers = rawHeaders.toLowerCase();
    let content = rawContent.join('\r\n\r\n');
    content = content.replace(/\r\n--$/, '').replace(/\r\n$/, '');
    const name = rawHeaders.match(/name="([^"]+)"/i)?.[1];
    const filename = rawHeaders.match(/filename="([^"]*)"/i)?.[1];
    const mimeType = rawHeaders.match(/content-type:\s*([^\r\n]+)/i)?.[1]?.trim() || 'application/octet-stream';

    if (!name) {
      continue;
    }

    if (filename !== undefined || headers.includes('filename=')) {
      file = {
        fieldName: name,
        filename: filename || 'upload.bin',
        mimeType,
        buffer: Buffer.from(content, 'latin1'),
      };
    } else {
      fields[name] = Buffer.from(content, 'latin1').toString('utf8');
    }
  }

  return { fields, file };
}

function placeholderSvg(title = 'Mock Image') {
  return Buffer.from(`
<svg xmlns="http://www.w3.org/2000/svg" width="900" height="600" viewBox="0 0 900 600">
  <defs>
    <linearGradient id="g" x1="0" x2="1" y1="0" y2="1">
      <stop offset="0%" stop-color="#fef3c7"/>
      <stop offset="50%" stop-color="#fdba74"/>
      <stop offset="100%" stop-color="#0f172a"/>
    </linearGradient>
  </defs>
  <rect width="900" height="600" fill="url(#g)"/>
  <circle cx="695" cy="145" r="96" fill="#ffffff" opacity="0.18"/>
  <rect x="88" y="390" width="724" height="78" rx="18" fill="#ffffff" opacity="0.18"/>
  <text x="88" y="340" fill="#ffffff" font-family="Arial, sans-serif" font-size="54" font-weight="700">${title}</text>
  <text x="92" y="428" fill="#0f172a" font-family="Arial, sans-serif" font-size="28" font-weight="700">Mock API asset</text>
</svg>`.trim());
}

function sendSvg(res, title) {
  res.writeHead(200, {
    'Content-Type': 'image/svg+xml',
    'Access-Control-Allow-Origin': '*',
  });
  res.end(placeholderSvg(title));
}

async function handleRequest(req, res) {
  if (req.method === 'OPTIONS') {
    emptyResponse(res, 204);
    return;
  }

  const url = new URL(req.url || '/', BASE_URL);
  const parts = url.pathname.split('/').filter(Boolean).map(decodeURIComponent);

  if (parts[0] === 'mock-assets') {
    sendSvg(res, parts[1]?.replace(/-/g, ' ') || 'Life Journey');
    return;
  }

  if (parts[0] === 'mock-media') {
    const asset = mediaFiles.get(parts[1]);
    if (!asset) {
      sendSvg(res, 'Mock Media');
      return;
    }

    res.writeHead(200, {
      'Content-Type': asset.mimeType,
      'Access-Control-Allow-Origin': '*',
    });
    res.end(asset.buffer);
    return;
  }

  if (parts[0] !== 'api') {
    notFound(res);
    return;
  }

  if (parts[1] === 'auth' && parts[2] === 'register' && req.method === 'POST') {
    const body = await readJson(req);
    const user = getOrCreateUser(body.email, body.fullName || body.name || 'Mock Biography Tester');
    jsonResponse(res, 200, {
      success: true,
      message: 'Mock registration complete',
      token: createToken(user),
      user: { fullName: user.fullName, email: user.email },
    });
    return;
  }

  if (parts[1] === 'auth' && parts[2] === 'login' && req.method === 'POST') {
    const body = await readJson(req);
    const user = getOrCreateUser(body.email, body.fullName || 'Mock Biography Tester');
    jsonResponse(res, 200, {
      success: true,
      message: 'Mock login successful',
      token: createToken(user),
      user: { fullName: user.fullName, email: user.email },
    });
    return;
  }

  if (parts[1] === 'auth' && parts[2] === 'logout' && req.method === 'POST') {
    jsonResponse(res, 200, { success: true, message: 'Mock logout successful' });
    return;
  }

  if (parts[1] === 'auth' && parts[2] === 'forgot-password' && req.method === 'POST') {
    const body = await readJson(req);
    jsonResponse(res, 200, {
      success: true,
      message: `Password reset token generated: mock-reset-token-${normalizeEmail(body.email).split('@')[0]}`,
    });
    return;
  }

  if (parts[1] === 'auth' && parts[2] === 'reset-password' && req.method === 'POST') {
    jsonResponse(res, 200, { success: true, message: 'Password reset successful' });
    return;
  }

  if (parts[1] === 'onboarding' && parts[2] === 'service-type' && req.method === 'POST') {
    const user = getRequestUser(req);
    const body = await readJson(req);
    user.serviceType = body.serviceType === 'PROFESSIONAL' ? 'PROFESSIONAL' : 'DIY';
    jsonResponse(res, 200, {
      success: true,
      message: 'Mock service type saved successfully',
      serviceType: user.serviceType,
      onboardingStatus: 'COMPLETED',
    });
    return;
  }

  if (parts[1] === 'dashboard' && req.method === 'GET') {
    const user = getRequestUser(req);
    const ownedWebsites = getUserWebsites(user);
    const drafts = ownedWebsites.filter((website) => website.status === 'DRAFT');
    const published = ownedWebsites.filter((website) => website.status === 'PUBLISHED');

    jsonResponse(res, 200, {
      success: true,
      message: 'Mock dashboard loaded',
      user: {
        firstName: user.fullName.split(' ')[0] || 'Mock',
        lastName: user.fullName.split(' ').slice(1).join(' ') || 'Tester',
        fullName: user.fullName,
        email: user.email,
        serviceType: user.serviceType,
        profilePhoto: null,
      },
      serviceType: user.serviceType,
      onboardingStatus: user.serviceType ? 'COMPLETED' : 'PENDING',
      statistics: {
        totalWebsites: ownedWebsites.length,
        drafts: drafts.length,
        published: published.length,
      },
      actions: {
        hasDraft: drafts.length > 0,
        latestDraftId: drafts[0]?.websiteId || null,
      },
    });
    return;
  }

  if (parts[1] === 'templates' && req.method === 'GET') {
    jsonResponse(res, 200, { templates, totalTemplates: templates.length });
    return;
  }

  if (parts[1] === 'websites' && parts.length === 2 && req.method === 'GET') {
    const user = getRequestUser(req);
    jsonResponse(res, 200, getUserWebsites(user).map(websiteToResponse));
    return;
  }

  if (parts[1] === 'websites' && parts.length === 2 && req.method === 'POST') {
    const user = getRequestUser(req);
    const body = await readJson(req);
    const website = {
      websiteId: randomUUID(),
      ownerEmail: user.email,
      title: body.title || 'My Life Story',
      subdomain: null,
      templateId: body.templateId || TEMPLATE_ID,
      subjectType: body.subjectType || 'SELF',
      status: 'DRAFT',
      createdAt: now(),
      updatedAt: now(),
    };
    websites.set(website.websiteId, website);
    websiteSections.set(website.websiteId, []);
    websiteMedia.set(website.websiteId, []);
    contactMessages.set(website.websiteId, []);
    jsonResponse(res, 201, websiteToResponse(website));
    return;
  }

  if (parts[1] === 'websites' && parts.length === 3 && req.method === 'GET') {
    const website = requireWebsite(res, parts[2]);
    if (!website) {
      return;
    }
    jsonResponse(res, 200, websiteToResponse(website));
    return;
  }

  if (parts[1] === 'websites' && parts[3] === 'sections') {
    const websiteId = parts[2];
    const website = requireWebsite(res, websiteId);
    if (!website) {
      return;
    }

    const sections = websiteSections.get(websiteId) || [];

    if (parts.length === 4 && req.method === 'GET') {
      jsonResponse(res, 200, { sections });
      return;
    }

    if (parts.length === 5 && req.method === 'POST') {
      const payload = await readJson(req);
      const section = createSection(websiteId, parts[4], payload);
      website.updatedAt = now();
      jsonResponse(res, 201, { section });
      return;
    }

    const sectionId = parts[4];
    const sectionIndex = sections.findIndex((section) => section.sectionId === sectionId || section.id === sectionId);

    if (parts.length === 5 && req.method === 'GET') {
      if (sectionIndex === -1) {
        jsonResponse(res, 404, { message: 'Section not found' });
        return;
      }
      jsonResponse(res, 200, { section: sections[sectionIndex] });
      return;
    }

    if (parts.length === 5 && req.method === 'DELETE') {
      if (sectionIndex !== -1) {
        sections.splice(sectionIndex, 1);
      }
      website.updatedAt = now();
      emptyResponse(res, 204);
      return;
    }

    if (parts[5] === 'settings' && req.method === 'PATCH') {
      if (sectionIndex === -1) {
        jsonResponse(res, 404, { message: 'Section not found' });
        return;
      }
      const payload = await readJson(req);
      sections[sectionIndex] = {
        ...sections[sectionIndex],
        isVisible: Boolean(payload.isVisible),
        sortOrder: Number(payload.sortOrder || sections[sectionIndex].sortOrder || 1),
        order: Number(payload.sortOrder || sections[sectionIndex].order || 1),
        updatedAt: now(),
      };
      website.updatedAt = now();
      jsonResponse(res, 200, { section: sections[sectionIndex] });
      return;
    }

    if (parts.length === 6 && req.method === 'PUT') {
      const payload = await readJson(req);
      const section = updateSection(websiteId, sectionId, parts[5], payload);
      if (!section) {
        jsonResponse(res, 404, { message: 'Section not found' });
        return;
      }
      website.updatedAt = now();
      jsonResponse(res, 200, { section });
      return;
    }
  }

  if (parts[1] === 'websites' && parts[3] === 'media') {
    const websiteId = parts[2];
    const website = requireWebsite(res, websiteId);
    if (!website) {
      return;
    }

    const assets = websiteMedia.get(websiteId) || [];

    if (parts.length === 4 && req.method === 'GET') {
      jsonResponse(res, 200, assets.map((asset) => ({ ...asset, accessUrl: null })));
      return;
    }

    if (parts.length === 4 && req.method === 'POST') {
      const buffer = await readBody(req);
      const { fields = {}, file } = parseMultipart(buffer, req.headers['content-type'] || '');
      const mediaAssetId = randomUUID();
      const storedFile = file || {
        filename: 'mock-upload.svg',
        mimeType: 'image/svg+xml',
        buffer: placeholderSvg('Uploaded Image'),
      };

      const asset = {
        mediaAssetId,
        websiteId,
        usageType: fields.usageType || 'GALLERY',
        originalFilename: storedFile.filename,
        mimeType: storedFile.mimeType,
        fileSize: storedFile.buffer.length,
        width: 900,
        height: 600,
        bucketName: 'mock-biography-images',
        storageKey: `websites/${websiteId}/${mediaAssetId}-${storedFile.filename}`,
        accessUrl: `${BASE_URL}/mock-media/${mediaAssetId}`,
        createdAt: now(),
      };

      assets.unshift(asset);
      websiteMedia.set(websiteId, assets);
      mediaFiles.set(mediaAssetId, storedFile);
      website.updatedAt = now();
      jsonResponse(res, 201, asset);
      return;
    }

    const mediaAssetId = parts[4];

    if (parts[5] === 'access-url' && req.method === 'GET') {
      jsonResponse(res, 200, { accessUrl: `${BASE_URL}/mock-media/${mediaAssetId}` });
      return;
    }

    if (parts.length === 5 && req.method === 'DELETE') {
      websiteMedia.set(
        websiteId,
        assets.filter((asset) => asset.mediaAssetId !== mediaAssetId)
      );
      mediaFiles.delete(mediaAssetId);
      website.updatedAt = now();
      emptyResponse(res, 204);
      return;
    }
  }

  if (parts[1] === 'public' && parts[2] === 'websites' && parts[4] === 'contact-messages' && req.method === 'POST') {
    const websiteId = parts[3];
    const website = requireWebsite(res, websiteId);
    if (!website) {
      return;
    }

    const payload = await readJson(req);
    const messages = contactMessages.get(websiteId) || [];
    const message = {
      messageId: randomUUID(),
      id: randomUUID(),
      senderName: payload.senderName || 'Anonymous',
      senderEmail: payload.senderEmail || 'anonymous@example.com',
      subject: payload.subject || 'Message from biography site',
      message: payload.message || '',
      status: 'UNREAD',
      createdAt: now(),
    };
    messages.unshift(message);
    contactMessages.set(websiteId, messages);
    jsonResponse(res, 201, { message: 'Mock contact message created', contactMessage: message });
    return;
  }

  if (parts[1] === 'websites' && parts[3] === 'contact-messages') {
    const websiteId = parts[2];
    const website = requireWebsite(res, websiteId);
    if (!website) {
      return;
    }

    const messages = contactMessages.get(websiteId) || [];

    if (parts.length === 4 && req.method === 'GET') {
      jsonResponse(res, 200, messages);
      return;
    }

    const messageId = parts[4];
    const index = messages.findIndex((message) => message.messageId === messageId || message.id === messageId);

    if (parts[5] === 'status' && req.method === 'PATCH') {
      if (index === -1) {
        jsonResponse(res, 404, { message: 'Contact message not found' });
        return;
      }
      const payload = await readJson(req);
      messages[index] = {
        ...messages[index],
        status: payload.status || 'READ',
      };
      jsonResponse(res, 200, messages[index]);
      return;
    }

    if (parts.length === 5 && req.method === 'DELETE') {
      if (index !== -1) {
        messages.splice(index, 1);
      }
      emptyResponse(res, 204);
      return;
    }
  }

  notFound(res);
}

const server = http.createServer((req, res) => {
  handleRequest(req, res).catch((error) => {
    console.error(error);
    jsonResponse(res, 500, { message: 'Mock server error', details: error.message });
  });
});

server.listen(PORT, HOST, () => {
  console.log(`Mock API server running at ${BASE_URL}`);
  console.log('Use any email/password to log in. Data resets when this server restarts.');
});
