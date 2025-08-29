import { useState } from "react";
import { Button, ToggleButton } from "react-aria-components";
import { 
  ChartBarIcon, 
  Squares2X2Icon, 
  RectangleStackIcon,
  TableCellsIcon 
} from "@heroicons/react/24/outline";

export type DashboardLayout = "overview" | "analytics" | "bento" | "detailed";

interface DashboardLayoutSwitcherProps {
  currentLayout: DashboardLayout;
  onLayoutChange: (layout: DashboardLayout) => void;
}

const layouts = [
  {
    id: "overview" as const,
    name: "Overview",
    icon: Squares2X2Icon,
    description: "Quick overview with key metrics"
  },
  {
    id: "analytics" as const,
    name: "Analytics",
    icon: ChartBarIcon,
    description: "Charts and detailed analysis"
  },
  {
    id: "bento" as const,
    name: "Bento Grid",
    icon: RectangleStackIcon,
    description: "Modern bento-style layout"
  },
  {
    id: "detailed" as const,
    name: "Detailed",
    icon: TableCellsIcon,
    description: "Comprehensive data tables"
  }
] as const;

export function DashboardLayoutSwitcher({ currentLayout, onLayoutChange }: DashboardLayoutSwitcherProps) {
  return (
    <div className="flex items-center gap-2 p-1 bg-surface-1 rounded-lg border border-border">
      {layouts.map((layout) => {
        const Icon = layout.icon;
        const isSelected = currentLayout === layout.id;
        
        return (
          <Button
            key={layout.id}
            onPress={() => onLayoutChange(layout.id)}
            className={`
              flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-all
              ${isSelected 
                ? 'bg-primary text-primary-foreground shadow-sm' 
                : 'hover:bg-surface-2 text-muted-foreground hover:text-foreground'
              }
            `}
          >
            <Icon className="w-4 h-4" />
            <span className="hidden sm:inline">{layout.name}</span>
          </Button>
        );
      })}
    </div>
  );
}