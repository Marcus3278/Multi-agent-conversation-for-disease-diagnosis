import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertMedicalCaseSchema, insertConversationSchema, type AgentMessage, type DiagnosticConsensus } from "@shared/schema";
import OpenAI from "openai";

const openai = new OpenAI({ 
  apiKey: process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY_ENV_VAR || ""
});

// Agent configurations
const AGENTS = {
  gp: {
    name: "Dr. General Practitioner",
    systemPrompt: "You are an experienced General Practitioner. Provide primary care assessment, initial differential diagnosis, and identify when specialist consultation is needed. Focus on common conditions and evidence-based practice. Be thorough but practical in your approach.",
    icon: "user-md",
    color: "blue"
  },
  cardiologist: {
    name: "Dr. Cardiologist",
    systemPrompt: "You are a board-certified Cardiologist. Provide expert cardiovascular assessment, interpret cardiac tests (ECG, echocardiograms, cardiac enzymes), and recommend appropriate cardiac interventions. Focus on heart-related conditions and their management.",
    icon: "heartbeat",
    color: "red"
  },
  research: {
    name: "Research Agent",
    systemPrompt: "You are a medical research specialist. Provide evidence-based analysis, cite current medical guidelines, calculate risk scores when applicable, and suggest differential diagnoses based on medical literature. Include relevant medical scores and guidelines.",
    icon: "search",
    color: "purple"
  },
  diagnostician: {
    name: "Senior Diagnostician",
    systemPrompt: "You are a senior diagnostic specialist. Synthesize information from other agents, provide final diagnostic assessment, and create comprehensive treatment recommendations. Focus on clinical decision-making and ensuring diagnostic accuracy.",
    icon: "clipboard-check",
    color: "teal"
  }
};

