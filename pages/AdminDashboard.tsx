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

  // Login screen
  if (!isAuthenticated) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center bg-background-dark text-white p-6">
        <div className="w-full max-w-md space-y-6">
          <div className="text-center space-y-2">
            <div className="size-16 rounded-2xl bg-primary/20 flex items-center justify-center mx-auto mb-4">
              <span className="material-symbols-outlined text-3xl text-primary">admin_panel_settings</span>
            </div>
            <h1 className="text-3xl font-black">Admin Dashboard</h1>
            <p className="text-slate-500">Sign in to continue</p>
          </div>
          
          <div className="space-y-4">
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Username"
              className="w-full h-14 bg-surface-dark border-2 border-white/10 rounded-2xl px-4 font-medium outline-none focus:border-primary"
            />
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
              placeholder="Password"
              className="w-full h-14 bg-surface-dark border-2 border-white/10 rounded-2xl px-4 font-medium outline-none focus:border-primary"
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
    <div className="flex-1 flex flex-col bg-background-dark text-white min-h-screen">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background-dark/90 backdrop-blur-xl border-b border-white/5 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="size-10 rounded-xl bg-primary/20 flex items-center justify-center">
              <span className="material-symbols-outlined text-primary">admin_panel_settings</span>
            </div>
            <div>
              <h1 className="text-xl font-black">Admin Dashboard</h1>
              <p className="text-xs text-slate-500">Tempo Gig Manager</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleLogout}
              className="h-10 px-4 rounded-xl bg-surface-dark flex items-center justify-center gap-2 text-slate-400 hover:text-white transition-colors text-sm font-medium"
            >
              <span className="material-symbols-outlined text-lg">logout</span>
              Logout
            </button>
            <button
              onClick={() => navigate(AppView.LANDING)}
              className="size-10 rounded-xl bg-surface-dark flex items-center justify-center text-slate-400 hover:text-white transition-colors"
            >
              <span className="material-symbols-outlined">close</span>
            </button>
          </div>
        </div>
      </header>

      {/* Tabs */}
      <div className="border-b border-white/5 px-6">
        <div className="flex gap-1 overflow-x-auto hide-scrollbar">
          {(['overview', 'users', 'venues', 'artists', 'gigs'] as TabType[]).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-3 text-sm font-bold capitalize whitespace-nowrap transition-all border-b-2 ${
                activeTab === tab
                  ? 'text-primary border-primary'
                  : 'text-slate-500 border-transparent hover:text-white'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <main className="flex-1 overflow-y-auto p-6">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="size-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : (
          <>
            {/* Overview Tab */}
            {activeTab === 'overview' && stats && (
              <div className="space-y-6">
                <h2 className="text-lg font-bold">Platform Statistics</h2>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                  {[
                    { label: 'Users', value: stats.users, icon: 'person', color: 'bg-blue-500' },
                    { label: 'Venues', value: stats.venues, icon: 'location_on', color: 'bg-purple-500' },
                    { label: 'Artists', value: stats.artists, icon: 'music_note', color: 'bg-cyan-500' },
                    { label: 'Bands', value: stats.bands, icon: 'groups', color: 'bg-orange-500' },
                    { label: 'Gigs', value: stats.gigs, icon: 'event', color: 'bg-green-500' },
                  ].map((stat) => (
                    <div key={stat.label} className="bg-surface-dark rounded-2xl p-4 border border-white/5">
                      <div className={`size-10 rounded-xl ${stat.color}/20 flex items-center justify-center mb-3`}>
                        <span className={`material-symbols-outlined ${stat.color.replace('bg-', 'text-')}`}>{stat.icon}</span>
                      </div>
                      <p className="text-3xl font-black">{stat.value}</p>
                      <p className="text-sm text-slate-500">{stat.label}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Users Tab */}
            {activeTab === 'users' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-bold">Users ({users.length})</h2>
                  <button onClick={loadUsers} className="text-sm text-primary font-bold">Refresh</button>
                </div>
                <div className="bg-surface-dark rounded-2xl border border-white/5 overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead className="bg-white/5">
                        <tr>
                          <th className="text-left px-4 py-3 font-bold text-slate-400">Email</th>
                          <th className="text-left px-4 py-3 font-bold text-slate-400">Role</th>
                          <th className="text-left px-4 py-3 font-bold text-slate-400">2FA</th>
                          <th className="text-left px-4 py-3 font-bold text-slate-400">Verified</th>
                          <th className="text-left px-4 py-3 font-bold text-slate-400">Created</th>
                          <th className="text-left px-4 py-3 font-bold text-slate-400">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5">
                        {users.map((user) => (
                          <tr key={user.id} className="hover:bg-white/5">
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
                                onClick={() => handleDelete('users', user.id)}
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
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-bold">Venues ({venues.length})</h2>
                  <button onClick={loadVenues} className="text-sm text-primary font-bold">Refresh</button>
                </div>
                <div className="bg-surface-dark rounded-2xl border border-white/5 overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead className="bg-white/5">
                        <tr>
                          <th className="text-left px-4 py-3 font-bold text-slate-400">Name</th>
                          <th className="text-left px-4 py-3 font-bold text-slate-400">Type</th>
                          <th className="text-left px-4 py-3 font-bold text-slate-400">Email</th>
                          <th className="text-left px-4 py-3 font-bold text-slate-400">Owner</th>
                          <th className="text-left px-4 py-3 font-bold text-slate-400">Created</th>
                          <th className="text-left px-4 py-3 font-bold text-slate-400">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5">
                        {venues.map((venue) => (
                          <tr key={venue.id} className="hover:bg-white/5">
                            <td className="px-4 py-3 font-medium">{venue.name}</td>
                            <td className="px-4 py-3 capitalize">{venue.type}</td>
                            <td className="px-4 py-3">{venue.email}</td>
                            <td className="px-4 py-3 text-slate-400">{venue.owner_email}</td>
                            <td className="px-4 py-3 text-slate-400">{formatDate(venue.created_at)}</td>
                            <td className="px-4 py-3">
                              <button
                                onClick={() => handleDelete('venues', venue.id)}
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

            {/* Artists Tab */}
            {activeTab === 'artists' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-bold">Artists ({artists.length})</h2>
                  <button onClick={loadArtists} className="text-sm text-primary font-bold">Refresh</button>
                </div>
                <div className="bg-surface-dark rounded-2xl border border-white/5 overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead className="bg-white/5">
                        <tr>
                          <th className="text-left px-4 py-3 font-bold text-slate-400">Name</th>
                          <th className="text-left px-4 py-3 font-bold text-slate-400">Genre</th>
                          <th className="text-left px-4 py-3 font-bold text-slate-400">Location</th>
                          <th className="text-left px-4 py-3 font-bold text-slate-400">Open to Work</th>
                          <th className="text-left px-4 py-3 font-bold text-slate-400">Owner</th>
                          <th className="text-left px-4 py-3 font-bold text-slate-400">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5">
                        {artists.map((artist) => (
                          <tr key={artist.id} className="hover:bg-white/5">
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
                              <button
                                onClick={() => handleDelete('artists', artist.id)}
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

            {/* Gigs Tab */}
            {activeTab === 'gigs' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-bold">Gigs ({gigs.length})</h2>
                  <button onClick={loadGigs} className="text-sm text-primary font-bold">Refresh</button>
                </div>
                <div className="bg-surface-dark rounded-2xl border border-white/5 overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead className="bg-white/5">
                        <tr>
                          <th className="text-left px-4 py-3 font-bold text-slate-400">Title</th>
                          <th className="text-left px-4 py-3 font-bold text-slate-400">Venue</th>
                          <th className="text-left px-4 py-3 font-bold text-slate-400">Location</th>
                          <th className="text-left px-4 py-3 font-bold text-slate-400">Date</th>
                          <th className="text-left px-4 py-3 font-bold text-slate-400">Status</th>
                          <th className="text-left px-4 py-3 font-bold text-slate-400">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5">
                        {gigs.map((gig) => (
                          <tr key={gig.id} className="hover:bg-white/5">
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
                              <button
                                onClick={() => handleDelete('gigs', gig.id)}
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
          </>
        )}
      </main>
    </div>
  );
};

export default AdminDashboard;
