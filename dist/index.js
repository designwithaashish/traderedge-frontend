// server/index.ts
import express2 from "express";

// server/routes.ts
import { createServer } from "http";

// server/storage.ts
var MemStorage = class {
  users;
  traderProfiles;
  tradeEntries;
  userId;
  profileId;
  entryId;
  constructor() {
    this.users = /* @__PURE__ */ new Map();
    this.traderProfiles = /* @__PURE__ */ new Map();
    this.tradeEntries = /* @__PURE__ */ new Map();
    this.userId = 1;
    this.profileId = 1;
    this.entryId = 1;
  }
  // User methods
  async getUser(id) {
    return this.users.get(id);
  }
  async getUserByUsername(username) {
    return Array.from(this.users.values()).find(
      (user) => user.username === username
    );
  }
  async getUserByFirebaseId(firebaseId) {
    return Array.from(this.users.values()).find(
      (user) => user.firebaseId === firebaseId
    );
  }
  async getUserByEmail(email) {
    return Array.from(this.users.values()).find(
      (user) => user.email === email
    );
  }
  async createUser(insertUser) {
    const id = this.userId++;
    const user = {
      id,
      username: insertUser.username,
      password: insertUser.password || "firebase-auth",
      // Use placeholder for Firebase users
      email: insertUser.email || null,
      firebaseId: insertUser.firebaseId || null,
      displayName: insertUser.displayName || null,
      photoURL: insertUser.photoURL || null,
      isFirebaseUser: insertUser.isFirebaseUser || false
    };
    this.users.set(id, user);
    return user;
  }
  async updateUser(id, userData) {
    const existingUser = this.users.get(id);
    if (!existingUser) return void 0;
    const updatedUser = {
      ...existingUser,
      ...userData
    };
    this.users.set(id, updatedUser);
    return updatedUser;
  }
  // Trader profile methods
  async getTraderProfile(id) {
    return this.traderProfiles.get(id);
  }
  async getTraderProfileByUserId(userId) {
    return Array.from(this.traderProfiles.values()).find(
      (profile) => profile.userId === userId
    );
  }
  async createTraderProfile(profile) {
    const id = this.profileId++;
    const now = /* @__PURE__ */ new Date();
    const traderProfile = {
      id,
      userId: profile.userId,
      journalName: profile.journalName || "My Trading Journal",
      initialCapital: profile.initialCapital || "1000",
      strategy1: profile.strategy1 || "",
      strategy2: profile.strategy2 || "",
      strategy3: profile.strategy3 || "",
      isPro: false,
      // Initialize with Pro status false
      proSince: null,
      // No Pro subscription date initially
      createdAt: now,
      updatedAt: now
    };
    this.traderProfiles.set(id, traderProfile);
    return traderProfile;
  }
  async updateTraderProfile(id, profile) {
    const existingProfile = this.traderProfiles.get(id);
    if (!existingProfile) return void 0;
    const updatedProfile = {
      ...existingProfile,
      ...profile,
      updatedAt: /* @__PURE__ */ new Date()
    };
    this.traderProfiles.set(id, updatedProfile);
    return updatedProfile;
  }
  // Trade entries methods
  async getTradeEntry(id) {
    return this.tradeEntries.get(id);
  }
  async getTradeEntriesByProfileId(profileId) {
    return Array.from(this.tradeEntries.values()).filter((entry) => entry.traderProfileId === profileId).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }
  async createTradeEntry(entry) {
    const id = this.entryId++;
    const now = /* @__PURE__ */ new Date();
    const tradeEntry = {
      id,
      traderProfileId: entry.traderProfileId,
      date: entry.date,
      tradingDay: entry.tradingDay || "",
      tradingSession: entry.tradingSession || "",
      assetTraded: entry.assetTraded,
      setupQuality: entry.setupQuality,
      riskPercentage: entry.riskPercentage,
      riskRewardRatio: entry.riskRewardRatio || 0,
      pnlAmount: entry.pnlAmount,
      tradeStatus: entry.tradeStatus || "",
      strategyUsed: entry.strategyUsed,
      tradingEmotion: entry.tradingEmotion || "",
      chartImage: entry.chartImage || "",
      comments: entry.comments || "",
      createdAt: now,
      updatedAt: now
    };
    this.tradeEntries.set(id, tradeEntry);
    return tradeEntry;
  }
  async updateTradeEntry(id, entry) {
    const existingEntry = this.tradeEntries.get(id);
    if (!existingEntry) return void 0;
    const updatedEntry = {
      ...existingEntry,
      ...entry,
      updatedAt: /* @__PURE__ */ new Date()
    };
    this.tradeEntries.set(id, updatedEntry);
    return updatedEntry;
  }
  async deleteTradeEntry(id) {
    return this.tradeEntries.delete(id);
  }
};
var storage = new MemStorage();

