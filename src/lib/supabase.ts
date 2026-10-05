import { createClient } from '@supabase/supabase-js';
import { AttendanceRecord, ClubSession, SpecialEvent, User } from '../types';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const isSupabaseConfigured = Boolean(
  supabaseUrl &&
  supabaseAnonKey &&
  supabaseUrl !== 'https://your-project.supabase.co' &&
  !supabaseUrl.includes('your-project')
);

export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

/**
 * Supabase Auth owns authentication. The existing public.profiles table
 * stores DTPBC member/profile data and role information.
 */
export async function getMemberByAuthId(authId: string): Promise<User | null> {
  if (!supabase) return null;

  // Use a security-definer RPC so profile RLS cannot break login.
  // The RPC only returns/creates the profile belonging to auth.uid().
  const { data, error } = await supabase.rpc('get_or_create_dtpbc_profile');

  if (!error && data) {
    return {
      id: data.id,
      memberId: data.member_id || '',
      name: [data.first_name, data.last_name].filter(Boolean).join(' ') || data.name || 'DTPBC Member',
      studentId: data.student_id || '',
      grade: data.grade || 'Grade 10',
      email: data.email || '',
      role: data.role || 'member',
      skillLevel: data.skill_level || 'Beginner (Learning Rules)',
      joinDate: data.join_date || data.created_at || '',
    } as User;
  }

  // Fallback for deployments where the RPC migration has not been applied yet.
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', authId)
    .maybeSingle();

  if (profileError) {
    console.warn('Supabase profile fetch error:', profileError.message);
    return null;
  }

  if (!profile) return null;

  const authUser = await supabase.auth.getUser();

  return {
    id: profile.id,
    memberId: profile.member_id || '',
    name: [profile.first_name, profile.last_name].filter(Boolean).join(' ') || profile.name || 'DTPBC Member',
    studentId: profile.student_id || '',
    grade: profile.grade || 'Grade 10',
    email: profile.email || authUser.data.user?.email || '',
    role: profile.role || 'member',
    skillLevel: profile.skill_level || 'Beginner (Learning Rules)',
    joinDate: profile.join_date || profile.created_at || '',
  } as User;
}

export async function getRemoteRoster(): Promise<User[] | null> {
  if (!supabase) return null;
  const { data, error } = await supabase.rpc('get_dtpbc_roster');
  if (error || !Array.isArray(data)) {
    if (error) console.warn('Supabase roster fetch error:', error.message);
    return null;
  }
  return data.map((row: any) => ({
    id: row.id,
    memberId: row.member_id || '',
    name: [row.first_name, row.last_name].filter(Boolean).join(' ') || row.name || 'DTPBC Member',
    studentId: row.student_id || '',
    grade: row.grade || 'Grade 10',
    email: row.email || '',
    role: row.role || 'member',
    skillLevel: row.skill_level || 'Beginner (Learning Rules)',
    joinDate: row.join_date || row.created_at || '',
  })) as User[];
}

export async function promoteRemoteMemberToExecutive(memberId: string): Promise<{ success: boolean; message?: string }> {
  if (!supabase) return { success: false, message: 'Supabase is not configured.' };
  const { data, error } = await supabase.rpc('promote_dtpbc_member_to_executive', { target_member_id: memberId });
  if (error) return { success: false, message: error.message };
  if (!data?.success) return { success: false, message: data?.message || 'Unable to promote member.' };
  return { success: true };
}

export async function deleteRemoteMember(memberId: string): Promise<{ success: boolean; message?: string }> {
  if (!supabase) return { success: false, message: 'Supabase is not configured.' };
  const { data, error } = await supabase.rpc('delete_dtpbc_member', { target_member_id: memberId });
  if (error) return { success: false, message: error.message };
  if (!data?.success) return { success: false, message: data?.message || 'Unable to delete member.' };
  return { success: true };
}


export interface AdminUserInput {
  id?: string;
  name: string;
  email: string;
  studentId: string;
  memberId: string;
  grade: User['grade'];
  skillLevel: User['skillLevel'];
  role: User['role'];
}

export async function adminManageUser(input: AdminUserInput, action: 'create' | 'update') {
  if (!supabase) return { success: false, message: 'Supabase is not configured.' };
  const { data: sessionData } = await supabase.auth.getSession();
  const token = sessionData.session?.access_token;
  if (!token) return { success: false, message: 'Your session has expired. Please sign in again.' };

  try {
    const response = await fetch(`${supabaseUrl}/functions/v1/dtpbc-admin-user`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
        apikey: supabaseAnonKey,
      },
      body: JSON.stringify({ ...input, action }),
    });
    const data = await response.json();
    if (!response.ok || !data.success) return { success: false, message: data.message || 'Unable to manage user.' };
    return data;
  } catch (error: any) {
    return { success: false, message: error?.message || 'Unable to contact the user-management service.' };
  }
}

export async function getMemberByLogin(login: string): Promise<User | null> {
  if (!supabase) return null;
  const value = login.trim().toLowerCase();

  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .or(`email.ilike.${value},student_id.eq.${value},member_id.ilike.${value}`)
    .maybeSingle();

  if (error) {
    console.warn('Supabase profile lookup error:', error.message);
    return null;
  }

  if (!data) return null;

  return {
    id: data.id,
    memberId: data.member_id || '',
    name: [data.first_name, data.last_name].filter(Boolean).join(' ') || data.name || 'DTPBC Member',
    studentId: data.student_id || '',
    grade: data.grade || 'Grade 10',
    email: data.email || '',
    role: data.role || 'member',
    skillLevel: data.skill_level || 'Beginner (Learning Rules)',
    joinDate: data.join_date || data.created_at || '',
  } as User;
}

