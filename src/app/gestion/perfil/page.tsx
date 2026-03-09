"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CircularProgress,
  Container,
  Divider,
  Stack,
  Tab,
  Tabs,
} from "@mui/material";
import { useUserContext } from "@/shared/components/providers/UserProvider";
import {
  AssignedAulasTab,
  ProfileEditDialog,
  ProfileSummaryCard,
  SecurityTab,
  usePerfil,
} from "@/features/perfil";

export default function PerfilPage() {
  const router = useRouter();
  const { user, setUser, loading: userLoading } = useUserContext();
  const [tab, setTab] = useState<0 | 1>(0);
  const {
    openEdit,
    setOpenEdit,
    savingProfile,
    savingPassword,
    loadingAulas,
    aulasAsignadas,
    editForm,
    passwordForm,
    isProfilePristine,
    handleEditChange,
    handlePasswordChange,
    handleSaveProfile,
    handleChangePassword,
  } = usePerfil({
    user,
    userLoading,
    setUser,
  });

  useEffect(() => {
    if (userLoading) return;
    if (!user) {
      router.replace("/auth/login");
    }
  }, [router, user, userLoading]);

  if (userLoading) {
    return (
      <Stack minHeight="60vh" alignItems="center" justifyContent="center">
        <CircularProgress />
      </Stack>
    );
  }

  if (!user) return null;

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Stack direction={{ xs: "column", lg: "row" }} spacing={3} alignItems="stretch">
        <ProfileSummaryCard user={user} onEdit={() => setOpenEdit(true)} />

        <Card variant="hoverable" sx={{ flex: 1 }}>
          <CardContent>
            <Tabs
              value={tab}
              onChange={(_, newValue: 0 | 1) => setTab(newValue)}
              variant="fullWidth"
              sx={{ mb: 2 }}
            >
              <Tab label="Aulas asignadas" />
              <Tab label="Seguridad" />
            </Tabs>

            <Divider sx={{ mb: 2 }} />

            {tab === 0 && <AssignedAulasTab loading={loadingAulas} aulas={aulasAsignadas} />}
            {tab === 1 && (
              <SecurityTab
                form={passwordForm}
                saving={savingPassword}
                onChange={handlePasswordChange}
                onSubmit={handleChangePassword}
              />
            )}
          </CardContent>
        </Card>
      </Stack>

      <ProfileEditDialog
        open={openEdit}
        form={editForm}
        saving={savingProfile}
        disableSubmit={isProfilePristine}
        onClose={() => setOpenEdit(false)}
        onChange={handleEditChange}
        onSubmit={handleSaveProfile}
      />
    </Container>
  );
}
