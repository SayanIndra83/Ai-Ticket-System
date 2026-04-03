import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import CheckAuth from "./components/check-auth.jsx"
import Tickets from './pages/tickets.jsx'
import TicketDetailsPage from './pages/ticket.jsx'
import Login from './pages/login.jsx'
import Signup from './pages/signup.jsx'
import Admin from './pages/admin.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
    <Routes>
      <Route
      path='/'
      element={
        <CheckAuth protectedRoutes={true}>
          <Tickets/>
          </CheckAuth>
      }
      />
      <Route
      path='/tickets/:id'
      element={
        <CheckAuth protectedRoutes={true}>
          <TicketDetailsPage/>
          </CheckAuth>
      }
      />
      <Route
      path='/login'
      element={
        <CheckAuth protectedRoutes={false}>
          <Login/>
          </CheckAuth>
      }
      />
      <Route
      path='/signup'
      element={
        <CheckAuth protectedRoutes={false}>
          <Signup/>
          </CheckAuth>
      }
      />
      <Route
      path='/admin'
      element={
        <CheckAuth protectedRoutes={true}>
          <Admin/>
          </CheckAuth>
      }
      />
    </Routes>
    </BrowserRouter>
  </StrictMode>,
)
