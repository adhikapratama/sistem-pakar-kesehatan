import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Heart, Stethoscope, BookOpen, Shield } from 'lucide-react';

const Home: React.FC = () => {
  const { user } = useAuth();

  return (
    <div className="space-y-12">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-sky-500 to-emerald-500 text-white rounded-2xl p-12 text-center">
        <div className="max-w-4xl mx-auto">
          <Heart className="h-16 w-16 mx-auto mb-6" />
          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            Sistem Pakar Kesehatan
          </h1>
          <p className="text-xl md:text-2xl mb-8 opacity-90">
            Diagnosa penyakit berdasarkan gejala dengan teknologi forward chaining
          </p>
          {user ? (
            <Link
              to="/diagnose"
              className="bg-white text-sky-500 px-8 py-4 rounded-lg font-semibold text-lg hover:bg-gray-100 transition-colors inline-flex items-center space-x-2"
            >
              <Stethoscope className="h-5 w-5" />
              <span>Mulai Diagnosa</span>
            </Link>
          ) : (
            <Link
              to="/register"
              className="bg-white text-sky-500 px-8 py-4 rounded-lg font-semibold text-lg hover:bg-gray-100 transition-colors"
            >
              Daftar Sekarang
            </Link>
          )}
        </div>
      </section>

      {/* Features Section */}
      <section className="grid md:grid-cols-3 gap-8">
        <div className="bg-white p-8 rounded-2xl shadow-lg text-center">
          <div className="bg-sky-100 p-4 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
            <Stethoscope className="h-8 w-8 text-sky-500" />
          </div>
          <h3 className="text-2xl font-bold mb-4 text-gray-800">Diagnosa Cepat</h3>
          <p className="text-gray-600 mb-6">
            Dapatkan diagnosa penyakit dengan cepat berdasarkan gejala yang Anda alami
          </p>
          {user && (
            <Link
              to="/diagnose"
              className="text-sky-500 font-semibold hover:text-sky-600 transition-colors"
            >
              Mulai Diagnosa →
            </Link>
          )}
        </div>

        <div className="bg-white p-8 rounded-2xl shadow-lg text-center">
          <div className="bg-emerald-100 p-4 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
            <BookOpen className="h-8 w-8 text-emerald-500" />
          </div>
          <h3 className="text-2xl font-bold mb-4 text-gray-800">Edukasi Kesehatan</h3>
          <p className="text-gray-600 mb-6">
            Baca artikel kesehatan terpercaya untuk meningkatkan pengetahuan Anda
          </p>
          <Link
            to="/education"
            className="text-emerald-500 font-semibold hover:text-emerald-600 transition-colors"
          >
            Baca Artikel →
          </Link>
        </div>

        <div className="bg-white p-8 rounded-2xl shadow-lg text-center">
          <div className="bg-orange-100 p-4 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
            <Shield className="h-8 w-8 text-orange-500" />
          </div>
          <h3 className="text-2xl font-bold mb-4 text-gray-800">Terpercaya</h3>
          <p className="text-gray-600 mb-6">
            Sistem menggunakan forward chaining dengan confidence score yang akurat
          </p>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="bg-white rounded-2xl p-8 shadow-lg">
        <h2 className="text-3xl font-bold text-center mb-8 text-gray-800">
          Cara Kerja Sistem
        </h2>
        <div className="grid md:grid-cols-4 gap-6">
          <div className="text-center">
            <div className="bg-sky-500 text-white rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-4 font-bold text-lg">
              1
            </div>
            <h4 className="font-semibold mb-2">Pilih Gejala</h4>
            <p className="text-sm text-gray-600">Pilih gejala yang Anda alami dari daftar yang tersedia</p>
          </div>
          <div className="text-center">
            <div className="bg-emerald-500 text-white rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-4 font-bold text-lg">
              2
            </div>
            <h4 className="font-semibold mb-2">Analisis</h4>
            <p className="text-sm text-gray-600">Sistem menganalisis gejala menggunakan forward chaining</p>
          </div>
          <div className="text-center">
            <div className="bg-orange-500 text-white rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-4 font-bold text-lg">
              3
            </div>
            <h4 className="font-semibold mb-2">Hasil</h4>
            <p className="text-sm text-gray-600">Dapatkan hasil diagnosa dengan tingkat kepercayaan</p>
          </div>
          <div className="text-center">
            <div className="bg-purple-500 text-white rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-4 font-bold text-lg">
              4
            </div>
            <h4 className="font-semibold mb-2">Rekomendasi</h4>
            <p className="text-sm text-gray-600">Terima rekomendasi penanganan yang tepat</p>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-2xl p-8">
        <div className="grid md:grid-cols-4 gap-6 text-center">
          <div>
            <div className="text-4xl font-bold mb-2">50+</div>
            <div className="text-lg opacity-90">Gejala</div>
          </div>
          <div>
            <div className="text-4xl font-bold mb-2">20+</div>
            <div className="text-lg opacity-90">Penyakit</div>
          </div>
          <div>
            <div className="text-4xl font-bold mb-2">100+</div>
            <div className="text-lg opacity-90">Aturan</div>
          </div>
          <div>
            <div className="text-4xl font-bold mb-2">95%</div>
            <div className="text-lg opacity-90">Akurasi</div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;