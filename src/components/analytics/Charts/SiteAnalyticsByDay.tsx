import Chart from "react-apexcharts";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getAccessToken } from "@/utils/auth";

interface Stats {
  total_requests: number;
  unique_visitors: number;
}

type SiteAnalyticsProps = {
    period: string;
}

export default function SiteAnalyticsByDay(props: SiteAnalyticsProps) {
  const [chartData, setChartData] = useState<any>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState<Stats>({
    total_requests: 0,
    unique_visitors: 0
  });

  const [error, setError] = useState(null);
  const { id } = useParams();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = await getAccessToken();
        
        let startDate;
        if(props.period === "seven") {
            startDate = Date.now() - 7 * 24 * 60 * 60 * 1000
        } else if(props.period === "thirty") {
            startDate = Date.now() - 30 * 24 * 60 * 60 * 1000
        } else if(props.period === "ninety") {
            startDate = Date.now() - 90 * 24 * 60 * 60 * 1000
        }

        const endDate = Date.now();

        const url = `${import.meta.env.VITE_BASE_URL}/analytics/${id}/stats?startDate=${startDate}&endDate=${endDate}`

        const res = await fetch(
          url,
          {
            //  @ts-ignore
            headers: {
              "X-Orbiter-Token": token,
            },
          }
        );
        const data = await res.json();

        setStats(data.data.stats);

        // Reverse the data to show oldest to newest
        const reversedData = [...data.data.dailyStats];

        setChartData({
          type: "line",
          height: 240,
          series: [
            {
              name: "Site Views",
              data: reversedData.map((item) => item.count),
            },
          ],
          options: {
            chart: {
              toolbar: {
                show: false,
              },
            },
            title: {
              show: "",
            },
            dataLabels: {
              enabled: false,
            },
            colors: ["#020617"],
            stroke: {
              lineCap: "round",
              curve: "smooth",
            },
            markers: {
              size: 0,
            },
            xaxis: {
              axisTicks: {
                show: false,
              },
              axisBorder: {
                show: false,
              },
              labels: {
                style: {
                  colors: "#616161",
                  fontSize: "12px",
                  fontFamily: "inherit",
                  fontWeight: 400,
                },
              },
              categories: reversedData.map((item) => {
                const date = new Date(item.date + "T00:00:00Z");
                return date.toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                  timeZone: "UTC",
                });
              }),
            },
            yaxis: {
              labels: {
                style: {
                  colors: "#616161",
                  fontSize: "12px",
                  fontFamily: "inherit",
                  fontWeight: 400,
                },
              },
            },
            grid: {
              show: true,
              borderColor: "#dddddd",
              strokeDashArray: 5,
              xaxis: {
                lines: {
                  show: true,
                },
              },
              padding: {
                top: 5,
                right: 20,
              },
            },
            fill: {
              opacity: 0.8,
            },
            tooltip: {
              theme: "dark",
              x: {
                formatter: (val: any) => {
                  const date = new Date(
                    reversedData[val - 1].date + "T00:00:00Z"
                  );
                  return date.toLocaleDateString("en-US", {
                    month: "long",
                    day: "numeric",
                    year: "numeric",
                  });
                },
              },
            },
          },
        });
        setIsLoading(false);
      } catch (err: any) {
        setError(err.message);
        setIsLoading(false);
      }
    };

    fetchData();
    //  @ts-ignore
  }, [props.period]);

  if (isLoading) {
    return <div className="w-3/4 m-auto">Loading...</div>;
  }

  if (error) {
    return <div className="w-3/4 m-auto">Error loading chart</div>;
  }

  return (
    <div className="w-3/4 m-auto">
      <dl className="mx-auto grid grid-cols-1 gap-px sm:grid-cols-2 lg:grid-cols-4">
        <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-2 bg-white px-4 py-10 sm:px-6 xl:px-8">
          <dt className="text-sm/6 font-medium text-gray-500">Total Views</dt>
          <dd></dd>
          <dd className="w-full flex-none text-3xl/10 font-medium tracking-tight text-gray-900">
            {stats.total_requests}
          </dd>
        </div>
        <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-2 bg-white px-4 py-10 sm:px-6 xl:px-8">
          <dt className="text-sm/6 font-medium text-gray-500">Unique Visitors</dt>
          <dd></dd>
          <dd className="w-full flex-none text-3xl/10 font-medium tracking-tight text-gray-900">
            {stats.unique_visitors}
          </dd>
        </div>
      </dl>
      <h1 className="pl-4 text-xl">Views by day</h1>
      <Chart {...chartData} />
    </div>
  );
}
