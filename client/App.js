import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  FlatList,
  Alert,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';


const API_BASE_URL = 'http://192.168.1.133:3000';

const App = () => {
  const [activeTab, setActiveTab] = useState('available');
  const [shifts, setShifts] = useState([]);
  const [bookedShifts, setBookedShifts] = useState([]);
  const [cities, setCities] = useState([]);
  const [selectedCity, setSelectedCity] = useState('');
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // Fetch available shifts
  const fetchAvailableShifts = async (city = '') => {
    setLoading(true);
    try {
      const url = city 
        ? `${API_BASE_URL}/shifts?city=${encodeURIComponent(city)}`
        : `${API_BASE_URL}/shifts`;
      
      const response = await fetch(url);
      const data = await response.json();
      setShifts(data);
      
      // Extract unique cities
      const uniqueCities = [...new Set(data.map(shift => shift.area))];
      setCities(uniqueCities);
    } catch (error) {
      console.error('Error fetching shifts:', error);
      Alert.alert('Error', 'Failed to fetch available shifts');
    } finally {
      setLoading(false);
    }
  };

  // Fetch booked shifts
  const fetchBookedShifts = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/shifts/booked`);
      const data = await response.json();
      setBookedShifts(data);
    } catch (error) {
      console.error('Error fetching booked shifts:', error);
      Alert.alert('Error', 'Failed to fetch booked shifts');
    } finally {
      setLoading(false);
    }
  };

  // Book a shift
  const bookShift = async (shiftId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/shifts/${shiftId}/book`, {
        method: 'POST',
      });
      
      if (response.ok) {
        Alert.alert('Success', 'Shift booked successfully!');
        fetchAvailableShifts(selectedCity);
        fetchBookedShifts();
      } else {
        Alert.alert('Error', 'Failed to book shift');
      }
    } catch (error) {
      console.error('Error booking shift:', error);
      Alert.alert('Error', 'Failed to book shift');
    }
  };

  // Cancel a shift
  const cancelShift = async (shiftId) => {
    Alert.alert(
      'Cancel Shift',
      'Are you sure you want to cancel this shift?',
      [
        { text: 'No', style: 'cancel' },
        {
          text: 'Yes',
          style: 'destructive',
          onPress: async () => {
            try {
              const response = await fetch(`${API_BASE_URL}/shifts/${shiftId}/cancel`, {
                method: 'POST',
              });
              
              if (response.ok) {
                Alert.alert('Success', 'Shift cancelled successfully!');
                fetchAvailableShifts(selectedCity);
                fetchBookedShifts();
              } else {
                Alert.alert('Error', 'Failed to cancel shift');
              }
            } catch (error) {
              console.error('Error cancelling shift:', error);
              Alert.alert('Error', 'Failed to cancel shift');
            }
          },
        },
      ]
    );
  };

  // Group shifts by date
  const groupShiftsByDate = (shifts) => {
    const grouped = shifts.reduce((acc, shift) => {
      const date = new Date(shift.startTime).toDateString();
      if (!acc[date]) {
        acc[date] = [];
      }
      acc[date].push(shift);
      return acc;
    }, {});

    // Sort dates and shifts within each date
    return Object.keys(grouped)
      .sort((a, b) => new Date(a) - new Date(b))
      .map(date => ({
        date,
        shifts: grouped[date].sort((a, b) => new Date(a.startTime) - new Date(b.startTime)),
      }));
  };

  // Format time
  const formatTime = (timeString) => {
    return new Date(timeString).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    });
  };

  // Format date
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
    });
  };

  // Calculate shift duration and pay
  const getShiftDetails = (shift) => {
    const start = new Date(shift.startTime);
    const end = new Date(shift.endTime);
    const hours = (end - start) / (1000 * 60 * 60);
    const pay = hours * (shift.hourlyRate || 25); // Default rate if not provided
    
    return {
      duration: `${hours}h`,
      pay: `$${pay.toFixed(0)}`,
    };
  };

  const onRefresh = async () => {
    setRefreshing(true);
    if (activeTab === 'available') {
      await fetchAvailableShifts(selectedCity);
    } else {
      await fetchBookedShifts();
    }
    setRefreshing(false);
  };

  useEffect(() => {
    fetchAvailableShifts();
    fetchBookedShifts();
  }, []);

  useEffect(() => {
    if (activeTab === 'available') {
      fetchAvailableShifts(selectedCity);
    }
  }, [selectedCity]);

  const ShiftCard = ({ shift, isBooked = false }) => {
    const details = getShiftDetails(shift);
    
    return (
      <View style={styles.shiftCard}>
        <View style={styles.shiftHeader}>
          <Text style={styles.shiftTime}>
            {formatTime(shift.startTime)} - {formatTime(shift.endTime)}
          </Text>
          <Text style={styles.shiftPay}>{details.pay}</Text>
        </View>
        
        <View style={styles.shiftDetails}>
          <Text style={styles.shiftArea}>{shift.area}</Text>
          <Text style={styles.shiftDuration}>{details.duration}</Text>
        </View>

        {shift.booked && !isBooked && (
          <Text style={styles.bookedLabel}>Booked</Text>
        )}

        <View style={styles.shiftActions}>
          {isBooked ? (
            <TouchableOpacity
              style={[styles.actionButton, styles.cancelButton]}
              onPress={() => cancelShift(shift.id)}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
          ) : (
            !shift.booked && (
              <TouchableOpacity
                style={[styles.actionButton, styles.bookButton]}
                onPress={() => bookShift(shift.id)}
              >
                <Text style={styles.bookButtonText}>Book</Text>
              </TouchableOpacity>
            )
          )}
        </View>
      </View>
    );
  };

  const CityFilter = () => (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterContainer}>
      <TouchableOpacity
        style={[styles.filterButton, selectedCity === '' && styles.filterButtonActive]}
        onPress={() => setSelectedCity('')}
      >
        <Text style={[styles.filterButtonText, selectedCity === '' && styles.filterButtonTextActive]}>
          All Cities
        </Text>
      </TouchableOpacity>
      {cities.map((city) => (
        <TouchableOpacity
          key={city}
          style={[styles.filterButton, selectedCity === city && styles.filterButtonActive]}
          onPress={() => setSelectedCity(city)}
        >
          <Text style={[styles.filterButtonText, selectedCity === city && styles.filterButtonTextActive]}>
            {city}
          </Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );

  const renderShiftGroup = ({ item }) => (
    <View style={styles.dateGroup}>
      <Text style={styles.dateHeader}>{formatDate(item.date)}</Text>
      {item.shifts.map((shift) => (
        <ShiftCard
          key={shift.id}
          shift={shift}
          isBooked={activeTab === 'booked'}
        />
      ))}
    </View>
  );

  const currentShifts = activeTab === 'available' 
    ? shifts.filter(shift => selectedCity === '' || shift.area === selectedCity)
    : bookedShifts;

  const groupedShifts = groupShiftsByDate(currentShifts);

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />
      
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Shift Booking</Text>
      </View>

      {/* Tab Navigation */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'available' && styles.activeTab]}
          onPress={() => setActiveTab('available')}
        >
          <Text style={[styles.tabText, activeTab === 'available' && styles.activeTabText]}>
            Available Shifts
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.tab, activeTab === 'booked' && styles.activeTab]}
          onPress={() => setActiveTab('booked')}
        >
          <Text style={[styles.tabText, activeTab === 'booked' && styles.activeTabText]}>
            My Shifts ({bookedShifts.length})
          </Text>
        </TouchableOpacity>
      </View>

      {/* City Filter (only for available shifts) */}
      {activeTab === 'available' && <CityFilter />}

      {/* Content */}
      <View style={styles.content}>
        {loading && !refreshing ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#007AFF" />
            <Text style={styles.loadingText}>Loading shifts...</Text>
          </View>
        ) : groupedShifts.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>
              {activeTab === 'available' 
                ? selectedCity 
                  ? `No available shifts in ${selectedCity}`
                  : 'No available shifts'
                : 'No booked shifts'
              }
            </Text>
          </View>
        ) : (
          <FlatList
            data={groupedShifts}
            renderItem={renderShiftGroup}
            keyExtractor={(item) => item.date}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
            }
            showsVerticalScrollIndicator={false}
          />
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    backgroundColor: '#ffffff',
    paddingTop: 60,
    paddingBottom: 20,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e1e5e9',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1a1a1a',
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#ffffff',
    paddingHorizontal: 20,
  },
  tab: {
    flex: 1,
    paddingVertical: 16,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  activeTab: {
    borderBottomColor: '#007AFF',
  },
  tabText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#8e8e93',
  },
  activeTabText: {
    color: '#007AFF',
    fontWeight: '600',
  },
  filterContainer: {
    backgroundColor: '#ffffff',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e1e5e9',
  },
  filterButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginRight: 12,
    borderRadius: 20,
    backgroundColor: '#f1f3f4',
    borderWidth: 1,
    borderColor: '#e1e5e9',
  },
  filterButtonActive: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  filterButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#5a5a5a',
  },
  filterButtonTextActive: {
    color: '#ffffff',
  },
  content: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#8e8e93',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyText: {
    fontSize: 18,
    color: '#8e8e93',
    textAlign: 'center',
  },
  dateGroup: {
    marginBottom: 24,
  },
  dateHeader: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 12,
    paddingHorizontal: 20,
  },
  shiftCard: {
    backgroundColor: '#ffffff',
    marginHorizontal: 20,
    marginBottom: 12,
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  shiftHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  shiftTime: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
  },
  shiftPay: {
    fontSize: 18,
    fontWeight: '700',
    color: '#34c759',
  },
  shiftDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  shiftArea: {
    fontSize: 14,
    color: '#8e8e93',
  },
  shiftDuration: {
    fontSize: 14,
    color: '#8e8e93',
  },
  bookedLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#ff9500',
    backgroundColor: '#fff2e6',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    alignSelf: 'flex-start',
    marginBottom: 12,
  },
  shiftActions: {
    alignItems: 'flex-end',
  },
  actionButton: {
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 8,
    minWidth: 80,
    alignItems: 'center',
  },
  bookButton: {
    backgroundColor: '#007AFF',
  },
  cancelButton: {
    backgroundColor: '#ff3b30',
  },
  bookButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
  cancelButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
});

export default App;