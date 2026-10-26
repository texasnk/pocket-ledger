import { useEffect, useMemo, useState, type KeyboardEvent, type ReactNode } from 'react';
import {
  BarChart3,
  ChevronDown,
  CircleDollarSign,
  Clock3,
  FolderTree,
  Languages,
  LayoutDashboard,
  Menu,
  Moon,
  Search,
  Sun,
  WalletCards
} from 'lucide-react';
import { NavLink, Navigate, Route, Routes, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { CatalogPage } from './features/catalog/catalog-page';
import { DashboardPage } from './features/dashboard/dashboard-page';
import { TransactionsPage } from './features/transactions/transactions-page';
import { HistoryPage } from './features/history/history-page';
import { ErrorModal } from './components/error-modal';
import { applicationErrorEvent, type ApplicationError } from './lib/error-notifier';
import { useTheme } from './hooks/use-theme';

const navigationGroups = [
  {
    key: 'navigationGroups.overview',
    icon: LayoutDashboard,
    links: [
      { to: '/', key: 'navigation.dashboard', icon: LayoutDashboard },
      { to: '/reports', key: 'navigation.reports', icon: BarChart3 }
    ]
  },
  {
    key: 'navigationGroups.finances',
    icon: CircleDollarSign,
    links: [
      { to: '/transactions', key: 'navigation.transactions', icon: CircleDollarSign },
      { to: '/budgets', key: 'navigation.budgets', icon: BarChart3 },
      { to: '/history', key: 'navigation.history', icon: Clock3 }
    ]
  },
  {
    key: 'navigationGroups.catalog',
    icon: FolderTree,
    links: [
      { to: '/accounts', key: 'navigation.accounts', icon: WalletCards },
      { to: '/categories', key: 'navigation.categories', icon: FolderTree }
    ]
  }
];

const navigation = navigationGroups.flatMap((group) => group.links);

function SearchMenu({
  query,
  results,
  isOpen,
  onOpen,
  onChange,
  onKeyDown,
  onSelect
}: {
  query: string;
  results: typeof navigation;
  isOpen: boolean;
  onOpen: () => void;
  onChange: (value: string) => void;
  onKeyDown: (event: KeyboardEvent<HTMLInputElement>) => void;
  onSelect: (to: string) => void;
}) {
  const { t } = useTranslation();
  return (
    <div className="search-menu">
      <button
        className="icon-button"
        aria-label="Search pages"
        aria-expanded={isOpen}
        type="button"
        onClick={onOpen}
      >
        <Search size={19} aria-hidden="true" />
      </button>
      {isOpen && (
        <div className="search-wrap">
          <Search size={19} aria-hidden="true" />
          <input
            autoFocus
            value={query}
            onChange={(event) => onChange(event.target.value)}
            onKeyDown={onKeyDown}
            placeholder="Search pages and actions"
            aria-label="Search pages"
          />
          <div className="search-results" role="listbox">
            {results.length ? (
              results.map((item) => (
                <button key={item.to} role="option" onMouseDown={() => onSelect(item.to)}>
                  <item.icon size={16} />
                  {t(item.key)}
                </button>
              ))
            ) : (
              <p>No matching pages</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function ProfilePreferences({
  dark,
  language,
  onThemeChange,
  onLanguageChange
}: {
  dark: boolean;
  language: string;
  onThemeChange: () => void;
  onLanguageChange: (language: string) => void;
}) {
  return (
    <div className="profile-menu">
      <button className="avatar" aria-label="Open profile preferences" type="button">
        PL
      </button>
      <div className="profile-menu-panel" aria-label="Profile preferences">
        <button className="profile-menu-action" onClick={onThemeChange} type="button">
          {dark ? <Sun size={17} /> : <Moon size={17} />}
          <span>{dark ? 'Light mode' : 'Dark mode'}</span>
        </button>
        <button
          className="profile-language"
          type="button"
          onClick={() => onLanguageChange(language === 'pt-BR' ? 'en' : 'pt-BR')}
          aria-label={
            language === 'pt-BR' ? 'Switch language to English' : 'Mudar idioma para português'
          }
        >
          <Languages size={17} aria-hidden="true" />
          <span>{language === 'pt-BR' ? 'PT' : 'EN'}</span>
        </button>
      </div>
    </div>
  );
}

/** Displays the persistent application navigation and its accessible preferences menu. */
function Layout({ children }: { children: ReactNode }) {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const { resolvedTheme, setPreference } = useTheme();
  const dark = resolvedTheme === 'dark';
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [searchOpen, setSearchOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [openNavigationGroup, setOpenNavigationGroup] = useState<string | null>(null);
  const results = useMemo(
    () =>
      navigation.filter((item) =>
        t(item.key).toLocaleLowerCase().includes(query.toLocaleLowerCase())
      ),
    [query, t]
  );

  useEffect(() => {
    const listener = (event: Event) =>
      setError((event as CustomEvent<ApplicationError>).detail.message);
    window.addEventListener(applicationErrorEvent, listener);
    return () => window.removeEventListener(applicationErrorEvent, listener);
  }, []);
  useEffect(() => {
    if (!searchOpen) return;
    const closeOnOutsideClick = (event: MouseEvent) => {
      if (!(event.target instanceof Element) || !event.target.closest('.search-menu')) {
        setSearchOpen(false);
      }
    };
    document.addEventListener('mousedown', closeOnOutsideClick);
    return () => document.removeEventListener('mousedown', closeOnOutsideClick);
  }, [searchOpen]);
  useEffect(() => {
    const closeNavigationGroup = (event: MouseEvent) => {
      if (!(event.target instanceof Element) || !event.target.closest('.sidebar-links')) {
        setOpenNavigationGroup(null);
      }
    };
    document.addEventListener('mousedown', closeNavigationGroup);
    return () => document.removeEventListener('mousedown', closeNavigationGroup);
  }, []);
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    let animationFrame = 0;
    const moveBackgroundHighlight = (event: PointerEvent) => {
      cancelAnimationFrame(animationFrame);
      animationFrame = requestAnimationFrame(() => {
        document.documentElement.style.setProperty('--pointer-x', `${event.clientX}px`);
        document.documentElement.style.setProperty('--pointer-y', `${event.clientY}px`);
      });
    };
    window.addEventListener('pointermove', moveBackgroundHighlight, { passive: true });
    return () => {
      cancelAnimationFrame(animationFrame);
      window.removeEventListener('pointermove', moveBackgroundHighlight);
    };
  }, []);

  const goTo = (to: string) => {
    navigate(to);
    setQuery('');
    setSearchOpen(false);
    setMobileNavOpen(false);
  };
  return (
    <div className="app-shell">
      <aside
        className={`sidebar ${mobileNavOpen ? 'sidebar-open' : ''} ${searchOpen ? 'search-active' : ''}`}
        aria-label="Primary navigation"
      >
        <NavLink
          className="sidebar-brand brand-link"
          to="/"
          aria-label={t('navigation.dashboard')}
          onClick={() => {
            setMobileNavOpen(false);
            setOpenNavigationGroup(null);
          }}
        >
          <img
            className="brand-logo"
            src={dark ? '/Pocket Ledger Dark Mode Logo.png' : '/Pocket Ledger Logo.png'}
            alt="Pocket Ledger"
          />
        </NavLink>
        <nav className="sidebar-links">
          {navigationGroups.map(({ key, icon: GroupIcon, links }) => {
            const isOpen = openNavigationGroup === key;
            return (
              <div className="navigation-group" key={key}>
                <button
                  className="navigation-group-toggle"
                  type="button"
                  aria-expanded={isOpen}
                  onClick={() => setOpenNavigationGroup(isOpen ? null : key)}
                >
                  <GroupIcon size={18} strokeWidth={1.8} />
                  <span>{t(key)}</span>
                  <ChevronDown className={isOpen ? 'rotate-180' : ''} size={16} />
                </button>
                {isOpen && (
                  <div className="navigation-subgroup">
                    {links.map(({ to, key: linkKey, icon: LinkIcon }) => (
                      <NavLink
                        key={to}
                        to={to}
                        className="sidebar-link"
                        onClick={() => {
                          setMobileNavOpen(false);
                          setOpenNavigationGroup(null);
                        }}
                        title={t(linkKey)}
                      >
                        <LinkIcon size={17} strokeWidth={1.8} />
                        <span>{t(linkKey)}</span>
                      </NavLink>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </nav>
        <div className="navbar-actions">
          <SearchMenu
            query={query}
            results={results}
            isOpen={searchOpen}
            onOpen={() => setSearchOpen(true)}
            onChange={(value) => {
              setQuery(value);
              setSearchOpen(true);
            }}
            onKeyDown={(event) => {
              if (event.key === 'Escape') setSearchOpen(false);
              if (event.key === 'Enter' && results[0]) goTo(results[0].to);
            }}
            onSelect={goTo}
          />
          <ProfilePreferences
            dark={dark}
            language={i18n.language}
            onThemeChange={() => setPreference(dark ? 'light' : 'dark')}
            onLanguageChange={(language) => i18n.changeLanguage(language)}
          />
        </div>
      </aside>
      {mobileNavOpen && (
        <button
          className="mobile-scrim"
          aria-label="Close navigation"
          onClick={() => setMobileNavOpen(false)}
        />
      )}
      <div className="page-frame">
        <header className="topbar mobile-topbar">
          <button
            className="icon-button mobile-menu"
            aria-label="Open navigation"
            onClick={() => setMobileNavOpen(true)}
          >
            <Menu size={21} />
          </button>
          <div className="navbar-actions">
            <SearchMenu
              query={query}
              results={results}
              isOpen={searchOpen}
              onOpen={() => setSearchOpen(true)}
              onChange={(value) => {
                setQuery(value);
                setSearchOpen(true);
              }}
              onKeyDown={(event) => {
                if (event.key === 'Escape') setSearchOpen(false);
                if (event.key === 'Enter' && results[0]) goTo(results[0].to);
              }}
              onSelect={goTo}
            />
            <ProfilePreferences
              dark={dark}
              language={i18n.language}
              onThemeChange={() => setPreference(dark ? 'light' : 'dark')}
              onLanguageChange={(language) => i18n.changeLanguage(language)}
            />
          </div>
        </header>
        <main className="page-content">{children}</main>
        <footer className="page-footer">Pocket Ledger · Personal finance</footer>
      </div>
      <nav className="mobile-nav" aria-label="Mobile navigation">
        {navigation.slice(0, 5).map(({ to, key, icon: Icon }) => (
          <NavLink key={to} to={to} title={t(key)}>
            <Icon size={20} />
            <span>{t(key)}</span>
          </NavLink>
        ))}
      </nav>
      <ErrorModal
        message={error}
        onCancel={() => setError(null)}
        onRetry={() => window.location.reload()}
      />
    </div>
  );
}

export function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<DashboardPage />} />
        <Route path="/transactions" element={<TransactionsPage />} />
        <Route path="/accounts" element={<CatalogPage kind="accounts" />} />
        <Route path="/categories" element={<CatalogPage kind="categories" />} />
        <Route path="/budgets" element={<DashboardPage titleKey="navigation.budgets" />} />
        <Route path="/reports" element={<DashboardPage titleKey="navigation.reports" />} />
        <Route path="/history" element={<HistoryPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Layout>
  );
}
