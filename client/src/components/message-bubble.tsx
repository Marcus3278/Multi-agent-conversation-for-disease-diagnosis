import { Brain, Clock } from "lucide-react";
import { AGENT_CONFIGS, getAgentColor, type AgentType } from "@/lib/openai";
import type { AgentMessage } from "@shared/schema";

interface MessageBubbleProps {
  message: AgentMessage;
}

export function MessageBubble({ message }: MessageBubbleProps) {
  const agent = AGENT_CONFIGS[message.agentType];
  const agentColorClass = getAgentColor(message.agentType);
  
  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  const getIconElement = (iconName: string) => {
    const iconMap: Record<string, JSX.Element> = {
      'user-md': (
        <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
        </svg>
      ),
      'heartbeat': (
        <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
        </svg>
      ),
      'search': (
        <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
        </svg>
      ),
      'clipboard-check': (
        <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
          <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
          <path fillRule="evenodd" d="M4 5a2 2 0 012-2v1a1 1 0 001 1h6a1 1 0 001-1V3a2 2 0 012 2v6.586l-1.293-1.293a1 1 0 00-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L16 11.586V5a2 2 0 00-2-2H6a2 2 0 00-2 2v10a2 2 0 002 2h4a1 1 0 100-2H6V5z" clipRule="evenodd" />
        </svg>
      )
    };
    return iconMap[iconName] || iconMap['user-md'];
  };

  return (
    <div className="flex items-start space-x-3">
      <div className={`w-10 h-10 ${agentColorClass} rounded-full flex items-center justify-center flex-shrink-0`}>
        {getIconElement(agent.icon)}
      </div>
      <div className="flex-1">
        <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="font-medium text-gray-900">{message.agentName}</span>
            <span className="text-xs text-gray-500">{formatTime(message.timestamp)}</span>
          </div>
          <p className="text-gray-700 leading-relaxed">{message.content}</p>
          <div className="mt-3 flex items-center space-x-4 text-xs text-gray-500">
            <span className="flex items-center">
              <Brain className="w-3 h-3 mr-1" />
              Confidence: {message.confidence}%
            </span>
            <span className="flex items-center">
              <Clock className="w-3 h-3 mr-1" />
              Response time: {(message.responseTime / 1000).toFixed(1)}s
            </span>
          </div>
          {message.references && message.references.length > 0 && (
            <div className="mt-3">
              <div className="flex flex-wrap gap-2">
                {message.references.map((ref, index) => (
                  <span
                    key={index}
                    className={`px-2 py-1 rounded text-xs ${
                      message.agentType === 'research' 
                        ? 'bg-purple-100 text-purple-700'
                        : 'bg-gray-100 text-gray-700'
                    }`}
                  >
                    {ref}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
