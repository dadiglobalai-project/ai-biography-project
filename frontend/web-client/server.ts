import express from "express";
import crypto from "crypto";
import path from "path";
import { createServer as createViteServer } from "vite";

interface TempUser {
  userId: string;
  fullName: string;
  email: string;
  password: string;
  status: "ACTIVE";
}

interface JwtPayload {
  sub: string;
  email: string;
  name: string;
  status: string;
  iat: number;
  exp: number;
}

const AUTH_COOKIE_NAME = "xinghuoji_auth";
const JWT_SECRET = process.env.JWT_SECRET || "dev-only-change-this-secret-before-production-please-keep-it-long";
const JWT_MAX_AGE_SECONDS = Number(process.env.JWT_EXPIRATION_SECONDS || 86400);

const base64UrlEncode = (input: Buffer | string) =>
  Buffer.from(input)
    .toString("base64")
    .replace(/=/g, "")
    .replace(/\+/g, "-")
    .replace(/\//g, "_");

const base64UrlDecode = (input: string) => {
  const normalized = input.replace(/-/g, "+").replace(/_/g, "/");
  const padded = normalized.padEnd(Math.ceil(normalized.length / 4) * 4, "=");
  return Buffer.from(padded, "base64");
};

const sign = (value: string) => base64UrlEncode(crypto.createHmac("sha256", JWT_SECRET).update(value).digest());

const createJwt = (user: TempUser) => {
  const now = Math.floor(Date.now() / 1000);
  const header = base64UrlEncode(JSON.stringify({ alg: "HS256", typ: "JWT" }));
  const payload = base64UrlEncode(JSON.stringify({
    sub: user.userId,
    email: user.email,
    name: user.fullName,
    status: user.status,
    iat: now,
    exp: now + JWT_MAX_AGE_SECONDS
  }));
  const signature = sign(`${header}.${payload}`);

  return `${header}.${payload}.${signature}`;
};

const verifyJwt = (token?: string): JwtPayload | null => {
  if (!token) {
    return null;
  }

  const [header, payload, signature] = token.split(".");
  if (!header || !payload || !signature) {
    return null;
  }

  const expectedSignature = sign(`${header}.${payload}`);
  const signatureBuffer = Buffer.from(signature);
  const expectedBuffer = Buffer.from(expectedSignature);
  if (signatureBuffer.length !== expectedBuffer.length || !crypto.timingSafeEqual(signatureBuffer, expectedBuffer)) {
    return null;
  }

  try {
    const decodedHeader = JSON.parse(base64UrlDecode(header).toString("utf8"));
    const decodedPayload = JSON.parse(base64UrlDecode(payload).toString("utf8")) as JwtPayload;

    if (decodedHeader.alg !== "HS256" || decodedPayload.exp <= Math.floor(Date.now() / 1000)) {
      return null;
    }

    return decodedPayload;
  } catch {
    return null;
  }
};

const parseCookies = (cookieHeader?: string) =>
  (cookieHeader || "").split(";").reduce<Record<string, string>>((cookies, cookie) => {
    const [rawName, ...rawValue] = cookie.trim().split("=");
    if (!rawName) {
      return cookies;
    }

    cookies[rawName] = decodeURIComponent(rawValue.join("="));
    return cookies;
  }, {});

const authCookie = (token: string) => {
  const secureFlag = process.env.NODE_ENV === "production" ? "; Secure" : "";
  return `${AUTH_COOKIE_NAME}=${token}; HttpOnly; Path=/; Max-Age=${JWT_MAX_AGE_SECONDS}; SameSite=Lax${secureFlag}`;
};

const clearAuthCookie = () => {
  const secureFlag = process.env.NODE_ENV === "production" ? "; Secure" : "";
  return `${AUTH_COOKIE_NAME}=; HttpOnly; Path=/; Max-Age=0; SameSite=Lax${secureFlag}`;
};

async function startServer() {
  const app = express();
  const PORT = Number(process.env.PORT || 3000);

  // Parser for JSON payloads
  app.use(express.json());

  // In-memory user database initialized with a default test user
  const tempUsers: TempUser[] = [
    {
      userId: "demo-user-theodore-roosevelt",
      fullName: "Theodore Roosevelt",
      email: "theo@legacy.com",
      password: "SecurePassword123",
      status: "ACTIVE"
    }
  ];

  // API endpoints
  app.post("/api/auth/register", (req, res) => {
    const { fullName, email, password, confirmPassword, agreedToTerms } = req.body;
    
    // Server-side input validation checking
    if (!fullName || fullName.trim().length < 3) {
      return res.status(400).json({ error: "Full Name must be at least 3 characters long" });
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRegex.test(email)) {
      return res.status(400).json({ error: "Please enter a valid email address" });
    }
    if (!password || password.length < 8 || !/[A-Za-z]/.test(password) || !/[0-9]/.test(password)) {
      return res.status(400).json({ error: "Password must be at least 8 characters long and contain at least one letter and one number" });
    }
    if (password !== confirmPassword) {
      return res.status(400).json({ error: "Passwords do not match" });
    }
    if (!agreedToTerms) {
      return res.status(400).json({ error: "You must agree to the Terms & Privacy protocols" });
    }

    // Check duplicate registrations
    if (tempUsers.find(u => u.email.toLowerCase() === email.toLowerCase())) {
      return res.status(400).json({ error: "This email address is already registered in the archives" });
    }

    // Persist to temporary memory
    const user: TempUser = {
      userId: crypto.randomUUID(),
      fullName,
      email,
      password,
      status: "ACTIVE"
    };
    tempUsers.push(user);
    res.setHeader("Set-Cookie", authCookie(createJwt(user)));
    
    return res.status(200).json({ 
      success: true, 
      message: "Legacy compilation completed successfully", 
      user: { userId: user.userId, fullName: user.fullName, email: user.email, status: user.status } 
    });
  });

  app.post("/api/auth/login", (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "Please provide both email address and password" });
    }

    const matchedUser = tempUsers.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (!matchedUser) {
      return res.status(400).json({ error: "No historical records found matching this identity" });
    }

    if (matchedUser.password !== password) {
      return res.status(400).json({ error: "Signature verification failed (incorrect password)" });
    }

    res.setHeader("Set-Cookie", authCookie(createJwt(matchedUser)));

    return res.status(200).json({ 
      success: true, 
      message: "Access granted successfully", 
      user: {
        userId: matchedUser.userId,
        fullName: matchedUser.fullName,
        email: matchedUser.email,
        status: matchedUser.status
      } 
    });
  });

  app.get("/api/auth/me", (req, res) => {
    const cookies = parseCookies(req.headers.cookie);
    const payload = verifyJwt(cookies[AUTH_COOKIE_NAME]);
    if (!payload) {
      return res.status(401).json({ error: "Authentication required" });
    }

    const matchedUser = tempUsers.find(u => u.userId === payload.sub && u.status === "ACTIVE");
    if (!matchedUser) {
      return res.status(401).json({ error: "Authentication required" });
    }

    return res.status(200).json({
      success: true,
      message: "Authenticated",
      user: {
        userId: matchedUser.userId,
        fullName: matchedUser.fullName,
        email: matchedUser.email,
        status: matchedUser.status
      }
    });
  });

  app.post("/api/auth/logout", (_req, res) => {
    res.setHeader("Set-Cookie", clearAuthCookie());
    return res.status(200).json({ success: true, message: "Signed out" });
  });

  // Vite middleware for development or serving index.html in production
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
