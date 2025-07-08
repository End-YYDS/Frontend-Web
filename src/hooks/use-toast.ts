import { toast as sonnerToast } from "sonner"

type ToastOptions = {
  title?: string
  description?: string
  variant?: "default" | "destructive"
}

export function useToast() {
  return {
    toast: ({ title, description, variant }: ToastOptions) => {
      if (variant === "destructive") {
        sonnerToast.error(title || "錯誤", {
          description,
        })
      } else {
        sonnerToast.success(title || "成功", {
          description,
        })
      }
    },
  }
}
