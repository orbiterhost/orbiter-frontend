import BanHammer from './BanHammer'
import DeploymentSources from './Charts/DeploymentSources'
import OnboardingAnalytics from './Charts/OnboardingStats'
import SiteUpdates from './Charts/SiteUpdates'
import UsersByDay from './Charts/UsersByDay'
import TopLineStats from './TopLineStats'

const Admin = () => {
  return (
    <div>
        <TopLineStats />
        <SiteUpdates />
        <UsersByDay />
        <OnboardingAnalytics />
        <DeploymentSources />
        <BanHammer />
    </div>
  )
}

export default Admin