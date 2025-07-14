import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { BookOpen, Calendar, Tag } from 'lucide-react';

interface Article {
  id: string;
  title: string;
  content: string;
  tags: string[];
  createdAt: string;
}

const Education: React.FC = () => {
  const [articles, setArticles] = useState<Article[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);

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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
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
        <BookOpen className="h-16 w-16 text-sky-500 mx-auto mb-4" />
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Edukasi Kesehatan</h1>
        <p className="text-gray-600">Baca artikel kesehatan terpercaya untuk meningkatkan pengetahuan Anda</p>
      </div>

      {selectedArticle ? (
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <button
            onClick={() => setSelectedArticle(null)}
            className="mb-6 text-sky-500 hover:text-sky-600 transition-colors"
          >
            ← Kembali ke daftar artikel
          </button>
          
          <article>
            <h1 className="text-3xl font-bold text-gray-800 mb-4">
              {selectedArticle.title}
            </h1>
            
            <div className="flex items-center space-x-4 mb-6 text-gray-600">
              <div className="flex items-center space-x-2">
                <Calendar className="h-4 w-4" />
                <span>{formatDate(selectedArticle.createdAt)}</span>
              </div>
              <div className="flex items-center space-x-2">
                <Tag className="h-4 w-4" />
                <div className="flex space-x-2">
                  {selectedArticle.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="bg-sky-100 text-sky-700 px-2 py-1 rounded-full text-sm"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>
            
            <div className="prose max-w-none">
              <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                {selectedArticle.content}
              </p>
            </div>
          </article>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {articles.map((article) => (
            <div
              key={article.id}
              className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow cursor-pointer"
              onClick={() => setSelectedArticle(article)}
            >
              <div className="p-6">
                <h3 className="text-xl font-semibold text-gray-800 mb-3">
                  {article.title}
                </h3>
                
                <p className="text-gray-600 mb-4 line-clamp-3">
                  {article.content.substring(0, 150)}...
                </p>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2 text-sm text-gray-500">
                    <Calendar className="h-4 w-4" />
                    <span>{formatDate(article.createdAt)}</span>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {article.tags.slice(0, 2).map((tag, index) => (
                      <span
                        key={index}
                        className="bg-sky-100 text-sky-700 px-2 py-1 rounded-full text-xs"
                      >
                        {tag}
                      </span>
                    ))}
                    {article.tags.length > 2 && (
                      <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded-full text-xs">
                        +{article.tags.length - 2}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {!selectedArticle && articles.length === 0 && (
        <div className="text-center py-12">
          <BookOpen className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">Belum ada artikel tersedia</p>
        </div>
      )}
    </div>
  );
};

export default Education;