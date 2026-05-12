import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import InviteForm from './InviteForm';
import TeamMemberRow from './TeamMemberRow';

export default async function TeamPage() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: agencyUser } = await supabase
    .from('agency_users')
    .select('agency_id, role')
    .eq('id', user.id)
    .single();

  if (!agencyUser) {
    return (
      <div className="bg-amber-50 border border-amber-100 rounded-lg p-6">
        <div className="font-medium text-amber-800 text-sm mb-1">No agency association found</div>
        <div className="text-xs text-amber-700">Run migration #4 in Supabase to backfill agency_users rows.</div>
      </div>
    );
  }

  const { data: members } = await supabase
    .from('agency_users')
    .select('id, email, full_name, role, created_at')
    .eq('agency_id', agencyUser.agency_id)
    .order('created_at');

  const canInvite = ['owner', 'admin'].includes(agencyUser.role);

  return (
    <div>
      <div className="mb-5">
        <h1 className="text-2xl font-bold">Team</h1>
        <p className="text-sm text-slate-500">
          People at Leelabs Agency who can access all clients in the dashboard.
        </p>
      </div>

      {canInvite ? (
        <div className="bg-white border border-slate-200 rounded-lg p-5 mb-6">
          <h3 className="font-semibold mb-3">Invite team member</h3>
          <InviteForm />
        </div>
      ) : (
        <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 mb-6 text-xs text-slate-600">
          Only owners and admins can invite new team members.
        </div>
      )}

      <div className="bg-white border border-slate-200 rounded-lg p-5">
        <h3 className="font-semibold mb-3">Current team ({members?.length || 0})</h3>
        <div className="space-y-2">
          {(members || []).map((m) => (
            <TeamMemberRow
              key={m.id}
              member={m}
              currentUserId={user.id}
              currentUserRole={agencyUser.role}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
