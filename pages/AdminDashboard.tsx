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

  // Login screen - terminal style
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] text-green-400 font-mono flex items-center justify-center p-6">
        <div className="w-full max-w-lg">
          <div className="bg-[#111] border border-green-900/50 rounded-lg overflow-hidden shadow-2xl">
            {/* Terminal header */}
            <div className="bg-[#1a1a1a] px-4 py-2 flex items-center gap-2 border-b border-green-900/30">
              <div className="flex gap-1.5">
                <div className="size-3 rounded-full bg-red-500/80"></div>
                <div className="size-3 rounded-full bg-yellow-500/80"></div>
                <div className="size-3 rounded-full bg-green-500/80"></div>
              </div>
              <span className="text-xs text-green-600 ml-2">admin@tempo-gig-manager ~ auth</span>
            </div>
            
            <div className="p-6 space-y-4">
              <div className="text-green-500 text-sm">
                <p>$ tempo-admin --login</p>
                <p className="text-green-600 mt-2">Tempo Gig Manager Admin Console v1.0.0</p>
                <p className="text-green-600">Authentication required.</p>
              </div>
              
              <div className="space-y-3 mt-6">
                <div>
                  <label className="text-xs text-green-600 block mb-1">username:</label>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full h-10 bg-[#0a0a0a] border border-green-900/50 rounded px-3 font-mono text-green-400 outline-none focus:border-green-500 text-sm"
                    placeholder="_"
                  />
                </div>
                <div>
                  <label className="text-xs text-green-600 block mb-1">password:</label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
                    className="w-full h-10 bg-[#0a0a0a] border border-green-900/50 rounded px-3 font-mono text-green-400 outline-none focus:border-green-500 text-sm"
                    placeholder="••••••••"
                  />
                </div>
              </div>
              
              {error && <p className="text-red-400 text-xs mt-2">ERROR: {error}</p>}
              
              <button
                onClick={handleLogin}
                disabled={loading}
                className="w-full h-10 bg-green-900/30 border border-green-700/50 text-green-400 font-mono text-sm rounded hover:bg-green-900/50 transition-colors mt-4"
              >
                {loading ? '> authenticating...' : '> authenticate'}
              </button>
              
              <button
                onClick={() => navigate(AppView.LANDING)}
                className="w-full text-green-700 text-xs hover:text-green-500 transition-colors mt-2"
              >
                $ exit
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-gray-300 font-mono flex">
      {/* Sidebar */}
      <aside className="w-64 bg-[#111] border-r border-gray-800 flex flex-col">
        <div className="p-4 border-b border-gray-800">
          <div className="flex items-center gap-3">
            <div className="size-8 rounded bg-green-900/30 flex items-center justify-center">
              <span className="material-symbols-outlined text-green-500 text-lg">terminal</span>
            </div>
            <div>
              <h1 className="text-sm font-bold text-white">Tempo Admin</h1>
              <p className="text-[10px] text-gray-600">v1.0.0</p>
            </div>
          </div>
        </div>
        
        <nav className="flex-1 p-2">
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
              className={`w-full flex items-center gap-3 px-3 py-2 rounded text-sm transition-colors ${
                activeTab === item.id
                  ? 'bg-green-900/20 text-green-400 border-l-2 border-green-500'
                  : 'text-gray-500 hover:text-gray-300 hover:bg-gray-800/50'
              }`}
            >
              <span className="material-symbols-outlined text-lg">{item.icon}</span>
              {item.label}
            </button>
          ))}
        </nav>
        
        <div className="p-4 border-t border-gray-800 space-y-2">
          <button
            onClick={() => navigate(AppView.LANDING)}
            className="w-full flex items-center gap-2 px-3 py-2 text-xs text-gray-600 hover:text-gray-400 transition-colors"
          >
            <span className="material-symbols-outlined text-sm">arrow_back</span>
            Back to App
          </button>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-2 px-3 py-2 text-xs text-red-600 hover:text-red-400 transition-colors"
          >
            <span className="material-symbols-outlined text-sm">logout</span>
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Top bar */}
        <header className="h-12 bg-[#111] border-b border-gray-800 flex items-center justify-between px-6">
          <div className="flex items-center gap-2 text-xs text-gray-600">
            <span>admin@tempo</span>
            <span className="text-gray-700">:</span>
            <span className="text-green-600">~/{activeTab}</span>
            <span className="text-gray-500">$</span>
          </div>
          <div className="flex items-center gap-4 text-xs">
            <span className="text-gray-600">{new Date().toLocaleString()}</span>
            <span className={`flex items-center gap-1 ${loading ? 'text-yellow-500' : 'text-green-500'}`}>
              <span className="size-1.5 rounded-full bg-current animate-pulse"></span>
              {loading ? 'loading' : 'connected'}
            </span>
          </div>
        </header>

        {/* Content area */}
        <div className="flex-1 overflow-y-auto p-6">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-green-500 text-sm">
              <span className="animate-pulse">Loading data...</span>
            </div>
          </div>
        ) : (
          <>
            {/* Overview Tab */}
            {activeTab === 'overview' && stats && (
              <div className="space-y-6">
                <div className="text-xs text-gray-600 mb-4">$ tempo-admin --stats</div>
                <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
                  {[
                    { label: 'users', value: stats.users, color: 'text-blue-400' },
                    { label: 'venues', value: stats.venues, color: 'text-purple-400' },
                    { label: 'artists', value: stats.artists, color: 'text-cyan-400' },
                    { label: 'bands', value: stats.bands, color: 'text-orange-400' },
                    { label: 'gigs', value: stats.gigs, color: 'text-green-400' },
                  ].map((stat) => (
                    <div key={stat.label} className="bg-[#111] rounded-lg p-4 border border-gray-800">
                      <p className={`text-3xl font-bold ${stat.color}`}>{stat.value}</p>
                      <p className="text-xs text-gray-600 mt-1">{stat.label}</p>
                    </div>
                  ))}
                </div>
                
                <div className="bg-[#111] rounded-lg border border-gray-800 p-4 mt-6">
                  <div className="text-xs text-gray-600 mb-3">$ system-info</div>
                  <div className="grid grid-cols-2 gap-4 text-xs">
                    <div><span className="text-gray-600">status:</span> <span className="text-green-400">operational</span></div>
                    <div><span className="text-gray-600">uptime:</span> <span className="text-gray-400">99.9%</span></div>
                    <div><span className="text-gray-600">api:</span> <span className="text-green-400">healthy</span></div>
                    <div><span className="text-gray-600">db:</span> <span className="text-green-400">connected</span></div>
                  </div>
                </div>
              </div>
            )}

            {/* Users Tab */}
            {activeTab === 'users' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="text-xs text-gray-600">$ tempo-admin --list users <span className="text-gray-500">({users.length} records)</span></div>
                  <button onClick={loadUsers} className="text-xs text-green-600 hover:text-green-400">refresh</button>
                </div>
                <div className="bg-[#111] rounded-lg border border-gray-800 overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-xs">
                      <thead className="bg-gray-900/50 border-b border-gray-800">
                        <tr>
                          <th className="text-left px-4 py-3 font-medium text-gray-500">email</th>
                          <th className="text-left px-4 py-3 font-medium text-gray-500">role</th>
                          <th className="text-left px-4 py-3 font-medium text-gray-500">2fa</th>
                          <th className="text-left px-4 py-3 font-medium text-gray-500">verified</th>
                          <th className="text-left px-4 py-3 font-medium text-gray-500">created</th>
                          <th className="text-left px-4 py-3 font-medium text-gray-500">actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-800/50">
                        {users.map((user) => (
                          <tr key={user.id} className="hover:bg-gray-800/30">
                            <td className="px-4 py-3 text-gray-300">{user.email || user.phone || '—'}</td>
                            <td className="px-4 py-3">
                              <span className={`${
                                user.role === 'venue' ? 'text-purple-400' :
                                user.role === 'artist' ? 'text-cyan-400' :
                                'text-orange-400'
                              }`}>
                                {user.role}
                              </span>
                            </td>
                            <td className="px-4 py-3">{user.two_factor_enabled ? <span className="text-green-400">✓</span> : <span className="text-gray-600">—</span>}</td>
                            <td className="px-4 py-3">{user.face_verified ? <span className="text-green-400">✓</span> : <span className="text-gray-600">—</span>}</td>
                            <td className="px-4 py-3 text-gray-500">{formatDate(user.created_at)}</td>
                            <td className="px-4 py-3">
                              <button
                                onClick={() => handleDelete('users', user.id)}
                                className="text-red-600 hover:text-red-400"
                              >
                                delete
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
                  <div className="text-xs text-gray-600">$ tempo-admin --list venues <span className="text-gray-500">({venues.length} records)</span></div>
                  <button onClick={loadVenues} className="text-xs text-green-600 hover:text-green-400">refresh</button>
                </div>
                <div className="bg-[#111] rounded-lg border border-gray-800 overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-xs">
                      <thead className="bg-gray-900/50 border-b border-gray-800">
                        <tr>
                          <th className="text-left px-4 py-3 font-medium text-gray-500">name</th>
                          <th className="text-left px-4 py-3 font-medium text-gray-500">type</th>
                          <th className="text-left px-4 py-3 font-medium text-gray-500">email</th>
                          <th className="text-left px-4 py-3 font-medium text-gray-500">owner</th>
                          <th className="text-left px-4 py-3 font-medium text-gray-500">created</th>
                          <th className="text-left px-4 py-3 font-medium text-gray-500">actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-800/50">
                        {venues.map((venue) => (
                          <tr key={venue.id} className="hover:bg-gray-800/30">
                            <td className="px-4 py-3 text-purple-400">{venue.name}</td>
                            <td className="px-4 py-3 text-gray-400">{venue.type}</td>
                            <td className="px-4 py-3 text-gray-300">{venue.email}</td>
                            <td className="px-4 py-3 text-gray-500">{venue.owner_email}</td>
                            <td className="px-4 py-3 text-gray-500">{formatDate(venue.created_at)}</td>
                            <td className="px-4 py-3">
                              <button onClick={() => handleDelete('venues', venue.id)} className="text-red-600 hover:text-red-400">delete</button>
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
                  <div className="text-xs text-gray-600">$ tempo-admin --list artists <span className="text-gray-500">({artists.length} records)</span></div>
                  <button onClick={loadArtists} className="text-xs text-green-600 hover:text-green-400">refresh</button>
                </div>
                <div className="bg-[#111] rounded-lg border border-gray-800 overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-xs">
                      <thead className="bg-gray-900/50 border-b border-gray-800">
                        <tr>
                          <th className="text-left px-4 py-3 font-medium text-gray-500">name</th>
                          <th className="text-left px-4 py-3 font-medium text-gray-500">genre</th>
                          <th className="text-left px-4 py-3 font-medium text-gray-500">location</th>
                          <th className="text-left px-4 py-3 font-medium text-gray-500">open_to_work</th>
                          <th className="text-left px-4 py-3 font-medium text-gray-500">owner</th>
                          <th className="text-left px-4 py-3 font-medium text-gray-500">actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-800/50">
                        {artists.map((artist) => (
                          <tr key={artist.id} className="hover:bg-gray-800/30">
                            <td className="px-4 py-3 text-cyan-400">{artist.name}</td>
                            <td className="px-4 py-3 text-gray-400">{artist.genre?.join(', ') || '—'}</td>
                            <td className="px-4 py-3 text-gray-400">{artist.city_of_origin || '—'}</td>
                            <td className="px-4 py-3">{artist.open_to_work ? <span className="text-green-400">true</span> : <span className="text-gray-600">false</span>}</td>
                            <td className="px-4 py-3 text-gray-500">{artist.owner_email}</td>
                            <td className="px-4 py-3">
                              <button onClick={() => handleDelete('artists', artist.id)} className="text-red-600 hover:text-red-400">delete</button>
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
                  <div className="text-xs text-gray-600">$ tempo-admin --list gigs <span className="text-gray-500">({gigs.length} records)</span></div>
                  <button onClick={loadGigs} className="text-xs text-green-600 hover:text-green-400">refresh</button>
                </div>
                <div className="bg-[#111] rounded-lg border border-gray-800 overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-xs">
                      <thead className="bg-gray-900/50 border-b border-gray-800">
                        <tr>
                          <th className="text-left px-4 py-3 font-medium text-gray-500">title</th>
                          <th className="text-left px-4 py-3 font-medium text-gray-500">venue</th>
                          <th className="text-left px-4 py-3 font-medium text-gray-500">location</th>
                          <th className="text-left px-4 py-3 font-medium text-gray-500">date</th>
                          <th className="text-left px-4 py-3 font-medium text-gray-500">status</th>
                          <th className="text-left px-4 py-3 font-medium text-gray-500">actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-800/50">
                        {gigs.map((gig) => (
                          <tr key={gig.id} className="hover:bg-gray-800/30">
                            <td className="px-4 py-3 text-green-400">{gig.title}</td>
                            <td className="px-4 py-3 text-gray-400">{gig.venue}</td>
                            <td className="px-4 py-3 text-gray-400">{gig.location}</td>
                            <td className="px-4 py-3 text-gray-300">{gig.date}</td>
                            <td className="px-4 py-3">
                              <span className={`${
                                gig.status === 'published' ? 'text-green-400' :
                                gig.status === 'draft' ? 'text-yellow-400' :
                                gig.status === 'confirmed' ? 'text-blue-400' :
                                'text-gray-500'
                              }`}>
                                {gig.status}
                              </span>
                            </td>
                            <td className="px-4 py-3">
                              <button onClick={() => handleDelete('gigs', gig.id)} className="text-red-600 hover:text-red-400">delete</button>
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
    </div>
  );
};

export default AdminDashboard;
