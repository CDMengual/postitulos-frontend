"use client";

import { Box } from "@mui/material";
import type { SvgIconComponent } from "@mui/icons-material";
import DashboardKpiCard from "./DashboardKpiCard";

interface SummaryMetric {
  label: string;
  value: number;
  icon: SvgIconComponent;
}

interface Props {
  metrics: SummaryMetric[];
}

export default function DashboardSummaryCards({ metrics }: Props) {
  return (
    <Box
      sx={{
        display: "grid",
        gap: 3,
        gridTemplateColumns: {
          xs: "1fr",
          sm: "repeat(2, minmax(0, 1fr))",
          md: "repeat(3, minmax(0, 1fr))",
        },
      }}
    >
      {metrics.map((metric) => (
        <DashboardKpiCard
          key={metric.label}
          label={metric.label}
          value={metric.value}
          icon={metric.icon}
        />
      ))}
    </Box>
  );
}
