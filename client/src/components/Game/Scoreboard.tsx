import { useGameStore } from '../../stores/useGameStore';

export function Scoreboard() {
    const { score, status } = useGameStore();

    // Only show during gameplay
    if (status !== 'playing') return null;

    return (
        <div className="absolute top-8 left-1/2 -translate-x-1/2 flex items-center gap-8 bg-slate-900/80 backdrop-blur-md px-8 py-4 rounded-2xl border border-slate-700 shadow-xl pointer-events-none z-50">
            {/* Home Score (Red/Cyan) */}
            <div className="text-center">
                <div className="text-[10px] font-bold uppercase tracking-widest text-cyan-400 mb-1">Home</div>
                <div className="text-5xl font-black italic text-white drop-shadow-[0_0_10px_rgba(34,211,238,0.5)]">
                    {score.home}
                </div>
            </div>

            <div className="text-slate-500 font-black text-2xl italic">VS</div>

            {/* Away Score (Blue/Fuchsia) */}
            <div className="text-center">
                <div className="text-[10px] font-bold uppercase tracking-widest text-fuchsia-400 mb-1">Away</div>
                <div className="text-5xl font-black italic text-white drop-shadow-[0_0_10px_rgba(232,121,249,0.5)]">
                    {score.away}
                </div>
            </div>
        </div>
    );
}
