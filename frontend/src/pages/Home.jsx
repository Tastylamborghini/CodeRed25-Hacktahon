import {BrowserRouter, Routes, Route} from "react-router-dom";
import App from "./App";
import Home from "./pages/Home";
import Dashboard from "./pages/Dashboard";

function Main() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path = "/" element={<App />}>
                <Route index element = {<Home />} />
                <Route path = "dashboard" element={<Dashboard />} />
                </Route>
            </Routes>
        </BrowserRouter>
    );
}

export default Main;