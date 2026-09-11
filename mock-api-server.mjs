import http from 'node:http';

const PORT = Number(process.env.PORT || 8080);
const LIFE_JOURNEY_TEMPLATE_ID = '21004dc9-742f-11f1-b903-d85ed3f9183f';

const nowIso = () => new Date().toISOString();

const user = {
  userId: 'user-harvey-001',
  fullName: 'Harvey Manaloto',
  email: 'harvey@example.com',
  profilePhoto: '',
};

const plans = [
  {
    planId: 'plan-diy-360-rmb',
    name: 'DIY Membership',
    standardPrice: 360,
    currency: 'CNY',
    durationMonths: 12,
    refundWindowDays: 7,
    active: true,
  },
];

let paymentCounter = 1;
let websiteCounter = 1;
let sectionCounter = 1;
let refundCounter = 1;
let currentMembership = null;

const payments = [];
const refunds = [];
const websites = [];
const thumbnailMedia = new Map();
const sectionsByWebsiteId = new Map();

function sendJson(res, statusCode, data) {
  res.writeHead(statusCode, {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET,POST,PATCH,PUT,DELETE,OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  });
  res.end(JSON.stringify(data, null, 2));
}

function sendNoContent(res) {
  res.writeHead(204, {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET,POST,PATCH,PUT,DELETE,OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  });
  res.end();
}

function sendError(res, statusCode, message) {
  sendJson(res, statusCode, { message });
}

async function readBody(req) {
  const chunks = [];

  for await (const chunk of req) {
    chunks.push(chunk);
  }

  const text = Buffer.concat(chunks).toString('utf8');
  if (!text.trim()) {
    return {};
  }

  try {
    return JSON.parse(text);
  } catch {
    return {};
  }
}

function base64Url(data) {
  return Buffer.from(JSON.stringify(data)).toString('base64url');
}

function createMockJwt() {
  const header = { alg: 'none', typ: 'JWT' };
  const payload = {
    sub: user.userId,
    email: user.email,
    fullName: user.fullName,
    name: user.fullName,
    exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24,
  };

  return `${base64Url(header)}.${base64Url(payload)}.mock-signature`;
}

function getLatestPayment() {
  return payments[0] || null;
}

function getPaymentById(paymentId) {
  return payments.find((payment) => payment.paymentId === paymentId) || null;
}

function getPaymentResponse(payment) {
  return {
    ...payment,
    userId: user.userId,
    userName: user.fullName,
    userEmail: user.email,
    biographyTitle: "Julian Vance's Life Journey",
    websiteId: websites[0]?.id,
    planName: 'DIY Membership',
  };
}

function createPayment() {
  const pendingPayment = payments.find((payment) => payment.status === 'PENDING');
  if (pendingPayment) {
    return { conflict: true, payment: pendingPayment };
  }

  const plan = plans[0];
  const reference = `XHJ-${new Date().toISOString().slice(0, 10).replaceAll('-', '')}-${String(paymentCounter).padStart(4, '0')}`;
  const payment = {
    paymentId: `pay-${String(paymentCounter).padStart(4, '0')}`,
    membershipId: `mem-${String(paymentCounter).padStart(4, '0')}`,
    paymentReference: reference,
    amount: plan.standardPrice,
    currency: plan.currency,
    paymentMethod: 'WECHAT',
    paymentRemark: `${reference} ${user.email}`,
    status: 'PENDING',
    paidAt: null,
    verifiedAt: null,
    createdAt: nowIso(),
  };

  paymentCounter += 1;
  payments.unshift(payment);
  currentMembership = null;

  return { conflict: false, payment };
}

function confirmPayment(payment, paidAt) {
  const now = nowIso();
  payment.status = 'CONFIRMED';
  payment.paidAt = paidAt || now;
  payment.verifiedAt = now;

  const expiresAt = new Date();
  expiresAt.setFullYear(expiresAt.getFullYear() + 1);

  currentMembership = {
    membershipId: payment.membershipId,
    planId: plans[0].planId,
    planName: plans[0].name,
    status: 'ACTIVE',
    startAt: now,
    expiresAt: expiresAt.toISOString(),
    autoRenew: false,
  };

  return payment;
}

function rejectPayment(payment) {
  payment.status = 'REJECTED';
  payment.verifiedAt = nowIso();
  return payment;
}

