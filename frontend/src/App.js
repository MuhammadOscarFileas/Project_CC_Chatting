import Register from "./pages/registPage";
import {BrowserRouter, Routes, Route} from "react-router-dom";
import LoginPage from './pages/loginPage';


function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route path="/register" element={<Register />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
