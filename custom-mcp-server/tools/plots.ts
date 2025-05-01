import { barChartSchema } from "@/components/gen-ui/charts/bar-chart";
import { lineChartSchema } from "@/components/gen-ui/charts/line-chart";
import { validateBarChartData } from "@/components/gen-ui/lib/validators/bar-chart-validator";
import { validateLineChartData } from "@/components/gen-ui/lib/validators/line-chart-validator";
import { z } from "zod";

export const plotLineChartTool = async (
  params: z.infer<typeof lineChartSchema>
) => {
  // Validate the params
  try {
    const validatedParams = validateLineChartData(params);
    return {
      content: [
        { type: "text", text: "Plotting line chart..." },
        {
          type: "text",
          text: JSON.stringify(
            {
              validatedParams: validatedParams,
              params: params,
            },
            null,
            2
          ),
        },
      ],
    };
  } catch (error) {
    return {
      isError: true,
      content: [{ type: "text", text: "Error plotting line chart: " + error }],
    };
  }
};

export const plotBarChartTool = async (
  params: z.infer<typeof barChartSchema>
) => {
  // Validate the params
  try {
    const validatedParams = validateBarChartData(params);
    return {
      content: [
        { type: "text", text: "Plotting bar chart..." },
        {
          type: "text",
          text: JSON.stringify(
            {
              validatedParams: validatedParams,
              params: params,
            },
            null,
            2
          ),
        },
      ],
    };
  } catch (error) {
    return {
      isError: true,
      content: [{ type: "text", text: "Error plotting bar chart: " + error }],
    };
  }
};
