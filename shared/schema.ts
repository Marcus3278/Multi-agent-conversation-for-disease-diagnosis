import { pgTable, text, serial, integer, boolean, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const medicalCases = pgTable("medical_cases", {
  id: serial("id").primaryKey(),
  patientId: text("patient_id").notNull(),
  age: integer("age").notNull(),
  gender: text("gender").notNull(),
  chiefComplaint: text("chief_complaint").notNull(),
  symptomsHistory: text("symptoms_history").notNull(),
  testResults: text("test_results"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const conversations = pgTable("conversations", {
  id: serial("id").primaryKey(),
  caseId: integer("case_id").references(() => medicalCases.id).notNull(),
  messages: jsonb("messages").notNull(),
  status: text("status").notNull().default("active"), // active, paused, completed
  consensus: jsonb("consensus"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export const insertMedicalCaseSchema = createInsertSchema(medicalCases).omit({
  id: true,
  createdAt: true,
});

export const insertConversationSchema = createInsertSchema(conversations).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type MedicalCase = typeof medicalCases.$inferSelect;
export type InsertMedicalCase = z.infer<typeof insertMedicalCaseSchema>;
export type Conversation = typeof conversations.$inferSelect;
export type InsertConversation = z.infer<typeof insertConversationSchema>;

export interface AgentMessage {
  id: string;
  agentType: 'gp' | 'cardiologist' | 'research' | 'diagnostician';
  agentName: string;
  content: string;
  confidence: number;
  timestamp: string;
  responseTime: number;
  references?: string[];
}

export interface DiagnosticConsensus {
  primaryDiagnosis: string;
  confidence: number;
  agentAgreement: number;
  immediateActions: string[];
  differentialDiagnoses?: string[];
  riskAssessment?: {
    level: 'low' | 'medium' | 'high' | 'critical';
    factors: string[];
  };
  followUpPlan?: string[];
  estimatedCosts?: {
    diagnostic: string;
    treatment: string;
  };
}
