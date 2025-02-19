import BanHammer from './BanHammer'
import SiteUpdates from './Charts/SiteUpdates'
import UsersByDay from './Charts/UsersByDay'
import TopLineStats from './TopLineStats'

const Admin = () => {
  return (
    <div>
        <TopLineStats />
        <SiteUpdates />
        <UsersByDay />
        <BanHammer />
    </div>
  )
}

export default Admin