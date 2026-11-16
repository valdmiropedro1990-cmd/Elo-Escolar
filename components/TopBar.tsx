'use client';

import React from 'react';
import { Search, Bell, Settings, User } from 'lucide-react';
import Image from 'next/image';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';

const TopBar = ({ title }: { title?: string }) => {
  const { profile, isAdmin, isPrimaryAdmin, isSecondaryAdmin } = useAuth();

  const getRoleLabel = () => {
    if (isPrimaryAdmin) return 'Admin Primário';
    if (isSecondaryAdmin) return 'Admin Secundário';
    return 'Encarregado';
  };

  return (
    <header className="fixed top-0 right-0 w-full lg:w-[calc(100%-16rem)] h-16 bg-surface-container-low/70 flex justify-between items-center px-4 lg:px-8 z-40 border-b border-outline-variant/40 backdrop-blur-xl">
      <div className="flex items-center flex-1 max-w-xl ml-14 lg:ml-0">
        <div className="relative w-full group hidden md:block">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant w-4 h-4" />
          <input 
            className="w-full bg-background/50 border border-outline-variant/10 rounded-full py-1.5 pl-9 pr-4 text-sm focus:ring-1 focus:ring-secondary/40 transition-all placeholder:text-on-surface-variant/40" 
            placeholder="Pesquisar..." 
            type="text"
          />
        </div>
        <div className="sm:hidden flex items-center gap-2">
          <div className="relative w-8 h-8 rounded-lg overflow-hidden">
            <Image 
              src="/logo.png" 
              alt="Logo" 
              fill 
              className="object-contain"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.style.display = 'none';
              }}
            />
          </div>
          <h2 className="font-headline font-bold text-white text-sm truncate">{title || 'Elo Escolar'}</h2>
        </div>
      </div>

      <div className="flex items-center gap-2 lg:gap-4">
        <button className="p-2 rounded-full text-on-surface-variant hover:bg-surface-container-highest transition-colors relative group">
          <Bell className="w-5 h-5 group-hover:scale-110 transition-transform" />
          <span className="absolute top-2 right-2 w-2 h-2 bg-secondary rounded-full border-2 border-surface-container-low animate-pulse"></span>
        </button>
        <Link href="/settings" className="p-2 rounded-full text-on-surface-variant hover:bg-surface-container-highest transition-colors">
          <Settings className="w-5 h-5 hover:rotate-90 transition-transform duration-500" />
        </Link>
        <div className="h-8 w-px bg-outline-variant/20 mx-1 lg:mx-2"></div>
        <Link href="/profile" className="flex items-center gap-2 lg:gap-3 group">
          <div className="relative w-8 h-8 lg:w-10 lg:h-10 rounded-full overflow-hidden border-2 border-primary/20 group-hover:border-primary transition-colors cursor-pointer">
            <Image 
              src={profile?.photoURL || `https://ui-avatars.com/api/?name=${profile?.name || 'User'}&background=random`} 
              alt="User Avatar" 
              fill 
              className="object-cover"
              referrerPolicy="no-referrer"
            />
          </div>
          <div className="hidden sm:block">
            <p className="text-[10px] lg:text-sm font-bold text-white leading-none truncate max-w-[80px] lg:max-w-[120px] group-hover:text-primary transition-colors">
              {profile?.name || 'Utilizador'}
            </p>
            <p className="text-[8px] lg:text-[10px] text-on-surface-variant uppercase tracking-wider mt-1">
              {getRoleLabel()}
            </p>
          </div>
        </Link>
      </div>
    </header>
  );
};

export default TopBar;
