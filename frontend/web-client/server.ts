import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Parser for JSON payloads
  app.use(express.json());

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
    
    return res.status(200).json({ 
      success: true, 
      message: "Legacy compilation completed successfully", 
      user: { fullName, email } 
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

    return res.status(200).json({ 
      success: true, 
      message: "Access granted successfully", 
      user: { fullName: matchedUser.fullName, email: matchedUser.email } 
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
