import { getMrrData } from "@/utils/data";
import { useEffect, useState } from "react";

const MRR = () => {
  const [loading, setLoading] = useState(true);
  const [mrr, setMrr] = useState(0);
  useEffect(() => {
    const getSiteCount = async () => {
      try {
        const data = await getMrrData();
        setMrr(data.data);
        setLoading(false);
      } catch (error) {
        console.log(error);
        setLoading(false);
      }
    };
    getSiteCount();
  }, []);
  return (
    <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-2 bg-white px-4 py-10 sm:px-6 xl:px-8">
      <dt className="text-sm/6 font-medium text-gray-500">Current MRR</dt>
      <dd></dd>
      <dd className="w-full flex-none text-3xl/10 font-medium tracking-tight text-gray-900">
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
            `$ ${mrr}`
        )}
      </dd>
    </div>
  );
};

export default MRR;