// shared/schema.ts
import { pgTable, text, serial, integer, boolean, timestamp, decimal, real } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
var users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  email: text("email"),
  firebaseId: text("firebase_id"),
  displayName: text("display_name"),
  photoURL: text("photo_url"),
  isFirebaseUser: boolean("is_firebase_user").default(false)
});
var insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  email: true,
  firebaseId: true,
  displayName: true,
  photoURL: true,
  isFirebaseUser: true
}).partial({
  password: true,
  email: true,
  displayName: true,
  photoURL: true
});
var traderProfiles = pgTable("trader_profiles", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  journalName: text("journal_name").notNull().default("My Trading Journal"),
  initialCapital: decimal("initial_capital", { precision: 10, scale: 2 }).notNull(),
  strategy1: text("strategy1").notNull().default(""),
  strategy2: text("strategy2").notNull().default(""),
  strategy3: text("strategy3").notNull().default(""),
  isPro: boolean("is_pro").default(false).notNull(),
  proSince: timestamp("pro_since"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull()
});
var insertTraderProfileSchema = createInsertSchema(traderProfiles).pick({
  userId: true,
  journalName: true,
  initialCapital: true,
  strategy1: true,
  strategy2: true,
  strategy3: true
});
var setupQualityEnum = z.enum(["A+", "A", "B", "C", "C+"]);
var tradingSessionEnum = z.enum([
  "Asia",
  "London Open",
  "New York AM",
  "London Close",
  "New York PM"
]);
var tradingEmotionEnum = z.enum([
  "Confident",
  "Calm",
  "Focused",
  "Neutral",
  "Hesitant",
  "Anxious",
  "Frustrated",
  "Impulsive"
]);
var tradeStatusEnum = z.enum(["Win", "Loss", "Breakeven"]);
var tradeEntries = pgTable("trade_entries", {
  id: serial("id").primaryKey(),
  traderProfileId: integer("trader_profile_id").notNull(),
  date: timestamp("date").notNull(),
  tradingDay: text("trading_day").notNull().default(""),
  tradingSession: text("trading_session").notNull().default(""),
  assetTraded: text("asset_traded").notNull(),
  setupQuality: text("setup_quality").notNull(),
  riskPercentage: real("risk_percentage").notNull(),
  riskRewardRatio: real("risk_reward_ratio").notNull().default(0),
  pnlAmount: decimal("pnl_amount", { precision: 10, scale: 2 }).notNull(),
  tradeStatus: text("trade_status").notNull().default(""),
  strategyUsed: text("strategy_used").notNull(),
  tradingEmotion: text("trading_emotion").notNull().default(""),
  chartImage: text("chart_image").notNull().default(""),
  comments: text("comments").notNull().default(""),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull()
});
var insertTradeEntrySchema = createInsertSchema(tradeEntries).omit({ id: true, createdAt: true, updatedAt: true }).extend({
  setupQuality: setupQualityEnum,
  tradingSession: tradingSessionEnum,
  tradingEmotion: tradingEmotionEnum,
  tradeStatus: tradeStatusEnum
});
var tradeEntryFormSchema = insertTradeEntrySchema.extend({
  chartImage: z.string().optional(),
  comments: z.string().optional(),
  tradingDay: z.string().optional().default(""),
  tradingSession: tradingSessionEnum.optional(),
  tradingEmotion: tradingEmotionEnum.optional(),
  tradeStatus: tradeStatusEnum.optional(),
  riskRewardRatio: z.coerce.number().optional()
});

