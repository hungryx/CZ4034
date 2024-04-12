import React, { useEffect, useState } from "react";
import { Doughnut } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";

ChartJS.register(ArcElement, Tooltip, Legend);

const SentimentDonutChart = ({ data }) => {
  const [chartData, setChartData] = useState(null);

  useEffect(() => {
    if (data && data.length > 0) {
      const sentimentsCount = {
        0: 0,
        1: 0,
        2: 0,
      };

      data.forEach((item) => {
        const sentiment = item.sentiment;
        if (sentiment in sentimentsCount) {
          sentimentsCount[sentiment]++;
        }
      });

      const chartData = {
        labels: ["Negative", "Positive", "Neutral"],
        datasets: [
          {
            data: Object.values(sentimentsCount),
            backgroundColor: [
              "rgba(191,16,41,1)",
              "rgba(117,145,22,1)",
              "rgba(255,178,52,1)",
            ],
            borderColor: [
              "rgba(191,16,41,1)",
              "rgba(117,145,22,1)",
              "rgba(255,178,52,1)",
            ],
            borderWidth: 1,
          },
        ],
      };

      setChartData(chartData);
    }
  }, [data]);

  return (
    <div>
      {chartData && (
        <Doughnut
          className="graph"
          data={chartData}
          options={{
            plugins: {
              legend: {
                position: "bottom",
                labels: {
                  boxWidth: 10,
                  color: "white",
                },
              },
            },
          }}
        />
      )}
    </div>
  );
};

export default SentimentDonutChart;
