import { BrowserRouter, Routes, Route } from "react-router-dom";
import AnimeItem from "./Components/AnimeItem";
import Homepage from "./Components/Homepage";
import Gallery from "./Components/Gallery";
import { useSmoothScroll } from "./utils/useSmoothScroll";

function SmoothScrollManager() {
  useSmoothScroll();
  return null;
}

function App() {
  return (
    <BrowserRouter>
      <SmoothScrollManager />
      <Routes>
        <Route path="/" element={<Homepage />} />
        <Route path="/anime/:id" element={<AnimeItem />} />
        <Route path="/character/:id" element={<Gallery />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
