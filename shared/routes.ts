import { z } from 'zod';
import { insertEmployeeSchema, insertLeaveSchema, insertMealSchema, employees, leaves, meals } from './schema';

export const errorSchemas = {
  validation: z.object({ message: z.string(), field: z.string().optional() }),
  notFound: z.object({ message: z.string() }),
};

const employeeSchema = z.custom<typeof employees.$inferSelect>();
const leaveSchema = z.custom<typeof leaves.$inferSelect>();
const mealSchema = z.custom<typeof meals.$inferSelect>();

export const api = {
  employees: {
    list: {
      method: 'GET' as const,
      path: '/api/employees' as const,
      responses: { 200: z.array(employeeSchema) },
    },
    create: {
      method: 'POST' as const,
      path: '/api/employees' as const,
      input: insertEmployeeSchema,
      responses: { 201: employeeSchema, 400: errorSchemas.validation },
    },
    delete: {
      method: 'DELETE' as const,
      path: '/api/employees/:id' as const,
      responses: { 204: z.void(), 404: errorSchemas.notFound },
    }
  },
  leaves: {
    list: {
      method: 'GET' as const,
      path: '/api/leaves' as const,
      responses: { 200: z.array(leaveSchema) },
    },
    create: {
      method: 'POST' as const,
      path: '/api/leaves' as const,
      input: insertLeaveSchema,
      responses: { 201: leaveSchema, 400: errorSchemas.validation },
    },
    delete: {
      method: 'DELETE' as const,
      path: '/api/leaves/:id' as const,
      responses: { 204: z.void(), 404: errorSchemas.notFound },
    }
  },
  meals: {
    list: {
      method: 'GET' as const,
      path: '/api/meals' as const,
      responses: { 200: z.array(mealSchema) },
    },
    createOrUpdate: {
      method: 'POST' as const,
      path: '/api/meals' as const,
      input: insertMealSchema,
      responses: { 200: mealSchema, 201: mealSchema, 400: errorSchemas.validation },
    }
  }
};

export function buildUrl(path: string, params?: Record<string, string | number>): string {
  let url = path;
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (url.includes(`:${key}`)) {
        url = url.replace(`:${key}`, String(value));
      }
    });
  }
  return url;
}
