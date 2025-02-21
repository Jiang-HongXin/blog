'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Navbar from '@/app/components/Navbar';
import { getPosts } from '@/app/services/posts';

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

interface GroupedPosts {
  [key: string]: {
    [key: string]: Post[]
  }
}

export default function HistoryPage() {
  const [groupedPosts, setGroupedPosts] = useState<GroupedPosts>({});

  useEffect(() => {
    document.title = '历史文章';
    const posts = getPosts();
    const grouped = posts.reduce((acc: GroupedPosts, post) => {
      const date = new Date(post.date);
      const year = date.getFullYear().toString();
      const month = (date.getMonth() + 1).toString().padStart(2, '0');
      
      if (!acc[year]) acc[year] = {};
      if (!acc[year][month]) acc[year][month] = [];
      
      acc[year][month].push(post);
      return acc;
    }, {});

    // 按年份和月份排序
    const sortedGrouped = Object.keys(grouped)
      .sort((a, b) => parseInt(b) - parseInt(a))
      .reduce((acc: GroupedPosts, year) => {
        acc[year] = Object.keys(grouped[year])
          .sort((a, b) => parseInt(b) - parseInt(a))
          .reduce((monthAcc: { [key: string]: Post[] }, month) => {
            monthAcc[month] = grouped[year][month];
            return monthAcc;
          }, {});
        return acc;
      }, {});

    setGroupedPosts(sortedGrouped);
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="py-8 pt-24">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">历史文章</h1>
          <div className="space-y-16">
            {Object.entries(groupedPosts).map(([year, months]) => (
              <div key={year} className="relative">
                <h2 className="text-2xl font-semibold text-gray-900 mb-6">{year}</h2>
                <div className="space-y-8">
                  {Object.entries(months).map(([month, posts]) => (
                    <div key={`${year}-${month}`} className="relative pl-8 before:content-[''] before:absolute before:left-0 before:top-3 before:w-2 before:h-2 before:bg-blue-500 before:rounded-full before:-translate-x-1/2">
                      <h3 className="text-lg font-medium text-gray-900 mb-4">{month}月</h3>
                      <div className="space-y-4">
                        {posts.map((post) => (
                          <Link
                            href={`/blog/${post.id}`}
                            key={post.id}
                            className="block bg-white rounded-lg shadow p-4 hover:shadow-md transition-shadow duration-200"
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex-1">
                                <h4 className="text-lg font-medium text-gray-900 mb-1">{post.title}</h4>
                                <div className="flex items-center gap-2">
                                  <span className="text-sm text-gray-500">{post.date.split(' ')[0]}</span>
                                  {post.tags.map((tag) => (
                                    <span
                                      key={tag}
                                      className="bg-blue-100 text-blue-800 text-xs font-medium px-2 py-0.5 rounded"
                                    >
                                      {tag}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            </div>
                          </Link>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}