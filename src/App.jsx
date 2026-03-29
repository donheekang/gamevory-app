import { useState } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Header } from "./components/Header";
import { HomePage } from "./pages/HomePage";
import { CurationPage } from "./pages/CurationPage";
import { SalePage } from "./pages/SalePage";
import { RankingPage } from "./pages/RankingPage";
import { MyPage } from "./pages/MyPage";
import { GAMES } from "./data/games";
import { COLORS } from "./styles/theme";

export default function App() {
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <BrowserRouter>
      <div style={{ minHeight: "100vh", backgroundColor: COLORS.bg }}>
        <Header searchQuery={searchQuery} setSearchQuery={setSearchQuery} />

        <Routes>
          <Route path="/" element={<HomePage searchQuery={searchQuery} setSearchQuery={setSearchQuery} />} />
          <Route path="/curation" element={<CurationPage games={GAMES} />} />
          <Route path="/sale" element={<SalePage />} />
          <Route path="/ranking" element={<RankingPage />} />
          <Route path="/my" element={<MyPage />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}
