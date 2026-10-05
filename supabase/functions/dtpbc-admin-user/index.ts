import { withSupabase } from 'npm:@supabase/server@1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

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

function splitName(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  return {
    first_name: parts[0] || '',
    last_name: parts.slice(1).join(' '),
  };
}

export default {
  fetch: withSupabase({ auth: 'user' }, async (req, ctx) => {
    if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
    if (req.method !== 'POST') {
      return Response.json({ success: false, message: 'POST required.' }, { status: 405, headers: corsHeaders });
    }

    try {
      const { data: callerProfile, error: profileError } = await ctx.supabaseAdmin
        .from('profiles')
        .select('id, role')
        .eq('id', ctx.user.id)
        .maybeSingle();

      if (profileError || !callerProfile || !['executive', 'sponsor_teacher'].includes(callerProfile.role)) {
        return Response.json({ success: false, message: 'Executive or teacher sponsor access required.' }, { status: 403, headers: corsHeaders });
      }

      const payload = await req.json() as Payload;
      const email = payload.email.trim().toLowerCase();
      const name = payload.name.trim();

      if (!name || !email || !email.includes('@')) {
        return Response.json({ success: false, message: 'Name and a valid email address are required.' }, { status: 400, headers: corsHeaders });
      }

      const names = splitName(name);

      if (payload.action === 'create') {
        const temporaryPassword = crypto.randomUUID() + 'Aa1!';
        const { data: created, error: createError } = await ctx.supabaseAdmin.auth.admin.createUser({
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
          return Response.json({ success: false, message: createError?.message || 'Unable to create the account.' }, { status: 400, headers: corsHeaders });
        }

        let memberId = payload.memberId ? `PB-${payload.memberId.replace(/^PB-/i, '')}` : '';
        if (!memberId) {
          for (let attempt = 0; attempt < 100; attempt++) {
            const candidate = `PB-${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}`;
            const { data: existing } = await ctx.supabaseAdmin
              .from('profiles')
              .select('id')
              .eq('member_id', candidate)
              .maybeSingle();
            if (!existing) {
              memberId = candidate;
              break;
            }
          }
        }
        if (!memberId) {
          await ctx.supabaseAdmin.auth.admin.deleteUser(created.user.id);
          return Response.json({ success: false, message: 'Unable to generate a unique DTPBC member number. Please try again.' }, { status: 500, headers: corsHeaders });
        }

        const profile = {
          id: created.user.id,
          member_id: memberId,
          first_name: names.first_name,
          last_name: names.last_name,
          student_id: payload.studentId || '',
          grade: payload.grade,
          email,
          role: payload.role,
          skill_level: payload.skillLevel,
          join_date: new Date().toISOString(),
        };

        const { error: upsertError } = await ctx.supabaseAdmin.from('profiles').upsert(profile);
        if (upsertError) {
          await ctx.supabaseAdmin.auth.admin.deleteUser(created.user.id);
          return Response.json({ success: false, message: `Account was created but profile setup failed: ${upsertError.message}` }, { status: 500, headers: corsHeaders });
        }

        // Use the user-scoped client so Supabase sends the normal recovery email.
        const { error: resetError } = await ctx.supabase.auth.resetPasswordForEmail(email, {
          redirectTo: `${req.headers.get('origin') || 'https://web.dtpbc.workers.dev'}/reset-password`,
        });

        if (resetError) {
          return Response.json({ success: true, warning: `Account created, but the password-reset email could not be sent: ${resetError.message}` }, { headers: corsHeaders });
        }

        return Response.json({ success: true, message: `User created. A password-reset email was sent to ${email}.` }, { headers: corsHeaders });
      }

      if (payload.action === 'update' && payload.id) {
        if (payload.id === ctx.user.id && payload.role !== callerProfile.role) {
          return Response.json({ success: false, message: 'You cannot change your own staff role.' }, { status: 400, headers: corsHeaders });
        }

        const { error: authUpdateError } = await ctx.supabaseAdmin.auth.admin.updateUserById(payload.id, {
          email,
          user_metadata: {
            name,
            studentId: payload.studentId || '',
            grade: payload.grade,
            skillLevel: payload.skillLevel,
          },
        });

        if (authUpdateError) {
          return Response.json({ success: false, message: authUpdateError.message }, { status: 400, headers: corsHeaders });
        }

        const { error: profileUpdateError } = await ctx.supabaseAdmin
          .from('profiles')
          .update({
            member_id: payload.memberId ? `PB-${payload.memberId.replace(/^PB-/i, '')}` : undefined,
            first_name: names.first_name,
            last_name: names.last_name,
            student_id: payload.studentId || '',
            grade: payload.grade,
            email,
            role: payload.role,
            skill_level: payload.skillLevel,
          })
          .eq('id', payload.id);

        if (profileUpdateError) {
          return Response.json({ success: false, message: profileUpdateError.message }, { status: 400, headers: corsHeaders });
        }

        return Response.json({ success: true, message: 'Profile updated successfully.' }, { headers: corsHeaders });
      }

      return Response.json({ success: false, message: 'Invalid user-management request.' }, { status: 400, headers: corsHeaders });
    } catch (error) {
      return Response.json({ success: false, message: error instanceof Error ? error.message : 'Unexpected server error.' }, { status: 500, headers: corsHeaders });
    }
  }),
};
