import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { History as HistoryIcon, Calendar, Activity, TrendingUp } from 'lucide-react';

interface Disease {
  id: string;
  name: string;
  description: string;
  recommendation: string;
}

interface DiagnosisResult {
  disease: Disease;
  confidence: number;
  matchPercentage: number;
  matchedSymptoms: string[];
  ruleId: string;
}

interface Symptom {
  id: string;
  name: string;
  description: string;
}

interface Diagnosis {
  id: string;
  userId: string;
  symptoms: Symptom[];
  results: DiagnosisResult[];
  createdAt: string;
}

const History: React.FC = () => {
  const [diagnoses, setDiagnoses] = useState<Diagnosis[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedDiagnosis, setSelectedDiagnosis] = useState<Diagnosis | null>(null);

  useEffect(() => {
    fetchDiagnoses();
  }, []);

  const fetchDiagnoses = async () => {
    try {
      setIsLoading(true);
      const response = await axios.get('http://localhost:5000/api/diagnoses');
      setDiagnoses(response.data);
    } catch (error) {
      toast.error('Gagal memuat riwayat diagnosa');
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-sky-500"></div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="text-center mb-8">
        <HistoryIcon className="h-16 w-16 text-sky-500 mx-auto mb-4" />
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Riwayat Diagnosa</h1>
        <p className="text-gray-600">Lihat riwayat diagnosa kesehatan Anda</p>
      </div>

      {selectedDiagnosis ? (
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <button
            onClick={() => setSelectedDiagnosis(null)}
            className="mb-6 text-sky-500 hover:text-sky-600 transition-colors"
          >
            ← Kembali ke riwayat
          </button>
          
          <div className="space-y-6">
            <div className="flex items-center space-x-4 mb-6">
              <Calendar className="h-5 w-5 text-gray-500" />
              <span className="text-gray-600">{formatDate(selectedDiagnosis.createdAt)}</span>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Gejala yang Dipilih</h3>
              <div className="grid md:grid-cols-2 gap-3">
                {selectedDiagnosis.symptoms.map((symptom) => (
                  <div key={symptom.id} className="bg-gray-50 p-3 rounded-lg">
                    <div className="font-medium text-gray-800">{symptom.name}</div>
                    <div className="text-sm text-gray-600">{symptom.description}</div>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Hasil Diagnosa</h3>
              <div className="space-y-4">
                {selectedDiagnosis.results.map((result, index) => (
                  <div
                    key={index}
                    className={`p-6 rounded-lg border-2 ${
                      result.confidence > 0.7
                        ? 'border-red-200 bg-red-50'
                        : result.confidence > 0.5
                        ? 'border-yellow-200 bg-yellow-50'
                        : 'border-gray-200 bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="text-lg font-semibold text-gray-800">
                        {result.disease.name}
                      </h4>
                      <div className="text-right">
                        <div className="text-sm text-gray-600">Tingkat Kepercayaan</div>
                        <div className="text-xl font-bold text-gray-800">
                          {(result.confidence * 100).toFixed(1)}%
                        </div>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div>
                        <h5 className="font-medium text-gray-700">Deskripsi:</h5>
                        <p className="text-gray-600">{result.disease.description}</p>
                      </div>
                      
                      <div>
                        <h5 className="font-medium text-gray-700">Rekomendasi:</h5>
                        <p className="text-gray-600">{result.disease.recommendation}</p>
                      </div>

                      <div>
                        <h5 className="font-medium text-gray-700">
                          Kesesuaian Gejala: {(result.matchPercentage * 100).toFixed(1)}%
                        </h5>
                        <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                          <div
                            className="bg-sky-500 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${result.matchPercentage * 100}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {diagnoses.length > 0 ? (
            <>
              <div className="grid md:grid-cols-3 gap-6 mb-8">
                <div className="bg-white rounded-2xl shadow-lg p-6 text-center">
                  <Activity className="h-8 w-8 text-sky-500 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-gray-800">{diagnoses.length}</div>
                  <div className="text-gray-600">Total Diagnosa</div>
                </div>
                <div className="bg-white rounded-2xl shadow-lg p-6 text-center">
                  <TrendingUp className="h-8 w-8 text-emerald-500 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-gray-800">
                    {diagnoses.filter(d => d.results.length > 0).length}
                  </div>
                  <div className="text-gray-600">Diagnosa Berhasil</div>
                </div>
                <div className="bg-white rounded-2xl shadow-lg p-6 text-center">
                  <Calendar className="h-8 w-8 text-orange-500 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-gray-800">
                    {diagnoses.length > 0 ? formatDate(diagnoses[0].createdAt).split(' ')[0] : '-'}
                  </div>
                  <div className="text-gray-600">Diagnosa Terakhir</div>
                </div>
              </div>

              <div className="grid gap-4">
                {diagnoses.map((diagnosis) => (
                  <div
                    key={diagnosis.id}
                    className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-shadow cursor-pointer"
                    onClick={() => setSelectedDiagnosis(diagnosis)}
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <Activity className="h-5 w-5 text-sky-500" />
                        <span className="font-semibold text-gray-800">
                          Diagnosa - {formatDate(diagnosis.createdAt)}
                        </span>
                      </div>
                      <div className="text-right">
                        <div className="text-sm text-gray-600">
                          {diagnosis.results.length} hasil
                        </div>
                        <div className="text-sm text-gray-600">
                          {diagnosis.symptoms.length} gejala
                        </div>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div>
                        <h4 className="font-medium text-gray-700 mb-2">Gejala:</h4>
                        <div className="flex flex-wrap gap-2">
                          {diagnosis.symptoms.slice(0, 3).map((symptom) => (
                            <span
                              key={symptom.id}
                              className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm"
                            >
                              {symptom.name}
                            </span>
                          ))}
                          {diagnosis.symptoms.length > 3 && (
                            <span className="bg-gray-100 text-gray-600 px-3 py-1 rounded-full text-sm">
                              +{diagnosis.symptoms.length - 3} lainnya
                            </span>
                          )}
                        </div>
                      </div>

                      {diagnosis.results.length > 0 && (
                        <div>
                          <h4 className="font-medium text-gray-700 mb-2">Hasil Teratas:</h4>
                          <div className="bg-gray-50 p-3 rounded-lg">
                            <div className="flex items-center justify-between">
                              <span className="font-medium text-gray-800">
                                {diagnosis.results[0].disease.name}
                              </span>
                              <span className="text-sm text-gray-600">
                                {(diagnosis.results[0].confidence * 100).toFixed(1)}%
                              </span>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="text-center py-12">
              <HistoryIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 mb-4">Belum ada riwayat diagnosa</p>
              <button
                onClick={() => window.location.href = '/diagnose'}
                className="bg-sky-500 text-white px-6 py-2 rounded-lg hover:bg-sky-600 transition-colors"
              >
                Mulai Diagnosa
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default History;