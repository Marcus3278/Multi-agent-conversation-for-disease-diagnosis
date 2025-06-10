import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send, CheckCircle, Download, Clock, FileText, BarChart } from "lucide-react";
import { MessageBubble } from "./message-bubble";
import { MedicalTimeline } from "./medical-timeline";
import { DiagnosticComparison } from "./diagnostic-comparison";
import { MedicalReportGenerator } from "./medical-report-generator";
import type { AgentMessage, DiagnosticConsensus } from "@shared/schema";

interface ConversationAreaProps {
  messages?: AgentMessage[];
  consensus?: DiagnosticConsensus;
  conversationStatus?: string;
  onSendMessage: (message: string) => void;
  isSendingMessage: boolean;
  activeCase?: {
    patientId: string;
    age: number;
    gender: string;
  } | null;
}

export function ConversationArea({
  messages = [],
  consensus,
  conversationStatus,
  onSendMessage,
  isSendingMessage,
  activeCase
}: ConversationAreaProps) {
  const [followUpMessage, setFollowUpMessage] = useState("");
  const [showTimeline, setShowTimeline] = useState(false);
  const [showComparison, setShowComparison] = useState(false);
  const [showReportGenerator, setShowReportGenerator] = useState(false);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!followUpMessage.trim() || isSendingMessage) return;
    onSendMessage(followUpMessage);
    setFollowUpMessage("");
  };

  const handleExport = () => {
    const conversationData = {
      case: activeCase,
      messages,
      consensus,
      exportedAt: new Date().toISOString()
    };
    
    const blob = new Blob([JSON.stringify(conversationData, null, 2)], {
      type: 'application/json'
    });
    
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `medical-consultation-${activeCase?.patientId || 'case'}-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex-1 flex flex-col">
      {/* Top Bar */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">
              {messages.length > 0 ? "Active Consultation" : "Medical Diagnosis Platform"}
            </h2>
            {activeCase && (
              <p className="text-sm text-gray-500">
                Case: {activeCase.patientId} - {activeCase.age}yo {activeCase.gender}
              </p>
            )}
          </div>
          <div className="flex items-center space-x-3">
            {messages.length > 0 && (
              <>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-sm text-gray-600">4 Agents Active</span>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowTimeline(!showTimeline)}
                  className="text-gray-700"
                >
                  <Clock className="w-4 h-4 mr-2" />
                  {showTimeline ? 'Hide' : 'Show'} Timeline
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowComparison(!showComparison)}
                  className="text-gray-700"
                >
                  <BarChart className="w-4 h-4 mr-2" />
                  Analysis
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowReportGenerator(true)}
                  className="text-gray-700"
                >
                  <FileText className="w-4 h-4 mr-2" />
                  Report
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleExport}
                  className="text-gray-700"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Export
                </Button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Conversation Messages */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {messages.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Active Consultation</h3>
              <p className="text-gray-500">Create a patient case and start an agent consultation to begin</p>
            </div>
          </div>
        ) : (
          <>
            {/* Timeline View */}
            {showTimeline && messages.length > 0 && (
              <div className="mb-6">
                <MedicalTimeline messages={messages} />
              </div>
            )}
            
            {/* Comparison Analysis View */}
            {showComparison && messages.length > 0 && (
              <div className="mb-6">
                <DiagnosticComparison messages={messages} consensus={consensus} />
              </div>
            )}
            
            {/* Default Message View */}
            {!showTimeline && !showComparison && messages.map((message) => (
              <MessageBubble key={message.id} message={message} />
            ))}

            {/* Consensus Status */}
            {consensus && conversationStatus === "completed" && (
              <div className="flex justify-center py-4">
                <div className="bg-green-50 border border-green-200 rounded-lg px-4 py-3 flex items-center space-x-3">
                  <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                    <CheckCircle className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <p className="text-green-800 font-medium text-sm">Diagnostic Consensus Reached</p>
                    <p className="text-green-600 text-xs">
                      {consensus.agentAgreement}/4 agents agree • {consensus.confidence}% confidence
                    </p>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Message Input */}
      {messages.length > 0 && (
        <div className="border-t border-gray-200 p-4 bg-white">
          <form onSubmit={handleSendMessage} className="flex items-center space-x-3">
            <div className="flex-1">
              <Input
                type="text"
                className="w-full py-3"
                placeholder="Ask a follow-up question or request additional analysis..."
                value={followUpMessage}
                onChange={(e) => setFollowUpMessage(e.target.value)}
                disabled={isSendingMessage}
              />
            </div>
            <Button
              type="submit"
              className="bg-blue-600 hover:bg-blue-700 px-6 py-3"
              disabled={isSendingMessage || !followUpMessage.trim()}
            >
              <Send className="w-4 h-4" />
            </Button>
          </form>
          <div className="mt-2 flex items-center justify-between text-xs text-gray-500">
            <span>Press Enter to send</span>
            {isSendingMessage && <span>Generating response...</span>}
          </div>
        </div>
      )}

      {/* Medical Report Generator Modal */}
      <MedicalReportGenerator
        messages={messages}
        consensus={consensus}
        activeCase={activeCase}
        isVisible={showReportGenerator}
        onClose={() => setShowReportGenerator(false)}
      />
    </div>
  );
}
