'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

function siteUrl() {
  return (
    process.env.NEXT_PUBLIC_SITE_URL ||
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'https://leelabs-social-dashboard.vercel.app')
  );
}

export async function inviteTeamMember(
  email: string
): Promise<{ success: true } | { error: string }> {
  const supabase = createClient();

  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) return { error: 'Not authenticated' };

  const { data: currentMember } = await supabase
    .from('agency_users')
    .select('agency_id, role')
    .eq('id', userData.user.id)
    .single();

  if (!currentMember) return { error: 'No agency association' };
  if (!['owner', 'admin'].includes(currentMember.role)) {
    return { error: 'Only owners and admins can invite team members' };
  }

  const normalized = email.toLowerCase().trim();
  if (!normalized) return { error: 'Email required' };

  const { data: existing } = await supabase
    .from('agency_users')
    .select('email')
    .eq('agency_id', currentMember.agency_id)
    .eq('email', normalized)
    .maybeSingle();

  if (existing) return { error: `${normalized} is already on the team.` };

  const { error } = await supabase.auth.signInWithOtp({
    email: normalized,
    options: {
      shouldCreateUser: true,
      emailRedirectTo: `${siteUrl()}/auth/callback`
    }
  });

  if (error) return { error: error.message };

  revalidatePath('/dashboard/team');
  return { success: true };
}

export async function removeTeamMember(
  userId: string
): Promise<{ success: true } | { error: string }> {
  const supabase = createClient();

  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) return { error: 'Not authenticated' };

  const { data: currentMember } = await supabase
    .from('agency_users')
    .select('agency_id, role')
    .eq('id', userData.user.id)
    .single();

  if (!currentMember) return { error: 'No agency association' };
  if (currentMember.role !== 'owner') {
    return { error: 'Only owners can remove team members' };
  }
  if (userId === userData.user.id) {
    return { error: 'Cannot remove yourself.' };
  }

  const { data: target } = await supabase
    .from('agency_users')
    .select('role')
    .eq('id', userId)
    .single();

  if (target?.role === 'owner') {
    return { error: 'Cannot remove an owner.' };
  }

  const { error } = await supabase.from('agency_users').delete().eq('id', userId);
  if (error) return { error: error.message };

  revalidatePath('/dashboard/team');
  return { success: true };
}
