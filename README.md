# Shift Booking Application

A React Native mobile application for booking and managing work shifts across Southeast Asian cities. The app allows users to browse available shifts, book them, manage their booked shifts, and filter by city locations.

## Features according to requirements

### Available Shifts
- Browse all available work shifts across Southeast Asia
- Filter shifts by city using an intuitive dropdown menu
- View shifts grouped by date for easy planning
- See shift details including time, duration, location, and pay rate
- Book available shifts with one tap

### My Shifts
- View all your booked shifts in chronological order
- Shifts organized by date (Today, Tomorrow, Future dates)
- Cancel shifts when needed with confirmation dialog
- Track total earnings from booked shifts

### Cities Covered
- 🇹🇭 **Bangkok, Thailand**
- 🇮🇩 **Jakarta, Indonesia** 
- 🇸🇬 **Singapore**
- 🇵🇭 **Manila, Philippines**
- 🇲🇾 **Kuala Lumpur, Malaysia**
- 🇻🇳 **Hanoi, Vietnam**
- 🇰🇭 **Phnom Penh, Cambodia**
- 🇱🇦 **Vientiane, Laos**
- 🇲🇲 **Yangon, Myanmar**
- 🇧🇳 **Bandar Seri Begawan, Brunei**

## Let's Start

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn
- Expo CLI or React Native CLI
- Android Studio/Xcode for device testing
- A smartphone or emulator for testing

### Installation

1. **Clone or download the project**
   ```bash
   cd react-native-assignment
   ```

2. **Install API dependencies**
   ```bash
   cd api
   npm install
   ```

3. **Install client dependencies**
   ```bash
   cd ../client
   npm install
   ```

4. **Update API URL**
   - Open `client/App.js`
   - Update the `API_BASE_URL` constant with your local IP address:
     ```javascript
     const API_BASE_URL = 'http://YOUR_LOCAL_IP:3000';
     ```
   - Find your IP with `ipconfig` (Windows) or `ifconfig` (Mac/Linux)

### Running the Application

1. **Start the API server**
   ```bash
   cd api
   npm start
   # Server will run on http://localhost:3000
   ```

2. **Start the React Native app**
   ```bash
   cd client
   npx expo start
   # or
   npm start
   ```

3. **Run on device**
   - Scan QR code with Expo Go app (iOS/Android)
   - Or press `a` for Android emulator, `i` for iOS simulator

## 📱 App Structure

```
react-native-assignment/
├── api/                    # Backend API server
│   ├── index.js           # Main server file with routes
│   ├── package.json       # API dependencies
│   └── README.md          # API documentation
├── client/                # React Native frontend
│   ├── App.js            # Main app component
│   ├── package.json      # Client dependencies
│   └── assets/           # App icons and images
├── assets/               # Design assets
└── design-spec.pdf      # UI/UX design specifications
```

## 🛠️ API Endpoints

### Available Shifts
- `GET /shifts` - Get all available shifts
- `GET /shifts?city={cityName}` - Get shifts filtered by city

### Booked Shifts
- `GET /shifts/booked` - Get all booked shifts

### Shift Actions
- `POST /shifts/{id}/book` - Book a specific shift
- `POST /shifts/{id}/cancel` - Cancel a booked shift

##  Data Structure

### Shift Object
```javascript
{
  id: string,           // Unique shift identifier
  startTime: string,    // ISO datetime string
  endTime: string,      // ISO datetime string  
  area: string,         // City name
  hourlyRate: number,   // Pay rate per hour
  booked: boolean       // Booking status
}
```

## 🎨 UI Components

### Main Navigation
- **Tab Navigation** Switch between Available Shifts and My Shifts
- **City Filter** Dropdown to filter shifts by Southeast Asian cities
- **Pull to Refresh** Refresh data on both screens

### Shift Cards
- **Time Display** Start and end times in 24-hour format
- **Pay Calculation** Automatic calculation based on duration and hourly rate
- **Action Buttons** Book (green) or Cancel (red) buttons
- **Status Indicators** Visual indicators for booked shifts

### Date Grouping
- Shifts automatically grouped by date
- Chronological ordering within each date
- Clean date headers with day names

##  Key Metrics

- **50+ Available Shifts** across 10 Southeast Asian capitals
- **Dynamic Pricing** €25-42 per hour based on shift type
- **Premium Rates** Higher pay for weekend and night shifts
- **Multi-city Coverage** Comprehensive regional coverage

## Deployment

### Building for Production

**Android:**
```bash
cd client
expo build:android
# or for standalone
expo build:android --type apk
```

**iOS:**
```bash
cd client  
expo build:ios
```
