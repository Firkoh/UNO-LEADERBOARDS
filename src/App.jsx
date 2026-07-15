import reactLogo from './assets/react.svg'
import viteLogo from './assets/vite.svg'
import heroImg from './assets/hero.png'
import Header from '../src/components/Header'
import Count from '../src/components/Count'
import Leaderboard from '../src/components/Leaderboard'
import './App.css'

function App() {
  return (
    <>
      <Header />
      <Count />
      <Leaderboard />
    </>
  );
};

export default App
