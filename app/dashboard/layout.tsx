import { redirect } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import LogoutButton from './LogoutButton';

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white border-b border-slate-200 sticky top-0 z-30">
        <div className="max-w-[1500px] mx-auto px-6 py-3 flex items-center justify-between">
          <Link href="/dashboard" className="flex items-center gap-3 hover:opacity-80">
            <div className="w-9 h-9 rounded-lg bg-slate-900 text-white grid place-items-center font-bold">L</div>
            <div>
              <div className="font-semibold">Leelabs Agency</div>
              <div className="text-xs text-slate-500">Social Media Management</div>
            </div>
          </Link>
          <div className="flex items-center gap-4">
            <Link href="/dashboard/team" className="text-xs text-slate-600 hover:text-slate-900">
              Team
            </Link>
            <span className="text-xs text-slate-500 hidden md:inline">{user.email}</span>
            <LogoutButton />
          </div>
        </div>
        <div className="h-[3px] bg-slate-900" />
      </header>
      <main className="max-w-[1500px] mx-auto px-6 py-6">{children}</main>
    </div>
  );
}
