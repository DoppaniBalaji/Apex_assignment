import React from 'react';
import { Link } from 'react-router-dom';

function SideNav() {
  return (
    <div className="sidenav">
      <Link to="/">Home</Link>
      <Link to="/add-scenario">Add Scenario</Link>
      <Link to="/all-scenario">All Scenario</Link>
      <Link to="/add-vehicle">Add Vehicle</Link>
    </div>
  );
}

export default SideNav;
