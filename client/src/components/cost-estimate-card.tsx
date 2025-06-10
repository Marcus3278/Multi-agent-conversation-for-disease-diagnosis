import { DollarSign, TrendingUp, Info } from "lucide-react";
import type { DiagnosticConsensus } from "@shared/schema";

interface CostEstimateCardProps {
  consensus: DiagnosticConsensus;
}

export function CostEstimateCard({ consensus }: CostEstimateCardProps) {
  const { estimatedCosts } = consensus;
  
  if (!estimatedCosts) return null;

  return (
    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
      <div className="flex items-center space-x-2 mb-3">
        <DollarSign className="w-4 h-4 text-green-600" />
        <span className="font-medium text-green-800">Cost Estimates</span>
      </div>
      
      <div className="space-y-3">
        <div className="border-l-4 border-green-300 pl-3">
          <div className="flex items-center space-x-2 mb-1">
            <TrendingUp className="w-3 h-3 text-green-600" />
            <span className="text-sm font-medium text-green-700">Diagnostic Costs</span>
          </div>
          <p className="text-sm text-green-600">{estimatedCosts.diagnostic}</p>
        </div>
        
        <div className="border-l-4 border-green-300 pl-3">
          <div className="flex items-center space-x-2 mb-1">
            <TrendingUp className="w-3 h-3 text-green-600" />
            <span className="text-sm font-medium text-green-700">Treatment Costs</span>
          </div>
          <p className="text-sm text-green-600">{estimatedCosts.treatment}</p>
        </div>
      </div>
      
      <div className="mt-4 pt-3 border-t border-green-200">
        <div className="flex items-start space-x-2 text-xs text-green-600">
          <Info className="w-3 h-3 mt-0.5 flex-shrink-0" />
          <span>Estimates are approximate and may vary based on location, insurance coverage, and specific treatment protocols</span>
        </div>
      </div>
    </div>
  );
}