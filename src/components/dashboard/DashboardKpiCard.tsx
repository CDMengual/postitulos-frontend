"use client";

import { Card, CardContent, Stack, Typography, Box } from "@mui/material";
import type { SvgIconComponent } from "@mui/icons-material";

interface Props {
  label: string;
  value: number;
  icon: SvgIconComponent;
}

export default function DashboardKpiCard({ label, value, icon: Icon }: Props) {
  return (
    <Card
      variant="hoverable"
      sx={{
        height: "100%",
        borderColor: "#cfe1f8",
        background: "linear-gradient(180deg, #ffffff 0%, #f4f8fd 100%)",
      }}
    >
      <CardContent sx={{ p: 2.5 }}>
        <Stack direction="row">
          <Stack spacing={1}>
            <Typography variant="body2" color="text.secondary">
              {label}
            </Typography>
            <Stack spacing={3} direction="row" alignItems="flex-start">
              <Box
                sx={{
                  width: 44,
                  height: 44,
                  borderRadius: 2,
                  display: "grid",
                  placeItems: "center",
                  backgroundColor: "#f5f5f5",
                  color: "primary.main",
                  flexShrink: 0,
                }}
              >
                <Icon fontSize="small" />
              </Box>
              <Typography variant="h4" sx={{ fontWeight: 400 }}>
                {value.toLocaleString("es-AR")}
              </Typography>
            </Stack>
          </Stack>
        </Stack>
      </CardContent>
    </Card>
  );
}
