import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import { 
  BarChart3, 
  Users, 
  Activity, 
  FileText, 
  Settings, 
  TrendingUp,
  Heart,
  BookOpen,
  Stethoscope
} from 'lucide-react';

interface Stats {
  totalUsers: number;
  totalSymptoms: number;
  totalDiseases: number;
  totalRules: number;
  totalDiagnoses: number;
  totalArticles: number;
  recentDiagnoses: any[];
}

const AdminDashboard: React.FC = () => {
  const [stats, setStats] = useState<Stats | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setIsLoading(true);
      const response = await axios.get('http://localhost:5000/api/stats');
      setStats(response.data);
    } catch (error) {
      toast.error('Gagal memuat statistik');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-sky-500"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      <div className="text-center">
        <BarChart3 className="h-16 w-16 text-sky-500 mx-auto mb-4" />
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Dashboard Admin</h1>
        <p className="text-gray-600">Kelola sistem pakar kesehatan</p>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-gray-800">{stats.totalUsers}</div>
                <div className="text-gray-600">Total Pengguna</div>
              </div>
              <Users className="h-8 w-8 text-sky-500" />
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-gray-800">{stats.totalSymptoms}</div>
                <div className="text-gray-600">Total Gejala</div>
              </div>
              <Activity className="h-8 w-8 text-emerald-500" />
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-gray-800">{stats.totalDiseases}</div>
                <div className="text-gray-600">Total Penyakit</div>
              </div>
              <Heart className="h-8 w-8 text-red-500" />
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-gray-800">{stats.totalRules}</div>
                <div className="text-gray-600">Total Aturan</div>
              </div>
              <Settings className="h-8 w-8 text-orange-500" />
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-gray-800">{stats.totalDiagnoses}</div>
                <div className="text-gray-600">Total Diagnosa</div>
              </div>
              <Stethoscope className="h-8 w-8 text-purple-500" />
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-gray-800">{stats.totalArticles}</div>
                <div className="text-gray-600">Total Artikel</div>
              </div>
              <BookOpen className="h-8 w-8 text-indigo-500" />
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-gray-800">95%</div>
                <div className="text-gray-600">Tingkat Akurasi</div>
              </div>
              <TrendingUp className="h-8 w-8 text-green-500" />
            </div>
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div className="bg-white rounded-2xl shadow-lg p-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-6">Aksi Cepat</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Link
            to="/admin/symptoms"
            className="bg-emerald-50 hover:bg-emerald-100 p-4 rounded-lg text-center transition-colors"
          >
            <Activity className="h-8 w-8 text-emerald-500 mx-auto mb-2" />
            <div className="font-semibold text-gray-800">Kelola Gejala</div>
          </Link>

          <Link
            to="/admin/diseases"
            className="bg-red-50 hover:bg-red-100 p-4 rounded-lg text-center transition-colors"
          >
            <Heart className="h-8 w-8 text-red-500 mx-auto mb-2" />
            <div className="font-semibold text-gray-800">Kelola Penyakit</div>
          </Link>

          <Link
            to="/admin/rules"
            className="bg-orange-50 hover:bg-orange-100 p-4 rounded-lg text-center transition-colors"
          >
            <Settings className="h-8 w-8 text-orange-500 mx-auto mb-2" />
            <div className="font-semibold text-gray-800">Kelola Aturan</div>
          </Link>

          <Link
            to="/admin/articles"
            className="bg-indigo-50 hover:bg-indigo-100 p-4 rounded-lg text-center transition-colors"
          >
            <BookOpen className="h-8 w-8 text-indigo-500 mx-auto mb-2" />
            <div className="font-semibold text-gray-800">Kelola Artikel</div>
          </Link>
        </div>
      </div>

      {/* Recent Diagnoses */}
      {stats && stats.recentDiagnoses.length > 0 && (
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-6">Diagnosa Terbaru</h2>
          <div className="space-y-4">
            {stats.recentDiagnoses.map((diagnosis, index) => (
              <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <Activity className="h-5 w-5 text-sky-500" />
                  <div>
                    <div className="font-medium text-gray-800">
                      {diagnosis.symptoms.length} gejala dipilih
                    </div>
                    <div className="text-sm text-gray-600">
                      {diagnosis.results.length} hasil diagnosa
                    </div>
                  </div>
                </div>
                <div className="text-sm text-gray-500">
                  {new Date(diagnosis.createdAt).toLocaleDateString('id-ID')}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;