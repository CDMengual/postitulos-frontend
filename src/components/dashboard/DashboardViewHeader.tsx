"use client";

import { FormControl, InputLabel, MenuItem, Paper, Select, Stack, Tab, Tabs } from "@mui/material";
import { DashboardTabValue } from "./dashboardViewConfig";
import { DashboardHistoricalFilter } from "./dashboardSelectors";

interface Props {
  activeTab: DashboardTabValue;
  currentYear: number;
  availableYears: number[];
  selectedHistoricalYear: DashboardHistoricalFilter;
  onChangeTab: (value: DashboardTabValue) => void;
  onChangeHistoricalYear: (value: DashboardHistoricalFilter) => void;
}

export default function DashboardViewHeader({
  activeTab,
  currentYear,
  availableYears,
  selectedHistoricalYear,
  onChangeTab,
  onChangeHistoricalYear,
}: Props) {
  return (
    <Paper
      variant="outlined"
      sx={{
        p: 1.5,
        borderRadius: 3,
      }}
    >
      <Stack
        direction={{ xs: "column", md: "row" }}
        spacing={2}
        justifyContent="space-between"
        alignItems={{ xs: "stretch", md: "center" }}
      >
        <Tabs
          value={activeTab}
          onChange={(_, value: DashboardTabValue) => onChangeTab(value)}
          variant="scrollable"
          allowScrollButtonsMobile
        >
          <Tab value="current" label={`Año actual (${currentYear})`} />
          <Tab value="historical" label="Histórico" />
        </Tabs>

        {activeTab === "historical" ? (
          <FormControl size="small" sx={{ minWidth: { xs: "100%", md: 220 } }}>
            <InputLabel id="dashboard-historical-year-label">Periodo</InputLabel>
            <Select
              labelId="dashboard-historical-year-label"
              value={String(selectedHistoricalYear)}
              label="Periodo"
              onChange={(event) => {
                const value = event.target.value;
                onChangeHistoricalYear(value === "all" ? "all" : Number(value));
              }}
            >
              <MenuItem value="all">Todos los años</MenuItem>
              {availableYears.map((year) => (
                <MenuItem key={year} value={String(year)}>
                  {year}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        ) : null}
      </Stack>
    </Paper>
  );
}
