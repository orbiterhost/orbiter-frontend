import { useState, useEffect } from 'react';
import ReactApexChart from 'react-apexcharts';
import { ApexOptions } from 'apexcharts';
import { getOnboardingAnalytics } from '@/utils/data';
import { DataPoint } from '@/utils/types';

const OnboardingAnalytics = () => {
    const [startDate] = useState("");
    const [endDate] = useState("");
    const [referralData, setReferralData] = useState<any>(null);
    const [siteTypesData, setSiteTypesData] = useState<any>(null);
    const [techExpData, setTechExpData] = useState<any>(null);
    const [prevPlatformData, setPrevPlatformData] = useState<any>(null);

    const [isLoading, setIsLoading] = useState(true);

      useEffect(() => {
        const fetchData = async () => {
          try {
            const res = await getOnboardingAnalytics({ startDate, endDate });
            const data = res.data;
            setReferralData(formatChartData(data.referral_sources));
            setSiteTypesData(formatChartData(data.site_types));
            setTechExpData(formatChartData(data.technical_experience));
            setPrevPlatformData(formatChartData(data.previous_platform));
            
            setIsLoading(false);
          } catch (error: any) {
            console.log(error);
            setIsLoading(false);
          }
        };
    
        fetchData();
      }, []);

  const formatChartData = (dataArray: DataPoint[]) => {
    const series = dataArray.map(item => item.count);
    const labels = dataArray.map(item => item.value);
    
    return { series, labels };
  };

  const getChartOptions = (title: string, labels: string[]): ApexOptions => ({
    chart: {
      type: 'pie' as const,
    },
    labels,
    title: {
      text: title,
      align: 'center',
      style: {
        fontSize: '16px',
        fontWeight: 'bold',
      },
    },
    legend: {
      position: 'bottom',
    },
    responsive: [{
      breakpoint: 480,
      options: {
        chart: {
          width: 300
        },
        legend: {
          position: 'bottom'
        }
      }
    }],
    tooltip: {
      y: {
        formatter: function(value) {
          return value + ' responses';
        }
      }
    },
    colors: [
      '#008FFB', '#00E396', '#FEB019', '#FF4560', '#775DD0', 
      '#3F51B5', '#03A9F4', '#4CAF50', '#F9CE1D', '#FF9800'
    ],
    plotOptions: {
      pie: {
        donut: {
          size: '65%',
        },
        expandOnClick: true,
      }
    },
  });

  if (isLoading) {
    return (
      <div className="w-3/4 m-auto">Loading...</div>
    );
  }

  return (
    <div className="w-3/4 m-auto">      
      <div className="grid grid cols-2 md:grid-cols-4">
        <div className="chart-box">
          <ReactApexChart
            options={getChartOptions('Referral Sources', referralData.labels)}
            series={referralData.series}
            type="pie"
            height={350}
          />
        </div>
        
        <div className="chart-box">
          <ReactApexChart
            options={getChartOptions('Site Types', siteTypesData.labels)}
            series={siteTypesData.series}
            type="pie"
            height={350}
          />
        </div>
        
        <div className="chart-box">
          <ReactApexChart
            options={getChartOptions('Technical Experience', techExpData.labels)}
            series={techExpData.series}
            type="pie"
            height={350}
          />
        </div>
        
        <div className="chart-box">
          <ReactApexChart
            options={getChartOptions('Previous Platform', prevPlatformData.labels)}
            series={prevPlatformData.series}
            type="pie"
            height={350}
          />
        </div>
      </div>
    </div>
  );
};

export default OnboardingAnalytics;