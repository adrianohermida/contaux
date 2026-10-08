import React, { useEffect, useState } from 'react';
import { Menu, X, LogOut, User } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { base44 } from '@/api/base44Client';
import { useTheme } from './hooks/useTheme';
import Logo from './Logo';

export default function Header() {
  const { theme } = useTheme();
  const [menuOpen, setMenuOpen] = React.useState(false);
  const [user, setUser] = useState(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [mobileDropdownOpen, setMobileDropdownOpen] = useState(false);

  useEffect(() => {
    const getUser = async () => {
      try {
        const isAuth = await base44.auth.isAuthenticated();
        if (isAuth) {
          const currentUser = await base44.auth.me();
          setUser(currentUser);
        } else {
          setUser(null);
        }
      } catch {
        setUser(null);
      }
    };
    getUser();
  }, []);

  const handleLogout = async () => {
    await base44.auth.logout();
  };

  const closeMobileMenu = () => {
    setMenuOpen(false);
    setMobileDropdownOpen(false);
  };

  return (
    <header className="bg-[var(--color-background-primary)] border-b border-[var(--color-border-default)] shadow-sm sticky top-0 z-50 transition-colors"
    style={{ paddingTop: 'max(env(safe-area-inset-top), 12px)', paddingLeft: 'env(safe-area-inset-left)', paddingRight: 'env(safe-area-inset-right)' }}>
      <div className="max-w-7xl mx-auto px-[var(--spacing-md)] sm:px-[var(--spacing-lg)]">
        <nav className="flex items-center justify-between py-[var(--spacing-sm)] sm:py-[var(--spacing-md)]">
          {/* Logo */}
          <Logo />

          {/* Desktop Menu */}
          <ul className="hidden md:flex items-center gap-[var(--spacing-lg)] lg:gap-[var(--spacing-xl)]" role="navigation" aria-label="Menu principal">
            <li><Link to={createPageUrl('About')} className="text-[var(--font-size-sm)] lg:text-base text-[var(--color-foreground-primary)] hover:text-[var(--color-interactive-hover)] transition-colors duration-200">Sobre</Link></li>
            <li><a href="#servicos" className="text-[var(--font-size-sm)] lg:text-base text-[var(--color-foreground-primary)] hover:text-[var(--color-interactive-hover)] transition-colors duration-200">Serviços</a></li>
            <li><Link to={createPageUrl('Blog')} className="text-[var(--font-size-sm)] lg:text-base text-[var(--color-foreground-primary)] hover:text-[var(--color-interactive-hover)] transition-colors duration-200">Blog</Link></li>
            <li><Link to={createPageUrl('Contact')} className="text-[var(--font-size-sm)] lg:text-base text-[var(--color-foreground-primary)] hover:text-[var(--color-interactive-hover)] transition-colors duration-200">Contato</Link></li>
          </ul>

          {/* Desktop Auth Section */}
          <div className="hidden md:flex items-center gap-[var(--spacing-md)]">
            {user ? (
              <div className="relative">
                    <button
                      onClick={() => setDropdownOpen(!dropdownOpen)}
                      aria-haspopup="menu"
                      aria-expanded={dropdownOpen}
                      aria-label={`Menu do usuário: ${user.full_name || user.email}`}
                      className="flex items-center gap-[var(--spacing-sm)] px-[var(--spacing-sm)] lg:px-[var(--spacing-md)] py-[var(--spacing-xs)] rounded-lg transition-colors text-[var(--font-size-sm)] lg:text-[var(--font-size-base)] min-h-[44px] text-[var(--color-foreground-primary)] hover:bg-[var(--color-background-secondary)]"
                    >
                  <User className="w-4 h-4" />
                  <span className="hidden lg:inline">{user.full_name || user.email}</span>
                </button>
                {dropdownOpen && (
                   <div className="absolute right-0 mt-[var(--spacing-sm)] w-48 rounded-lg shadow-lg z-10 bg-[var(--color-background-secondary)] border border-[var(--color-border-default)]"
                   role="menu"
                   onKeyDown={(e) => {
                     if (e.key === 'Escape') setDropdownOpen(false);
                   }}>
                     <Link
                       to={createPageUrl('Dashboard')}
                       className="block w-full text-left px-[var(--spacing-md)] py-[var(--spacing-sm)] text-[var(--font-size-sm)] flex items-center gap-[var(--spacing-sm)] transition-colors text-[var(--color-foreground-primary)] hover:bg-[var(--color-background-tertiary)]"
                       onClick={closeMobileMenu}
                     >
                       <User className="w-4 h-4" />
                       Dashboard
                     </Link>
                     <Link
                       to={createPageUrl('SettingsPage')}
                       className="block w-full text-left px-[var(--spacing-md)] py-[var(--spacing-sm)] text-[var(--font-size-sm)] flex items-center gap-[var(--spacing-sm)] transition-colors text-[var(--color-foreground-primary)] hover:bg-[var(--color-background-tertiary)]"
                       onClick={() => setDropdownOpen(false)}
                     >
                       <User className="w-4 h-4" />
                       Meu Perfil
                     </Link>
                     <hr className="my-[var(--spacing-sm)] border-[var(--color-border-default)]" />
                     <button
                       onClick={() => { handleLogout(); setDropdownOpen(false); }}
                       className="w-full text-left px-[var(--spacing-md)] py-[var(--spacing-sm)] text-[var(--font-size-sm)] flex items-center gap-[var(--spacing-sm)] transition-colors text-[var(--color-error)] hover:bg-[var(--color-background-tertiary)]"
                     >
                       <LogOut className="w-4 h-4" />
                       Sair
                     </button>
                   </div>
                )}
              </div>
            ) : (
              <button 
                onClick={() => base44.auth.redirectToLogin(window.location.origin + createPageUrl('Dashboard'))}
                className="px-[var(--spacing-md)] lg:px-[var(--spacing-lg)] py-[var(--spacing-sm)] bg-[var(--color-interactive-default)] text-white rounded-lg hover:bg-[var(--color-interactive-hover)] transition-colors text-[var(--font-size-sm)] lg:text-[var(--font-size-base)]"
              >
                Login
              </button>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button 
            onClick={() => setMenuOpen(!menuOpen)} 
            aria-label={menuOpen ? 'Fechar menu' : 'Abrir menu'}
            aria-expanded={menuOpen}
            className="md:hidden p-[var(--spacing-sm)] -mr-[var(--spacing-sm)] min-h-[44px] min-w-[44px]"
          >
            {menuOpen ? <X size={24} className="text-[var(--color-foreground-primary)]" /> : <Menu size={24} className="text-[var(--color-foreground-primary)]" />}
          </button>
        </nav>

        {/* Mobile Menu - Fullscreen Overlay */}
        {menuOpen && (
          <>
            {/* Backdrop */}
            <div className="fixed inset-0 bg-black/20 z-40 md:hidden" onClick={closeMobileMenu} />

            {/* Mobile Menu */}
            <div className="fixed left-0 right-0 top-16 bottom-0 overflow-y-auto z-40 md:hidden transition-colors bg-[var(--color-background-primary)]">
             <div className="px-[var(--spacing-md)] py-[var(--spacing-md)]">
                {/* Navigation Links */}
                  <ul className="space-y-[var(--spacing-xs)] mb-[var(--spacing-lg)]" role="navigation" aria-label="Menu principal mobile">
                      <li><Link to={createPageUrl('About')} className="block px-[var(--spacing-sm)] py-[var(--spacing-sm)] text-[var(--font-size-base)] rounded transition-colors min-h-[44px] flex items-center text-[var(--color-foreground-primary)] hover:bg-[var(--color-background-secondary)]" onClick={closeMobileMenu}>Sobre</Link></li>
                      <li><a href="#servicos" className="block px-[var(--spacing-sm)] py-[var(--spacing-sm)] text-[var(--font-size-base)] rounded transition-colors min-h-[44px] flex items-center text-[var(--color-foreground-primary)] hover:bg-[var(--color-background-secondary)]" onClick={closeMobileMenu}>Serviços</a></li>
                      <li><Link to={createPageUrl('Blog')} className="block px-[var(--spacing-sm)] py-[var(--spacing-sm)] text-[var(--font-size-base)] rounded transition-colors min-h-[44px] flex items-center text-[var(--color-foreground-primary)] hover:bg-[var(--color-background-secondary)]" onClick={closeMobileMenu}>Blog</Link></li>
                      <li><Link to={createPageUrl('Contact')} className="block px-[var(--spacing-sm)] py-[var(--spacing-sm)] text-[var(--font-size-base)] rounded transition-colors min-h-[44px] flex items-center text-[var(--color-foreground-primary)] hover:bg-[var(--color-background-secondary)]" onClick={closeMobileMenu}>Contato</Link></li>
                    </ul>

                  {/* Auth Section */}
                  <div className="border-t border-[var(--color-border-default)] pt-4">
                  {user ? (
                    <div>
                      <button
                        onClick={() => setMobileDropdownOpen(!mobileDropdownOpen)}
                        className="w-full flex items-center justify-between px-[var(--spacing-sm)] py-[var(--spacing-sm)] rounded transition-colors text-[var(--color-foreground-primary)] hover:bg-[var(--color-background-secondary)]"
                      >
                        <span className="flex items-center gap-[var(--spacing-sm)]">
                        <User className="w-4 h-4" />
                        <span className="text-[var(--font-size-base)]">{user.full_name || user.email}</span>
                        </span>
                        <span className={`text-sm transition-transform ${mobileDropdownOpen ? 'rotate-180' : ''}`}>▼</span>
                      </button>
                      {mobileDropdownOpen && (
                        <div className="mt-[var(--spacing-sm)] space-y-[var(--spacing-xs)] rounded-lg p-[var(--spacing-sm)] ml-[var(--spacing-sm)] bg-[var(--color-background-secondary)]">
                          <Link
                            to={createPageUrl('Dashboard')}
                            className="block px-[var(--spacing-sm)] py-[var(--spacing-sm)] text-[var(--font-size-base)] rounded flex items-center gap-[var(--spacing-sm)] transition-colors text-[var(--color-foreground-primary)] hover:bg-[var(--color-background-tertiary)]"
                            onClick={closeMobileMenu}
                          >
                            <User className="w-4 h-4" />
                            Dashboard
                          </Link>
                          <Link
                            to={createPageUrl('SettingsPage')}
                            className="block px-[var(--spacing-sm)] py-[var(--spacing-sm)] text-[var(--font-size-base)] rounded flex items-center gap-[var(--spacing-sm)] transition-colors text-[var(--color-foreground-primary)] hover:bg-[var(--color-background-tertiary)]"
                            onClick={closeMobileMenu}
                          >
                            <User className="w-4 h-4" />
                            Meu Perfil
                          </Link>
                          <button
                            onClick={() => { handleLogout(); closeMobileMenu(); }}
                            className="w-full text-left px-[var(--spacing-sm)] py-[var(--spacing-sm)] text-[var(--font-size-base)] rounded flex items-center gap-[var(--spacing-sm)] transition-colors text-[var(--color-error)] hover:bg-[var(--color-background-tertiary)]"
                          >
                            <LogOut className="w-4 h-4" />
                            Sair
                          </button>
                        </div>
                      )}
                    </div>
                  ) : (
                    <button 
                     onClick={() => {
                       base44.auth.redirectToLogin(window.location.origin + createPageUrl('Dashboard'));
                       closeMobileMenu();
                     }}
                     className="w-full px-[var(--spacing-sm)] py-[var(--spacing-md)] bg-[var(--color-interactive-default)] text-white rounded-lg hover:bg-[var(--color-interactive-hover)] transition-colors flex items-center justify-center gap-[var(--spacing-sm)] text-[var(--font-size-base)] font-medium"
                    >
                      <User className="w-4 h-4" />
                      Login
                    </button>
                  )}
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </header>
  );
}