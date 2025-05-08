import { getWalletBalance } from "@/utils/data";
import { useEffect, useState } from "react";


const WalletBalance = () => {
  const [loading, setLoading] = useState(true);
  const [balance, setBalance] = useState(0);
  const [usd, setUsd] = useState(0);
  useEffect(() => {
    const getBalance = async () => {
      try {
        const data = await getWalletBalance();
        console.log(data);
        setBalance(data.data.balance.eth);
        setUsd(data.data.balance.usd);
        setLoading(false);
      } catch (error) {
        console.log(error);
        setLoading(false);
      }
    };
    getBalance();
  }, []);
  return (
    <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-2 px-4 py-10 sm:px-6 xl:px-8">
      <dt className="text-sm/6 font-medium text-muted-foreground">Wallet Balance</dt>
      <dd
        className="text-muted-foreground text-xs font-medium"
      >
        {balance.toFixed(5)} ETH
      </dd>
      <dd className="w-full flex-none text-3xl/10 font-medium tracking-tight">
        {loading ? (
          <div>
            <div
              className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-e-transparent align-[-0.125em] text-surface motion-reduce:animate-[spin_1.5s_linear_infinite] dark:text-white"
              role="status"
            >
              <span className="!absolute !-m-px !h-px !w-px !overflow-hidden !whitespace-nowrap !border-0 !p-0 ![clip:rect(0,0,0,0)]">
                Loading...
              </span>
            </div>
          </div>
        ) :
        <>${usd}</>
        }
      </dd>
    </div>
  );
};

export default WalletBalance;
