"use client";

import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import { Aula } from "@/features/aulas/model/types";
import { changePassword, listAssignedAulas, updateProfile } from "@/features/perfil/api";
import { PasswordForm, ProfileForm } from "@/features/perfil/model/types";
import { User } from "@/features/usuarios/model/types";
import { appToast } from "@/shared/lib/toast";

interface UsePerfilOptions {
  user: User | null;
  userLoading: boolean;
  setUser: (user: User | null) => void;
}

export function usePerfil({ user, userLoading, setUser }: UsePerfilOptions) {
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
    if (userLoading || !user) return;

    setEditForm({
      nombre: user.nombre ?? "",
      apellido: user.apellido ?? "",
      dni: user.dni ?? "",
      email: user.email ?? "",
      celular: user.celular ?? "",
    });
  }, [user, userLoading]);

  const refreshAulas = useCallback(async () => {
    try {
      setLoadingAulas(true);
      const nextAulas = await listAssignedAulas();
      setAulasAsignadas(nextAulas);
    } catch {
      setAulasAsignadas([]);
      appToast.error("No se pudieron cargar las aulas asignadas");
    } finally {
      setLoadingAulas(false);
    }
  }, []);

  useEffect(() => {
    void refreshAulas();
  }, [refreshAulas]);

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

  const handleEditChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
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
      const payloadPromise = updateProfile(user.id, editForm);
      await appToast.promise(payloadPromise, {
        loading: "Guardando perfil...",
        success: "Perfil actualizado correctamente",
        error: "No se pudieron guardar los cambios del perfil",
      });

      const payload = await payloadPromise;
      setUser({ ...user, ...payload });
      setOpenEdit(false);
    } catch {
    } finally {
      setSavingProfile(false);
    }
  };

  const handleChangePassword = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!user) return;

    if (passwordForm.newPassword.length < 8) {
      appToast.error("La nueva contrasena debe tener al menos 8 caracteres");
      return;
    }

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      appToast.error("La confirmacion no coincide con la nueva contrasena");
      return;
    }

    try {
      setSavingPassword(true);
      await appToast.promise(
        changePassword(user.id, passwordForm.currentPassword, passwordForm.newPassword),
        {
          loading: "Actualizando contrasena...",
          success: "Contrasena actualizada correctamente",
          error: "No se pudo actualizar la contrasena",
        }
      );

      setPasswordForm({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    } catch {
    } finally {
      setSavingPassword(false);
    }
  };

  return {
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
  };
}
