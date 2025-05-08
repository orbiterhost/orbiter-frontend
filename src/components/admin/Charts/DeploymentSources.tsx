import { useState, useEffect } from "react";
import ReactApexChart from "react-apexcharts";
import { ApexOptions } from "apexcharts";
import { getDeploymentSources } from "@/utils/data";
import { DataPoint } from "@/utils/types";

const DeploymentSources = () => {
  const [startDate] = useState("");
  const [endDate] = useState("");
  const [deploymentData, setDeploymentData] = useState<any>(null);

  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await getDeploymentSources({ startDate, endDate });
        const data = res.data;
        setDeploymentData(formatChartData(data));

        setIsLoading(false);
      } catch (error: any) {
        console.log(error);
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const formatChartData = (dataArray: DataPoint[]) => {
    const series = dataArray.map((item) => item.count);
    const labels = dataArray.map((item) => item.value);

    return { series, labels };
  };

  const getChartOptions = (title: string, labels: string[]): ApexOptions => ({
    chart: {
      type: "pie" as const,
    },
    labels,
    title: {
      text: title,
      align: "center",
      style: {
        fontSize: "16px",
        fontWeight: "bold",
      },
    },
    legend: {
      position: "bottom",
    },
    responsive: [
      {
        breakpoint: 480,
        options: {
          chart: {
            width: 300,
          },
          legend: {
            position: "bottom",
          },
        },
      },
    ],
    tooltip: {
      y: {
        formatter: function (value) {
          return value + " responses";
        },
      },
    },
    colors: [
      "#E89D33", // Darkened base color
      "#E5A64D", // Darkened lighter shade
      "#E5B368", // Darkened even lighter
      "#E5C080", // Darkened very light
      "#E58A1F", // Darkened darker shade
      "#E57F00", // Darkened even darker
      "#CC7200", // Darkened much darker
      "#B36300", // Darkened very dark
      "#995500", // Darkened extremely dark
      "#804700", // Darkened deepest shade
    ],
    plotOptions: {
      pie: {
        donut: {
          size: "65%",
        },
        expandOnClick: true,
      },
    },
  });

  if (isLoading) {
    return <div className="w-3/4 m-auto">Loading...</div>;
  }

  return (
    <div className="mt-6 w-3/4 m-auto">
      <div className="">
        <div className="chart-box">
          <ReactApexChart
            options={getChartOptions("Deployment Sources", deploymentData.labels)}
            series={deploymentData.series}
            type="pie"
            height={450}
          />
        </div>
      </div>
    </div>
  );
};

export default DeploymentSources;
