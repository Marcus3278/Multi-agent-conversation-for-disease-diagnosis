import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Filter, X } from "lucide-react";

interface AdvancedSearchProps {
  onSearch: (filters: SearchFilters) => void;
  isVisible: boolean;
  onClose: () => void;
}

export interface SearchFilters {
  symptoms: string;
  ageRange: string;
  gender: string;
  urgency: string;
  specialty: string;
}

export function AdvancedSearch({ onSearch, isVisible, onClose }: AdvancedSearchProps) {
  const [filters, setFilters] = useState<SearchFilters>({
    symptoms: "",
    ageRange: "",
    gender: "",
    urgency: "",
    specialty: ""
  });

  if (!isVisible) return null;

  const handleSearch = () => {
    onSearch(filters);
  };

  const clearFilters = () => {
    setFilters({
      symptoms: "",
      ageRange: "",
      gender: "",
      urgency: "",
      specialty: ""
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium text-gray-900">Advanced Case Search</h3>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="w-4 h-4" />
          </Button>
        </div>

        <div className="space-y-4">
          <div>
            <Label htmlFor="symptoms">Symptoms</Label>
            <Input
              id="symptoms"
              type="text"
              placeholder="chest pain, shortness of breath..."
              value={filters.symptoms}
              onChange={(e) => setFilters(prev => ({ ...prev, symptoms: e.target.value }))}
            />
          </div>

          <div>
            <Label htmlFor="ageRange">Age Range</Label>
            <Select value={filters.ageRange} onValueChange={(value) => setFilters(prev => ({ ...prev, ageRange: value }))}>
              <SelectTrigger>
                <SelectValue placeholder="Select age range" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="0-18">0-18 years</SelectItem>
                <SelectItem value="19-35">19-35 years</SelectItem>
                <SelectItem value="36-50">36-50 years</SelectItem>
                <SelectItem value="51-65">51-65 years</SelectItem>
                <SelectItem value="65+">65+ years</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="gender">Gender</Label>
            <Select value={filters.gender} onValueChange={(value) => setFilters(prev => ({ ...prev, gender: value }))}>
              <SelectTrigger>
                <SelectValue placeholder="Select gender" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Female">Female</SelectItem>
                <SelectItem value="Male">Male</SelectItem>
                <SelectItem value="Other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="urgency">Urgency Level</Label>
            <Select value={filters.urgency} onValueChange={(value) => setFilters(prev => ({ ...prev, urgency: value }))}>
              <SelectTrigger>
                <SelectValue placeholder="Select urgency" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="low">Low</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="critical">Critical</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="specialty">Required Specialty</Label>
            <Select value={filters.specialty} onValueChange={(value) => setFilters(prev => ({ ...prev, specialty: value }))}>
              <SelectTrigger>
                <SelectValue placeholder="Select specialty" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="cardiology">Cardiology</SelectItem>
                <SelectItem value="neurology">Neurology</SelectItem>
                <SelectItem value="oncology">Oncology</SelectItem>
                <SelectItem value="endocrinology">Endocrinology</SelectItem>
                <SelectItem value="gastroenterology">Gastroenterology</SelectItem>
                <SelectItem value="pulmonology">Pulmonology</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex space-x-3 mt-6">
          <Button onClick={clearFilters} variant="outline" className="flex-1">
            <Filter className="w-4 h-4 mr-2" />
            Clear
          </Button>
          <Button onClick={handleSearch} className="flex-1 bg-blue-600 hover:bg-blue-700">
            <Search className="w-4 h-4 mr-2" />
            Search Cases
          </Button>
        </div>
      </div>
    </div>
  );
}