// Import CSS
import './Searchbar.css';

// Import react hooks / components
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';


// Searchbar component, Includes:
//    - Country text field
//    - Automatically filtered search results
//    - Population distance dropdown
//    - Search button to 'go'
export default function Searchbar() {
    // Initialise use states
    const [ input, setInput ] = useState("");   // Text field input use state
    const [ countries, setCountries ] = useState([]);   // List of countries use state
    const [ filteredCountries, setFilteredCountries ] = useState([]);   // List of filtered countries use state
    const [ selectedDistance, setSelectedDistance ] = useState("");   // Current distance selected

    // Initialise navigate hook
    const navigate = useNavigate();

    // Initialise use effects
    useEffect(() => {       // Fetch country data use effect
        fetchCountries();
    }, []);

    useEffect(() => {       // Filter countries based on text field use effect
      filterCountries();
    }, [ input, countries ]);

    // Functions
    const fetchCountries = async () => {      // Fetch country data function
        try {
          const response = await fetch('http://4.237.58.241:3000/countries');
          const data = await response.json();
          setCountries(data);
        } catch (e) {
          console.log('Error fetching data:', e);
        }
      };

    const filterCountries = () => {         // Filter countries function
      if (input !== '') {
        const filtered = countries.filter(country =>
          country.toLowerCase().includes(input.toLowerCase())
        );
        setFilteredCountries(filtered);
      } else {
        setFilteredCountries([]);
      }
    };

    // Handle functions (eg button clicks, etc)
    const handleInputChange = (e) => {    // Handle changes to search bar text field
      setInput(e.target.value);
    };

    const handleResultClick = (result) => {   // Handle clicking a search result
      setInput(result);
      if (input === result) {
        setFilteredCountries([]);
      }
    }

    const handleKeyPress = (e) => {     // Handle pressing 'enter' key
      if (e.key === 'Enter' && filteredCountries.length > 0) {
          setInput(filteredCountries[0]);
          setFilteredCountries([]);
      }
    };

    const handleDropdown = (option) => {    // Handle dropdown selection
      setSelectedDistance(option);
    }

    const handleSearch = () => {
      if (input !== "" && selectedDistance === "") {
        navigate(`/volcanoes?country=${input}`);
      }
      else if (input !== "") {
        navigate(`/volcanoes?country=${input}&populatedWithin=${selectedDistance}`);
      }
    }

    // Main return
    return (
        <>
          {/* Searchbar div */}
          <div className="input-wrapper">
              <i className="fa-solid fa-magnifying-glass" id="search-icon" />
              <input 
                  placeholder="Search for country..." 
                  value={input} 
                  onChange={handleInputChange}
                  onKeyPress={handleKeyPress}
                />
          </div>
          <div className="bottom-row">
          {/* Population dropdown */}
          <select 
            className="population-dropdown" 
            value={selectedDistance} 
            onChange={(e) => handleDropdown(e.target.value)}>
              <option value="">Population Distance</option>
              <option value="5km">5km</option>
              <option value="10km">10km</option>
              <option value="30km">30km</option>
              <option value="100km">100km</option>
          </select>
          {/* Search button */}
          <button className="search-button" onClick={handleSearch}>Search</button>
          </div>

          {/* Searchbar results div */}
          {filteredCountries.length > 0 && (
          <div className="results-list">
              {filteredCountries.map((result, id) => {
                  return <div 
                    className="result" 
                    key={id} 
                    onClick={() => handleResultClick(result)}
                    
                    >{result}</div>
              }
              )}
          </div>
          )}
        </>
    );
}
