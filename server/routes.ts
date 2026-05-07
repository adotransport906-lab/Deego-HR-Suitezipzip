import type { Express } from "express";
import type { Server } from "http";
import { storage } from "./storage";

export async function registerRoutes(httpServer: Server, app: Express): Promise<Server> {

  // ─── Public config (Supabase anon key for frontend realtime) ──
  app.get("/api/config", (_req, res) => {
    res.json({
      supabaseUrl: process.env.SUPABASE_URL ?? "",
      supabaseAnonKey: process.env.SUPABASE_ANON_KEY ?? "",
    });
  });

  // ─── Employees ───────────────────────────────────────────────
  app.get("/api/employees", async (_req, res) => {
    try {
      res.json(await storage.getEmployees());
    } catch (err: any) {
      res.status(500).json({ message: err.message });
    }
  });

  app.post("/api/employees", async (req, res) => {
    try {
      const data = await storage.createEmployee(req.body);
      res.status(201).json(data);
    } catch (err: any) {
      res.status(400).json({ message: err.message });
    }
  });

  app.patch("/api/employees/:id", async (req, res) => {
    try {
      const data = await storage.updateEmployee(Number(req.params.id), req.body);
      res.json(data);
    } catch (err: any) {
      res.status(400).json({ message: err.message });
    }
  });

  app.delete("/api/employees/:id", async (req, res) => {
    try {
      await storage.deleteEmployee(Number(req.params.id));
      res.status(204).send();
    } catch (err: any) {
      res.status(400).json({ message: err.message });
    }
  });

  // ─── Leaves ──────────────────────────────────────────────────
  app.get("/api/leaves", async (_req, res) => {
    try {
      res.json(await storage.getLeaves());
    } catch (err: any) {
      res.status(500).json({ message: err.message });
    }
  });

  app.post("/api/leaves", async (req, res) => {
    try {
      const data = await storage.createLeave(req.body);
      res.status(201).json(data);
    } catch (err: any) {
      res.status(400).json({ message: err.message });
    }
  });

  app.delete("/api/leaves/:id", async (req, res) => {
    try {
      await storage.deleteLeave(Number(req.params.id));
      res.status(204).send();
    } catch (err: any) {
      res.status(400).json({ message: err.message });
    }
  });

  // ─── Meals ────────────────────────────────────────────────────
  app.get("/api/meals", async (_req, res) => {
    try {
      res.json(await storage.getMeals());
    } catch (err: any) {
      res.status(500).json({ message: err.message });
    }
  });

  app.post("/api/meals", async (req, res) => {
    try {
      const data = await storage.setMeal(req.body);
      res.status(201).json(data);
    } catch (err: any) {
      res.status(400).json({ message: err.message });
    }
  });

  // ─── Attendance ───────────────────────────────────────────────
  app.get("/api/attendance", async (_req, res) => {
    try {
      res.json(await storage.getAttendance());
    } catch (err: any) {
      res.status(500).json({ message: err.message });
    }
  });

  app.post("/api/attendance", async (req, res) => {
    try {
      const data = await storage.setAttendance(req.body);
      res.status(201).json(data);
    } catch (err: any) {
      res.status(400).json({ message: err.message });
    }
  });

  app.delete("/api/attendance/:id", async (req, res) => {
    try {
      await storage.deleteAttendance(Number(req.params.id));
      res.status(204).send();
    } catch (err: any) {
      res.status(400).json({ message: err.message });
    }
  });

  // ─── Overtime ─────────────────────────────────────────────────
  app.get("/api/overtime", async (_req, res) => {
    try {
      res.json(await storage.getOvertime());
    } catch (err: any) {
      res.status(500).json({ message: err.message });
    }
  });

  app.post("/api/overtime", async (req, res) => {
    try {
      const data = await storage.createOvertime(req.body);
      res.status(201).json(data);
    } catch (err: any) {
      res.status(400).json({ message: err.message });
    }
  });

  app.patch("/api/overtime/:id", async (req, res) => {
    try {
      const data = await storage.updateOvertime(Number(req.params.id), req.body);
      res.json(data);
    } catch (err: any) {
      res.status(400).json({ message: err.message });
    }
  });

  app.delete("/api/overtime/:id", async (req, res) => {
    try {
      await storage.deleteOvertime(Number(req.params.id));
      res.status(204).send();
    } catch (err: any) {
      res.status(400).json({ message: err.message });
    }
  });

  // ─── Kitchen Expenses ─────────────────────────────────────────
  app.get("/api/kitchen-expenses", async (_req, res) => {
    try {
      res.json(await storage.getKitchenExpenses());
    } catch (err: any) {
      res.status(500).json({ message: err.message });
    }
  });

  app.post("/api/kitchen-expenses", async (req, res) => {
    try {
      const data = await storage.createKitchenExpense(req.body);
      res.status(201).json(data);
    } catch (err: any) {
      res.status(400).json({ message: err.message });
    }
  });

  app.patch("/api/kitchen-expenses/:id", async (req, res) => {
    try {
      const data = await storage.updateKitchenExpense(Number(req.params.id), req.body);
      res.json(data);
    } catch (err: any) {
      res.status(400).json({ message: err.message });
    }
  });

  app.delete("/api/kitchen-expenses/:id", async (req, res) => {
    try {
      await storage.deleteKitchenExpense(Number(req.params.id));
      res.status(204).send();
    } catch (err: any) {
      res.status(400).json({ message: err.message });
    }
  });

  // ─── Office Expenses ──────────────────────────────────────────
  app.get("/api/office-expenses", async (_req, res) => {
    try {
      res.json(await storage.getOfficeExpenses());
    } catch (err: any) {
      res.status(500).json({ message: err.message });
    }
  });

  app.post("/api/office-expenses", async (req, res) => {
    try {
      const data = await storage.createOfficeExpense(req.body);
      res.status(201).json(data);
    } catch (err: any) {
      res.status(400).json({ message: err.message });
    }
  });

  app.patch("/api/office-expenses/:id", async (req, res) => {
    try {
      const data = await storage.updateOfficeExpense(Number(req.params.id), req.body);
      res.json(data);
    } catch (err: any) {
      res.status(400).json({ message: err.message });
    }
  });

  app.delete("/api/office-expenses/:id", async (req, res) => {
    try {
      await storage.deleteOfficeExpense(Number(req.params.id));
      res.status(204).send();
    } catch (err: any) {
      res.status(400).json({ message: err.message });
    }
  });

  return httpServer;
}
