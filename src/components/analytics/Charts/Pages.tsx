import { getAccessToken } from "@/utils/auth";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

type PageData = {
  path: string;
  count: number;
  percentage: number;
};

type PagesProps = {
  period: string;
};

const Pages = (props: PagesProps) => {
  const [pageData, setPageData] = useState<PageData[]>([]);
  const [loading, setLoading] = useState(true);
  const { id } = useParams();

  useEffect(() => {
    getPathData();
  }, [props.period]);

  const getPathData = async () => {
    try {
      const token = await getAccessToken();
      let startDate;
      if (props.period === "seven") {
        startDate = Date.now() - 7 * 24 * 60 * 60 * 1000;
      } else if (props.period === "thirty") {
        startDate = Date.now() - 30 * 24 * 60 * 60 * 1000;
      } else if (props.period === "ninety") {
        startDate = Date.now() - 90 * 24 * 60 * 60 * 1000;
      }

      const endDate = Date.now();

      const url = `${
        import.meta.env.VITE_BASE_URL
      }/analytics/${id}/paths?startDate=${startDate}&endDate=${endDate}`;

      const res = await fetch(url, {
        headers: {
          "X-Orbiter-Token": token,
        },
      });
      const data = await res.json();
      setPageData(data.data.slice(0, 10));
      setLoading(false);
    } catch (error) {
      console.log(error);
      setLoading(false);
    }
  };
  return (
    <div className="md:w-1/3 m-auto w-full h-full justify-start">
      <div className="flex justify-between items-center w-full mb-4">
        <h3 className="text-xl">Pages</h3>
        <h3 className="text-xl">Views</h3>
      </div>
      {loading ? (
        <p>Loading...</p>
      ) : (
        pageData.map((p: PageData) => {
          return (
            <div className="flex justify-between items-center w-full">
              <div className="w-1/3">
                <p>{p.path}</p>
              </div>
              <div className="group relative w-1/2 h-8 bg-gray-200 rounded overflow-hidden">
                <div
                  className="absolute top-0 left-0 h-full bg-gray-700 transition-all duration-300"
                  style={{
                    width: `${Math.min(Math.max(0, p.percentage), 100)}%`,
                  }}
                />
                <p className="relative z-10 text-center text-white leading-8 font-medium">
                  {p.count}
                </p>

                {/* Tooltip */}
                <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 absolute top-full left-1/2 -translate-x-1/2 mt-2 px-2 py-1 bg-gray-800 text-white text-sm rounded">
                  {Math.min(Math.max(0, p.percentage), 100).toFixed(1)}%
                </div>
              </div>
            </div>
          );
        })
      )}
    </div>
  );
};

export default Pages;
