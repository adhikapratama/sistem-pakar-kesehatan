import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { Activity, Plus, Edit, Trash2, Search } from 'lucide-react';

interface Symptom {
  id: string;
  name: string;
  description: string;
}

const AdminSymptoms: React.FC = () => {
  const [symptoms, setSymptoms] = useState<Symptom[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSymptom, setEditingSymptom] = useState<Symptom | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    description: ''
  });

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (editingSymptom) {
        await axios.put(`http://localhost:5000/api/symptoms/${editingSymptom.id}`, formData);
        toast.success('Gejala berhasil diperbarui');
      } else {
        await axios.post('http://localhost:5000/api/symptoms', formData);
        toast.success('Gejala berhasil ditambahkan');
      }
      
      fetchSymptoms();
      resetForm();
    } catch (error) {
      toast.error('Gagal menyimpan gejala');
    }
  };

  const handleEdit = (symptom: Symptom) => {
    setEditingSymptom(symptom);
    setFormData({
      name: symptom.name,
      description: symptom.description
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Apakah Anda yakin ingin menghapus gejala ini?')) {
      try {
        await axios.delete(`http://localhost:5000/api/symptoms/${id}`);
        toast.success('Gejala berhasil dihapus');
        fetchSymptoms();
      } catch (error) {
        toast.error('Gagal menghapus gejala');
      }
    }
  };

  const resetForm = () => {
    setFormData({ name: '', description: '' });
    setEditingSymptom(null);
    setIsModalOpen(false);
  };

  const filteredSymptoms = symptoms.filter(symptom =>
    symptom.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    symptom.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div className="text-center">
        <Activity className="h-16 w-16 text-emerald-500 mx-auto mb-4" />
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Kelola Gejala</h1>
        <p className="text-gray-600">Tambah, edit, atau hapus gejala dalam sistem</p>
      </div>

      {/* Header Actions */}
      <div className="flex items-center justify-between">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="Cari gejala..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
          />
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center space-x-2 bg-emerald-500 text-white px-4 py-2 rounded-lg hover:bg-emerald-600 transition-colors"
        >
          <Plus className="h-4 w-4" />
          <span>Tambah Gejala</span>
        </button>
      </div>

      {/* Symptoms Table */}
      <div className="bg-white rounded-lg shadow-lg overflow-hidden border border-gray-300">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr>
                <th className="px-4 py-2 text-center text-sm font-bold text-black border border-gray-400 bg-gray-100">
                  ID
                </th>
                <th className="px-4 py-2 text-center text-sm font-bold text-black border border-gray-400 bg-gray-100">
                  Nama Gejala
                </th>
                <th className="px-4 py-2 text-center text-sm font-bold text-black border border-gray-400 bg-gray-100">
                  Deskripsi
                </th>
                <th className="px-4 py-2 text-center text-sm font-bold text-black border border-gray-400 bg-gray-100">
                  Aksi
                </th>
              </tr>
            </thead>
            <tbody className="bg-white">
              {filteredSymptoms.map((symptom) => (
                <tr key={symptom.id} className="hover:bg-gray-50">
                  <td className="px-4 py-2 text-center text-sm text-black border border-gray-400 font-medium">
                    {symptom.id}
                  </td>
                  <td className="px-4 py-2 text-left text-sm text-black border border-gray-400">
                    {symptom.name}
                  </td>
                  <td className="px-4 py-2 text-left text-sm text-black border border-gray-400">
                    {symptom.description}
                  </td>
                  <td className="px-4 py-2 text-center border border-gray-400">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleEdit(symptom)}
                        className="text-blue-600 hover:text-blue-800"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(symptom.id)}
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
          <div className="bg-white rounded-2xl p-6 w-full max-w-md">
            <h2 className="text-xl font-bold text-gray-800 mb-4">
              {editingSymptom ? 'Edit Gejala' : 'Tambah Gejala'}
            </h2>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nama Gejala
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
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
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
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
                  className="px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors"
                >
                  {editingSymptom ? 'Perbarui' : 'Simpan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminSymptoms;