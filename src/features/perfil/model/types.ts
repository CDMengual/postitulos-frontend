export type ProfileForm = {
  nombre: string;
  apellido: string;
  dni: string;
  email: string;
  celular: string;
};

export type PasswordForm = {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
};
