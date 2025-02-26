import MRR from "./MRR";
import TotalSites from "./TotalSites";
import TotalSubscriptions from "./TotalSubscriptions";
import TotalUsers from "./TotalUsers";
import WalletBalance from "./WalletBalance";

export default function TopLineStats() {
  return (
    <dl className="w-3/4 mt-20 mx-auto grid grid-cols-1 gap-px bg-gray-900/5 sm:grid-cols-2 lg:grid-cols-5">
      <TotalSites />
      <TotalUsers />
      <TotalSubscriptions />
      <MRR />
      <WalletBalance />      
    </dl>
  );
}
