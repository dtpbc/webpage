import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { QrCode, ArrowLeft, CheckCircle2, AlertCircle, Scan, Users, Clock, Trash2, Search, XCircle } from 'lucide-react';

interface AttendancePageProps {
  onNavigateHome: () => void;
  onNavigatePortal: () => void;
}

export const AttendancePage: React.FC<AttendancePageProps> = ({ onNavigateHome, onNavigatePortal }) => {
  const { 
    currentUser, 
    allMembers, 
    attendanceRecords, 
    recordAttendance,
    removeAttendanceRecord,
    clearAttendance
  } = useAuth();

  const [barcodeInput, setBarcodeInput] = useState('');
  const [searchRosterQuery, setSearchRosterQuery] = useState('');
  const [confirmClear, setConfirmClear] = useState(false);
  const [feedback, setFeedback] = useState<{ success: boolean; message: string } | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-focus barcode input for quick scanning with handheld USB/Bluetooth barcode scanner
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleScanSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!barcodeInput.trim()) return;

    const res = recordAttendance(barcodeInput.trim());
    setFeedback(res);
    setBarcodeInput('');
    inputRef.current?.focus();

    setTimeout(() => {
      setFeedback(null);
    }, 4000);
  };

  const handleQuickTapMember = (identifier: string) => {
    const res = recordAttendance(identifier);
    setFeedback(res);
    setTimeout(() => {
      setFeedback(null);
    }, 4000);
  };

  // Filter roster by name, memberId, or studentId
  const filteredMembers = allMembers.filter((m) => {
    const q = searchRosterQuery.toLowerCase().trim();
    if (!q) return true;
    return (
      m.name.toLowerCase().includes(q) ||
      m.studentId.toLowerCase().includes(q) ||
      m.memberId.toLowerCase().includes(q) ||
      m.grade.toLowerCase().includes(q)
    );
  });

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#e6f3fc] via-[#f0f9ff] to-[#eaf6ef] py-8 sm:py-12 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl">
        {/* Top return */}
        <div className="flex items-center justify-between mb-8 pb-4 border-b border-sky-200">
          <button
            onClick={onNavigatePortal}
            className="inline-flex items-center gap-2 text-xs font-bold text-sky-800 hover:text-sky-950 transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Member Portal</span>
          </button>

          <div className="flex items-center gap-2 text-xs font-mono font-bold text-emerald-800">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-600 animate-pulse" />
            <span>DTPBC Executive Attendance Station</span>
          </div>
        </div>

        {/* Header */}
        <div className="mb-8">
          <div className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-800 uppercase tracking-wider mb-2">
            <Scan className="w-4 h-4 text-emerald-700" />
            <span>Barcode & QR Scanner Terminal</span>
          </div>
          <h1 className="font-display text-3xl sm:text-4xl font-extrabold text-slate-900">
            Gym Drop-In Attendance Scanner
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 mt-2 max-w-2xl leading-relaxed">
            All DTPBC executives and sponsor teacher Mr. Willy Wan can log student check-ins. Use an attached barcode scanner, enter student numbers, or tap student names. Duplicate check-ins are automatically blocked.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Scan Input Column */}
          <div className="lg:col-span-6 space-y-6">
            <div className="rounded-2xl bg-white border border-sky-200 p-6 shadow-md">
              <h3 className="font-display text-base font-bold text-slate-900 mb-2 flex items-center gap-2">
                <QrCode className="w-4 h-4 text-sky-700" />
                <span>Scan Student Pass or Enter ID</span>
              </h3>
              <p className="text-xs text-slate-600 mb-4">
                Point any standard barcode or QR scanner at the student's mobile pass, or enter their 7-digit school ID or Club Member ID (e.g. PB-1001).
              </p>

              <form onSubmit={handleScanSubmit} className="space-y-3">
                <div className="relative">
                  <Scan className="absolute left-3.5 top-3 w-5 h-5 text-sky-700" />
                  <input
                    ref={inputRef}
                    type="text"
                    required
                    placeholder="Scan barcode or type ID (e.g. 1842109 or PB-1001)"
                    value={barcodeInput}
                    onChange={(e) => setBarcodeInput(e.target.value)}
                    className="w-full pl-11 pr-4 py-3 bg-slate-50 border-2 border-sky-300 focus:border-emerald-700 rounded-xl text-slate-900 font-mono text-sm placeholder-slate-400 focus:outline-none focus:bg-white transition-colors"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3 px-4 rounded-xl text-xs font-bold text-white bg-emerald-800 hover:bg-emerald-700 transition-colors cursor-pointer shadow-md shadow-emerald-800/20"
                >
                  Record Attendance Check-In
                </button>
              </form>

              {feedback && (
                <div
                  className={`mt-4 p-4 rounded-xl text-xs flex items-start gap-2.5 transition-all ${
                    feedback.success
                      ? 'bg-emerald-50 border border-emerald-300 text-emerald-900'
                      : 'bg-amber-50 border border-amber-300 text-amber-900'
                  }`}
                >
                  {feedback.success ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-700 shrink-0 mt-0.5" />
                  ) : (
                    <AlertCircle className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
                  )}
                  <span className="font-semibold leading-relaxed">{feedback.message}</span>
                </div>
              )}
            </div>

            {/* Member Roster with SEARCH BAR */}
            <div className="rounded-2xl bg-white border border-sky-200 p-6 space-y-3 shadow-xs">
              <div className="flex items-center justify-between">
                <h4 className="font-display text-sm font-bold text-slate-900 flex items-center gap-2">
                  <Users className="w-4 h-4 text-slate-500" />
                  <span>Member Roster ({filteredMembers.length})</span>
                </h4>
                <span className="text-[10px] text-slate-500">1-Tap Quick Check In</span>
              </div>

              {/* SEARCH BAR */}
              <div className="relative">
                <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search roster by name, student #, or member ID..."
                  value={searchRosterQuery}
                  onChange={(e) => setSearchRosterQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-sky-500 focus:bg-white"
                />
                {searchRosterQuery && (
                  <button
                    onClick={() => setSearchRosterQuery('')}
                    className="absolute right-2.5 top-2 text-slate-400 hover:text-slate-600"
                  >
                    <XCircle className="w-4 h-4" />
                  </button>
                )}
              </div>

              <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                {filteredMembers.length === 0 ? (
                  <div className="text-center py-6 text-slate-400 text-xs">
                    No members matching "{searchRosterQuery}"
                  </div>
                ) : (
                  filteredMembers.map((m) => {
                    const isAlreadyCheckedIn = attendanceRecords.some(
                      a => a.studentId === m.studentId || a.memberId === m.memberId
                    );

                    return (
                      <button
                        key={m.id}
                        onClick={() => handleQuickTapMember(m.studentId)}
                        className={`w-full p-2.5 rounded-lg border text-left transition-colors cursor-pointer flex items-center justify-between ${
                          isAlreadyCheckedIn
                            ? 'bg-slate-50 border-slate-200 opacity-75'
                            : 'bg-white hover:bg-sky-50 border-slate-200 hover:border-sky-300'
                        }`}
                      >
                        <div>
                          <p className="text-xs font-bold text-slate-900">{m.name}</p>
                          <p className="text-[10px] text-slate-500 font-mono">
                            School #{m.studentId} · Club {m.memberId} · {m.grade}
                          </p>
                        </div>
                        {isAlreadyCheckedIn ? (
                          <span className="text-[10px] px-2 py-0.5 rounded bg-slate-200 text-slate-700 font-bold">
                            Checked In
                          </span>
                        ) : (
                          <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold border border-emerald-300">
                            Check In
                          </span>
                        )}
                      </button>
                    );
                  })
                )}
              </div>
            </div>
          </div>

          {/* Today's Logged Attendance Column */}
          <div className="lg:col-span-6 space-y-4">
            <div className="rounded-2xl bg-white border border-sky-200 p-6 flex flex-col justify-between h-full shadow-md">
              <div>
                <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
                  <div>
                    <h3 className="font-display text-lg font-bold text-slate-900">
                      Today's Gym Attendance Log
                    </h3>
                    <p className="text-xs text-slate-500">
                      {attendanceRecords.length} Students Checked In
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    {attendanceRecords.length > 0 && (
                      confirmClear ? (
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => {
                              clearAttendance();
                              setConfirmClear(false);
                            }}
                            className="text-[10px] bg-red-600 text-white font-bold px-2 py-0.5 rounded hover:bg-red-700"
                          >
                            Confirm Clear
                          </button>
                          <button
                            onClick={() => setConfirmClear(false)}
                            className="text-[10px] text-slate-500 hover:text-slate-800 px-1 py-0.5"
                          >
                            ✕
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => setConfirmClear(true)}
                          className="text-[11px] text-red-600 hover:text-red-800 font-semibold px-2 py-1 rounded hover:bg-red-50"
                        >
                          Clear All
                        </button>
                      )
                    )}
                    <span className="px-2.5 py-1 rounded-lg text-xs font-mono font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                      LIVE
                    </span>
                  </div>
                </div>

                <div className="space-y-2.5 max-h-[460px] overflow-y-auto pr-1">
                  {attendanceRecords.length === 0 ? (
                    <div className="text-center py-12 text-slate-400 text-xs">
                      No student check-ins recorded yet for today's session.
                    </div>
                  ) : (
                    attendanceRecords.map((att) => (
                      <div
                        key={att.id}
                        className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between shadow-2xs group"
                      >
                        <div className="space-y-0.5">
                          <p className="text-xs font-bold text-slate-900">
                            {att.studentName}
                          </p>
                          <p className="text-[11px] text-slate-600 font-mono">
                            School #{att.studentId} · Club {att.memberId || 'PB'} · {att.grade}
                          </p>
                          <p className="text-[10px] text-sky-800 font-semibold">
                            Logged by: {att.scannedBy}
                          </p>
                        </div>

                        <div className="flex items-center gap-3">
                          <div className="flex items-center gap-1.5 text-xs text-emerald-800 font-mono font-bold">
                            <Clock className="w-3.5 h-3.5 text-emerald-700" />
                            <span>{att.timestamp}</span>
                          </div>

                          {/* Removal button */}
                          <button
                            onClick={() => removeAttendanceRecord(att.id)}
                            title="Remove this check-in"
                            className="p-1.5 text-slate-400 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 text-[11px] text-slate-500 flex items-center justify-between">
                <span>David Thompson Secondary Athletics</span>
                <span className="text-emerald-800 font-bold font-mono">SD39 DTPBC</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
