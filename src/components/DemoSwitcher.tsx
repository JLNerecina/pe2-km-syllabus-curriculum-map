import { useState } from 'react';
import { supabase, resetLocalSandbox } from '../lib/supabase';
import { useAuth } from '../hooks/useAuth';

export const DemoSwitcher = () => {
  const { user, profile } = useAuth();
  const [isExpanded, setIsExpanded] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Only render if the current user is a demo user
  const isDemoUser = user?.email?.endsWith('@demo.com');
  if (!isDemoUser) return null;

  const currentRole = profile?.role || 'student';

  const demoRoles = [
    { role: 'student', icon: 'school', color: 'text-blue-400 bg-blue-500/10 border-blue-500/30' },
    { role: 'faculty', icon: 'co_present', color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30' },
    { role: 'admin', icon: 'admin_panel_settings', color: 'text-amber-400 bg-amber-500/10 border-amber-500/30' },
    { role: 'superadmin', icon: 'shield_person', color: 'text-purple-400 bg-purple-500/10 border-purple-500/30' }
  ];

  const handleSwapRole = async (targetRole: string) => {
    if (targetRole === currentRole || isLoading) return;
    try {
      setIsLoading(true);
      await supabase.auth.signOut();
      
      const email = `${targetRole}@demo.com`;
      const password = 'demoPassword123';
      await supabase.auth.signInWithPassword({ email, password });
      setIsExpanded(false);
    } catch (error) {
      console.error('Failed to swap demo role:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetSandbox = () => {
    try {
      setIsLoading(true);
      resetLocalSandbox();
      window.location.reload();
    } catch (error) {
      console.error('Failed to reset sandbox:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleExitDemo = async () => {
    try {
      setIsLoading(true);
      await supabase.auth.signOut();
    } catch (error) {
      console.error('Failed to exit demo mode:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-[100] flex flex-col items-end gap-2">
      {/* Expanded Menu */}
      {isExpanded && (
        <div className="bg-surface-container-high/90 backdrop-blur-xl border border-outline-variant/50 rounded-2xl p-3 shadow-2xl animate-in slide-in-from-bottom-4 fade-in duration-200 min-w-[200px]">
          <div className="text-xs font-label-md text-on-surface-variant uppercase tracking-wider mb-2 px-2">
            Switch Demo Role
          </div>
          <div className="flex flex-col gap-1">
            {demoRoles.map((demo) => {
              const isActive = currentRole === demo.role;
              return (
                <button
                  key={demo.role}
                  onClick={() => handleSwapRole(demo.role)}
                  disabled={isLoading || isActive}
                  className={`flex items-center gap-3 px-3 py-2 rounded-xl transition-colors text-sm font-label-md w-full
                    ${isActive 
                      ? 'bg-primary/20 text-primary cursor-default' 
                      : 'hover:bg-surface-variant text-on-surface hover:text-on-surface-strong'
                    }
                  `}
                >
                  <span className={`material-symbols-outlined text-xl ${isActive ? '' : demo.color.split(' ')[0]}`}>
                    {demo.icon}
                  </span>
                  <span className="capitalize">{demo.role}</span>
                  {isActive && <span className="material-symbols-outlined text-base ml-auto">check_circle</span>}
                  {isLoading && !isActive && <div className="ml-auto w-4 h-4 border-2 border-outline border-t-primary rounded-full animate-spin"></div>}
                </button>
              );
            })}
          </div>

          <div className="h-px bg-outline-variant/30 my-2"></div>
          
          <button
            onClick={handleResetSandbox}
            disabled={isLoading}
            className="flex items-center gap-3 px-3 py-2 rounded-xl text-amber-400 hover:bg-amber-500/10 transition-colors text-sm font-label-md w-full mb-1"
          >
            <span className="material-symbols-outlined text-xl">restart_alt</span>
            Reset Sandbox
          </button>

          <button
            onClick={handleExitDemo}
            disabled={isLoading}
            className="flex items-center gap-3 px-3 py-2 rounded-xl text-error hover:bg-error/10 transition-colors text-sm font-label-md w-full"
          >
            <span className="material-symbols-outlined text-xl">logout</span>
            Exit Demo Mode
          </button>
        </div>
      )}

      {/* Floating Toggle Button */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="h-14 bg-gradient-to-br from-slate-950 via-blue-950 to-indigo-900 text-white rounded-full border border-blue-500/30 shadow-[0_0_20px_rgba(59,130,246,0.4)] hover:shadow-[0_0_30px_rgba(59,130,246,0.6)] hover:border-blue-400/50 transition-all duration-300 flex items-center justify-center px-4 gap-2 hover:-translate-y-1 active:translate-y-0 group"
      >
        <span className="material-symbols-outlined animate-pulse">
          rocket_launch
        </span>
        <span className="font-label-md uppercase tracking-wider max-w-0 overflow-hidden group-hover:max-w-xs transition-all duration-300 whitespace-nowrap">
          Demo Mode
        </span>
        {!isExpanded ? (
          <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center ml-1">
            <span className="material-symbols-outlined text-base">expand_less</span>
          </div>
        ) : (
          <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center ml-1">
            <span className="material-symbols-outlined text-base">expand_more</span>
          </div>
        )}
      </button>
    </div>
  );
};
