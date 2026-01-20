
import React, { useState } from 'react';
import { AppView, Artist } from '../types';

interface ArtistRankingProps {
  navigate: (view: AppView) => void;
}

const APPLICANTS: Artist[] = [
  { id: '1', name: 'The Midnight Echo', genre: 'Indie Rock', rating: 4.9, type: '4 piece band', avgDraw: '250+', image: 'https://picsum.photos/seed/art1/200/200' },
  { id: '2', name: 'Luna Soul', genre: 'R&B / Neo-Soul', rating: 4.7, type: 'Soloist', avgDraw: '180+', image: 'https://picsum.photos/seed/art2/200/200' },
  { id: '3', name: 'Velvet Undergrounds', genre: 'Alternative', rating: 4.5, type: '3 piece band', avgDraw: '200+', image: 'https://picsum.photos/seed/art3/200/200' },
  { id: '4', name: 'Neon Pulse', genre: 'Synth Wave', rating: 4.2, type: 'Duo', avgDraw: '150+', image: 'https://picsum.photos/seed/art4/200/200' },
  { id: '5', name: 'The Backbeats', genre: 'Classic Rock', rating: 4.4, type: '5 piece band', avgDraw: '300+', image: 'https://picsum.photos/seed/art5/200/200' },
];

const ArtistRanking: React.FC<ArtistRankingProps> = ({ navigate }) => {
  const [rankings, setRankings] = useState<string[]>(['1', '2']); // IDs of ranked artists
  const [isSequenceActive, setIsSequenceActive] = useState(false);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

  const toggleRank = (id: string) => {
    if (rankings.includes(id)) {
      setRankings(rankings.filter(rid => rid !== id));
    } else if (rankings.length < 5) {
      setRankings([...rankings, id]);
    }
  };

  const startSequence = () => {
    setIsSequenceActive(true);
  };

  // Drag and Drop Handlers
  const onDragStart = (e: React.DragEvent, index: number) => {
    setDraggedIndex(index);
    // Standard effect for dragging
    e.dataTransfer.effectAllowed = 'move';
    // Transparent ghost image if needed, but we'll use CSS scale
  };

  const onDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault(); // Necessary to allow dropping
  };

  const onDragEnter = (index: number) => {
    if (draggedIndex === null || draggedIndex === index) return;

    // Live reorder
    const newRankings = [...rankings];
    const itemToMove = newRankings[draggedIndex];
    newRankings.splice(draggedIndex, 1);
    newRankings.splice(index, 0, itemToMove);
    
    setRankings(newRankings);
    setDraggedIndex(index);
  };

  const onDragEnd = () => {
    setDraggedIndex(null);
  };

  return (
    <div className="bg-background-dark min-h-screen pb-40 flex flex-col">
      <header className="sticky top-0 z-50 bg-background-dark/90 backdrop-blur-md border-b border-white/5 flex items-center p-4 pt-10">
        <button onClick={() => navigate(AppView.VENUE_DASHBOARD)} className="p-2 active:opacity-50 transition-opacity">
          <span className="material-symbols-outlined text-slate-400">arrow_back_ios</span>
        </button>
        <div className="flex-1 ml-2">
          <h2 className="text-lg font-black tracking-tight text-white">Manage Applications</h2>
          <p className="text-[10px] font-black uppercase tracking-widest text-primary">Neon Nights • Oct 24</p>
        </div>
      </header>

      {isSequenceActive && (
        <div className="bg-primary/10 border-b border-primary/20 p-5 space-y-4 animate-in slide-in-from-top duration-500">
          <div className="flex justify-between items-center">
            <p className="text-primary font-black text-[10px] uppercase tracking-widest">Booking Sequence Active</p>
            <div className="flex gap-1">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className={`size-1.5 rounded-full ${i < rankings.length ? (i === 0 ? 'bg-primary scale-125' : 'bg-primary/40') : 'bg-white/10'}`}></div>
              ))}
            </div>
          </div>
          <div className="flex items-center gap-3 bg-surface-dark/50 p-3 rounded-2xl border border-primary/10">
            <span className="material-symbols-outlined text-primary text-xl animate-pulse">hourglass_top</span>
            <div className="flex-1">
              <p className="text-xs text-slate-300">Awaiting <b>{APPLICANTS.find(a => a.id === rankings[0])?.name}</b></p>
              <p className="text-[9px] text-slate-500 uppercase font-black mt-0.5 tracking-tighter">Auto-advances to Rank 2 in 14h 22m</p>
            </div>
          </div>
        </div>
      )}

      <main className="flex-1 px-5 py-6 space-y-8 overflow-y-auto hide-scrollbar">
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-white text-xl font-black tracking-tighter">Ranking (Drag to reorder)</h3>
            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{rankings.length}/5 Selected</span>
          </div>

          <div className="space-y-3">
            {rankings.map((rid, idx) => {
              const artist = APPLICANTS.find(a => a.id === rid)!;
              return (
                <div 
                  key={rid} 
                  draggable={!isSequenceActive}
                  onDragStart={(e) => onDragStart(e, idx)}
                  onDragOver={(e) => onDragOver(e, idx)}
                  onDragEnter={() => onDragEnter(idx)}
                  onDragEnd={onDragEnd}
                  className={`bg-surface-dark border rounded-3xl p-4 flex items-center gap-4 relative overflow-hidden group transition-all duration-200 cursor-grab active:cursor-grabbing ${
                    draggedIndex === idx ? 'opacity-40 scale-95 border-primary shadow-2xl' : 'border-primary/30'
                  } ${isSequenceActive ? 'cursor-default opacity-90' : ''}`}
                >
                  <div className={`absolute top-0 left-0 w-1.5 h-full ${idx === 0 ? 'bg-primary' : 'bg-slate-700'}`}></div>
                  
                  {/* Drag Handle Icon */}
                  {!isSequenceActive && (
                    <div className="text-slate-700 group-hover:text-slate-500 transition-colors">
                      <span className="material-symbols-outlined select-none">drag_indicator</span>
                    </div>
                  )}

                  <div className="size-14 rounded-2xl bg-cover bg-center shrink-0 border border-white/5" style={{ backgroundImage: `url(${artist.image})` }}></div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                       <span className="text-[10px] font-black text-primary uppercase">Rank {idx + 1}</span>
                       <span className={`text-[8px] font-black uppercase px-1.5 py-0.5 rounded ${idx === 0 ? 'bg-primary text-white' : 'bg-slate-800 text-slate-400'}`}>
                        {idx === 0 ? 'ACTIVE' : 'ON DECK'}
                       </span>
                    </div>
                    <h4 className="text-white font-black text-base truncate">{artist.name}</h4>
                  </div>
                  
                  {!isSequenceActive && (
                    <button 
                      onClick={(e) => { e.stopPropagation(); toggleRank(rid); }} 
                      className="size-10 rounded-full bg-slate-800/50 flex items-center justify-center text-slate-500 hover:text-red-500 active:scale-90 transition-all shrink-0"
                    >
                      <span className="material-symbols-outlined text-lg">close</span>
                    </button>
                  )}
                </div>
              );
            })}
            
            {rankings.length === 0 && (
              <div className="py-12 border-2 border-dashed border-white/5 rounded-[2.5rem] flex flex-col items-center justify-center text-slate-600 gap-3">
                <span className="material-symbols-outlined text-4xl">format_list_numbered</span>
                <p className="text-sm font-black uppercase tracking-widest">No artists ranked yet</p>
              </div>
            )}
          </div>
        </section>

        <section className="space-y-4">
          <h3 className="text-xs font-black uppercase tracking-[0.3em] text-slate-500 ml-2">Available Applicants</h3>
          <div className="space-y-3">
            {APPLICANTS.filter(a => !rankings.includes(a.id)).map((artist) => (
              <div 
                key={artist.id} 
                className={`bg-surface-dark/50 border border-white/5 rounded-3xl p-4 flex items-center gap-4 active:bg-surface-dark transition-colors cursor-pointer ${rankings.length >= 5 ? 'opacity-50 grayscale' : ''}`}
                onClick={() => toggleRank(artist.id)}
              >
                <div className="size-14 rounded-2xl bg-cover bg-center shrink-0 grayscale opacity-60" style={{ backgroundImage: `url(${artist.image})` }}></div>
                <div className="flex-1">
                   <h4 className="text-white/80 font-bold text-base">{artist.name}</h4>
                   <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest">{artist.genre} • {artist.type}</p>
                </div>
                <button 
                  disabled={rankings.length >= 5}
                  className="size-10 rounded-2xl bg-primary/10 text-primary flex items-center justify-center active:scale-90 transition-transform disabled:opacity-0"
                >
                  <span className="material-symbols-outlined">add</span>
                </button>
              </div>
            ))}
          </div>
        </section>
      </main>

      <footer className="fixed bottom-0 left-0 right-0 p-6 pb-12 bg-background-dark/90 backdrop-blur-xl border-t border-white/5">
        <div className="max-w-md mx-auto space-y-4">
          <div className="flex justify-between items-center px-2">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-slate-500 text-sm">auto_mode</span>
              <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Auto-Advance: 24h</span>
            </div>
            <button className="text-primary text-[10px] font-black uppercase tracking-widest">Settings</button>
          </div>
          <button 
            onClick={startSequence}
            disabled={rankings.length === 0 || isSequenceActive}
            className={`w-full h-18 rounded-[1.75rem] font-black text-xl flex items-center justify-center gap-3 transition-all ${
              isSequenceActive 
                ? 'bg-slate-800 text-slate-500 cursor-not-allowed' 
                : 'bg-primary text-white shadow-2xl shadow-primary/40 active:scale-95'
            }`}
          >
            {isSequenceActive ? 'Sequence Live' : 'Start Booking Sequence'}
            {!isSequenceActive && <span className="material-symbols-outlined text-2xl">bolt</span>}
          </button>
        </div>
      </footer>
    </div>
  );
};

export default ArtistRanking;
