'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import Sidebar from '@/components/Sidebar';
import TopBar from '@/components/TopBar';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Search, 
  MoreVertical, 
  Phone, 
  Video, 
  Send, 
  Paperclip, 
  Smile, 
  Mic, 
  Plus,
  Users,
  User,
  Circle,
  X,
  Camera,
  Settings,
  Image as ImageIcon,
  FileText,
  ChevronLeft,
  Sparkles
} from 'lucide-react';
import Image from 'next/image';
import { useAuth } from '@/context/AuthContext';
import { Message, ChatRoom, UserStatus, Student } from '@/lib/academic-utils';
import { supabase } from '@/lib/supabase';
import { Loader2 } from 'lucide-react';
import { GoogleGenerativeAI } from '@google/generative-ai';

const ChatPage = () => {
  const { profile } = useAuth();
  const [activeRoomId, setActiveRoomId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [rooms, setRooms] = useState<ChatRoom[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);

  const [newMessage, setNewMessage] = useState('');
  const [isCallActive, setIsCallActive] = useState(false);
  const [callType, setCallType] = useState<'voice' | 'video'>('video');
  const [searchTerm, setSearchTerm] = useState('');
  const [isAiLoading, setIsAiLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Initialize Gemini
  const genAI = useMemo(() => {
    if (typeof window !== 'undefined' && process.env.NEXT_PUBLIC_GEMINI_API_KEY) {
      return new GoogleGenerativeAI(process.env.NEXT_PUBLIC_GEMINI_API_KEY);
    }
    return null;
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const fetchData = React.useCallback(async () => {
    setLoading(true);
    try {
      const [
        { data: roomsData },
        { data: studentsData }
      ] = await Promise.all([
        supabase.from('chat_rooms').select('*').order('last_message_at', { ascending: false }),
        supabase.from('students').select('*').limit(20) // Limit initial students fetch for performance
      ]);

      if (roomsData) {
        let roomsList = roomsData.map(r => ({
          id: r.id,
          name: r.name,
          type: r.type as any,
          participants: r.participants || [],
          avatar: r.avatar,
          lastMessage: r.last_message,
          lastMessageAt: r.last_message_at
        }));

        // Check if AI curator room exists in DB, if not, it's a virtual room for now
        // but we'll try to find it
        const aiRoom = roomsList.find(r => r.id === 'ai-curator' || r.name === 'Curador Digital (IA)');
        if (!aiRoom) {
          // We'll keep it as a virtual room for now to avoid DB spam if not needed
        }
        
        setRooms(roomsList);
      }

      if (studentsData) {
        setStudents(studentsData.map(s => ({
          id: s.student_id || s.id,
          name: s.name,
          email: s.email || '',
          grade: s.grade || '',
          classId: s.class_id || '',
          status: s.status as any || 'Ativo',
          engagement: Number(s.engagement_score) || 100,
          avatar: s.photo_url || `https://picsum.photos/seed/${s.id}/100/100`,
          number: 0
        })));
      }
    } catch (error) {
      console.error("Error fetching chat data:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchMessages = React.useCallback(async (roomId: string) => {
    const { data, error } = await supabase
      .from('chat_messages')
      .select('*')
      .eq('room_id', roomId)
      .order('created_at', { ascending: true });
    
    if (data) {
      setMessages(data.map(m => ({
        id: m.id,
        roomId: m.room_id,
        senderId: m.sender_id,
        senderName: m.sender_name || 'User',
        content: m.content,
        type: m.type as any || 'text',
        createdAt: m.created_at
      })));
      setTimeout(scrollToBottom, 100);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    if (activeRoomId) {
      fetchMessages(activeRoomId);
      // Subscribe to new messages
      const channel = supabase
        .channel(`room-${activeRoomId}`)
        .on('postgres_changes', { 
          event: 'INSERT', 
          schema: 'public', 
          table: 'chat_messages',
          filter: `room_id=eq.${activeRoomId}`
        }, (payload) => {
          const newMsg = payload.new as any;
          setMessages(prev => [...prev, {
            id: newMsg.id,
            roomId: newMsg.room_id,
            senderId: newMsg.sender_id,
            senderName: newMsg.sender_name || 'User',
            content: newMsg.content,
            type: newMsg.type as any || 'text',
            createdAt: newMsg.created_at
          }]);
          scrollToBottom();
        })
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [activeRoomId, fetchMessages]);

  const handleSendMessage = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!newMessage.trim() || !activeRoomId || !profile?.uid) return;

    const messageContent = newMessage;
    setNewMessage('');

    if (activeRoomId === 'ai-curator') {
      // Handle AI Chat
      try {
        // 1. Save User Message to DB
        const { data: userMsgData, error: userError } = await supabase
          .from('chat_messages')
          .insert([{
            room_id: null, // AI messages don't strictly need a room_id if we handle them specially, 
            // but let's use a virtual UUID or just a string if the DB allows.
            // Actually, the DB has a FK. Let's create a real room for AI if it doesn't exist.
            sender_id: profile.uid,
            sender_name: profile.name || 'Utilizador',
            content: messageContent,
            type: 'text'
          }])
          .select()
          .single();

        if (userError) {
          // Fallback to local if DB fails
          setMessages(prev => [...prev, {
            id: Date.now().toString(),
            roomId: 'ai-curator',
            senderId: profile.uid,
            senderName: profile.name || 'Utilizador',
            content: messageContent,
            type: 'text',
            createdAt: new Date().toISOString()
          }]);
        }
        
        setIsAiLoading(true);
        if (!genAI) throw new Error('Gemini API key not configured');
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
        
        const chat = model.startChat({
          history: messages.map(m => ({
            role: m.senderId === profile.uid ? 'user' : 'model',
            parts: [{ text: m.content }]
          })),
        });

        const result = await chat.sendMessage(messageContent);
        const response = await result.response;
        const text = response.text();

        // 2. Save AI Response to DB (optional, but good for persistence)
        // For now, let's just show it in the UI to avoid complex room management
        // and add a small delay for natural feel
        setTimeout(() => {
          const aiMsg: Message = {
            id: (Date.now() + 1).toString(),
            roomId: 'ai-curator',
            senderId: 'ai-bot',
            senderName: 'Curador Digital',
            content: text,
            type: 'text',
            createdAt: new Date().toISOString()
          };
          setMessages(prev => [...prev, aiMsg]);
          setIsAiLoading(false);
          scrollToBottom();
        }, 500);

      } catch (error) {
        console.error('AI Error:', error);
        setIsAiLoading(false);
        const errorMsg: Message = {
          id: (Date.now() + 1).toString(),
          roomId: 'ai-curator',
          senderId: 'ai-bot',
          senderName: 'Curador Digital',
          content: 'Desculpe, tive um problema ao processar sua mensagem. Verifique se a sua chave API do Gemini está configurada no menu Settings.',
          type: 'text',
          createdAt: new Date().toISOString()
        };
        setMessages(prev => [...prev, errorMsg]);
      }
      return;
    }

    try {
      const { error } = await supabase
        .from('chat_messages')
        .insert([{
          room_id: activeRoomId,
          sender_id: profile.uid,
          sender_name: profile.name || 'Utilizador',
          content: messageContent,
          type: 'text'
        }]);

      if (error) throw error;

      // Update last message in room
      await supabase
        .from('chat_rooms')
        .update({ 
          last_message: newMessage,
          last_message_at: new Date().toISOString()
        })
        .eq('id', activeRoomId);

      setNewMessage('');
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  const activeRoom = useMemo(() => rooms.find(r => r.id === activeRoomId), [rooms, activeRoomId]);
  
  const filteredRooms = useMemo(() => {
    return rooms.filter(r => r.name.toLowerCase().includes(searchTerm.toLowerCase()));
  }, [rooms, searchTerm]);

  const startCall = (type: 'voice' | 'video') => {
    setCallType(type);
    setIsCallActive(true);
  };

  return (
    <div className="flex h-screen bg-background text-white overflow-hidden">
      <Sidebar />
      <main className="flex-1 lg:ml-64 flex flex-col h-full relative">
        <TopBar title="Mensagens" />
        
        <div className="flex flex-1 pt-16 h-full overflow-hidden">
          {/* Chat Sidebar */}
          <div className={`w-full lg:w-80 border-r border-outline-variant/10 flex flex-col bg-surface-container-low/50 backdrop-blur-xl ${activeRoomId ? 'hidden lg:flex' : 'flex'}`}>
            <div className="p-6 space-y-4">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-black tracking-tight">Chats</h2>
                <button className="p-2 bg-primary/10 text-primary rounded-xl hover:bg-primary/20 transition-all">
                  <Plus className="w-5 h-5" />
                </button>
              </div>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-on-surface-variant" />
                <input 
                  type="text" 
                  placeholder="Pesquisar conversas..." 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-background/50 border border-outline-variant/10 rounded-xl py-2.5 pl-10 pr-4 text-sm outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto px-3 space-y-1">
              {/* AI Curator Room */}
              <div 
                onClick={() => {
                  setActiveRoomId('ai-curator');
                  setMessages([]); // Clear or load local history
                }}
                className={`w-full p-4 flex items-center gap-4 cursor-pointer transition-all border-l-4 ${
                  activeRoomId === 'ai-curator' 
                    ? 'bg-primary/10 border-primary' 
                    : 'border-transparent hover:bg-surface-container-high'
                }`}
              >
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center shadow-lg">
                  <Sparkles className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1 text-left">
                  <p className="font-bold text-white">Curador Digital (IA)</p>
                  <p className="text-xs text-primary font-bold">Sempre Online</p>
                </div>
              </div>

              {filteredRooms.map((room) => (
                <button 
                  key={room.id}
                  onClick={() => setActiveRoomId(room.id)}
                  className={`w-full p-4 rounded-2xl flex items-center gap-4 transition-all group ${
                    activeRoomId === room.id ? 'bg-primary text-on-primary-fixed shadow-lg shadow-primary/20' : 'hover:bg-surface-container-high'
                  }`}
                >
                  <div className="relative flex-shrink-0">
                    <div className="w-12 h-12 rounded-2xl overflow-hidden ring-2 ring-white/10">
                      <Image 
                        src={room.avatar || `https://picsum.photos/seed/${room.id}/100/100`} 
                        alt={room.name} 
                        fill 
                        className="object-cover"
                        referrerPolicy="no-referrer"
                      />
                    </div>
                    {room.type === 'direct' && (
                      <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-secondary border-2 border-background rounded-full" />
                    )}
                  </div>
                  <div className="flex-1 text-left min-w-0">
                    <div className="flex justify-between items-center mb-0.5">
                      <h4 className="font-bold truncate text-sm">{room.name}</h4>
                      <span className={`text-[10px] ${activeRoomId === room.id ? 'text-on-primary-fixed/60' : 'text-on-surface-variant'}`}>
                        12:45
                      </span>
                    </div>
                    <p className={`text-xs truncate ${activeRoomId === room.id ? 'text-on-primary-fixed/80' : 'text-on-surface-variant'}`}>
                      {room.lastMessage}
                    </p>
                  </div>
                </button>
              ))}

              <div className="pt-4 pb-2 px-3">
                <span className="text-[10px] font-black text-on-surface-variant uppercase tracking-widest">Alunos Online</span>
              </div>
              {students.slice(0, 5).map((student) => (
                <button 
                  key={student.id}
                  onClick={() => {
                    const roomId = `direct-${student.id}`;
                    if (!rooms.find(r => r.id === roomId)) {
                      setRooms([...rooms, { id: roomId, name: student.name, type: 'direct', participants: [profile?.uid || '', student.id], avatar: student.avatar, lastMessage: 'Diz olá!' }]);
                    }
                    setActiveRoomId(roomId);
                  }}
                  className="w-full p-4 rounded-2xl flex items-center gap-4 hover:bg-surface-container-high transition-all"
                >
                  <div className="relative flex-shrink-0">
                    <div className="w-10 h-10 rounded-2xl overflow-hidden">
                      <Image src={student.avatar} alt={student.name} fill className="object-cover" referrerPolicy="no-referrer" />
                    </div>
                    <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-secondary border-2 border-background rounded-full" />
                  </div>
                  <div className="flex-1 text-left">
                    <h4 className="font-bold text-sm text-white">{student.name}</h4>
                    <span className="text-[10px] text-secondary font-bold">Online</span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Chat Main Area */}
          <div className={`flex-1 flex flex-col h-full bg-background/30 backdrop-blur-sm ${!activeRoomId ? 'hidden lg:flex' : 'flex'}`}>
            {activeRoomId ? (
              <>
                {/* Chat Header */}
                <div className="px-6 py-4 border-b border-outline-variant/10 flex items-center justify-between bg-surface-container-low/30">
                  <div className="flex items-center gap-4">
                    <button onClick={() => setActiveRoomId(null)} className="lg:hidden p-2 hover:bg-surface-container-high rounded-xl">
                      <ChevronLeft className="w-5 h-5" />
                    </button>
                    <div className="relative w-10 h-10 rounded-2xl overflow-hidden">
                      <Image 
                        src={activeRoom?.avatar || `https://picsum.photos/seed/${activeRoomId}/100/100`} 
                        alt={activeRoom?.name || ''} 
                        fill 
                        className="object-cover"
                        referrerPolicy="no-referrer"
                      />
                    </div>
                    <div>
                      <h3 className="font-bold text-white">{activeRoom?.name}</h3>
                      <div className="flex items-center gap-1.5">
                        <Circle className="w-2 h-2 fill-secondary text-secondary" />
                        <span className="text-[10px] text-secondary font-bold uppercase tracking-wider">Ativo agora</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button onClick={() => startCall('voice')} className="p-2.5 hover:bg-surface-container-high rounded-xl text-on-surface-variant hover:text-white transition-all">
                      <Phone className="w-5 h-5" />
                    </button>
                    <button onClick={() => startCall('video')} className="p-2.5 hover:bg-surface-container-high rounded-xl text-on-surface-variant hover:text-white transition-all">
                      <Video className="w-5 h-5" />
                    </button>
                    <button className="p-2.5 hover:bg-surface-container-high rounded-xl text-on-surface-variant hover:text-white transition-all">
                      <MoreVertical className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                {/* Messages Area */}
                <div className="flex-1 overflow-y-auto p-6 space-y-4">
                  {messages.map((msg, i) => {
                    const isMe = msg.senderId === profile?.uid;
                    return (
                      <motion.div 
                        key={msg.id}
                        initial={{ opacity: 0, x: isMe ? 20 : -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}
                      >
                        <div className={`max-w-[70%] space-y-1`}>
                          {!isMe && (activeRoom?.type === 'group' || msg.senderId === 'ai-bot') && (
                            <span className="text-[10px] font-bold text-on-surface-variant ml-2">{msg.senderName}</span>
                          )}
                          <div className={`px-4 py-3 rounded-2xl text-sm ${
                            isMe 
                              ? 'bg-primary text-on-primary-fixed rounded-tr-none shadow-lg shadow-primary/10' 
                              : 'bg-surface-container-high text-white rounded-tl-none'
                          }`}>
                            {msg.content}
                          </div>
                          <p className={`text-[10px] text-on-surface-variant ${isMe ? 'text-right' : 'text-left'}`}>
                            {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </p>
                        </div>
                      </motion.div>
                    );
                  })}
                  {isAiLoading && (
                    <div className="flex justify-start">
                      <div className="bg-surface-container-high px-4 py-3 rounded-2xl rounded-tl-none flex items-center gap-2">
                        <Loader2 className="w-4 h-4 animate-spin text-primary" />
                        <span className="text-xs text-white">O Curador está a pensar...</span>
                      </div>
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </div>

                {/* Input Area */}
                <div className="p-6 bg-surface-container-low/30 border-t border-outline-variant/10">
                  <form onSubmit={handleSendMessage} className="flex items-center gap-3">
                    <button type="button" className="p-2.5 hover:bg-surface-container-high rounded-xl text-on-surface-variant hover:text-white transition-all">
                      <Paperclip className="w-5 h-5" />
                    </button>
                    <div className="flex-1 relative">
                      <input 
                        type="text" 
                        placeholder="Escreva uma mensagem..." 
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        className="w-full bg-background/50 border border-outline-variant/10 rounded-2xl py-3.5 pl-5 pr-12 text-sm text-white outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                      />
                      <button type="button" className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 text-on-surface-variant hover:text-white transition-colors">
                        <Smile className="w-5 h-5" />
                      </button>
                    </div>
                    <button 
                      type="submit"
                      disabled={!newMessage.trim()}
                      className="p-3.5 bg-primary text-on-primary-fixed rounded-2xl shadow-lg shadow-primary/20 hover:scale-105 active:scale-95 transition-all disabled:opacity-50 disabled:scale-100"
                    >
                      <Send className="w-5 h-5" />
                    </button>
                    <button type="button" className="p-3.5 bg-surface-container-high text-white rounded-2xl hover:bg-surface-container-highest transition-all">
                      <Mic className="w-5 h-5" />
                    </button>
                  </form>
                </div>
              </>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center p-12 text-center">
                <div className="w-24 h-24 bg-primary/10 rounded-[2.5rem] flex items-center justify-center mb-6">
                  <Users className="w-10 h-10 text-primary" />
                </div>
                <h3 className="text-2xl font-black text-white mb-2">As Suas Mensagens</h3>
                <p className="text-on-surface-variant max-w-xs">Selecione uma conversa para começar a trocar mensagens com a comunidade escolar.</p>
              </div>
            )}
          </div>
        </div>

        {/* Call Overlay */}
        <AnimatePresence>
          {isCallActive && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[200] bg-black flex flex-col items-center justify-center p-8"
            >
              <div className="absolute top-8 left-8 flex items-center gap-3">
                <div className="w-10 h-10 bg-primary/20 rounded-xl flex items-center justify-center">
                  <Users className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h4 className="font-bold text-white">Elo Escolar Connect</h4>
                  <p className="text-xs text-secondary font-bold uppercase tracking-widest">Chamada Encriptada</p>
                </div>
              </div>

              <div className="relative w-full max-w-4xl aspect-video bg-surface-container-low rounded-[3rem] overflow-hidden border border-outline-variant/10 shadow-2xl">
                {callType === 'video' ? (
                  <div className="w-full h-full relative">
                    <Image 
                      src={activeRoom?.avatar || 'https://picsum.photos/seed/call/800/600'} 
                      alt="Call" 
                      fill 
                      className="object-cover blur-xl opacity-50"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <div className="relative w-32 h-32 rounded-[2.5rem] overflow-hidden border-4 border-primary shadow-2xl mb-6">
                        <Image 
                          src={activeRoom?.avatar || 'https://picsum.photos/seed/call/200/200'} 
                          alt="Avatar" 
                          fill 
                          className="object-cover"
                          referrerPolicy="no-referrer"
                        />
                      </div>
                      <h2 className="text-3xl font-black text-white mb-2">{activeRoom?.name}</h2>
                      <p className="text-secondary font-bold animate-pulse">A CONECTAR...</p>
                    </div>
                    {/* Self View */}
                    <div className="absolute bottom-8 right-8 w-48 aspect-video bg-black rounded-3xl border-2 border-white/10 overflow-hidden shadow-2xl">
                      <div className="w-full h-full flex items-center justify-center bg-surface-container-high">
                        <User className="w-8 h-8 text-on-surface-variant" />
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center">
                    <div className="relative w-40 h-40 rounded-full overflow-hidden border-4 border-primary/20 mb-8 p-2">
                       <div className="w-full h-full rounded-full overflow-hidden relative">
                        <Image 
                          src={activeRoom?.avatar || 'https://picsum.photos/seed/call/200/200'} 
                          alt="Avatar" 
                          fill 
                          className="object-cover"
                          referrerPolicy="no-referrer"
                        />
                       </div>
                       <div className="absolute inset-0 rounded-full border-4 border-primary animate-ping opacity-20" />
                    </div>
                    <h2 className="text-3xl font-black text-white mb-2">{activeRoom?.name}</h2>
                    <p className="text-on-surface-variant font-bold">00:00</p>
                  </div>
                )}
              </div>

              <div className="mt-12 flex items-center gap-6">
                <button className="p-5 bg-surface-container-high text-white rounded-full hover:bg-surface-container-highest transition-all">
                  <Mic className="w-6 h-6" />
                </button>
                <button className="p-5 bg-surface-container-high text-white rounded-full hover:bg-surface-container-highest transition-all">
                  <Camera className="w-6 h-6" />
                </button>
                <button 
                  onClick={() => setIsCallActive(false)}
                  className="p-6 bg-error text-white rounded-[2rem] hover:scale-110 transition-all shadow-xl shadow-error/20"
                >
                  <X className="w-8 h-8" />
                </button>
                <button className="p-5 bg-surface-container-high text-white rounded-full hover:bg-surface-container-highest transition-all">
                  <Users className="w-6 h-6" />
                </button>
                <button className="p-5 bg-surface-container-high text-white rounded-full hover:bg-surface-container-highest transition-all">
                  <Settings className="w-6 h-6" />
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
};

export default ChatPage;
