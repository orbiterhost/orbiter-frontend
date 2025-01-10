import Chart from "react-apexcharts";
import { useEffect, useState } from "react";
import { getDailyUsers } from "@/utils/data";

export default function UsersByDay() {
  const [chartData, setChartData] = useState<any>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await getDailyUsers();
        console.log(data)
        // Reverse the data to show oldest to newest
        const reversedData = [...data.data].reverse();

        setChartData({
          type: "bar",
          height: 240,
          series: [
            {
              name: "Versions",
              data: reversedData.map((item) => item.users),
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
                const date = new Date(item.date);
                return date.toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
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
                  const date = new Date(reversedData[val - 1].date);
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
  }, []);

  if (isLoading) {
    return (
      <div className="w-3/4 m-auto">Loading...</div>
    );
  }

  if (error) {
    return (
     <div className="w-3/4 m-auto">Error loading chart</div>
    );
  }

  return (
    <div className="w-3/4 m-auto">
        <dt className="text-sm/6 font-medium text-gray-500">New Users By Day</dt>
      <Chart {...chartData} />
    </div>
  );
}
