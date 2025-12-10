import { useState } from 'react';
import { useGameStore } from '../stores/useGameStore';

export function Lobby() {
    const { createRoom, joinRoom, roomId, role, status, playerCount, isConnected } = useGameStore();
    const [joinId, setJoinId] = useState('');

    if (status === 'lobby') {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen bg-slate-950 text-white font-sans overflow-hidden relative selection:bg-cyan-500 selection:text-black">
                {/* Background Grid & Glows */}
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)]pointer-events-none" />
                <div className="absolute -top-[20%] -left-[10%] w-[50vw] h-[50vw] bg-cyan-500/10 rounded-full blur-[100px] pointer-events-none mix-blend-screen" />
                <div className="absolute -bottom-[20%] -right-[10%] w-[50vw] h-[50vw] bg-fuchsia-500/10 rounded-full blur-[100px] pointer-events-none mix-blend-screen" />

                {/* Main Content */}
                <div className="relative z-10 w-full max-w-3xl p-4">
                    <header className="mb-12 text-center">
                        <div className="inline-flex items-center gap-2 mb-4 px-3 py-1 bg-slate-900/50 rounded border border-slate-800 backdrop-blur-sm">
                            <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-cyan-400 shadow-[0_0_10px_#22d3ee]' : 'bg-red-500'} animate-pulse`} />
                            <span className="text-xs font-bold tracking-[0.2em] text-slate-400 uppercase">{isConnected ? 'System Online' : 'Offline'}</span>
                        </div>
                        <h1 className="text-6xl md:text-8xl font-black italic tracking-tighter uppercase text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-white to-fuchsia-400 drop-shadow-[0_0_15px_rgba(34,211,238,0.5)]">
                            Arena<br />Lobby
                        </h1>
                    </header>

                    <div className="bg-slate-900/80 backdrop-blur-xl border border-slate-800/50 p-8 md:p-12 rounded-3xl shadow-[0_0_50px_rgba(0,0,0,0.5)] relative overflow-hidden group">
                        {/* Scanning Line Effect */}
                        <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-cyan-500/50 to-transparent animate-[scan_4s_ease-in-out_infinite] pointer-events-none opacity-50" />

                        <div className="flex flex-col md:flex-row justify-between items-center mb-12 gap-8">
                            {/* Room Code Display */}
                            <div className="text-center md:text-left">
                                <p className="text-xs font-bold text-cyan-400 tracking-[0.2em] uppercase mb-2">Access Code</p>
                                <div className="text-6xl font-mono font-bold tracking-widest text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.3)]">
                                    {roomId}
                                </div>
                            </div>
                            {/* Player Count Badge */}
                            <div className="px-6 py-3 bg-slate-950 rounded-xl border border-slate-800 flex items-center gap-4">
                                <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Players</span>
                                <div className="flex gap-1">
                                    <div className={`w-3 h-8 -skew-x-12 ${playerCount >= 1 ? 'bg-cyan-400 shadow-[0_0_10px_#22d3ee]' : 'bg-slate-800'}`} />
                                    <div className={`w-3 h-8 -skew-x-12 ${playerCount >= 2 ? 'bg-fuchsia-400 shadow-[0_0_10px_#e879f9]' : 'bg-slate-800'}`} />
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4 mb-8">
                            {/* P1 Card */}
                            <div className="bg-gradient-to-br from-cyan-500/10 to-transparent border border-cyan-500/20 p-6 rounded-2xl relative overflow-hidden">
                                <div className="absolute top-0 right-0 p-2 opacity-20">
                                    <svg className="w-16 h-16 text-cyan-400" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z" /></svg>
                                </div>
                                <div className="text-xs font-bold text-cyan-400 uppercase tracking-widest mb-1">Host</div>
                                <div className="text-2xl font-bold text-white mb-2">{role === 'host' ? 'YOU' : 'OPPONENT'}</div>
                                <div className="inline-block px-2 py-0.5 bg-cyan-500/20 text-cyan-300 text-[10px] font-bold rounded uppercase border border-cyan-500/20">Ready</div>
                            </div>

                            {/* P2 Card */}
                            <div className={`bg-gradient-to-br from-fuchsia-500/10 to-transparent border ${playerCount === 2 ? 'border-fuchsia-500/20' : 'border-slate-800'} p-6 rounded-2xl relative overflow-hidden transition-all duration-300`}>
                                <div className="absolute top-0 right-0 p-2 opacity-20">
                                    <svg className={`w-16 h-16 ${playerCount === 2 ? 'text-fuchsia-400' : 'text-slate-700'}`} fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z" /></svg>
                                </div>
                                <div className={`text-xs font-bold uppercase tracking-widest mb-1 ${playerCount === 2 ? 'text-fuchsia-400' : 'text-slate-600'}`}>Guest</div>
                                <div className={`text-2xl font-bold mb-2 ${playerCount === 2 ? 'text-white' : 'text-slate-600'}`}>{playerCount === 2 ? (role === 'guest' ? 'YOU' : 'OPPONENT') : 'WAITING...'}</div>
                                <div className={`inline-block px-2 py-0.5 text-[10px] font-bold rounded uppercase border ${playerCount === 2 ? 'bg-fuchsia-500/20 text-fuchsia-300 border-fuchsia-500/20' : 'bg-slate-800 text-slate-600 border-slate-700'}`}>
                                    {playerCount === 2 ? 'Ready' : 'Connecting'}
                                </div>
                            </div>
                        </div>

                        <div className="text-center">
                            {playerCount === 1 ? (
                                <div className="text-slate-400 text-sm font-medium animate-pulse flex items-center justify-center gap-2">
                                    <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                                    <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                                    <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                                    <span className="tracking-widest uppercase ml-2 text-xs font-bold">Waiting for Player 2</span>
                                </div>
                            ) : (
                                <div className="text-green-400 text-lg font-bold tracking-widest uppercase animate-pulse drop-shadow-[0_0_5px_rgba(74,222,128,0.5)]">
                                    Starting Match Sequence...
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // LANDING SCREEN
    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-slate-950 text-white font-sans relative overflow-hidden selection:bg-cyan-500 selection:text-black">
            {/* Background Grid & Glows */}
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] pointer-events-none" />
            <div className="absolute top-[10%] left-[20%] w-[30vw] h-[30vw] bg-cyan-500/20 rounded-full blur-[120px] pointer-events-none mix-blend-screen animate-[pulse_4s_ease-in-out_infinite]" />
            <div className="absolute bottom-[10%] right-[20%] w-[30vw] h-[30vw] bg-violet-600/20 rounded-full blur-[120px] pointer-events-none mix-blend-screen animate-[pulse_4s_ease-in-out_infinite_reverse]" />

            <div className="relative z-10 w-full max-w-5xl px-4">
                <header className="flex justify-between items-end mb-16 border-b border-slate-800 pb-8 relative">
                    <div className="absolute bottom-0 left-0 w-32 h-[2px] bg-cyan-500 shadow-[0_0_10px_#22d3ee]" />
                    <div>
                        <h1 className="text-7xl md:text-9xl font-black italic tracking-tighter uppercase leading-[0.8]">
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-cyan-200 drop-shadow-[0_0_20px_rgba(34,211,238,0.3)]">Foos</span>
                            <br />
                            <span className="text-slate-800 text-stroke-1 text-stroke-white text-transparent bg-clip-text bg-gradient-to-r from-white to-slate-400 opacity-90">Ball</span>
                        </h1>
                    </div>
                    <div className="text-right hidden md:block">
                        <div className="text-[10px] font-bold uppercase tracking-[0.3em] text-slate-500 mb-2">Build v2.0</div>
                        <div className={`inline-flex items-center gap-2 px-3 py-1 bg-slate-900 rounded border ${isConnected ? 'border-green-500/30 text-green-400' : 'border-red-500/30 text-red-400'}`}>
                            <div className={`w-1.5 h-1.5 rounded-full ${isConnected ? 'bg-green-400 shadow-[0_0_5px_#4ade80]' : 'bg-red-400'} animate-pulse`} />
                            <span className="text-xs font-bold uppercase tracking-widest">{isConnected ? 'Online' : 'Offline'}</span>
                        </div>
                    </div>
                </header>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">
                    {/* Create Option */}
                    <div className="group relative">
                        <div className="absolute inset-0 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-3xl blur opacity-20 group-hover:opacity-60 transition duration-500" />
                        <button
                            onClick={createRoom}
                            disabled={!isConnected}
                            className="relative w-full h-[300px] bg-slate-900 border border-slate-800 hover:border-cyan-500/50 rounded-3xl p-8 text-left transition-all duration-300 hover:-translate-y-2 overflow-hidden disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0"
                        >
                            <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 group-hover:scale-110 transition-all duration-500">
                                <svg className="w-32 h-32 text-cyan-400" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z" /></svg>
                            </div>

                            <div className="h-full flex flex-col justify-between relative z-10">
                                <div className="text-6xl font-black italic text-slate-800 group-hover:text-slate-700 transition-colors">01</div>
                                <div>
                                    <h2 className="text-4xl font-black italic uppercase text-white mb-2 group-hover:text-cyan-400 transition-colors">Create</h2>
                                    <p className="text-sm font-medium text-slate-400 max-w-[200px] leading-relaxed">
                                        Initialize a new private match server and generate an access key.
                                    </p>
                                </div>
                            </div>
                        </button>
                    </div>

                    {/* Join Option */}
                    <div className="group relative">
                        <div className="absolute inset-0 bg-gradient-to-r from-fuchsia-500 to-purple-600 rounded-3xl blur opacity-20 group-hover:opacity-60 transition duration-500" />
                        <div className="relative w-full h-[300px] bg-slate-900 border border-slate-800 hover:border-fuchsia-500/50 rounded-3xl p-8 flex flex-col justify-between transition-all duration-300 hover:-translate-y-2 overflow-hidden">
                            <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 group-hover:scale-110 transition-all duration-500">
                                <svg className="w-32 h-32 text-fuchsia-400" viewBox="0 0 24 24" fill="currentColor"><path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z" /></svg>
                            </div>

                            <div className="flex justify-between items-start relative z-10">
                                <div className="text-6xl font-black italic text-slate-800 group-hover:text-slate-700 transition-colors">02</div>
                            </div>

                            <div className="relative z-10">
                                <h2 className="text-4xl font-black italic uppercase text-white mb-4 group-hover:text-fuchsia-400 transition-colors">Join</h2>
                                <div className="flex items-center gap-2 bg-slate-950 p-1.5 rounded-xl border border-slate-800 shadow-inner group-focus-within:border-fuchsia-500/50 transition-colors">
                                    <input
                                        type="text"
                                        placeholder="ENTER KEY"
                                        value={joinId}
                                        onChange={(e) => setJoinId(e.target.value.toUpperCase())}
                                        className="flex-1 bg-transparent px-4 py-3 text-lg font-mono font-bold text-white placeholder:text-slate-700 focus:outline-none uppercase w-full min-w-0"
                                    />
                                    <button
                                        onClick={() => joinRoom(joinId)}
                                        disabled={!joinId || !isConnected}
                                        className="bg-fuchsia-600 hover:bg-fuchsia-500 text-white px-6 py-3 rounded-lg font-bold uppercase tracking-wider disabled:opacity-50 disabled:grayscale transition-all active:scale-95 shadow-lg shadow-fuchsia-900/20"
                                    >
                                        Go
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
