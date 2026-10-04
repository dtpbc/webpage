import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { ClubSession } from '../types';
import { 
  Clock, 
  MapPin, 
  Users, 
  Check, 
  ShieldCheck, 
  Edit3, 
  Plus, 
  ArrowLeft, 
  Calendar as CalendarIcon, 
  Trash2, 
  ChevronLeft, 
  ChevronRight,
  Filter
} from 'lucide-react';

interface SchedulePageProps {
  onNavigateHome: () => void;
  onNavigateSignUp: () => void;
}

export const SchedulePage: React.FC<SchedulePageProps> = ({ onNavigateHome, onNavigateSignUp }) => {
  const { 
    currentUser, 
    sessions,
    isAdmin,
    setIsAdminCalendarModalOpen, 
    setEditingSession,
    deleteSession
  } = useAuth();
  
  const [remindedSessionId, setRemindedSessionId] = useState<string | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // Clickable calendar state
  const [selectedDayOfWeek, setSelectedDayOfWeek] = useState<string | null>(null);
  const [currentMonthDate, setCurrentMonthDate] = useState<Date>(new Date(2026, 9, 1)); // October 2026
  const [selectedCalendarDate, setSelectedCalendarDate] = useState<number | null>(null);

  const handleReminder = (sessionId: string) => {
    setRemindedSessionId(sessionId);
    setTimeout(() => setRemindedSessionId(null), 2500);
  };

  const handleEditSession = (session: ClubSession) => {
    setEditingSession(session);
    setIsAdminCalendarModalOpen(true);
  };

  const handleDeleteSession = async (sessionId: string) => {
    await deleteSession(sessionId);
    setDeleteConfirmId(null);
  };

  // Calendar calculations
  const year = currentMonthDate.getFullYear();
  const month = currentMonthDate.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayIndex = new Date(year, month, 1).getDay(); // 0 is Sunday

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const prevMonth = () => {
    setCurrentMonthDate(new Date(year, month - 1, 1));
    setSelectedCalendarDate(null);
  };

  const nextMonth = () => {
    setCurrentMonthDate(new Date(year, month + 1, 1));
    setSelectedCalendarDate(null);
  };

  // Map days of week to sessions
  const getSessionsForDayOfWeek = (dayIndex: number) => {
    // 0: Sun, 1: Mon, 2: Tue, 3: Wed, 4: Thu, 5: Fri, 6: Sat
    if (dayIndex === 2 || dayIndex === 4) { // Tue / Thu
      return sessions.filter(s => s.day.toLowerCase().includes('tuesday') || s.day.toLowerCase().includes('thursday'));
    }
    if (dayIndex === 1 || dayIndex === 3 || dayIndex === 5) { // Mon / Wed / Fri
      return sessions.filter(s => s.day.toLowerCase().includes('monday') || s.day.toLowerCase().includes('wednesday') || s.day.toLowerCase().includes('friday'));
    }
    return [];
  };

  // Filtered sessions list
  const filteredSessions = sessions.filter((s) => {
    if (!selectedDayOfWeek) return true;
    return s.day.toLowerCase().includes(selectedDayOfWeek.toLowerCase());
  });

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#e6f3fc] via-[#f0f9ff] to-[#eaf6ef] py-10 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        {/* Navigation */}
        <div className="flex items-center justify-between mb-8 pb-4 border-b border-sky-200">
          <button
            onClick={onNavigateHome}
            className="inline-flex items-center gap-2 text-xs font-bold text-sky-800 hover:text-sky-950 transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Home</span>
          </button>

          <span className="text-xs text-emerald-800 font-bold font-mono">
            David Thompson Secondary Gymnasium
          </span>
        </div>

        {/* Page Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
          <div>
            <div className="text-xs font-bold uppercase tracking-wider text-sky-800 mb-2">
              Official Club Timetable
            </div>
            <h1 className="font-display text-4xl sm:text-5xl font-extrabold text-slate-900 tracking-tight">
              Gym Schedule
            </h1>
            <p className="mt-3 text-base text-slate-700 max-w-2xl leading-relaxed">
              Drop in for lunch play and after-school gym times. Supervised by teacher sponsor Mr. Willy Wan and DTPBC executives.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 self-start md:self-auto">
            {isAdmin && (
              <button
                onClick={() => {
                  setEditingSession(null);
                  setIsAdminCalendarModalOpen(true);
                }}
                className="inline-flex items-center gap-1.5 px-4 py-2.5 text-xs font-bold text-white bg-emerald-800 hover:bg-emerald-700 rounded-xl transition-colors cursor-pointer shadow-md shadow-emerald-800/20"
              >
                <Plus className="w-4 h-4" />
                <span>Add / Edit Session</span>
              </button>
            )}

            <div className="flex items-center gap-2 text-xs font-bold text-emerald-800 bg-emerald-100 border border-emerald-300 px-4 py-2.5 rounded-xl">
              <ShieldCheck className="w-4 h-4 text-emerald-700" />
              <span>100% Free · Drop-In Anytime</span>
            </div>
          </div>
        </div>

        {/* CLICKABLE INTERACTIVE CALENDAR */}
        <div className="mb-10 rounded-2xl bg-white border border-sky-200 p-6 sm:p-8 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div>
              <div className="flex items-center gap-2 text-xs font-bold text-sky-800 uppercase tracking-wider">
                <CalendarIcon className="w-4 h-4 text-sky-700" />
                <span>Interactive Schedule Calendar</span>
              </div>
              <h3 className="font-display text-xl font-bold text-slate-900 mt-1">
                {monthNames[month]} {year}
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Click any day to filter sessions or schedule court times.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={prevMonth}
                className="p-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
                title="Previous month"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => {
                  setSelectedDayOfWeek(null);
                  setSelectedCalendarDate(null);
                }}
                className="px-3 py-1.5 rounded-lg text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-800 transition-colors"
              >
                Show All Days
              </button>
              <button
                onClick={nextMonth}
                className="p-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
                title="Next month"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Calendar Grid */}
          <div className="grid grid-cols-7 gap-1.5 sm:gap-2 text-center text-xs">
            {dayNames.map((d) => (
              <div key={d} className="font-bold text-slate-500 uppercase tracking-wider py-1.5 text-[11px]">
                {d}
              </div>
            ))}

            {/* Empty offset padding */}
            {Array.from({ length: firstDayIndex }).map((_, i) => (
              <div key={`offset-${i}`} className="p-2 sm:p-3 rounded-xl bg-slate-50/40 opacity-40 min-h-[56px]" />
            ))}

            {/* Days of month */}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const dayNum = i + 1;
              const dateObj = new Date(year, month, dayNum);
              const dayOfWeek = dateObj.getDay();
              const dayName = dayNames[dayOfWeek];
              const daySessions = getSessionsForDayOfWeek(dayOfWeek);
              const isSelected = selectedCalendarDate === dayNum;
              const hasSessions = daySessions.length > 0;

              return (
                <button
                  key={`day-${dayNum}`}
                  onClick={() => {
                    setSelectedCalendarDate(dayNum);
                    if (dayOfWeek === 2) setSelectedDayOfWeek('Tuesday');
                    else if (dayOfWeek === 4) setSelectedDayOfWeek('Thursday');
                    else if (dayOfWeek === 3) setSelectedDayOfWeek('Wednesday');
                    else if (dayOfWeek === 1) setSelectedDayOfWeek('Monday');
                    else if (dayOfWeek === 5) setSelectedDayOfWeek('Friday');
                    else setSelectedDayOfWeek(null);
                  }}
                  className={`p-2 sm:p-2.5 rounded-xl border text-left min-h-[58px] flex flex-col justify-between transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-sky-100 border-sky-500 ring-2 ring-sky-400/30'
                      : hasSessions
                      ? 'bg-white hover:bg-sky-50 border-sky-200 shadow-2xs'
                      : 'bg-slate-50/60 hover:bg-slate-100 border-slate-200 text-slate-400'
                  }`}
                >
                  <div className="flex items-center justify-between w-full">
                    <span className={`font-mono text-xs font-bold ${isSelected ? 'text-sky-900' : 'text-slate-800'}`}>
                      {dayNum}
                    </span>
                    {hasSessions && (
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 shrink-0" />
                    )}
                  </div>

                  {hasSessions ? (
                    <div className="mt-1">
                      <span className="text-[9px] font-bold text-emerald-800 bg-emerald-100 px-1 py-0.5 rounded block truncate">
                        {daySessions.length} Session{daySessions.length > 1 ? 's' : ''}
                      </span>
                    </div>
                  ) : (
                    <span className="text-[9px] text-slate-400 block truncate">—</span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Filter Status Badge */}
          {selectedDayOfWeek && (
            <div className="mt-4 p-3 rounded-xl bg-sky-50 border border-sky-200 flex items-center justify-between text-xs text-sky-900">
              <span className="font-semibold">
                Filtering schedule by: <strong className="font-bold">{selectedDayOfWeek}</strong>
                {selectedCalendarDate && ` (${monthNames[month]} ${selectedCalendarDate})`}
              </span>
              <button
                onClick={() => {
                  setSelectedDayOfWeek(null);
                  setSelectedCalendarDate(null);
                }}
                className="text-xs font-bold text-sky-800 hover:underline"
              >
                Clear Filter
              </button>
            </div>
          )}
        </div>

        {/* Sessions Schedule Grid with Direct Deletion */}
        <div className="space-y-4 mb-12">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-xl font-bold text-slate-900">
              Scheduled Sessions ({filteredSessions.length})
            </h2>
            {selectedDayOfWeek && (
              <span className="text-xs text-slate-500 font-medium">
                Showing {selectedDayOfWeek} only
              </span>
            )}
          </div>

          {filteredSessions.length === 0 ? (
            <div className="rounded-2xl bg-white border border-slate-200 p-8 text-center text-xs text-slate-500 space-y-2">
              <p className="font-bold text-slate-700">No scheduled sessions for this day</p>
              <button
                onClick={() => {
                  setSelectedDayOfWeek(null);
                  setSelectedCalendarDate(null);
                }}
                className="text-sky-800 font-bold hover:underline"
              >
                View all sessions
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {filteredSessions.map((session) => {
                const isReminded = remindedSessionId === session.id;
                const isConfirmingDelete = deleteConfirmId === session.id;

                return (
                  <div
                    key={session.id}
                    className="rounded-2xl bg-white border border-sky-200 p-6 sm:p-7 hover:border-sky-400 hover:shadow-md transition-all flex flex-col justify-between shadow-xs"
                  >
                    <div className="space-y-3">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-bold text-sky-800 uppercase tracking-wider">
                          {session.day}
                        </span>

                        <div className="flex items-center gap-2">
                          <span className="flex items-center gap-1.5 text-slate-700 font-mono font-semibold">
                            <Clock className="w-3.5 h-3.5 text-sky-600" />
                            {session.time}
                          </span>
                          
                          {isAdmin && (
                            <div className="flex items-center gap-1 ml-1 border-l border-slate-200 pl-2">
                              <button
                                onClick={() => handleEditSession(session)}
                                className="p-1.5 text-slate-400 hover:text-sky-800 hover:bg-sky-50 rounded transition-colors cursor-pointer"
                                title="Edit this session"
                              >
                                <Edit3 className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => setDeleteConfirmId(session.id)}
                                className="p-1.5 text-slate-400 hover:text-red-700 hover:bg-red-50 rounded transition-colors cursor-pointer"
                                title="Delete this session"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Delete Confirmation Banner */}
                      {isConfirmingDelete && (
                        <div className="p-3 rounded-xl bg-red-50 border border-red-200 flex items-center justify-between text-xs">
                          <span className="text-red-800 font-bold">Delete this session permanently?</span>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleDeleteSession(session.id)}
                              className="px-2.5 py-1 rounded bg-red-600 hover:bg-red-700 text-white font-bold transition-colors"
                            >
                              Yes, Delete
                            </button>
                            <button
                              onClick={() => setDeleteConfirmId(null)}
                              className="px-2.5 py-1 rounded bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold transition-colors"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      )}

                      <h3 className="font-display text-xl font-bold text-slate-900">
                        {session.title}
                      </h3>

                      <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                        {session.description}
                      </p>

                      <div className="pt-2 space-y-1.5 text-xs text-slate-600 border-t border-slate-100">
                        <div className="flex items-center gap-1.5 text-slate-800 font-medium">
                          <MapPin className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                          <span>{session.location}</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-slate-600">
                          <Users className="w-3.5 h-3.5 text-sky-600 shrink-0" />
                          <span>Coordinated by: {session.coordinator}</span>
                        </div>
                      </div>
                    </div>

                    <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between gap-3">
                      <span className="text-[11px] font-bold text-emerald-800">
                        {session.spotsOpen}
                      </span>

                      <button
                        onClick={() => handleReminder(session.id)}
                        className="px-4 py-2 rounded-lg text-xs font-bold text-slate-800 bg-slate-100 hover:bg-sky-600 hover:text-white border border-slate-300 transition-colors cursor-pointer whitespace-nowrap"
                      >
                        {isReminded ? (
                          <span className="flex items-center gap-1 text-emerald-800">
                            <Check className="w-3.5 h-3.5" /> Reminder Set
                          </span>
                        ) : (
                          'Set Session Reminder'
                        )}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Gymnasium rules */}
      </div>
    </div>
  );
};
