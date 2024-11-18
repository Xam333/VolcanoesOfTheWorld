import { Bar } from 'react-chartjs-2';
import { Chart, BarElement, CategoryScale, LinearScale, Title, Tooltip} from 'chart.js';

// Register components
Chart.register(CategoryScale, LinearScale, BarElement, Title, Tooltip);

export default function PopulationGraph({populationData}) {
    const data = {
        labels: ['5km', '10km', '30km', '100km'],
        datasets: [
            {
                label: 'Population Density',
                data: populationData,
                borderColor: 'rgba(75, 192, 192, 1)',
                borderWidth: 1,
            },
        ],
    };

    const options = {
        scales: {
            x: {
                title: {
                    display: true,
                    text: 'Distance',
                },
            },
            y: {
                title: {
                    display: true,
                    text: 'Population',
                },
                beginAtZero: true,
            },
        },
    };

    return (<Bar data={data} options={options} />);
}