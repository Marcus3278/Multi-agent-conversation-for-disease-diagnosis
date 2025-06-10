import { Calendar, Clock, ArrowRight } from "lucide-react";
import type { DiagnosticConsensus } from "@shared/schema";

interface FollowUpPlanCardProps {
  consensus: DiagnosticConsensus;
}

export function FollowUpPlanCard({ consensus }: FollowUpPlanCardProps) {
  const { followUpPlan } = consensus;
  
  if (!followUpPlan || followUpPlan.length === 0) return null;

  return (
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
      <div className="flex items-center space-x-2 mb-3">
        <Calendar className="w-4 h-4 text-blue-600" />
        <span className="font-medium text-blue-800">Follow-up Plan</span>
      </div>
      
      <div className="space-y-3">
        {followUpPlan.map((item, index) => (
          <div key={index} className="flex items-start space-x-3">
            <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
              <span className="text-xs font-medium text-blue-700">{index + 1}</span>
            </div>
            <div className="flex-1">
              <p className="text-sm text-blue-700">{item}</p>
            </div>
          </div>
        ))}
      </div>
      
      <div className="mt-4 pt-3 border-t border-blue-200">
        <div className="flex items-center space-x-2 text-xs text-blue-600">
          <Clock className="w-3 h-3" />
          <span>Timeline may vary based on patient response and test results</span>
        </div>
      </div>
    </div>
  );
}