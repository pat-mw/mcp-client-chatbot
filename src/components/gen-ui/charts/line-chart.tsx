"use client";

import { useState } from "react";
import {
  Line,
  LineChart,
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
export const dataPointSchema = z.object({
  x: z.union([z.string(), z.number()]).describe("The x-axis value"),
  y: z.number().describe("The y-axis value"),
  // Optional additional data for tooltips or other features
  meta: z
    .record(z.string(), z.any())
    .optional()
    .describe("Additional metadata for this point"),
});

export type DataPoint = z.infer<typeof dataPointSchema>;

// Define the schema for a single dataset (one line)
export const datasetSchema = z.object({
  id: z.string().describe("Unique identifier for this dataset"),
  name: z.string().describe("Display name for this dataset"),
  color: z
    .string()
    .describe("Color for this line (hex, rgb, or tailwind class)"),
  data: z.array(dataPointSchema).describe("Array of data points for this line"),
});

export type Dataset = z.infer<typeof datasetSchema>;

// Define the schema for a chart tab
export const chartTabSchema = z.object({
  id: z.string().describe("Unique identifier for this tab"),
  name: z.string().describe("Display name for this tab"),
  datasets: z
    .array(datasetSchema)
    .describe("Array of datasets to display in this tab"),
});

export type ChartTab = z.infer<typeof chartTabSchema>;

// Define the schema for the line chart props
export const lineChartSchema = z.object({
  title: z.string().describe("Chart title"),
  description: z.string().optional().describe("Chart description"),
  tabs: z
    .array(chartTabSchema)
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
  showTooltip: z.boolean().default(true).describe("Whether to show tooltips"),
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

export type LineChartProps = z.infer<typeof lineChartSchema>;

export function LineChartComponent({
  title,
  description,
  tabs,
  defaultTabId,
  height = 300,
  xAxisLabel,
  yAxisLabel,
  className,
  showGrid = true,
  showTooltip = true,
  formatXAxis,
  formatYAxis,
  formatTooltip,
}: LineChartProps) {
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
                <LineChart
                  data={tab.datasets[0]?.data.map((point, index) => {
                    // Combine all datasets into a single data point for each x value
                    const combinedPoint: Record<string, any> = { x: point.x };

                    tab.datasets.forEach((dataset) => {
                      // Make sure we have data for this index
                      if (dataset.data[index]) {
                        combinedPoint[dataset.id] = dataset.data[index].y;
                      }
                    });

                    return combinedPoint;
                  })}
                  margin={{ top: 10, right: 10, left: 10, bottom: 20 }}
                >
                  <XAxis
                    dataKey="x"
                    tickFormatter={formatXAxis}
                    label={
                      xAxisLabel
                        ? { value: xAxisLabel, position: "bottom", offset: 0 }
                        : undefined
                    }
                    tick={{ fontSize: 12 }}
                  />
                  <YAxis
                    tickFormatter={formatYAxis}
                    label={
                      yAxisLabel
                        ? {
                            value: yAxisLabel,
                            angle: -90,
                            position: "left",
                            offset: 0,
                          }
                        : undefined
                    }
                    tick={{ fontSize: 12 }}
                  />
                  {showGrid && <Tooltip formatter={tooltipFormatter} />}

                  {tab.datasets.map((dataset) => (
                    <Line
                      key={dataset.id}
                      type="monotone"
                      dataKey={dataset.id}
                      name={dataset.name}
                      stroke={dataset.color}
                      strokeWidth={2}
                      dot={{ r: 4 }}
                      activeDot={{ r: 6 }}
                    />
                  ))}
                </LineChart>
              </ResponsiveContainer>
            </TabsContent>
          ))}
        </Tabs>
      </CardContent>
    </Card>
  );
}
