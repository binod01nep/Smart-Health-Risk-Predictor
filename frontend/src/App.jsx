// src/App.jsx  (or wherever your routes are)
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import LandingPage from './components/LandingPage';
import HealthRiskApp from './components/HealthRiskApp';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/predict" element={<HealthRiskApp />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;