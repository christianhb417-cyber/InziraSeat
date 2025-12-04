
export type UserRole = 'passenger' | 'companyAdmin' | 'systemAdmin';

export interface User {
  userId: string;
  fullName: string;
  email: string;
  phone: string;
  role: UserRole;
  companyId?: string; // If companyAdmin
  avatar?: string;
  createdAt?: string;
}

export interface Company {
  companyId: string;
  companyName: string; // "name" in backend.json, mapped here
  logo: string;
  contact: string; // "contactEmail" / "contactPhone"
  ownerUid?: string;
  status?: 'pending' | 'active' | 'suspended' | 'rejected';
}

export type BusStatus = 'active' | 'departed' | 'arrived' | 'maintenance' | 'offline';

export interface Coordinates {
  lat: number;
  lng: number;
}

export interface Bus {
  busId: string;
  companyId: string;
  busNumber: string;
  plateNumber: string;
  totalSeats: number;
  driverName: string;
  status: BusStatus;
  amenities: string[];
  fuelLevel: number; // 0-100
  engineHealth: number; // 0-100
  nextMaintenance: string; // Date
  location: Coordinates; // Live GPS
  heading?: number; // 0-360 degrees
  currentSpeed?: number; // km/h
}

export interface Staff {
  staffId: string;
  companyId: string;
  fullName: string;
  role: 'driver' | 'mechanic' | 'attendant';
  status: 'available' | 'on_duty' | 'leave';
  avatar: string;
}

export interface MaintenanceLog {
  logId: string;
  busId: string;
  description: string;
  status: 'pending' | 'in_progress' | 'completed';
  date: string;
  cost: number;
}

// "Trip" in backend.json
export interface Route {
  routeId: string; // tripId
  busId: string;
  from: string; // origin
  to: string; // destination
  departureTime: string; // ISO string
  arrivalTime?: string;
  price: number;
  duration: string;
  seatsAvailable?: number;
}

export type PaymentStatus = 'paid' | 'pending' | 'cash_on_arrival' | 'refunded';
export type BookingStatus = 'active' | 'boarded' | 'cancelled' | 'pending_payment';

export interface Booking {
  bookingId: string;
  userId: string;
  busId: string;
  routeId: string;
  seatNumber: number;
  paymentStatus: PaymentStatus;
  createdAt: string;
  qrCodeValue: string; // Unique secure string for QR
  status: BookingStatus;
  totalPrice?: number;
}

export interface Payment {
  paymentId: string;
  bookingId: string;
  userId: string;
  amount: number;
  currency: string;
  status: 'pending' | 'completed' | 'failed' | 'refunded';
  method: 'momo' | 'airtel' | 'card' | 'paypal';
  transactionId?: string;
  createdAt: string;
}

export interface AuditLog {
  logId: string;
  actorUid: string;
  action: string;
  targetType: string;
  targetId: string;
  timestamp: string;
  details?: any;
}

export interface SeatLock {
  lockId: string;
  busId: string;
  routeId: string;
  seatNumber: number;
  userId: string;
  expiresAt: number; // Timestamp
}

export interface AppState {
  currentUser: User | null;
  users: User[];
  companies: Company[];
  buses: Bus[];
  routes: Route[];
  bookings: Booking[];
  seatLocks: SeatLock[];
}