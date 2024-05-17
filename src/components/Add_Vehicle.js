import React, { useState, useEffect } from 'react';

export default function Add_Vehicle() {
  const [scenarioOptions, setScenarioOptions] = useState([]);
  const [scenario, setScenario] = useState('');
  const [vehicleName, setVehicleName] = useState('');
  const [speed, setSpeed] = useState('');
  const [positionX, setPositionX] = useState('');
  const [positionY, setPositionY] = useState('');
  const [direction, setDirection] = useState('');

  useEffect(() => {
    // Fetch scenario list from the server
    fetch('https://apexplus-database.onrender.com/scenarios')
      .then(response => {
        if (!response.ok) {
          throw new Error('Failed to fetch scenarios');
        }
        return response.json();
      })
      .then(data => {
        setScenarioOptions(data);
      })
      .catch(error => {
        console.error('Error fetching scenarios:', error);
      });
  }, []);

  const handleAdd = () => {
    // Validate position X and Y
    const x = parseInt(positionX);
    const y = parseInt(positionY);
    if (isNaN(x) || isNaN(y) || x < 0 || x > 1300 || y < 0 || y > 600) {
      alert('Position X and Y must be between the range 0-1300 and 0-600 respectively');
      return;
    }
    const speedInt = parseInt(speed);

    // Prepare vehicle data
    const vehicleData = {
      scenarioId: scenario,
      name: vehicleName,
      speed: speedInt,
      positionX: x,
      positionY: y,
      direction
    };

    // Send vehicle data to the server
    fetch('https://apexplus-database.onrender.com/vehicles', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(vehicleData)
    })
      .then(response => {
        if (!response.ok) {
          throw new Error('Failed to add vehicle');
        }
        // Vehicle added successfully
        alert('Vehicle added successfully');
        handleReset();
      })
      .catch(error => {
        console.error('Error adding vehicle:', error);
        alert('Failed to add vehicle');
      });
  };

  const handleReset = () => {
    setScenario('');
    setVehicleName('');
    setSpeed('');
    setPositionX('');
    setPositionY('');
    setDirection('');
  };

  return (
    <div className="add_vehicle">
      <h3>Add Vehicle</h3>
      <div className="add-vehicle-form">
        <div className="av-input-row">
          <div className="av-input-group">
            <label htmlFor="scenario">Scenario:</label>
            <select
              id="scenario"
              value={scenario}
              onChange={(e) => setScenario(e.target.value)}
            >
              <option value="">Select Scenario</option>
              {scenarioOptions.map(option => (
                <option key={option.id} value={option.id}>{option.name}</option>
              ))}
            </select>
          </div>
          <div className="av-input-group">
            <label htmlFor="vehicleName">Vehicle Name:</label>
            <input
              type="text"
              id="vehicleName"
              value={vehicleName}
              onChange={(e) => setVehicleName(e.target.value)}
            />
          </div>
          <div className="av-input-group">
            <label htmlFor="speed">Speed:</label>
            <input
              type="text"
              id="speed"
              value={speed}
              onChange={(e) => setSpeed(e.target.value)}
            />
          </div>
        </div>
        <div className="av-input-row">
          <div className="av-input-group">
            <label htmlFor="positionX">Position X:</label>
            <input
              type="text"
              id="positionX"
              value={positionX}
              onChange={(e) => setPositionX(e.target.value)}
            />
          </div>
          <div className="av-input-group">
            <label htmlFor="positionY">Position Y:</label>
            <input
              type="text"
              id="positionY"
              value={positionY}
              onChange={(e) => setPositionY(e.target.value)}
            />
          </div>
          <div className="av-input-group">
            <label htmlFor="direction">Direction:</label>
            <select
              id="direction"
              value={direction}
              onChange={(e) => setDirection(e.target.value)}
            >
              <option value="">Select Direction</option>
              <option value="towards">Towards</option>
              <option value="backwards">Backwards</option>
              <option value="upwards">Upwards</option>
              <option value="downwards">Downwards</option>
            </select>
          </div>
        </div>
      </div>
      <div className="button-group">
        <button type="button" onClick={handleAdd}>Add</button>
        <button type="button" onClick={handleReset}>Reset</button>
        <button onClick={() => window.history.back()}>Go Back</button>
      </div>
    </div>
  );
}
