// 使用浏览器的 localStorage 来模拟数据存储
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

const POSTS_STORAGE_KEY = 'blog_posts';

export const getPosts = (tag?: string, includeDeleted: boolean = false): Post[] => {
  if (typeof window === 'undefined') return [];
  try {
    const posts = localStorage.getItem(POSTS_STORAGE_KEY);
    const allPosts: Post[] = posts ? JSON.parse(posts) : [];
    
    const filteredPosts = includeDeleted ? allPosts : allPosts.filter(post => !post.isDeleted);
    if (!tag || tag === 'all') return filteredPosts;
    return filteredPosts.filter(post => post.tags.includes(tag));
  } catch (error) {
    console.error('获取文章失败:', error);
    return [];
  }
};

export const getDeletedPosts = (): Post[] => {
  if (typeof window === 'undefined') return [];
  try {
    const posts = localStorage.getItem(POSTS_STORAGE_KEY);
    const allPosts: Post[] = posts ? JSON.parse(posts) : [];
    return allPosts.filter(post => post.isDeleted);
  } catch (error) {
    console.error('获取已删除文章失败:', error);
    return [];
  }
};

export const addPost = (postData: Omit<Post, 'id' | 'date' | 'image' | 'isNewest' | 'isFeatured' | 'isDeleted' | 'deletedAt'>): Post => {
  const { title, content, tags = [], isFeatured = false } = postData;
  const newPost: Post = {
    title,
    content,
    tags,
    id: Date.now().toString(),
    date: new Date(Date.now() + 8 * 60 * 60 * 1000).toISOString().replace('T', ' ').slice(0, 19),
    image: '/true-duck.png',
    isNewest: true,
    isFeatured: false,
    isDeleted: false
  };

  const posts = getPosts(undefined, true);
  // 将之前的最新文章标记为非最新
  const updatedPosts = posts.map(p => ({ ...p, isNewest: false }));
  // 添加新文章
  const newPosts = [newPost, ...updatedPosts];
  
  localStorage.setItem(POSTS_STORAGE_KEY, JSON.stringify(newPosts));
  return newPost;
};

export const getPostById = (id: string): Post | undefined => {
  const posts = getPosts(undefined, true);
  return posts.find(post => post.id === id);
};

export const deletePost = (id: string): void => {
  const posts = getPosts(undefined, true);
  const updatedPosts = posts.map(post => {
    if (post.id === id) {
      return {
        ...post,
        isDeleted: true,
        deletedAt: new Date(Date.now() + 8 * 60 * 60 * 1000).toISOString().replace('T', ' ').slice(0, 19)
      };
    }
    return post;
  });
  localStorage.setItem(POSTS_STORAGE_KEY, JSON.stringify(updatedPosts));
};

export const restorePost = (id: string): void => {
  const posts = getPosts(undefined, true);
  const updatedPosts = posts.map(post => {
    if (post.id === id) {
      const { isDeleted, deletedAt, ...restoredPost } = post;
      return restoredPost;
    }
    return post;
  });
  localStorage.setItem(POSTS_STORAGE_KEY, JSON.stringify(updatedPosts));
};

export const updatePostDate = (id: string, newDate: string): void => {
  const posts = getPosts(undefined, true);
  const updatedPosts = posts.map(post => {
    if (post.id === id) {
      return {
        ...post,
        date: newDate
      };
    }
    return post;
  });
  localStorage.setItem(POSTS_STORAGE_KEY, JSON.stringify(updatedPosts));
};

export const permanentlyDeletePost = (id: string): void => {
  const posts = getPosts(undefined, true);
  const updatedPosts = posts.filter(post => post.id !== id);
  localStorage.setItem(POSTS_STORAGE_KEY, JSON.stringify(updatedPosts));
};

export const getAllTags = (): string[] => {
  const posts = getPosts();
  const tagsSet = new Set<string>();
  
  posts.forEach(post => {
    post.tags.forEach(tag => tagsSet.add(tag));
  });
  
  return Array.from(tagsSet);
};