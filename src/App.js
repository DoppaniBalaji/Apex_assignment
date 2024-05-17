import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';
import Home from './components/Home';
import AddScenario from './components/Add_Scenario';
import AllScenario from './components/All_Scenario';
import AddVehicle from './components/Add_Vehicle';
import SideNav from './components/Side_Nav';

function App() {
  return (
    <Router>
      <div className="App">
        <SideNav />
        <div className="content">
          <Routes>
            <Route path="/" exact element={<Home />} />
            <Route path="/add-scenario" element={<AddScenario />} />
            <Route path="/all-scenario" element={<AllScenario />} />
            <Route path="/add-vehicle" element={<AddVehicle />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;
