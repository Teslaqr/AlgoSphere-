//App.jsx
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import CreateContest from './pages/createContest';
import ContestPage from './pages/contestPage';



import Navbar from './components/Navbar';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-100">
        <Navbar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/create" element={<CreateContest />} />
          <Route path="/contest/:id" element={<ContestPage />} /> 
        </Routes>
      </div>
    </Router>
  );
}

export default App;
