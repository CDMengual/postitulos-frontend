"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
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
import api from "@/services/api";
import { useUserContext } from "@/components/providers/UserProvider";
import { Aula } from "@/types/aula";
import AssignedAulasTab from "./components/AssignedAulasTab";
import ProfileEditDialog, { ProfileForm } from "./components/ProfileEditDialog";
import ProfileSummaryCard from "./components/ProfileSummaryCard";
import SecurityTab, { PasswordForm } from "./components/SecurityTab";
import { appToast } from "@/utils/toast";

export default function PerfilPage() {
  const router = useRouter();
  const { user, setUser, loading: userLoading } = useUserContext();

  const [tab, setTab] = useState<0 | 1>(0);
  const [openEdit, setOpenEdit] = useState(false);
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);
  const [loadingAulas, setLoadingAulas] = useState(true);
  const [aulasAsignadas, setAulasAsignadas] = useState<Aula[]>([]);

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
   

    const loadAulas = async () => {
      try {
        setLoadingAulas(true);
        const res = await api.get<{ data: Aula[] }>("/aulas");
        setAulasAsignadas(res.data.data ?? []);
      } catch {
        setAulasAsignadas([]);
        appToast.error("No se pudieron cargar las aulas asignadas");
      } finally {
        setLoadingAulas(false);
      }
    };

    loadAulas();
  }, []);

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

      await appToast.promise(api.patch(`/users/${user.id}`, payload), {
        loading: "Guardando perfil...",
        success: "Perfil actualizado correctamente",
        error: "No se pudieron guardar los cambios del perfil",
      });

      setUser({ ...user, ...payload });
      setOpenEdit(false);
    } catch {
      // El mensaje ya se muestra con appToast.promise
    } finally {
      setSavingProfile(false);
    }
  };

  const handleChangePassword = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!user) return;

    if (passwordForm.newPassword.length < 8) {
      appToast.error("La nueva contraseña debe tener al menos 8 caracteres");
      return;
    }

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      appToast.error("La confirmación no coincide con la nueva contraseña");
      return;
    }

    try {
      setSavingPassword(true);

      await appToast.promise(
        (async () => {
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
        })(),
        {
          loading: "Actualizando contraseña...",
          success: "Contraseña actualizada correctamente",
          error: "No se pudo actualizar la contraseña",
        }
      );

      setPasswordForm({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    } catch {
      // El mensaje ya se muestra con appToast.promise
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
    </Container>
  );
}
