import React, { useState, useEffect } from 'react';
import { AppView } from '../types';

interface AdminDashboardProps {
  navigate: (view: AppView) => void;
}

interface Stats {
  users: number;
  venues: number;
  artists: number;
  bands: number;
  gigs: number;
}

interface User {
  id: string;
  email: string;
  phone: string;
  role: string;
  two_factor_enabled: boolean;
  face_verified: boolean;
  profile_completed: boolean;
  created_at: string;
}

interface Venue {
  id: string;
  name: string;
  email: string;
  type: string;
  owner_email: string;
  created_at: string;
}

interface Artist {
  id: string;
  name: string;
  genre: string[];
  city_of_origin: string;
  open_to_work: boolean;
  owner_email: string;
  created_at: string;
}

interface Gig {
  id: string;
  title: string;
  venue: string;
  location: string;
  date: string;
  status: string;
  created_at: string;
}

type TabType = 'overview' | 'users' | 'venues' | 'artists' | 'gigs';

const AdminDashboard: React.FC<AdminDashboardProps> = ({ navigate }) => {
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [stats, setStats] = useState<Stats | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [venues, setVenues] = useState<Venue[]>([]);
  const [artists, setArtists] = useState<Artist[]>([]);
  const [gigs, setGigs] = useState<Gig[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [authToken, setAuthToken] = useState<string | null>(() => {
    return localStorage.getItem('admin_token');
  });
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  
  // Search, sort, and detail view state
  const [searchQuery, setSearchQuery] = useState('');
  const [sortField, setSortField] = useState<string>('created_at');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [selectedItem, setSelectedItem] = useState<User | Venue | Artist | Gig | null>(null);
  const [detailType, setDetailType] = useState<'user' | 'venue' | 'artist' | 'gig' | null>(null);

  const fetchData = async (resource: string) => {
    try {
      const response = await fetch(`/.netlify/functions/admin?resource=${resource}`, {
        headers: { 'X-Admin-Token': authToken || '' },
      });
      const data = await response.json();
      if (!response.ok) {
        if (response.status === 401) {
          // Token expired or invalid
          localStorage.removeItem('admin_token');
          setAuthToken(null);
          setIsAuthenticated(false);
        }
        throw new Error(data.error);
      }
      return data;
    } catch (err) {
      setError((err as Error).message);
      return null;
    }
  };

  const loadOverview = async () => {
    setLoading(true);
    const data = await fetchData('stats');
    if (data) {
      setStats(data.stats);
    }
    setLoading(false);
  };

  const loadUsers = async () => {
    setLoading(true);
    const data = await fetchData('users');
    if (data) setUsers(data.users);
    setLoading(false);
  };

  const loadVenues = async () => {
    setLoading(true);
    const data = await fetchData('venues');
    if (data) setVenues(data.venues);
    setLoading(false);
  };

  const loadArtists = async () => {
    setLoading(true);
    const data = await fetchData('artists');
    if (data) setArtists(data.artists);
    setLoading(false);
  };

  const loadGigs = async () => {
    setLoading(true);
    const data = await fetchData('gigs');
    if (data) setGigs(data.gigs);
    setLoading(false);
  };

  const handleDelete = async (resource: string, id: string) => {
    if (!confirm(`Are you sure you want to delete this ${resource.slice(0, -1)}?`)) return;
    
    try {
      const response = await fetch(`/.netlify/functions/admin?resource=${resource}&id=${id}`, {
        method: 'DELETE',
        headers: { 'X-Admin-Token': authToken || '' },
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error);
      
      // Reload current tab data
      switch (activeTab) {
        case 'users': loadUsers(); break;
        case 'venues': loadVenues(); break;
        case 'artists': loadArtists(); break;
        case 'gigs': loadGigs(); break;
        default: loadOverview();
      }
    } catch (err) {
      setError((err as Error).message);
    }
  };

  const handleLogin = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/.netlify/functions/admin?resource=login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Login failed');
      }
      
      // Save token and mark as authenticated
      localStorage.setItem('admin_token', data.token);
      setAuthToken(data.token);
      setIsAuthenticated(true);
      
      // Load initial data with the new token directly
      const statsResponse = await fetch('/.netlify/functions/admin?resource=stats', {
        headers: { 'X-Admin-Token': data.token },
      });
      const statsData = await statsResponse.json();
      if (statsData?.stats) {
        setStats(statsData.stats);
      }
    } catch (err) {
      setError((err as Error).message);
    }
    
    setLoading(false);
  };
  
  const handleLogout = () => {
    localStorage.removeItem('admin_token');
    setAuthToken(null);
    setIsAuthenticated(false);
    setUsername('');
    setPassword('');
  };
  
  // Check if already authenticated on mount
  useEffect(() => {
    if (authToken) {
      setIsAuthenticated(true);
      loadOverview();
    }
  }, []);

  useEffect(() => {
    if (!isAuthenticated) return;
    
    switch (activeTab) {
      case 'overview': loadOverview(); break;
      case 'users': loadUsers(); break;
      case 'venues': loadVenues(); break;
      case 'artists': loadArtists(); break;
      case 'gigs': loadGigs(); break;
    }
  }, [activeTab, isAuthenticated]);

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Filter and sort helpers
  const filterItems = <T,>(items: T[], query: string): T[] => {
    if (!query.trim()) return items;
    const q = query.toLowerCase();
    return items.filter(item => 
      Object.values(item as object).some(val => 
        String(val).toLowerCase().includes(q)
      )
    );
  };

  const sortItems = <T,>(items: T[], field: string, direction: 'asc' | 'desc'): T[] => {
    return [...items].sort((a, b) => {
      const aVal = (a as Record<string, unknown>)[field];
      const bVal = (b as Record<string, unknown>)[field];
      if (aVal === bVal) return 0;
      if (aVal === null || aVal === undefined) return 1;
      if (bVal === null || bVal === undefined) return -1;
      const comparison = String(aVal).localeCompare(String(bVal));
      return direction === 'asc' ? comparison : -comparison;
    });
  };

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const openDetail = (item: User | Venue | Artist | Gig, type: 'user' | 'venue' | 'artist' | 'gig') => {
    setSelectedItem(item);
    setDetailType(type);
  };

  const closeDetail = () => {
    setSelectedItem(null);
    setDetailType(null);
  };

  // Get filtered and sorted data
  const filteredUsers: User[] = sortItems(filterItems(users, searchQuery), sortField, sortDirection);
  const filteredVenues: Venue[] = sortItems(filterItems(venues, searchQuery), sortField, sortDirection);
  const filteredArtists: Artist[] = sortItems(filterItems(artists, searchQuery), sortField, sortDirection);
  const filteredGigs: Gig[] = sortItems(filterItems(gigs, searchQuery), sortField, sortDirection);

  // Detail Modal Component
  const DetailModal = () => {
    if (!selectedItem || !detailType) return null;
    
    return (
      <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-6" onClick={closeDetail}>
        <div className="bg-surface-dark rounded-3xl border border-white/10 w-full max-w-2xl max-h-[80vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
          <div className="sticky top-0 bg-surface-dark border-b border-white/5 p-6 flex items-center justify-between">
            <h2 className="text-xl font-black capitalize">{detailType} Details</h2>
            <button onClick={closeDetail} className="size-10 rounded-xl bg-white/5 flex items-center justify-center hover:bg-white/10">
              <span className="material-symbols-outlined">close</span>
            </button>
          </div>
          <div className="p-6 space-y-4">
            {Object.entries(selectedItem).map(([key, value]) => (
              <div key={key} className="flex flex-col sm:flex-row sm:items-start gap-2 py-3 border-b border-white/5 last:border-0">
                <span className="text-slate-500 text-sm font-bold min-w-[140px] capitalize">{key.replace(/_/g, ' ')}</span>
                <span className="text-white text-sm flex-1 break-all">
                  {typeof value === 'boolean' ? (value ? 'Yes' : 'No') : 
                   Array.isArray(value) ? value.join(', ') || '—' :
                   typeof value === 'object' ? JSON.stringify(value, null, 2) :
                   String(value) || '—'}
                </span>
              </div>
            ))}
          </div>
          <div className="sticky bottom-0 bg-surface-dark border-t border-white/5 p-4 flex justify-end gap-3">
            <button onClick={closeDetail} className="px-6 py-3 rounded-xl bg-white/5 text-white font-bold hover:bg-white/10">Close</button>
            <button 
              onClick={() => { handleDelete(detailType + 's', (selectedItem as { id: string }).id); closeDetail(); }}
              className="px-6 py-3 rounded-xl bg-red-500/20 text-red-400 font-bold hover:bg-red-500/30"
            >
              Delete
            </button>
          </div>
        </div>
      </div>
    );
  };

  // Search Bar Component
  const SearchBar = () => (
    <div className="relative">
      <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-500">search</span>
      <input
        type="text"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        placeholder="Search..."
        className="w-full sm:w-80 h-12 bg-surface-dark border border-white/10 rounded-xl pl-12 pr-4 text-white placeholder:text-slate-600 outline-none focus:border-primary"
      />
      {searchQuery && (
        <button onClick={() => setSearchQuery('')} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white">
          <span className="material-symbols-outlined text-lg">close</span>
        </button>
      )}
    </div>
  );

  // Sortable Header Component
  const SortableHeader = ({ field, label }: { field: string; label: string }) => (
    <th 
      className="text-left px-4 py-3 font-bold text-slate-400 cursor-pointer hover:text-white transition-colors select-none"
      onClick={() => handleSort(field)}
    >
      <div className="flex items-center gap-1">
        {label}
        {sortField === field && (
          <span className="material-symbols-outlined text-primary text-sm">
            {sortDirection === 'asc' ? 'arrow_upward' : 'arrow_downward'}
          </span>
        )}
      </div>
    </th>
  );

  // Login screen
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background-dark flex items-center justify-center p-6">
        <div className="w-full max-w-md space-y-6">
          <div className="text-center space-y-2">
            <div className="size-16 rounded-2xl bg-primary/20 flex items-center justify-center mx-auto mb-4">
              <span className="material-symbols-outlined text-3xl text-primary">admin_panel_settings</span>
            </div>
            <h1 className="text-3xl font-black text-white">Admin Dashboard</h1>
            <p className="text-slate-500">Sign in to continue</p>
          </div>
          
          <div className="space-y-4">
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Username"
              className="w-full h-14 bg-surface-dark border-2 border-white/10 rounded-2xl px-4 font-medium text-white outline-none focus:border-primary"
            />
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
              placeholder="Password"
              className="w-full h-14 bg-surface-dark border-2 border-white/10 rounded-2xl px-4 font-medium text-white outline-none focus:border-primary"
            />
            {error && <p className="text-red-500 text-sm text-center">{error}</p>}
            <button
              onClick={handleLogin}
              disabled={loading}
              className="w-full h-14 bg-primary text-white font-bold rounded-2xl active:scale-95 transition-all"
            >
              {loading ? 'Authenticating...' : 'Access Dashboard'}
            </button>
          </div>
          
          <button
            onClick={() => navigate(AppView.LANDING)}
            className="w-full text-slate-500 text-sm hover:text-white transition-colors"
          >
            ← Back to App
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background-dark text-white flex">
      {/* Sidebar */}
      <aside className="w-64 bg-surface-dark border-r border-white/5 flex flex-col shrink-0">
        <div className="p-5 border-b border-white/5">
          <div className="flex items-center gap-3">
            <div className="size-10 rounded-xl bg-primary/20 flex items-center justify-center">
              <span className="material-symbols-outlined text-primary">admin_panel_settings</span>
            </div>
            <div>
              <h1 className="text-base font-black">Admin</h1>
              <p className="text-[10px] text-slate-500">Tempo Gig Manager</p>
            </div>
          </div>
        </div>
        
        <nav className="flex-1 p-3 space-y-1">
          {([
            { id: 'overview', icon: 'dashboard', label: 'Overview' },
            { id: 'users', icon: 'person', label: 'Users' },
            { id: 'venues', icon: 'location_on', label: 'Venues' },
            { id: 'artists', icon: 'music_note', label: 'Artists' },
            { id: 'gigs', icon: 'event', label: 'Gigs' },
          ] as { id: TabType; icon: string; label: string }[]).map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                activeTab === item.id
                  ? 'bg-primary text-white shadow-lg shadow-primary/20'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <span className="material-symbols-outlined text-xl">{item.icon}</span>
              {item.label}
            </button>
          ))}
        </nav>
        
        <div className="p-4 border-t border-white/5 space-y-2">
          <button
            onClick={() => navigate(AppView.LANDING)}
            className="w-full flex items-center gap-2 px-4 py-2 text-sm text-slate-500 hover:text-white transition-colors rounded-xl hover:bg-white/5"
          >
            <span className="material-symbols-outlined text-lg">arrow_back</span>
            Back to App
          </button>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-400 hover:text-red-300 transition-colors rounded-xl hover:bg-red-500/10"
          >
            <span className="material-symbols-outlined text-lg">logout</span>
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Top bar */}
        <header className="h-16 bg-surface-dark/50 backdrop-blur-xl border-b border-white/5 flex items-center justify-between px-6 shrink-0">
          <h2 className="text-xl font-black capitalize">{activeTab}</h2>
          <div className="flex items-center gap-3">
            <span className={`flex items-center gap-2 text-sm ${loading ? 'text-yellow-400' : 'text-green-400'}`}>
              <span className="size-2 rounded-full bg-current animate-pulse"></span>
              {loading ? 'Loading...' : 'Connected'}
            </span>
          </div>
        </header>

        {/* Content area */}
        <div className="flex-1 overflow-y-auto p-6">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="size-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : (
          <>
            {/* Overview Tab */}
            {activeTab === 'overview' && stats && (
              <div className="space-y-6">
                <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
                  {[
                    { label: 'Users', value: stats.users, icon: 'person', color: 'bg-blue-500' },
                    { label: 'Venues', value: stats.venues, icon: 'location_on', color: 'bg-purple-500' },
                    { label: 'Artists', value: stats.artists, icon: 'music_note', color: 'bg-cyan-500' },
                    { label: 'Bands', value: stats.bands, icon: 'groups', color: 'bg-orange-500' },
                    { label: 'Gigs', value: stats.gigs, icon: 'event', color: 'bg-green-500' },
                  ].map((stat) => (
                    <div key={stat.label} className="bg-surface-dark rounded-2xl p-5 border border-white/5">
                      <div className={`size-12 rounded-xl ${stat.color}/20 flex items-center justify-center mb-3`}>
                        <span className={`material-symbols-outlined text-2xl ${stat.color.replace('bg-', 'text-')}`}>{stat.icon}</span>
                      </div>
                      <p className="text-3xl font-black">{stat.value}</p>
                      <p className="text-sm text-slate-500 mt-1">{stat.label}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Users Tab */}
            {activeTab === 'users' && (
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <h3 className="text-lg font-bold">Users ({filteredUsers.length})</h3>
                  <div className="flex items-center gap-3">
                    <SearchBar />
                    <button onClick={loadUsers} className="text-sm text-primary font-bold hover:text-primary/80 whitespace-nowrap">Refresh</button>
                  </div>
                </div>
                <div className="bg-surface-dark rounded-2xl border border-white/5 overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead className="bg-white/5">
                        <tr>
                          <SortableHeader field="email" label="Email" />
                          <SortableHeader field="role" label="Role" />
                          <SortableHeader field="two_factor_enabled" label="2FA" />
                          <SortableHeader field="face_verified" label="Verified" />
                          <SortableHeader field="created_at" label="Created" />
                          <th className="text-left px-4 py-3 font-bold text-slate-400">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5">
                        {filteredUsers.map((user) => (
                          <tr key={user.id} className="hover:bg-white/5 cursor-pointer" onClick={() => openDetail(user, 'user')}>
                            <td className="px-4 py-3 font-medium">{user.email || user.phone || '—'}</td>
                            <td className="px-4 py-3">
                              <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                                user.role === 'venue' ? 'bg-purple-500/20 text-purple-400' :
                                user.role === 'artist' ? 'bg-cyan-500/20 text-cyan-400' :
                                'bg-orange-500/20 text-orange-400'
                              }`}>
                                {user.role}
                              </span>
                            </td>
                            <td className="px-4 py-3">{user.two_factor_enabled ? '✓' : '—'}</td>
                            <td className="px-4 py-3">{user.face_verified ? '✓' : '—'}</td>
                            <td className="px-4 py-3 text-slate-400">{formatDate(user.created_at)}</td>
                            <td className="px-4 py-3">
                              <button
                                onClick={(e) => { e.stopPropagation(); handleDelete('users', user.id); }}
                                className="text-red-500 hover:text-red-400 font-bold text-xs"
                              >
                                Delete
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* Venues Tab */}
            {activeTab === 'venues' && (
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <h3 className="text-lg font-bold">Venues ({filteredVenues.length})</h3>
                  <div className="flex items-center gap-3">
                    <SearchBar />
                    <button onClick={loadVenues} className="text-sm text-primary font-bold hover:text-primary/80 whitespace-nowrap">Refresh</button>
                  </div>
                </div>
                <div className="bg-surface-dark rounded-2xl border border-white/5 overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead className="bg-white/5">
                        <tr>
                          <SortableHeader field="name" label="Name" />
                          <SortableHeader field="type" label="Type" />
                          <SortableHeader field="email" label="Email" />
                          <SortableHeader field="owner_email" label="Owner" />
                          <SortableHeader field="created_at" label="Created" />
                          <th className="text-left px-4 py-3 font-bold text-slate-400">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5">
                        {filteredVenues.map((venue) => (
                          <tr key={venue.id} className="hover:bg-white/5 cursor-pointer" onClick={() => openDetail(venue, 'venue')}>
                            <td className="px-4 py-3 font-medium">{venue.name}</td>
                            <td className="px-4 py-3 capitalize">{venue.type}</td>
                            <td className="px-4 py-3">{venue.email}</td>
                            <td className="px-4 py-3 text-slate-400">{venue.owner_email}</td>
                            <td className="px-4 py-3 text-slate-400">{formatDate(venue.created_at)}</td>
                            <td className="px-4 py-3">
                              <button onClick={(e) => { e.stopPropagation(); handleDelete('venues', venue.id); }} className="text-red-500 hover:text-red-400 font-bold text-xs">Delete</button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* Artists Tab */}
            {activeTab === 'artists' && (
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <h3 className="text-lg font-bold">Artists ({filteredArtists.length})</h3>
                  <div className="flex items-center gap-3">
                    <SearchBar />
                    <button onClick={loadArtists} className="text-sm text-primary font-bold hover:text-primary/80 whitespace-nowrap">Refresh</button>
                  </div>
                </div>
                <div className="bg-surface-dark rounded-2xl border border-white/5 overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead className="bg-white/5">
                        <tr>
                          <SortableHeader field="name" label="Name" />
                          <SortableHeader field="genre" label="Genre" />
                          <SortableHeader field="city_of_origin" label="Location" />
                          <SortableHeader field="open_to_work" label="Open to Work" />
                          <SortableHeader field="owner_email" label="Owner" />
                          <th className="text-left px-4 py-3 font-bold text-slate-400">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5">
                        {filteredArtists.map((artist) => (
                          <tr key={artist.id} className="hover:bg-white/5 cursor-pointer" onClick={() => openDetail(artist, 'artist')}>
                            <td className="px-4 py-3 font-medium">{artist.name}</td>
                            <td className="px-4 py-3">{artist.genre?.join(', ') || '—'}</td>
                            <td className="px-4 py-3">{artist.city_of_origin || '—'}</td>
                            <td className="px-4 py-3">
                              <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                                artist.open_to_work ? 'bg-green-500/20 text-green-400' : 'bg-slate-500/20 text-slate-400'
                              }`}>
                                {artist.open_to_work ? 'Yes' : 'No'}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-slate-400">{artist.owner_email}</td>
                            <td className="px-4 py-3">
                              <button onClick={(e) => { e.stopPropagation(); handleDelete('artists', artist.id); }} className="text-red-500 hover:text-red-400 font-bold text-xs">Delete</button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* Gigs Tab */}
            {activeTab === 'gigs' && (
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <h3 className="text-lg font-bold">Gigs ({filteredGigs.length})</h3>
                  <div className="flex items-center gap-3">
                    <SearchBar />
                    <button onClick={loadGigs} className="text-sm text-primary font-bold hover:text-primary/80 whitespace-nowrap">Refresh</button>
                  </div>
                </div>
                <div className="bg-surface-dark rounded-2xl border border-white/5 overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead className="bg-white/5">
                        <tr>
                          <SortableHeader field="title" label="Title" />
                          <SortableHeader field="venue" label="Venue" />
                          <SortableHeader field="location" label="Location" />
                          <SortableHeader field="date" label="Date" />
                          <SortableHeader field="status" label="Status" />
                          <th className="text-left px-4 py-3 font-bold text-slate-400">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5">
                        {filteredGigs.map((gig) => (
                          <tr key={gig.id} className="hover:bg-white/5 cursor-pointer" onClick={() => openDetail(gig, 'gig')}>
                            <td className="px-4 py-3 font-medium">{gig.title}</td>
                            <td className="px-4 py-3">{gig.venue}</td>
                            <td className="px-4 py-3">{gig.location}</td>
                            <td className="px-4 py-3">{gig.date}</td>
                            <td className="px-4 py-3">
                              <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                                gig.status === 'published' ? 'bg-green-500/20 text-green-400' :
                                gig.status === 'draft' ? 'bg-yellow-500/20 text-yellow-400' :
                                gig.status === 'confirmed' ? 'bg-blue-500/20 text-blue-400' :
                                'bg-slate-500/20 text-slate-400'
                              }`}>
                                {gig.status}
                              </span>
                            </td>
                            <td className="px-4 py-3">
                              <button onClick={(e) => { e.stopPropagation(); handleDelete('gigs', gig.id); }} className="text-red-500 hover:text-red-400 font-bold text-xs">Delete</button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
        </div>
      </main>
      <DetailModal />
    </div>
  );
};

export default AdminDashboard;
