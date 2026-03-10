import type { Express } from "express";
import type { Server } from "http";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { z } from "zod";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {

  app.get(api.employees.list.path, async (req, res) => {
    const data = await storage.getEmployees();
    res.json(data);
  });

  app.post(api.employees.create.path, async (req, res) => {
    try {
      const input = api.employees.create.input.parse(req.body);
      const data = await storage.createEmployee(input);
      res.status(201).json(data);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0].message });
      }
      throw err;
    }
  });

  app.delete(api.employees.delete.path, async (req, res) => {
    await storage.deleteEmployee(Number(req.params.id));
    res.status(204).send();
  });

  app.get(api.leaves.list.path, async (req, res) => {
    const data = await storage.getLeaves();
    res.json(data);
  });

  app.post(api.leaves.create.path, async (req, res) => {
    try {
      const bodySchema = api.leaves.create.input.extend({
        employeeId: z.coerce.number(),
        nepaliMonth: z.coerce.number(),
        day: z.coerce.number(),
      });
      const input = bodySchema.parse(req.body);
      const data = await storage.createLeave(input);
      res.status(201).json(data);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0].message });
      }
      throw err;
    }
  });

  app.delete(api.leaves.delete.path, async (req, res) => {
    await storage.deleteLeave(Number(req.params.id));
    res.status(204).send();
  });

  app.get(api.meals.list.path, async (req, res) => {
    const data = await storage.getMeals();
    res.json(data);
  });

  app.post(api.meals.createOrUpdate.path, async (req, res) => {
    try {
      const bodySchema = api.meals.createOrUpdate.input.extend({
        employeeId: z.coerce.number(),
        nepaliMonth: z.coerce.number(),
        day: z.coerce.number(),
      });
      const input = bodySchema.parse(req.body);
      const data = await storage.setMeal(input);
      res.status(201).json(data);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0].message });
      }
      throw err;
    }
  });

  // Seed DB if empty
  setTimeout(async () => {
    try {
      const employees = await storage.getEmployees();
      if (employees.length === 0) {
        const emp1 = await storage.createEmployee({
          employeeId: "EMP001",
          name: "Ram Bahadur",
          designation: "Manager",
          department: "HR"
        });
        const emp2 = await storage.createEmployee({
          employeeId: "EMP002",
          name: "Sita Sharma",
          designation: "Technician",
          department: "Manufacturing"
        });
        await storage.createLeave({
          employeeId: emp1.id,
          nepaliMonth: 1, 
          day: 5
        });
        await storage.setMeal({
          employeeId: emp1.id,
          nepaliMonth: 1,
          day: 1,
          hasMeal: true
        });
        await storage.setMeal({
          employeeId: emp2.id,
          nepaliMonth: 1,
          day: 1,
          hasMeal: false
        });
      }
    } catch (e) {
      console.error("Failed to seed database:", e);
    }
  }, 1000);

  return httpServer;
}