export async function registerRoutes(app: Express): Promise<Server> {
  
  // Create medical case
  app.post("/api/cases", async (req, res) => {
    try {
      const caseData = insertMedicalCaseSchema.parse(req.body);
      const medicalCase = await storage.createMedicalCase(caseData);
      res.json(medicalCase);
    } catch (error) {
      res.status(400).json({ error: "Invalid case data" });
    }
  });

  // Get all cases
  app.get("/api/cases", async (req, res) => {
    try {
      const cases = await storage.getAllMedicalCases();
      res.json(cases);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch cases" });
    }
  });

  // Get specific case
  app.get("/api/cases/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const medicalCase = await storage.getMedicalCase(id);
      if (!medicalCase) {
        return res.status(404).json({ error: "Case not found" });
      }
      res.json(medicalCase);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch case" });
    }
  });

  // Start conversation for a case
  app.post("/api/conversations", async (req, res) => {
    try {
      const { caseId } = req.body;
      const medicalCase = await storage.getMedicalCase(caseId);
      if (!medicalCase) {
        return res.status(404).json({ error: "Case not found" });
      }

      // Check if conversation already exists
      const existingConversation = await storage.getConversationByCase(caseId);
      if (existingConversation) {
        return res.json(existingConversation);
      }

      // Create new conversation
      const conversation = await storage.createConversation({
        caseId,
        messages: [],
        status: "active",
        consensus: null
      });

      res.json(conversation);
    } catch (error) {
      res.status(500).json({ error: "Failed to create conversation" });
    }
  });

  // Get conversation
  app.get("/api/conversations/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const conversation = await storage.getConversation(id);
      if (!conversation) {
        return res.status(404).json({ error: "Conversation not found" });
      }
      res.json(conversation);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch conversation" });
    }
  });

  // Get conversation by case
  app.get("/api/conversations/case/:caseId", async (req, res) => {
    try {
      const caseId = parseInt(req.params.caseId);
      const conversation = await storage.getConversationByCase(caseId);
      if (!conversation) {
        return res.status(404).json({ error: "Conversation not found" });
      }
      res.json(conversation);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch conversation" });
    }
  });

  // Start agent consultation
  app.post("/api/conversations/:id/start", async (req, res) => {
    try {
      const conversationId = parseInt(req.params.id);
      const conversation = await storage.getConversation(conversationId);
      if (!conversation) {
        return res.status(404).json({ error: "Conversation not found" });
      }

      const medicalCase = await storage.getMedicalCase(conversation.caseId);
      if (!medicalCase) {
        return res.status(404).json({ error: "Case not found" });  
      }

      // Generate responses from all agents
      const messages: AgentMessage[] = [];
      const agentOrder = ['gp', 'cardiologist', 'research', 'diagnostician'] as const;

      for (const agentType of agentOrder) {
        const agent = AGENTS[agentType];
        const startTime = Date.now();

        try {
          // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
          const response = await openai.chat.completions.create({
            model: "gpt-4o",
            messages: [
              {
                role: "system",
                content: `${agent.systemPrompt}

You are participating in a multi-agent medical consultation. Other specialists will also provide their input. 

Case Information:
- Patient ID: ${medicalCase.patientId}
- Age: ${medicalCase.age}
- Gender: ${medicalCase.gender}
- Chief Complaint: ${medicalCase.chiefComplaint}
- Symptoms & History: ${medicalCase.symptomsHistory}
- Test Results: ${medicalCase.testResults || 'None provided'}

Previous agent responses:
${messages.map(m => `${m.agentName}: ${m.content}`).join('\n\n')}

Provide your professional assessment in JSON format with the following structure:
{
  "assessment": "Your detailed clinical assessment and recommendations",
  "confidence": 85,
  "key_points": ["point1", "point2", "point3"],
  "recommendations": ["rec1", "rec2"]
}`
              }
            ],
            response_format: { type: "json_object" },
            temperature: 0.7
          });

          const responseTime = Date.now() - startTime;
          const result = JSON.parse(response.choices[0].message.content || '{}');

          const message: AgentMessage = {
            id: `${agentType}-${Date.now()}`,
            agentType,
            agentName: agent.name,
            content: result.assessment || "No assessment provided",
            confidence: result.confidence || 75,
            timestamp: new Date().toISOString(),
            responseTime: responseTime,
            references: result.key_points || []
          };

          messages.push(message);
        } catch (error) {
          console.error(`Error generating response for ${agentType}:`, error);
          // Add fallback message on error
          const message: AgentMessage = {
            id: `${agentType}-${Date.now()}`,
            agentType,
            agentName: agent.name,
            content: "Unable to generate response at this time. Please try again.",
            confidence: 0,
            timestamp: new Date().toISOString(),
            responseTime: 0,
            references: []
          };
          messages.push(message);
        }
      }

      // Generate consensus
      let consensus: DiagnosticConsensus | null = null;
      try {
        const consensusResponse = await openai.chat.completions.create({
          model: "gpt-4o",
          messages: [
            {
              role: "system",
              content: `Analyze the following medical agent responses and create a comprehensive diagnostic consensus. Provide a JSON response with the following structure:
{
  "primaryDiagnosis": "Most likely diagnosis",
  "confidence": 90,
  "agentAgreement": 4,
  "immediateActions": ["action1", "action2"],
  "differentialDiagnoses": ["diff1", "diff2"],
  "riskAssessment": {
    "level": "high",
    "factors": ["factor1", "factor2"]
  },
  "followUpPlan": ["followup1", "followup2"],
  "estimatedCosts": {
    "diagnostic": "Estimated diagnostic costs and procedures",
    "treatment": "Estimated treatment costs and timeline"
  }
}`
            },
            {
              role: "user",
              content: `Agent Responses:
${messages.map(m => `${m.agentName} (Confidence: ${m.confidence}%): ${m.content}`).join('\n\n')}`
            }
          ],
          response_format: { type: "json_object" },
          temperature: 0.3
        });

        const consensusResult = JSON.parse(consensusResponse.choices[0].message.content || '{}');
        consensus = {
          primaryDiagnosis: consensusResult.primaryDiagnosis || "Unable to determine primary diagnosis",
          confidence: consensusResult.confidence || 50,
          agentAgreement: consensusResult.agentAgreement || 0,
          immediateActions: consensusResult.immediateActions || [],
          differentialDiagnoses: consensusResult.differentialDiagnoses || [],
          riskAssessment: consensusResult.riskAssessment || {
            level: "medium",
            factors: ["Insufficient data for risk assessment"]
          },
          followUpPlan: consensusResult.followUpPlan || [],
          estimatedCosts: consensusResult.estimatedCosts || {
            diagnostic: "Cost analysis not available",
            treatment: "Cost analysis not available"
          }
        };
      } catch (error) {
        console.error("Error generating consensus:", error);
        consensus = {
          primaryDiagnosis: "Consensus generation failed",
          confidence: 0,
          agentAgreement: 0,
          immediateActions: ["Retry consultation"],
          differentialDiagnoses: [],
          riskAssessment: {
            level: "medium",
            factors: ["Unable to assess risk due to system error"]
          },
          followUpPlan: ["Retry consultation with additional information"],
          estimatedCosts: {
            diagnostic: "Unable to estimate",
            treatment: "Unable to estimate"
          }
        };
      }

      // Update conversation
      const updatedConversation = await storage.updateConversation(conversationId, {
        messages: messages,
        consensus: consensus,
        status: "completed"
      });

      res.json(updatedConversation);
    } catch (error) {
      console.error("Error starting consultation:", error);
      res.status(500).json({ error: "Failed to start consultation" });
    }
  });

  // Add follow-up question
  app.post("/api/conversations/:id/message", async (req, res) => {
    try {
      const conversationId = parseInt(req.params.id);
      const { message } = req.body;

      const conversation = await storage.getConversation(conversationId);
      if (!conversation) {
        return res.status(404).json({ error: "Conversation not found" });
      }

      const medicalCase = await storage.getMedicalCase(conversation.caseId);
      if (!medicalCase) {
        return res.status(404).json({ error: "Case not found" });
      }

      // Generate response from diagnostician for follow-up
      const agent = AGENTS.diagnostician;
      const startTime = Date.now();

      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: `${agent.systemPrompt}

Previous conversation context:
${Array.isArray(conversation.messages) ? conversation.messages.map((m: any) => `${m.agentName}: ${m.content}`).join('\n\n') : ''}

Follow-up question: ${message}

Provide a JSON response addressing the follow-up question:
{
  "response": "Your response to the follow-up question",
  "confidence": 85,
  "additional_recommendations": ["rec1", "rec2"]
}`
          }
        ],
        response_format: { type: "json_object" },
        temperature: 0.7
      });

      const responseTime = Date.now() - startTime;
      const result = JSON.parse(response.choices[0].message.content || '{}');

      const newMessage: AgentMessage = {
        id: `followup-${Date.now()}`,
        agentType: 'diagnostician',
        agentName: agent.name,
        content: result.response || "Unable to provide response",
        confidence: result.confidence || 75,
        timestamp: new Date().toISOString(),
        responseTime: responseTime,
        references: result.additional_recommendations || []
      };

      const currentMessages = Array.isArray(conversation.messages) ? conversation.messages : [];
      const updatedMessages = [...currentMessages, newMessage];

      const updatedConversation = await storage.updateConversation(conversationId, {
        messages: updatedMessages
      });

      res.json(updatedConversation);
    } catch (error) {
      console.error("Error adding follow-up message:", error);
      res.status(500).json({ error: "Failed to add follow-up message" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
