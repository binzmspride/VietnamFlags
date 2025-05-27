import type { Express } from "express";
import { createServer, type Server } from "http";
import { setupAuth } from "./auth";
import { storage } from "./storage";
import { insertFlagSchema } from "@shared/schema";

export function registerRoutes(app: Express): Server {
  // sets up /api/register, /api/login, /api/logout, /api/user
  setupAuth(app);

  // Flag management routes
  app.get("/api/flags", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      const flags = await storage.getUserFlags(req.user!.id);
      res.json(flags);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch flags" });
    }
  });

  app.post("/api/flags", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      const validatedData = insertFlagSchema.parse(req.body);
      const flag = await storage.createFlag(req.user!.id, validatedData);
      res.status(201).json(flag);
    } catch (error) {
      res.status(400).json({ message: "Invalid flag data" });
    }
  });

  app.put("/api/flags/:id", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      const id = parseInt(req.params.id);
      const validatedData = insertFlagSchema.partial().parse(req.body);
      const flag = await storage.updateFlag(id, req.user!.id, validatedData);
      
      if (!flag) {
        return res.status(404).json({ message: "Flag not found" });
      }
      
      res.json(flag);
    } catch (error) {
      res.status(400).json({ message: "Invalid flag data" });
    }
  });

  app.delete("/api/flags/:id", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      const id = parseInt(req.params.id);
      const deleted = await storage.deleteFlag(id, req.user!.id);
      
      if (!deleted) {
        return res.status(404).json({ message: "Flag not found" });
      }
      
      res.sendStatus(204);
    } catch (error) {
      res.status(500).json({ message: "Failed to delete flag" });
    }
  });

  app.get("/api/flags/:id", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      const id = parseInt(req.params.id);
      const flag = await storage.getFlag(id, req.user!.id);
      
      if (!flag) {
        return res.status(404).json({ message: "Flag not found" });
      }
      
      res.json(flag);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch flag" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
