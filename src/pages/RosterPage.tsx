import React, { useEffect, useMemo, useState } from 'react';
import { ArrowLeft, KeyRound, Search, ShieldCheck, Trash2, UserRound, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { requestPasswordReset } from '../lib/supabase';
import { User } from '../types';

interface RosterPageProps {
  onNavigateHome: () => void;
}

export const RosterPage: React.FC<RosterPageProps> = ({ onNavigateHome }) => {
  const { currentUser, allMembers, isAdmin, refreshRoster, deleteMember } = useAuth();
  const [selected, setSelected] = useState<User | null>(null);
  const [search, setSearch] = useState('');
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (isAdmin) refreshRoster();
  }, [isAdmin]);

  const members = useMemo(() => {
    const q = search.trim().toLowerCase();
    return allMembers
      .filter(member => member.role === 'member')
      .filter(member => !q || [member.name, member.email, member.memberId, member.studentId, member.grade].some(v => v.toLowerCase().includes(q)));
  }, [allMembers, search]);

  if (!currentUser || !isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4 bg-gradient-to-b from-[#e6f3fc] to-[#eaf6ef]">
        <div className="w-full max-w-md rounded-2xl bg-white border border-slate-200 p-7 text-center shadow-sm">
          <ShieldCheck className="w-9 h-9 mx-auto text-slate-400 mb-3" />
          <h1 className="text-xl font-bold text-slate-900">Executive Access Required</h1>
          <p className="text-sm text-slate-600 mt-2">The member roster is only available to DTPBC executives and the teacher sponsor.</p>
          <button onClick={onNavigateHome} className="mt-5 px-4 py-2 rounded-lg bg-emerald-800 text-white text-sm font-bold">Return Home</button>
        </div>
      </div>
    );
  }

  const handleReset = async () => {
    if (!selected?.email) return;
    setBusy(true);
    setMessage('');
    const result = await requestPasswordReset(selected.email);
    setMessage(result.message);
    setBusy(false);
  };

  const handleDelete = async () => {
    if (!selected || selected.id === currentUser.id) return;
    if (!window.confirm(`Delete ${selected.name} from the DTPBC roster and sign-in system? This cannot be undone.`)) return;
    setBusy(true);
    setMessage('');
    const result = await deleteMember(selected.id);
    if (result.success) {
      setSelected(null);
      setMessage('Member deleted successfully.');
    } else {
      setMessage(result.message || 'Unable to delete member.');
    }
    setBusy(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#e6f3fc] via-[#f0f9ff] to-[#eaf6ef] py-6 sm:py-10 px-3 sm:px-6">
      <div className="mx-auto max-w-6xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-sky-200">
          <button onClick={onNavigateHome} className="inline-flex items-center gap-2 text-sm font-bold text-sky-800 hover:text-sky-950">
            <ArrowLeft className="w-4 h-4" /> Return to Home
          </button>
          <div className="inline-flex items-center gap-2 text-xs font-bold text-emerald-800">
            <ShieldCheck className="w-4 h-4" /> Executive & Teacher Sponsor Roster
          </div>
        </div>

        <div className="mb-7">
          <p className="text-xs font-bold uppercase tracking-wider text-emerald-800 mb-2">Private Staff Area</p>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900">Member Roster</h1>
          <p className="mt-2 text-sm sm:text-base text-slate-600 max-w-2xl">Real DTPBC student accounts only. Executive officers and the teacher sponsor are not counted as members in this roster.</p>
        </div>

        <div className="rounded-2xl bg-white border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-4 sm:p-5 border-b border-slate-100 flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
            <div className="text-sm font-bold text-slate-900">{members.length} member{members.length === 1 ? '' : 's'}</div>
            <label className="relative w-full sm:w-80">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search name, email, ID..." className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-300 bg-slate-50 text-sm outline-none focus:border-sky-500 focus:bg-white" />
            </label>
          </div>

          <div className="divide-y divide-slate-100">
            {members.length === 0 ? (
              <div className="p-10 text-center text-sm text-slate-500">No real member accounts match your search.</div>
            ) : members.map(member => (
              <button key={member.id} onClick={() => { setSelected(member); setMessage(''); }} className="w-full text-left p-4 sm:p-5 hover:bg-sky-50/60 transition-colors">
                <div className="flex items-center gap-3 sm:gap-4">
                  <div className="w-11 h-11 rounded-xl bg-sky-100 border border-sky-200 flex items-center justify-center text-sm font-extrabold text-sky-900 shrink-0">
                    {member.name.split(' ').map(p => p[0]).join('').slice(0,2)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                      <span className="font-bold text-slate-900 truncate">{member.name}</span>
                      <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800">{member.memberId}</span>
                    </div>
                    <div className="text-xs text-slate-500 mt-1 break-all">{member.email}</div>
                  </div>
                  <div className="hidden sm:block text-right shrink-0">
                    <div className="text-xs font-bold text-slate-800">{member.grade}</div>
                    <div className="text-[11px] font-mono text-slate-500">#{member.studentId}</div>
                  </div>
                  <span className="text-slate-400 text-lg">›</span>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {selected && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-slate-950/60 p-0 sm:p-4">
          <div className="w-full sm:max-w-lg rounded-t-3xl sm:rounded-2xl bg-white shadow-2xl p-5 sm:p-7">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-12 h-12 rounded-xl bg-sky-100 flex items-center justify-center text-sky-900 font-extrabold shrink-0">
                  {selected.name.split(' ').map(p => p[0]).join('').slice(0,2)}
                </div>
                <div className="min-w-0">
                  <h2 className="text-xl font-extrabold text-slate-900 truncate">{selected.name}</h2>
                  <p className="text-xs text-emerald-800 font-bold">{selected.memberId} · {selected.grade}</p>
                </div>
              </div>
              <button onClick={() => setSelected(null)} className="p-2 rounded-lg hover:bg-slate-100 text-slate-500"><X className="w-5 h-5" /></button>
            </div>

            <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="rounded-xl bg-slate-50 border border-slate-200 p-3"><div className="text-[10px] font-bold uppercase text-slate-500">Email</div><div className="text-sm font-semibold break-all mt-1">{selected.email}</div></div>
              <div className="rounded-xl bg-slate-50 border border-slate-200 p-3"><div className="text-[10px] font-bold uppercase text-slate-500">Student ID</div><div className="text-sm font-mono font-semibold mt-1">#{selected.studentId}</div></div>
            </div>

            <div className="mt-5 space-y-2">
              <button disabled={busy || !selected.email} onClick={handleReset} className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-sky-700 hover:bg-sky-800 disabled:opacity-50 text-white font-bold text-sm py-3">
                <KeyRound className="w-4 h-4" /> Send Password Reset
              </button>
              {selected.id !== currentUser.id && (
                <button disabled={busy} onClick={handleDelete} className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-red-50 hover:bg-red-100 border border-red-200 text-red-700 font-bold text-sm py-3 disabled:opacity-50">
                  <Trash2 className="w-4 h-4" /> Delete Member
                </button>
              )}
            </div>
            {message && <p className="mt-4 rounded-xl bg-slate-50 border border-slate-200 p-3 text-xs text-slate-700">{message}</p>}
          </div>
        </div>
      )}
    </div>
  );
};
