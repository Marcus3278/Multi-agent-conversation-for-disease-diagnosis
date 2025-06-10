import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Pause, Plus, FileText, AlertTriangle, Pill, Activity } from "lucide-react";
import { AGENT_CONFIGS, getAgentColor, getAgentBorderColor, type AgentType } from "@/lib/openai";
import { RiskAssessmentCard } from "./risk-assessment-card";
import { FollowUpPlanCard } from "./follow-up-plan-card";
import { CostEstimateCard } from "./cost-estimate-card";
import type { AgentMessage, DiagnosticConsensus } from "@shared/schema";

interface AgentPanelProps {
  messages?: AgentMessage[];
  consensus?: DiagnosticConsensus;
  conversationStatus?: string;
}

export function AgentPanel({ messages = [], consensus, conversationStatus }: AgentPanelProps) {
  const getLastActive = (agentType: AgentType): string => {
    const agentMessages = messages.filter(m => m.agentType === agentType);
    if (agentMessages.length === 0) return "Not active";
    
    const lastMessage = agentMessages[agentMessages.length - 1];
    const timeDiff = Date.now() - new Date(lastMessage.timestamp).getTime();
    const minutes = Math.floor(timeDiff / 60000);
    
    if (minutes < 1) return "30 sec ago";
    if (minutes < 60) return `${minutes} min ago`;
    return `${Math.floor(minutes / 60)}h ago`;
  };

  const getIconElement = (iconName: string, className: string = "w-4 h-4 text-white") => {
    const iconMap: Record<string, JSX.Element> = {
      'user-md': (
        <svg className={className} fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
        </svg>
      ),
      'heartbeat': (
        <svg className={className} fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
        </svg>
      ),
      'search': (
        <svg className={className} fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
        </svg>
      ),
      'clipboard-check': (
        <svg className={className} fill="currentColor" viewBox="0 0 20 20">
          <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
          <path fillRule="evenodd" d="M4 5a2 2 0 012-2v1a1 1 0 001 1h6a1 1 0 001-1V3a2 2 0 012 2v6.586l-1.293-1.293a1 1 0 00-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L16 11.586V5a2 2 0 00-2-2H6a2 2 0 00-2 2v10a2 2 0 002 2h4a1 1 0 100-2H6V5z" clipRule="evenodd" />
        </svg>
      )
    };
    return iconMap[iconName] || iconMap['user-md'];
  };

  return (
    <div className="w-80 bg-white border-l border-gray-200 p-6">
      <h3 className="text-lg font-medium text-gray-900 mb-4">Active Agents</h3>
      
      <div className="space-y-4">
        {Object.entries(AGENT_CONFIGS).map(([agentType, agent]) => {
          const agentColorClass = getAgentColor(agentType as AgentType);
          const borderColorClass = getAgentBorderColor(agentType as AgentType);
          const hasMessages = messages.some(m => m.agentType === agentType);
          
          return (
            <div
              key={agentType}
              className={`bg-gray-50 rounded-lg p-4 border-l-4 ${borderColorClass}`}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-2">
                  <div className={`w-8 h-8 ${agentColorClass} rounded-full flex items-center justify-center`}>
                    {getIconElement(agent.icon, "w-3 h-3 text-white")}
                  </div>
                  <span className="font-medium text-gray-900">
                    {agentType === 'gp' ? 'GP Agent' :
                     agentType === 'diagnostician' ? 'Sr. Diagnostician' :
                     agent.name.replace('Dr. ', '')}
                  </span>
                </div>
                <div className={`w-2 h-2 ${hasMessages ? 'bg-green-500' : 'bg-gray-300'} rounded-full`}></div>
              </div>
              <p className="text-sm text-gray-600 mb-2">{agent.description}</p>
              <div className="text-xs text-gray-500">
                <span>Last active: {getLastActive(agentType as AgentType)}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Diagnostic Summary */}
      {consensus && (
        <div className="mt-6 pt-6 border-t border-gray-200">
          <h4 className="font-medium text-gray-900 mb-3">Diagnostic Summary</h4>
          
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center space-x-2 mb-2">
              <svg className="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span className="font-medium text-green-800">Primary Diagnosis</span>
            </div>
            <p className="text-sm text-green-700 mb-2">{consensus.primaryDiagnosis}</p>
            <div className="text-xs text-green-600">
              <span>Confidence: {consensus.confidence}% • Consensus: {consensus.agentAgreement}/4 agents</span>
            </div>
          </div>

          {consensus.immediateActions.length > 0 && (
            <div className="mt-4 space-y-2">
              <h5 className="text-sm font-medium text-gray-700">Immediate Actions</h5>
              <div className="space-y-1 text-xs text-gray-600">
                {consensus.immediateActions.map((action, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    {action.toLowerCase().includes('urgent') || action.toLowerCase().includes('immediate') ? (
                      <AlertTriangle className="w-3 h-3 text-orange-500" />
                    ) : action.toLowerCase().includes('medication') || action.toLowerCase().includes('therapy') ? (
                      <Pill className="w-3 h-3 text-blue-500" />
                    ) : (
                      <Activity className="w-3 h-3 text-red-500" />
                    )}
                    <span>{action}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {consensus.differentialDiagnoses && consensus.differentialDiagnoses.length > 0 && (
            <div className="mt-4">
              <h5 className="text-sm font-medium text-gray-700 mb-2">Differential Diagnoses</h5>
              <div className="space-y-1">
                {consensus.differentialDiagnoses.map((diagnosis, index) => (
                  <Badge key={index} variant="outline" className="text-xs">
                    {diagnosis}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Enhanced Diagnostic Information */}
      {consensus && (
        <div className="mt-6 space-y-4">
          <RiskAssessmentCard consensus={consensus} />
          <FollowUpPlanCard consensus={consensus} />
          <CostEstimateCard consensus={consensus} />
        </div>
      )}

      {/* Conversation Controls */}
      {messages.length > 0 && (
        <div className="mt-6 pt-6 border-t border-gray-200">
          <h4 className="font-medium text-gray-900 mb-3">Conversation Controls</h4>
          <div className="space-y-2">
            <Button
              variant="outline"
              className="w-full bg-yellow-50 border-yellow-200 text-yellow-800 hover:bg-yellow-100"
              size="sm"
            >
              <Pause className="w-4 h-4 mr-2" />
              Pause Discussion
            </Button>
            <Button
              variant="default"
              className="w-full bg-blue-600 hover:bg-blue-700"
              size="sm"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Specialist
            </Button>
            <Button
              variant="outline"
              className="w-full"
              size="sm"
            >
              <FileText className="w-4 h-4 mr-2" />
              Generate Report
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
