import { getUserData } from "@/utils/data";
import { useEffect, useState } from "react";

const TotalUsers = () => {
  const [loading, setLoading] = useState(true);
  const [userCount, setUserCount] = useState(0);
  useEffect(() => {
    const getSiteCount = async () => {
      try {
        const data = await getUserData();
        setUserCount(data.data.count);
        setLoading(false);
      } catch (error) {
        console.log(error);
        setLoading(false);
      }
    };
    getSiteCount();
  }, []);
  return (
    <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-2 px-4 py-10 sm:px-6 xl:px-8">
      <dt className="text-sm/6 font-medium text-muted-foreground">Total Users</dt>
      <dd></dd>
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
        ) : (
          userCount
        )}
      </dd>
    </div>
  );
};

export default TotalUsers;
