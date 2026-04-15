import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/layout/Layout';
import AdminPag from './pages/AdminPag';
import RecepPag from './pages/RecepPag';
import UsuarioPag from './pages/UsuarioPag';

function App() {
  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<AdminPag />} />
          <Route path="/admin" element={<AdminPag />} />
          <Route path="/recepcionista" element={<RecepPag />} />
          <Route path="/usuario" element={<UsuarioPag />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  );
}

export default App;