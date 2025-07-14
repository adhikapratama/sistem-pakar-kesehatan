import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { Settings, Plus, Edit, Trash2, Search } from 'lucide-react';

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

const AdminRules: React.FC = () => {
  const [rules, setRules] = useState<Rule[]>([]);
  const [symptoms, setSymptoms] = useState<Symptom[]>([]);
  const [diseases, setDiseases] = useState<Disease[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRule, setEditingRule] = useState<Rule | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState({
    if: [] as string[],
    then: '',
    confidence: 0.8,
    description: ''
  });

  useEffect(() => {
    fetchRules();
    fetchSymptoms();
    fetchDiseases();
  }, []);

  const fetchRules = async () => {
    try {
      setIsLoading(true);
      const response = await axios.get('http://localhost:5000/api/rules');
      setRules(response.data);
    } catch (error) {
      toast.error('Gagal memuat aturan');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchSymptoms = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/symptoms');
      setSymptoms(response.data);
    } catch (error) {
      toast.error('Gagal memuat gejala');
    }
  };

  const fetchDiseases = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/diseases');
      setDiseases(response.data);
    } catch (error) {
      toast.error('Gagal memuat penyakit');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.if.length === 0) {
      toast.error('Pilih minimal satu gejala');
      return;
    }

    if (!formData.then) {
      toast.error('Pilih penyakit');
      return;
    }
    
    try {
      if (editingRule) {
        await axios.put(`http://localhost:5000/api/rules/${editingRule.id}`, formData);
        toast.success('Aturan berhasil diperbarui');
      } else {
        await axios.post('http://localhost:5000/api/rules', formData);
        toast.success('Aturan berhasil ditambahkan');
      }
      
      fetchRules();
      resetForm();
    } catch (error) {
      toast.error('Gagal menyimpan aturan');
    }
  };

  const handleEdit = (rule: Rule) => {
    setEditingRule(rule);
    setFormData({
      if: rule.if,
      then: rule.then,
      confidence: rule.confidence,
      description: rule.description
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Apakah Anda yakin ingin menghapus aturan ini?')) {
      try {
        await axios.delete(`http://localhost:5000/api/rules/${id}`);
        toast.success('Aturan berhasil dihapus');
        fetchRules();
      } catch (error) {
        toast.error('Gagal menghapus aturan');
      }
    }
  };

  const resetForm = () => {
    setFormData({ if: [], then: '', confidence: 0.8, description: '' });
    setEditingRule(null);
    setIsModalOpen(false);
  };

  const handleSymptomToggle = (symptomId: string) => {
    setFormData(prev => ({
      ...prev,
      if: prev.if.includes(symptomId)
        ? prev.if.filter(id => id !== symptomId)
        : [...prev.if, symptomId]
    }));
  };

  const getSymptomName = (id: string) => {
    const symptom = symptoms.find(s => s.id === id);
    return symptom ? symptom.name : id;
  };

  const getDiseaseName = (id: string) => {
    const disease = diseases.find(d => d.id === id);
    return disease ? disease.name : id;
  };

  const filteredRules = rules.filter(rule =>
    rule.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    getDiseaseName(rule.then).toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div className="text-center">
        <Settings className="h-16 w-16 text-orange-500 mx-auto mb-4" />
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Kelola Aturan</h1>
        <p className="text-gray-600">Tambah, edit, atau hapus aturan dalam sistem</p>
      </div>

      {/* Header Actions */}
      <div className="flex items-center justify-between">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="Cari aturan..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
          />
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center space-x-2 bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600 transition-colors"
        >
          <Plus className="h-4 w-4" />
          <span>Tambah Aturan</span>
        </button>
      </div>

      {/* Rules Table */}
      <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Jika (Gejala)
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Maka (Penyakit)
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Confidence
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Deskripsi
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Aksi
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredRules.map((rule) => (
                <tr key={rule.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {rule.id}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    <div className="flex flex-wrap gap-1">
                      {rule.if.map((symptomId) => (
                        <span
                          key={symptomId}
                          className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs"
                        >
                          {getSymptomName(symptomId)}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <span className="bg-red-100 text-red-800 px-2 py-1 rounded text-xs">
                      {getDiseaseName(rule.then)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {(rule.confidence * 100).toFixed(0)}%
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900 max-w-xs truncate">
                    {rule.description}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleEdit(rule)}
                        className="text-blue-600 hover:text-blue-800"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(rule.id)}
                        className="text-red-600 hover:text-red-800"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold text-gray-800 mb-4">
              {editingRule ? 'Edit Aturan' : 'Tambah Aturan'}
            </h2>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Jika (Pilih Gejala)
                </label>
                <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto border border-gray-300 rounded-lg p-3">
                  {symptoms.map((symptom) => (
                    <label key={symptom.id} className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={formData.if.includes(symptom.id)}
                        onChange={() => handleSymptomToggle(symptom.id)}
                        className="text-orange-500 focus:ring-orange-500"
                      />
                      <span className="text-sm text-gray-700">{symptom.name}</span>
                    </label>
                  ))}
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Maka (Pilih Penyakit)
                </label>
                <select
                  value={formData.then}
                  onChange={(e) => setFormData({ ...formData, then: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  required
                >
                  <option value="">Pilih penyakit</option>
                  {diseases.map((disease) => (
                    <option key={disease.id} value={disease.id}>
                      {disease.name}
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Confidence (0.0 - 1.0)
                </label>
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  max="1"
                  value={formData.confidence}
                  onChange={(e) => setFormData({ ...formData, confidence: parseFloat(e.target.value) })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Deskripsi
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  rows={3}
                  required
                />
              </div>
              
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
                >
                  {editingRule ? 'Perbarui' : 'Simpan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminRules;