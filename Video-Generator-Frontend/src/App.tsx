import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Home } from './pages/Home';
import { Workspace } from './pages/Workspace';
import { GoogleOAuthProvider } from '@react-oauth/google';



function App() {
  return (
    <GoogleOAuthProvider clientId="820104091650-lbd3bagdu2hiq5hhithtvttba3m7bldg.apps.googleusercontent.com">
      <Router>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/maven" element={<Workspace />} />
        </Routes>
      </Router>
    </GoogleOAuthProvider>
  );
}

export default App;