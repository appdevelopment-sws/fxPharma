import {
  Bar,
  BarChart,
  Cell,
  Line,
  LineChart,
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"

interface BaseChartProps {
  data: any[]
  height?: number | string
  xKey?: string
  yKey?: string
  color?: string
}

export function DashboardBarChart({
  data,
  height = 350,
  xKey = "name",
  yKey = "value",
  color = "var(--primary)",
}: BaseChartProps) {
  const colors = [
    "#88eeccff", // Teal/Green (e.g. POS)
    "#6094d0ff", // Blue (e.g. Stock Management)
    "#9874edff", // Purple/Violet (e.g. Sales Returns)
    "#e3a265ff", // Orange (e.g. Orders)
    "#e2b362ff", // Amber/Yellow
    "#ea6baaff", // Pink
  ]

  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart
        data={data}
        margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
      >
        <CartesianGrid
          strokeDasharray="3 3"
          vertical={false}
          stroke="var(--border)"
          opacity={0.5}
        />
        <XAxis
          dataKey={xKey}
          stroke="var(--muted-foreground)"
          fontSize={12}
          tickLine={false}
          axisLine={false}
        />
        <YAxis
          stroke="var(--muted-foreground)"
          fontSize={12}
          tickLine={false}
          axisLine={false}
          tickFormatter={(value) => `${value}`}
        />
        <Tooltip
          cursor={{ fill: "var(--muted)", opacity: 0.2 }}
          contentStyle={{
            backgroundColor: "var(--background)",
            border: "1px solid var(--border)",
            borderRadius: "8px",
            color: "var(--foreground)",
          }}
          itemStyle={{ color: "var(--foreground)" }}
        />
        <Bar dataKey={yKey} radius={[4, 4, 0, 0]}>
          {(data || []).map((_, index) => (
            <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  )
}

export function DashboardLineChart({
  data,
  height = 350,
  xKey = "name",
  yKey = "value",
  color = "var(--primary)",
}: BaseChartProps) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <LineChart
        data={data}
        margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
      >
        <CartesianGrid
          strokeDasharray="3 3"
          vertical={false}
          stroke="var(--border)"
          opacity={0.4}
        />
        <XAxis
          dataKey={xKey}
          stroke="var(--muted-foreground)"
          fontSize={12}
          tickLine={false}
          axisLine={false}
        />
        <YAxis
          stroke="var(--muted-foreground)"
          fontSize={12}
          tickLine={false}
          axisLine={false}
          tickFormatter={(value) => `${value}`}
        />
        <Tooltip
          cursor={{
            stroke: "var(--border)",
            strokeWidth: 1,
            strokeDasharray: "3 3",
          }}
          contentStyle={{
            backgroundColor: "var(--background)",
            border: "1px solid var(--border)",
            borderRadius: "8px",
            color: "var(--foreground)",
          }}
          itemStyle={{ color: "var(--foreground)" }}
        />
        <Line
          type="monotone"
          dataKey={yKey}
          stroke={color}
          strokeWidth={2}
          activeDot={{ r: 6, fill: color }}
          dot={false}
        />
      </LineChart>
    </ResponsiveContainer>
  )
}

export function DashboardAreaChart({
  data,
  height = 350,
  xKey = "name",
  yKey = "value",
  color = "var(--primary)",
}: BaseChartProps) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <AreaChart
        data={data}
        margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
      >
        <CartesianGrid
          strokeDasharray="3 3"
          vertical={false}
          stroke="var(--border)"
          opacity={0.4}
        />
        <XAxis
          dataKey={xKey}
          stroke="var(--muted-foreground)"
          fontSize={12}
          tickLine={false}
          axisLine={false}
        />
        <YAxis
          stroke="var(--muted-foreground)"
          fontSize={12}
          tickLine={false}
          axisLine={false}
          tickFormatter={(value) => `${value}`}
        />
        <Tooltip
          cursor={{ stroke: "var(--border)" }}
          contentStyle={{
            backgroundColor: "var(--background)",
            border: "1px solid var(--border)",
            borderRadius: "8px",
            color: "var(--foreground)",
          }}
          itemStyle={{ color: "var(--foreground)" }}
        />
        <Area
          type="monotone"
          dataKey={yKey}
          stroke={color}
          fill={color}
          fillOpacity={0.2}
        />
      </AreaChart>
    </ResponsiveContainer>
  )
}
