'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { addPost, getAllTags } from '@/app/services/posts';
import Navbar from '@/app/components/Navbar';

export default function UploadPage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [availableTags, setAvailableTags] = useState<string[]>([]);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [parsedContent, setParsedContent] = useState<{ title: string; content: string } | null>(null);

  useEffect(() => {
    document.title = '上传文章';
  }, []);

  useEffect(() => {
    const fetchTags = async () => {
      try {
        const allTags = await getAllTags();
        setAvailableTags(allTags);
      } catch (error) {
        console.error('获取标签失败:', error);
      }
    };
    fetchTags();
  }, []);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
  
    if (!file.name.endsWith('.md')) {
      setError('请上传 Markdown 格式的文件');
      return;
    }
  
    setIsUploading(true);
    setError(null);
  
    try {
      const content = await file.text();
      const { body, tags } = parseMarkdown(content);
      setParsedContent({
        title: file.name.replace(/\.md$/, ''),
        content: body
      });
      setSelectedTags(tags);
      // 在文件上传后立即显示标签输入框
      setTagInput(' ');
      setTagInput('');
    } catch (err) {
      setError('解析文件失败，请确保文件格式正确');
      console.error('上传失败:', err);
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = async () => {
    if (!parsedContent) return;
  
    try {
      const newPost = await addPost({
        title: parsedContent.title,
        content: parsedContent.content,
        tags: selectedTags.length > 0 ? selectedTags : []
      });
      router.push(`/blog/${newPost.id}`);
    } catch (err) {
      setError('发布失败，请重试');
      console.error('发布失败:', err);
    }
  };

  const handleTagSelect = (tag: string) => {
    if (!selectedTags.includes(tag)) {
      setSelectedTags([...selectedTags, tag]);
    }
    setTagInput('');
  };

  const handleTagRemove = (tagToRemove: string) => {
    setSelectedTags(selectedTags.filter(tag => tag !== tagToRemove));
  };

  const handleTagInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTagInput(e.target.value);
  };

  const handleTagInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && tagInput.trim()) {
      e.preventDefault();
      const newTag = tagInput.trim();
      if (!selectedTags.includes(newTag)) {
        setSelectedTags([...selectedTags, newTag]);
      }
      setTagInput('');
    }
  };

  const parseMarkdown = (content: string) => {
    const lines = content.split('\n');
    let bodyStart = 0;
    let tags: string[] = [];
  
    // 检查是否有 frontmatter
    if (lines[0]?.trim() === '---') {
      const frontmatterEndIndex = lines.findIndex((line, index) => index > 0 && line.trim() === '---');
      if (frontmatterEndIndex !== -1) {
        // 解析 frontmatter
        const frontmatter = lines.slice(1, frontmatterEndIndex);
        frontmatter.forEach(line => {
          const [key, value] = line.split(':').map(part => part.trim());
          if (key === 'tags') {
            // 改进标签解析逻辑
            try {
              // 尝试解析 JSON 格式
              tags = JSON.parse(value || '[]');
            } catch {
              // 如果不是 JSON 格式，则按照逗号分隔的字符串处理
              tags = value
                .replace(/[\[\]'"]/g, '') // 移除方括号和引号
                .split(',') // 按逗号分隔
                .map(tag => tag.trim()) // 移除空白
                .filter(tag => tag.length > 0); // 移除空标签
            }
          }
        });
        bodyStart = frontmatterEndIndex + 1;
      }
    }
  
    // 提取正文内容
    const body = lines.slice(bodyStart).join('\n').trim();
  
    return { body, tags };
  };

  const handleDragOver = (event: React.DragEvent) => {
    event.preventDefault();
    event.stopPropagation();
  };

  const handleDrop = (event: React.DragEvent) => {
    event.preventDefault();
    event.stopPropagation();

    const file = event.dataTransfer.files[0];
    if (file && fileInputRef.current) {
      const dataTransfer = new DataTransfer();
      dataTransfer.items.add(file);
      fileInputRef.current.files = dataTransfer.files;
      handleFileUpload({ target: { files: dataTransfer.files } } as React.ChangeEvent<HTMLInputElement>);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="py-8 pt-24">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-lg shadow p-6">
            <h1 className="text-2xl font-bold text-gray-900 mb-6">上传文章</h1>
            {!parsedContent ? (
              <div
                className="border-2 border-dashed border-gray-300 rounded-lg p-12 text-center"
                onDragOver={handleDragOver}
                onDrop={handleDrop}
              >
                <input
                  type="file"
                  accept=".md"
                  onChange={handleFileUpload}
                  className="hidden"
                  ref={fileInputRef}
                />
                <div className="space-y-4">
                  <div className="text-gray-600">
                    <p className="text-lg">拖拽 Markdown 文件到这里</p>
                    <p className="text-sm">或者</p>
                  </div>
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploading}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                  >
                    {isUploading ? '上传中...' : '选择文件'}
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                <div>
                  <label htmlFor="tags" className="block text-sm font-medium text-gray-700">
                    标签
                  </label>
                  <div className="mt-1 relative">
                    <div className="flex flex-wrap gap-2 p-2 border rounded-md bg-white">
                      {selectedTags.map((tag) => (
                        <span
                          key={tag}
                          className="inline-flex items-center px-2 py-1 rounded-md text-sm font-medium bg-blue-100 text-blue-800"
                        >
                          {tag}
                          <button
                            type="button"
                            onClick={() => handleTagRemove(tag)}
                            className="ml-1 inline-flex text-blue-400 hover:text-blue-600"
                          >
                            <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                              <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" />
                            </svg>
                          </button>
                        </span>
                      ))}
                      <input
                        type="text"
                        value={tagInput}
                        onChange={handleTagInputChange}
                        onKeyDown={handleTagInputKeyDown}
                        className="flex-1 outline-none min-w-[120px]"
                        placeholder="输入或选择标签"
                      />
                    </div>
                    {tagInput && (
                      <ul className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
                        {availableTags
                          .filter(tag => 
                            tag.toLowerCase().includes(tagInput.toLowerCase()) &&
                            !selectedTags.includes(tag)
                          )
                          .map((tag) => (
                            <li
                              key={tag}
                              className="relative cursor-pointer select-none py-2 pl-3 pr-9 text-gray-900 hover:bg-blue-50"
                              onClick={() => handleTagSelect(tag)}
                            >
                              {tag}
                            </li>
                          ))}
                      </ul>
                    )}
                  </div>
                </div>
                <div className="flex justify-end space-x-4">
                  <button
                    onClick={() => {
                      setParsedContent(null);
                      setSelectedTags([]);
                      setTagInput('');
                      setError(null);
                    }}
                    className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    重新选择
                  </button>
                  <button
                    onClick={handleSubmit}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    发布文章
                  </button>
                </div>
              </div>
            )}
            {error && (
              <p className="mt-4 text-sm text-red-600">{error}</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}