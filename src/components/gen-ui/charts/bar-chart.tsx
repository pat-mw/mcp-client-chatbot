"use client";

import { memo, useState } from "react";
import {
  Bar,
  BarChart as RechartsBarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { z } from "zod";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";

// Define the schema for a single data point
export const barDataPointSchema = z.object({
  x: z.union([z.string(), z.number()]).describe("The category or x-axis value"),
  y: z.number().describe("The value or y-axis value"),
  // Optional additional data for tooltips or other features
  meta: z
    .record(z.string(), z.any())
    .optional()
    .describe("Additional metadata for this point"),
});

export type BarDataPoint = z.infer<typeof barDataPointSchema>;

// Define the schema for a single dataset (one bar series)
export const barDatasetSchema = z.object({
  id: z.string().describe("Unique identifier for this dataset"),
  name: z.string().describe("Display name for this dataset"),
  color: z
    .string()
    .describe("Color for this bar series (hex, rgb, or tailwind class)"),
  data: z
    .array(barDataPointSchema)
    .describe("Array of data points for this bar series"),
});

export type BarDataset = z.infer<typeof barDatasetSchema>;

// Define the schema for a chart tab
export const barChartTabSchema = z.object({
  id: z.string().describe("Unique identifier for this tab"),
  name: z.string().describe("Display name for this tab"),
  datasets: z
    .array(barDatasetSchema)
    .describe("Array of datasets to display in this tab"),
});

export type BarChartTab = z.infer<typeof barChartTabSchema>;

// Define the schema for the bar chart props
export const barChartSchema = z.object({
  title: z.string().describe("Chart title"),
  description: z.string().optional().describe("Chart description"),
  tabs: z
    .array(barChartTabSchema)
    .describe("Array of tabs, each containing datasets"),
  defaultTabId: z
    .string()
    .optional()
    .describe("ID of the default selected tab"),
  height: z.number().default(300).describe("Chart height in pixels"),
  xAxisLabel: z.string().optional().describe("Label for the x-axis"),
  yAxisLabel: z.string().optional().describe("Label for the y-axis"),
  className: z.string().optional().describe("Additional CSS classes"),
  showGrid: z.boolean().default(true).describe("Whether to show grid lines"),
  showLegend: z.boolean().default(true).describe("Whether to show the legend"),
  showTooltip: z.boolean().default(true).describe("Whether to show tooltips"),
  layout: z
    .enum(["vertical", "horizontal"])
    .default("vertical")
    .describe("Bar orientation (vertical or horizontal)"),
  stacked: z.boolean().default(false).describe("Whether to stack the bars"),
  formatXAxis: z
    .function()
    .args(z.union([z.string(), z.number()]))
    .returns(z.string())
    .optional()
    .describe("Function to format x-axis labels"),
  formatYAxis: z
    .function()
    .args(z.number())
    .returns(z.string())
    .optional()
    .describe("Function to format y-axis labels"),
  formatTooltip: z
    .function()
    .args(z.any())
    .returns(z.string())
    .optional()
    .describe("Function to format tooltip values"),
});

export type BarChartProps = z.infer<typeof barChartSchema>;

export function BarChartComponent({
  title,
  description,
  tabs,
  defaultTabId,
  height = 300,
  xAxisLabel,
  yAxisLabel,
  className,
  showGrid = true,
  showLegend = true,
  showTooltip = true,
  layout = "vertical",
  stacked = false,
  formatXAxis,
  formatYAxis,
  formatTooltip,
}: BarChartProps) {
  const [activeTab, setActiveTab] = useState(defaultTabId || tabs[0].id);

  // Find the active tab data
  const activeTabData = tabs.find((tab) => tab.id === activeTab) || tabs[0];

  // Custom tooltip formatter
  const tooltipFormatter = (value: number, name: string) => {
    if (formatTooltip) {
      return [formatTooltip(value), name];
    }
    return [value.toString(), name];
  };

  // Prepare data for the chart
  const prepareChartData = (tab: BarChartTab) => {
    // If we only have one dataset, we can use it directly
    if (tab.datasets.length === 1) {
      return tab.datasets[0].data.map((point) => ({
        x: point.x,
        [tab.datasets[0].id]: point.y,
        ...point.meta,
      }));
    }

    // For multiple datasets, we need to combine them by x value
    const combinedData: Record<string | number, any>[] = [];

    // First, collect all unique x values
    const xValues = new Set<string | number>();
    tab.datasets.forEach((dataset) => {
      dataset.data.forEach((point) => {
        xValues.add(point.x);
      });
    });

    // Create a map for each x value
    xValues.forEach((x) => {
      const dataPoint: Record<string, any> = { x };

      // Add data from each dataset
      tab.datasets.forEach((dataset) => {
        const point = dataset.data.find((p) => p.x === x);
        dataPoint[dataset.id] = point ? point.y : 0;

        // Add metadata if available
        if (point?.meta) {
          Object.entries(point.meta).forEach(([key, value]) => {
            dataPoint[`${dataset.id}_${key}`] = value;
          });
        }
      });

      combinedData.push(dataPoint);
    });

    return combinedData;
  };

  return (
    <Card className={cn("w-full", className)}>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent>
        <Tabs
          defaultValue={activeTab}
          onValueChange={setActiveTab}
          className="w-full"
        >
          <TabsList className="mb-4">
            {tabs.map((tab) => (
              <TabsTrigger key={tab.id} value={tab.id}>
                {tab.name}
              </TabsTrigger>
            ))}
          </TabsList>
          {tabs.map((tab) => (
            <TabsContent key={tab.id} value={tab.id} className="w-full">
              <ResponsiveContainer width="100%" height={height}>
                <RechartsBarChart
                  data={prepareChartData(tab)}
                  layout={layout}
                  margin={{ top: 20, right: 30, left: 50, bottom: 40 }}
                >
                  {showGrid && <CartesianGrid strokeDasharray="3 3" />}

                  {layout === "vertical" ? (
                    <>
                      <XAxis
                        dataKey="x"
                        tickFormatter={formatXAxis}
                        label={
                          xAxisLabel
                            ? {
                                value: xAxisLabel,
                                position: "bottom",
                                offset: 10,
                              }
                            : undefined
                        }
                        tick={{ fontSize: 12 }}
                        height={40}
                      />
                      <YAxis
                        tickFormatter={formatYAxis}
                        label={
                          yAxisLabel
                            ? {
                                value: yAxisLabel,
                                angle: -90,
                                position: "insideLeft",
                                offset: -10,
                              }
                            : undefined
                        }
                        tick={{ fontSize: 12 }}
                        width={60}
                      />
                    </>
                  ) : (
                    <>
                      <XAxis
                        type="number"
                        tickFormatter={formatYAxis}
                        label={
                          yAxisLabel
                            ? {
                                value: yAxisLabel,
                                position: "bottom",
                                offset: 10,
                              }
                            : undefined
                        }
                        tick={{ fontSize: 12 }}
                        height={40}
                      />
                      <YAxis
                        dataKey="x"
                        type="category"
                        tickFormatter={formatXAxis}
                        label={
                          xAxisLabel
                            ? {
                                value: xAxisLabel,
                                angle: -90,
                                position: "insideLeft",
                                offset: -10,
                              }
                            : undefined
                        }
                        tick={{ fontSize: 12 }}
                        width={120}
                      />
                    </>
                  )}

                  {showTooltip && <Tooltip formatter={tooltipFormatter} />}
                  {showLegend && <Legend />}

                  {tab.datasets.map((dataset) => (
                    <Bar
                      key={dataset.id}
                      dataKey={dataset.id}
                      name={dataset.name}
                      fill={dataset.color}
                      stackId={stacked ? "stack" : undefined}
                      radius={[4, 4, 0, 0]}
                    />
                  ))}
                </RechartsBarChart>
              </ResponsiveContainer>
            </TabsContent>
          ))}
        </Tabs>
      </CardContent>
    </Card>
  );
}

export const BarChart = memo(BarChartComponent);
