'use client';

import Link from "next/link";
import Navbar from "../components/Navbar";
import { getPosts, deletePost, getAllTags, updatePostDate } from "../services/posts";
import { useEffect, useState } from "react";

export default function ManagePage() {
  const [blogPosts, setBlogPosts] = useState<{
    id: string;
    title: string;
    content: string;
    date: string;
    tags: string[];
    isFeatured: boolean;
  }[]>([]);
  const [selectedTag, setSelectedTag] = useState('all');
  const [tags, setTags] = useState<string[]>([]);
  const [editingDate, setEditingDate] = useState<string | null>(null);

  useEffect(() => {
    document.title = '管理文章';
    const fetchData = async () => {
      const posts = await getPosts(selectedTag);
      setBlogPosts(posts);
      const allTags = await getAllTags();
      setTags(allTags);
    };
    
    fetchData();
  }, [selectedTag]);

  const handleDateChange = async (postId: string, newDate: string) => {
    await updatePostDate(postId, newDate);
    const posts = await getPosts(selectedTag);
    setBlogPosts(posts);
    setEditingDate(null);
  };

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24">
        <div className="text-center mb-12">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">管理文章</h1>
          <p className="text-lg text-gray-600">在这里管理你的所有文章</p>
        </div>
        <div className="mt-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row gap-8">
            {/* 左侧分类导航 */}
            <div className="lg:w-1/4">
              <nav className="sticky top-24 space-y-1">
                <button
                  onClick={() => setSelectedTag('all')}
                  className={`w-full text-left ${selectedTag === 'all' ? 'bg-gray-100 text-gray-900' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'} group flex items-center px-3 py-2 text-sm font-medium rounded-md`}
                >
                  全部文章
                </button>
                {tags.map(tag => (
                  <button
                    key={tag}
                    onClick={() => setSelectedTag(tag)}
                    className={`w-full text-left ${selectedTag === tag ? 'bg-gray-100 text-gray-900' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'} group flex items-center px-3 py-2 text-sm font-medium rounded-md`}
                  >
                    {tag}
                  </button>
                ))}
              </nav>
            </div>
            {/* 右侧文章列表 */}
            <div className="lg:w-3/4">
              <div className="space-y-8">
                {blogPosts.map((post) => (
                  <div key={post.id} className="block">
                    <div className="relative flex items-start space-x-6 p-6 bg-white rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-200">
                      <button
                        onClick={async () => {
                          if (window.confirm('确定要删除这篇文章吗？')) {
                            await deletePost(post.id);
                            const posts = await getPosts(selectedTag);
                            setBlogPosts(posts);
                            const allTags = await getAllTags();
                            setTags(allTags);
                          }
                        }}
                        className="absolute top-4 right-4 text-gray-400 hover:text-red-500 transition-colors duration-200"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                      </button>
                      <div className="flex-1">
                        <div className="mb-2">
                          <div className="flex items-center gap-2">
                            <Link href={`/blog/${post.id}`} className="text-xl font-semibold text-gray-900 hover:text-blue-600">
                              {post.title}
                            </Link>
                            {post.isFeatured && (
                              <span className="bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded">Featured</span>
                            )}
                            {post.tags.map((tag) => (
                              <span key={tag} className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded">{tag}</span>
                            ))}
                          </div>
                        </div>
                        <p className="text-gray-600 mb-4">
                          {post.content
                            .replace(/[#*`\[\]()]/g, '') // 移除 Markdown 语法标记
                            .replace(/\n+/g, ' ') // 将多个换行符替换为单个空格
                            .trim() // 移除首尾空白字符
                            .slice(0, 100) // 限制预览内容长度
                            + '...'}
                        </p>
                        <div className="text-sm text-gray-500">
                          {editingDate === post.id ? (
                            <input
                              type="datetime-local"
                              defaultValue={post.date.replace(' ', 'T')}
                              onChange={(e) => handleDateChange(post.id, e.target.value)}
                              onBlur={() => setEditingDate(null)}
                              className="border border-gray-300 rounded px-2 py-1"
                            />
                          ) : (
                            <button
                              onClick={() => setEditingDate(post.id)}
                              className="hover:text-blue-600"
                            >
                              {post.date}
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}