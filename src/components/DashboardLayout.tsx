"use client";

import React, { useState } from 'react';
import { 
  LayoutGrid, 
  Users, 
  FileText, 
  ClipboardList, 
  Clock, 
  Settings, 
  Menu,
  Bell,
  Sparkles,
  ChevronLeft,
  HelpCircle,
  ChevronDown,
  Sidebar
} from 'lucide-react';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const isResults = pathname === '/results';
  const isProcessing = pathname === '/processing';

  // Determine if sidebar should be collapsed
  const isCollapsed = isResults || isProcessing;

  const navItems = [
    { icon: LayoutGrid, label: 'Home', href: '#' },
    { icon: Users, label: 'My Classroom', href: '#' },
    { icon: FileText, label: 'Assignments', href: '#' },
    { icon: ClipboardList, label: 'Exams', href: '/', active: true },
    { icon: Clock, label: 'My Library', href: '#' },
  ];

  return (
    <div className="flex h-screen bg-[#F8F9FA] overflow-hidden text-slate-900 font-sans">
      
      {/* Desktop Sidebar */}
      <aside className={cn(
        "hidden md:flex flex-col bg-white border-r border-slate-200 transition-all duration-300 relative",
        isCollapsed ? "w-[80px] items-center" : "w-[260px]"
      )}>
        <div className="p-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-[#1C1C1C] rounded-md flex items-center justify-center text-white font-bold text-xl">
              V
            </div>
            {!isCollapsed && <span className="font-bold text-xl tracking-tight text-slate-900">VedaAI</span>}
          </div>
          {!isCollapsed && <Sidebar className="w-5 h-5 text-slate-400 cursor-pointer" />}
        </div>

        {!isCollapsed && (
          <div className="px-6 mb-8">
            <button className="w-full bg-[#1C1C1C] text-white flex items-center justify-center gap-2 py-3 rounded-full hover:bg-black transition shadow-sm">
              <Sparkles className="w-4 h-4 text-orange-400" />
              <span className="font-medium text-sm">AI Teacher's Toolkit</span>
            </button>
          </div>
        )}

        <nav className="flex-1 px-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const isClickable = item.href !== '#';
            return (
              <a 
                key={item.label}
                href={item.href}
                onClick={(e) => !isClickable && e.preventDefault()}
                title={!isClickable ? "Not implemented in this demo" : undefined}
                className={cn(
                  "flex items-center gap-3 px-4 py-3 rounded-xl transition-colors",
                  item.active 
                    ? "bg-slate-100 font-semibold text-slate-900" 
                    : "text-slate-500 hover:bg-slate-50 hover:text-slate-900",
                  !isClickable && "opacity-50 cursor-not-allowed hover:bg-transparent",
                  isClickable && !item.active && "cursor-pointer active:scale-95",
                  isCollapsed && "justify-center px-0"
                )}
              >
                <item.icon className={cn("w-5 h-5 flex-shrink-0", item.active ? "text-slate-900" : "")} />
                {!isCollapsed && <span>{item.label}</span>}
              </a>
            );
          })}
        </nav>

        <div className="p-4 mt-auto">
          <a 
            href="#" 
            onClick={(e) => e.preventDefault()}
            title="Not implemented in this demo"
            className={cn(
              "flex items-center gap-3 px-4 py-3 text-slate-500 rounded-xl transition-colors mb-4 opacity-50 cursor-not-allowed",
              isCollapsed && "justify-center px-0"
            )}
          >
            <Settings className="w-5 h-5 flex-shrink-0" />
            {!isCollapsed && <span>Settings</span>}
          </a>
          
          {!isCollapsed ? (
            <div className="flex items-center gap-3 p-3 bg-slate-100/50 rounded-xl">
              <div className="w-10 h-10 rounded-full bg-[#1C1C1C] flex items-center justify-center text-white font-semibold">
                N
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-900">Delhi Public School</p>
                <p className="text-xs text-slate-500">Bokaro Steel City</p>
              </div>
            </div>
          ) : (
            <div className="w-10 h-10 mx-auto rounded-full bg-[#1C1C1C] flex items-center justify-center text-white font-semibold">
              N
            </div>
          )}
        </div>
      </aside>

      {/* Mobile Topbar */}
      <div className="md:hidden flex items-center justify-between p-4 bg-white border-b absolute top-0 left-0 right-0 z-50">
        <div className="flex items-center gap-3">
          <ChevronLeft className="w-5 h-5 opacity-50 cursor-not-allowed" />
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-black rounded flex items-center justify-center text-white font-bold text-xs">V</div>
            <span className="font-bold">VedaAI</span>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="relative opacity-50 cursor-not-allowed">
            <Bell className="w-5 h-5 text-slate-600" />
            <div className="absolute top-0 right-0 w-2 h-2 bg-orange-500 rounded-full border border-white"></div>
          </div>
          <div className="w-7 h-7 bg-slate-200 rounded-full overflow-hidden opacity-50 cursor-not-allowed">
            <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Felix" alt="Avatar" />
          </div>
          <Menu className="w-6 h-6 text-slate-600 opacity-50 cursor-not-allowed" />
        </div>
      </div>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col h-full overflow-hidden relative pt-16 md:pt-0">
        
        {/* Desktop Top Header (only on non-collapsed pages) */}
        {!isCollapsed && (
          <header className="hidden md:flex h-16 items-center justify-between px-8 bg-transparent absolute top-0 left-0 right-0 z-10">
            <div className="flex items-center gap-2 text-slate-500 font-medium text-sm">
              <ChevronLeft className="w-5 h-5 cursor-pointer hover:text-slate-900" />
              <ClipboardList className="w-4 h-4 ml-2" />
              <span>Exams</span>
            </div>
            
            <div className="flex items-center gap-5">
              <HelpCircle className="w-5 h-5 text-slate-600 opacity-50 cursor-not-allowed" title="Not implemented in this demo" />
              <div className="relative opacity-50 cursor-not-allowed" title="Not implemented in this demo">
                <Bell className="w-5 h-5 text-slate-600" />
                <div className="absolute 0 right-0 w-2 h-2 bg-orange-500 rounded-full border border-white"></div>
              </div>
              <Sparkles className="w-5 h-5 text-slate-600 opacity-50 cursor-not-allowed" title="Not implemented in this demo" />
              <div className="flex items-center gap-2 p-1 rounded-lg opacity-50 cursor-not-allowed" title="Not implemented in this demo">
                <div className="w-8 h-8 bg-slate-200 rounded-full overflow-hidden">
                  <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Jane&backgroundColor=transparent" alt="Madhur" />
                </div>
                <span className="font-medium text-sm">Madhur Rastogi</span>
                <ChevronDown className="w-4 h-4 text-slate-500" />
              </div>
            </div>
          </header>
        )}

        <div className="flex-1 overflow-auto h-full w-full">
          {children}
        </div>
      </main>
    </div>
  );
}
