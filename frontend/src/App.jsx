import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { LayoutBuilder, Navbar, Footer } from './components';
import './App.css';

function App() {
  return (
    <BrowserRouter>
      <div className="app">
        <Navbar />
        <main className="main-content">
          <Routes>
            <Route path="/" element={<LayoutBuilder />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </BrowserRouter>
  );
}

export default App;
