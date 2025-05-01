import { lineChartSchema } from "@/components/gen-ui/charts/line-chart";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import { plotBarChartTool, plotLineChartTool } from "./tools/plots";
import { barChartSchema } from "@/components/gen-ui/charts/bar-chart";
const server = new McpServer({
  name: "custom-mcp-server",
  version: "0.0.1",
});

server.tool(
  "plot_line_chart",
  "Plot a line chart with the given data.",
  lineChartSchema.shape,
  async (params) => {
    const result = await plotLineChartTool(params);
    return {
      content: result.content.map((item) => ({
        ...item,
        type: "text" as const,
      })),
    };
  }
);

server.tool(
  "plot_bar_chart",
  "Plot a bar chart with the given data.",
  barChartSchema.shape,
  async (params) => {
    const result = await plotBarChartTool(params);
    return {
      content: result.content.map((item) => ({
        ...item,
        type: "text" as const,
      })),
    };
  }
);

server.tool(
  "get_weather",
  "Get the current weather at a location.",
  {
    latitude: z.number(),
    longitude: z.number(),
  },
  async ({ latitude, longitude }) => {
    const response = await fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m&hourly=temperature_2m&daily=sunrise,sunset&timezone=auto`
    );
    const data = await response.json();
    return {
      content: [
        {
          type: "text",
          text: `The current temperature in ${latitude}, ${longitude} is ${data.current.temperature_2m}°C.`,
        },
        {
          type: "text",
          text: `The sunrise in ${latitude}, ${longitude} is ${data.daily.sunrise[0]} and the sunset is ${data.daily.sunset[0]}.`,
        },
      ],
    };
  }
);

const transport = new StdioServerTransport();

await server.connect(transport);
