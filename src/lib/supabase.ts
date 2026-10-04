import { createClient } from '@supabase/supabase-js';
import { ClubSession, SpecialEvent, User } from '../types';

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
 * Supabase member/profile helpers.
 * Authentication lives in Supabase Auth; club profile/role data lives in public.members.
 */
export async function getMemberByAuthId(authId: string): Promise<User | null> {
  if (!supabase) return null;
  const { data, error } = await supabase.from('members').select('*').eq('id', authId).maybeSingle();
  if (error) {
    console.warn('Supabase member fetch error:', error.message);
    return null;
  }
  return data ? {
    id: data.id,
    memberId: data.member_id,
    name: data.name,
    studentId: data.student_id,
    grade: data.grade,
    email: data.email,
    role: data.role,
    skillLevel: data.skill_level,
    joinDate: data.join_date,
  } as User : null;
}

export async function getMemberByLogin(login: string): Promise<User | null> {
  if (!supabase) return null;
  const value = login.trim().toLowerCase();
  const { data, error } = await supabase
    .from('members')
    .select('*')
    .or(`email.ilike.${value},student_id.eq.${value},member_id.ilike.${value}`)
    .maybeSingle();
  if (error) {
    console.warn('Supabase member lookup error:', error.message);
    return null;
  }
  return data ? {
    id: data.id,
    memberId: data.member_id,
    name: data.name,
    studentId: data.student_id,
    grade: data.grade,
    email: data.email,
    role: data.role,
    skillLevel: data.skill_level,
    joinDate: data.join_date,
  } as User : null;
}

export async function createMemberProfile(user: User): Promise<boolean> {
  if (!supabase) return false;
  const { error } = await supabase.from('members').insert(user);
  if (error) {
    console.warn('Supabase member insert error:', error.message);
    return false;
  }
  return true;
}

/**
 * Supabase SMTP Password Reset Helper
 */
export async function requestPasswordReset(email: string): Promise<{ success: boolean; message: string }> {
  if (!supabase) {
    // Local / development simulation if Supabase is pending setup
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

/**
 * Supabase service helpers with local caching fallback
 */
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
    const { error } = await supabase
      .from('sessions')
      .upsert(session);
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
    const { error } = await supabase
      .from('sessions')
      .delete()
      .eq('id', sessionId);
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
    const { error } = await supabase
      .from('events')
      .upsert(event);
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
    const { error } = await supabase
      .from('events')
      .delete()
      .eq('id', eventId);
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