function createWebsite(payload) {
  const now = nowIso();
  const website = {
    id: `web-${String(websiteCounter).padStart(4, '0')}`,
    title: payload.title || "Julian Vance's Life Journey",
    templateId: payload.templateId || LIFE_JOURNEY_TEMPLATE_ID,
    subjectType: payload.subjectType || 'LOVED_ONE',
    status: 'DRAFT',
    subdomain: null,
    createdAt: now,
    updatedAt: now,
  };

  websiteCounter += 1;
  websites.unshift(website);
  sectionsByWebsiteId.set(website.id, []);
  return website;
}

function getWebsite(websiteId) {
  return websites.find((website) => website.id === websiteId) || null;
}

function getWebsiteSections(websiteId) {
  if (!sectionsByWebsiteId.has(websiteId)) {
    sectionsByWebsiteId.set(websiteId, []);
  }

  return sectionsByWebsiteId.get(websiteId);
}

function createSection(websiteId, key, payload) {
  const sections = getWebsiteSections(websiteId);
  const section = {
    id: `sec-${String(sectionCounter).padStart(4, '0')}`,
    key,
    title: payload.sectionTitle || payload.title || key,
    description: payload.sectionDescription || payload.description || '',
    order: payload.sortOrder || sections.length + 1,
    sortOrder: payload.sortOrder || sections.length + 1,
    isVisible: payload.isVisible ?? true,
    content: payload,
  };

  sectionCounter += 1;
  sections.push(section);
  return section;
}

function updateSection(websiteId, sectionId, key, payload) {
  const sections = getWebsiteSections(websiteId);
  const existing = sections.find((section) => section.id === sectionId);

  if (!existing) {
    return createSection(websiteId, key || 'section', payload);
  }

  existing.key = key || existing.key;
  existing.title = payload.sectionTitle || payload.title || existing.title;
  existing.description = payload.sectionDescription || payload.description || existing.description;
  existing.order = payload.sortOrder || existing.order;
  existing.sortOrder = payload.sortOrder || existing.sortOrder;
  existing.isVisible = payload.isVisible ?? existing.isVisible;
  existing.content = payload;
  return existing;
}

function makeRefund(payment, reason) {
  const refund = {
    refundId: `refund-${String(refundCounter).padStart(4, '0')}`,
    paymentId: payment.paymentId,
    amount: payment.amount,
    currency: payment.currency,
    reason: reason || 'Testing refund request',
    status: 'REQUESTED',
    createdAt: nowIso(),
    requestedAt: nowIso(),
    processedAt: null,
  };

  refundCounter += 1;
  refunds.unshift(refund);
  return refund;
}

function getRefundById(refundId) {
  return refunds.find((refund) => refund.refundId === refundId) || null;
}

function getRefundResponse(refund) {
  return {
    ...refund,
    userId: user.userId,
    userName: user.fullName,
    userEmail: user.email,
  };
}

