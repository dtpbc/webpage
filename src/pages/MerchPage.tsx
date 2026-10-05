import React, { useEffect, useState } from 'react';
import { ArrowLeft, Heart, Plus, Pencil, Trash2, MapPin, DollarSign, Info, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { getFundraisingItems, manageFundraisingItem, FundraisingItemInput } from '../lib/supabase';
import { FundraisingItem } from '../types';

interface MerchPageProps {
  onNavigateHome: () => void;
  onNavigateSignUp: () => void;
}

const emptyForm: FundraisingItemInput = {
  title: '', description: '', price: '', source: '', howToGet: '', active: true,
};

export const MerchPage: React.FC<MerchPageProps> = ({ onNavigateHome, onNavigateSignUp }) => {
  const { isAdmin } = useAuth();
  const [items, setItems] = useState<FundraisingItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<FundraisingItemInput | null>(null);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  const loadItems = async () => {
    setLoading(true);
    const remote = await getFundraisingItems();
    setItems(remote || []);
    setLoading(false);
  };

  useEffect(() => { loadItems(); }, []);

  const save = async () => {
    if (!editing || !editing.title.trim() || !editing.price.trim() || !editing.source.trim() || !editing.howToGet.trim()) {
      setMessage('Please fill in the title, price, where to get it, and how to get it.');
      return;
    }
    setSaving(true);
    const result = await manageFundraisingItem(editing, editing.id ? 'update' : 'create');
    setSaving(false);
    if (!result.success) { setMessage(result.message || 'Could not save.'); return; }
    setEditing(null); setMessage('Fundraising information saved.'); await loadItems();
  };

  const remove = async (item: FundraisingItem) => {
    if (!confirm(`Remove “${item.title}” from the fundraising page?`)) return;
    const result = await manageFundraisingItem({ id: item.id, ...emptyForm, title: item.title }, 'delete');
    if (!result.success) { setMessage(result.message || 'Could not remove item.'); return; }
    await loadItems();
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#e6f3fc] via-[#f0f9ff] to-[#eaf6ef] py-10 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <div className="flex items-center justify-between mb-8 pb-4 border-b border-sky-200">
          <button onClick={onNavigateHome} className="inline-flex items-center gap-2 text-xs font-bold text-sky-800 hover:text-sky-950 cursor-pointer">
            <ArrowLeft className="w-4 h-4" /> Back to Home
          </button>
          {isAdmin && <button onClick={() => setEditing({ ...emptyForm })} className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold text-white bg-emerald-800 hover:bg-emerald-700"><Plus className="w-4 h-4" /> Add Fundraiser</button>}
        </div>

        <div className="max-w-3xl mb-12">
          <div className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-800 uppercase tracking-wider mb-2"><Heart className="w-4 h-4" /> Club Fundraising</div>
          <h1 className="font-display text-4xl sm:text-5xl font-extrabold text-slate-900 tracking-tight">Fundraising</h1>
          <p className="mt-3 text-base text-slate-700 leading-relaxed">
            Fundraisers help DTPBC raise money for equipment, tournaments, and club activities. This page is <strong>information only</strong> — there are no purchases or payments through the website.
          </p>
        </div>

        <div className="mb-10 p-5 rounded-2xl bg-emerald-50 border border-emerald-300 flex items-start gap-3">
          <Info className="w-5 h-5 text-emerald-700 shrink-0 mt-0.5" />
          <div>
            <p className="text-xs font-bold text-slate-900">How fundraising works</p>
            <p className="text-[11px] text-slate-600">Each listing shows the price, where to get the item, and how to participate. We do not collect payment, orders, or card information on this website.</p>
          </div>
        </div>

        {loading ? <div className="text-sm text-slate-500">Loading fundraisers…</div> :
          items.length === 0 ? <div className="rounded-2xl bg-white border border-sky-200 p-10 text-center text-sm text-slate-600">No fundraisers are currently listed.</div> :
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {items.filter(i => i.active).map(item => (
              <div key={item.id} className="rounded-2xl bg-white border border-sky-200 p-6 shadow-xs hover:shadow-md transition-all">
                <div className="flex items-start justify-between gap-4">
                  <div><span className="inline-flex px-2 py-1 rounded-lg bg-emerald-100 text-emerald-900 text-[10px] font-bold uppercase tracking-wide">Fundraiser</span>
                  <h2 className="font-display text-xl font-bold text-slate-900 mt-3">{item.title}</h2></div>
                  {isAdmin && <div className="flex gap-1"><button title="Edit" onClick={() => setEditing(item)} className="p-2 rounded-lg hover:bg-sky-50 text-sky-700"><Pencil className="w-4 h-4" /></button><button title="Remove" onClick={() => remove(item)} className="p-2 rounded-lg hover:bg-red-50 text-red-700"><Trash2 className="w-4 h-4" /></button></div>}
                </div>
                <p className="text-sm text-slate-600 leading-relaxed mt-3">{item.description}</p>
                <div className="mt-5 grid sm:grid-cols-2 gap-3">
                  <div className="rounded-xl bg-emerald-50 border border-emerald-200 p-3"><div className="text-[10px] font-bold uppercase text-emerald-800 flex items-center gap-1"><DollarSign className="w-3 h-3" /> Price</div><div className="font-bold text-slate-900 mt-1">{item.price}</div></div>
                  <div className="rounded-xl bg-sky-50 border border-sky-200 p-3"><div className="text-[10px] font-bold uppercase text-sky-800 flex items-center gap-1"><MapPin className="w-3 h-3" /> Where to get it</div><div className="font-semibold text-slate-900 mt-1">{item.source}</div></div>
                </div>
                <div className="mt-4 pt-4 border-t border-slate-100"><p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">How to participate</p><p className="text-sm text-slate-700 mt-1 leading-relaxed">{item.howToGet}</p></div>
              </div>
            ))}
          </div>}

        <div className="mt-12 p-6 rounded-2xl bg-white border border-sky-200 shadow-xs">
          <p className="text-slate-900 font-bold text-sm">Questions about a fundraiser?</p>
          <p className="text-xs text-slate-600 mt-1">Ask a DTPBC executive or contact the club through the information provided on our website.</p>
          <button onClick={onNavigateSignUp} className="mt-4 px-4 py-2 rounded-xl text-xs font-bold text-white bg-emerald-800 hover:bg-emerald-700">Join the Club</button>
        </div>
      </div>

      {editing && isAdmin && <div className="fixed inset-0 z-50 bg-slate-950/40 flex items-center justify-center p-4">
        <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl bg-white border border-sky-200 shadow-2xl p-6">
          <div className="flex items-center justify-between mb-5"><h2 className="font-display text-xl font-bold text-slate-900">{editing.id ? 'Edit Fundraiser' : 'Add Fundraiser'}</h2><button onClick={() => setEditing(null)}><X className="w-5 h-5 text-slate-500" /></button></div>
          <div className="space-y-4">
            {[
              ['title','Title'],['price','Price'],['source','Where to get it'],['howToGet','How to participate']
            ].map(([key,label]) => <label key={key} className="block text-xs font-bold text-slate-700">{label}<input value={(editing as any)[key]} onChange={e => setEditing({...editing,[key]:e.target.value})} className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm font-normal outline-none focus:border-emerald-500" /></label>)}
            <label className="block text-xs font-bold text-slate-700">Description<textarea value={editing.description} onChange={e => setEditing({...editing,description:e.target.value})} rows={4} className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm font-normal outline-none focus:border-emerald-500" /></label>
            <label className="flex items-center gap-2 text-xs font-bold text-slate-700"><input type="checkbox" checked={editing.active !== false} onChange={e => setEditing({...editing,active:e.target.checked})} /> Visible on fundraising page</label>
            <div className="flex justify-end gap-2 pt-2"><button onClick={() => setEditing(null)} className="px-4 py-2 rounded-xl text-xs font-bold bg-slate-100 text-slate-700">Cancel</button><button disabled={saving} onClick={save} className="px-4 py-2 rounded-xl text-xs font-bold bg-emerald-800 text-white">{saving ? 'Saving…' : 'Save Fundraiser'}</button></div>
          </div>
        </div>
      </div>}
    </div>
  );
};
