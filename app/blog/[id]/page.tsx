'use client';

import { useEffect, useState, useRef } from 'react';
import { useParams } from 'next/navigation';
import { getPostById } from '@/app/services/posts';
import Image from 'next/image';
import Navbar from '@/app/components/Navbar';
import Head from 'next/head';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface TocItem {
  id: string;
  text: string;
  level: number;
}

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

export default function BlogPost() {
  const params = useParams();
  const [post, setPost] = useState<Post | null>(null);
  const [toc, setToc] = useState<TocItem[]>([]);
  const [activeId, setActiveId] = useState<string>('');
  const contentRef = useRef<HTMLDivElement>(null);

  // 解析文章内容中的标题，生成目录结构
  const generateToc = (content: string) => {
    if (!content) return [];
    
    const headings = content.match(/^#{1,6}\s+[^\n]+/gm) || [];
    return headings.map((heading) => {
      const level = (heading.match(/^#+/) || [''])[0].length;
      const text = heading
        .replace(/^#+\s+/, '') // 移除标题标记
        .trim(); // 移除首尾空格
      const id = String(text).toLowerCase().replace(/\s+/g, '-');
      return { id, text, level };
    });
  };

  // 监听滚动，更新当前阅读位置
  useEffect(() => {
    const handleScroll = () => {
      if (!contentRef.current) return;

      const headingElements = contentRef.current.querySelectorAll('h1, h2, h3, h4, h5, h6');
      const headingPositions = Array.from(headingElements).map((heading) => ({
        id: heading.id,
        top: heading.getBoundingClientRect().top,
      }));

      // 找到第一个在视口上方的标题
      const currentHeading = headingPositions
        .filter(heading => heading.top <= 100) // 考虑导航栏的高度
        .slice(-1)[0] || headingPositions[0];

      if (currentHeading) {
        setActiveId(currentHeading.id);
      }
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll(); // 初始化时执行一次
    return () => window.removeEventListener('scroll', handleScroll);
  }, [post]);

  useEffect(() => {
    const fetchPost = async () => {
      try {
        const postId = params.id as string;
        const foundPost = await getPostById(postId);
        if (foundPost) {
          setPost(foundPost);
          document.title = foundPost.title;
          setToc(generateToc(foundPost.content));
        }
      } catch (error) {
        console.error('获取文章失败:', error);
      }
    };
    
    fetchPost();
  }, [params.id]);

  if (!post) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-500">文章不存在或已被删除</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="py-8 pt-24">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex gap-8">
            {/* 左侧目录导航 */}
            <div className="w-64 hidden lg:block">
              <div className="sticky top-24 bg-white rounded-lg shadow p-4 max-h-[calc(100vh-8rem)] overflow-y-auto">
                <h2 className="text-lg font-semibold mb-4">目录</h2>
                <nav className="space-y-1">
                  {toc.map((item) => (
                    <a
                      key={item.id}
                      href={`#${item.id}`}
                      className={`block py-1.5 ${activeId === item.id ? 'text-blue-600 font-medium' : 'text-gray-600 hover:text-gray-900'} transition-colors duration-200`}
                      style={{ paddingLeft: `${(item.level - 1) * 16}px` }}
                      onClick={(e) => {
                        e.preventDefault();
                        const element = document.getElementById(item.id);
                        if (element) {
                          const navbarHeight = 80; // 导航栏高度
                          const elementPosition = element.getBoundingClientRect().top + window.scrollY;
                          const offsetPosition = elementPosition - navbarHeight;

                          window.scrollTo({
                            top: offsetPosition,
                            behavior: 'smooth'
                          });
                        }
                      }}
                    >
                      {item.text}
                    </a>
                  ))}
                </nav>
              </div>
            </div>
            {/* 右侧文章内容 */}
            <div className="flex-1">
              <div className="bg-white rounded-lg shadow p-6">
                <div className="mb-6">
                  <div className="mb-4">
                    <div className="flex items-center gap-2">
                      <h1 className="text-3xl font-bold text-gray-900">{post.title}</h1>
                      {post.isFeatured && (
                        <span className="bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded">
                          Featured
                        </span>
                      )}
                      {post.tags && post.tags.map((tag, index) => (
                        <span
                          key={`${tag}-${index}`}
                          className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="text-sm text-gray-500">{post.date}</div>
                </div>
                <div ref={contentRef} className="prose prose-sm sm:prose lg:prose-lg xl:prose-xl max-w-none">
                  <ReactMarkdown
                    remarkPlugins={[remarkGfm]}
                    components={{
                      h1: ({ children }) => <h1 id={String(children).toLowerCase().replace(/\s+/g, '-')}>{children}</h1>,
                      h2: ({ children }) => <h2 id={String(children).toLowerCase().replace(/\s+/g, '-')}>{children}</h2>,
                      h3: ({ children }) => <h3 id={String(children).toLowerCase().replace(/\s+/g, '-')}>{children}</h3>,
                      h4: ({ children }) => <h4 id={String(children).toLowerCase().replace(/\s+/g, '-')}>{children}</h4>,
                      h5: ({ children }) => <h5 id={String(children).toLowerCase().replace(/\s+/g, '-')}>{children}</h5>,
                      h6: ({ children }) => <h6 id={String(children).toLowerCase().replace(/\s+/g, '-')}>{children}</h6>,
                      strong: ({ children }) => <strong className="font-bold">{children}</strong>,
                      img: ({ src, alt }) => {
                        if (!src) return null;
                        return (
                          <div className="relative w-full h-auto">
                            <Image
                              src={src}
                              alt={alt || ''}
                              width={800}
                              height={600}
                              className="max-w-full h-auto"
                              style={{ objectFit: 'contain' }}
                            />
                          </div>
                        );
                      },
                    }}
                  >
                    {post.content}
                  </ReactMarkdown>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}