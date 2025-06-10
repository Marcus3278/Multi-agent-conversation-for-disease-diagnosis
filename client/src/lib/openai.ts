// Agent types and configurations for the frontend
export const AGENT_CONFIGS = {
  gp: {
    name: "Dr. General Practitioner",
    icon: "user-md",
    color: "blue",
    description: "Primary care assessment and initial differential diagnosis"
  },
  cardiologist: {
    name: "Dr. Cardiologist", 
    icon: "heartbeat",
    color: "red",
    description: "Cardiovascular specialist evaluation and treatment recommendations"
  },
  research: {
    name: "Research Agent",
    icon: "search", 
    color: "purple",
    description: "Evidence-based medicine and literature review"
  },
  diagnostician: {
    name: "Senior Diagnostician",
    icon: "clipboard-check",
    color: "teal",
    description: "Clinical decision synthesis and final diagnosis"
  }
} as const;

export type AgentType = keyof typeof AGENT_CONFIGS;

export function getAgentColor(agentType: AgentType): string {
  const colorMap = {
    blue: "bg-blue-500",
    red: "bg-red-500", 
    purple: "bg-purple-500",
    teal: "bg-teal-500"
  };
  return colorMap[AGENT_CONFIGS[agentType].color];
}

export function getAgentBorderColor(agentType: AgentType): string {
  const colorMap = {
    blue: "border-blue-500",
    red: "border-red-500",
    purple: "border-purple-500", 
    teal: "border-teal-500"
  };
  return colorMap[AGENT_CONFIGS[agentType].color];
}
