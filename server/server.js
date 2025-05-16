// server.js
// Servidor Express para recibir mediciones y almacenarlas en archivos de texto por lotes de 10,000 líneas

const express = require('express');
const fs = require('fs');
const path = require('path');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware para parsear JSON en el body
app.use(express.json());
app.use(cors());

// Control de archivos y líneas
let fileIndex = 0;
let lineCount = 0;
const LINES_PER_FILE = 10000;

function getFilePath() {
    return path.join(__dirname, `mediciones_${fileIndex}.txt`);
}

// Ruta de prueba con GET que envía una cadena simple
app.get('/prueba', (req, res) => {
    res.send('¡Servidor funcionando correctamente!');
});

// Ruta para recibir mediciones PPM
app.post('/api/ppm', (req, res) => {
    const { ppm_lin } = req.body;
    if (ppm_lin === undefined) {
        return res.status(400).json({ error: 'Falta el campo ppm_lin en el body' });
    }

    const timestamp = new Date().toISOString();
    console.log(`Recibiendo medición PPM: ${ppm_lin} a las ${timestamp}`);

    // Control de cambio de archivo cada 10,000 líneas
    lineCount++;
    if (lineCount > LINES_PER_FILE) {
        fileIndex++;
        lineCount = 1; // la línea actual será la primera del nuevo archivo
        console.log(`Creando nuevo archivo: mediciones_${fileIndex}.txt`);
    }

    const filePath = getFilePath();
    const line = `${timestamp}, ${ppm_lin}\n`;

    fs.appendFile(filePath, line, err => {
        if (err) {
            console.error(`Error al escribir en ${path.basename(filePath)}:`, err);
            return res.status(500).json({ error: 'Error interno al guardar la medición' });
        }
        res.json({ status: 'OK', timestamp, ppm_lin, file: path.basename(filePath), lineNumber: lineCount });
    });
});

app.get('/data', (req, res) => {
    const limit = parseInt(req.query.limit, 10);

    const files = fs.readdirSync(__dirname)
        .filter(f => f.startsWith('mediciones_') && f.endsWith('.txt'))
        .sort();

    let registros = [];
    files.forEach(file => {
        const lines = fs.readFileSync(path.join(__dirname, file), 'utf8')
            .trim()
            .split('\n');
        lines.forEach(line => {
            if (!line) return;
            const [isoTs, ppmStr] = line.split(',').map(s => s.trim());
            const dateObj = new Date(isoTs);
            // Formatear fecha y hora por separado
            const dd = String(dateObj.getDate()).padStart(2, '0');
            const mm = String(dateObj.getMonth() + 1).padStart(2, '0');
            const yyyy = dateObj.getFullYear();
            const hh = String(dateObj.getHours()).padStart(2, '0');
            const min = String(dateObj.getMinutes()).padStart(2, '0');
            registros.push({
                date: `${dd}-${mm}-${yyyy}`,
                time: `${hh}:${min}`,
                ppm: parseFloat(ppmStr)
            });
        });
    });

    if (!isNaN(limit) && limit > 0) {
        registros = registros.slice(-limit);
    }

    res.json(registros);
});

// Ruta raíz informativa
app.get('/', (req, res) => {
    res.send('Servidor de mediciones PPM');
});

// Inicializar servidor en todas las interfaces
app.listen(PORT, '0.0.0.0', () => {
    console.log(`Servidor escuchando en http://0.0.0.0:${PORT}`);
});

/*
Instrucciones:
1. Ejecutar: npm init -y
2. Instalar dependencias: npm install express
3. Iniciar servidor: node server.js
4. Las mediciones se almacenarán en archivos 'mediciones_0.txt', 'mediciones_1.txt', etc., cada 10,000 líneas.
*/
