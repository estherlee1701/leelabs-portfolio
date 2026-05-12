'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { inviteTeamMember } from './actions';

export default function InviteForm() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle');
  const [message, setMessage] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus('sending');
    setMessage('');
    const result = await inviteTeamMember(email);
    if ('error' in result) {
      setStatus('error');
      setMessage(result.error);
    } else {
      setStatus('sent');
      setMessage(`Invite sent to ${email}. They'll get a magic link to sign in.`);
      setEmail('');
      router.refresh();
    }
  }

  return (
    <div>
      <form onSubmit={handleSubmit} className="flex gap-2 items-start">
        <input
          type="email"
          required
          placeholder="teammate@leelabs.agency"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="flex-1 border border-slate-200 rounded-md px-3 py-2 text-sm"
        />
        <button
          type="submit"
          disabled={status === 'sending'}
          className="text-sm bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white px-4 py-2 rounded-md whitespace-nowrap"
        >
          {status === 'sending' ? 'Sending…' : 'Send invite'}
        </button>
      </form>
      {message && (
        <div className={`text-xs mt-2 ${status === 'error' ? 'text-rose-600' : 'text-emerald-600'}`}>
          {message}
        </div>
      )}
      <p className="text-xs text-slate-400 mt-2">
        They&apos;ll receive a magic-link email. Clicking it signs them in with full access to all Leelabs clients.
      </p>
    </div>
  );
}
