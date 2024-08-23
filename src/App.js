import { BrowserRouter, Routes, Route } from "react-router-dom";
// import Popular from "./Components/Popular";
// import { useGlobalContext } from "./context/global";
import AnimeItem from "./Components/AnimeItem";
import Homepage from "./Components/Homepage";
// import Airing from "./Components/Airing";
// import Upcoming from "./Components/Upcoming";
import Gallery from "./Components/Gallery";

function App() {


  return (
    <BrowserRouter>
    <Routes>
      <Route path="/" element={<Homepage />} />
      <Route path="/anime/:id" element={<AnimeItem />} />
      <Route path="/character/:id" element={<Gallery />} />
    </Routes>
    </BrowserRouter>
  );
}

export default App;
