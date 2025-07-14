import React, { useState, useEffect } from 'react';
import axios from 'axios';

interface Rule {
  id: string;
  if: string[];
  then: string;
  confidence: number;
  description: string;
}

interface Symptom {
  id: string;
  name: string;
}

interface Disease {
  id: string;
  name: string;
}

const RuleMatrix: React.FC = () => {
  const [rules, setRules] = useState<Rule[]>([]);
  const [symptoms, setSymptoms] = useState<Symptom[]>([]);
  const [diseases, setDiseases] = useState<Disease[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const [rulesRes, symptomsRes, diseasesRes] = await Promise.all([
        axios.get('http://localhost:5000/api/rules'),
        axios.get('http://localhost:5000/api/symptoms'),
        axios.get('http://localhost:5000/api/diseases')
      ]);
      
      setRules(rulesRes.data);
      setSymptoms(symptomsRes.data);
      setDiseases(diseasesRes.data);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const hasSymptomInRule = (symptomId: string, diseaseId: string) => {
    return rules.some(rule => 
      rule.then === diseaseId && rule.if.includes(symptomId)
    );
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-sky-500"></div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden border border-gray-300">
      <div className="p-4">
        <h3 className="text-lg font-bold text-center mb-4">Tabel Rule/Keputusan</h3>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr>
              <th className="px-4 py-2 text-center text-sm font-bold text-black border border-gray-400 bg-gray-100 min-w-[100px]">
                Kode Gejala
              </th>
              {diseases.map((disease) => (
                <th 
                  key={disease.id} 
                  className="px-2 py-2 text-center text-sm font-bold text-black border border-gray-400 bg-gray-100 min-w-[80px] transform -rotate-45 origin-center"
                  style={{ writingMode: 'vertical-rl', textOrientation: 'mixed' }}
                >
                  {disease.id}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white">
            {symptoms.map((symptom) => (
              <tr key={symptom.id}>
                <td className="px-4 py-2 text-center text-sm text-black border border-gray-400 font-medium">
                  {symptom.id}
                </td>
                {diseases.map((disease) => (
                  <td 
                    key={`${symptom.id}-${disease.id}`} 
                    className="px-2 py-2 text-center text-sm text-black border border-gray-400"
                  >
                    {hasSymptomInRule(symptom.id, disease.id) ? '✓' : ''}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default RuleMatrix;