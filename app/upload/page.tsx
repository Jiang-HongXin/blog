'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { addPost } from '@/app/services/posts';
import Navbar from '@/app/components/Navbar';

export default function UploadPage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [tags, setTags] = useState('');
  const [parsedContent, setParsedContent] = useState<{ title: string; content: string } | null>(null);

  useEffect(() => {
    document.title = '上传文章';
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
      const { body } = parseMarkdown(content);
      setParsedContent({
        title: file.name.replace(/\.md$/, ''),
        content: body
      });
    } catch (err) {
      setError('解析文件失败，请确保文件格式正确');
      console.error('上传失败:', err);
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = () => {
    if (!parsedContent) return;

    try {
      const newPost = addPost({
        title: parsedContent.title,
        content: parsedContent.content,
        tags: tags.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0)
      });
      router.push(`/blog/${newPost.id}`);
    } catch (err) {
      setError('发布失败，请重试');
      console.error('发布失败:', err);
    }
  };

  const parseMarkdown = (content: string) => {
    const lines = content.split('\n');
    let title = '';
    let bodyStart = 0;

    // 查找标题（第一个 # 开头的行）
    const titleLine = lines.findIndex(line => line.startsWith('# '));
    if (titleLine !== -1) {
      title = lines[titleLine].replace('# ', '').trim();
      bodyStart = titleLine + 1;
    }

    // 提取正文内容
    const body = lines.slice(bodyStart).join('\n').trim();

    return { title, body };
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
      handleFileUpload({ target: { files: dataTransfer.files } } as any);
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
                    标签（用逗号分隔）
                  </label>
                  <input
                    type="text"
                    id="tags"
                    value={tags}
                    onChange={(e) => setTags(e.target.value)}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    placeholder="技术, 编程, Web开发"
                  />
                </div>
                <div className="flex justify-end space-x-4">
                  <button
                    onClick={() => {
                      setParsedContent(null);
                      setTags('');
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