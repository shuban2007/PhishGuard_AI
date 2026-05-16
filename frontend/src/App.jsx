import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Landing from './pages/Landing';
import UrlScanner from './pages/UrlScanner';
import MessageScanner from './pages/MessageScanner';
import About from './pages/About';
import Contact from './pages/Contact';
import Terms from './pages/Terms';
import Privacy from './pages/Privacy';
import Layout from './components/Layout';
import ScrollToTop from './components/ScrollToTop';

function App() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <Layout>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/scan-url" element={<UrlScanner />} />
          <Route path="/scan-message" element={<MessageScanner />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/terms" element={<Terms />} />
          <Route path="/privacy" element={<Privacy />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  );
}

export default App;
