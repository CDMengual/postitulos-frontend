"use client";

import { Box, Card, CardContent, Divider, Stack, Typography } from "@mui/material";

interface Props {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}

export default function DashboardSectionCard({ title, subtitle, children }: Props) {
  return (
    <Card>
      <CardContent sx={{ p: 2.5 }}>
        <Stack spacing={2}>
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              {title}
            </Typography>
            {subtitle ? (
              <Typography variant="body2" color="text.secondary">
                {subtitle}
              </Typography>
            ) : null}
          </Box>
          <Divider />
          {children}
        </Stack>
      </CardContent>
    </Card>
  );
}
