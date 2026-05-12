'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { removeTeamMember } from './actions';

type Member = {
  id: string;
  email: string;
  full_name: string | null;
  role: string;
  created_at: string;
};

const ROLE_BADGE: Record<string, string> = {
  owner: 'bg-purple-100 text-purple-800',
  admin: 'bg-blue-100 text-blue-800',
  member: 'bg-slate-100 text-slate-700'
};

export default function TeamMemberRow({
  member,
  currentUserId,
  currentUserRole
}: {
  member: Member;
  currentUserId: string;
  currentUserRole: string;
}) {
  const router = useRouter();
  const [removing, setRemoving] = useState(false);

  const isCurrentUser = member.id === currentUserId;
  const canRemove = currentUserRole === 'owner' && !isCurrentUser && member.role !== 'owner';

  async function handleRemove() {
    if (!confirm(`Remove ${member.email} from the team?`)) return;
    setRemoving(true);
    const result = await removeTeamMember(member.id);
    setRemoving(false);
    if ('error' in result) {
      alert('Failed: ' + result.error);
    } else {
      router.refresh();
    }
  }

  const display = member.full_name || member.email;
  const initials = display
    .split(/[\s@.]/)
    .filter(Boolean)
    .map((w) => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  return (
    <div className="flex items-center gap-3 p-3 border border-slate-100 rounded-md">
      <div className="w-9 h-9 rounded-full bg-slate-200 text-slate-700 grid place-items-center text-sm font-semibold">
        {initials}
      </div>
      <div className="flex-1 min-w-0">
        <div className="font-medium text-sm">
          {display}
          {isCurrentUser && <span className="text-xs text-slate-400 ml-2">(you)</span>}
        </div>
        {member.full_name && <div className="text-xs text-slate-500">{member.email}</div>}
      </div>
      <span className={`text-xs px-2 py-1 rounded-full font-medium capitalize ${ROLE_BADGE[member.role] || ROLE_BADGE.member}`}>
        {member.role}
      </span>
      {canRemove && (
        <button
          onClick={handleRemove}
          disabled={removing}
          className="text-xs text-rose-600 hover:text-rose-800 disabled:opacity-50"
        >
          Remove
        </button>
      )}
    </div>
  );
}
