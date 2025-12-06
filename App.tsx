
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
  Bus, CircleDollarSign, CreditCard, History, LayoutDashboard, LogOut, 
  MapPin, Settings, Ticket, TrendingUp, User as UserIcon, Users, 
  CheckCircle2, AlertCircle, Clock, Menu, X, Calendar, ChevronRight, 
  ArrowRight, ShieldCheck, Zap, Navigation, ScanLine, Fuel, Wrench, 
  Users2, Gauge, AlertTriangle, Briefcase, PlusCircle, Globe, Server, Activity, Search,
  ChevronLeft, FileText, Lock, Map, Ban, Check, Download, BarChart3, ToggleLeft, ToggleRight,
  Volume2, Mail, Lock as LockIcon, ShieldAlert, Edit2, Save, Camera, Upload, Command, Trash2,
  Wallet, ArrowUpRight, ArrowDownLeft
} from 'lucide-react';
import { QRCodeCanvas } from 'qrcode.react';
import { QrReader } from 'react-qr-reader';

import { AppState, Booking, Bus as BusType, Route, SeatLock, User, Staff, MaintenanceLog, BookingStatus, AuditLog, Company, UserRole, WalletTransaction } from './types';
import { CITIES, CITY_COORDINATES } from './constants';
import { Button } from './components/Button';
import { Input } from './components/Input';
import { AIAssistant } from './components/AIAssistant';
import { LiveMap } from './components/LiveMap';
import { supabase } from './supabaseClient';

// --- Formatters ---
const formatRWF = (amount: number) => {
  return new Intl.NumberFormat('rw-RW', { style: 'currency', currency: 'RWF', maximumFractionDigits: 0 }).format(amount);
};

const getInitials = (name: string) => {
    if (!name) return '??'; // Safety check
    return name
        .split(' ')
        .map((n) => n[0])
        .slice(0, 2)
        .join('')
        .toUpperCase();
};

// --- Sub-components ---

