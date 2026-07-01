import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { SerialProvider } from '@/context/SerialContext';
import AppShell from '@/components/layout/AppShell';
import styles from './console-layout.module.css';

export default async function ConsoleLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect('/login');

  // Fetch user profile
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  return (
    <SerialProvider>
      <AppShell user={user} profile={profile}>
        {children}
      </AppShell>
    </SerialProvider>
  );
}
