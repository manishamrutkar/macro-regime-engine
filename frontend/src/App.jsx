import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { RegimeProvider } from './context/RegimeContext';
import Navbar      from './components/layout/Navbar';
import Sidebar     from './components/layout/Sidebar';
import Dashboard   from './pages/Dashboard';
import Chat        from './pages/Chat';
import Portfolio   from './pages/Portfolio';
import Forecast    from './pages/Forecast';
import Research    from './pages/Research';
import Settings    from './pages/Settings';

export default function App() {
  return (
    <BrowserRouter>
      <RegimeProvider>
        <div className="app-shell">
          <Navbar />
          <div className="app-body">
            <Sidebar />
            <main className="main-content">
              <Routes>
                <Route path="/"          element={<Dashboard />} />
                <Route path="/chat"      element={<Chat />}      />
                <Route path="/portfolio" element={<Portfolio />} />
                <Route path="/forecast"  element={<Forecast />}  />
                <Route path="/research"  element={<Research />}  />
                <Route path="/settings"  element={<Settings />}  />
                <Route path="*"          element={<Dashboard />} />
              </Routes>
            </main>
          </div>
        </div>
      </RegimeProvider>
    </BrowserRouter>
  );
}
