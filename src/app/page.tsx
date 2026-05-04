import { redirect } from 'next/navigation';

export default function Home() {
  // Since this is an internal corporate tool, we redirect the root path 
  // directly to the dashboard. The middleware will automatically handle 
  // redirecting unauthenticated users to the /login page.
  redirect('/dashboard');
}
