import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { auth } from '@/lib/auth'
import { AppHeader } from '@/components/app-header'
import { PatternBoard } from '@/components/patterns/pattern-board'

export default async function HomePage() {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user) redirect('/sign-in')

  return (
    <div className="min-h-svh">
      <AppHeader email={session.user.email} />
      <main className="mx-auto max-w-7xl px-4 py-8 md:px-6">
        <PatternBoard />
      </main>
    </div>
  )
}
