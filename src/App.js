import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import TranslatorSite from "./pages/TranslateSite";
import TranslatePage from "./pages/translatePage";

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<TranslatorSite />} />
        <Route path="/translate" element={<TranslatePage />} />
      </Routes>
    </Router>
  );
};

export default App;
