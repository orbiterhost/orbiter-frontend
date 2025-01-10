import SiteUpdates from './Charts/SiteUpdates'
import UsersByDay from './Charts/UsersByDay'
import TopLineStats from './TopLineStats'

const Admin = () => {
  return (
    <div>
        <TopLineStats />
        <SiteUpdates />
        <UsersByDay />
    </div>
  )
}

export default Admin