/**
 * Supabase SMTP Password Reset Helper
 */
export async function requestPasswordReset(email: string): Promise<{ success: boolean; message: string }> {
  if (!supabase) {
    await new Promise(r => setTimeout(r, 800));
    return {
      success: true,
      message: `Password reset link dispatched to ${email}. Please check your inbox or spam.`
    };
  }

  try {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/login?reset=success`,
    });

    if (error) {
      return { success: false, message: error.message };
    }

    return {
      success: true,
      message: `A password reset link has been dispatched to ${email}. Please check your inbox or spam.`
    };
  } catch (err: any) {
    return { success: false, message: err?.message || 'Failed to dispatch password reset email.' };
  }
}

export async function getRemoteSessions(): Promise<ClubSession[] | null> {
  if (!supabase) return null;
  try {
    const { data, error } = await supabase
      .from('sessions')
      .select('*')
      .order('id', { ascending: true });

    if (error) {
      console.warn('Supabase fetch error for sessions:', error.message);
      return null;
    }
    return data as ClubSession[];
  } catch (err) {
    console.warn('Failed to fetch sessions from Supabase:', err);
    return null;
  }
}

export async function upsertRemoteSession(session: ClubSession): Promise<boolean> {
  if (!supabase) return false;
  try {
    const { error } = await supabase.from('sessions').upsert(session);
    if (error) {
      console.warn('Supabase upsert session error:', error.message);
      return false;
    }
    return true;
  } catch (err) {
    console.warn('Supabase upsert session exception:', err);
    return false;
  }
}

export async function deleteRemoteSession(sessionId: string): Promise<boolean> {
  if (!supabase) return false;
  try {
    const { error } = await supabase.from('sessions').delete().eq('id', sessionId);
    if (error) {
      console.warn('Supabase delete session error:', error.message);
      return false;
    }
    return true;
  } catch (err) {
    console.warn('Supabase delete session exception:', err);
    return false;
  }
}

export async function getRemoteEvents(): Promise<SpecialEvent[] | null> {
  if (!supabase) return null;
  try {
    const { data, error } = await supabase
      .from('events')
      .select('*')
      .order('date', { ascending: true });

    if (error) {
      console.warn('Supabase fetch events error:', error.message);
      return null;
    }
    return data as SpecialEvent[];
  } catch (err) {
    console.warn('Failed to fetch events from Supabase:', err);
    return null;
  }
}

export async function upsertRemoteEvent(event: SpecialEvent): Promise<boolean> {
  if (!supabase) return false;
  try {
    const { error } = await supabase.from('events').upsert(event);
    if (error) {
      console.warn('Supabase upsert event error:', error.message);
      return false;
    }
    return true;
  } catch (err) {
    console.warn('Supabase upsert event exception:', err);
    return false;
  }
}

export async function deleteRemoteEvent(eventId: string): Promise<boolean> {
  if (!supabase) return false;
  try {
    const { error } = await supabase.from('events').delete().eq('id', eventId);
    if (error) {
      console.warn('Supabase delete event error:', error.message);
      return false;
    }
    return true;
  } catch (err) {
    console.warn('Supabase delete event exception:', err);
    return false;
  }
}


export async function getRemoteAttendance(): Promise<AttendanceRecord[] | null> {
  if (!supabase) return null;
  const { data, error } = await supabase.from('attendance').select('*').order('created_at', { ascending: false });
  if (error) {
    console.warn('Supabase fetch attendance error:', error.message);
    return null;
  }
  return (data || []).map((row: any) => ({
    id: row.id,
    memberId: row.member_id,
    studentId: row.student_id,
    studentName: row.student_name,
    grade: row.grade,
    timestamp: row.timestamp,
    scannedBy: row.scanned_by,
    eventId: row.event_id,
    eventTitle: row.event_title,
  })) as AttendanceRecord[];
}

export async function upsertRemoteAttendance(record: AttendanceRecord): Promise<boolean> {
  if (!supabase) return false;
  const { error } = await supabase.from('attendance').upsert({
    id: record.id,
    member_id: record.memberId,
    student_id: record.studentId,
    student_name: record.studentName,
    grade: record.grade,
    timestamp: record.timestamp,
    scanned_by: record.scannedBy,
    event_id: record.eventId,
    event_title: record.eventTitle,
  });
  if (error) {
    console.warn('Supabase save attendance error:', error.message);
    return false;
  }
  return true;
}

export async function deleteRemoteAttendance(recordId: string): Promise<boolean> {
  if (!supabase) return false;
  const { error } = await supabase.from('attendance').delete().eq('id', recordId);
  if (error) console.warn('Supabase delete attendance error:', error.message);
  return !error;
}

export async function clearRemoteAttendance(): Promise<boolean> {
  if (!supabase) return false;
  const { error } = await supabase.from('attendance').delete().neq('id', '');
  if (error) console.warn('Supabase clear attendance error:', error.message);
  return !error;
}
