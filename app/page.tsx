'use client';

import Image from "next/image";
import Link from "next/link";
import Navbar from "./components/Navbar";
import { getPosts, getAllTags, moveToTrash } from "./services/posts";
import { useEffect, useState } from "react";

interface Post {
  id: string;
  title: string;
  content: string;
  tags: string[];
  date: string;
  image: string;
  isNewest: boolean;
  isFeatured: boolean;
}

export default function Home() {
  const [blogPosts, setBlogPosts] = useState<Post[]>([]);
  const [selectedTag, setSelectedTag] = useState('all');
  const [tags, setTags] = useState<string[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const posts = await getPosts(selectedTag);
        setBlogPosts(posts);
        const allTags = await getAllTags();
        setTags(allTags);
      } catch (error) {
        console.error('获取数据失败:', error);
        setBlogPosts([]);
        setTags([]);
      }
    };
    
    fetchData();
  }, [selectedTag]);

  const handleDelete = async (postId: string, e: React.MouseEvent) => {
    e.preventDefault(); // 阻止链接跳转
    if (window.confirm('确定要删除这篇文章吗？删除后可在回收站中恢复。')) {
      try {
        await moveToTrash(postId);
        // 更新文章列表
        setBlogPosts(blogPosts.filter(post => post.id !== postId));
      } catch (error) {
        console.error('删除失败:', error);
        alert('删除失败，请重试');
      }
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24">
        <div className="text-center mb-12 flex items-center justify-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">很晚才睡</h1>
            <p className="text-lg text-gray-600 mb-2">阅读与思考，真理与自由</p>
            <p className="text-base text-gray-500 mb-4">一个还在重新学习，重塑思想的开发者</p>
            <div className="flex justify-center items-center space-x-4 text-sm text-gray-500">
              <Link href="/rss" className="hover:text-gray-900">RSS订阅</Link>
              <span>・</span>
              <Link href="/donate" className="hover:text-gray-900">赞赏</Link>
              <span>・</span>
              <Link href="https://twitter.com" className="hover:text-gray-900">X</Link>
              <span>・</span>
              <Link href="https://xiaohongshu.com" className="hover:text-gray-900">小红书</Link>
            </div>
          </div>
          <Image
            src="/true-duck.png"
            alt="Duck Avatar"
            width={80}
            height={80}
            className="rounded-full"
          />
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
                  <div key={post.id} className="relative">
                    <Link
                      href={`/blog/${post.id}`}
                      className="block"
                    >
                      <div className="relative flex items-start space-x-6 p-6 bg-white rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-200">
                        <div className="flex-1">
                          <div className="mb-2">
                            <div className="flex items-center gap-2">
                              <span className="text-xl font-semibold text-gray-900 hover:text-blue-600">
                                {post.title}
                              </span>
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
                          <div className="text-sm text-gray-500">{post.date}</div>
                        </div>
                      </div>
                    </Link>
                    <button
                      onClick={(e) => handleDelete(post.id, e)}
                      className="absolute top-4 right-4 p-2 text-gray-400 hover:text-red-500 transition-colors duration-200"
                    >
                      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
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