// server/routes.ts
import { z as z2 } from "zod";
async function registerRoutes(app2) {
  app2.post("/api/trader-profile", async (req, res) => {
    try {
      const validatedData = insertTraderProfileSchema.parse(req.body);
      const profile = await storage.createTraderProfile(validatedData);
      res.status(201).json(profile);
    } catch (error) {
      if (error instanceof z2.ZodError) {
        res.status(400).json({ error: error.errors });
      } else {
        res.status(500).json({ error: "Internal server error" });
      }
    }
  });
  app2.get("/api/trader-profile/:userId", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      if (isNaN(userId)) {
        return res.status(400).json({ error: "Invalid user ID" });
      }
      const profile = await storage.getTraderProfileByUserId(userId);
      if (!profile) {
        return res.status(404).json({ error: "Trader profile not found" });
      }
      res.json(profile);
    } catch (error) {
      res.status(500).json({ error: "Internal server error" });
    }
  });
  app2.put("/api/trader-profile/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ error: "Invalid profile ID" });
      }
      const updatedProfile = await storage.updateTraderProfile(id, req.body);
      if (!updatedProfile) {
        return res.status(404).json({ error: "Trader profile not found" });
      }
      res.json(updatedProfile);
    } catch (error) {
      if (error instanceof z2.ZodError) {
        res.status(400).json({ error: error.errors });
      } else {
        res.status(500).json({ error: "Internal server error" });
      }
    }
  });
  app2.post("/api/trade-entries", async (req, res) => {
    try {
      console.log("Received trade entry data:", req.body);
      const validatedData = insertTradeEntrySchema.parse(req.body);
      console.log("Validated trade entry data:", validatedData);
      const entry = await storage.createTradeEntry(validatedData);
      console.log("Created trade entry:", entry);
      res.status(201).json(entry);
    } catch (error) {
      console.error("Error creating trade entry:", error);
      if (error instanceof z2.ZodError) {
        res.status(400).json({ error: error.errors });
      } else {
        res.status(500).json({ error: "Internal server error" });
      }
    }
  });
  app2.get("/api/trade-entries/profile/:profileId", async (req, res) => {
    try {
      const profileId = parseInt(req.params.profileId);
      if (isNaN(profileId)) {
        return res.status(400).json({ error: "Invalid profile ID" });
      }
      const entries = await storage.getTradeEntriesByProfileId(profileId);
      res.json(entries);
    } catch (error) {
      res.status(500).json({ error: "Internal server error" });
    }
  });
  app2.get("/api/trade-entries/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ error: "Invalid entry ID" });
      }
      const entry = await storage.getTradeEntry(id);
      if (!entry) {
        return res.status(404).json({ error: "Trade entry not found" });
      }
      res.json(entry);
    } catch (error) {
      res.status(500).json({ error: "Internal server error" });
    }
  });
  app2.put("/api/trade-entries/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ error: "Invalid entry ID" });
      }
      const updatedEntry = await storage.updateTradeEntry(id, req.body);
      if (!updatedEntry) {
        return res.status(404).json({ error: "Trade entry not found" });
      }
      res.json(updatedEntry);
    } catch (error) {
      if (error instanceof z2.ZodError) {
        res.status(400).json({ error: error.errors });
      } else {
        res.status(500).json({ error: "Internal server error" });
      }
    }
  });
  app2.delete("/api/trade-entries/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ error: "Invalid entry ID" });
      }
      const success = await storage.deleteTradeEntry(id);
      if (!success) {
        return res.status(404).json({ error: "Trade entry not found" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Internal server error" });
    }
  });
  app2.get("/api/setup-quality-options", (req, res) => {
    res.json(setupQualityEnum.options);
  });
  app2.get("/api/trading-session-options", (req, res) => {
    res.json(tradingSessionEnum.options);
  });
  app2.get("/api/trading-emotion-options", (req, res) => {
    res.json(tradingEmotionEnum.options);
  });
  app2.get("/api/trade-status-options", (req, res) => {
    res.json(tradeStatusEnum.options);
  });
  app2.get("/api/user-pro-status", async (req, res) => {
    try {
      const userId = 1;
      const profile = await storage.getTraderProfileByUserId(userId);
      if (profile) {
        res.json({
          isPro: profile.isPro || false,
          proSince: profile.proSince || null
        });
      } else {
        res.json({
          isPro: false,
          proSince: null
        });
      }
    } catch (error) {
      console.error("Error fetching PRO status:", error);
      res.status(500).json({ error: "Failed to fetch PRO status" });
    }
  });
  app2.post("/api/simulate-payment", async (req, res) => {
    try {
      const { amount, description, firebaseId, email } = req.body;
      if (!amount || !description) {
        return res.status(400).json({
          success: false,
          message: "Amount and description are required"
        });
      }
      console.log(`Processing payment: $${amount} for ${description}`);
      let userId = 1;
      if (firebaseId) {
        const user = await storage.getUserByFirebaseId(firebaseId);
        if (user) {
          userId = user.id;
        } else if (email) {
          const emailUser = await storage.getUserByEmail(email);
          if (emailUser) {
            userId = emailUser.id;
          }
        }
      }
      let profile = await storage.getTraderProfileByUserId(userId);
      if (profile) {
        await storage.updateTraderProfile(profile.id, {
          isPro: true,
          proSince: /* @__PURE__ */ new Date()
        });
        console.log("Updated user profile to Pro status");
      } else {
        profile = await storage.createTraderProfile({
          userId,
          journalName: "My Trading Journal",
          initialCapital: "1000",
          strategy1: "",
          strategy2: "",
          strategy3: ""
        });
        await storage.updateTraderProfile(profile.id, {
          isPro: true,
          proSince: /* @__PURE__ */ new Date()
        });
        console.log("Created new user profile with Pro status");
      }
      return res.json({
        success: true,
        transactionId: `TR-${Date.now()}`,
        message: "Payment processed successfully"
      });
    } catch (error) {
      console.error("Error processing payment:", error);
      res.status(500).json({
        success: false,
        message: "Failed to process payment"
      });
    }
  });
  app2.post("/api/auth/firebase", async (req, res) => {
    try {
      const { firebaseId, email, displayName, photoURL } = req.body;
      if (!firebaseId) {
        return res.status(400).json({ error: "Firebase ID is required" });
      }
      let user = await storage.getUserByFirebaseId(firebaseId);
      if (!user) {
        if (email) {
          const existingUser = await storage.getUserByEmail(email);
          if (existingUser) {
            user = await storage.updateUser(existingUser.id, {
              firebaseId,
              displayName: displayName || existingUser.displayName,
              photoURL: photoURL || existingUser.photoURL,
              isFirebaseUser: true
            });
          }
        }
        if (!user) {
          const username = email ? email.split("@")[0] : `user_${Date.now()}`;
          user = await storage.createUser({
            username,
            email,
            firebaseId,
            displayName,
            photoURL,
            isFirebaseUser: true
          });
          await storage.createTraderProfile({
            userId: user.id,
            journalName: "My Trading Journal",
            initialCapital: "1000",
            strategy1: "",
            strategy2: "",
            strategy3: ""
          });
        }
      }
      const profile = await storage.getTraderProfileByUserId(user.id);
      res.json({
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          displayName: user.displayName,
          photoURL: user.photoURL
        },
        profile
      });
    } catch (error) {
      console.error("Firebase authentication error:", error);
      res.status(500).json({ error: "Authentication failed" });
    }
  });
  app2.get("/api/auth/user", async (req, res) => {
    try {
      const firebaseId = req.query.firebaseId;
      if (!firebaseId) {
        return res.status(401).json({ error: "Not authenticated" });
      }
      const user = await storage.getUserByFirebaseId(firebaseId);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
      const profile = await storage.getTraderProfileByUserId(user.id);
      res.json({
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          displayName: user.displayName,
          photoURL: user.photoURL
        },
        profile
      });
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ error: "Failed to fetch user" });
    }
  });
  app2.get("/api/user-pro-status/:firebaseId?", async (req, res) => {
    try {
      const firebaseId = req.params.firebaseId || req.query.firebaseId;
      let userId = 1;
      if (firebaseId) {
        const user = await storage.getUserByFirebaseId(firebaseId);
        if (user) {
          userId = user.id;
        }
      }
      const profile = await storage.getTraderProfileByUserId(userId);
      if (profile) {
        res.json({
          isPro: profile.isPro || false,
          proSince: profile.proSince || null
        });
      } else {
        res.json({
          isPro: false,
          proSince: null
        });
      }
    } catch (error) {
      console.error("Error fetching PRO status:", error);
      res.status(500).json({ error: "Failed to fetch PRO status" });
    }
  });
  (async () => {
    try {
      const existingUser = await storage.getUser(1);
      if (!existingUser) {
        await storage.createUser({
          username: "demo",
          password: "password"
          // In a real app, this would be hashed
        });
        console.log("Created demo user");
      }
    } catch (error) {
      console.error("Error creating demo user:", error);
    }
  })();
  const httpServer = createServer(app2);
  return httpServer;
}