// 1. Sidebar Navigation (Floating Dock Style)
const Sidebar = ({ user, activeView, setView, onLogout, isMobileOpen, setIsMobileOpen }: any) => {
  const menuItems = useMemo(() => {
    const common = [{ id: 'settings', label: 'Settings', icon: <Settings size={20} /> }];
    
    if (user.role === 'passenger') {
      return [
        { id: 'search', label: 'Book Trip', icon: <Navigation size={20} /> },
        { id: 'my-bookings', label: 'My Wallet', icon: <Wallet size={20} /> },
        ...common
      ];
    }
    
    if (user.role === 'companyAdmin') {
      return [
        { id: 'mission-control', label: 'Mission Control', icon: <Gauge size={20} /> },
        { id: 'fleet', label: 'Fleet Status', icon: <Bus size={20} /> },
        { id: 'staff', label: 'Staff Ops', icon: <Briefcase size={20} /> },
        { id: 'scanner', label: 'Gate Scanner', icon: <ScanLine size={20} /> },
        ...common
      ];
    }

    if (user.role === 'systemAdmin') {
      return [
        { id: 'system-dashboard', label: 'Overwatch', icon: <Activity size={20} /> },
        { id: 'companies', label: 'Companies', icon: <Globe size={20} /> },
        { id: 'analytics', label: 'Global Analytics', icon: <TrendingUp size={20} /> },
        { id: 'audit', label: 'Audit Logs', icon: <FileText size={20} /> },
        ...common
      ];
    }

    return common;
  }, [user.role]);

  return (
    <>
      {isMobileOpen && (
        <div className="fixed inset-0 bg-black/90 z-40 md:hidden backdrop-blur-sm" onClick={() => setIsMobileOpen(false)} />
      )}
      
      <div className={`fixed inset-y-0 left-0 z-50 w-72 md:w-20 lg:w-72 glass-panel-heavy border-r border-white/5 transition-transform duration-500 md:translate-x-0 ${isMobileOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="h-full flex flex-col items-center lg:items-stretch py-8">
          {/* Logo */}
          <div className="mb-10 px-6 flex items-center justify-center lg:justify-start gap-4">
            <div className="w-10 h-10 rounded-xl bg-primary text-black flex items-center justify-center shadow-[0_0_20px_rgba(0,220,130,0.4)]">
              <Zap size={24} fill="currentColor" />
            </div>
            <span className="font-display font-bold text-xl tracking-wide hidden lg:block">Inzira<span className="text-primary">Seat</span></span>
          </div>

          {/* Nav */}
          <nav className="flex-1 w-full px-4 space-y-3">
            {menuItems.map((item: any) => (
              <button
                key={item.id}
                onClick={() => { setView(item.id); setIsMobileOpen(false); }}
                className={`w-full flex items-center lg:justify-start justify-center gap-4 px-4 py-3 rounded-2xl transition-all duration-300 group relative overflow-hidden ${
                  activeView === item.id 
                    ? 'bg-white/10 text-primary shadow-[0_0_15px_rgba(255,255,255,0.05)]' 
                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                }`}
              >
                {activeView === item.id && <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary rounded-r-full"></div>}
                <span className={`relative z-10 transition-transform ${activeView === item.id ? 'scale-110' : 'group-hover:scale-110'}`}>{item.icon}</span>
                <span className="relative z-10 hidden lg:block font-medium">{item.label}</span>
              </button>
            ))}
          </nav>

          {/* User Profile */}
          <div className="mt-auto px-4 w-full">
            <div className={`p-3 rounded-2xl bg-white/5 border flex items-center gap-3 cursor-pointer transition-colors ${user.role === 'systemAdmin' ? 'border-accent/30 shadow-[0_0_10px_rgba(255,184,0,0.1)]' : 'border-white/5 hover:border-primary/30'}`} onClick={onLogout}>
              <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-xs ${user.role === 'systemAdmin' ? 'bg-accent/20 text-accent border border-accent/50' : 'bg-primary/20 text-primary border border-primary/50'}`}>
                  {getInitials(user.fullName)}
              </div>
              <div className="hidden lg:block overflow-hidden">
                <p className={`text-sm font-bold truncate ${user.role === 'systemAdmin' ? 'text-accent' : 'text-white'}`}>{user.fullName || 'User'}</p>
                <p className="text-[10px] text-gray-500 uppercase tracking-widest">{user.role ? user.role.replace('Admin', '') : 'User'}</p>
              </div>
              <LogOut size={16} className="ml-auto text-gray-500 hover:text-white lg:block hidden" />
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

// 2. Mission Control Dashboard (Company Admin)
const MissionControl = ({ buses, staff, maintenance, bookings }: { buses: BusType[], staff: Staff[], maintenance: MaintenanceLog[], bookings: Booking[] }) => {
  const [reportLoading, setReportLoading] = useState(false);
  
  const handleReport = () => {
    setReportLoading(true);
    setTimeout(() => {
        setReportLoading(false);
        alert("Daily fleet report generated and sent to your email.");
    }, 2000);
  };

  // Calculate Real Stats
  const revenueToday = bookings
    .filter(b => {
        if (!b.createdAt) return false;
        const today = new Date().toISOString().split('T')[0];
        return b.createdAt.startsWith(today) && b.paymentStatus === 'paid';
    })
    .reduce((acc, curr) => acc + (curr.totalPrice || 0), 0);

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row justify-between items-end gap-4 border-b border-white/5 pb-6">
        <div>
           <h1 className="text-4xl font-display font-bold mb-2">Command Center</h1>
           <p className="text-gray-400">Real-time fleet telemetry and operations.</p>
        </div>
        <div className="flex gap-4">
           <div className="bg-primary/10 border border-primary/20 px-4 py-2 rounded-xl text-primary font-mono text-sm flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-primary animate-pulse"></span>
              SYSTEM ONLINE
           </div>
           <Button variant="primary" className="shadow-none rounded-xl" onClick={handleReport} isLoading={reportLoading}>Generate Report</Button>
        </div>
      </div>

      {/* Live Map Section */}
      <div className="w-full">
        <h3 className="text-xl font-bold mb-4 flex items-center gap-2"><Map size={20} /> Live Fleet Tracking</h3>
        <LiveMap buses={buses} height="400px" />
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
         {[
           { label: 'Active Fleet', value: buses.filter(b => b.status === 'active' || b.status === 'departed').length, total: buses.length, color: 'text-primary', bg: 'bg-primary/10' },
           { label: 'Revenue Today', value: formatRWF(revenueToday), unit: '', color: 'text-secondary', bg: 'bg-secondary/10' },
           { label: 'Staff on Duty', value: staff.filter(s => s.status === 'on_duty').length, total: staff.length, color: 'text-accent', bg: 'bg-accent/10' },
           { label: 'Critical Issues', value: maintenance.filter(m => m.status === 'in_progress').length, color: 'text-danger', bg: 'bg-danger/10' },
         ].map((stat, i) => (
           <div key={i} className="glass-panel p-6 rounded-3xl relative overflow-hidden group">
              <div className={`absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity transform scale-150 ${stat.color}`}>
                 <TrendingUp size={48} />
              </div>
              <p className="text-gray-500 text-xs font-bold uppercase tracking-widest mb-2">{stat.label}</p>
              <div className="flex items-baseline gap-2">
                 <span className={`text-4xl font-display font-bold ${stat.color}`}>{stat.value}</span>
                 {stat.total && <span className="text-gray-500 text-sm">/ {stat.total}</span>}
                 {stat.unit && <span className="text-gray-500 text-sm font-bold">{stat.unit}</span>}
              </div>
              <div className="w-full h-1 bg-white/5 mt-4 rounded-full overflow-hidden">
                 <div className={`h-full ${stat.color.replace('text', 'bg')} w-[70%]`}></div>
              </div>
           </div>
         ))}
      </div>
    </div>
  );
};

// 4. Fleet Management View
const FleetView = ({ buses, companyId, refreshData }: { buses: BusType[], companyId: string, refreshData: () => void }) => {
    const [isAdding, setIsAdding] = useState(false);
    const [loading, setLoading] = useState(false);
    const [newBus, setNewBus] = useState({
        busNumber: '',
        plateNumber: '',
        driverName: '',
        totalSeats: 30
    });

    const myBuses = buses.filter(b => b.companyId === companyId);

    const handleAddBus = async () => {
        if(!newBus.busNumber || !newBus.plateNumber) return;
        setLoading(true);
        try {
            const { error } = await supabase.from('buses').insert({
                companyId,
                busNumber: newBus.busNumber,
                plateNumber: newBus.plateNumber,
                driverName: newBus.driverName || 'Unassigned',
                totalSeats: newBus.totalSeats,
                status: 'offline',
                amenities: ['Wifi', 'USB'],
                fuelLevel: 100,
                engineHealth: 100,
                nextMaintenance: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString(),
                location: CITY_COORDINATES['Kigali']
            });
            if (error) throw error;
            setIsAdding(false);
            setNewBus({ busNumber: '', plateNumber: '', driverName: '', totalSeats: 30 });
            refreshData();
        } catch (err: any) {
            alert(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div className="flex justify-between items-end border-b border-white/5 pb-6">
                <div>
                    <h1 className="text-3xl font-display font-bold mb-2">Fleet Operations</h1>
                    <p className="text-gray-400">Manage vehicle status and assignments.</p>
                </div>
                <Button onClick={() => setIsAdding(true)} className="rounded-xl"><PlusCircle size={18} className="mr-2" /> Add Vehicle</Button>
            </div>

            {isAdding && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
                    <div className="w-full max-w-lg glass-panel-heavy p-8 rounded-3xl relative border border-white/10">
                        <button onClick={() => setIsAdding(false)} className="absolute top-4 right-4 text-gray-500 hover:text-white"><X /></button>
                        <h2 className="text-xl font-bold mb-6">Add New Vehicle</h2>
                        <div className="space-y-4">
                            <Input label="Bus Number" value={newBus.busNumber} onChange={e => setNewBus({...newBus, busNumber: e.target.value})} placeholder="e.g. B-001" />
                            <Input label="Plate Number" value={newBus.plateNumber} onChange={e => setNewBus({...newBus, plateNumber: e.target.value})} placeholder="RAC 123 A" />
                            <Input label="Driver Name" value={newBus.driverName} onChange={e => setNewBus({...newBus, driverName: e.target.value})} />
                            <Input label="Total Seats" type="number" value={newBus.totalSeats} onChange={e => setNewBus({...newBus, totalSeats: parseInt(e.target.value)})} />
                            <Button className="w-full mt-4" onClick={handleAddBus} isLoading={loading}>Register Vehicle</Button>
                        </div>
                    </div>
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {myBuses.map(bus => (
                    <div key={bus.busId} className="glass-panel p-6 rounded-3xl relative overflow-hidden group border border-white/5 hover:border-primary/30 transition-all">
                        <div className="flex justify-between items-start mb-6">
                            <div>
                                <h3 className="text-xl font-bold text-white">{bus.busNumber}</h3>
                                <p className="text-sm text-gray-500 font-mono">{bus.plateNumber}</p>
                            </div>
                            <span className={`px-2 py-1 rounded-md text-[10px] font-bold uppercase border ${
                                bus.status === 'active' ? 'bg-green-500/10 text-green-400 border-green-500/20' : 
                                bus.status === 'maintenance' ? 'bg-red-500/10 text-red-400 border-red-500/20' : 
                                'bg-gray-500/10 text-gray-400 border-gray-500/20'
                            }`}>{bus.status}</span>
                        </div>
                        
                        <div className="space-y-3 mb-6">
                            <div className="flex justify-between text-xs">
                                <span className="text-gray-500">Fuel Level</span>
                                <span className={bus.fuelLevel < 20 ? 'text-red-400' : 'text-primary'}>{bus.fuelLevel}%</span>
                            </div>
                            <div className="w-full h-1 bg-white/10 rounded-full overflow-hidden">
                                <div className={`h-full rounded-full ${bus.fuelLevel < 20 ? 'bg-red-500' : 'bg-primary'}`} style={{width: `${bus.fuelLevel}%`}}></div>
                            </div>
                            
                            <div className="flex justify-between text-xs pt-2">
                                <span className="text-gray-500">Engine Health</span>
                                <span className={bus.engineHealth < 70 ? 'text-yellow-400' : 'text-primary'}>{bus.engineHealth}%</span>
                            </div>
                            <div className="w-full h-1 bg-white/10 rounded-full overflow-hidden">
                                <div className={`h-full rounded-full ${bus.engineHealth < 70 ? 'bg-yellow-500' : 'bg-primary'}`} style={{width: `${bus.engineHealth}%`}}></div>
                            </div>
                        </div>

                        <div className="flex items-center gap-2 text-sm text-gray-400">
                             <UserIcon size={14} /> {bus.driverName}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

// 5. Staff Management View
const StaffView = ({ staff, refreshData, companyId }: { staff: Staff[], refreshData: () => void, companyId: string }) => {
    const [isAdding, setIsAdding] = useState(false);
    const [loading, setLoading] = useState(false);
    const [newStaff, setNewStaff] = useState({
        fullName: '',
        role: 'driver' as const,
    });

    const myStaff = staff.filter(s => s.companyId === companyId);

    const handleAddStaff = async () => {
        if(!newStaff.fullName) return;
        setLoading(true);
        try {
            const { error } = await supabase.from('staff').insert({
                companyId,
                fullName: newStaff.fullName,
                role: newStaff.role,
                status: 'available'
            });
            if (error) throw error;
            setIsAdding(false);
            setNewStaff({ fullName: '', role: 'driver' });
            refreshData();
        } catch (err: any) {
            alert(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div className="flex justify-between items-end border-b border-white/5 pb-6">
                <div>
                    <h1 className="text-3xl font-display font-bold mb-2">Staff Roster</h1>
                    <p className="text-gray-400">Manage drivers, mechanics, and support staff.</p>
                </div>
                <Button onClick={() => setIsAdding(true)} className="rounded-xl"><PlusCircle size={18} className="mr-2" /> Add Staff</Button>
            </div>

             {isAdding && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
                    <div className="w-full max-w-lg glass-panel-heavy p-8 rounded-3xl relative border border-white/10">
                        <button onClick={() => setIsAdding(false)} className="absolute top-4 right-4 text-gray-500 hover:text-white"><X /></button>
                        <h2 className="text-xl font-bold mb-6">Add Staff Member</h2>
                        <div className="space-y-4">
                            <Input label="Full Name" value={newStaff.fullName} onChange={e => setNewStaff({...newStaff, fullName: e.target.value})} placeholder="John Doe" />
                            <div>
                                <label className="block text-xs font-medium text-gray-400 mb-1.5 ml-1">Role</label>
                                <select 
                                    className="w-full bg-surface/50 border border-white/10 text-white rounded-xl px-4 py-2.5 focus:outline-none focus:border-primary/50"
                                    value={newStaff.role}
                                    onChange={(e: any) => setNewStaff({...newStaff, role: e.target.value})}
                                >
                                    <option value="driver">Driver</option>
                                    <option value="mechanic">Mechanic</option>
                                    <option value="attendant">Attendant</option>
                                </select>
                            </div>
                            <Button className="w-full mt-4" onClick={handleAddStaff} isLoading={loading}>Register Staff</Button>
                        </div>
                    </div>
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {myStaff.map(s => (
                    <div key={s.staffId} className="glass-panel p-6 rounded-3xl flex items-center gap-4 border border-white/5">
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold ${
                            s.role === 'driver' ? 'bg-primary/20 text-primary' : 
                            s.role === 'mechanic' ? 'bg-accent/20 text-accent' : 
                            'bg-secondary/20 text-secondary'
                        }`}>
                            {getInitials(s.fullName)}
                        </div>
                        <div>
                            <h3 className="font-bold text-white">{s.fullName}</h3>
                            <p className="text-xs text-gray-400 uppercase tracking-wider">{s.role}</p>
                            <div className="flex items-center gap-2 mt-1">
                                <div className={`w-2 h-2 rounded-full ${
                                    s.status === 'available' ? 'bg-green-500' : 
                                    s.status === 'on_duty' ? 'bg-blue-500' : 'bg-red-500'
                                }`}></div>
                                <span className="text-xs text-gray-500 capitalize">{s.status.replace('_', ' ')}</span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

// 3. System Overwatch (System Admin)
const SystemDashboard = ({ auditLogs, companiesCount, bookings }: { auditLogs: AuditLog[], companiesCount: number, bookings: Booking[] }) => {
  
  const dailyPassengers = bookings.filter(b => {
      if (!b.createdAt) return false;
      const today = new Date().toISOString().split('T')[0];
      return b.createdAt.startsWith(today);
  }).length;

  const totalRevenue = bookings
    .filter(b => b.paymentStatus === 'paid')
    .reduce((acc, curr) => acc + (curr.totalPrice || 0), 0);

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row justify-between items-end gap-4 border-b border-white/5 pb-6">
        <div>
           <div className="flex items-center gap-3 mb-2">
              <h1 className="text-4xl font-display font-bold">Inzira Overwatch</h1>
              <span className="px-3 py-1 bg-accent/10 text-accent border border-accent/20 rounded-full text-xs font-bold uppercase">Master Access</span>
           </div>
           <p className="text-gray-400">Global platform monitoring and governance.</p>
        </div>
        <div className="flex gap-4">
           <div className="bg-secondary/10 border border-secondary/20 px-4 py-2 rounded-xl text-secondary font-mono text-sm flex items-center gap-2">
              <Server size={14} />
              SERVER HEALTH: 100%
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
         <div className="glass-panel p-8 rounded-[2.5rem] bg-gradient-to-br from-secondary/10 to-transparent border-secondary/20">
            <div className="flex justify-between items-start mb-8">
               <div className="p-3 bg-secondary/20 rounded-2xl text-secondary"><Globe size={24} /></div>
               <span className="text-xs font-bold uppercase bg-white/5 px-2 py-1 rounded text-gray-400">Global</span>
            </div>
            <h3 className="text-4xl font-display font-bold text-white mb-1">{companiesCount}</h3>
            <p className="text-gray-400 font-medium">Active Transport Companies</p>
         </div>
         
         <div className="glass-panel p-8 rounded-[2.5rem] bg-gradient-to-br from-primary/10 to-transparent border-primary/20">
            <div className="flex justify-between items-start mb-8">
               <div className="p-3 bg-primary/20 rounded-2xl text-primary"><Users size={24} /></div>
               <span className="text-xs font-bold uppercase bg-white/5 px-2 py-1 rounded text-gray-400">Today</span>
            </div>
            <h3 className="text-4xl font-display font-bold text-white mb-1">{dailyPassengers}</h3>
            <p className="text-gray-400 font-medium">Daily Passengers</p>
         </div>

         <div className="glass-panel p-8 rounded-[2.5rem] bg-gradient-to-br from-accent/10 to-transparent border-accent/20">
            <div className="flex justify-between items-start mb-8">
               <div className="p-3 bg-accent/20 rounded-2xl text-accent"><CircleDollarSign size={24} /></div>
               <span className="text-xs font-bold uppercase bg-white/5 px-2 py-1 rounded text-gray-400">Net Revenue</span>
            </div>
            <h3 className="text-4xl font-display font-bold text-white mb-1">{formatRWF(totalRevenue)}</h3>
            <p className="text-gray-400 font-medium">Platform Total</p>
         </div>
      </div>
    </div>
  );
};

// 3.1 Company Management Module (UPDATED: Fully Functional)
const CompanyManagement = ({ companies, refreshData }: { companies: Company[], refreshData: () => void }) => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [newCompany, setNewCompany] = useState({
      name: '',
      contactEmail: '',
      contactPhone: '',
      ownerEmail: ''
  });

  const handleRegisterCompany = async () => {
      setLoading(true);
      try {
          // 1. Find User by Email
          const { data: users, error: userError } = await supabase
              .from('users')
              .select('userId')
              .eq('email', newCompany.ownerEmail)
              .single();
          
          if (userError || !users) {
              alert("User not found! The owner must create a Passenger account first.");
              setLoading(false);
              return;
          }

          const ownerId = users.userId;

          // 2. Create Company
          const { data: company, error: companyError } = await supabase
              .from('companies')
              .insert({
                  companyName: newCompany.name,
                  contactEmail: newCompany.contactEmail,
                  contactPhone: newCompany.contactPhone,
                  ownerUid: ownerId,
                  status: 'active'
              })
              .select()
              .single();

          if (companyError) throw companyError;

          // 3. Promote User to Company Admin
          const { error: updateError } = await supabase
              .from('users')
              .update({
                  role: 'companyAdmin',
                  companyId: company.companyId
              })
              .eq('userId', ownerId);

          if (updateError) throw updateError;

          alert("Company registered and Owner promoted successfully!");
          setShowAddModal(false);
          setNewCompany({ name: '', contactEmail: '', contactPhone: '', ownerEmail: '' });
          refreshData();

      } catch (err: any) {
          console.error(err);
          alert("Error registering company: " + err.message);
      } finally {
          setLoading(false);
      }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 relative">
      <div className="flex justify-between items-end border-b border-white/5 pb-6">
        <div>
           <h1 className="text-3xl font-display font-bold mb-2">Registered Providers</h1>
           <p className="text-gray-400">Manage transport companies and licenses.</p>
        </div>
        <Button variant="primary" onClick={() => setShowAddModal(true)} className="rounded-xl">
            <PlusCircle size={18} className="mr-2" /> Register Company
        </Button>
      </div>

      {/* Add Company Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
           <div className="w-full max-w-lg glass-panel-heavy border border-accent/30 p-8 rounded-3xl relative shadow-[0_0_50px_rgba(255,184,0,0.1)]">
               <button onClick={() => setShowAddModal(false)} className="absolute top-4 right-4 text-gray-500 hover:text-white"><X/></button>
               <h2 className="text-xl font-display font-bold text-accent mb-6 flex items-center gap-2"><Briefcase size={20}/> New Operator Registration</h2>
               
               <div className="space-y-4">
                   <Input label="Company Name" value={newCompany.name} onChange={e => setNewCompany({...newCompany, name: e.target.value})} placeholder="e.g. Volcano Express" />
                   <Input label="Contact Email" value={newCompany.contactEmail} onChange={e => setNewCompany({...newCompany, contactEmail: e.target.value})} />
                   <Input label="Contact Phone" value={newCompany.contactPhone} onChange={e => setNewCompany({...newCompany, contactPhone: e.target.value})} />
                   
                   <div className="pt-4 border-t border-white/10">
                       <label className="text-xs font-bold text-accent uppercase mb-2 block">Admin Authorization</label>
                       <p className="text-xs text-gray-500 mb-2">Enter the email of an existing user to promote them to Company Admin.</p>
                       <Input label="Owner Email" value={newCompany.ownerEmail} onChange={e => setNewCompany({...newCompany, ownerEmail: e.target.value})} placeholder="user@example.com" />
                   </div>

                   <div className="flex gap-4 pt-4">
                       <Button variant="ghost" onClick={() => setShowAddModal(false)} className="flex-1">Cancel</Button>
                       <Button variant="primary" onClick={handleRegisterCompany} isLoading={loading} className="flex-1 bg-accent text-black hover:bg-accent/80">Authorize & Create</Button>
                   </div>
               </div>
           </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {companies.length === 0 ? (
            <div className="col-span-full py-20 text-center text-gray-500 border border-dashed border-white/10 rounded-3xl">
                <Globe size={48} className="mx-auto mb-4 opacity-50" />
                <p>No companies registered. Add the first operator.</p>
            </div>
        ) : companies.map(company => (
           <div key={company.companyId} className="glass-panel p-6 rounded-3xl group border border-white/5 hover:border-primary/30 transition-all flex flex-col h-full">
              <div className="flex justify-between items-start mb-6">
                 <div className="flex items-center gap-3">
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-white/10 to-white/5 text-white border border-white/10 flex items-center justify-center font-bold text-xl font-display">
                       {company.companyName?.substring(0,2).toUpperCase()}
                    </div>
                    <div>
                       <h3 className="font-bold text-white text-lg">{company.companyName}</h3>
                       <p className="text-xs text-gray-500">{company.contactEmail}</p>
                    </div>
                 </div>
                 <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase border ${
                    company.status === 'active' ? 'bg-green-500/10 text-green-400 border-green-500/20' : 
                    company.status === 'suspended' ? 'bg-red-500/10 text-red-400 border-red-500/20' : 
                    'bg-yellow-500/10 text-yellow-400 border-yellow-500/20'
                 }`}>{company.status}</span>
              </div>
              
              <div className="mt-6 pt-6 border-t border-white/5 flex gap-2">
                 <Button variant="ghost" className="flex-1 text-xs bg-white/5 hover:bg-white/10">Edit Details</Button>
                 {company.status === 'active' ? (
                     <Button variant="danger" className="text-xs bg-red-500/10 hover:bg-red-500/20 text-red-400 border-none">Suspend</Button>
                 ) : (
                     <Button variant="primary" className="text-xs bg-green-500/10 hover:bg-green-500/20 text-green-400 border-none">Approve</Button>
                 )}
              </div>
           </div>
        ))}
      </div>
    </div>
  );
};

// 3.2 Global Analytics Module
const GlobalAnalytics = ({ bookings }: { bookings: Booking[] }) => {
    // Calculate dynamic stats
    const totalBookings = bookings.length;
    const pendingBookings = bookings.filter(b => b.status === 'pending_payment').length;
    
    return (
        <div className="space-y-8 animate-in fade-in duration-500">
             <div className="flex justify-between items-end border-b border-white/5 pb-6">
                <div>
                    <h1 className="text-3xl font-display font-bold mb-2">Global Analytics</h1>
                    <p className="text-gray-400">Platform performance and financial insights.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="glass-panel p-8 rounded-[2.5rem] border border-white/5">
                    <h3 className="text-xl font-bold mb-6 flex items-center gap-3">
                        <BarChart3 className="text-primary" /> Booking Distribution
                    </h3>
                    {totalBookings === 0 ? (
                        <p className="text-gray-500 text-center py-10">No data available for analysis.</p>
                    ) : (
                         <div className="space-y-4">
                            <div className="flex justify-between text-sm">
                                <span>Completed</span>
                                <span>{bookings.filter(b => b.status === 'active' || b.status === 'boarded').length}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span>Pending</span>
                                <span>{pendingBookings}</span>
                            </div>
                         </div>
                    )}
                </div>
            </div>
        </div>
    );
};

// 3.3 Full Audit Logs Module
const FullAuditLogs = ({ logs }: { logs: AuditLog[] }) => {
    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div className="flex justify-between items-end border-b border-white/5 pb-6">
                <div>
                    <h1 className="text-3xl font-display font-bold mb-2">System Audit Logs</h1>
                    <p className="text-gray-400">Immutable record of all system activities.</p>
                </div>
            </div>

            <div className="glass-panel rounded-3xl overflow-hidden border border-white/5">
                <table className="w-full text-left">
                    <thead className="bg-white/5 text-gray-400 text-xs uppercase font-bold tracking-wider">
                        <tr>
                            <th className="p-6">Timestamp</th>
                            <th className="p-6">Actor</th>
                            <th className="p-6">Action</th>
                            <th className="p-6">Target</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                        {logs.map(log => (
                            <tr key={log.logId} className="hover:bg-white/5 transition-colors">
                                <td className="p-6 font-mono text-sm text-gray-400">{new Date(log.timestamp).toLocaleString()}</td>
                                <td className="p-6 text-white">{log.actorUid}</td>
                                <td className="p-6">
                                    <span className={`px-2 py-1 rounded-md text-xs font-bold border ${
                                        log.action.includes('CREATE') ? 'bg-green-500/10 text-green-400 border-green-500/20' :
                                        log.action.includes('CANCEL') ? 'bg-red-500/10 text-red-400 border-red-500/20' :
                                        'bg-blue-500/10 text-blue-400 border-blue-500/20'
                                    }`}>
                                        {log.action}
                                    </span>
                                </td>
                                <td className="p-6 text-sm text-gray-300">{log.targetType} #{log.targetId}</td>
                            </tr>
                        ))}
                        {logs.length === 0 && (
                             <tr><td colSpan={4} className="p-6 text-center text-gray-500">No logs found</td></tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

// 3.4 Settings Module (Enhanced Profile)
const SettingsView = ({ user, onLogout, refreshUser }: { user: User, onLogout: () => void, refreshUser: () => void }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [editForm, setEditForm] = useState({
        fullName: user.fullName || '',
        phone: user.phone || ''
    });
    const [loading, setLoading] = useState(false);

    const handleSave = async () => {
        setLoading(true);
        try {
            const { error } = await supabase
                .from('users')
                .update({ 
                    fullName: editForm.fullName,
                    phone: editForm.phone
                })
                .eq('userId', user.userId);

            if (error) throw error;
            await refreshUser();
            setIsEditing(false);
        } catch (err) {
            console.error('Update failed', err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-3xl mx-auto space-y-8 animate-in fade-in duration-500">
            <div className="flex justify-between items-end border-b border-white/5 pb-6">
                <div>
                    <h1 className="text-3xl font-display font-bold mb-2">Settings</h1>
                    <p className="text-gray-400">Manage your identity and preferences.</p>
                </div>
            </div>

            {/* Profile Card */}
            <div className="glass-panel p-8 rounded-[2.5rem] border border-white/5 flex flex-col md:flex-row items-center gap-8 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-32 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
                
                <div className="w-32 h-32 rounded-full p-1 bg-gradient-to-br from-primary to-secondary relative group flex items-center justify-center">
                    <div className="w-full h-full rounded-full bg-black flex items-center justify-center border-4 border-black">
                        <span className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-br from-primary to-secondary">
                            {getInitials(user.fullName)}
                        </span>
                    </div>
                </div>
                
                <div className="flex-1 text-center md:text-left z-10 w-full">
                    {isEditing ? (
                        <div className="space-y-4 max-w-md bg-black/20 p-4 rounded-xl border border-white/10">
                            <Input 
                                label="Full Name" 
                                value={editForm.fullName} 
                                onChange={e => setEditForm({...editForm, fullName: e.target.value})} 
                            />
                            <Input 
                                label="Phone Number" 
                                value={editForm.phone} 
                                onChange={e => setEditForm({...editForm, phone: e.target.value})} 
                            />
                            <div className="flex gap-4 pt-2">
                                <Button size="sm" onClick={handleSave} isLoading={loading}><Save size={16} className="mr-2"/> Save Changes</Button>
                                <Button variant="ghost" size="sm" onClick={() => setIsEditing(false)}>Cancel</Button>
                            </div>
                        </div>
                    ) : (
                        <>
                            <h2 className="text-3xl font-bold text-white mb-1">{user.fullName || 'User'}</h2>
                            <p className="text-primary font-bold uppercase tracking-widest text-xs mb-4">{user.role}</p>
                            <div className="flex flex-col md:flex-row gap-4 justify-center md:justify-start">
                                <Button variant="outline" size="sm" className="rounded-xl" onClick={() => setIsEditing(true)}>
                                    <Edit2 size={16} className="mr-2" /> Edit Profile
                                </Button>
                                <Button variant="danger" size="sm" className="rounded-xl" onClick={onLogout}>
                                    <LogOut size={16} className="mr-2" /> Log Out
                                </Button>
                            </div>
                        </>
                    )}
                </div>
            </div>

            {/* General Preferences */}
            <div className="glass-panel p-8 rounded-[2.5rem] border border-white/5 space-y-6">
                <h3 className="text-lg font-bold flex items-center gap-2"><Settings size={18} /> System Preferences</h3>
                
                <div className="flex items-center justify-between p-4 bg-white/5 rounded-2xl">
                    <div className="flex items-center gap-4">
                        <div className="p-2 bg-primary/10 rounded-lg text-primary"><Volume2 size={20} /></div>
                        <div>
                            <p className="font-bold text-white">Sound Effects</p>
                            <p className="text-xs text-gray-400">Enable UI sounds and AI voice.</p>
                        </div>
                    </div>
                    <ToggleRight size={32} className="text-primary cursor-pointer" />
                </div>
            </div>
        </div>
    );
};

// 6. Wallet / My Bookings View (Active Supabase Fetching)
const WalletView = ({ user, buses, routes, refreshData }: { user: User, buses: BusType[], routes: Route[], refreshData: () => void }) => {
   const [trackingBusId, setTrackingBusId] = useState<string | null>(null);
   const [bookings, setBookings] = useState<Booking[]>([]);
   const [transactions, setTransactions] = useState<WalletTransaction[]>([]);
   const [loading, setLoading] = useState(true);
   const [viewMode, setViewMode] = useState<'tickets' | 'transactions'>('tickets');
   
   // Modal States
   const [showTransactModal, setShowTransactModal] = useState(false);
   const [transactType, setTransactType] = useState<'deposit' | 'withdraw'>('deposit');
   const [transactAmount, setTransactAmount] = useState<string>('');
   const [transactLoading, setTransactLoading] = useState(false);

   // Fetch bookings & transactions
   useEffect(() => {
     const fetchData = async () => {
        setLoading(true);
        // Bookings
        const { data: bData } = await supabase
            .from('bookings')
            .select('*')
            .eq('userId', user.userId)
            .order('createdAt', { ascending: false });
        if (bData) setBookings(bData as Booking[]);

        // Transactions (Requires the new table)
        const { data: tData } = await supabase
            .from('wallet_transactions')
            .select('*')
            .eq('userId', user.userId)
            .order('createdAt', { ascending: false });
        if (tData) setTransactions(tData as WalletTransaction[]);
        
        setLoading(false);
     };
     fetchData();
   }, [user.userId, user.walletBalance]); // Refresh when balance changes

   const handleTransaction = async () => {
       setTransactLoading(true);
       try {
           const amount = parseFloat(transactAmount);
           if (isNaN(amount)) throw new Error("Invalid amount");
           
           if (transactType === 'deposit' && amount < 100) throw new Error("Minimum deposit is 100 RWF");
           if (transactType === 'withdraw' && amount < 500) throw new Error("Minimum withdrawal is 500 RWF");
           if (transactType === 'withdraw' && amount > (user.walletBalance || 0)) throw new Error("Insufficient funds");

           // Call the Supabase RPC function (secure server-side logic)
           const { data, error } = await supabase.rpc('handle_wallet_transaction', {
               p_user_id: user.userId,
               p_amount: amount,
               p_type: transactType === 'deposit' ? 'deposit' : 'withdrawal',
               p_method: 'momo' // Default for now
           });

           if (error) throw error;
           
           alert(`${transactType === 'deposit' ? 'Deposit' : 'Withdrawal'} successful!`);
           setShowTransactModal(false);
           setTransactAmount('');
           refreshData(); // Updates global user state (balance)
       } catch (err: any) {
           alert(err.message);
       } finally {
           setTransactLoading(false);
       }
   };

   // Use only real routes
   const allRoutes = routes;
   
   return (
      <div className="space-y-8 animate-in fade-in duration-500 max-w-4xl mx-auto relative">
         <div className="flex flex-col md:flex-row items-center justify-between border-b border-white/5 pb-6 gap-6">
            <div>
               <h1 className="text-3xl font-display font-bold mb-2">My Wallet</h1>
               <p className="text-gray-400">Digital tickets, balance, and history.</p>
            </div>
            
            {/* Balance Card */}
            <div className="bg-surfaceHighlight border border-white/10 p-6 rounded-2xl w-full md:w-auto min-w-[280px]">
               <p className="text-sm text-gray-400 mb-1 uppercase font-bold tracking-wider">Available Balance</p>
               <div className="flex items-center justify-between mb-4">
                   <p className="text-3xl font-display font-bold text-primary">{formatRWF(user.walletBalance || 0)}</p>
                   <Wallet className="text-primary/50" />
               </div>
               <div className="flex gap-2">
                   <Button size="sm" className="flex-1 text-xs" onClick={() => { setTransactType('deposit'); setShowTransactModal(true); }}>
                       <ArrowDownLeft size={14} className="mr-1"/> Deposit
                   </Button>
                   <Button size="sm" variant="outline" className="flex-1 text-xs" onClick={() => { setTransactType('withdraw'); setShowTransactModal(true); }}>
                       <ArrowUpRight size={14} className="mr-1"/> Withdraw
                   </Button>
               </div>
            </div>
         </div>

         {/* Transaction Modal */}
         {showTransactModal && (
             <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
                 <div className="w-full max-w-sm glass-panel-heavy p-8 rounded-3xl relative border border-white/10">
                     <button onClick={() => setShowTransactModal(false)} className="absolute top-4 right-4 text-gray-500 hover:text-white"><X/></button>
                     <h2 className="text-xl font-bold mb-1 capitalize">{transactType} Funds</h2>
                     <p className="text-xs text-gray-400 mb-6">
                         {transactType === 'deposit' ? 'Min: 100 RWF' : 'Min: 500 RWF'}
                     </p>
                     
                     <div className="space-y-4">
                         <div className="space-y-2">
                             <label className="text-xs text-gray-400 font-bold ml-1">Amount (RWF)</label>
                             <input 
                                type="number"
                                className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white text-lg font-bold focus:border-primary focus:outline-none"
                                placeholder="0"
                                value={transactAmount}
                                onChange={(e) => setTransactAmount(e.target.value)}
                             />
                         </div>
                         <Button className="w-full" onClick={handleTransaction} isLoading={transactLoading}>
                             Confirm {transactType}
                         </Button>
                     </div>
                 </div>
             </div>
         )}

         {/* View Tabs */}
         <div className="flex gap-4 border-b border-white/5">
             <button 
                onClick={() => setViewMode('tickets')}
                className={`pb-3 text-sm font-bold transition-colors border-b-2 ${viewMode === 'tickets' ? 'text-white border-primary' : 'text-gray-500 border-transparent hover:text-white'}`}
             >
                 Active Tickets
             </button>
             <button 
                onClick={() => setViewMode('transactions')}
                className={`pb-3 text-sm font-bold transition-colors border-b-2 ${viewMode === 'transactions' ? 'text-white border-primary' : 'text-gray-500 border-transparent hover:text-white'}`}
             >
                 Transaction History
             </button>
         </div>

         {loading ? (
             <div className="text-center py-20 text-gray-500 animate-pulse">
                <p>Syncing wallet...</p>
             </div>
         ) : viewMode === 'transactions' ? (
             <div className="space-y-4">
                 {transactions.length === 0 ? (
                     <div className="text-center py-20 text-gray-500">No transactions found.</div>
                 ) : transactions.map(tx => (
                     <div key={tx.transactionId} className="glass-panel p-4 rounded-xl flex items-center justify-between">
                         <div className="flex items-center gap-4">
                             <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                                 tx.type === 'deposit' ? 'bg-green-500/10 text-green-500' : 
                                 tx.type === 'withdrawal' ? 'bg-red-500/10 text-red-500' : 'bg-blue-500/10 text-blue-500'
                             }`}>
                                 {tx.type === 'deposit' ? <ArrowDownLeft size={20}/> : <ArrowUpRight size={20}/>}
                             </div>
                             <div>
                                 <p className="font-bold text-white capitalize">{tx.type}</p>
                                 <p className="text-xs text-gray-400">{new Date(tx.createdAt).toLocaleDateString()}</p>
                             </div>
                         </div>
                         <p className={`font-mono font-bold ${tx.type === 'deposit' ? 'text-green-400' : 'text-white'}`}>
                             {tx.type === 'deposit' ? '+' : '-'}{formatRWF(tx.amount)}
                         </p>
                     </div>
                 ))}
             </div>
         ) : (
             <div className="space-y-6">
                {bookings.length > 0 ? bookings.map(booking => {
                const route = allRoutes.find(r => r.routeId === booking.routeId);
                const bus = buses.find(b => b.busId === booking.busId);
                
                if (!route) return null; // Skip if route data missing (e.g., deleted)

                const isTracking = trackingBusId === bus?.busId;

                return (
                    <div key={booking.bookingId} className="flex flex-col gap-4">
                        <div className="glass-panel rounded-3xl overflow-hidden flex flex-col md:flex-row relative group border border-white/5 hover:border-primary/20 transition-all">
                        {/* Ticket Left */}
                        <div className="flex-1 p-8 relative">
                            <div className="flex justify-between items-start mb-8">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-primary/20 text-primary flex items-center justify-center">
                                    <Bus size={20} />
                                    </div>
                                    <span className="font-display font-bold text-xl tracking-wide">Inzira<span className="text-primary">Seat</span></span>
                                </div>
                                <span className="px-3 py-1 rounded-full bg-green-500/20 text-green-400 text-xs font-bold uppercase border border-green-500/20">
                                    {booking.status}
                                </span>
                            </div>
    
                            <div className="flex items-center gap-8 mb-8">
                                <div>
                                    <p className="text-xs text-gray-500 uppercase font-bold mb-1">From</p>
                                    <p className="text-2xl font-bold text-white">{route.from}</p>
                                    <p className="text-sm text-gray-400">{new Date(route.departureTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</p>
                                </div>
                                <div className="flex-1 flex flex-col items-center">
                                    <div className="w-full h-0.5 bg-white/10 relative">
                                    <div className="absolute right-0 top-1/2 -translate-y-1/2 w-2 h-2 bg-primary rounded-full"></div>
                                    <div className="absolute left-0 top-1/2 -translate-y-1/2 w-2 h-2 bg-white/20 rounded-full"></div>
                                    </div>
                                    <span className="text-xs text-gray-500 mt-2">{route.duration}</span>
                                </div>
                                <div className="text-right">
                                    <p className="text-xs text-gray-500 uppercase font-bold mb-1">To</p>
                                    <p className="text-2xl font-bold text-white">{route.to}</p>
                                </div>
                            </div>
    
                            <div className="flex gap-8 pt-6 border-t border-white/5 items-center">
                                <div>
                                    <p className="text-xs text-gray-500 uppercase font-bold mb-1">Date</p>
                                    <p className="text-sm text-white font-medium">{new Date(route.departureTime).toLocaleDateString()}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500 uppercase font-bold mb-1">Seat</p>
                                    <p className="text-sm text-white font-medium">#{booking.seatNumber}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500 uppercase font-bold mb-1">Bus</p>
                                    <p className="text-sm text-white font-medium">{bus?.busNumber || 'TBD'}</p>
                                </div>
                                <div className="ml-auto">
                                    {bus && (
                                        <Button 
                                            variant="outline" 
                                            size="sm" 
                                            className={`rounded-xl border-primary/20 text-primary hover:bg-primary/10 ${isTracking ? 'bg-primary/10' : ''}`}
                                            onClick={() => setTrackingBusId(isTracking ? null : bus.busId)}
                                        >
                                            {isTracking ? 'Hide Map' : 'Track Bus'}
                                        </Button>
                                    )}
                                </div>
                            </div>
                        </div>
    
                        {/* Ticket Right (QR) */}
                        <div className="w-full md:w-64 bg-white/5 border-l border-white/5 border-dashed relative p-8 flex flex-col items-center justify-center">
                            {/* Cutout notches */}
                            <div className="absolute -top-3 left-0 -translate-x-1/2 w-6 h-6 bg-background rounded-full"></div>
                            <div className="absolute -bottom-3 left-0 -translate-x-1/2 w-6 h-6 bg-background rounded-full"></div>
                            
                            <div className="bg-white p-3 rounded-2xl mb-4">
                                <QRCodeCanvas value={booking.qrCodeValue || booking.bookingId} size={120} />
                            </div>
                            <p className="text-xs text-gray-500 text-center font-mono break-all line-clamp-1 w-full px-2">{booking.bookingId}</p>
                            <p className="text-[10px] text-gray-600 uppercase mt-1">Scan at gate</p>
                        </div>
                        </div>

                        {/* Expandable Live Map */}
                        {isTracking && bus && (
                        <div className="animate-in slide-in-from-top-5 fade-in duration-300">
                            <LiveMap buses={buses} focusedBusId={bus.busId} height="250px" />
                        </div>
                        )}
                    </div>
                );
                }) : (
                <div className="text-center py-20 text-gray-500">
                    <Ticket size={48} className="mx-auto mb-4 opacity-50" />
                    <p>No active tickets found.</p>
                </div>
                )}
             </div>
         )}
      </div>
   );
};

// 7. Search & Booking 
const Home = ({ onBookingComplete, cities, user, routes, buses, refreshData }: { onBookingComplete: (booking: Booking) => void, cities: string[], user: User, routes: Route[], buses: BusType[], refreshData: () => void }) => {
  const [step, setStep] = useState<'search' | 'results' | 'seats' | 'payment'>('search');
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [searchResults, setSearchResults] = useState<Route[]>([]);
  const [selectedRoute, setSelectedRoute] = useState<Route | null>(null);
  const [selectedSeat, setSelectedSeat] = useState<number | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<'momo' | 'airtel' | 'wallet'>('momo');
  const [isProcessing, setIsProcessing] = useState(false);

  // Filter routes based on available database entries
  const handleSearch = () => {
     const results = routes.filter(r => 
        (from ? r.from === from : true) && 
        (to ? r.to === to : true)
     );
     setSearchResults(results); 
     setStep('results');
  };

  const handleSeatSelect = (seat: number) => {
     // Check if seat is booked (Optional: Add real check here against bookings table)
     setSelectedSeat(seat === selectedSeat ? null : seat);
  };

  const handlePayment = async () => {
    if (!selectedRoute || !selectedSeat) return;
    setIsProcessing(true);
    
    try {
        if (paymentMethod === 'wallet') {
            if ((user.walletBalance || 0) < selectedRoute.price) {
                throw new Error("Insufficient wallet balance. Please deposit funds in your Wallet.");
            }
            
            // Deduct from wallet first (Serious Mode)
            const { error: txError } = await supabase.rpc('handle_wallet_transaction', {
               p_user_id: user.userId,
               p_amount: selectedRoute.price,
               p_type: 'payment',
               p_method: 'system'
           });
           if (txError) throw txError;
           await refreshData();
        }

        const qrString = `INZIRA-${selectedRoute.busId}-${selectedRoute.routeId}-${selectedSeat}-${Date.now()}`;
        
        const newBookingPayload = {
            userId: user.userId,
            busId: selectedRoute.busId,
            routeId: selectedRoute.routeId,
            seatNumber: selectedSeat,
            paymentStatus: 'paid',
            status: 'active',
            qrCodeValue: qrString,
            totalPrice: selectedRoute.price
        };

        const { data, error } = await supabase
            .from('bookings')
            .insert(newBookingPayload)
            .select()
            .single();

        if (error) throw error;

        setTimeout(() => {
            const confirmedBooking: Booking = data;
            onBookingComplete(confirmedBooking);
            setIsProcessing(false);
            setStep('search'); 
        }, 1500);

    } catch (error: any) {
        console.error("Booking Error", error);
        alert(error.message || "Booking failed. Please try again.");
        setIsProcessing(false);
    }
  };

  // --- Search View ---
  if (step === 'search') {
      return (
        <div className="pb-20 space-y-12 animate-in fade-in duration-500">
          <div className="relative rounded-[3rem] overflow-hidden min-h-[500px] flex flex-col items-center justify-center text-center p-6 border border-white/10 bg-black">
             {/* Gradient Background */}
             <div className="absolute inset-0 bg-gradient-to-br from-[#0f1016] via-[#050508] to-black"></div>
             {/* Cyber Grid Pattern */}
             <div className="absolute inset-0 grid-bg opacity-30"></div>
             
             {/* Decorative Elements */}
             <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-primary/10 rounded-full blur-3xl animate-blob"></div>
             <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-secondary/10 rounded-full blur-3xl animate-blob animation-delay-2000"></div>

             <div className="relative z-10 max-w-4xl space-y-6">
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-primary/20 bg-primary/10 text-primary text-xs font-bold uppercase tracking-widest backdrop-blur-md animate-in fade-in zoom-in duration-500">
                   <Zap size={12} fill="currentColor" /> Next-Gen Transport
                </div>
                <h1 className="text-6xl md:text-8xl font-display font-bold leading-tight">
                   Kigali <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-emerald-400">Mover.</span>
                </h1>
                <p className="text-xl text-gray-400 max-w-xl mx-auto">
                   The fastest way to travel across Rwanda. AI-optimized routes, secure payments, and premium comfort.
                </p>
             </div>
             
             {/* Search Command Bar */}
             <div className="relative z-20 mt-12 w-full max-w-3xl">
                <div className="glass-panel-heavy p-2 rounded-full flex flex-col md:flex-row items-center gap-2 shadow-2xl shadow-primary/5 border border-white/10">
                   <div className="flex-1 w-full relative">
                      <MapPin className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-500" size={20} />
                      <select className="w-full bg-transparent h-14 pl-14 text-white font-medium focus:outline-none appearance-none cursor-pointer" onChange={e => setFrom(e.target.value)}>
                         <option value="" className="bg-surface">From: Where are you?</option>
                         {cities.map((c: string) => <option key={c} value={c} className="bg-surface">{c}</option>)}
                      </select>
                   </div>
                   <div className="w-px h-8 bg-white/10 hidden md:block"></div>
                   <div className="flex-1 w-full relative">
                      <Navigation className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-500" size={20} />
                      <select className="w-full bg-transparent h-14 pl-14 text-white font-medium focus:outline-none appearance-none cursor-pointer" onChange={e => setTo(e.target.value)}>
                         <option value="" className="bg-surface">To: Where you going?</option>
                         {cities.map((c: string) => <option key={c} value={c} className="bg-surface">{c}</option>)}
                      </select>
                   </div>
                   <Button size="lg" className="rounded-full px-8 shadow-xl" onClick={handleSearch}>
                      Search
                   </Button>
                </div>
             </div>
          </div>
          
          {/* Featured Destinations (3D Tilt Cards) */}
          <div className="max-w-7xl mx-auto px-4">
             <h2 className="text-2xl font-bold mb-8">Trending Destinations</h2>
             <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {[
                   { name: 'Musanze', gradient: 'bg-gradient-to-br from-emerald-900 to-green-800', price: '3,500 RWF', icon: <MapPin className="text-emerald-400" /> },
                   { name: 'Rubavu', gradient: 'bg-gradient-to-br from-blue-900 to-cyan-800', price: '4,000 RWF', icon: <Navigation className="text-cyan-400" /> },
                   { name: 'Akagera', gradient: 'bg-gradient-to-br from-yellow-900 to-orange-800', price: '5,500 RWF', icon: <Globe className="text-yellow-400" /> },
                ].map((city, i) => (
                   <div key={i} className={`group relative h-[300px] rounded-[2.5rem] overflow-hidden cursor-pointer hover:shadow-2xl hover:shadow-primary/20 transition-all duration-500 ${city.gradient}`}>
                      {/* Abstract Shapes */}
                      <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl group-hover:bg-white/10 transition-colors"></div>
                      <div className="absolute bottom-0 left-0 w-32 h-32 bg-black/20 rounded-full translate-y-1/2 -translate-x-1/2 blur-xl"></div>
                      
                      <div className="absolute inset-0 flex flex-col justify-between p-8">
                         <div className="flex justify-end">
                            <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center backdrop-blur-md border border-white/10">
                                {city.icon}
                            </div>
                         </div>
                         <div>
                            <h3 className="text-4xl font-display font-bold text-white mb-2">{city.name}</h3>
                            <div className="flex items-center gap-3">
                                <span className="px-3 py-1 bg-white/10 backdrop-blur-md rounded-full text-xs font-bold text-white border border-white/10">Popular Route</span>
                                <span className="text-white/80 font-bold">{city.price}</span>
                            </div>
                         </div>
                      </div>
                   </div>
                ))}
             </div>
          </div>
        </div>
      );
  }

  // --- Results View ---
  if (step === 'results') {
      return (
          <div className="max-w-4xl mx-auto space-y-6 animate-in slide-in-from-right duration-500">
              <div className="flex items-center gap-4 mb-8">
                  <Button variant="ghost" onClick={() => setStep('search')}><ChevronLeft /></Button>
                  <h2 className="text-2xl font-bold">Select a Trip</h2>
              </div>
              
              {searchResults.length === 0 ? (
                  <div className="text-center py-20 text-gray-500">No trips found for this route.</div>
              ) : searchResults.map(route => {
                  const bus = buses.find(b => b.busId === route.busId);
                  return (
                    <div key={route.routeId} className="glass-panel p-6 rounded-3xl flex flex-col md:flex-row items-center justify-between gap-6 hover:border-primary/50 transition-colors">
                        <div className="flex items-center gap-6">
                            <div className="w-16 h-16 rounded-2xl bg-white text-black flex items-center justify-center font-bold text-xl">
                                Bus
                            </div>
                            <div>
                                <div className="flex items-center gap-3 mb-1">
                                    <h3 className="text-xl font-bold text-white">{formatRWF(route.price)}</h3>
                                    <span className="px-2 py-0.5 rounded-full bg-white/10 text-xs text-gray-400">{bus?.amenities?.join(' • ') || 'Standard'}</span>
                                </div>
                                <div className="flex items-center gap-2 text-gray-400 text-sm">
                                    <span>{new Date(route.departureTime).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}</span>
                                    <ArrowRight size={14} />
                                    <span>{new Date(route.arrivalTime || '').toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}</span>
                                    <span className="text-gray-500">• {route.duration}</span>
                                </div>
                            </div>
                        </div>
                        <Button onClick={() => { setSelectedRoute(route); setStep('seats'); }}>Select Seats</Button>
                    </div>
                  );
              })}
          </div>
      );
  }

  // --- Seat Selection View ---
  if (step === 'seats' && selectedRoute) {
      return (
          <div className="max-w-2xl mx-auto space-y-8 animate-in slide-in-from-right duration-500">
              <div className="flex items-center gap-4">
                  <Button variant="ghost" onClick={() => setStep('results')}><ChevronLeft /></Button>
                  <h2 className="text-2xl font-bold">Choose your seat</h2>
              </div>

              <div className="glass-panel p-8 rounded-3xl text-center">
                  {/* Driver Area */}
                  <div className="flex justify-end mb-10 px-8">
                      <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-gray-500">
                          <Users2 size={20} />
                      </div>
                  </div>
                  
                  {/* Seat Grid */}
                  <div className="grid grid-cols-4 gap-4 max-w-sm mx-auto">
                      {Array.from({ length: 32 }).map((_, i) => {
                          const seatNum = i + 1;
                          // In a real app, check against bookings for this route/date
                          const isBooked = false; 
                          const isSelected = selectedSeat === seatNum;
                          
                          return (
                              <button
                                key={seatNum}
                                disabled={isBooked}
                                onClick={() => handleSeatSelect(seatNum)}
                                className={`
                                    h-12 rounded-xl text-xs font-bold transition-all duration-300 relative
                                    ${isBooked ? 'bg-white/5 text-gray-600 cursor-not-allowed' : 
                                      isSelected ? 'bg-primary text-black shadow-[0_0_15px_rgba(0,220,130,0.5)] scale-105' : 
                                      'bg-white/10 text-white hover:bg-white/20 border border-white/10'}
                                `}
                              >
                                  {seatNum}
                                  {isBooked && <div className="absolute inset-0 flex items-center justify-center"><X size={16} /></div>}
                              </button>
                          );
                      })}
                  </div>

                  <div className="flex justify-center gap-6 mt-10 text-xs text-gray-400 font-medium">
                      <div className="flex items-center gap-2"><div className="w-3 h-3 rounded bg-white/10 border border-white/10"></div> Available</div>
                      <div className="flex items-center gap-2"><div className="w-3 h-3 rounded bg-primary"></div> Selected</div>
                      <div className="flex items-center gap-2"><div className="w-3 h-3 rounded bg-white/5 text-gray-600"></div> Booked</div>
                  </div>
              </div>
              
              <div className="fixed bottom-0 left-0 right-0 p-4 bg-black/80 backdrop-blur-xl border-t border-white/10 flex items-center justify-between md:relative md:bg-transparent md:border-0 md:p-0">
                  <div>
                      <p className="text-sm text-gray-400">Total Price</p>
                      <p className="text-2xl font-bold text-white">{formatRWF(selectedRoute.price)}</p>
                  </div>
                  <Button size="lg" disabled={!selectedSeat} onClick={() => setStep('payment')}>Proceed to Pay</Button>
              </div>
          </div>
      );
  }

  // --- Payment View ---
  if (step === 'payment' && selectedRoute) {
      return (
          <div className="max-w-md mx-auto space-y-8 animate-in slide-in-from-right duration-500">
               <div className="flex items-center gap-4">
                  <Button variant="ghost" onClick={() => setStep('seats')}><ChevronLeft /></Button>
                  <h2 className="text-2xl font-bold">Secure Payment</h2>
              </div>

              <div className="glass-panel p-6 rounded-3xl space-y-6">
                  <div className="space-y-4">
                      {/* Wallet Option */}
                      <div 
                        onClick={() => setPaymentMethod('wallet')}
                        className={`p-4 rounded-2xl border cursor-pointer flex items-center justify-between transition-all ${paymentMethod === 'wallet' ? 'bg-primary/10 border-primary text-primary' : 'bg-white/5 border-white/10 hover:bg-white/10'}`}
                      >
                          <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-black font-bold"><Wallet size={18}/></div>
                              <div>
                                  <span className="font-bold block">Inzira Wallet</span>
                                  <span className="text-xs opacity-70">Balance: {formatRWF(user.walletBalance || 0)}</span>
                              </div>
                          </div>
                          {paymentMethod === 'wallet' && <div className="w-4 h-4 rounded-full bg-primary"></div>}
                      </div>

                      <div 
                        onClick={() => setPaymentMethod('momo')}
                        className={`p-4 rounded-2xl border cursor-pointer flex items-center justify-between transition-all ${paymentMethod === 'momo' ? 'bg-accent/10 border-accent text-accent' : 'bg-white/5 border-white/10 hover:bg-white/10'}`}
                      >
                          <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-full bg-yellow-400 flex items-center justify-center text-black font-bold">M</div>
                              <span className="font-bold">MTN MoMo</span>
                          </div>
                          {paymentMethod === 'momo' && <div className="w-4 h-4 rounded-full bg-accent"></div>}
                      </div>
                      
                      <div 
                        onClick={() => setPaymentMethod('airtel')}
                        className={`p-4 rounded-2xl border cursor-pointer flex items-center justify-between transition-all ${paymentMethod === 'airtel' ? 'bg-red-500/10 border-red-500 text-red-500' : 'bg-white/5 border-white/10 hover:bg-white/10'}`}
                      >
                          <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-full bg-red-600 flex items-center justify-center text-white font-bold">A</div>
                              <span className="font-bold">Airtel Money</span>
                          </div>
                          {paymentMethod === 'airtel' && <div className="w-4 h-4 rounded-full bg-red-500"></div>}
                      </div>
                  </div>

                  {paymentMethod !== 'wallet' && (
                      <div className="pt-4 border-t border-white/5">
                          <Input label="Phone Number" placeholder="078..." icon={<span className="text-xs font-bold">RW</span>} />
                      </div>
                  )}

                  <Button className="w-full h-14 text-lg" onClick={handlePayment} isLoading={isProcessing}>
                      Pay {formatRWF(selectedRoute.price)}
                  </Button>
                  
                  <p className="text-xs text-center text-gray-500 flex items-center justify-center gap-2">
                      <Lock size={12} /> Encrypted & Secure Payment
                  </p>
              </div>
          </div>
      );
  }

  return null;
};

// 8. Auth Screen (No changes needed for this block, using previous implementation)
const AuthScreen = ({ onLogin }: { onLogin: (user: any) => void }) => {
  const [activeTab, setActiveTab] = useState<'passenger' | 'company' | 'admin'>('passenger');
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (isLogin) {
        // LOGIN FLOW
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
        
        // Check Role
        const { data: userData, error: userError } = await supabase
            .from('users')
            .select('*')
            .eq('userId', data.user.id)
            .single();

        if (userError) throw userError;

        // Strict Role Enforcement
        if (activeTab === 'admin' && userData.role !== 'systemAdmin') {
            throw new Error("Access Denied: This portal is for System Administrators only.");
        }
        if (activeTab === 'company' && userData.role !== 'companyAdmin') {
            throw new Error("Access Denied: Please use the Passenger portal or contact support.");
        }
        
        const appUser: User = {
            userId: userData.userId,
            email: userData.email,
            fullName: userData.fullName,
            role: userData.role,
            phone: userData.phone,
            companyId: userData.companyId,
            walletBalance: userData.walletBalance || 0
        };

        if (data.user) onLogin(appUser);

      } else {
        // SIGN UP FLOW (Passenger Only)
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: { fullName, role: 'passenger' },
          },
        });
        if (error) throw error;
        if (data.user) {
             const { error: dbError } = await supabase.from('users').insert({
                 userId: data.user.id,
                 email: data.user.email,
                 fullName: fullName,
                 role: 'passenger',
                 phone: phone,
                 walletBalance: 0
             });
             if (dbError) throw dbError;
             
             // Auto login user object
             const appUser: User = {
                userId: data.user.id,
                email: data.user.email || '',
                fullName: fullName,
                role: 'passenger',
                phone: phone,
                walletBalance: 0
             };
             onLogin(appUser);
        }
      }
    } catch (err: any) {
      setError(err.message);
      await supabase.auth.signOut(); 
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-[100px] animate-blob"></div>
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-secondary/20 rounded-full blur-[100px] animate-blob animation-delay-2000"></div>
          <div className="absolute inset-0 grid-bg opacity-20"></div>
      </div>

      <div className="w-full max-w-md glass-panel-heavy p-8 rounded-[2.5rem] relative z-10 border border-white/10 shadow-2xl">
         <div className="text-center mb-8">
            <div className={`w-16 h-16 rounded-2xl mx-auto mb-6 flex items-center justify-center shadow-[0_0_30px_rgba(0,0,0,0.5)] transition-all duration-500 ${
                activeTab === 'admin' ? 'bg-accent text-black shadow-accent/50' : 
                activeTab === 'company' ? 'bg-secondary text-white shadow-secondary/50' : 
                'bg-gradient-to-br from-primary to-emerald-600 text-black shadow-primary/50'
            }`}>
                <Zap size={32} fill="currentColor" />
            </div>
            <h1 className="text-3xl font-display font-bold mb-2">Inzira<span className={activeTab === 'admin' ? 'text-accent' : activeTab === 'company' ? 'text-secondary' : 'text-primary'}>Seat</span></h1>
            <p className="text-gray-400">
                {activeTab === 'admin' ? 'System Command Center' : activeTab === 'company' ? 'Operator Portal' : 'Next-Gen Transport'}
            </p>
         </div>

         {/* Portal Tabs */}
         <div className="grid grid-cols-3 gap-2 mb-8 p-1 bg-white/5 rounded-xl">
             <button 
                onClick={() => { setActiveTab('passenger'); setIsLogin(true); setError(''); }}
                className={`py-2 text-xs font-bold rounded-lg transition-all ${activeTab === 'passenger' ? 'bg-primary text-black' : 'text-gray-500 hover:text-white'}`}
             >
                 Passenger
             </button>
             <button 
                onClick={() => { setActiveTab('company'); setIsLogin(true); setError(''); }}
                className={`py-2 text-xs font-bold rounded-lg transition-all ${activeTab === 'company' ? 'bg-secondary text-white' : 'text-gray-500 hover:text-white'}`}
             >
                 Company
             </button>
             <button 
                onClick={() => { setActiveTab('admin'); setIsLogin(true); setError(''); }}
                className={`py-2 text-xs font-bold rounded-lg transition-all ${activeTab === 'admin' ? 'bg-accent text-black' : 'text-gray-500 hover:text-white'}`}
             >
                 Admin
             </button>
         </div>

         <form onSubmit={handleAuth} className="space-y-4">
            {!isLogin && activeTab === 'passenger' && (
                <>
                <Input 
                    placeholder="Full Name" 
                    value={fullName} 
                    onChange={e => setFullName(e.target.value)} 
                    icon={<UserIcon size={18} />}
                    required
                />
                <Input 
                    placeholder="Phone Number" 
                    value={phone} 
                    onChange={e => setPhone(e.target.value)} 
                    icon={<span className="text-xs font-bold">RW</span>}
                    required
                />
                </>
            )}
            
            {(isLogin || activeTab === 'passenger') && (
                <>
                <Input 
                    type="email" 
                    placeholder="Email Address" 
                    value={email} 
                    onChange={e => setEmail(e.target.value)} 
                    icon={<Mail size={18} />}
                    required
                />
                <Input 
                    type="password" 
                    placeholder="Password" 
                    value={password} 
                    onChange={e => setPassword(e.target.value)} 
                    icon={<LockIcon size={18} />}
                    required
                />
                </>
            )}

            {/* Restricted Access Warning */}
            {!isLogin && activeTab !== 'passenger' && (
                <div className="p-4 bg-white/5 border border-dashed border-white/20 rounded-xl text-center">
                    <ShieldAlert className="mx-auto mb-2 text-gray-400" size={24} />
                    <p className="text-xs text-gray-400 mb-2">Restricted Access</p>
                    <p className="text-xs text-gray-500">Account creation for this portal is handled by the System Administrator. Please contact support.</p>
                </div>
            )}
            
            {error && <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm flex items-center gap-2 animate-in slide-in-from-top-2"><AlertTriangle size={16}/> {error}</div>}

            {(isLogin || activeTab === 'passenger') && (
                <Button className={`w-full h-12 text-base shadow-lg transition-all ${
                    activeTab === 'admin' ? 'bg-accent text-black shadow-accent/20 hover:bg-yellow-400' : 
                    activeTab === 'company' ? 'bg-secondary text-white shadow-secondary/20 hover:bg-violet-600' : 
                    'bg-primary text-black shadow-primary/20'
                }`} isLoading={loading}>
                    {isLogin ? 'Authenticate' : 'Register Account'}
                </Button>
            )}
         </form>

         {activeTab === 'passenger' && (
             <div className="mt-8 text-center">
                <p className="text-gray-400 text-sm">
                    {isLogin ? "New to Inzira?" : "Already have an account?"}
                    <button 
                        onClick={() => setIsLogin(!isLogin)}
                        className="ml-2 text-primary font-bold hover:underline"
                    >
                        {isLogin ? "Create Account" : "Sign In"}
                    </button>
                </p>
             </div>
         )}
      </div>
    </div>
  );
};

// 9. Scanner View (Same as before)
const ScannerView = ({ onScan }: { onScan: (data: string | null) => void }) => {
    const [scanResult, setScanResult] = useState<string | null>(null);

    const handleResult = (result: any, error: any) => {
        if (result) {
            setScanResult(result?.text);
            onScan(result?.text);
        }
    };

    return (
        <div className="max-w-md mx-auto space-y-8 animate-in fade-in duration-500">
            <div className="text-center">
                <h1 className="text-3xl font-display font-bold mb-2">Ticket Scanner</h1>
                <p className="text-gray-400">Align QR code within frame to validate.</p>
            </div>

            <div className="relative rounded-3xl overflow-hidden border border-primary/30 shadow-[0_0_50px_rgba(0,220,130,0.1)] bg-black aspect-square">
                <QrReader
                    onResult={handleResult}
                    constraints={{ facingMode: 'environment' }}
                    className="w-full h-full object-cover"
                />
                
                {/* Overlay UI */}
                <div className="absolute inset-0 border-[30px] border-black/50 pointer-events-none flex items-center justify-center">
                    <div className="w-64 h-64 border-2 border-primary/50 rounded-3xl relative">
                        <div className="absolute top-0 left-0 w-6 h-6 border-t-4 border-l-4 border-primary -translate-x-1 -translate-y-1"></div>
                        <div className="absolute top-0 right-0 w-6 h-6 border-t-4 border-r-4 border-primary translate-x-1 -translate-y-1"></div>
                        <div className="absolute bottom-0 left-0 w-6 h-6 border-b-4 border-l-4 border-primary -translate-x-1 translate-y-1"></div>
                        <div className="absolute bottom-0 right-0 w-6 h-6 border-b-4 border-r-4 border-primary translate-x-1 translate-y-1"></div>
                        
                        {/* Scanning Laser */}
                        <div className="absolute top-0 left-0 right-0 h-1 bg-primary/50 shadow-[0_0_10px_#10b981] animate-scan"></div>
                    </div>
                </div>
            </div>

            {scanResult && (
                <div className="glass-panel p-4 rounded-xl flex items-center gap-3 border border-primary/30 bg-primary/10">
                    <CheckCircle2 className="text-primary" />
                    <div>
                        <p className="text-xs text-primary font-bold uppercase">Scanned Successfully</p>
                        <p className="text-sm font-mono truncate w-64">{scanResult}</p>
                    </div>
                </div>
            )}
        </div>
    );
};

// --- Main App Component ---

const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [activeView, setActiveView] = useState<string>('search');
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [notification, setNotification] = useState<{msg: string, type: 'success'|'error'} | null>(null);
  
  // Data State
  const [routes, setRoutes] = useState<Route[]>([]);
  const [buses, setBuses] = useState<BusType[]>([]);
  const [staff, setStaff] = useState<Staff[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [maintenance, setMaintenance] = useState<MaintenanceLog[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);

  // Use this to trigger re-fetches
  const refreshData = async () => {
      // Re-fetch buses
      const { data: busData } = await supabase.from('buses').select('*');
      if (busData) setBuses(busData as BusType[]);
      
      const { data: staffData } = await supabase.from('staff').select('*');
      if (staffData) setStaff(staffData as Staff[]);

      const { data: companyData } = await supabase.from('companies').select('*');
      if (companyData) setCompanies(companyData as Company[]);
      
      // Re-fetch user profile if needed
      if (currentUser) {
          const { data: user } = await supabase.from('users').select('*').eq('userId', currentUser.userId).single();
          if (user) setCurrentUser({...user, userId: user.userId}); // Ensure types match
      }
  };

  // Initial Data Load
  useEffect(() => {
    const fetchGlobalData = async () => {
        const { data: rData } = await supabase.from('routes').select('*');
        if (rData) setRoutes(rData as Route[]);
        
        const { data: bData } = await supabase.from('buses').select('*');
        if (bData) setBuses(bData as BusType[]);

        const { data: cData } = await supabase.from('companies').select('*');
        if (cData) setCompanies(cData as Company[]);

        const { data: sData } = await supabase.from('staff').select('*');
        if (sData) setStaff(sData as Staff[]);

        const { data: mData } = await supabase.from('maintenance_logs').select('*');
        if (mData) setMaintenance(mData as MaintenanceLog[]);

        const { data: aData } = await supabase.from('audit_logs').select('*').limit(20).order('timestamp', { ascending: false });
        if (aData) setAuditLogs(aData as AuditLog[]);

        const { data: bkData } = await supabase.from('bookings').select('*');
        if (bkData) setBookings(bkData as Booking[]);
    };
    fetchGlobalData();
  }, []);

  // Auth State Listener
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) handleLogin(session.user);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session?.user) {
          setCurrentUser(null);
          setActiveView('search'); // Reset view on logout
      } else {
          handleLogin(session.user);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleLogin = async (user: any) => {
    // If we passed the full appUser object from AuthScreen, use it
    if ((user as User).role) {
        setCurrentUser(user as User);
        if (user.role === 'companyAdmin') setActiveView('mission-control');
        else if (user.role === 'systemAdmin') setActiveView('system-dashboard');
        return;
    }

    // Otherwise fetch from DB (session restore)
    const { data } = await supabase.from('users').select('*').eq('userId', user.id).single();
    if (data) {
        const appUser: User = {
            userId: user.id,
            email: user.email,
            fullName: data.fullName,
            role: data.role,
            phone: data.phone,
            companyId: data.companyId,
            walletBalance: data.walletBalance || 0
        };
        setCurrentUser(appUser);
        
        if (data.role === 'companyAdmin') setActiveView('mission-control');
        else if (data.role === 'systemAdmin') setActiveView('system-dashboard');
        else if (activeView === 'search') setActiveView('search');
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setCurrentUser(null);
    setActiveView('search');
    window.location.reload(); // Hard reset state
  };

  const handleBookingComplete = (newBooking: Booking) => {
      showNotification('Booking Confirmed! Ticket added to wallet.', 'success');
      refreshData(); // Refresh to update wallet balance if used
      setActiveView('my-bookings');
  };

  const handleScan = (data: string | null) => {
    if (!data) return;
    if (data.startsWith('INZIRA-')) {
          showNotification(`Ticket Verified! Boarding passenger...`, 'success');
    } else {
       showNotification('Invalid QR Code format', 'error');
    }
  };

  const showNotification = (msg: string, type: 'success'|'error') => {
    setNotification({ msg, type });
    setTimeout(() => setNotification(null), 4000);
  };

  // --- Render ---
  if (!currentUser) {
    return <AuthScreen onLogin={handleLogin} />;
  }

  return (
    <div className="min-h-screen bg-background text-gray-200 flex">
      <Sidebar 
        user={currentUser} 
        activeView={activeView} 
        setView={setActiveView} 
        onLogout={handleLogout}
        isMobileOpen={isMobileOpen}
        setIsMobileOpen={setIsMobileOpen}
      />

      {/* Main Content Area */}
      <main className="flex-1 min-w-0 md:pl-20 lg:pl-72 relative">
        {/* Mobile Header */}
        <div className="md:hidden sticky top-0 z-40 glass-panel-heavy px-4 py-3 flex items-center justify-between border-b border-white/5">
           <div className="flex items-center gap-2">
              <Zap size={20} className="text-primary" fill="currentColor" />
              <span className="font-display font-bold">Inzira</span>
           </div>
           <button onClick={() => setIsMobileOpen(true)} className="p-2 text-gray-400">
              <Menu />
           </button>
        </div>

        {/* Content Container */}
        <div className="max-w-7xl mx-auto p-4 md:p-8 lg:p-12">
           {activeView === 'search' && <Home onBookingComplete={handleBookingComplete} cities={CITIES} user={currentUser} routes={routes} buses={buses} refreshData={refreshData} />}
           {activeView === 'my-bookings' && <WalletView user={currentUser} buses={buses} routes={routes} refreshData={refreshData} />}
           
           {activeView === 'mission-control' && <MissionControl buses={buses} staff={staff} maintenance={maintenance} bookings={bookings} />}
           {activeView === 'fleet' && <FleetView buses={buses} companyId={currentUser.companyId || 'c1'} refreshData={refreshData} />}
           {activeView === 'staff' && <StaffView staff={staff} refreshData={refreshData} companyId={currentUser.companyId || 'c1'} />}
           {activeView === 'scanner' && <ScannerView onScan={handleScan} />}
           
           {activeView === 'system-dashboard' && <SystemDashboard auditLogs={auditLogs} companiesCount={companies.length} bookings={bookings} />}
           {activeView === 'companies' && <CompanyManagement companies={companies} refreshData={refreshData} />}
           {activeView === 'analytics' && <GlobalAnalytics bookings={bookings} />}
           {activeView === 'audit' && <FullAuditLogs logs={auditLogs} />}
           {activeView === 'settings' && <SettingsView user={currentUser} onLogout={handleLogout} refreshUser={refreshData} />}
        </div>
      </main>

      {/* AI Assistant */}
      <AIAssistant onNavigate={setActiveView} />

      {/* Notification Toast */}
      {notification && (
        <div className={`fixed top-6 right-6 z-[200] px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-3 animate-in slide-in-from-top-4 fade-in duration-300 ${
           notification.type === 'success' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/50' : 'bg-red-500/20 text-red-400 border border-red-500/50'
        }`}>
           {notification.type === 'success' ? <CheckCircle2 size={20} /> : <AlertCircle size={20} />}
           <span className="font-bold">{notification.msg}</span>
        </div>
      )}
    </div>
  );
};

export default App;
