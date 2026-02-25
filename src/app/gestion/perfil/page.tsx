"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Alert, Card, CardContent, CircularProgress, Container, Divider, Snackbar, Stack, Tab, Tabs } from "@mui/material";
import api from "@/services/api";
import { useUserContext } from "@/components/providers/UserProvider";
import { Aula } from "@/types/aula";
import AssignedAulasTab from "./components/AssignedAulasTab";
import ProfileEditDialog, { ProfileForm } from "./components/ProfileEditDialog";
import ProfileSummaryCard from "./components/ProfileSummaryCard";
import SecurityTab, { PasswordForm } from "./components/SecurityTab";

type ToastState = {
  open: boolean;
  severity: "success" | "error" | "warning";
  message: string;
};


const emptyToast: ToastState = {
  open: false,
  severity: "success",
  message: "",
};

export default function PerfilPage() {
  const router = useRouter();
  const { user, setUser, loading: userLoading } = useUserContext();

  const [tab, setTab] = useState<0 | 1>(0);
  const [openEdit, setOpenEdit] = useState(false);
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);
  const [loadingAulas, setLoadingAulas] = useState(true);
  const [aulasAsignadas, setAulasAsignadas] = useState<Aula[]>([]);
  const [toast, setToast] = useState<ToastState>(emptyToast);

  const [editForm, setEditForm] = useState<ProfileForm>({
    nombre: "",
    apellido: "",
    dni: "",
    email: "",
    celular: "",
  });

  const [passwordForm, setPasswordForm] = useState<PasswordForm>({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  useEffect(() => {
    if (userLoading) return;
    if (!user) {
      router.replace("/auth/login");
      return;
    }

    setEditForm({
      nombre: user.nombre ?? "",
      apellido: user.apellido ?? "",
      dni: user.dni ?? "",
      email: user.email ?? "",
      celular: user.celular ?? "",
    });
  }, [user, userLoading, router]);

useEffect(() => {
  if (!user) return;

  const loadAulas = async () => {
    try {
      setLoadingAulas(true);

      const res = await api.get("/aulas");
console.log('aulas respuesta', res.data.data)
      if (!res.data.success) {
        throw new Error(res.data.message);
      }

      setAulasAsignadas(res.data.data);
    } catch (error) {
      setAulasAsignadas([]);
      setToast({
        open: true,
        severity: "error",
        message: "No se pudieron cargar las aulas asignadas",
      });
    } finally {
      setLoadingAulas(false);
    }
  };

  loadAulas();
}, [user]);

  const isProfilePristine = useMemo(() => {
    if (!user) return true;
    return (
      editForm.nombre.trim() === (user.nombre ?? "") &&
      editForm.apellido.trim() === (user.apellido ?? "") &&
      editForm.dni.trim() === (user.dni ?? "") &&
      editForm.email.trim() === (user.email ?? "") &&
      editForm.celular.trim() === (user.celular ?? "")
    );
  }, [editForm, user]);

  const handleEditChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setEditForm((prev) => ({ ...prev, [name]: value }));
  };

  const handlePasswordChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setPasswordForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSaveProfile = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!user) return;

    try {
      setSavingProfile(true);
      const payload = {
        nombre: editForm.nombre.trim(),
        apellido: editForm.apellido.trim(),
        dni: editForm.dni.trim(),
        email: editForm.email.trim(),
        celular: editForm.celular.trim(),
      };

      await api.patch(`/users/${user.id}`, payload);
      setUser({ ...user, ...payload });
      setOpenEdit(false);
      setToast({
        open: true,
        severity: "success",
        message: "Perfil actualizado correctamente",
      });
    } catch {
      setToast({
        open: true,
        severity: "error",
        message: "No se pudieron guardar los cambios del perfil",
      });
    } finally {
      setSavingProfile(false);
    }
  };

  const handleChangePassword = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!user) return;

    if (passwordForm.newPassword.length < 8) {
      setToast({
        open: true,
        severity: "warning",
        message: "La nueva contraseña debe tener al menos 8 caracteres",
      });
      return;
    }

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setToast({
        open: true,
        severity: "warning",
        message: "La confirmacion no coincide con la nueva contraseña",
      });
      return;
    }

    try {
      setSavingPassword(true);
      try {
        await api.patch("/auth/change-password", {
          currentPassword: passwordForm.currentPassword,
          newPassword: passwordForm.newPassword,
        });
      } catch {
        await api.patch(`/users/${user.id}/password`, {
          currentPassword: passwordForm.currentPassword,
          newPassword: passwordForm.newPassword,
        });
      }

      setPasswordForm({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
      setToast({
        open: true,
        severity: "success",
        message: "Contraseña actualizada correctamente",
      });
    } catch {
      setToast({
        open: true,
        severity: "error",
        message: "No se pudo actualizar la contraseña",
      });
    } finally {
      setSavingPassword(false);
    }
  };

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

      <Snackbar
        open={toast.open}
        autoHideDuration={3000}
        onClose={() => setToast(emptyToast)}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          severity={toast.severity}
          variant="filled"
          onClose={() => setToast(emptyToast)}
        >
          {toast.message}
        </Alert>
      </Snackbar>
    </Container>
  );
}
