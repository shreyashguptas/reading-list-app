'use client';

import { useState, useEffect } from 'react';
import { Article } from '@/lib/supabase';

interface Statistics {
  total: number;
  toBeRead: number;
  inProgress: number;
  finished: number;
  completionPercentage: number;
}

export default function Home() {
  const [url, setUrl] = useState('');
  const [articles, setArticles] = useState<Article[]>([]);
  const [statistics, setStatistics] = useState<Statistics>({
    total: 0,
    toBeRead: 0,
    inProgress: 0,
    finished: 0,
    completionPercentage: 0
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // Fetch articles and statistics on component mount
  useEffect(() => {
    fetchArticles();
    fetchStatistics();
  }, []);

  const fetchArticles = async () => {
    try {
      const response = await fetch('/api/articles');
      const data = await response.json();
      if (response.ok) {
        setArticles(data);
      }
    } catch (error) {
      console.error('Error fetching articles:', error);
    }
  };

  const fetchStatistics = async () => {
    try {
      const response = await fetch('/api/statistics');
      const data = await response.json();
      if (response.ok) {
        setStatistics(data);
      }
    } catch (error) {
      console.error('Error fetching statistics:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim()) return;

    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/articles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: url.trim() })
      });

      const data = await response.json();

      if (response.ok) {
        setUrl('');
        setShowAddForm(false);
        await fetchArticles();
        await fetchStatistics();
      } else {
        setError(data.error || 'Failed to add article');
      }
    } catch (error) {
      setError('Failed to add article');
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id: string, status: Article['status']) => {
    try {
      const response = await fetch(`/api/articles/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });

      if (response.ok) {
        await fetchArticles();
        await fetchStatistics();
      }
    } catch (error) {
      console.error('Error updating status:', error);
    }
  };

  const deleteArticle = async (id: string) => {
    if (!confirm('Are you sure you want to delete this article?')) return;

    try {
      const response = await fetch(`/api/articles/${id}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        await fetchArticles();
        await fetchStatistics();
      }
    } catch (error) {
      console.error('Error deleting article:', error);
    }
  };

  const getStatusClass = (status: string) => {
    switch (status) {
      case 'to_be_read': return 'status-badge status-to-read';
      case 'in_progress': return 'status-badge status-in-progress';
      case 'finished': return 'status-badge status-finished';
      default: return 'status-badge status-to-read';
    }
  };

  const filteredArticles = articles.filter(article =>
    article.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    article.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="glass-effect sticky top-0 z-40 border-b border-white/20 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 gradient-bg rounded-xl flex items-center justify-center shadow-lg scale-hover">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
                </svg>
              </div>
              <h1 className="text-2xl font-bold gradient-text">
                Article Reading List
              </h1>
            </div>
            
            <div className="flex items-center space-x-4">
              {/* Search Bar */}
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search by title or author..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="modern-input w-72 pl-4 pr-10"
                />
                <svg className="absolute right-3 top-3 h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>

              {/* Select Button */}
              <button className="btn-secondary flex items-center">
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Select
              </button>

              {/* Add Article Button */}
              <button
                onClick={() => setShowAddForm(true)}
                className="btn-primary flex items-center scale-hover"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Add Article
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Statistics */}
        <div className="mb-12 fade-in">
          {/* Main Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
            <div className="modern-card p-8 text-center">
              <div className="text-5xl font-bold gradient-text mb-2">
                {statistics.total}
              </div>
              <div className="text-gray-600 text-lg font-medium">Total Articles</div>
            </div>
            <div className="modern-card p-8 text-center" style={{background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.1) 0%, rgba(5, 150, 105, 0.1) 100%)'}}>
              <div className="text-5xl font-bold mb-2" style={{background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text'}}>
                {statistics.completionPercentage}%
              </div>
              <div className="text-emerald-700 text-lg font-medium">Finished</div>
            </div>
          </div>

          {/* Status Stats */}
          <div className="grid grid-cols-3 gap-6">
            <div className="modern-card p-6 text-center">
              <div className="text-3xl font-bold text-amber-600 mb-2">{statistics.toBeRead}</div>
              <div className="text-gray-600 font-medium">To Be Read</div>
            </div>
            <div className="modern-card p-6 text-center">
              <div className="text-3xl font-bold text-blue-600 mb-2">{statistics.inProgress}</div>
              <div className="text-gray-600 font-medium">In Progress</div>
            </div>
            <div className="modern-card p-6 text-center">
              <div className="text-3xl font-bold text-emerald-600 mb-2">{statistics.finished}</div>
              <div className="text-gray-600 font-medium">Finished</div>
            </div>
          </div>
        </div>

        {/* Add Article Modal */}
        {showAddForm && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="modern-card p-8 max-w-md w-full">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Add New Article</h2>
                <button
                  onClick={() => setShowAddForm(false)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <form onSubmit={handleSubmit}>
                <div className="mb-6">
                  <label className="block text-sm font-semibold text-gray-700 mb-3">
                    Article URL
                  </label>
                  <input
                    type="url"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    placeholder="https://example.com/article"
                    className="modern-input w-full"
                    disabled={loading}
                  />
                </div>
                {error && (
                  <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl">
                    <p className="text-red-600 text-sm">{error}</p>
                  </div>
                )}
                <div className="flex gap-4">
                  <button
                    type="submit"
                    disabled={loading || !url.trim()}
                    className="btn-primary flex-1"
                  >
                    {loading ? 'Adding...' : 'Add Article'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowAddForm(false)}
                    className="btn-secondary"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Articles Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredArticles.length === 0 ? (
            <div className="col-span-full text-center py-20">
              <div className="w-32 h-32 mx-auto mb-8">
                <svg className="w-full h-full text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
                </svg>
              </div>
              <p className="text-gray-500 text-xl font-medium">
                {searchTerm ? 'No articles found matching your search.' : 'No articles yet. Add your first article above!'}
              </p>
            </div>
          ) : (
            filteredArticles.map((article) => (
              <div key={article.id} className="modern-card p-6 group scale-hover">
                <div className="flex items-start gap-4 mb-4">
                  {article.image_url && (
                    <img
                      src={article.image_url}
                      alt={article.title || 'Article'}
                      className="w-16 h-20 object-cover rounded-xl shadow-md flex-shrink-0 scale-hover"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                      }}
                    />
                  )}
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2 leading-tight">
                      {article.title || 'Untitled Article'}
                    </h3>
                    {article.description && (
                      <p className="text-gray-600 text-sm line-clamp-2 mb-3 leading-relaxed">{article.description}</p>
                    )}
                    <div className="flex items-center text-gray-400 text-sm">
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      Added {new Date(article.created_at).toLocaleDateString('en-US', { 
                        month: 'short', 
                        day: 'numeric', 
                        year: 'numeric' 
                      })}
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                  <select
                    value={article.status}
                    onChange={(e) => updateStatus(article.id, e.target.value as Article['status'])}
                    className={getStatusClass(article.status)}
                  >
                    <option value="to_be_read">To Be Read</option>
                    <option value="in_progress">In Progress</option>
                    <option value="finished">Finished</option>
                  </select>
                  
                  <div className="flex items-center gap-4">
                    <a
                      href={article.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-700 text-sm font-semibold transition-colors"
                    >
                      Read
                    </a>
                    <button
                      onClick={() => deleteArticle(article.id)}
                      className="text-red-600 hover:text-red-700 text-sm transition-colors"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
