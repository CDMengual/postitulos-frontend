"use client";

import { toast, ToastOptions } from "react-hot-toast";

const DEFAULT_ERROR_MESSAGE =
  "Ocurrió un error. Por favor vuelva a intentar.";

const DEFAULT_LOADING_MESSAGE = "Cargando...";

const defaultOptions: ToastOptions = {
  duration: 2500,
  position: "top-right",
    style: {
    maxWidth: "600px", 
    width: "auto",     
    whiteSpace: "nowrap", 
  },
};

type PromiseMessages<T> = {
  loading?: string;
  success: string | ((value: T) => string);
  error?: string | ((error: unknown) => string);
};

export const appToast = {
  success: (message: string, options?: ToastOptions) =>
    toast.success(message, { ...defaultOptions, ...options }),

  error: (message?: string, options?: ToastOptions) =>
    toast.error(message ?? DEFAULT_ERROR_MESSAGE, {
      ...defaultOptions,
      ...options,
    }),

  promise: <T>(
    promise: Promise<T>,
    messages: PromiseMessages<T>,
    options?: ToastOptions
  ) =>
    toast.promise(
      promise,
      {
        loading: messages.loading ?? DEFAULT_LOADING_MESSAGE,
        success: messages.success,
        error: messages.error ?? DEFAULT_ERROR_MESSAGE,
      },
      { ...defaultOptions, ...options }
    ),
};