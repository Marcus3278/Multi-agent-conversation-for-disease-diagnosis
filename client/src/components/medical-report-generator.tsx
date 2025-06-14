import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FileText, Download, Printer, Mail } from "lucide-react";
import type { AgentMessage, DiagnosticConsensus } from "@shared/schema";

interface MedicalReportGeneratorProps {
  messages: AgentMessage[];
  consensus?: DiagnosticConsensus;
  activeCase?: {
    patientId: string;
    age: number;
    gender: string;
    chiefComplaint: string;
    symptomsHistory: string;
    testResults?: string;
  } | null;
  isVisible: boolean;
  onClose: () => void;
}

export function MedicalReportGenerator({ 
  messages, 
  consensus, 
  activeCase, 
  isVisible, 
  onClose 
}: MedicalReportGeneratorProps) {
  const [reportType, setReportType] = useState<string>("comprehensive");
  const [isGenerating, setIsGenerating] = useState(false);

  if (!isVisible) return null;

  const generateReport = async () => {
    if (!activeCase || !consensus) return;
    
    setIsGenerating(true);
    
    try {
      const reportData = {
        reportType,
        patientInfo: activeCase,
        consultation: {
          date: new Date().toISOString(),
          duration: messages.length > 0 ? (new Date(messages[messages.length - 1].timestamp).getTime() - new Date(messages[0].timestamp).getTime()) / 1000 : 0,
          participatingAgents: Array.from(new Set(messages.map(m => m.agentName)))
        },
        diagnosis: consensus,
        agentResponses: messages.map(m => ({
          agent: m.agentName,
          assessment: m.content,
          confidence: m.confidence,
          timestamp: m.timestamp
        })),
        recommendations: consensus.immediateActions,
        followUpPlan: consensus.followUpPlan || [],
        riskAssessment: consensus.riskAssessment
      };

      const reportContent = generateReportContent(reportData);
      downloadReport(reportContent, reportType);
    } finally {
      setIsGenerating(false);
    }
  };

  const generateReportContent = (data: any) => {
    const formatDate = (date: string) => new Date(date).toLocaleString();
    
    return `
MULTI-AGENT MEDICAL CONSULTATION REPORT
========================================

Patient Information:
- Patient ID: ${data.patientInfo.patientId}
- Age: ${data.patientInfo.age} years
- Gender: ${data.patientInfo.gender}
- Chief Complaint: ${data.patientInfo.chiefComplaint}

Consultation Details:
- Date: ${formatDate(data.consultation.date)}
- Duration: ${Math.round(data.consultation.duration / 60)} minutes
- Participating Agents: ${data.consultation.participatingAgents.join(', ')}

CLINICAL ASSESSMENT:
${data.patientInfo.symptomsHistory}

TEST RESULTS:
${data.patientInfo.testResults || 'No test results available'}

AGENT ASSESSMENTS:
${data.agentResponses.map((response: any) => `
${response.agent} (Confidence: ${response.confidence}%):
${response.assessment}
Timestamp: ${formatDate(response.timestamp)}
`).join('\n')}

DIAGNOSTIC CONSENSUS:
Primary Diagnosis: ${data.diagnosis.primaryDiagnosis}
Confidence Level: ${data.diagnosis.confidence}%
Agent Agreement: ${data.diagnosis.agentAgreement}/4 agents

${data.diagnosis.differentialDiagnoses?.length > 0 ? `
Differential Diagnoses:
${data.diagnosis.differentialDiagnoses.map((d: string) => `- ${d}`).join('\n')}
` : ''}

RISK ASSESSMENT:
Risk Level: ${data.riskAssessment?.level?.toUpperCase() || 'Not assessed'}
${data.riskAssessment?.factors?.length > 0 ? `Risk Factors:
${data.riskAssessment.factors.map((f: string) => `- ${f}`).join('\n')}` : ''}

IMMEDIATE ACTIONS:
${data.recommendations.map((action: string) => `- ${action}`).join('\n')}

${data.followUpPlan?.length > 0 ? `
FOLLOW-UP PLAN:
${data.followUpPlan.map((item: string, index: number) => `${index + 1}. ${item}`).join('\n')}
` : ''}

COST ESTIMATES:
${data.diagnosis.estimatedCosts ? `
Diagnostic Costs: ${data.diagnosis.estimatedCosts.diagnostic}
Treatment Costs: ${data.diagnosis.estimatedCosts.treatment}
` : 'Cost analysis not available'}

========================================
Report generated on: ${new Date().toLocaleString()}
This report was generated by an AI multi-agent medical consultation system.
Please consult with qualified medical professionals for treatment decisions.
    `.trim();
  };

  const downloadReport = (content: string, type: string) => {
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `medical-report-${activeCase?.patientId}-${type}-${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium text-gray-900">Generate Medical Report</h3>
          <Button variant="ghost" size="sm" onClick={onClose}>
            ×
          </Button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Report Type
            </label>
            <Select value={reportType} onValueChange={setReportType}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="comprehensive">Comprehensive Report</SelectItem>
                <SelectItem value="summary">Executive Summary</SelectItem>
                <SelectItem value="clinical">Clinical Notes</SelectItem>
                <SelectItem value="consultation">Consultation Record</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="bg-gray-50 rounded-lg p-3 text-sm text-gray-600">
            <p className="font-medium mb-1">Report will include:</p>
            <ul className="space-y-1">
              <li>• Patient information and case details</li>
              <li>• All agent assessments and confidence levels</li>
              <li>• Diagnostic consensus and recommendations</li>
              <li>• Risk assessment and follow-up plan</li>
              <li>• Cost estimates and timeline</li>
            </ul>
          </div>

          <div className="flex space-x-3">
            <Button 
              onClick={generateReport} 
              disabled={isGenerating || !activeCase || !consensus}
              className="flex-1 bg-blue-600 hover:bg-blue-700"
            >
              {isGenerating ? (
                <>Generating...</>
              ) : (
                <>
                  <FileText className="w-4 h-4 mr-2" />
                  Generate Report
                </>
              )}
            </Button>
          </div>

          <div className="flex space-x-2">
            <Button variant="outline" size="sm" className="flex-1">
              <Printer className="w-3 h-3 mr-1" />
              Print
            </Button>
            <Button variant="outline" size="sm" className="flex-1">
              <Mail className="w-3 h-3 mr-1" />
              Email
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}