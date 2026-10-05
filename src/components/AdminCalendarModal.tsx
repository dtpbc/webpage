import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { ClubSession } from '../types';
import { Calendar, Plus, Trash2, Edit3, Check, X } from 'lucide-react';

export const AdminCalendarModal: React.FC = () => {
  const { 
    isAdminCalendarModalOpen, 
    setIsAdminCalendarModalOpen,
    sessions,
    addSession,
    updateSession,
    deleteSession,
    editingSession,
    setEditingSession,
    currentUser
  } = useAuth();

  const [title, setTitle] = useState('');
  const [day, setDay] = useState('');
  const [specificDate, setSpecificDate] = useState('');
  const [time, setTime] = useState('');
  const [location, setLocation] = useState('DT Large Gymnasium');
  const [gymLayout, setGymLayout] = useState<ClubSession['gymLayout']>('4 Portable Pickleball Courts (Main Gym)');
  const [description, setDescription] = useState('');
  const [spotsOpen, setSpotsOpen] = useState('Open Drop-In for all Grades 8–12');
  const [coordinator, setCoordinator] = useState('Noah Park (President) & Mr. Willy Wan');
  const [status, setStatus] = useState<'Open' | 'Starting Soon' | 'Completed'>('Open');
  const [saveSuccess, setSaveSuccess] = useState(false);

  const resetForm = () => {
    setTitle('');
    setDay('Every Tuesday & Thursday');
    setSpecificDate('');
    setTime('3:15 PM – 4:45 PM');
    setLocation('DT Large Gymnasium');
    setGymLayout('4 Portable Pickleball Courts (Main Gym)');
    setDescription('');
    setSpotsOpen('Open Drop-In for all Grades 8–12');
    setCoordinator(currentUser?.name ? `${currentUser.name} (Exec)` : 'Noah Park & Mr. Willy Wan');
    setStatus('Open');
    setEditingSession(null);
  };

  useEffect(() => {
    if (editingSession) {
      setTitle(editingSession.title);
      setDay(editingSession.day);
      setSpecificDate(editingSession.date || '');
      setTime(editingSession.time);
      setLocation(editingSession.location);
      setGymLayout(editingSession.gymLayout || '4 Portable Pickleball Courts (Main Gym)');
      setDescription(editingSession.description);
      setSpotsOpen(editingSession.spotsOpen);
      setCoordinator(editingSession.coordinator);
      setStatus(editingSession.status);
    } else {
      resetForm();
    }
  }, [editingSession]);

  if (!isAdminCalendarModalOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !day || !time) return;

    if (editingSession) {
      await updateSession({
        ...editingSession,
        title,
        day,
        date: specificDate || undefined,
        time,
        location,
        gymLayout,
        description,
        spotsOpen,
        coordinator,
        status,
      });
    } else {
      await addSession({
        title,
        day,
        date: specificDate || undefined,
        time,
        location,
        gymLayout,
        description,
        spotsOpen,
        coordinator,
        status,
      });
    }

    setSaveSuccess(true);
    setTimeout(() => {
      setSaveSuccess(false);
      resetForm();
    }, 1500);
  };

  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const handleEdit = (session: ClubSession) => {
    setEditingSession(session);
  };

  const handleDelete = async (id: string) => {
    await deleteSession(id);
    setConfirmDeleteId(null);
    if (editingSession?.id === id) {
      resetForm();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in">
      <div className="relative w-full max-w-4xl rounded-2xl bg-white border border-sky-300 p-6 sm:p-8 shadow-2xl text-left max-h-[92vh] overflow-y-auto flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-200">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-display text-xl font-bold text-slate-900">
                Admin Gym Schedule Manager
              </h3>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-100 text-emerald-800 uppercase border border-emerald-300">
                EXECUTIVE ACCESS
              </span>
            </div>
            <p className="text-xs text-slate-600 mt-1">
              Add, update, or cancel David Thompson gym sessions and practice times.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                setIsAdminCalendarModalOpen(false);
                resetForm();
              }}
              className="text-slate-400 hover:text-slate-700 transition-colors cursor-pointer text-sm p-1"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 py-6">
          {/* Form Column */}
          <form onSubmit={handleSubmit} className="space-y-4 text-xs lg:col-span-6">
            <div className="flex items-center justify-between">
              <h4 className="font-display text-base font-bold text-slate-900">
                {editingSession ? 'Edit Gym Session' : 'Add New Gym Session'}
              </h4>
              {editingSession && (
                <button
                  type="button"
                  onClick={resetForm}
                  className="text-sky-800 font-bold hover:underline text-[11px] cursor-pointer"
                >
                  Cancel Edit (New)
                </button>
              )}
            </div>

            <div>
              <label className="block text-slate-800 font-semibold mb-1">Session Title</label>
              <input
                type="text"
                required
                placeholder="e.g. Wednesday Lunch Clinic"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:border-sky-500 focus:bg-white"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-800 font-semibold mb-1">Day of Week</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Every Thursday"
                  value={day}
                  onChange={(e) => setDay(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:border-sky-500 focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-slate-800 font-semibold mb-1">Date</label>
                <input
                  type="date"
                  value={specificDate}
                  onChange={(e) => setSpecificDate(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:border-sky-500 focus:bg-white cursor-pointer"
                  title="Choose the session date from the calendar"
                />
              </div>

              <div>
                <label className="block text-slate-800 font-semibold mb-1">Time</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 11:45 AM – 12:25 PM"
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:border-sky-500 focus:bg-white"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-800 font-semibold mb-1">Gym Location</label>
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:border-sky-500 focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-slate-800 font-semibold mb-1">Status</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as any)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:border-sky-500 focus:bg-white cursor-pointer"
                >
                  <option value="Open">Open</option>
                  <option value="Starting Soon">Starting Soon</option>
                  <option value="Completed">Completed / Cancelled</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-slate-800 font-semibold mb-1">Description</label>
              <textarea
                rows={2}
                required
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:border-sky-500 focus:bg-white"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-800 font-semibold mb-1">Capacity Note</label>
                <input
                  type="text"
                  value={spotsOpen}
                  onChange={(e) => setSpotsOpen(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:border-sky-500 focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-slate-800 font-semibold mb-1">Coordinator</label>
                <input
                  type="text"
                  value={coordinator}
                  onChange={(e) => setCoordinator(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:border-sky-500 focus:bg-white"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-2.5 px-4 rounded-xl text-xs font-bold text-white bg-emerald-800 hover:bg-emerald-700 transition-colors cursor-pointer shadow-md shadow-emerald-800/20 flex items-center justify-center gap-2"
            >
              {saveSuccess ? (
                <>
                  <Check className="w-4 h-4 text-white" />
                  <span>Schedule Updated!</span>
                </>
              ) : (
                <>
                  <Calendar className="w-4 h-4 text-white" />
                  <span>{editingSession ? 'Save Changes' : 'Add to Gym Schedule'}</span>
                </>
              )}
            </button>
          </form>

          {/* Current Sessions List */}
          <div className="space-y-3 lg:col-span-6">
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-display text-base font-bold text-slate-900">
                Scheduled Sessions ({sessions.length})
              </h4>
              <span className="text-[11px] text-slate-500">Click to edit</span>
            </div>

            <div className="space-y-2.5 max-h-[460px] overflow-y-auto pr-1">
              {sessions.map((s) => (
                <div
                  key={s.id}
                  className={`p-3.5 rounded-xl border text-xs transition-all ${
                    editingSession?.id === s.id
                      ? 'bg-sky-50 border-sky-400 shadow-xs'
                      : 'bg-slate-50 border-slate-200 hover:border-sky-300'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sky-800">{s.day}</span>
                        <span className="text-slate-400">·</span>
                        <span className="text-slate-700 font-mono text-[11px] font-semibold">{s.time}</span>
                      </div>
                      <h5 className="font-bold text-slate-900 text-sm mt-0.5">{s.title}</h5>
                      <p className="text-[11px] text-slate-600 line-clamp-1 mt-0.5">{s.description}</p>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        type="button"
                        onClick={() => handleEdit(s)}
                        className="p-1.5 text-slate-500 hover:text-sky-800 hover:bg-sky-100 rounded-lg transition-colors cursor-pointer"
                        title="Edit this session"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      {confirmDeleteId === s.id ? (
                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => handleDelete(s.id)}
                            className="px-2 py-0.5 rounded text-[10px] font-bold text-white bg-red-600 hover:bg-red-700 transition-colors"
                          >
                            Confirm
                          </button>
                          <button
                            type="button"
                            onClick={() => setConfirmDeleteId(null)}
                            className="px-1.5 py-0.5 rounded text-[10px] text-slate-600 hover:bg-slate-200 transition-colors"
                          >
                            ✕
                          </button>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() => setConfirmDeleteId(s.id)}
                          className="p-1.5 text-slate-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                          title="Delete this session"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