// server/vite.ts
import express from "express";
import fs from "fs";
import path2 from "path";
import { createServer as createViteServer, createLogger } from "vite";

// vite.config.ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import themePlugin from "@replit/vite-plugin-shadcn-theme-json";
import path from "path";
import runtimeErrorOverlay from "@replit/vite-plugin-runtime-error-modal";
var vite_config_default = defineConfig({
  plugins: [
    react(),
    runtimeErrorOverlay(),
    themePlugin(),
    ...process.env.NODE_ENV !== "production" && process.env.REPL_ID !== void 0 ? [
      await import("@replit/vite-plugin-cartographer").then(
        (m) => m.cartographer()
      )
    ] : []
  ],
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "client", "src"),
      "@shared": path.resolve(import.meta.dirname, "shared"),
      "@assets": path.resolve(import.meta.dirname, "attached_assets")
    }
  },
  root: path.resolve(import.meta.dirname, "client"),
  build: {
    outDir: path.resolve(import.meta.dirname, "dist/public"),
    emptyOutDir: true
  }
});

// server/vite.ts
import { nanoid } from "nanoid";
var viteLogger = createLogger();
function log(message, source = "express") {
  const formattedTime = (/* @__PURE__ */ new Date()).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true
  });
  console.log(`${formattedTime} [${source}] ${message}`);
}
async function setupVite(app2, server) {
  const serverOptions = {
    middlewareMode: true,
    hmr: { server },
    allowedHosts: true
  };
  const vite = await createViteServer({
    ...vite_config_default,
    configFile: false,
    customLogger: {
      ...viteLogger,
      error: (msg, options) => {
        viteLogger.error(msg, options);
        process.exit(1);
      }
    },
    server: serverOptions,
    appType: "custom"
  });
  app2.use(vite.middlewares);
  app2.use("*", async (req, res, next) => {
    const url = req.originalUrl;
    try {
      const clientTemplate = path2.resolve(
        import.meta.dirname,
        "..",
        "client",
        "index.html"
      );
      let template = await fs.promises.readFile(clientTemplate, "utf-8");
      template = template.replace(
        `src="/src/main.tsx"`,
        `src="/src/main.tsx?v=${nanoid()}"`
      );
      const page = await vite.transformIndexHtml(url, template);
      res.status(200).set({ "Content-Type": "text/html" }).end(page);
    } catch (e) {
      vite.ssrFixStacktrace(e);
      next(e);
    }
  });
}
function serveStatic(app2) {
  const distPath = path2.resolve(import.meta.dirname, "public");
  if (!fs.existsSync(distPath)) {
    throw new Error(
      `Could not find the build directory: ${distPath}, make sure to build the client first`
    );
  }
  app2.use(express.static(distPath));
  app2.use("*", (_req, res) => {
    res.sendFile(path2.resolve(distPath, "index.html"));
  });
}

// server/index.ts
var app = express2();
app.use(express2.json());
app.use(express2.urlencoded({ extended: false }));
app.use((req, res, next) => {
  const start = Date.now();
  const path3 = req.path;
  let capturedJsonResponse = void 0;
  const originalResJson = res.json;
  res.json = function(bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };
  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path3.startsWith("/api")) {
      let logLine = `${req.method} ${path3} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }
      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "\u2026";
      }
      log(logLine);
    }
  });
  next();
});
(async () => {
  const server = await registerRoutes(app);
  app.use((err, _req, res, _next) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";
    res.status(status).json({ message });
    throw err;
  });
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }
  const port = 5e3;
  server.listen({
    port,
    host: "0.0.0.0",
    reusePort: true
  }, () => {
    log(`serving on port ${port}`);
  });
})();
