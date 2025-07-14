import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { Stethoscope, CheckCircle, AlertCircle, Download } from 'lucide-react';
import jsPDF from 'jspdf';

interface Symptom {
  id: string;
  name: string;
  description: string;
}

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

const Diagnose: React.FC = () => {
  const [symptoms, setSymptoms] = useState<Symptom[]>([]);
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([]);
  const [results, setResults] = useState<DiagnosisResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isDiagnosing, setIsDiagnosing] = useState(false);

  useEffect(() => {
    fetchSymptoms();
  }, []);

  const fetchSymptoms = async () => {
    try {
      setIsLoading(true);
      const response = await axios.get('http://localhost:5000/api/symptoms');
      setSymptoms(response.data);
    } catch (error) {
      toast.error('Gagal memuat gejala');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSymptomToggle = (symptomId: string) => {
    setSelectedSymptoms(prev => 
      prev.includes(symptomId)
        ? prev.filter(id => id !== symptomId)
        : [...prev, symptomId]
    );
  };

  const handleDiagnose = async () => {
    if (selectedSymptoms.length === 0) {
      toast.error('Pilih minimal satu gejala');
      return;
    }

    try {
      setIsDiagnosing(true);
      const response = await axios.post('http://localhost:5000/api/diagnose', {
        symptoms: selectedSymptoms
      });
      setResults(response.data.results);
      toast.success('Diagnosa berhasil dilakukan');
    } catch (error) {
      toast.error('Gagal melakukan diagnosa');
    } finally {
      setIsDiagnosing(false);
    }
  };

  const exportToPDF = () => {
    const doc = new jsPDF();
    const pageHeight = doc.internal.pageSize.height;
    let yPosition = 20;

    // Header
    doc.setFontSize(18);
    doc.text('Hasil Diagnosa Kesehatan', 20, yPosition);
    yPosition += 10;

    doc.setFontSize(12);
    doc.text(`Tanggal: ${new Date().toLocaleDateString('id-ID')}`, 20, yPosition);
    yPosition += 20;

    // Selected symptoms
    doc.setFontSize(14);
    doc.text('Gejala yang Dipilih:', 20, yPosition);
    yPosition += 10;

    const selectedSymptomNames = symptoms
      .filter(s => selectedSymptoms.includes(s.id))
      .map(s => s.name);

    selectedSymptomNames.forEach((symptom, index) => {
      doc.setFontSize(12);
      doc.text(`${index + 1}. ${symptom}`, 25, yPosition);
      yPosition += 8;
    });

    yPosition += 10;

    // Results
    doc.setFontSize(14);
    doc.text('Hasil Diagnosa:', 20, yPosition);
    yPosition += 10;

    results.forEach((result, index) => {
      if (yPosition > pageHeight - 40) {
        doc.addPage();
        yPosition = 20;
      }

      doc.setFontSize(12);
      doc.text(`${index + 1}. ${result.disease.name}`, 25, yPosition);
      yPosition += 8;

      doc.text(`   Tingkat Kepercayaan: ${(result.confidence * 100).toFixed(1)}%`, 25, yPosition);
      yPosition += 8;

      doc.text(`   Deskripsi: ${result.disease.description}`, 25, yPosition);
      yPosition += 8;

      doc.text(`   Rekomendasi: ${result.disease.recommendation}`, 25, yPosition);
      yPosition += 15;
    });

    doc.save('hasil-diagnosa.pdf');
    toast.success('PDF berhasil diunduh');
  };

  const resetDiagnosis = () => {
    setSelectedSymptoms([]);
    setResults([]);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-sky-500"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="text-center">
        <Stethoscope className="h-16 w-16 text-sky-500 mx-auto mb-4" />
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Diagnosa Kesehatan</h1>
        <p className="text-gray-600">Pilih gejala yang Anda alami untuk mendapatkan diagnosa</p>
      </div>

      {/* Symptoms Selection */}
      <div className="bg-white rounded-2xl shadow-lg p-6">
        <h2 className="text-xl font-semibold mb-4 text-gray-800">Pilih Gejala</h2>
        <div className="grid md:grid-cols-2 gap-4">
          {symptoms.map((symptom) => (
            <div
              key={symptom.id}
              className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                selectedSymptoms.includes(symptom.id)
                  ? 'border-sky-500 bg-sky-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
              onClick={() => handleSymptomToggle(symptom.id)}
            >
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-800">{symptom.name}</h3>
                  <p className="text-sm text-gray-600 mt-1">{symptom.description}</p>
                </div>
                {selectedSymptoms.includes(symptom.id) && (
                  <CheckCircle className="h-5 w-5 text-sky-500 ml-2" />
                )}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6 flex justify-center space-x-4">
          <button
            onClick={handleDiagnose}
            disabled={selectedSymptoms.length === 0 || isDiagnosing}
            className="bg-sky-500 text-white px-6 py-3 rounded-lg font-semibold hover:bg-sky-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isDiagnosing ? 'Memproses...' : 'Diagnosa Sekarang'}
          </button>
          <button
            onClick={resetDiagnosis}
            className="bg-gray-500 text-white px-6 py-3 rounded-lg font-semibold hover:bg-gray-600 transition-colors"
          >
            Reset
          </button>
        </div>
      </div>

      {/* Results */}
      {results.length > 0 && (
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-800">Hasil Diagnosa</h2>
            <button
              onClick={exportToPDF}
              className="flex items-center space-x-2 bg-emerald-500 text-white px-4 py-2 rounded-lg hover:bg-emerald-600 transition-colors"
            >
              <Download className="h-4 w-4" />
              <span>Export PDF</span>
            </button>
          </div>

          <div className="space-y-4">
            {results.map((result, index) => (
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
                  <div className="flex items-center space-x-3">
                    <AlertCircle 
                      className={`h-6 w-6 ${
                        result.confidence > 0.7
                          ? 'text-red-500'
                          : result.confidence > 0.5
                          ? 'text-yellow-500'
                          : 'text-gray-500'
                      }`}
                    />
                    <h3 className="text-lg font-semibold text-gray-800">
                      {result.disease.name}
                    </h3>
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-gray-600">Tingkat Kepercayaan</div>
                    <div className="text-xl font-bold text-gray-800">
                      {(result.confidence * 100).toFixed(1)}%
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <div>
                    <h4 className="font-medium text-gray-700">Deskripsi:</h4>
                    <p className="text-gray-600">{result.disease.description}</p>
                  </div>
                  
                  <div>
                    <h4 className="font-medium text-gray-700">Rekomendasi:</h4>
                    <p className="text-gray-600">{result.disease.recommendation}</p>
                  </div>

                  <div>
                    <h4 className="font-medium text-gray-700">
                      Kesesuaian Gejala: {(result.matchPercentage * 100).toFixed(1)}%
                    </h4>
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

          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <div className="flex items-center space-x-2 mb-2">
              <AlertCircle className="h-5 w-5 text-blue-500" />
              <h4 className="font-medium text-blue-800">Catatan Penting</h4>
            </div>
            <p className="text-blue-700 text-sm">
              Hasil diagnosa ini hanya sebagai referensi awal. Untuk diagnosa yang akurat 
              dan penanganan yang tepat, silakan konsultasi dengan dokter atau tenaga medis profesional.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default Diagnose;