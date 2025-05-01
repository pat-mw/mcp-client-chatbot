import { z } from "zod";
import { lineChartSchema } from "@/components/gen-ui/charts/line-chart";

/**
 * Validates chart data against the line chart schema
 * @param data The chart data to validate
 * @returns The validated data or throws an error
 */
export function validateLineChartData(data: unknown) {
  try {
    return lineChartSchema.parse(data);
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error("Chart data validation failed:", error.errors);
      throw new Error(
        `Chart data validation failed: ${error.errors
          .map((e) => e.message)
          .join(", ")}`
      );
    }
    throw error;
  }
}
