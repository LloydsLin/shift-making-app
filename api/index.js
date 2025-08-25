const express = require('express');
const cors = require('cors');
const { mockShifts, bookedShifts } = require('./shifts_mode_api/mockShifts');

const app = express();
const PORT = 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Store booked shifts (in memory for demo)
let currentBookedShifts = [...bookedShifts];
let availableShifts = [...mockShifts];

// Get all available shifts with optional city filter
app.get('/shifts', (req, res) => {
  let filteredShifts = availableShifts;
  
  if (req.query.city) {
    filteredShifts = availableShifts.filter(
      shift => shift.area.toLowerCase() === req.query.city.toLowerCase()
    );
  }
  
  res.json(filteredShifts);
});

// Get booked shifts
app.get('/shifts/booked', (req, res) => {
  res.json(currentBookedShifts);
});

// Book a shift
app.post('/shifts/:id/book', (req, res) => {
  const shiftId = req.params.id;
  const shift = availableShifts.find(s => s.id === shiftId);
  
  if (!shift) {
    return res.status(404).json({ error: 'Shift not found' });
  }
  
  if (shift.booked) {
    return res.status(400).json({ error: 'Shift already booked' });
  }
  
  // Mark shift as booked
  shift.booked = true;
  
  // Add to booked shifts
  currentBookedShifts.push({ ...shift });
  
  res.json({ message: 'Shift booked successfully', shift });
});

// Cancel a shift
app.post('/shifts/:id/cancel', (req, res) => {
  const shiftId = req.params.id;
  
  // Remove from booked shifts
  const bookedIndex = currentBookedShifts.findIndex(s => s.id === shiftId);
  if (bookedIndex > -1) {
    currentBookedShifts.splice(bookedIndex, 1);
  }
  
  // Mark as available again
  const shift = availableShifts.find(s => s.id === shiftId);
  if (shift) {
    shift.booked = false;
  }
  
  res.json({ message: 'Shift cancelled successfully' });
});

// Get cities
app.get('/cities', (req, res) => {
  const cities = [...new Set(availableShifts.map(shift => shift.area))];
  res.json(cities);
});

app.listen(PORT, () => {
  console.log(`API server running on http://localhost:${PORT}`);
});