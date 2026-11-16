'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Sidebar from '@/components/Sidebar';
import TopBar from '@/components/TopBar';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Heart, 
  MessageCircle, 
  Share2, 
  MoreHorizontal, 
  Plus, 
  Image as ImageIcon, 
  Video, 
  Send,
  X,
  Smile,
  Globe
} from 'lucide-react';
import Image from 'next/image';
import { useAuth } from '@/context/AuthContext';
import { Post, Comment } from '@/lib/academic-utils';
import { supabase } from '@/lib/supabase';
import { Loader2 } from 'lucide-react';

const FeedPage = () => {
  const { isAdmin, profile } = useAuth();
  const [posts, setPosts] = useState<Post[]>([]);
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newPostContent, setNewPostContent] = useState('');
  const [mediaUrl, setMediaUrl] = useState('');
  const [mediaType, setMediaType] = useState<'image' | 'video'>('image');
  const [activeCommentPost, setActiveCommentPost] = useState<string | null>(null);
  const [newComment, setNewComment] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [
        { data: postsData },
        { data: commentsData }
      ] = await Promise.all([
        supabase.from('feed_posts').select('*').order('created_at', { ascending: false }),
        supabase.from('comments').select('*')
      ]);

      if (postsData) {
        setPosts(postsData.map(p => ({
          id: p.id,
          authorId: p.author_id,
          authorName: p.author_name || 'Admin',
          authorAvatar: p.author_avatar || 'https://picsum.photos/seed/admin/100/100',
          content: p.content,
          mediaUrl: p.media_url,
          mediaType: p.media_type as any,
          createdAt: p.created_at,
          likes: p.likes || [],
          commentsCount: 0
        })));
      }

      if (commentsData) {
        setComments(commentsData.map(c => ({
          id: c.id,
          postId: c.post_id,
          authorId: c.author_id,
          authorName: c.author_name || 'User',
          authorAvatar: c.author_avatar || 'https://picsum.photos/seed/user/100/100',
          content: c.content,
          createdAt: c.created_at
        })));
      }
    } catch (error) {
      console.error("Error fetching feed data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPostContent.trim()) return;

    try {
      const { error } = await supabase
        .from('feed_posts')
        .insert([{
          author_id: profile?.uid || 'admin',
          author_name: profile?.name || 'Administrador',
          author_avatar: profile?.photoURL || 'https://picsum.photos/seed/admin/100/100',
          content: newPostContent,
          media_url: mediaUrl || null,
          media_type: mediaUrl ? mediaType : null,
          likes: []
        }]);

      if (error) throw error;

      await fetchData();
      setNewPostContent('');
      setMediaUrl('');
      setIsModalOpen(false);
    } catch (error) {
      console.error("Error creating post:", error);
      alert("Erro ao criar publicação.");
    }
  };

  const handleLike = async (postId: string) => {
    if (!profile?.uid) return;
    const post = posts.find(p => p.id === postId);
    if (!post) return;

    const hasLiked = post.likes.includes(profile.uid);
    const newLikes = hasLiked 
      ? post.likes.filter(id => id !== profile.uid)
      : [...post.likes, profile.uid];

    try {
      const { error } = await supabase
        .from('feed_posts')
        .update({ likes: newLikes })
        .eq('id', postId);
      
      if (error) throw error;
      
      setPosts(posts.map(p => p.id === postId ? { ...p, likes: newLikes } : p));
    } catch (error) {
      console.error("Error liking post:", error);
    }
  };

  const handleAddComment = async (postId: string) => {
    if (!newComment.trim() || !profile?.uid) return;

    try {
      const { error } = await supabase
        .from('comments')
        .insert([{
          post_id: postId,
          author_id: profile.uid,
          author_name: profile.name || 'Utilizador',
          author_avatar: profile.photoURL || `https://picsum.photos/seed/${profile.uid}/100/100`,
          content: newComment
        }]);

      if (error) throw error;

      await fetchData();
      setNewComment('');
    } catch (error) {
      console.error("Error adding comment:", error);
      alert("Erro ao adicionar comentário.");
    }
  };

  return (
    <div className="flex min-h-screen bg-background text-white">
      <Sidebar />
      <main className="flex-1 lg:ml-64">
        <TopBar title="Mural da Escola" />
        
        <div className="pt-24 px-4 lg:px-8 pb-12 max-w-4xl mx-auto">
          {/* Header */}
          <div className="flex justify-between items-center mb-8">
            <div>
              <h2 className="text-3xl font-black tracking-tight">Mural da Comunidade</h2>
              <p className="text-on-surface-variant text-sm">Fique por dentro das atividades e novidades da nossa escola.</p>
            </div>
            {isAdmin && (
              <button 
                onClick={() => setIsModalOpen(true)}
                className="flex items-center gap-2 px-6 py-3 bg-primary text-on-primary-fixed rounded-2xl font-bold shadow-lg shadow-primary/20 hover:scale-105 transition-all"
              >
                <Plus className="w-5 h-5" />
                Publicar Atividade
              </button>
            )}
          </div>

          {/* Feed */}
          <div className="space-y-6">
            {posts.length === 0 && (
              <div className="text-center py-20 bg-surface-container-low rounded-[2.5rem] border border-outline-variant/10">
                <Globe className="w-16 h-16 text-on-surface-variant/20 mx-auto mb-4" />
                <p className="text-on-surface-variant">Ainda não há publicações. {isAdmin ? 'Seja o primeiro a publicar!' : 'Aguarde novidades dos administradores.'}</p>
              </div>
            )}

            {posts.map((post) => (
              <motion.div 
                key={post.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-surface-container-low rounded-[2.5rem] border border-outline-variant/5 overflow-hidden shadow-sm"
              >
                {/* Post Header */}
                <div className="p-6 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="relative w-12 h-12 rounded-2xl overflow-hidden ring-2 ring-primary/20">
                      <Image 
                        src={post.authorAvatar} 
                        alt={post.authorName} 
                        fill 
                        className="object-cover"
                        referrerPolicy="no-referrer"
                      />
                    </div>
                    <div>
                      <h4 className="font-bold text-white flex items-center gap-2">
                        {post.authorName}
                        <span className="bg-primary/10 text-primary text-[10px] px-2 py-0.5 rounded-full font-black uppercase tracking-widest">Admin</span>
                      </h4>
                      <p className="text-xs text-on-surface-variant">
                        {new Date(post.createdAt).toLocaleDateString('pt-PT', { day: '2-digit', month: 'long', hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>
                  <button className="p-2 text-on-surface-variant hover:text-white transition-colors">
                    <MoreHorizontal className="w-6 h-6" />
                  </button>
                </div>

                {/* Post Content */}
                <div className="px-6 pb-4">
                  <p className="text-on-surface text-base leading-relaxed whitespace-pre-wrap">{post.content}</p>
                </div>

                {/* Post Media */}
                {post.mediaUrl && (
                  <div className="px-6 pb-6">
                    <div className="relative aspect-video rounded-3xl overflow-hidden bg-black border border-outline-variant/10">
                      {post.mediaType === 'image' ? (
                        <Image 
                          src={post.mediaUrl} 
                          alt="Post media" 
                          fill 
                          className="object-cover"
                          referrerPolicy="no-referrer"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Video className="w-12 h-12 text-primary/40" />
                          <p className="absolute bottom-4 left-4 text-xs text-white/60">Vídeo: {post.mediaUrl}</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Post Actions */}
                <div className="px-6 py-4 border-t border-outline-variant/5 flex items-center gap-6">
                  <button 
                    onClick={() => handleLike(post.id)}
                    className={`flex items-center gap-2 text-sm font-bold transition-colors ${
                      profile?.uid && post.likes.includes(profile.uid) ? 'text-error' : 'text-on-surface-variant hover:text-error'
                    }`}
                  >
                    <Heart className={`w-5 h-5 ${profile?.uid && post.likes.includes(profile.uid) ? 'fill-current' : ''}`} />
                    {post.likes.length}
                  </button>
                  <button 
                    onClick={() => setActiveCommentPost(activeCommentPost === post.id ? null : post.id)}
                    className="flex items-center gap-2 text-sm font-bold text-on-surface-variant hover:text-primary transition-colors"
                  >
                    <MessageCircle className="w-5 h-5" />
                    {post.commentsCount}
                  </button>
                  <button className="flex items-center gap-2 text-sm font-bold text-on-surface-variant hover:text-secondary transition-colors ml-auto">
                    <Share2 className="w-5 h-5" />
                    Partilhar
                  </button>
                </div>

                {/* Comments Section */}
                <AnimatePresence>
                  {activeCommentPost === post.id && (
                    <motion.div 
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="bg-surface-container-high/30 border-t border-outline-variant/5"
                    >
                      <div className="p-6 space-y-4">
                        {comments.filter(c => c.postId === post.id).map((comment) => (
                          <div key={comment.id} className="flex gap-3">
                            <div className="relative w-8 h-8 rounded-xl overflow-hidden flex-shrink-0">
                              <Image 
                                src={comment.authorAvatar} 
                                alt={comment.authorName} 
                                fill 
                                className="object-cover"
                                referrerPolicy="no-referrer"
                              />
                            </div>
                            <div className="flex-1 bg-surface-container-highest/50 p-3 rounded-2xl">
                              <div className="flex justify-between items-center mb-1">
                                <span className="text-xs font-bold text-white">{comment.authorName}</span>
                                <span className="text-[10px] text-on-surface-variant">
                                  {new Date(comment.createdAt).toLocaleDateString()}
                                </span>
                              </div>
                              <p className="text-sm text-on-surface-variant">{comment.content}</p>
                            </div>
                          </div>
                        ))}

                        {/* Add Comment Input */}
                        <div className="flex gap-3 pt-2">
                          <div className="relative w-8 h-8 rounded-xl overflow-hidden flex-shrink-0">
                            <Image 
                              src={profile?.photoURL || 'https://picsum.photos/seed/user/100/100'} 
                              alt="User" 
                              fill 
                              className="object-cover"
                              referrerPolicy="no-referrer"
                            />
                          </div>
                          <div className="flex-1 relative">
                            <input 
                              type="text" 
                              placeholder="Escreva um comentário..." 
                              value={newComment}
                              onChange={(e) => setNewComment(e.target.value)}
                              onKeyDown={(e) => e.key === 'Enter' && handleAddComment(post.id)}
                              className="w-full bg-surface-container-highest border border-outline-variant/10 rounded-xl py-2 pl-4 pr-10 text-sm text-white outline-none focus:ring-2 focus:ring-primary/20"
                            />
                            <button 
                              onClick={() => handleAddComment(post.id)}
                              className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 text-primary hover:bg-primary/10 rounded-lg transition-colors"
                            >
                              <Send className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Create Post Modal */}
        <AnimatePresence>
          {isModalOpen && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setIsModalOpen(false)}
                className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              />
              <motion.div 
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                className="relative w-full max-w-lg bg-surface-container-high border border-outline-variant/10 rounded-[2.5rem] shadow-2xl overflow-hidden"
              >
                <div className="px-8 py-6 border-b border-outline-variant/10 flex justify-between items-center">
                  <h2 className="text-xl font-bold text-white">Nova Publicação</h2>
                  <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-surface-container-highest rounded-full transition-colors">
                    <X className="w-5 h-5 text-on-surface-variant" />
                  </button>
                </div>
                <form onSubmit={handleCreatePost} className="p-8 space-y-6">
                  <div className="space-y-4">
                    <textarea 
                      required
                      rows={4}
                      value={newPostContent}
                      onChange={(e) => setNewPostContent(e.target.value)}
                      className="w-full bg-surface-container-low border border-outline-variant/10 rounded-2xl p-4 text-white outline-none focus:ring-2 focus:ring-primary/20 resize-none"
                      placeholder="O que está a acontecer na escola?"
                    />
                    
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-on-surface-variant uppercase tracking-widest ml-1">Média (URL Opcional)</label>
                      <div className="flex gap-2">
                        <div className="flex-1 relative">
                          <input 
                            type="text" 
                            value={mediaUrl}
                            onChange={(e) => setMediaUrl(e.target.value)}
                            className="w-full bg-surface-container-low border border-outline-variant/10 rounded-xl py-3 px-4 text-sm text-white outline-none focus:ring-2 focus:ring-primary/20"
                            placeholder="Link da imagem ou vídeo..."
                          />
                        </div>
                        <select 
                          value={mediaType}
                          onChange={(e) => setMediaType(e.target.value as any)}
                          className="bg-surface-container-low border border-outline-variant/10 rounded-xl px-3 text-xs font-bold text-white outline-none"
                        >
                          <option value="image">Imagem</option>
                          <option value="video">Vídeo</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-outline-variant/10">
                    <div className="flex gap-2">
                      <button type="button" className="p-2 text-on-surface-variant hover:text-primary hover:bg-primary/10 rounded-xl transition-all">
                        <ImageIcon className="w-5 h-5" />
                      </button>
                      <button type="button" className="p-2 text-on-surface-variant hover:text-secondary hover:bg-secondary/10 rounded-xl transition-all">
                        <Video className="w-5 h-5" />
                      </button>
                      <button type="button" className="p-2 text-on-surface-variant hover:text-tertiary hover:bg-tertiary/10 rounded-xl transition-all">
                        <Smile className="w-5 h-5" />
                      </button>
                    </div>
                    <button 
                      type="submit"
                      className="px-8 py-3 bg-primary text-on-primary rounded-xl font-bold shadow-lg shadow-primary/20 hover:opacity-90 active:scale-95 transition-all"
                    >
                      Publicar
                    </button>
                  </div>
                </form>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
};

export default FeedPage;
