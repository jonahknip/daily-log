
import React from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { 
  LayoutDashboard, 
  ClipboardPen, 
  FileText, 
  Menu, 
  X, 
  HardHat 
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { AppConfig } from "@/components/AppConfig";

export default function Layout({ children, currentPageName }) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);

  const navItems = [
    { name: 'Dashboard', icon: LayoutDashboard, path: 'Dashboard' },
    { name: 'New Entry', icon: ClipboardPen, path: 'LogEntry' },
    { name: 'Reports', icon: FileText, path: 'Reports' },
  ];

  return (
    <div className="min-h-screen bg-slate-50 font-sans" style={{ color: AppConfig.branding.primaryColor }}>
      <style>{`
        :root {
          --primary-color: ${AppConfig.branding.primaryColor};
          --accent-color: ${AppConfig.branding.accentColor};
        }
      `}</style>
      {AppConfig.demoMode.enabled && (
        <div className="bg-amber-500 text-black text-center text-xs font-bold py-1">
          DEMO MODE ACTIVE - DATA IS MOCKED
        </div>
      )}
      {/* Top Navigation Bar */}
      <header 
        className="sticky top-0 z-50 text-white shadow-md border-b"
        style={{ 
          backgroundColor: AppConfig.branding.primaryColor,
          borderColor: AppConfig.branding.accentColor 
        }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="bg-white/10 p-2 rounded-lg">
                <HardHat className="w-6 h-6 text-white" />
              </div>
              <div className="flex flex-col justify-center">
                <span className="font-bold text-xl tracking-wider text-white uppercase">
                  {AppConfig.branding.appName}
                </span>
                <div className="flex items-center gap-1.5">
                  <span className="h-[1px] w-3" style={{ backgroundColor: AppConfig.branding.accentColor }}></span>
                  <span className="text-[9px] text-slate-200 tracking-[0.2em] uppercase font-light">
                    {AppConfig.branding.companyName}
                  </span>
                </div>
              </div>
            </div>

            {/* Desktop Nav */}
            <nav className="hidden md:flex items-center space-x-1">
              {navItems.map((item) => {
                const isActive = currentPageName === item.path;
                return (
                  <Link key={item.name} to={createPageUrl(item.path)}>
                    <Button
                      variant="ghost"
                      style={isActive ? { backgroundColor: AppConfig.branding.accentColor } : {}}
                      className={`flex items-center gap-2 ${
                        isActive 
                          ? "text-white" 
                          : "text-slate-300 hover:text-white hover:bg-white/10"
                      }`}
                    >
                      <item.icon className="w-4 h-4" />
                      {item.name}
                    </Button>
                  </Link>
                );
              })}
              </nav>

              {/* Mobile Menu Button */}
              <div className="flex items-center md:hidden">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="text-white hover:bg-white/10"
              >
                {isMobileMenuOpen ? (
                  <X className="w-6 h-6" />
                ) : (
                  <Menu className="w-6 h-6" />
                )}
              </Button>
              </div>
          </div>
        </div>

        {/* Mobile Nav */}
        {isMobileMenuOpen && (
          <div className="md:hidden bg-white border-b border-slate-200 px-4 pt-2 pb-4 space-y-1 shadow-lg">
            {navItems.map((item) => (
              <Link 
                key={item.name} 
                to={createPageUrl(item.path)}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <Button
                  variant="ghost"
                  className="w-full justify-start gap-3 mb-1"
                >
                  <item.icon className="w-4 h-4" />
                  {item.name}
                </Button>
              </Link>
            ))}
          </div>
        )}
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-6 mt-12">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="text-slate-500 text-sm">
            © {new Date().getFullYear()} {AppConfig.branding.appName} — Powered by {AppConfig.branding.companyName}
          </p>
        </div>
      </footer>
      </div>
      );
      }
