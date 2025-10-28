import { TraderDashboard } from "@/components/trader/trader-dashboard"

export default function TraderPage() {
  return (
    <main className="p-6 space-y-6">
      <h1 className="text-2xl font-bold mb-4">Dashboard del Trader</h1>
      <TraderDashboard />
    </main>
  )
}
