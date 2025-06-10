import { CaseInputPanel } from "@/components/case-input-panel";
import { ConversationArea } from "@/components/conversation-area";
import { AgentPanel } from "@/components/agent-panel";
import { useMedicalAgents } from "@/hooks/use-medical-agents";
import { useToast } from "@/hooks/use-toast";
import { useEffect } from "react";

export default function MedicalDiagnosis() {
  const {
    activeCase,
    activeConversation,
    createCase,
    startDiagnosis,
    sendFollowUpMessage,
    clearCase,
    isCreatingCase,
    isStartingConsultation,
    isSendingMessage,
    isLoadingConversation,
    messages,
    consensus,
    conversationStatus,
    error
  } = useMedicalAgents();

  const { toast } = useToast();

  useEffect(() => {
    if (error) {
      toast({
        title: "Error",
        description: error.message || "An error occurred",
        variant: "destructive",
      });
    }
  }, [error, toast]);

  return (
    <div className="min-h-screen flex bg-gray-50">
      <CaseInputPanel
        onCreateCase={createCase}
        onStartDiagnosis={startDiagnosis}
        onClearCase={clearCase}
        isCreatingCase={isCreatingCase}
        isStartingConsultation={isStartingConsultation}
        hasActiveCase={!!activeCase}
      />
      
      <ConversationArea
        messages={messages}
        consensus={consensus}
        conversationStatus={conversationStatus}
        onSendMessage={sendFollowUpMessage}
        isSendingMessage={isSendingMessage}
        activeCase={activeCase}
      />
      
      <AgentPanel
        messages={messages}
        consensus={consensus}
        conversationStatus={conversationStatus}
      />
    </div>
  );
}
