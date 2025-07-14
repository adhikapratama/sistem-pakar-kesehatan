import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { BookOpen, Plus, Edit, Trash2, Search, Calendar, Tag } from 'lucide-react';

interface Article {
  id: string;
  title: string;
  content: string;
  tags: string[];
  createdAt: string;
}

const AdminArticles: React.FC = () => {
  const [articles, setArticles] = useState<Article[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingArticle, setEditingArticle] = useState<Article | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    tags: [] as string[]
  });
  const [tagInput, setTagInput] = useState('');

  useEffect(() => {
    fetchArticles();
  }, []);

  const fetchArticles = async () => {
    try {
      setIsLoading(true);
      const response = await axios.get('http://localhost:5000/api/articles');
      setArticles(response.data);
    } catch (error) {
      toast.error('Gagal memuat artikel');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (editingArticle) {
        await axios.put(`http://localhost:5000/api/articles/${editingArticle.id}`, formData);
        toast.success('Artikel berhasil diperbarui');
      } else {
        await axios.post('http://localhost:5000/api/articles', formData);
        toast.success('Artikel berhasil ditambahkan');
      }
      
      fetchArticles();
      resetForm();
    } catch (error) {
      toast.error('Gagal menyimpan artikel');
    }
  };

  const handleEdit = (article: Article) => {
    setEditingArticle(article);
    setFormData({
      title: article.title,
      content: article.content,
      tags: article.tags
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Apakah Anda yakin ingin menghapus artikel ini?')) {
      try {
        await axios.delete(`http://localhost:5000/api/articles/${id}`);
        toast.success('Artikel berhasil dihapus');
        fetchArticles();
      } catch (error) {
        toast.error('Gagal menghapus artikel');
      }
    }
  };

  const resetForm = () => {
    setFormData({ title: '', content: '', tags: [] });
    setTagInput('');
    setEditingArticle(null);
    setIsModalOpen(false);
  };

  const handleAddTag = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && tagInput.trim()) {
      e.preventDefault();
      if (!formData.tags.includes(tagInput.trim())) {
        setFormData(prev => ({
          ...prev,
          tags: [...prev.tags, tagInput.trim()]
        }));
      }
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const filteredArticles = articles.filter(article =>
    article.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    article.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
    article.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div className="text-center">
        <BookOpen className="h-16 w-16 text-indigo-500 mx-auto mb-4" />
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Kelola Artikel</h1>
        <p className="text-gray-600">Tambah, edit, atau hapus artikel dalam sistem</p>
      </div>

      {/* Header Actions */}
      <div className="flex items-center justify-between">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="Cari artikel..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          />
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center space-x-2 bg-indigo-500 text-white px-4 py-2 rounded-lg hover:bg-indigo-600 transition-colors"
        >
          <Plus className="h-4 w-4" />
          <span>Tambah Artikel</span>
        </button>
      </div>

      {/* Articles Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredArticles.map((article) => (
          <div key={article.id} className="bg-white rounded-2xl shadow-lg overflow-hidden">
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-2 line-clamp-2">
                {article.title}
              </h3>
              
              <p className="text-gray-600 mb-4 text-sm line-clamp-3">
                {article.content.substring(0, 120)}...
              </p>
              
              <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                <div className="flex items-center space-x-1">
                  <Calendar className="h-4 w-4" />
                  <span>{formatDate(article.createdAt)}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Tag className="h-4 w-4" />
                  <span>{article.tags.length} tags</span>
                </div>
              </div>

              <div className="flex flex-wrap gap-1 mb-4">
                {article.tags.slice(0, 3).map((tag, index) => (
                  <span
                    key={index}
                    className="bg-indigo-100 text-indigo-700 px-2 py-1 rounded-full text-xs"
                  >
                    {tag}
                  </span>
                ))}
                {article.tags.length > 3 && (
                  <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded-full text-xs">
                    +{article.tags.length - 3}
                  </span>
                )}
              </div>

              <div className="flex justify-end space-x-2">
                <button
                  onClick={() => handleEdit(article)}
                  className="text-blue-600 hover:text-blue-800 p-2"
                >
                  <Edit className="h-4 w-4" />
                </button>
                <button
                  onClick={() => handleDelete(article.id)}
                  className="text-red-600 hover:text-red-800 p-2"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold text-gray-800 mb-4">
              {editingArticle ? 'Edit Artikel' : 'Tambah Artikel'}
            </h2>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Judul Artikel
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Konten Artikel
                </label>
                <textarea
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  rows={10}
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tags (Tekan Enter untuk menambah)
                </label>
                <input
                  type="text"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={handleAddTag}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  placeholder="Ketik tag dan tekan Enter"
                />
                <div className="flex flex-wrap gap-2 mt-2">
                  {formData.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="bg-indigo-100 text-indigo-700 px-2 py-1 rounded-full text-sm flex items-center space-x-1"
                    >
                      <span>{tag}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveTag(tag)}
                        className="text-indigo-500 hover:text-indigo-700"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
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
                  className="px-4 py-2 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 transition-colors"
                >
                  {editingArticle ? 'Perbarui' : 'Simpan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminArticles;