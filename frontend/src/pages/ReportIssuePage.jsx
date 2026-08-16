import Layout from '../components/Layout'
import ReportWizard from '../components/wizard/ReportWizard'

/**
 * ReportIssuePage — hosts the camera-first 4-step wizard.
 * Completely replaces the old simple form.
 */
export default function ReportIssuePage() {
  return (
    <Layout
      title="Report an Issue"
      subtitle="Complete the steps below — takes under 15 seconds"
    >
      <div className="max-w-lg mx-auto">
        <div className="card rounded-2xl p-6">
          <ReportWizard />
        </div>
      </div>
    </Layout>
  )
}
