import { users, medicalCases, conversations, type User, type InsertUser, type MedicalCase, type InsertMedicalCase, type Conversation, type InsertConversation } from "@shared/schema";

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Medical cases
  createMedicalCase(medicalCase: InsertMedicalCase): Promise<MedicalCase>;
  getMedicalCase(id: number): Promise<MedicalCase | undefined>;
  getAllMedicalCases(): Promise<MedicalCase[]>;
  
  // Conversations
  createConversation(conversation: InsertConversation): Promise<Conversation>;
  getConversation(id: number): Promise<Conversation | undefined>;
  getConversationByCase(caseId: number): Promise<Conversation | undefined>;
  updateConversation(id: number, updates: Partial<Conversation>): Promise<Conversation | undefined>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private medicalCases: Map<number, MedicalCase>;
  private conversations: Map<number, Conversation>;
  private currentUserId: number;
  private currentCaseId: number;
  private currentConversationId: number;

  constructor() {
    this.users = new Map();
    this.medicalCases = new Map();
    this.conversations = new Map();
    this.currentUserId = 1;
    this.currentCaseId = 1;
    this.currentConversationId = 1;
  }

  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  async createMedicalCase(insertCase: InsertMedicalCase): Promise<MedicalCase> {
    const id = this.currentCaseId++;
    const medicalCase: MedicalCase = {
      ...insertCase,
      id,
      testResults: insertCase.testResults || null,
      createdAt: new Date(),
    };
    this.medicalCases.set(id, medicalCase);
    return medicalCase;
  }

  async getMedicalCase(id: number): Promise<MedicalCase | undefined> {
    return this.medicalCases.get(id);
  }

  async getAllMedicalCases(): Promise<MedicalCase[]> {
    return Array.from(this.medicalCases.values());
  }

  async createConversation(insertConversation: InsertConversation): Promise<Conversation> {
    const id = this.currentConversationId++;
    const conversation: Conversation = {
      caseId: insertConversation.caseId,
      messages: insertConversation.messages,
      status: insertConversation.status || "active",
      consensus: insertConversation.consensus || null,
      id,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.conversations.set(id, conversation);
    return conversation;
  }

  async getConversation(id: number): Promise<Conversation | undefined> {
    return this.conversations.get(id);
  }

  async getConversationByCase(caseId: number): Promise<Conversation | undefined> {
    return Array.from(this.conversations.values()).find(
      (conversation) => conversation.caseId === caseId,
    );
  }

  async updateConversation(id: number, updates: Partial<Conversation>): Promise<Conversation | undefined> {
    const conversation = this.conversations.get(id);
    if (!conversation) return undefined;
    
    const updated = {
      ...conversation,
      ...updates,
      updatedAt: new Date(),
    };
    this.conversations.set(id, updated);
    return updated;
  }
}

export const storage = new MemStorage();
