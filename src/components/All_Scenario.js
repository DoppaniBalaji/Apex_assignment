import React, { useState, useEffect } from 'react';
import { FaPlus, FaEdit, FaTrash } from 'react-icons/fa';
import { Link, useNavigate } from 'react-router-dom';

export default function All_Scenario() {
  const [scenarios, setScenarios] = useState([]);
  const [editedScenario, setEditedScenario] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Fetch scenario data from the JSON server endpoint
    fetch('https://apexplus-database.onrender.com/scenarios')
      .then(response => {
        if (!response.ok) {
          throw new Error('Failed to fetch scenarios');
        }
        return response.json();
      })
      .then(data => {
        // Fetch vehicle counts for each scenario
        Promise.all(data.map(scenario => {
          return fetch(`https://apexplus-database.onrender.com/vehicles?scenarioId=${scenario.id}`)
            .then(response => response.json())
            .then(vehicles => ({ ...scenario, vehicleCount: vehicles.length }));
        }))
          .then(scenariosWithCounts => {
            setScenarios(scenariosWithCounts);
          })
          .catch(error => {
            console.error('Error fetching vehicles:', error);
          });
      })
      .catch(error => {
        console.error('Error fetching scenarios:', error);
      });
  }, []); // Empty dependency array to run effect only once

  const handleEditScenario = (id) => {
    const scenarioToEdit = scenarios.find(scenario => scenario.id === id);
    setEditedScenario(scenarioToEdit);
    setShowEditModal(true);
  };

  const handleUpdateScenario = () => {
    // Update the scenario on the JSON server
    fetch(`https://apexplus-database.onrender.com/scenarios/${editedScenario.id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(editedScenario)
    })
      .then(response => {
        if (!response.ok) {
          throw new Error('Failed to update scenario');
        }
        // Update scenario in the state
        setScenarios(prevScenarios => prevScenarios.map(scenario => {
          if (scenario.id === editedScenario.id) {
            return editedScenario;
          }
          return scenario;
        }));
        // Close the modal after updating
        setShowEditModal(false);
        // Clear the edited scenario state
        setEditedScenario(null);
      })
      .catch(error => {
        console.error('Error updating scenario:', error);
      });
  };

  const handleDeleteScenario = async (id) => {
    console.log('Deleting Scenario with ID:', id);

    try {
      // First, fetch the vehicles associated with the scenario
      const response = await fetch(`https://apexplus-database.onrender.com/vehicles?scenarioId=${id}`);
      if (!response.ok) {
        throw new Error('Failed to fetch associated vehicles');
      }
      const vehicles = await response.json();

      // Delete each vehicle associated with the scenario
      await Promise.all(vehicles.map(async vehicle => {
        await fetch(`https://apexplus-database.onrender.com/vehicles/${vehicle.id}`, {
          method: 'DELETE'
        });
      }));

      // Delete the scenario itself
      await fetch(`https://apexplus-database.onrender.com/scenarios/${id}`, {
        method: 'DELETE'
      });

      // Update the state to remove the deleted scenario
      setScenarios(prevScenarios => prevScenarios.filter(scenario => scenario.id !== id));

      console.log('Scenario and associated vehicles deleted successfully');
    } catch (error) {
      console.error('Error deleting scenario:', error);
    }
  };

  const handleAddVehicle = () => {
    navigate('/add-vehicle');
  };

  const handleDeleteAll = async () => {
    console.log('Deleting All Scenarios');

    try {
      // Fetch all vehicles
      const response = await fetch('https://apexplus-database.onrender.com/vehicles');
      if (!response.ok) {
        throw new Error('Failed to fetch vehicles');
      }
      const vehicles = await response.json();

      // Delete each vehicle
      await Promise.all(vehicles.map(async vehicle => {
        await fetch(`https://apexplus-database.onrender.com/${vehicle.id}`, {
          method: 'DELETE'
        });
      }));

      // Fetch all scenarios
      const scenariosResponse = await fetch('https://apexplus-database.onrender.com/scenarios');
      if (!scenariosResponse.ok) {
        throw new Error('Failed to fetch scenarios');
      }
      const scenariosData = await scenariosResponse.json();

      // Delete each scenario
      await Promise.all(scenariosData.map(async scenario => {
        await fetch(`https://apexplus-database.onrender.com/${scenario.id}`, {
          method: 'DELETE'
        });
      }));

      // Update state to reflect deletion
      setScenarios([]);

      console.log('All scenarios and associated vehicles deleted successfully');
    } catch (error) {
      console.error('Error deleting all scenarios:', error);
    }
  };

  return (
    <div className="all_scenario">
      <div className="header">
        <h1>All Scenario</h1>
        <div className="button-group">
          <button onClick={() => navigate('/add-scenario')}>New Scenario</button>
          <button onClick={handleAddVehicle}>Add Vehicle</button>
          <button onClick={handleDeleteAll}>Delete All</button>
        </div>
      </div>
      <div className="table-container">
        <table className="scenario-table">
          <thead>
            <tr>
              <th>Scenario ID</th>
              <th>Scenario Name</th>
              <th>Scenario Time</th>
              <th>Number of Vehicles</th>
              <th>Add Vehicle</th>
              <th>Edit</th>
              <th>Delete</th>
            </tr>
          </thead>
          <tbody>
            {scenarios.map(scenario => (
              <tr key={scenario.id}>
                <td>{scenario.id}</td>
                <td>{scenario.name}</td>
                <td>{scenario.time}</td>
                <td>{scenario.vehicleCount}</td>
                <td>
                  <Link to="/add-vehicle">
                    <FaPlus />
                  </Link>
                </td>
                <td>
                  <FaEdit onClick={() => handleEditScenario(scenario.id)} />
                </td>
                <td>
                  <FaTrash onClick={() => handleDeleteScenario(scenario.id)} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {showEditModal && (
        <div className="edit-modal">
          <h2>Edit Scenario</h2>
          <label htmlFor="scenarioName">Scenario Name:</label>
          <input
            type="text"
            id="scenarioName"
            value={editedScenario.name}
            onChange={(e) => setEditedScenario({ ...editedScenario, name: e.target.value })}
          />
          <label htmlFor="scenarioTime">Scenario Time:</label>
          <input
            type="text"
            id="scenarioTime"
            value={editedScenario.time}
            onChange={(e) => setEditedScenario({ ...editedScenario, time: e.target.value })}
          />
          <button onClick={handleUpdateScenario}>Update</button>
          <button onClick={() => setShowEditModal(false)}>Cancel</button>
        </div>
      )}
    </div>
  );
}
