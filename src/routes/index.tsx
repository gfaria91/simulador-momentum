import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import SimuladorPage from '../modules/simulador/SimuladorPage'

const AppRoutes = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<SimuladorPage />} />
      </Routes>
    </Router>
  )
}

export default AppRoutes
