import { useState, useCallback } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import type { MedicalCase, Conversation, AgentMessage, DiagnosticConsensus } from "@shared/schema";

export interface MedicalCaseInput {
  patientId: string;
  age: number;
  gender: string;
  chiefComplaint: string;
  symptomsHistory: string;
  testResults?: string;
}

export function useMedicalAgents() {
  const [activeCase, setActiveCase] = useState<MedicalCase | null>(null);
  const [activeConversation, setActiveConversation] = useState<Conversation | null>(null);
  const queryClient = useQueryClient();

  // Create medical case
  const createCaseMutation = useMutation({
    mutationFn: async (caseData: MedicalCaseInput) => {
      const res = await apiRequest("POST", "/api/cases", caseData);
      return res.json();
    },
    onSuccess: (data) => {
      setActiveCase(data);
      queryClient.invalidateQueries({ queryKey: ["/api/cases"] });
    }
  });

  // Start conversation
  const startConversationMutation = useMutation({
    mutationFn: async (caseId: number) => {
      const res = await apiRequest("POST", "/api/conversations", { caseId });
      return res.json();
    },
    onSuccess: (data) => {
      setActiveConversation(data);
    }
  });

  // Start agent consultation
  const startConsultationMutation = useMutation({
    mutationFn: async (conversationId: number) => {
      const res = await apiRequest("POST", `/api/conversations/${conversationId}/start`);
      return res.json();
    },
    onSuccess: (data) => {
      setActiveConversation(data);
      queryClient.invalidateQueries({ queryKey: ["/api/conversations", data.id] });
    }
  });

  // Send follow-up message
  const sendMessageMutation = useMutation({
    mutationFn: async ({ conversationId, message }: { conversationId: number; message: string }) => {
      const res = await apiRequest("POST", `/api/conversations/${conversationId}/message`, { message });
      return res.json();
    },
    onSuccess: (data) => {
      setActiveConversation(data);
      queryClient.invalidateQueries({ queryKey: ["/api/conversations", data.id] });
    }
  });

  // Get conversation by case
  const { data: conversationData, isLoading: conversationLoading } = useQuery({
    queryKey: ["/api/conversations/case", activeCase?.id],
    enabled: !!activeCase?.id,
  });

  // Load conversation data when available
  useState(() => {
    if (conversationData && !activeConversation) {
      setActiveConversation(conversationData);
    }
  });

  const createCase = useCallback((caseData: MedicalCaseInput) => {
    createCaseMutation.mutate(caseData);
  }, [createCaseMutation]);

  const startDiagnosis = useCallback(async () => {
    if (!activeCase) return;

    try {
      // First create or get conversation
      let conversation = activeConversation;
      if (!conversation) {
        conversation = await startConversationMutation.mutateAsync(activeCase.id);
      }

      // Then start the consultation
      await startConsultationMutation.mutateAsync(conversation.id);
    } catch (error) {
      console.error("Error starting diagnosis:", error);
    }
  }, [activeCase, activeConversation, startConversationMutation, startConsultationMutation]);

  const sendFollowUpMessage = useCallback((message: string) => {
    if (!activeConversation) return;
    sendMessageMutation.mutate({
      conversationId: activeConversation.id,
      message
    });
  }, [activeConversation, sendMessageMutation]);

  const clearCase = useCallback(() => {
    setActiveCase(null);
    setActiveConversation(null);
  }, []);

  return {
    // State
    activeCase,
    activeConversation,
    
    // Actions
    createCase,
    startDiagnosis,
    sendFollowUpMessage,
    clearCase,
    
    // Status
    isCreatingCase: createCaseMutation.isPending,
    isStartingConsultation: startConsultationMutation.isPending,
    isSendingMessage: sendMessageMutation.isPending,
    isLoadingConversation: conversationLoading,
    
    // Data
    messages: activeConversation?.messages as AgentMessage[] | undefined,
    consensus: activeConversation?.consensus as DiagnosticConsensus | undefined,
    conversationStatus: activeConversation?.status,
    
    // Errors
    error: createCaseMutation.error || startConsultationMutation.error || sendMessageMutation.error
  };
}
