import Link from 'next/link';

import Image from 'next/image';

export default function Navbar() {
  return (
    <nav className="fixed top-0 left-0 right-0 bg-white/80 backdrop-blur-sm z-50 border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <Link href="/" className="flex items-center">
              <Image
                src="/true-duck.png"
                alt="Logo"
                width={32}
                height={32}
                className="rounded-full p-1"
              />
            </Link>
            <div className="sm:ml-6 sm:flex sm:space-x-8">
              <Link
                href="/"
                className="text-gray-900 hover:text-gray-600 px-3 py-2 text-sm font-medium"
              >
                首页
              </Link>
              <Link
                href="/history"
                className="text-gray-900 hover:text-gray-600 px-3 py-2 text-sm font-medium"
              >
                历史文章
              </Link>
              <Link
                href="/trash"
                className="text-gray-900 hover:text-gray-600 px-3 py-2 text-sm font-medium"
              >
                回收站
              </Link>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <Link href="/upload" className="bg-green-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-green-700">
              上传文章
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}