"use client";

import { Button, Card, CardContent, Chip, Divider, Stack, Typography } from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import { User } from "@/types/user";

interface Props {
  user: User;
  onEdit: () => void;
}

export default function ProfileSummaryCard({ user, onEdit }: Props) {
  return (
    <Card
      variant="hoverable"
      sx={{ width: { xs: "100%", lg: 360 }, alignSelf: { lg: "flex-start" } }}
    >
      <CardContent sx={{p:2}}>
        <Stack spacing={2}  >
          <Stack spacing={0.5} alignItems="center" textAlign="center">
            <Typography variant="h5" fontWeight={700}>
              {user.nombre} {user.apellido}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {user.email}
            </Typography>
          </Stack>

          <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap    justifyContent="center">
            <Chip label={user.rol} color="primary" size="small" />
            {user.instituto?.nombre && (
              <Chip label={user.instituto.nombre} variant="outlined" size="small" />
            )}
          </Stack>

          <Divider />

          <Stack spacing={1}>
            <Typography variant="body2" color="text.secondary">
              DNI
            </Typography>
            <Typography fontWeight={500}>{user.dni || "-"}</Typography>
          </Stack>

          <Stack spacing={1}>
            <Typography variant="body2" color="text.secondary">
              Celular
            </Typography>
            <Typography fontWeight={500}>{user.celular || "-"}</Typography>
          </Stack>

          <Button variant="outlined" startIcon={<EditIcon />} onClick={onEdit}>
            Editar perfil
          </Button>
        </Stack>
      </CardContent>
    </Card>
  );
}
