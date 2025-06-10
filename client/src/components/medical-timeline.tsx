import { Clock, CheckCircle, AlertCircle, Info } from "lucide-react";
import type { AgentMessage } from "@shared/schema";

interface MedicalTimelineProps {
  messages: AgentMessage[];
}

export function MedicalTimeline({ messages }: MedicalTimelineProps) {
  if (messages.length === 0) return null;

  const timelineEvents = messages.map((message, index) => ({
    id: message.id,
    agent: message.agentName,
    agentType: message.agentType,
    content: message.content.substring(0, 100) + (message.content.length > 100 ? '...' : ''),
    timestamp: message.timestamp,
    confidence: message.confidence,
    isLast: index === messages.length - 1
  }));

  const getAgentIcon = (agentType: string) => {
    switch (agentType) {
      case 'gp':
        return <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
        </svg>;
      case 'cardiologist':
        return <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
        </svg>;
      case 'research':
        return <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
        </svg>;
      case 'diagnostician':
        return <CheckCircle className="w-3 h-3 text-white" />;
      default:
        return <Info className="w-3 h-3 text-white" />;
    }
  };

  const getAgentColor = (agentType: string) => {
    switch (agentType) {
      case 'gp': return 'bg-blue-500';
      case 'cardiologist': return 'bg-red-500';
      case 'research': return 'bg-purple-500';
      case 'diagnostician': return 'bg-teal-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4">
      <div className="flex items-center space-x-2 mb-4">
        <Clock className="w-4 h-4 text-gray-600" />
        <h3 className="font-medium text-gray-900">Consultation Timeline</h3>
      </div>
      
      <div className="space-y-4">
        {timelineEvents.map((event, index) => (
          <div key={event.id} className="flex space-x-3">
            <div className="flex flex-col items-center">
              <div className={`w-6 h-6 ${getAgentColor(event.agentType)} rounded-full flex items-center justify-center`}>
                {getAgentIcon(event.agentType)}
              </div>
              {!event.isLast && <div className="w-0.5 h-8 bg-gray-200 mt-2"></div>}
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm font-medium text-gray-900">{event.agent}</span>
                <span className="text-xs text-gray-500">
                  {new Date(event.timestamp).toLocaleTimeString('en-US', {
                    hour: 'numeric',
                    minute: '2-digit'
                  })}
                </span>
              </div>
              <p className="text-sm text-gray-600 mb-1">{event.content}</p>
              <div className="flex items-center space-x-2">
                <span className="text-xs text-gray-500">Confidence: {event.confidence}%</span>
                <div className="w-16 bg-gray-200 rounded-full h-1">
                  <div 
                    className="bg-green-500 h-1 rounded-full" 
                    style={{ width: `${event.confidence}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}