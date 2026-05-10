import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { BrowserRouter, Route, Routes } from 'react-router'
import Home from './Pages/Home.jsx'
import Signup from './Pages/Signup.jsx'
import Login from './Pages/Login.jsx'
import Profile from './Pages/Profile.jsx'
import Dashboard from './Pages/Dashboard.jsx'
import Navbar from './Components/navbar/Navbar.jsx'

createRoot(document.getElementById('root')).render(
  <BrowserRouter>
  <Navbar/>
  <Routes>
  <Route path='/' element={<Home/>}/>
  <Route path='/signup' element={<Signup/>}/>
  <Route path='/login' element={<Login/>}/>
  <Route path='/profile' element={<Profile/>}/>
  <Route path='/dashboard' element={<Dashboard/>}/>




  </Routes>
    </BrowserRouter>
)

