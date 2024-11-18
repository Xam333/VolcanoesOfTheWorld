import './Volcanoes.css';   // Import CSS

// Import local components
import Header from '../components/Header';
import Searchbar from '../components/Searchbar';
import VolcanoTable from "../components/VolcanoTable";

export default function Volcanoes() {
  // Return volanoes page body
  return (
    <div>
      <Header />
      <div className="searchbar-container">
        <Searchbar />
      </div>
      <div className="table-container">
        <VolcanoTable />
      </div>
    </div>
  );
}