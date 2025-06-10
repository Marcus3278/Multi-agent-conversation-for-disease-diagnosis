import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BarChart, TrendingUp, AlertCircle, CheckCircle2 } from "lucide-react";
import type { AgentMessage, DiagnosticConsensus } from "@shared/schema";

interface DiagnosticComparisonProps {
  messages: AgentMessage[];
  consensus?: DiagnosticConsensus;
}

export function DiagnosticComparison({ messages, consensus }: DiagnosticComparisonProps) {
  const [selectedView, setSelectedView] = useState<'confidence' | 'agreement' | 'timeline'>('confidence');

  if (messages.length === 0) return null;

  // Analyze agent responses
  const agentAnalysis = messages.reduce((acc, message) => {
    if (!acc[message.agentType]) {
      acc[message.agentType] = {
        name: message.agentName,
        confidence: message.confidence,
        responseTime: message.responseTime,
        keyPoints: message.references || [],
        lastActive: message.timestamp
      };
    }
    return acc;
  }, {} as Record<string, any>);

  const confidenceData = Object.entries(agentAnalysis).map(([type, data]) => ({
    agent: data.name,
    confidence: data.confidence,
    responseTime: data.responseTime,
    color: type === 'gp' ? 'bg-blue-500' : 
           type === 'cardiologist' ? 'bg-red-500' :
           type === 'research' ? 'bg-purple-500' : 'bg-teal-500'
  }));

  const averageConfidence = confidenceData.reduce((sum, item) => sum + item.confidence, 0) / confidenceData.length;
  const averageResponseTime = confidenceData.reduce((sum, item) => sum + item.responseTime, 0) / confidenceData.length;

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6">
      <div className="flex items-center space-x-2 mb-4">
        <BarChart className="w-5 h-5 text-gray-600" />
        <h3 className="text-lg font-medium text-gray-900">Diagnostic Analysis</h3>
      </div>

      <Tabs value={selectedView} onValueChange={(value) => setSelectedView(value as any)}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="confidence">Confidence</TabsTrigger>
          <TabsTrigger value="agreement">Agreement</TabsTrigger>
          <TabsTrigger value="timeline">Performance</TabsTrigger>
        </TabsList>

        <TabsContent value="confidence" className="space-y-4 mt-4">
          <div className="space-y-3">
            {confidenceData.map((agent, index) => (
              <div key={index} className="bg-gray-50 rounded-lg p-3">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <div className={`w-3 h-3 ${agent.color} rounded-full`}></div>
                    <span className="font-medium text-sm">{agent.agent}</span>
                  </div>
                  <span className="text-sm font-semibold">{agent.confidence}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className={`${agent.color} h-2 rounded-full`}
                    style={{ width: `${agent.confidence}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
          
          <div className="border-t pt-3">
            <div className="text-sm text-gray-600">
              Average Confidence: <span className="font-semibold">{averageConfidence.toFixed(1)}%</span>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="agreement" className="space-y-4 mt-4">
          {consensus ? (
            <div className="space-y-4">
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-center space-x-2 mb-2">
                  <CheckCircle2 className="w-4 h-4 text-green-600" />
                  <span className="font-medium text-green-800">Primary Diagnosis</span>
                </div>
                <p className="text-green-700">{consensus.primaryDiagnosis}</p>
                <div className="mt-2 text-sm text-green-600">
                  {consensus.agentAgreement}/4 agents agree • {consensus.confidence}% consensus confidence
                </div>
              </div>

              {consensus.differentialDiagnoses && consensus.differentialDiagnoses.length > 0 && (
                <div>
                  <h4 className="font-medium text-gray-700 mb-2">Alternative Diagnoses</h4>
                  <div className="flex flex-wrap gap-2">
                    {consensus.differentialDiagnoses.map((diagnosis, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {diagnosis}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <AlertCircle className="w-8 h-8 mx-auto mb-2" />
              <p>No consensus data available yet</p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="timeline" className="space-y-4 mt-4">
          <div className="space-y-3">
            {confidenceData.map((agent, index) => (
              <div key={index} className="bg-gray-50 rounded-lg p-3">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <div className={`w-3 h-3 ${agent.color} rounded-full`}></div>
                    <span className="font-medium text-sm">{agent.agent}</span>
                  </div>
                  <span className="text-sm">{(agent.responseTime / 1000).toFixed(1)}s</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-yellow-400 h-2 rounded-full"
                    style={{ width: `${Math.min((agent.responseTime / 10000) * 100, 100)}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
          
          <div className="border-t pt-3 space-y-1 text-sm text-gray-600">
            <div>Average Response Time: <span className="font-semibold">{(averageResponseTime / 1000).toFixed(1)}s</span></div>
            <div>Total Analysis Time: <span className="font-semibold">{(confidenceData.reduce((sum, item) => sum + item.responseTime, 0) / 1000).toFixed(1)}s</span></div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}