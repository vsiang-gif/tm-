import { GuideHero } from '@/components/guide/guide-hero'
import { InstallSteps } from '@/components/guide/install-steps'
import { GuideFaq } from '@/components/guide/guide-faq'

export default function HomePage() {
  return (
    <main className="mx-auto flex max-w-6xl flex-col gap-20 px-4 py-12 md:px-8 md:py-20">
      <GuideHero />
      <InstallSteps />
      <GuideFaq />
    </main>
  )
}
