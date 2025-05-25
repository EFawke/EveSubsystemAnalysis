import {
  ComposedChart,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
  Line,
  Bar,
  CartesianGrid
} from 'recharts';
import { Text, Table, Flex, IconButton, Card, HoverCard, Link, Heading, Select } from "@radix-ui/themes";

function isSmallScale(name = "") {
  const lower = name.toLowerCase();
  return lower.includes("volume") || lower.includes("loss");
}

function InteractiveChart(props) {
  const { data } = props;

  if (!data || data.length === 0) {
    return (
      <Flex height="100%" width="100%" justify="center" align="center">
        No data selected.
      </Flex>
    )
  }

  // 1) Gather all timestamps from all datasets
  const allTs = new Set();
  data.forEach((dataset) => {
    if (dataset.dates) {
      dataset.dates.forEach((tsStr) => {
        const tsNum = Number(tsStr);
        allTs.add(tsNum);
      });
    }
  });

  // 2) Sort ascending
  const sortedTs = Array.from(allTs).sort((a, b) => a - b);

  // 3) Build chartData: For each ts, fill in the dataset's value if present
  const chartData = sortedTs.map((ts) => {
    const dateObj = new Date(ts);
    const dateString = dateObj.toLocaleDateString();
    const row = { date: dateString };

    data.forEach((dataset) => {
      const idx = dataset.dates.findIndex((d) => Number(d) === ts);
      row[dataset.name] =
        idx >= 0 ? Number(dataset.dataValues[idx]) : null;
    });
    return row;
  });

  const colors = ["#8884d8", "#82ca9d", "#ffc658", "#ff7300", "#413ea0", "#888888"];

  return (
    <ResponsiveContainer width="100%" className="chart_container">
      <ComposedChart
        data={chartData}
        margin={{
          top: 5,
          left: 22,
        }}
      >
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis
          dataKey="date"
          tick={{ fill: 'white', fontSize: 'calc(16px * 0.9)' }}
        />
        <YAxis
          yAxisId="left"
          tick={{ fill: 'white', fontSize: 'calc(16px * 0.9)' }}
        />
        <YAxis
          yAxisId="right"
          orientation="right"
          tick={{ fill: 'white', fontSize: 'calc(16px * 0.9)' }}
          domain={[0, dataMax => (dataMax * 2)]}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: 'var(--mauve-2)',
            borderRadius: 'var(--radius-4)',
            color: 'white',
            borderWidth: '1px',
            padding: "var(--space-3)",
            borderColor: 'color-mix(in oklab, var(--gray-a6), var(--gray-6) 25%)',
            fontSize: 'calc(16px * 0.9)',
          }}
        />
        <Legend
          wrapperStyle={{ color: 'white', fontSize: 'calc(16px * 0.9)' }}
        />

        {data.map((dataset, i) => {
          const color = colors[i % colors.length];
          if (isSmallScale(dataset.name)) {
            return (
              <Bar
                key={dataset.name}
                yAxisId="right"
                dataKey={dataset.name}
                fill={color}
                name={dataset.name}
                cursor="pointer"
              />
            );
          } else {
            return (
              <Line
                strokeWidth={2}
                key={dataset.name}
                yAxisId="left"
                type="monotone"
                dataKey={dataset.name}
                stroke={color}
                dot={false}
                activeDot={{ r: 4 }}
                name={dataset.name}
              />
            );
          }
        })}
      </ComposedChart>
    </ResponsiveContainer>
  );
}

export default InteractiveChart;
