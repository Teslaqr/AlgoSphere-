import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import CreateContest from './pages/createContest';
import ContestRoom from './pages/createContest';
import Navbar from './components/Navbar';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-100">
        <Navbar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/create" element={<CreateContest />} />
          <Route path="/contest/:id" element={<ContestRoom />} />
        </Routes>
      </div>
    </Router>
  );
}
// export default function App() {
//   return (
//     <div className="min-h-screen bg-red-100 flex items-center justify-center">
//       <h1 className="text-4xl text-red-800">Tailwind Is Now Working!</h1>
//     </div>
//   );
// }

export default App;
