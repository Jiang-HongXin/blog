'use client';

import { useEffect, useState } from 'react';
import { getDeletedPosts, restorePost, permanentlyDeletePost } from '@/app/services/posts';
import Navbar from '@/app/components/Navbar';

interface Post {
  id: string;
  title: string;
  content: string;
  tags: string[];
  date: string;
  image: string;
  isNewest: boolean;
  isFeatured: boolean;
  isDeleted?: boolean;
  deletedAt?: string;
}

export default function TrashPage() {
  const [deletedPosts, setDeletedPosts] = useState<Post[]>([]);

  useEffect(() => {
    document.title = '回收站';
    fetchDeletedPosts();
  }, []);

  const fetchDeletedPosts = async () => {
    try {
      const posts = await getDeletedPosts();
      setDeletedPosts(posts);
    } catch (error) {
      console.error('获取已删除文章失败:', error);
      setDeletedPosts([]);
    }
  };

  const handleRestore = async (id: string) => {
    if (window.confirm('确定要恢复这篇文章吗？')) {
      try {
        await restorePost(id);
        await fetchDeletedPosts();
      } catch (error) {
        console.error('恢复文章失败:', error);
      }
    }
  };

  const handlePermanentDelete = async (id: string) => {
    if (window.confirm('确定要永久删除这篇文章吗？此操作不可恢复！')) {
      try {
        await permanentlyDeletePost(id);
        await fetchDeletedPosts();
      } catch (error) {
        console.error('永久删除文章失败:', error);
      }
    }
  };

  const handleClearTrash = async () => {
    if (window.confirm('确定要清空回收站吗？此操作将永久删除所有文章且不可恢复！')) {
      try {
        await Promise.all(deletedPosts.map(post => permanentlyDeletePost(post.id)));
        await fetchDeletedPosts();
      } catch (error) {
        console.error('清空回收站失败:', error);
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="py-8 pt-24">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900">回收站</h1>
            {deletedPosts.length > 0 && (
              <button
                onClick={handleClearTrash}
                className="bg-red-600 hover:bg-red-700 text-white font-medium px-4 py-2 rounded-lg text-sm"
              >
                清空回收站
              </button>
            )}
          </div>
          {deletedPosts.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500">回收站是空的</p>
            </div>
          ) : (
            <div className="space-y-6">
              {deletedPosts.map((post) => (
                <div
                  key={post.id}
                  className="bg-white rounded-lg shadow-lg p-6"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h2 className="text-xl font-semibold text-gray-900">{post.title}</h2>
                      <div className="flex items-center gap-2 mt-2">
                        <span className="text-sm text-gray-500">{post.date}</span>
                        {post.tags.map((tag) => (
                          <span
                            key={tag}
                            className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <button
                        onClick={() => handleRestore(post.id)}
                        className="text-green-600 hover:text-green-800 font-medium text-sm"
                      >
                        恢复
                      </button>
                      <button
                        onClick={() => handlePermanentDelete(post.id)}
                        className="text-red-600 hover:text-red-800 font-medium text-sm"
                      >
                        永久删除
                      </button>
                    </div>
                  </div>
                  <p className="text-gray-600">{post.content.slice(0, 200)}...</p>
                  {post.deletedAt && (
                    <div className="mt-4 text-sm text-gray-500">
                      删除时间：{post.deletedAt}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}