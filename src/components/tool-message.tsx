"use client";

import { UIMessage } from "ai";
import { ChevronDown, Loader } from "lucide-react";
import { Button } from "ui/button";
import { cn } from "lib/utils";
import JsonView from "ui/json-view";
import { useState } from "react";
import { Card, CardContent } from "ui/card";
import { LineChartComponent } from "./gen-ui/charts/line-chart";
import { Badge } from "ui/badge";
import { BarChartComponent } from "./gen-ui/charts/bar-chart";

type MessagePart = UIMessage["parts"][number];

type ToolMessagePart = Extract<MessagePart, { type: "tool-invocation" }>;

interface ToolMessagePartProps {
  part: ToolMessagePart;
}

export const ToolMessagePart = ({ part }: ToolMessagePartProps) => {
  const { toolInvocation } = part;
  const { toolName, toolCallId, state } = toolInvocation;
  const [isExpanded, setIsExpanded] = useState(false);

  const isLoading = state !== "result";
  return (
    <div key={toolCallId} className="flex flex-col gap-2 group">
      {/* Standard tool message with accordion showing inputs and outputs */}
      <div
        className="flex flex-row gap-2 items-center cursor-pointer"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <Button
          variant="outline"
          className={cn(
            "flex flex-row gap-2 justify-between items-center text-muted-foreground min-w-44",
            isLoading && "animate-pulse"
          )}
        >
          <p className={cn("font-bold")}>{toolName}</p>
          {isLoading ? (
            <Loader className="size-3 animate-spin" />
          ) : (
            <ChevronDown
              className={cn(
                isExpanded && "rotate-180",
                "transition-transform",
                "size-4"
              )}
            />
          )}
        </Button>
      </div>
      {/* Expanded view showing inputs and outputs */}
      {isExpanded && (
        <Card className="relative mt-2 p-4 max-h-[50vh] overflow-y-auto bg-background">
          <CardContent className="flex flex-row gap-4 text-sm ">
            <div className="w-1/2 min-w-0 flex flex-col">
              <div className="flex items-center gap-2 mb-2 pt-2 pb-1 bg-background z-10">
                <h5 className="text-muted-foreground text-sm font-medium">
                  Inputs
                </h5>
              </div>
              <JsonView data={toolInvocation.args} />
            </div>

            <div className="w-1/2 min-w-0 pl-4 flex flex-col">
              <div className="flex items-center gap-2 mb-4 pt-2 pb-1 bg-background z-10">
                <h5 className="text-muted-foreground text-sm font-medium">
                  Outputs
                </h5>
              </div>
              <JsonView
                data={
                  toolInvocation.state === "result"
                    ? toolInvocation.result
                    : null
                }
              />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Custom Tool Results */}
      {toolName === "custom_plot_bar_chart" && (
        <BarChartComponent {...toolInvocation.args} />
      )}
      {toolName === "custom_plot_line_chart" && (
        <LineChartComponent {...toolInvocation.args} />
      )}
    </div>
  );
};
