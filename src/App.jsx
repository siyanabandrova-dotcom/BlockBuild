import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./Home";
import Workspace from "./Workspace";
import Toolbar from "./Toolbar";
import DocsPage from "./DocsPage";


export default function App() {
  return (
    <Router>

        <Toolbar/>

        <Routes>
        
        <Route path="/" element={<Home />} />
        
        <Route path="/workspace" element={<Workspace />} />
        
        </Routes>
    </Router>
  );
}
