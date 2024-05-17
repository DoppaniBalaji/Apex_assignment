import React, { useState, useEffect, useRef } from 'react';
import { FaEdit, FaTrash } from 'react-icons/fa';

export default function Home() {
  // State variables for scenarios, selected scenario, and vehicles
  const [scenarios, setScenarios] = useState([]);
  const [selectedScenario, setSelectedScenario] = useState(null);
  const [vehicles, setVehicles] = useState([]);
  // const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [simulationRunning, setSimulationRunning] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editedVehicle, setEditedVehicle] = useState(null);

  useEffect(() => {
    fetch('https://apexplus-database.onrender.com/scenarios')
      .then(response => response.json())
      .then(data => {
        // Convert scenario IDs to integers
        const updatedScenarios = data.map(scenario => ({
          ...scenario,
          id: scenario.id.toString()
        }));
        setScenarios(updatedScenarios);
        setSelectedScenario(updatedScenarios[0]); // Select the first scenario by default
      })
      .catch(error => console.error('Error fetching scenarios:', error));
  }, []);

  // Fetch vehicles for the selected scenario when selectedScenario changes
  useEffect(() => {
    if (!selectedScenario) return; // Avoid fetching if no scenario is selected
    fetch(`https://apexplus-database.onrender.com/vehicles?scenarioId=${selectedScenario.id}`)
      .then(response => response.json())
      .then(data => setVehicles(data))
      .catch(error => console.error('Error fetching vehicles:', error));
  }, [selectedScenario]);

  const handleScenarioChange = (e) => {
    const scenarioId = e.target.value;
    const selected = scenarios.find(scenario => scenario.id === scenarioId);
    setSelectedScenario(selected);
  };

  // Function to delete a vehicle in the scenario
  const handleDelete = async (id) => {
    console.log('Deleting vehicle:', id);

    try {
      await fetch(`https://apexplus-database.onrender.com/vehicles/${id}`, {
        method: 'DELETE'
      });

      setVehicles(prevVehicles => prevVehicles.filter(vehicle => vehicle.id !== id));
      console.log('Vehicle deleted successfully');
    } catch (error) {
      console.error('Error deleting vehicle:', error);
    }
  };

  // Function to start simulation
  const startSimulation = () => {
    setSimulationRunning(true);
    // Stop simulation after the specified duration
    setTimeout(() => setSimulationRunning(false), selectedScenario.time * 1000);
  };

  // Function to stop simulation
  const stopSimulation = () => {
    setSimulationRunning(false);
  };

  // Function to generate a random color
  const getRandomColor = () => {
    return '#' + Math.floor(Math.random() * 16777215).toString(16);
  };

  // Canvas reference for drawing vehicles
  const canvasRef = useRef(null);

  // Effect for drawing vehicles on canvas and simulating their movement
  useEffect(() => {
    if (!canvasRef.current || !vehicles.length || !simulationRunning) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    // Function to draw grid on canvas
    const drawGrid = () => {
      const gridSpacingX = 100; // Spacing in x-axis
      const gridSpacingY = 100; // Spacing in y-axis
      const width = canvas.width;
      const height = canvas.height;

      ctx.clearRect(0, 0, width, height); // Clear canvas

      ctx.beginPath();
      // Draw horizontal lines
      for (let y = 0; y <= height; y += gridSpacingY) {
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
      }
      // Draw vertical lines
      for (let x = 0; x <= width; x += gridSpacingX) {
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
      }
      ctx.strokeStyle = 'green'; // Set grid color to yellow
      ctx.stroke();
      ctx.closePath();
    };

    // Function to draw vehicles on canvas
    const drawVehicles = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      drawGrid();
      vehicles.forEach(vehicle => {
        ctx.beginPath();
        const radius = 10;
        // Subtract vehicle.positionY from canvas.height to invert the Y-coordinate
        ctx.arc(vehicle.positionX, canvas.height - vehicle.positionY, radius, 0, Math.PI * 2);
        ctx.fillStyle = getRandomColor(); // Set unique color for each vehicle
        ctx.fill();
        ctx.closePath();
      });
    };

    // Initial drawing of vehicles
    drawVehicles();

    // Update vehicle positions every second
    const interval = setInterval(() => {
      vehicles.forEach(vehicle => {
        let speedX = 0;
        let speedY = 0;

        // Calculate speed based on direction
        switch (vehicle.direction) {
          case 'towards':
            speedX = vehicle.speed;
            break;
          case 'backwards':
            speedX = -vehicle.speed;
            break;
          case 'upwards':
            speedY = vehicle.speed;
            break;
          case 'downwards':
            speedY = -vehicle.speed;
            break;
          default:
            break;
        }

        // Update position
        vehicle.positionX += speedX;
        vehicle.positionY += speedY;
      });
      drawVehicles();
    }, 1000);

    // Clear interval on component unmount or when simulation is stopped
    return () => clearInterval(interval);
  }, [canvasRef, vehicles, selectedScenario, simulationRunning]);


  const handleEditVehicle = (vehicle) => {
    // setSelectedVehicle(vehicle);
    setEditedVehicle({ ...vehicle }); // Make a copy of the vehicle object to prevent direct mutation
    setShowEditModal(true);
  };

  const handleUpdateVehicle = () => {
    // Update vehicle details on the server
    fetch(`https://apexplus-database.onrender.com/vehicles/${editedVehicle.id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(editedVehicle)
    })
      .then(response => {
        if (!response.ok) {
          throw new Error('Failed to update vehicle');
        }
        // Update vehicle in the state
        setVehicles(prevVehicles => prevVehicles.map(vehicle => {
          if (vehicle.id === editedVehicle.id) {
            return editedVehicle;
          }
          return vehicle;
        }));
        // Close the modal after updating
        setShowEditModal(false);
        // Clear the edited vehicle state
        setEditedVehicle(null);
      })
      .catch(error => {
        console.error('Error updating vehicle:', error);
      });
  };

  // Render the component
  return (
    <div className="home">
      {/* Dropdown for selecting scenario */}
      <div className="dropdown">
        <label htmlFor="scenarioDropdown">Scenario </label>
        <br />
        <select
          id="scenarioDropdown"
          value={selectedScenario ? selectedScenario.id : ''}
          onChange={handleScenarioChange}
        >
          {scenarios.map(scenario => (
            <option key={scenario.id} value={scenario.id}>{scenario.name}</option>
          ))}
        </select>
      </div>
      {/* Table for displaying vehicles */}
      <div className="table-container">
        <table className="scenario-table">
          <thead>
            <tr>
              <th>Vehicle ID</th>
              <th>Vehicle Name</th>
              <th>Speed</th>
              <th>Position X</th>
              <th>Position Y</th>
              <th>Direction</th>
              <th>Edit</th>
              <th>Delete</th>
            </tr>
          </thead>
          <tbody>
            {vehicles.map(vehicle => (
              <tr key={vehicle.id}>
                <td>{vehicle.id}</td>
                <td>{vehicle.name}</td>
                <td>{vehicle.speed}</td>
                <td>{vehicle.positionX}</td>
                <td>{vehicle.positionY}</td>
                <td>{vehicle.direction}</td>
                <td><FaEdit onClick={() => handleEditVehicle(vehicle)} /></td>
                <td><FaTrash onClick={() => handleDelete(vehicle.id)} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {/* Simulation buttons */}
      <div className="sim_button-group">
        <button onClick={startSimulation}>Start Simulation</button>
        <button onClick={stopSimulation}>Stop Simulation</button>
      </div>
      {/* Canvas for simulation */}
      <div className="canvas-container">
        <canvas ref={canvasRef} width={1400} height={600}></canvas>
      </div>
      {showEditModal && (
        <div className="edit-modal">
          <h2>Edit Vehicle</h2>
          <label htmlFor="vehicleName">Vehicle Name:</label>
          <input
            type="text"
            id="vehicleName"
            value={editedVehicle.name}
            onChange={(e) => setEditedVehicle({ ...editedVehicle, name: e.target.value })}
          />
          <label htmlFor="vehicleSpeed">Speed:</label>
          <input
            type="number"
            id="vehicleSpeed"
            value={editedVehicle.speed}
            onChange={(e) => setEditedVehicle({ ...editedVehicle, speed: parseInt(e.target.value) })}
          />
          <label htmlFor="vehiclePositionX">Position X:</label>
          <input
            type="number"
            id="vehiclePositionX"
            value={editedVehicle.positionX}
            onChange={(e) => setEditedVehicle({ ...editedVehicle, positionX: parseInt(e.target.value) })}
          />
          <label htmlFor="vehiclePositionY">Position Y:</label>
          <input
            type="number"
            id="vehiclePositionY"
            value={editedVehicle.positionY}
            onChange={(e) => setEditedVehicle({ ...editedVehicle, positionY: parseInt(e.target.value) })}
          />
          <label htmlFor="vehicleDirection">Direction:</label>
          <select
            id="vehicleDirection"
            value={editedVehicle.direction}
            onChange={(e) => setEditedVehicle({ ...editedVehicle, direction: e.target.value })}
          >
            <option value="towards">Towards</option>
            <option value="backwards">Backwards</option>
            <option value="upwards">Upwards</option>
            <option value="downwards">Downwards</option>
          </select>
          <button onClick={handleUpdateVehicle}>Update</button>
          <button onClick={() => setShowEditModal(false)}>Cancel</button>
        </div>
      )}
    </div>
  );
}
