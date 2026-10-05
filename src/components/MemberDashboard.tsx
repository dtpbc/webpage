import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  ArrowLeft,
  Check,
  Calendar,
  Award,
  ExternalLink,
  Edit,
  Scan,
  ShieldCheck,
  X,
  Trash2,
  Users
} from 'lucide-react';
import QRCode from 'qrcode';

interface MemberDashboardProps {
  onBackToHome: () => void;
  onNavigateAttendance: () => void;
  onNavigateSchedule: () => void;
}

export const MemberDashboard: React.FC<MemberDashboardProps> = ({ 
  onBackToHome, 
  onNavigateAttendance,
  onNavigateSchedule
}) => {
  const { 
    currentUser, 
    attendanceRecords,
    updateProfile,
    events, 
    userRegisteredEvents,
    unregisterForEvent,
    isAdmin,
    setIsAdminCalendarModalOpen
  } = useAuth();

  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
  const [editName, setEditName] = useState(currentUser?.name || '');
  const [editEmail, setEditEmail] = useState(currentUser?.email || '');
  const [editGrade, setEditGrade] = useState(currentUser?.grade || 'Grade 10');
  const [editSkill, setEditSkill] = useState(currentUser?.skillLevel || 'Beginner (Learning Rules)');
  const [saveMessage, setSaveMessage] = useState(false);

  // Generate REAL working QR code encoding both Member ID and Student ID
  useEffect(() => {
    if (currentUser) {
      const qrPayload = `${currentUser.memberId || 'PB-MEMBER'}|${currentUser.studentId}`;
      QRCode.toDataURL(qrPayload, {
        width: 220,
        margin: 2,
        color: {
          dark: '#030712',
          light: '#ffffff'
        }
      }).then(url => {
        setQrDataUrl(url);
      }).catch(err => {
        console.error('Failed to generate QR code', err);
      });
    }
  }, [currentUser?.studentId, currentUser?.memberId]);

  if (!currentUser) return null;

  const registeredEventList = events.filter(e => userRegisteredEvents.includes(e.id));
  const myAttendance = attendanceRecords.filter(a => a.memberId === currentUser.memberId && a.studentId === currentUser.studentId);
  const initials = currentUser.name
    .split(' ')
    .map(p => p[0])
    .join('')
    .slice(0, 2);


  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfile({
      name: editName.trim(),
      email: editEmail.trim(),
      grade: editGrade as any,
      skillLevel: editSkill as any,
    });
    setSaveMessage(true);
    setTimeout(() => {
      setSaveMessage(false);
      setIsEditProfileOpen(false);
    }, 1200);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#e6f3fc] via-[#f0f9ff] to-[#eaf6ef] py-8 sm:py-12 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        {/* Top return strip */}
        <div className="flex items-center justify-between mb-8 pb-4 border-b border-sky-200">
          <button
            onClick={onBackToHome}
            className="inline-flex items-center gap-2 text-xs font-bold text-sky-800 hover:text-sky-950 transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Return to Home</span>
          </button>

          <div className="flex items-center gap-3">
            {isAdmin && (
              <button
                onClick={onNavigateAttendance}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-white bg-emerald-800 hover:bg-emerald-700 transition-colors shadow-xs"
              >
                <Scan className="w-3.5 h-3.5" />
                <span>Attendance Scanner Terminal</span>
              </button>
            )}

            <div className="flex items-center gap-2 text-xs text-emerald-800 font-mono font-bold hidden sm:flex">
              <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse" />
              <span>DTPBC Active Student Pass</span>
            </div>
          </div>
        </div>

        {/* Member Profile Overview & Digital Student Pass with Real QR */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-12">
          {/* Student Profile Card (NO PROFILE PHOTO - using initials badge) */}
          <div className="lg:col-span-8 rounded-2xl bg-white border border-sky-200 p-6 sm:p-8 flex flex-col justify-between shadow-sm">
            <div>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                <div className="flex items-center gap-4">
                  {/* Clean initials badge */}
                  <div className="w-16 h-16 rounded-2xl bg-sky-100 border-2 border-sky-300 text-sky-900 font-display font-bold text-xl flex items-center justify-center shrink-0 shadow-xs">
                    {initials}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h1 className="font-display text-2xl font-bold text-slate-900">
                        {currentUser.name}
                      </h1>
                      <ShieldCheck className="w-4 h-4 text-emerald-700" />
                    </div>
                    <div className="flex flex-wrap items-center gap-2 mt-1">
                      <span className="text-xs font-mono font-bold bg-sky-100 text-sky-900 px-2 py-0.5 rounded border border-sky-200">
                        Club Member ID: {currentUser.memberId || 'PB-1001'}
                      </span>
                      <span className="text-xs font-mono text-slate-600 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                        School ID: #{currentUser.studentId}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 mt-1.5">
                      {currentUser.grade} · Member since {currentUser.joinDate} · {currentUser.email}
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <button
                    onClick={() => setIsEditProfileOpen(true)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-sky-50 border border-slate-300 hover:border-sky-300 text-slate-800 text-xs font-semibold transition-colors cursor-pointer"
                  >
                    <Edit className="w-3.5 h-3.5 text-sky-700" />
                    <span>Edit Profile</span>
                  </button>

                  <div className="px-3 py-1.5 rounded-lg bg-emerald-100 border border-emerald-300 text-emerald-800 text-xs font-bold flex items-center gap-2">
                    <span>{currentUser.role === 'executive' ? 'Club Executive' : currentUser.role === 'sponsor_teacher' ? 'Teacher Sponsor' : 'Active Student Member'}</span>
                    {isAdmin && (
                      <button
                        onClick={() => setIsAdminCalendarModalOpen(true)}
                        className="text-[10px] bg-emerald-800 text-white px-2 py-0.5 rounded font-bold hover:bg-emerald-700 transition-colors cursor-pointer"
                      >
                        Calendar Admin
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Information Strip */}
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 border-t border-slate-100 pt-6">
                <div className="p-3.5 rounded-xl bg-sky-50 border border-sky-200">
                  <p className="text-[10px] text-sky-800 font-bold uppercase tracking-wider">PB Club Member ID</p>
                  <p className="font-mono text-lg font-bold text-sky-950 mt-1">
                    {currentUser.memberId || 'PB-1001'}
                  </p>
                  <p className="text-[10px] text-sky-700 mt-0.5">Club Membership Pass</p>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                  <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">School Student ID</p>
                  <p className="font-mono text-lg font-bold text-slate-900 mt-1">
                    #{currentUser.studentId}
                  </p>
                  <p className="text-[10px] text-slate-600 mt-0.5">7-Digit School Number</p>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                  <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Grade Level</p>
                  <p className="font-display text-lg font-bold text-slate-900 mt-1">
                    {currentUser.grade}
                  </p>
                  <p className="text-[10px] text-emerald-800 font-semibold mt-0.5">David Thompson</p>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                  <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Skill Level</p>
                  <p className="font-display text-base font-bold text-sky-900 mt-1 truncate">
                    {currentUser.skillLevel.split(' ')[0]}
                  </p>
                  <p className="text-[10px] text-slate-500 mt-0.5 truncate">{currentUser.skillLevel}</p>
                </div>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between text-xs text-slate-500 gap-2">
              <span>Club: <strong className="text-slate-800">David Thompson Pickleball Club (DTPBC)</strong></span>
              <span className="text-emerald-800 font-bold">100% Free Extracurricular Club</span>
            </div>
          </div>

          {/* Digital Mobile Student Pass with WORKING QR Code */}
          <div className="lg:col-span-4 rounded-2xl bg-gradient-to-br from-[#0c2242] via-[#09172f] to-[#05281a] border-2 border-sky-400/50 p-6 flex flex-col justify-between shadow-xl text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-sky-400/10 blur-2xl rounded-full pointer-events-none" />

            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="font-display font-bold text-xs text-white tracking-wider">
                  DAVID THOMPSON SECONDARY
                </span>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-400 text-slate-950 uppercase">
                  DTPBC PASS
                </span>
              </div>

              <h3 className="text-xl font-bold text-white">{currentUser.name}</h3>
              <div className="flex items-center gap-2 mt-1 font-mono text-xs">
                <span className="text-sky-300 font-bold">Member: {currentUser.memberId || 'PB-1001'}</span>
                <span className="text-slate-400">·</span>
                <span className="text-emerald-400 font-bold">Student #{currentUser.studentId}</span>
              </div>
            </div>

            {/* REAL Working QR Code rendered via canvas/data URL */}
            <div className="my-5 p-4 rounded-2xl bg-white flex flex-col items-center justify-center shadow-lg">
              {qrDataUrl ? (
                <img
                  src={qrDataUrl}
                  alt={`Student QR Code for ${currentUser.name}`}
                  className="w-40 h-40 object-contain rounded"
                />
              ) : (
                <div className="w-40 h-40 bg-slate-900 flex items-center justify-center text-white text-xs font-mono">
                  Loading QR...
                </div>
              )}
              <div className="text-[11px] font-mono text-slate-950 font-bold tracking-wider text-center mt-2">
                <span>{currentUser.memberId || 'PB-1001'}</span>
                <span className="mx-1 text-slate-400">|</span>
                <span>#{currentUser.studentId}</span>
              </div>
            </div>

            <div className="space-y-2 mt-4">
              <p className="text-[11px] text-slate-300 text-center">
                Scan with attendance terminal at gym doors
              </p>
            </div>
          </div>
        </div>

        {/* Schedule & Volunteer Section with UNREGISTER / REMOVAL */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-12">
          {/* Registered Events with Unregister Button */}
          <div className="lg:col-span-7 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-display text-xl font-bold text-slate-900">
                My Registered Events & Matches ({registeredEventList.length})
              </h2>
              <button
                onClick={onNavigateSchedule}
                className="text-xs text-sky-800 font-bold hover:underline"
              >
                View Full Gym Schedule →
              </button>
            </div>

            {registeredEventList.length === 0 ? (
              <div className="rounded-2xl bg-white border border-slate-200 p-8 text-center space-y-3 shadow-xs">
                <Calendar className="w-8 h-8 text-slate-400 mx-auto" />
                <p className="text-sm text-slate-800 font-semibold">No event registrations</p>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  You are not currently registered for any tournament matches or exhibition games.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {registeredEventList.map((ev) => (
                  <div
                    key={ev.id}
                    className="rounded-xl bg-white border border-slate-200 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xs"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-xs font-bold text-emerald-800">
                        <Calendar className="w-3.5 h-3.5 text-emerald-700" />
                        <span>{ev.date}</span>
                        <span aria-hidden="true" className="text-slate-300">·</span>
                        <span>{ev.time}</span>
                      </div>
                      <h4 className="font-display text-base font-bold text-slate-900">
                        {ev.title}
                      </h4>
                      <p className="text-xs text-slate-500">
                        {ev.location} · {ev.category}
                      </p>
                    </div>

                    <div className="flex items-center gap-2 self-start sm:self-center">
                      <span className="px-2.5 py-1 rounded-lg bg-emerald-100 text-emerald-800 border border-emerald-300 text-xs font-bold">
                        Confirmed
                      </span>

                      {/* Unregister button */}
                      <button
                        onClick={() => unregisterForEvent(ev.id)}
                        className="px-3 py-1 text-xs font-bold text-red-700 hover:text-white bg-red-50 hover:bg-red-600 border border-red-200 hover:border-red-600 rounded-lg transition-colors cursor-pointer flex items-center gap-1"
                        title="Unregister from this event"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Remove</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Volunteer Hours Form Box */}
          <div className="lg:col-span-5 rounded-2xl bg-gradient-to-br from-emerald-900 to-[#042817] border border-emerald-700 p-6 flex flex-col justify-between shadow-xl space-y-4 text-white">
            <div>
              <div className="flex items-center gap-2 text-xs font-bold text-emerald-300 uppercase tracking-wider mb-2">
                <Award className="w-4 h-4 text-emerald-400" />
                <span>CLC 30 Volunteer Hours</span>
              </div>
              <h3 className="font-display text-xl font-bold text-white">
                Earn Volunteer Hours
              </h3>
              <p className="text-xs text-emerald-100 mt-2 leading-relaxed">
                Help with net setups, scorekeeping, and tournament refereeing. Volunteer hours can be submitted through the club volunteer form.
              </p>
            </div>

            <div className="pt-2">
              <a
                href="https://forms.gle/e3wNimUZKqBbFMC38"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full inline-flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-xs font-bold text-slate-950 bg-emerald-400 hover:bg-emerald-300 transition-colors shadow-md shadow-emerald-400/20"
              >
                <span>Open Google Volunteer Form</span>
                <ExternalLink className="w-4 h-4" />
              </a>
              <p className="text-[10px] text-emerald-200 text-center mt-2">
                Submit your completed volunteer hours through the form
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Edit Profile Modal */}
      {isEditProfileOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in">
          <div className="relative w-full max-w-md rounded-2xl bg-white border border-sky-300 p-6 shadow-2xl">
            <button
              onClick={() => setIsEditProfileOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-700"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="font-display text-lg font-bold text-slate-900 mb-1">
              Edit Student Profile
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Update your name, contact email, grade, or skill level.
            </p>

            <form onSubmit={handleSaveProfile} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-slate-800 font-semibold mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:border-sky-500 focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-slate-800 font-semibold mb-1">
                  Email Address <span className="text-slate-500 font-normal">(Any email is accepted)</span>
                </label>
                <input
                  type="email"
                  required
                  value={editEmail}
                  onChange={(e) => setEditEmail(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:border-sky-500 focus:bg-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-800 font-semibold mb-1">Grade</label>
                  <select
                    value={editGrade}
                    onChange={(e) => setEditGrade(e.target.value as any)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:border-sky-500 focus:bg-white"
                  >
                    <option value="Grade 8">Grade 8</option>
                    <option value="Grade 9">Grade 9</option>
                    <option value="Grade 10">Grade 10</option>
                    <option value="Grade 11">Grade 11</option>
                    <option value="Grade 12">Grade 12</option>
                    <option value="Staff / Teacher">Staff / Teacher</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-800 font-semibold mb-1">Club Member ID</label>
                  <input
                    type="text"
                    disabled
                    value={currentUser.memberId || 'PB-1001'}
                    className="w-full px-3 py-2 bg-slate-100 border border-slate-200 rounded-lg text-sky-900 font-mono font-bold cursor-not-allowed"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-800 font-semibold mb-1">School Student ID</label>
                <input
                  type="text"
                  disabled
                  value={`#${currentUser.studentId}`}
                  className="w-full px-3 py-2 bg-slate-100 border border-slate-200 rounded-lg text-slate-500 font-mono cursor-not-allowed"
                />
              </div>

              <div>
                <label className="block text-slate-800 font-semibold mb-1">Skill Experience</label>
                <select
                  value={editSkill}
                  onChange={(e) => setEditSkill(e.target.value as any)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:border-sky-500 focus:bg-white"
                >
                  <option value="Beginner (Learning Rules)">Beginner (Learning Rules)</option>
                  <option value="Intermediate (Consistent Rallies)">Intermediate (Consistent Rallies)</option>
                  <option value="Advanced (Competitive Play)">Advanced (Competitive Play)</option>
                </select>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full py-2.5 px-4 rounded-xl text-xs font-bold text-white bg-emerald-800 hover:bg-emerald-700 transition-colors shadow-xs"
                >
                  {saveMessage ? 'Profile Saved!' : 'Save Profile Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
