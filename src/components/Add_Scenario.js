import React, { useState } from 'react';

export default function Add_Scenario() {
  const [scenarioName, setScenarioName] = useState('');
  const [scenarioTime, setScenarioTime] = useState('');

  const handleAdd = () => {
    // Prepare the data to be sent
    const data = {
      name: scenarioName,
      time: scenarioTime
    };

    // Send a POST request to the JSON server
    fetch('https://apexplus-database.onrender.com/scenarios', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    })
      .then(response => {
        if (!response.ok) {
          throw new Error('Failed to add scenario');
        }
        return response.json();
      })
      .then(data => {
        console.log('Scenario added successfully:', data);
        alert('Scenario added successfully');
        handleReset();
      })
      .catch(error => {
        console.error('Error adding scenario:', error);
      });
  };


  const handleReset = () => {
    setScenarioName('');
    setScenarioTime('');
  };

  return (
    <div className="add_scenario">
      <h3>Scenario / add</h3>
      <h1>Add Scenario</h1>
      <div className="form">
        <div className="input-group">
          <label htmlFor="scenarioName">Scenario Name</label>
          <input
            type="text"
            id="scenarioName"
            name="scenarioName"
            value={scenarioName}
            onChange={(e) => setScenarioName(e.target.value)}
          />
        </div>
        <div className="input-group">
          <label htmlFor="scenarioTime">Scenario Time (seconds)</label>
          <input
            type="number"
            id="scenarioTime"
            name="scenarioTime"
            value={scenarioTime}
            onChange={(e) => setScenarioTime(e.target.value)}
          />
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
