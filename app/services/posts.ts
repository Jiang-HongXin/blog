'use server';

import fs from 'fs/promises';
import path from 'path';
import matter from 'gray-matter';

export interface Post {
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

const POSTS_DIR = path.join(process.cwd(), 'posts');

// 确保 posts 目录存在
fs.mkdir(POSTS_DIR, { recursive: true }).catch(error => {
  console.error('创建目录失败:', error);
});

export const getPostById = async (id: string): Promise<Post | null> => {
  try {
    const posts = await getPosts();
    const post = posts.find(p => p.id === id);
    if (!post) return null;
    return post;
  } catch (error) {
    console.error('获取文章失败:', error);
    return null;
  }
};

export const getPosts = async (tag?: string, includeDeleted: boolean = false): Promise<Post[]> => {
  try {
    const getAllFiles = async (dir: string): Promise<string[]> => {
      const entries = await fs.readdir(dir, { withFileTypes: true });
      const files = await Promise.all(
        entries.map(async (entry) => {
          const fullPath = path.join(dir, entry.name);
          return entry.isDirectory() ? getAllFiles(fullPath) : fullPath;
        })
      );
      return files.flat();
    };

    const allFiles = await getAllFiles(POSTS_DIR);
    const posts = await Promise.all(
      allFiles
        .filter(file => file.endsWith('.md'))
        .map(async filePath => {
          const fileContent = await fs.readFile(filePath, 'utf-8');
          const { data, content } = matter(fileContent);
              
              return {
                id: path.basename(filePath, '.md'),
                title: data.title || '',
                content,
                tags: data.tags || [],
                date: data.date || '',
                image: data.image || '/true-duck.png',
                isNewest: data.isNewest || false,
                isFeatured: data.isFeatured || false,
                isDeleted: data.isDeleted || false,
                deletedAt: data.deletedAt
              };
            })
        );

    const filteredPosts = includeDeleted ? posts : posts.filter(post => !post.isDeleted);
    const sortedPosts = filteredPosts.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    if (!tag || tag === 'all') return sortedPosts;
    return sortedPosts.filter(post => post.tags.includes(tag));
  } catch (error) {
    console.error('获取文章失败:', error);
    return [];
  }
};

export const getDeletedPosts = async (): Promise<Post[]> => {
  const posts = await getPosts(undefined, true);
  return posts.filter(post => post.isDeleted);
};

export const addPost = async (postData: Omit<Post, 'id' | 'date' | 'image' | 'isNewest' | 'isFeatured' | 'isDeleted' | 'deletedAt'>): Promise<Post> => {
  const { title, content, tags = [] } = postData;
  const id = Date.now().toString();
  const date = new Date(Date.now() + 8 * 60 * 60 * 1000).toISOString().replace('T', ' ').slice(0, 19);
  
  // 更新其他文章的 isNewest 状态
  const posts = await getPosts(undefined, true);
  await Promise.all(
    posts.map(async post => {
      if (post.isNewest) {
        const postDate = new Date(post.date);
        const yearMonth = `${postDate.getFullYear()}${String(postDate.getMonth() + 1).padStart(2, '0')}`;
        const filePath = path.join(POSTS_DIR, yearMonth, `${post.id}.md`);
        const fileContent = await fs.readFile(filePath, 'utf-8');
        const { data, content } = matter(fileContent);
        await fs.writeFile(filePath, matter.stringify(content, { ...data, isNewest: false }));
      }
    })
  );

  // 创建新文章
  const newPost: Post = {
    id,
    title,
    content,
    tags,
    date,
    image: '/true-duck.png',
    isNewest: true,
    isFeatured: false,
    isDeleted: false
  };

  // 根据日期创建年月目录
  const postDate = new Date(date);
  const yearMonth = `${postDate.getFullYear()}${String(postDate.getMonth() + 1).padStart(2, '0')}`;
  const yearMonthDir = path.join(POSTS_DIR, yearMonth);
  
  // 确保年月目录存在
  await fs.mkdir(yearMonthDir, { recursive: true });

  const fileName = `${id}.md`;
  const filePath = path.join(yearMonthDir, fileName);
  const fileContent = matter.stringify(content, {
    title,
    tags: Array.isArray(tags) ? tags : [],
    date,
    image: '/true-duck.png',
    isNewest: true,
    isFeatured: false,
    isDeleted: false
  });

  await fs.writeFile(filePath, fileContent, 'utf-8');
  return newPost;
};



export const deletePost = async (id: string): Promise<void> => {
  try {
    const post = await getPostById(id);
    if (!post) throw new Error('文章不存在');
    
    const postDate = new Date(post.date);
    const yearMonth = `${postDate.getFullYear()}${String(postDate.getMonth() + 1).padStart(2, '0')}`;
    const filePath = path.join(POSTS_DIR, yearMonth, `${id}.md`);
    
    const fileContent = await fs.readFile(filePath, 'utf-8');
    const { data, content } = matter(fileContent);
    const updatedData = {
      ...data,
      isDeleted: true,
      deletedAt: new Date(Date.now() + 8 * 60 * 60 * 1000).toISOString().replace('T', ' ').slice(0, 19)
    };
    await fs.writeFile(filePath, matter.stringify(content, updatedData));
  } catch (error) {
    console.error('删除文章失败:', error);
  }
};

export const moveToTrash = deletePost;

export const restorePost = async (id: string): Promise<void> => {
  try {
    const post = await getPostById(id);
    if (!post) throw new Error('文章不存在');
    
    const postDate = new Date(post.date);
    const yearMonth = `${postDate.getFullYear()}${String(postDate.getMonth() + 1).padStart(2, '0')}`;
    const filePath = path.join(POSTS_DIR, yearMonth, `${id}.md`);
    
    const fileContent = await fs.readFile(filePath, 'utf-8');
    const { data, content } = matter(fileContent);
    const { isDeleted, deletedAt, ...restData } = data;
    await fs.writeFile(filePath, matter.stringify(content, restData));
  } catch (error) {
    console.error('恢复文章失败:', error);
  }
};

export const updatePostDate = async (id: string, newDate: string): Promise<void> => {
  try {
    const post = await getPostById(id);
    if (!post) throw new Error('文章不存在');
    
    // 获取原始文件路径
    const oldDate = new Date(post.date);
    const oldYearMonth = `${oldDate.getFullYear()}${String(oldDate.getMonth() + 1).padStart(2, '0')}`;
    const oldFilePath = path.join(POSTS_DIR, oldYearMonth, `${id}.md`);
    
    // 获取新的文件路径
    const newDateObj = new Date(newDate);
    const newYearMonth = `${newDateObj.getFullYear()}${String(newDateObj.getMonth() + 1).padStart(2, '0')}`;
    const newFilePath = path.join(POSTS_DIR, newYearMonth, `${id}.md`);
    
    // 确保目标目录存在
    await fs.mkdir(path.join(POSTS_DIR, newYearMonth), { recursive: true });
    
    const fileContent = await fs.readFile(oldFilePath, 'utf-8');
    const { data, content } = matter(fileContent);
    
    // 如果日期变化导致文件需要移动到不同的目录
    if (oldYearMonth !== newYearMonth) {
      await fs.writeFile(newFilePath, matter.stringify(content, { ...data, date: newDate }));
      await fs.unlink(oldFilePath);
    } else {
      await fs.writeFile(oldFilePath, matter.stringify(content, { ...data, date: newDate }));
    }
  } catch (error) {
    console.error('更新文章日期失败:', error);
  }
};

export const permanentlyDeletePost = async (id: string): Promise<void> => {
  try {
    // 先获取所有文章（包括已删除的）
    const posts = await getPosts(undefined, true);
    const post = posts.find(p => p.id === id);
    
    if (!post) {
      throw new Error('文章不存在');
    }
    
    if (!post.isDeleted) {
      throw new Error('只能永久删除已在回收站的文章');
    }
    
    const postDate = new Date(post.date);
    const yearMonth = `${postDate.getFullYear()}${String(postDate.getMonth() + 1).padStart(2, '0')}`;
    const filePath = path.join(POSTS_DIR, yearMonth, `${id}.md`);
    
    // 检查文件是否存在
    try {
      await fs.access(filePath);
    } catch (error) {
      throw new Error(`文件不存在: ${filePath}`);
    }
    
    // 文件存在，执行删除操作
    await fs.unlink(filePath);
  } catch (error) {
    console.error('永久删除文章失败:', error);
    throw error; // 向上抛出错误，以便UI层可以处理
  }
};

export const getAllTags = async (): Promise<string[]> => {
  const posts = await getPosts();
  const tagsSet = new Set<string>();
  
  posts.forEach(post => {
    if (post.tags && Array.isArray(post.tags)) {
      post.tags.forEach(tag => {
        if (tag) tagsSet.add(tag);
      });
    }
  });
  
  return Array.from(tagsSet);
};