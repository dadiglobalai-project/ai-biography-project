import express from "express";
import path from "path";
import jwt from "jsonwebtoken";
import cookieParser from "cookie-parser";
import { createServer as createViteServer } from "vite";

async function startServer() {
  const app = express();
  const PORT = 3000;
  const JWT_SECRET = process.env.JWT_SECRET || "default_archival_constellation_secret_key";

  // Parser for JSON payloads and cookies
  app.use(express.json());
  app.use(cookieParser());

  // In-memory user database initialized with a default test user
  const tempUsers = [
    {
      fullName: "Theodore Roosevelt",
      email: "theo@legacy.com",
      password: "SecurePassword123"
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
    tempUsers.push({ fullName, email, password });
    
    // Generate secure JWT token
    const token = jwt.sign(
      { fullName, email: email.toLowerCase() },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    // Set token in secure HTTP-only cookie
    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    });

    return res.status(200).json({ 
      success: true, 
      message: "Legacy compilation completed successfully", 
      user: { fullName, email },
      token
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

    // Generate secure JWT token
    const token = jwt.sign(
      { fullName: matchedUser.fullName, email: matchedUser.email.toLowerCase() },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    // Set token in secure HTTP-only cookie
    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    });

    return res.status(200).json({ 
      success: true, 
      message: "Access granted successfully", 
      user: { fullName: matchedUser.fullName, email: matchedUser.email },
      token
    });
  });

  // Verify current token validity and fetch active session matching identity
  app.get("/api/auth/me", (req, res) => {
    let token = req.cookies?.token;
    
    // Support standard Authorization: Bearer <token> header defined by user's leader
    if (req.headers.authorization && req.headers.authorization.startsWith("Bearer ")) {
      token = req.headers.authorization.split(" ")[1];
    }

    if (!token) {
      return res.status(401).json({ error: "Unauthorized. Please authenticate to open the sanctuary." });
    }

    try {
      const decoded = jwt.verify(token, JWT_SECRET) as { fullName: string; email: string };
      const matchedUser = tempUsers.find(u => u.email.toLowerCase() === decoded.email.toLowerCase());
      if (!matchedUser) {
        return res.status(401).json({ error: "User session revoked or record not found in historical archives." });
      }

      return res.status(200).json({
        success: true,
        user: { fullName: matchedUser.fullName, email: matchedUser.email }
      });
    } catch (err) {
      return res.status(401).json({ error: "Your safe gateway session has expired. Please sign in again." });
    }
  });

  // Log out the active legacy session and clear the secure cookie
  app.post("/api/auth/logout", (req, res) => {
    res.clearCookie("token", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict"
    });
    return res.status(200).json({ success: true, message: "Secure gateway session cleared." });
  });

  // Request password reset link
  app.post("/api/auth/forgot-password", (req, res) => {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ error: "Please provide an email address." });
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: "Please enter a valid email address." });
    }
    return res.status(200).json({
      success: true,
      message: `A password reset link has been dispatched to ${email}.`
    });
  });

  // Reset password endpoint (Updates the password for the account)
  app.post("/api/auth/reset-password", (req, res) => {
    const { email, password, confirmPassword } = req.body;

    if (!email) {
      return res.status(400).json({ error: "No target legacy account identified." });
    }

    const matchedUser = tempUsers.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (!matchedUser) {
      return res.status(404).json({ error: "The digital legacy account was not found in the archives." });
    }

    if (!password || password.length < 8) {
      return res.status(400).json({ error: "Password must be at least 8 characters long." });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({ error: "Passwords do not match." });
    }

    // Update password in memory
    matchedUser.password = password;

    return res.status(200).json({
      success: true,
      message: "Your new credentials have been safely archived. Your password has been updated."
    });
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
