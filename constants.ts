
import { User, Company, Bus, Route, Booking, Staff, MaintenanceLog, AuditLog, Coordinates } from './types';

export const MOCK_USERS: User[] = [
  {
    userId: 'u1',
    fullName: 'Alex Passenger',
    email: 'alex@example.com',
    phone: '+250788123456',
    role: 'passenger',
    createdAt: '2024-01-01T10:00:00Z'
  },
  {
    userId: 'u2',
    fullName: 'Sarah Admin',
    email: 'sarah@transco.com',
    phone: '+250788654321',
    role: 'companyAdmin',
    companyId: 'c1',
    createdAt: '2023-11-15T08:30:00Z'
  },
  {
    userId: 'u3',
    fullName: 'Master System',
    email: 'admin@inzira.com',
    phone: '+250788000000',
    role: 'systemAdmin',
    createdAt: '2023-01-01T00:00:00Z'
  }
];

export const MOCK_COMPANIES: Company[] = [
  {
    companyId: 'c1',
    companyName: 'Virunga Express',
    contact: 'info@virunga.rw',
    status: 'active'
  },
  {
    companyId: 'c2',
    companyName: 'Ritco',
    contact: 'info@ritco.rw',
    status: 'active'
  }
];

// Approximate coordinates for Rwanda
export const CITY_COORDINATES: Record<string, Coordinates> = {
  'Kigali': { lat: -1.9441, lng: 30.0619 },
  'Musanze': { lat: -1.5000, lng: 29.6333 },
  'Rubavu': { lat: -1.6741, lng: 29.2564 },
  'Huye': { lat: -2.6000, lng: 29.7333 },
  'Rusizi': { lat: -2.4833, lng: 28.9000 },
  'Nyagatare': { lat: -1.2974, lng: 30.3262 },
  'Karongi': { lat: -2.1500, lng: 29.3500 },
};

export const MOCK_BUSES: Bus[] = [
  {
    busId: 'b1',
    companyId: 'c1',
    busNumber: 'V-102',
    plateNumber: 'RAD 402 B',
    totalSeats: 32, 
    driverName: 'Jean Bosco',
    status: 'active',
    amenities: ['WiFi', 'AC', 'USB'],
    fuelLevel: 85,
    engineHealth: 98,
    nextMaintenance: '2025-04-12',
    location: { ...CITY_COORDINATES['Kigali'] }, // Starts in Kigali
    heading: 315,
    currentSpeed: 0
  },
  {
    busId: 'b2',
    companyId: 'c1',
    busNumber: 'V-404',
    plateNumber: 'RAC 880 C',
    totalSeats: 32,
    driverName: 'Eric Manzi',
    status: 'maintenance',
    amenities: ['AC'],
    fuelLevel: 40,
    engineHealth: 72,
    nextMaintenance: '2025-03-25',
    location: { ...CITY_COORDINATES['Musanze'] },
    heading: 0,
    currentSpeed: 0
  },
  {
    busId: 'b3',
    companyId: 'c2',
    busNumber: 'R-500',
    plateNumber: 'RAE 101 A',
    totalSeats: 48,
    driverName: 'Mike Ross',
    status: 'departed',
    amenities: ['WiFi', 'Snacks', 'AC'],
    fuelLevel: 60,
    engineHealth: 92,
    nextMaintenance: '2025-05-01',
    location: { lat: -1.75, lng: 29.9 }, // Mid-route
    heading: 180,
    currentSpeed: 65
  }
];

export const MOCK_STAFF: Staff[] = [
  { staffId: 's1', companyId: 'c1', fullName: 'Jean Bosco', role: 'driver', status: 'on_duty' },
  { staffId: 's2', companyId: 'c1', fullName: 'Eric Manzi', role: 'driver', status: 'available' },
  { staffId: 's3', companyId: 'c1', fullName: 'Alice Uwase', role: 'attendant', status: 'available' },
  { staffId: 's4', companyId: 'c1', fullName: 'David Keza', role: 'mechanic', status: 'on_duty' },
];

export const MOCK_MAINTENANCE: MaintenanceLog[] = [
  { logId: 'm1', busId: 'b2', description: 'Oil Change & Brake Inspection', status: 'in_progress', date: '2025-03-22', cost: 150000 },
  { logId: 'm2', busId: 'b1', description: 'Tire Replacement', status: 'completed', date: '2025-02-10', cost: 450000 },
];

export const MOCK_AUDIT_LOGS: AuditLog[] = [
    { logId: 'al1', actorUid: 'u2', action: 'CREATE_BUS', targetType: 'Bus', targetId: 'b2', timestamp: '2024-03-20T14:00:00Z', details: { plate: 'RAC 880 C' } },
    { logId: 'al2', actorUid: 'u3', action: 'APPROVE_COMPANY', targetType: 'Company', targetId: 'c1', timestamp: '2024-01-10T09:00:00Z' },
    { logId: 'al3', actorUid: 'u1', action: 'CANCEL_BOOKING', targetType: 'Booking', targetId: 'bk99', timestamp: '2024-03-22T11:30:00Z' },
];

// Generate dates for today and tomorrow
const today = new Date();
const tomorrow = new Date(today);
tomorrow.setDate(tomorrow.getDate() + 1);

export const MOCK_ROUTES: Route[] = [
  {
    routeId: 'r1',
    busId: 'b1',
    from: 'Kigali',
    to: 'Musanze',
    departureTime: new Date(today.setHours(8, 0, 0, 0)).toISOString(),
    arrivalTime: new Date(today.setHours(10, 0, 0, 0)).toISOString(),
    price: 3500, // RWF
    duration: '2h 00m',
    seatsAvailable: 14
  },
  {
    routeId: 'r2',
    busId: 'b1',
    from: 'Musanze',
    to: 'Kigali',
    departureTime: new Date(today.setHours(14, 0, 0, 0)).toISOString(),
    arrivalTime: new Date(today.setHours(16, 0, 0, 0)).toISOString(),
    price: 3500,
    duration: '2h 00m',
    seatsAvailable: 20
  },
  {
    routeId: 'r3',
    busId: 'b2',
    from: 'Kigali',
    to: 'Rubavu',
    departureTime: new Date(tomorrow.setHours(9, 30, 0, 0)).toISOString(),
    arrivalTime: new Date(tomorrow.setHours(13, 0, 0, 0)).toISOString(),
    price: 4000,
    duration: '3h 30m',
    seatsAvailable: 5
  },
  {
    routeId: 'r4',
    busId: 'b3',
    from: 'Kigali',
    to: 'Huye',
    departureTime: new Date(today.setHours(10, 0, 0, 0)).toISOString(),
    arrivalTime: new Date(today.setHours(12, 30, 0, 0)).toISOString(),
    price: 3000,
    duration: '2h 30m',
    seatsAvailable: 32
  }
];

export const MOCK_BOOKINGS: Booking[] = [
  {
    bookingId: 'bk1',
    userId: 'u1',
    busId: 'b1',
    routeId: 'r1',
    seatNumber: 1,
    paymentStatus: 'paid',
    createdAt: new Date().toISOString(),
    status: 'active',
    qrCodeValue: 'INZIRA-bk1-b1-1'
  }
];

export const CITIES = ['Kigali', 'Musanze', 'Rubavu', 'Huye', 'Rusizi', 'Nyagatare', 'Karongi'];
