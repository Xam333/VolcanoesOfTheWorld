import './Volcano.css'; // Import CSS

// Import react components
import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';

// Import external components
import { Map , Marker} from 'pigeon-maps';

// Import local components
import Header from '../components/Header';
import PopulationGraph from '../components/PopulationGraph';

export default function Volcano({loggedIn}) {
    // Get search parameters
    const [searchParams] = useSearchParams();
    const volcanoID = searchParams.get("id");

    // Use states
    const [ volcanoData, setVolcanoData ] = useState({});
    const [ populationData, setPopulationData ] = useState([0, 0, 0, 0]);
    const [center, setCenter] = useState([ 0 , 0 ]);
    const [error, setError] = useState(null);

    // Get authentication token
    const token = localStorage.getItem("token") || "";

    // Fetch volcano data
    useEffect(() => {
        if (volcanoID) {
        fetchVolcanoData();
        } else {
        setError("Invalid volcano ID");
        }
    }, [volcanoID]);

    const fetchVolcanoData = () => {
        const url = `http://4.237.58.241:3000/volcano/${volcanoID}`;

        const options = {
            method: "GET",
            headers: {
              "Accept": "application/json",
              ...(token && { "Authorization": `Bearer ${token}` }),
            },
          };

        return fetch(url, options)
        .then((res) => {
            if (!res.ok) {
              setError(`Error ${res.status}: ${res.statusText}`);
            }
            return res.json();
          })
          .then((data) => {
            if (data.error) {
                setError(data.message || "Unknown error occurred while fetching volcano data");
            }
            handleVolcanoData(data);
          })
          .catch((e) => {
            setError(e.message || "Unknown error occurred while fetching volcano data");
          });
    }

    const handleVolcanoData = (data) => {
        setVolcanoData(data);

        const latitude = parseFloat(data.latitude);
        const longitude = parseFloat(data.longitude);

        setCenter( [latitude , longitude]);

        setPopulationData([
            parseInt(data.population_5km),
            parseInt(data.population_10km),
            parseInt(data.population_30km),
            parseInt(data.population_100km)]
        );
    }

    // Display error to user
    if (error) {
        return (
            <div>
            <Header />
            <div className="info-container">
                <h1>Error</h1>
                <p>{error}</p>
            </div>
            </div>
        );
    }

    // Return volcano body
    return (
        <div>
            <Header />

            <div className="info-container">
                <h1>{ volcanoData.name }</h1>
                <p>Country: { volcanoData.country }</p>
                <p>Region: { volcanoData.region } | Subregion: { volcanoData.subregion }</p>
                <p>Summit: { volcanoData.summit }m | Elevation: { volcanoData.elevation }m</p>
            </div>

            <div className = "map-container">
                <Map 
                    height={500}
                    center = { center }
                    defaultZoom={ 8 } 
                >
                <Marker 
                    width={50}
                    anchor={ center } 
                />
                </Map>
            </div>

            <div className="pop-container">
                <h2>Population Density</h2>
                {loggedIn ? (
                    <PopulationGraph populationData={populationData}/>
                ) : (
                    <p>You must be logged in to view population density info</p>
                )}
            </div>
        </div>    
    );
}