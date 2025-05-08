import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { getAccessToken } from "@/utils/auth";
import { countryCodeMap } from "@/utils/countryCode";
import { memo, useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import {
  ComposableMap,
  Geographies,
  Geography,
  ZoomableGroup,
} from "react-simple-maps";

const geoUrl = "https://unpkg.com/world-atlas/countries-50m.json";

type WorldMapProps = {
  period: string;
};

type CountryData = {
  country: string;
  count: number;
  percentage: number;
};

const WorldMap = (props: WorldMapProps) => {
  const [countryData, setCountryData] = useState<CountryData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tooltipContent, setTooltipContent] = useState("");
  const [tooltipOpen, setTooltipOpen] = useState(false);
  const { id } = useParams();

  useEffect(() => {
    getCountryData();
    //  @ts-ignore
  }, [props.period]);

  const getCountryData = async () => {
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
      }/analytics/${id}/countries?startDate=${startDate}&endDate=${endDate}`;

      const res = await fetch(url, {
        //  @ts-ignore
        headers: {
          "X-Orbiter-Token": token,
          "Source": "web-app"
        },
      });

      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }

      const data = await res.json();
      console.log("Received country data:", data.data);
      setCountryData(data.data);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching data:", error);
      setError(error instanceof Error ? error.message : "An error occurred");
      setLoading(false);
    }
  };

  const getCountryInfo = (geo: any) => {
    const countryName = geo.properties.name;
    const country = countryData.find((c) => {
      const mappedName = countryCodeMap[c.country];
      return mappedName === countryName;
    });

    if (!country) {
      return {
        color: "#2A2A2A",
        visitors: 0,
        name: countryName,
      };
    }

    const opacity = Math.max(0.2, Math.min(1, country.percentage / 100));
    return {
      color: `rgba(255, 183, 87, ${opacity})`,
      visitors: country.count,
      name: countryName,
    };
  };

  return (
    <div className="mt-20 flex flex-col md:flex-row w-3/4 m-auto items-start justify-start">
      <div className="md:w-1/3 h-full mx-auto w-full justify-start">
        <div className="flex justify-between items-center w-full mb-4">
          <h3 className="text-xl">Countries</h3>
          <h3 className="text-xl">Visitors</h3>
        </div>
        {loading ? (
          <p>Loading...</p>
        ) : (
          countryData.map((p: CountryData) => {
            return (
              <div className="flex justify-between items-center w-full">
                <div className="w-1/3">
                  <p>{p.country}</p>
                </div>
                <div className="group relative w-1/2 h-8 bg-muted rounded overflow-hidden">
                  <div
                    className="absolute top-0 left-0 h-full bg-primary transition-all duration-300"
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
      <div className="w-1/2 h-[500px] p-4">
        {error && <div className="text-red-500 mb-4">{error}</div>}
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <p>Loading...</p>
          </div>
        ) : (
          <TooltipProvider>
            <ComposableMap
              projection="geoEquirectangular"
              projectionConfig={{
                scale: 180,
                center: [-30, 20],
              }}
              style={{
                width: "100%",
                height: "100%",
                backgroundColor: "transparent",
              }}
              className="border border-muted-foreground rounded-sm"
            >
              <ZoomableGroup zoom={1}>
                <Geographies geography={geoUrl}>
                  {({ geographies }) =>
                    geographies.map((geo) => {
                      const countryInfo = getCountryInfo(geo);
                      return (
                        <Tooltip
                          key={geo.rsmKey}
                          open={
                            tooltipContent === geo.rsmKey ? tooltipOpen : false
                          }
                        >
                          <TooltipTrigger asChild>
                            <Geography
                              geography={geo}
                              fill={countryInfo.color}
                              stroke="#616161"
                              strokeWidth={0.5}
                              style={{
                                default: {
                                  outline: "none",
                                },
                                hover: {
                                  fill: countryInfo.color,
                                  opacity: 0.8,
                                  outline: "none",
                                },
                                pressed: {
                                  outline: "none",
                                },
                              }}
                              onMouseEnter={() => {
                                setTooltipContent(geo.rsmKey);
                                setTooltipOpen(true);
                              }}
                              onMouseLeave={() => {
                                setTooltipOpen(false);
                              }}
                            />
                          </TooltipTrigger>
                          <TooltipContent>
                            <div className="text-sm">
                              <p className="font-medium">{countryInfo.name}</p>
                              <p>
                                {countryInfo.visitors.toLocaleString()} visitors
                              </p>
                            </div>
                          </TooltipContent>
                        </Tooltip>
                      );
                    })
                  }
                </Geographies>
              </ZoomableGroup>
            </ComposableMap>
          </TooltipProvider>
        )}
      </div>
    </div>
  );
};

export default memo(WorldMap);
