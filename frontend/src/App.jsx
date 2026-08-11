import { BrowserRouter, Routes, Route } from "react-router-dom";
import HomePage from "./pages/HomePage";
import OnlineGame from "./pages/OnlineGame";
import OfflineSetup from "./pages/OfflineSetup";
import OfflineGame from "./pages/OfflineGame";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/online" element={<OnlineGame />} />
        <Route path="/online/room/:roomId" element={<OnlineGame />} />
        <Route path="/offline" element={<OfflineSetup />} />
        <Route path="/offline/game" element={<OfflineGame />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
