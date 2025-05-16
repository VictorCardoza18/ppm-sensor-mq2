// src/App.jsx
import React, { useEffect, useState } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';
import { Line } from 'react-chartjs-2';

// Registrar componentes de Chart.js
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const App = () => {
  const [dataPoints, setDataPoints] = useState([]);
  const [limit, setLimit] = useState(10000);

  useEffect(() => {
    fetch(`http://localhost:3000/data?limit=${limit}`)
      .then((res) => res.json())
      .then((data) => setDataPoints(data))
      .catch((err) => console.error('Error fetching data:', err));
  }, [limit]);

  const chartData = {
    labels: dataPoints.map((dp) => `${dp.date} ${dp.time}`),
    datasets: [
      {
        label: 'PPM Sensor',
        data: dataPoints.map((dp) => dp.ppm),
        fill: false,
        tension: 0.1,
        pointRadius: 2,
        borderColor: '#0284C7',
        backgroundColor: '#0284C7',
        pointBackgroundColor: '#0284C7'
      }
    ]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      title: {
        display: true,
        text: 'Mediciones PPM',
      },
      legend: {
        display: true,
      },
    },
    scales: {
      x: {
        display: true,
        title: { display: true, text: 'Fecha y Hora' },
      },
      y: {
        display: true,
        title: { display: true, text: 'PPM' },
      },
    },
  };

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      padding: '20px',
      boxSizing: 'border-box',
      width: '100%',
      height: '100vh',
    }}>
      <h1 style={{ textAlign: 'center' }}>Gráfica de Mediciones PPM</h1>
      <div style={{ margin: '10px 0' }}>
        <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          Mostrar últimos
          <input
            type="number"
            min={0}
            max={10000}
            value={limit}
            onChange={(e) => {
              const val = Number(e.target.value);
              if (val >= 0 && val <= 10000) setLimit(val);
            }}
            style={{ width: '80px', padding: '4px' }}
          />
          registros
        </label>
      </div>
      <div style={{
        flex: 1,
        width: '100%',
        maxWidth: '1200px',
        height: 'calc(100% - 100px)',
        position: 'relative',
      }}>
        <Line data={chartData} options={chartOptions} />
      </div>
    </div>
  );
};

export default App;
