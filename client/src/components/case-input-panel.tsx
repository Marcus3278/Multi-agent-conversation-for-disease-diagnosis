import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Play, FileText, Eraser, Search } from "lucide-react";
import { AdvancedSearch, type SearchFilters } from "./advanced-search";
import type { MedicalCaseInput } from "@/hooks/use-medical-agents";

interface CaseInputPanelProps {
  onCreateCase: (caseData: MedicalCaseInput) => void;
  onStartDiagnosis: () => void;
  onClearCase: () => void;
  isCreatingCase: boolean;
  isStartingConsultation: boolean;
  hasActiveCase: boolean;
}

export function CaseInputPanel({
  onCreateCase,
  onStartDiagnosis,
  onClearCase,
  isCreatingCase,
  isStartingConsultation,
  hasActiveCase
}: CaseInputPanelProps) {
  const [formData, setFormData] = useState<MedicalCaseInput>({
    patientId: "",
    age: 0,
    gender: "",
    chiefComplaint: "",
    symptomsHistory: "",
    testResults: ""
  });
  const [showAdvancedSearch, setShowAdvancedSearch] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.patientId || !formData.age || !formData.gender || !formData.chiefComplaint) {
      return;
    }
    onCreateCase(formData);
  };

  const handleClear = () => {
    setFormData({
      patientId: "",
      age: 0,
      gender: "",
      chiefComplaint: "",
      symptomsHistory: "",
      testResults: ""
    });
    onClearCase();
  };

  const loadTemplate = () => {
    setFormData({
      patientId: "P-2024-001",
      age: 45,
      gender: "Female",
      chiefComplaint: "Chest pain and shortness of breath for 3 days",
      symptomsHistory: "Patient reports substernal chest pain, 7/10 severity, radiating to left arm. Accompanied by dyspnea on exertion. History of hypertension and diabetes mellitus type 2. Current medications: Metformin 500mg BID, Lisinopril 10mg daily.",
      testResults: "BP: 150/95, HR: 88, RR: 18, O2: 96% RA. ECG shows ST elevation in leads II, III, aVF. Troponin I: 0.8 ng/mL (elevated)"
    });
  };

  const handleAdvancedSearch = (filters: SearchFilters) => {
    // Generate case data based on search filters
    const generateCaseFromFilters = (filters: SearchFilters) => {
      const templates = {
        cardiology: {
          patientId: `P-CARD-${Date.now()}`,
          chiefComplaint: "Chest pain and palpitations",
          symptomsHistory: "Patient experiencing chest pain with radiation to left arm, accompanied by palpitations and shortness of breath. No known cardiac history.",
          testResults: "ECG pending, Troponin levels to be drawn"
        },
        neurology: {
          patientId: `P-NEURO-${Date.now()}`,
          chiefComplaint: "Headache and dizziness",
          symptomsHistory: "Severe headache with visual disturbances and dizziness. No recent trauma or fever.",
          testResults: "Neurological exam pending, CT scan recommended"
        },
        general: {
          patientId: `P-GEN-${Date.now()}`,
          chiefComplaint: filters.symptoms || "General discomfort",
          symptomsHistory: `Patient presenting with ${filters.symptoms}. Detailed history to be obtained.`,
          testResults: "Initial assessment pending"
        }
      };

      const template = filters.specialty ? templates[filters.specialty as keyof typeof templates] || templates.general : templates.general;
      
      return {
        ...template,
        age: filters.ageRange ? parseInt(filters.ageRange.split('-')[0]) || 35 : 35,
        gender: filters.gender || "Female"
      };
    };

    const caseData = generateCaseFromFilters(filters);
    setFormData(caseData);
    setShowAdvancedSearch(false);
  };

  return (
    <div className="w-80 bg-white border-r border-gray-200 flex flex-col">
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
            <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
          </div>
          <div>
            <h1 className="text-xl font-semibold text-gray-900">MedAgent AI</h1>
            <p className="text-sm text-gray-500">Multi-Agent Diagnosis</p>
          </div>
        </div>
      </div>

      {/* Case Input Form */}
      <div className="p-6 flex-1 overflow-y-auto">
        <h2 className="text-lg font-medium text-gray-900 mb-4">Patient Case Input</h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="patientId" className="text-sm font-medium text-gray-700">Patient ID</Label>
            <Input
              id="patientId"
              type="text"
              className="mt-1"
              placeholder="P-2024-001"
              value={formData.patientId}
              onChange={(e) => setFormData(prev => ({ ...prev, patientId: e.target.value }))}
            />
          </div>
          
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="age" className="text-sm font-medium text-gray-700">Age</Label>
              <Input
                id="age"
                type="number"
                className="mt-1"
                value={formData.age || ""}
                onChange={(e) => setFormData(prev => ({ ...prev, age: parseInt(e.target.value) || 0 }))}
              />
            </div>
            <div>
              <Label htmlFor="gender" className="text-sm font-medium text-gray-700">Gender</Label>
              <Select value={formData.gender} onValueChange={(value) => setFormData(prev => ({ ...prev, gender: value }))}>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Select" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Female">Female</SelectItem>
                  <SelectItem value="Male">Male</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label htmlFor="chiefComplaint" className="text-sm font-medium text-gray-700">Chief Complaint</Label>
            <Textarea
              id="chiefComplaint"
              className="mt-1 h-20 resize-none"
              placeholder="Primary symptoms..."
              value={formData.chiefComplaint}
              onChange={(e) => setFormData(prev => ({ ...prev, chiefComplaint: e.target.value }))}
            />
          </div>

          <div>
            <Label htmlFor="symptomsHistory" className="text-sm font-medium text-gray-700">Symptoms & History</Label>
            <Textarea
              id="symptomsHistory"
              className="mt-1 h-32 resize-none"
              placeholder="Detailed symptoms, medical history, medications..."
              value={formData.symptomsHistory}
              onChange={(e) => setFormData(prev => ({ ...prev, symptomsHistory: e.target.value }))}
            />
          </div>

          <div>
            <Label htmlFor="testResults" className="text-sm font-medium text-gray-700">Test Results</Label>
            <Textarea
              id="testResults"
              className="mt-1 h-24 resize-none"
              placeholder="Lab results, imaging, vitals..."
              value={formData.testResults}
              onChange={(e) => setFormData(prev => ({ ...prev, testResults: e.target.value }))}
            />
          </div>

          {/* Action Buttons */}
          <div className="space-y-3 pt-4">
            {!hasActiveCase ? (
              <Button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700"
                disabled={isCreatingCase}
              >
                {isCreatingCase ? (
                  <>Creating Case...</>
                ) : (
                  <>
                    <FileText className="w-4 h-4 mr-2" />
                    Create Case
                  </>
                )}
              </Button>
            ) : (
              <Button
                type="button"
                onClick={onStartDiagnosis}
                className="w-full bg-blue-600 hover:bg-blue-700"
                disabled={isStartingConsultation}
              >
                {isStartingConsultation ? (
                  <>Starting Consultation...</>
                ) : (
                  <>
                    <Play className="w-4 h-4 mr-2" />
                    Start Agent Consultation
                  </>
                )}
              </Button>
            )}
            
            <div className="grid grid-cols-2 gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={loadTemplate}
                className="text-sm"
              >
                <FileText className="w-3 h-3 mr-1" />
                Load Template
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowAdvancedSearch(true)}
                className="text-sm"
              >
                <Search className="w-3 h-3 mr-1" />
                Smart Generate
              </Button>
            </div>
            <Button
              type="button"
              variant="outline"
              onClick={handleClear}
              className="w-full text-sm"
            >
              <Eraser className="w-3 h-3 mr-1" />
              Clear Case
            </Button>
          </div>
        </form>
      </div>
      
      {/* Advanced Search Modal */}
      <AdvancedSearch 
        isVisible={showAdvancedSearch}
        onSearch={handleAdvancedSearch}
        onClose={() => setShowAdvancedSearch(false)}
      />
    </div>
  );
}
