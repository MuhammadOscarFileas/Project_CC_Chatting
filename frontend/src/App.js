import Register from "./pages/registPage";
import {BrowserRouter, Routes, Route} from "react-router-dom";
import LoginPage from './pages/loginPage';
import ChatPage from './pages/chatPage';



function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route path="/register" element={<Register />} />
        <Route path="/chat/:contactId?" element={<ChatPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
