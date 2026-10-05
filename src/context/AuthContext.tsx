import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, ClubSession, SpecialEvent, AttendanceRecord } from '../types';
import { INITIAL_CLUB_SESSIONS, INITIAL_SPECIAL_EVENTS } from '../data/mockData';
import { 
  isSupabaseConfigured,
  supabase,
  getMemberByAuthId,
  getRemoteRoster,
  deleteRemoteMember,
  getRemoteSessions, 
  upsertRemoteSession, 
  deleteRemoteSession,
  getRemoteEvents,
  upsertRemoteEvent,
  deleteRemoteEvent
} from '../lib/supabase';

interface AuthContextType {
  currentUser: User | null;
  allMembers: User[];
  isAdmin: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; message?: string }>;
  signup: (userData: Partial<User>, password: string) => Promise<{ success: boolean; message?: string }>;
  updateProfile: (updatedData: Partial<User>) => void;
  logout: () => void;
  // Sessions & Calendar (Admin editable)
  sessions: ClubSession[];
  addSession: (session: Omit<ClubSession, 'id'>) => Promise<void>;
  updateSession: (session: ClubSession) => Promise<void>;
  deleteSession: (sessionId: string) => Promise<void>;
  // Special Events (Admin editable)
  events: SpecialEvent[];
  addEvent: (event: Omit<SpecialEvent, 'id' | 'registeredCount'>) => Promise<void>;
  updateEvent: (event: SpecialEvent) => Promise<void>;
  deleteEvent: (eventId: string) => Promise<void>;
  registerForEvent: (eventId: string) => boolean;
  unregisterForEvent: (eventId: string) => void;
  userRegisteredEvents: string[];
  // Attendance records for barcode / QR scanner
  attendanceRecords: AttendanceRecord[];
  recordAttendance: (input: string) => { success: boolean; studentName?: string; message: string };
  removeAttendanceRecord: (recordId: string) => void;
  clearAttendance: () => void;
  refreshRoster: () => Promise<void>;
  deleteMember: (memberId: string) => Promise<{ success: boolean; message?: string }>;
  promoteMemberToExecutive: (memberId: string) => Promise<{ success: boolean; message?: string }>;
  // Admin Calendar Modal
  isAdminCalendarModalOpen: boolean;
  setIsAdminCalendarModalOpen: (open: boolean) => void;
  editingSession: ClubSession | null;
  setEditingSession: (session: ClubSession | null) => void;
  supabaseConnected: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [allMembers, setAllMembers] = useState<User[]>(() => {
    const saved = localStorage.getItem('dtpbc_members_v5');
    return saved ? JSON.parse(saved) : [];
  });

  const [currentUser, setCurrentUser] = useState<User | null>(null);

  const [sessions, setSessions] = useState<ClubSession[]>(() => {
    const saved = localStorage.getItem('dtpbc_sessions_v5');
    return saved ? JSON.parse(saved) : INITIAL_CLUB_SESSIONS;
  });

  const [events, setEvents] = useState<SpecialEvent[]>(() => {
    const saved = localStorage.getItem('dtpbc_events_v5');
    return saved ? JSON.parse(saved) : INITIAL_SPECIAL_EVENTS;
  });

  const [userRegisteredEvents, setUserRegisteredEvents] = useState<string[]>(() => {
    const saved = localStorage.getItem('dtpbc_user_events_v5');
    return saved ? JSON.parse(saved) : [];
  });

  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>(() => {
    const saved = localStorage.getItem('dtpbc_attendance_v5');
    return saved ? JSON.parse(saved) : [
      {
        id: 'att-1',
        memberId: 'PB-1001',
        studentId: '1842109',
        studentName: 'Noah Park',
        grade: 'Grade 11',
        timestamp: 'Today at 3:18 PM',
        scannedBy: 'Mr. Willy Wan',
      },
      {
        id: 'att-2',
        memberId: 'PB-1002',
        studentId: '1910432',
        studentName: 'Karson Kung',
        grade: 'Grade 9',
        timestamp: 'Today at 3:20 PM',
        scannedBy: 'Noah Park (President)',
      }
    ];
  });

  const [isAdminCalendarModalOpen, setIsAdminCalendarModalOpen] = useState<boolean>(false);
  const [editingSession, setEditingSession] = useState<ClubSession | null>(null);

  const isAdmin = currentUser?.role === 'executive' || currentUser?.role === 'sponsor_teacher';

  // Supabase Auth is the source of truth for signed-in users.
  const refreshRoster = async () => {
    if (!isSupabaseConfigured) return;
    const roster = await getRemoteRoster();
    if (roster) {
      setAllMembers(roster);
      localStorage.setItem('dtpbc_members_v5', JSON.stringify(roster));
    }
  };

  const promoteMemberToExecutive = async (memberId: string) => {
    if (!isAdmin) return { success: false, message: 'Executive or teacher sponsor access required.' };
    const result = await promoteRemoteMemberToExecutive(memberId);
    if (result.success) await refreshRoster();
    return result;
  };

  const deleteMember = async (memberId: string) => {
    if (!isAdmin) return { success: false, message: 'Executive access required.' };
    if (memberId === currentUser?.id) return { success: false, message: 'You cannot delete your own account from the roster.' };
    const result = await deleteRemoteMember(memberId);
    if (result.success) setAllMembers(prev => prev.filter(member => member.id !== memberId));
    return result;
  };

  useEffect(() => {
    if (!supabase) return;

    const loadCurrentUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const profile = await getMemberByAuthId(user.id);
      if (profile) setCurrentUser(profile);
      await refreshRoster();
    };

    loadCurrentUser();
    const { data: listener } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (!session?.user) {
        setCurrentUser(null);
        return;
      }
      const profile = await getMemberByAuthId(session.user.id);
      if (profile) setCurrentUser(profile);
      await refreshRoster();
    });
    return () => listener.subscription.unsubscribe();
  }, []);

  // Live cloud sync
  useEffect(() => {
    if (isSupabaseConfigured) {
      getRemoteSessions().then(remoteSessions => {
        if (remoteSessions && remoteSessions.length > 0) {
          setSessions(remoteSessions);
          localStorage.setItem('dtpbc_sessions_v5', JSON.stringify(remoteSessions));
        }
      });
      getRemoteEvents().then(remoteEvents => {
        if (remoteEvents && remoteEvents.length > 0) {
          setEvents(remoteEvents);
          localStorage.setItem('dtpbc_events_v5', JSON.stringify(remoteEvents));
        }
      });
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('dtpbc_members_v5', JSON.stringify(allMembers));
  }, [allMembers]);

  useEffect(() => {
    localStorage.setItem('dtpbc_sessions_v5', JSON.stringify(sessions));
  }, [sessions]);

  useEffect(() => {
    localStorage.setItem('dtpbc_events_v5', JSON.stringify(events));
  }, [events]);

  useEffect(() => {
    localStorage.setItem('dtpbc_user_events_v5', JSON.stringify(userRegisteredEvents));
  }, [userRegisteredEvents]);

  useEffect(() => {
    localStorage.setItem('dtpbc_attendance_v5', JSON.stringify(attendanceRecords));
  }, [attendanceRecords]);

  const login = async (email: string, password: string): Promise<{ success: boolean; message?: string }> => {
    if (!supabase) {
      return { success: false, message: 'Supabase is not configured. Please contact the club executive team.' };
    }

    const value = email.trim();
    if (!value.includes('@')) {
      return { success: false, message: 'Please sign in using your registered email address.' };
    }

    const { data, error } = await supabase.auth.signInWithPassword({
      email: value,
      password,
    });

    if (error || !data.user) {
      return { success: false, message: error?.message || 'Unable to sign in.' };
    }

    const profile = await getMemberByAuthId(data.user.id);
    if (!profile) {
      await supabase.auth.signOut();
      return { success: false, message: 'Your Supabase account exists, but no DTPBC member profile is linked to it yet.' };
    }

    setCurrentUser(profile);
    await refreshRoster();
    return { success: true };
  };

  const signup = async (userData: Partial<User>, password: string): Promise<{ success: boolean; message?: string }> => {
    if (!supabase) {
      return { success: false, message: 'Supabase is not configured. Please contact the club executive team.' };
    }

    const rawId = (userData.studentId || '').replace(/\\D/g, '');
    const cleanId = rawId.length === 7 ? rawId : String(Math.floor(1000000 + Math.random() * 9000000));
    const { data, error } = await supabase.auth.signUp({
      email: (userData.email || '').trim(),
      password,
      options: {
        data: {
          name: userData.name || 'David Thompson Student',
          studentId: cleanId,
          grade: userData.grade || 'Grade 9',
          skillLevel: userData.skillLevel || 'Beginner (Learning Rules)',
        },
      },
    });

    if (error || !data.user) {
      return { success: false, message: error?.message || 'Unable to create your account.' };
    }

    if (!data.session) {
      return { success: true, message: 'Account created. Please confirm your email, then sign in.' };
    }

    const profile = await getMemberByAuthId(data.user.id);
    if (!profile) {
      return { success: false, message: 'Account created, but your DTPBC member profile was not created. Please contact the executive team.' };
    }

    setCurrentUser(profile);
    await refreshRoster();
    return { success: true };
  };

  const updateProfile = (updatedData: Partial<User>) => {
    if (!currentUser) return;
    const updated: User = { ...currentUser, ...updatedData };
    setCurrentUser(updated);
    setAllMembers(prev => prev.map(m => m.id === updated.id ? updated : m));
    if (supabase) {
      supabase.from('profiles').update({
        first_name: updated.name?.trim().split(/\s+/)[0] || updated.name,
        last_name: updated.name?.trim().split(/\s+/).slice(1).join(' ') || '',
        grade: updated.grade,
        skill_level: updated.skillLevel,
      }).eq('id', updated.id).then(({ error }) => {
        if (error) console.warn('Supabase profile update error:', error.message);
      });
    }
  };

  const logout = async () => {
    if (supabase) await supabase.auth.signOut();
    setCurrentUser(null);
  };

  const recordAttendance = (input: string): { success: boolean; studentName?: string; message: string } => {
    const query = input.trim().toLowerCase();
    const cleanId = input.replace(/\D/g, '');

    // Match by 7-digit student number OR by DTPBC Member ID (e.g. "PB-1001")
    const member = allMembers.find(
      m => (cleanId.length === 7 && m.studentId === cleanId) || 
           m.studentId === query ||
           m.memberId.toLowerCase() === query
    );
    
    if (!member) {
      return {
        success: false,
        message: `ID "${input.trim()}" not found in roster. Please verify student number or member ID.`
      };
    }

    // DO NOT allow the same person to be checked in multiple times!
    const alreadyCheckedIn = attendanceRecords.find(
      a => a.studentId === member.studentId || a.memberId === member.memberId
    );
    if (alreadyCheckedIn) {
      return {
        success: false,
        studentName: member.name,
        message: `${member.name} (${member.grade}) is already checked in for today at ${alreadyCheckedIn.timestamp}!`
      };
    }

    const newRecord: AttendanceRecord = {
      id: `att-${Date.now()}`,
      memberId: member.memberId,
      studentId: member.studentId,
      studentName: member.name,
      grade: member.grade,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      scannedBy: currentUser?.name || 'Scanner',
    };

    setAttendanceRecords(prev => [newRecord, ...prev]);
    return {
      success: true,
      studentName: member.name,
      message: `Checked in ${member.name} (${member.grade}, ID #${member.studentId} · ${member.memberId}) successfully!`
    };
  };

  const removeAttendanceRecord = (recordId: string) => {
    setAttendanceRecords(prev => prev.filter(a => a.id !== recordId));
  };

  const clearAttendance = () => {
    setAttendanceRecords([]);
  };

  const addSession = async (sessionData: Omit<ClubSession, 'id'>) => {
    const newSession: ClubSession = {
      ...sessionData,
      id: `session-${Date.now()}`,
    };
    setSessions(prev => [newSession, ...prev]);
    if (isSupabaseConfigured) {
      await upsertRemoteSession(newSession);
    }
  };

  const updateSession = async (updated: ClubSession) => {
    setSessions(prev => prev.map(s => s.id === updated.id ? updated : s));
    if (isSupabaseConfigured) {
      await upsertRemoteSession(updated);
    }
  };

  const deleteSession = async (sessionId: string) => {
    setSessions(prev => prev.filter(s => s.id !== sessionId));
    if (isSupabaseConfigured) {
      try {
        await deleteRemoteSession(sessionId);
      } catch (e) {
        console.warn('Delete session error:', e);
      }
    }
  };

  const addEvent = async (eventData: Omit<SpecialEvent, 'id' | 'registeredCount'>) => {
    const newEvent: SpecialEvent = {
      ...eventData,
      id: `event-${Date.now()}`,
      registeredCount: 0,
    };
    setEvents(prev => [...prev, newEvent]);
    if (isSupabaseConfigured) {
      await upsertRemoteEvent(newEvent);
    }
  };

  const updateEvent = async (updated: SpecialEvent) => {
    setEvents(prev => prev.map(e => e.id === updated.id ? updated : e));
    if (isSupabaseConfigured) {
      await upsertRemoteEvent(updated);
    }
  };

  const deleteEvent = async (eventId: string) => {
    setEvents(prev => prev.filter(e => e.id !== eventId));
    setUserRegisteredEvents(prev => prev.filter(id => id !== eventId));
    if (isSupabaseConfigured) {
      try {
        await deleteRemoteEvent(eventId);
      } catch (e) {
        console.warn('Delete event error:', e);
      }
    }
  };

  const registerForEvent = (eventId: string): boolean => {
    if (!currentUser) return false;
    if (userRegisteredEvents.includes(eventId)) return true;
    setUserRegisteredEvents(prev => [...prev, eventId]);
    setEvents(prev =>
      prev.map(e => (e.id === eventId ? { ...e, registeredCount: e.registeredCount + 1 } : e))
    );
    return true;
  };

  const unregisterForEvent = (eventId: string) => {
    if (!userRegisteredEvents.includes(eventId)) return;
    setUserRegisteredEvents(prev => prev.filter(id => id !== eventId));
    setEvents(prev =>
      prev.map(e => (e.id === eventId ? { ...e, registeredCount: Math.max(0, e.registeredCount - 1) } : e))
    );
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        allMembers,
        isAdmin,
        login,
        signup,
        updateProfile,
        logout,
        sessions,
        addSession,
        updateSession,
        deleteSession,
        events,
        addEvent,
        updateEvent,
        deleteEvent,
        registerForEvent,
        unregisterForEvent,
        userRegisteredEvents,
        attendanceRecords,
        recordAttendance,
        removeAttendanceRecord,
        clearAttendance,
        refreshRoster,
        deleteMember,
        promoteMemberToExecutive,
        isAdminCalendarModalOpen,
        setIsAdminCalendarModalOpen,
        editingSession,
        setEditingSession,
        supabaseConnected: isSupabaseConfigured,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
