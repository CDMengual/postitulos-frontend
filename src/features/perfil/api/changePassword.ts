import api from "@/shared/api/client";

export async function changePassword(
  userId: number,
  currentPassword: string,
  newPassword: string
) {
  try {
    await api.patch("/auth/change-password", {
      currentPassword,
      newPassword,
    });
  } catch {
    await api.patch(`/users/${userId}/password`, {
      currentPassword,
      newPassword,
    });
  }
}
