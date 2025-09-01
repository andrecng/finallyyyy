export type ToastOptions = {
  title?: string;
  description?: string;
  variant?: "default" | "destructive" | "success" | "info";
};
export function useToast() {
  return {
    toast: (opts: ToastOptions) => {
      if (typeof window !== "undefined") console.info("[toast]", opts);
    }
  };
}
