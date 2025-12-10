import { useEffect } from 'react';
import { useGameStore } from './stores/useGameStore';
import { Lobby } from './components/Lobby';
import { Scene } from './components/Game/Scene';

function App() {
  const { connect, status } = useGameStore();

  useEffect(() => {
    connect();
  }, [connect]);

  if (status === 'playing') {
    return (
      <div className="w-full h-screen bg-gray-900">
        <Scene />
      </div>
    );
  }

  return <Lobby />;
}

export default App;
