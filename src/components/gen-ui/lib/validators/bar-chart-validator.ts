"use client";

import { z } from "zod";
import { barChartSchema } from "@/components/gen-ui/charts/bar-chart";

/**
 * Validates bar chart data against the bar chart schema
 * @param data The chart data to validate
 * @returns The validated data or throws an error
 */
export function validateBarChartData(data: unknown) {
  try {
    return barChartSchema.parse(data);
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error("Bar chart data validation failed:", error.errors);
      throw new Error(
        `Bar chart data validation failed: ${error.errors
          .map((e) => e.message)
          .join(", ")}`
      );
    }
    throw error;
  }
}
