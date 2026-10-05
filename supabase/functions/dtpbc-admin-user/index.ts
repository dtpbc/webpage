import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const admin = createClient(supabaseUrl, serviceRoleKey);

type Payload = {
  action: 'create' | 'update';
  id?: string;
  name: string;
  email: string;
  studentId?: string;
  memberId?: string;
  grade: string;
  skillLevel: string;
  role: 'member' | 'executive' | 'sponsor_teacher';
};

function response(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

function splitName(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  return {
    first_name: parts[0] || '',
    last_name: parts.slice(1).join(' '),
  };
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  if (req.method !== 'POST') return response({ success: false, message: 'POST required.' }, 405);

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) return response({ success: false, message: 'Authentication required.' }, 401);

    const token = authHeader.replace('Bearer ', '');
    const { data: callerData, error: callerError } = await admin.auth.getUser(token);
    if (callerError || !callerData.user) return response({ success: false, message: 'Invalid session.' }, 401);

    const { data: callerProfile, error: profileError } = await admin
      .from('profiles')
      .select('id, role')
      .eq('id', callerData.user.id)
      .maybeSingle();

    if (profileError || !callerProfile || !['executive', 'sponsor_teacher'].includes(callerProfile.role)) {
      return response({ success: false, message: 'Executive or teacher sponsor access required.' }, 403);
    }

    const payload = await req.json() as Payload;
    const email = payload.email.trim().toLowerCase();
    const name = payload.name.trim();

    if (!name || !email || !email.includes('@')) {
      return response({ success: false, message: 'Name and a valid email address are required.' }, 400);
    }

    if (payload.role === 'sponsor_teacher' && callerProfile.role !== 'sponsor_teacher') {
      return response({ success: false, message: 'Only the teacher sponsor can assign the teacher sponsor role.' }, 403);
    }

    const names = splitName(name);

    if (payload.action === 'create') {
      const temporaryPassword = crypto.randomUUID() + 'Aa1!';
      const { data: created, error: createError } = await admin.auth.admin.createUser({
        email,
        password: temporaryPassword,
        email_confirm: true,
        user_metadata: {
          name,
          studentId: payload.studentId || '',
          grade: payload.grade,
          skillLevel: payload.skillLevel,
        },
      });

      if (createError || !created.user) {
        return response({ success: false, message: createError?.message || 'Unable to create the account.' }, 400);
      }

      const profile = {
        id: created.user.id,
        member_id: payload.memberId || `PB-${Math.floor(1000 + Math.random() * 9000)}`,
        first_name: names.first_name,
        last_name: names.last_name,
        student_id: payload.studentId || '',
        grade: payload.grade,
        email,
        role: payload.role,
        skill_level: payload.skillLevel,
        join_date: new Date().toISOString(),
      };

      const { error: upsertError } = await admin.from('profiles').upsert(profile);
      if (upsertError) {
        await admin.auth.admin.deleteUser(created.user.id);
        return response({ success: false, message: `Account was created but profile setup failed: ${upsertError.message}` }, 500);
      }

      // Sends the normal Supabase password-recovery email. The temporary password is never shown to the user.
      const { error: resetError } = await admin.auth.resetPasswordForEmail(email, {
        redirectTo: `${req.headers.get('origin') || ''}/login?reset=success`,
      });

      if (resetError) {
        return response({ success: true, warning: `Account created, but the password-reset email could not be sent: ${resetError.message}` });
      }

      return response({ success: true, message: `User created. A password-reset email was sent to ${email}.` });
    }

    if (payload.action === 'update' && payload.id) {
      if (payload.id === callerData.user.id && payload.role !== callerProfile.role) {
        return response({ success: false, message: 'You cannot change your own staff role.' }, 400);
      }

      const { error: authUpdateError } = await admin.auth.admin.updateUserById(payload.id, {
        email,
        user_metadata: {
          name,
          studentId: payload.studentId || '',
          grade: payload.grade,
          skillLevel: payload.skillLevel,
        },
      });

      if (authUpdateError) return response({ success: false, message: authUpdateError.message }, 400);

      const { error: profileUpdateError } = await admin
        .from('profiles')
        .update({
          member_id: payload.memberId || null,
          first_name: names.first_name,
          last_name: names.last_name,
          student_id: payload.studentId || '',
          grade: payload.grade,
          email,
          role: payload.role,
          skill_level: payload.skillLevel,
        })
        .eq('id', payload.id);

      if (profileUpdateError) return response({ success: false, message: profileUpdateError.message }, 400);

      return response({ success: true, message: 'Profile updated successfully.' });
    }

    return response({ success: false, message: 'Invalid user-management request.' }, 400);
  } catch (error) {
    return response({ success: false, message: error instanceof Error ? error.message : 'Unexpected server error.' }, 500);
  }
});
