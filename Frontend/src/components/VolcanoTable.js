// Import react hooks / components
import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { AgGridReact } from 'ag-grid-react';
import 'ag-grid-community/styles/ag-grid.css'
import 'ag-grid-community/styles/ag-theme-alpine.css'
import 'ag-grid-community/styles/ag-theme-balham.css'
import 'ag-grid-community/styles/ag-theme-quartz.css'
import 'ag-grid-community/styles/ag-theme-material.css'

// Custom tooltip component
const CustomTooltip = ({ value }) => {
    return <div style={{ padding: '5px', backgroundColor: 'white', border: '1px solid black' }}>{value}</div>;
  };


export default function VolcanoTable() {
    // Get search parameters
    const [searchParams] = useSearchParams();
    const country = searchParams.get("country");
    const populatedWithin = searchParams.get("populatedWithin");

    // Use navigate
    const navigate = useNavigate();

    // Use states
    const [ rowData, setRowData ] = useState([]);

    // Initialise table columns
    const tableColumns = [
        { headerName: "Volcano Name", field: "name", sortable: true, width: '249px', tooltipField: "tooltip"},
        { headerName: "Region", field: "region", sortable: true, width: '250px', tooltipField: "tooltip"},
        { headerName: "Subregion", field: "subregion", sortable: true, width: '250px', tooltipField: "tooltip"},
      ];

    // Fetch volcano data
    useEffect(() => {
        let url = "";
        if ( populatedWithin == null ) {
            url = `http://4.237.58.241:3000/volcanoes?country=${country}`;
        }
        else {
            url = `http://4.237.58.241:3000/volcanoes?country=${country}&populatedWithin=${populatedWithin}`;
        }

        fetch(url)
          .then(res => res.json())
          .then(data => data.map(volcano => {
              return {
                name: volcano.name,
                region: volcano.region,
                subregion: volcano.subregion,
                id: volcano.id,
                tooltip: "Click for more info"
              };
            })
          )
          .then(volcano => setRowData(volcano));
      }, [ country, populatedWithin]);


    return (
        <>
            <div className="ag-theme-quartz"
                style={{ 
                    height: '500px', 
                    width: "100%"}}
            >
                <AgGridReact
                    columnDefs={tableColumns}
                    rowData={rowData}
                    onRowClicked={(row) => navigate(`/volcano?id=${row.data.id}`)}
                    rowStyle={{ cursor: 'pointer' }} // Change cursor on hover
                    tooltipShowDelay={1500} // Delay before tooltip shows
                    tooltipComponent={CustomTooltip} // Custom tooltip
                />
            </div>
        </>
    )
}