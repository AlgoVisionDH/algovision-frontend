import './App.css'
import {AuthProvider} from "./contexts/AuthContext.jsx";
import {BrowserRouter, Route, Routes} from "react-router-dom";
import NavBar from "./components/NavBar/NavBar.jsx";

function Home() {
    return <h1>메인 페이지</h1>
}

export default function App() {
    return (
        <AuthProvider>
            <BrowserRouter>
                <NavBar/>
                <Routes>
                    <Route path="/" element={<Home/>}/>
                    <Route path="/login" element={<Login/>}/>
                </Routes>
            </BrowserRouter>
        </AuthProvider>
    )
}