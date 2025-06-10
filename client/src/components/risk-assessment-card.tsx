import { AlertTriangle, Shield, Activity, Heart } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { DiagnosticConsensus } from "@shared/schema";

interface RiskAssessmentCardProps {
  consensus: DiagnosticConsensus;
}

export function RiskAssessmentCard({ consensus }: RiskAssessmentCardProps) {
  const { riskAssessment } = consensus;
  
  if (!riskAssessment) return null;

  const getRiskIcon = (level: string) => {
    switch (level) {
      case 'critical':
        return <Heart className="w-4 h-4 text-red-600" />;
      case 'high':
        return <AlertTriangle className="w-4 h-4 text-orange-500" />;
      case 'medium':
        return <Activity className="w-4 h-4 text-yellow-500" />;
      case 'low':
        return <Shield className="w-4 h-4 text-green-500" />;
      default:
        return <Activity className="w-4 h-4 text-gray-500" />;
    }
  };

  const getRiskColor = (level: string) => {
    switch (level) {
      case 'critical':
        return 'bg-red-50 border-red-200 text-red-800';
      case 'high':
        return 'bg-orange-50 border-orange-200 text-orange-800';
      case 'medium':
        return 'bg-yellow-50 border-yellow-200 text-yellow-800';
      case 'low':
        return 'bg-green-50 border-green-200 text-green-800';
      default:
        return 'bg-gray-50 border-gray-200 text-gray-800';
    }
  };

  return (
    <div className={`rounded-lg border p-4 ${getRiskColor(riskAssessment.level)}`}>
      <div className="flex items-center space-x-2 mb-3">
        {getRiskIcon(riskAssessment.level)}
        <span className="font-medium">
          Risk Assessment: {riskAssessment.level.charAt(0).toUpperCase() + riskAssessment.level.slice(1)}
        </span>
      </div>
      
      <div className="space-y-2">
        <h5 className="text-sm font-medium">Risk Factors:</h5>
        <div className="space-y-1">
          {riskAssessment.factors.map((factor, index) => (
            <div key={index} className="flex items-start space-x-2 text-sm">
              <span className="w-1 h-1 bg-current rounded-full mt-2 flex-shrink-0"></span>
              <span>{factor}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}