function getPathParts(pathname) {
  return pathname.split('/').filter(Boolean).map(decodeURIComponent);
}

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url || '/', `http://${req.headers.host || 'localhost'}`);
  const { pathname, searchParams } = url;
  const method = req.method || 'GET';
  const parts = getPathParts(pathname);

  if (method === 'OPTIONS') {
    sendNoContent(res);
    return;
  }

  if (method === 'GET' && pathname === '/health') {
    sendJson(res, 200, { status: 'ok', now: nowIso() });
    return;
  }

  if ((method === 'POST' && pathname === '/api/auth/login') || (method === 'POST' && pathname === '/api/auth/register')) {
    const body = await readBody(req);
    if (body.email) {
      user.email = String(body.email);
    }
    if (body.fullName) {
      user.fullName = String(body.fullName);
    }

    sendJson(res, 200, {
      success: true,
      message: method === 'POST' && pathname.endsWith('/register') ? 'Mock registration successful' : 'Mock login successful',
      token: createMockJwt(),
      user,
    });
    return;
  }

  if (method === 'POST' && pathname === '/api/auth/logout') {
    sendJson(res, 200, { success: true, message: 'Mock logout successful' });
    return;
  }

  if (method === 'GET' && pathname === '/api/dashboard') {
    sendJson(res, 200, {
      success: true,
      message: 'Mock dashboard loaded',
      user,
      serviceType: 'DIY',
      onboardingStatus: 'COMPLETED',
      websites,
      statistics: {
        totalWebsites: websites.length,
        drafts: websites.filter((website) => website.status === 'DRAFT').length,
        published: websites.filter((website) => website.status === 'PUBLISHED').length,
      },
      actions: {
        hasDraft: websites.length > 0,
        latestDraftId: websites[0]?.id || null,
      },
    });
    return;
  }

  if (method === 'GET' && pathname === '/api/templates') {
    sendJson(res, 200, {
      templates: [
        {
          templateId: LIFE_JOURNEY_TEMPLATE_ID,
          name: 'Life Journey',
          description: 'A warm biography template for family legacy stories.',
          thumbnailUrl: '',
          layoutKey: 'life-journey',
          category: 'Biography',
          premium: false,
        },
      ],
      totalTemplates: 1,
    });
    return;
  }

  if (method === 'GET' && pathname === '/api/membership/current') {
    if (!currentMembership || currentMembership.status !== 'ACTIVE') {
      sendNoContent(res);
      return;
    }

    sendJson(res, 200, currentMembership);
    return;
  }

  if (method === 'GET' && pathname === '/api/membership/plans') {
    sendJson(res, 200, { plans, totalPlans: plans.length });
    return;
  }

  if (method === 'POST' && pathname === '/api/payments') {
    await readBody(req);
    const result = createPayment();

    if (result.conflict) {
      sendJson(res, 409, {
        message: 'Duplicate pending payment request',
        payment: getPaymentResponse(result.payment),
      });
      return;
    }

    sendJson(res, 201, { payment: getPaymentResponse(result.payment) });
    return;
  }

  if (method === 'GET' && pathname === '/api/payments/current') {
    const payment = getLatestPayment();

    if (!payment) {
      sendNoContent(res);
      return;
    }

    sendJson(res, 200, { payment: getPaymentResponse(payment) });
    return;
  }

  if (method === 'GET' && parts[0] === 'api' && parts[1] === 'payments' && parts[2]) {
    const payment = getPaymentById(parts[2]);

    if (!payment) {
      sendError(res, 404, 'Payment not found');
      return;
    }

    sendJson(res, 200, { payment: getPaymentResponse(payment) });
    return;
  }

  if (method === 'POST' && pathname === '/api/refunds') {
    const body = await readBody(req);
    const payment = getPaymentById(body.paymentId);

    if (!payment || payment.status !== 'CONFIRMED') {
      sendError(res, 400, 'Refund requires a confirmed payment');
      return;
    }

    const existingRefund = refunds.find(
      (refund) =>
        refund.paymentId === payment.paymentId &&
        !['REJECTED', 'FAILED'].includes(refund.status)
    );

    if (existingRefund) {
      sendJson(res, 409, {
        message: 'Duplicate refund request',
        refund: getRefundResponse(existingRefund),
      });
      return;
    }

    sendJson(res, 201, { refund: getRefundResponse(makeRefund(payment, body.reason)) });
    return;
  }

  if (method === 'GET' && parts[0] === 'api' && parts[1] === 'refunds' && parts[2]) {
    const refund = getRefundById(parts[2]);

    if (!refund) {
      sendError(res, 404, 'Refund not found');
      return;
    }

    sendJson(res, 200, { refund: getRefundResponse(refund) });
    return;
  }

  if (method === 'GET' && pathname === '/api/admin/payments') {
    const status = searchParams.get('status');
    const list = status
      ? payments.filter((payment) => payment.status === status.toUpperCase())
      : payments;

    sendJson(res, 200, { payments: list.map(getPaymentResponse), totalPayments: list.length });
    return;
  }

  if (method === 'GET' && parts[0] === 'api' && parts[1] === 'admin' && parts[2] === 'payments' && parts[3]) {
    const payment = getPaymentById(parts[3]);

    if (!payment) {
      sendError(res, 404, 'Payment not found');
      return;
    }

    sendJson(res, 200, { payment: getPaymentResponse(payment) });
    return;
  }

  if (method === 'PATCH' && parts[0] === 'api' && parts[1] === 'admin' && parts[2] === 'payments' && parts[3] && parts[4] === 'confirm') {
    const body = await readBody(req);
    const payment = getPaymentById(parts[3]);

    if (!payment) {
      sendError(res, 404, 'Payment not found');
      return;
    }

    sendJson(res, 200, { payment: getPaymentResponse(confirmPayment(payment, body.paidAt)) });
    return;
  }

  if (method === 'PATCH' && parts[0] === 'api' && parts[1] === 'admin' && parts[2] === 'payments' && parts[3] && parts[4] === 'reject') {
    const payment = getPaymentById(parts[3]);

    if (!payment) {
      sendError(res, 404, 'Payment not found');
      return;
    }

    sendJson(res, 200, { payment: getPaymentResponse(rejectPayment(payment)) });
    return;
  }

  if (method === 'GET' && pathname === '/api/admin/refunds') {
    const status = searchParams.get('status');
    const list = status
      ? refunds.filter((refund) => refund.status === status.toUpperCase())
      : refunds;

    sendJson(res, 200, { refunds: list.map(getRefundResponse), totalRefunds: list.length });
    return;
  }

  if (method === 'GET' && parts[0] === 'api' && parts[1] === 'admin' && parts[2] === 'refunds' && parts[3]) {
    const refund = getRefundById(parts[3]);

    if (!refund) {
      sendError(res, 404, 'Refund not found');
      return;
    }

    sendJson(res, 200, { refund: getRefundResponse(refund) });
    return;
  }

  if (method === 'PATCH' && parts[0] === 'api' && parts[1] === 'admin' && parts[2] === 'refunds' && parts[3] && parts[4]) {
    const body = await readBody(req);
    const refund = getRefundById(parts[3]);

    if (!refund) {
      sendError(res, 404, 'Refund not found');
      return;
    }

    if (parts[4] === 'approve') {
      refund.status = 'APPROVED';
    } else if (parts[4] === 'reject') {
      refund.status = 'REJECTED';
    } else if (parts[4] === 'complete') {
      refund.status = 'COMPLETED';
      refund.refundMethod = body.refundMethod || 'WECHAT';
      refund.externalRefundReference = body.externalRefundReference || '';
      refund.processedAt = nowIso();

      const payment = getPaymentById(refund.paymentId);
      if (payment) {
        payment.status = 'REFUNDED';
      }

      if (currentMembership) {
        currentMembership.status = 'CANCELLED';
      }
    }

    sendJson(res, 200, { refund: getRefundResponse(refund) });
    return;
  }

  if (method === 'GET' && parts[0] === 'api' && parts[1] === 'admin' && parts[2] === 'users' && parts[3] && parts[4] === 'membership') {
    if (!currentMembership) {
      sendNoContent(res);
      return;
    }

    sendJson(res, 200, { membership: { ...currentMembership, userId: parts[3] } });
    return;
  }

  if (method === 'POST' && pathname === '/api/ai-writing/generate') {
    const body = await readBody(req);
    const sourceText = body.sourceText || body.userInstruction || 'This biography section needs content.';
    const action = body.actionType || 'GENERATE';

    sendJson(res, 200, {
      requestId: `ai-req-${Date.now()}`,
      outputId: `ai-out-${Date.now()}`,
      actionType: action,
      generatedText: `[Mock ${action}] ${sourceText} This version is polished for a warm biography tone.`,
      language: body.language || 'ENGLISH',
      englishWordCount: 14,
      chineseCharacterCount: 0,
      inputTokens: 40,
      outputTokens: 30,
      totalTokens: 70,
      createdAt: nowIso(),
    });
    return;
  }

  if (method === 'GET' && pathname === '/api/websites') {
    sendJson(res, 200, { websites, totalWebsites: websites.length });
    return;
  }

  if (method === 'GET' && parts[0] === 'mock-media' && thumbnailMedia.has(parts[1])) {
    const media = thumbnailMedia.get(parts[1]);
    res.writeHead(200, { 'Content-Type': media.contentType, 'Access-Control-Allow-Origin': '*' });
    res.end(media.bytes);
    return;
  }

  if (method === 'POST' && parts[0] === 'api' && parts[1] === 'websites' && parts[3] === 'media' && parts.length === 4) {
    if (!getWebsite(parts[2])) { sendError(res, 404, 'Website not found'); return; }
    const boundary = /boundary=(?:"([^"]+)"|([^;]+))/.exec(req.headers['content-type'] || '');
    if (!boundary) { sendError(res, 400, 'Multipart upload required'); return; }
    const chunks = [];
    for await (const chunk of req) chunks.push(chunk);
    const body = Buffer.concat(chunks);
    const raw = body.toString('latin1');
    const filePart = raw.split(`--${boundary[1] || boundary[2]}`).find((part) => part.includes('name="file"'));
    if (!filePart) { sendError(res, 400, 'File required'); return; }
    const headerEnd = filePart.indexOf('\r\n\r\n');
    const contentType = /Content-Type: ([^\r\n]+)/i.exec(filePart)?.[1] || 'image/webp';
    const id = `thumbnail-${Date.now()}-${thumbnailMedia.size}`;
    thumbnailMedia.set(id, { bytes: Buffer.from(filePart.slice(headerEnd + 4, -2), 'latin1'), contentType });
    sendJson(res, 201, { mediaAsset: { mediaAssetId: id, websiteId: parts[2], usageType: 'GALLERY', accessUrl: `http://localhost:${PORT}/mock-media/${id}`, contentType } });
    return;
  }

  if (method === 'PATCH' && parts[0] === 'api' && parts[1] === 'websites' && parts[3] === 'thumbnail' && parts.length === 4) {
    const website = getWebsite(parts[2]);
    if (!website) { sendError(res, 404, 'Website not found'); return; }
    const body = await readBody(req);
    if (typeof body.thumbnailUrl !== 'string' || !/^https?:\/\//.test(body.thumbnailUrl)) { sendError(res, 400, 'Valid thumbnailUrl required'); return; }
    website.thumbnailUrl = body.thumbnailUrl;
    website.thumbnailGeneratedAt = nowIso();
    sendNoContent(res);
    return;
  }

  if (method === 'POST' && pathname === '/api/websites') {
    const body = await readBody(req);
    sendJson(res, 201, { website: createWebsite(body) });
    return;
  }

  if (method === 'GET' && parts[0] === 'api' && parts[1] === 'websites' && parts[2] && parts.length === 3) {
    const website = getWebsite(parts[2]);

    if (!website) {
      sendError(res, 404, 'Website not found');
      return;
    }

    sendJson(res, 200, { website });
    return;
  }

  if (method === 'DELETE' && parts[0] === 'api' && parts[1] === 'websites' && parts[2] && parts.length === 3) {
    const index = websites.findIndex((website) => website.id === parts[2]);

    if (index < 0) {
      sendError(res, 404, 'Website not found');
      return;
    }

    if (index >= 0) {
      websites.splice(index, 1);
      sectionsByWebsiteId.delete(parts[2]);
    }

    sendNoContent(res);
    return;
  }

  if (method === 'GET' && parts[0] === 'api' && parts[1] === 'websites' && parts[2] && parts[3] === 'sections' && parts.length === 4) {
    sendJson(res, 200, { sections: getWebsiteSections(parts[2]) });
    return;
  }

  if (method === 'POST' && parts[0] === 'api' && parts[1] === 'websites' && parts[2] && parts[3] === 'sections' && parts[4]) {
    const body = await readBody(req);
    sendJson(res, 201, { section: createSection(parts[2], parts[4], body) });
    return;
  }

  if ((method === 'PATCH' || method === 'PUT') && parts[0] === 'api' && parts[1] === 'websites' && parts[2] && parts[3] === 'sections' && parts[4]) {
    const body = await readBody(req);
    const sectionType = parts[5] === 'settings' ? null : parts[5];
    sendJson(res, 200, { section: updateSection(parts[2], parts[4], sectionType, body) });
    return;
  }

  if (method === 'GET' && parts[0] === 'api' && parts[1] === 'websites' && parts[2] && parts[3] === 'sections' && parts[4]) {
    const section = getWebsiteSections(parts[2]).find((item) => item.id === parts[4]);

    if (!section) {
      sendError(res, 404, 'Section not found');
      return;
    }

    sendJson(res, 200, { section });
    return;
  }

  sendError(res, 404, `Mock endpoint not found: ${method} ${pathname}`);
});

server.listen(PORT, () => {
  console.log(`Mock API server running on http://localhost:${PORT}`);
  console.log('Login with any email/password, then test /payment and /payment/status.');
  console.log('Admin confirm example:');
  console.log('curl -X PATCH http://localhost:8080/api/admin/payments/pay-0001/confirm');
});
