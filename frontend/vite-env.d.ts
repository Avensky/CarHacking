/// <reference types="vite/client" />

interface ImportMetaEnv {
    readonly VITE_SUPABASE_ANON_KEY: string
    readonly VITE_SUPABASE_URL: string
    // Add other environment variables here if needed
  }
  
  interface ImportMeta {
    readonly env: ImportMetaEnv
  }

  interface ScreenOrientation {
    lock(orientation: "portrait" | "landscape" | "portrait-primary" | "portrait-secondary" | "landscape-primary" | "landscape-secondary"): Promise<void>;
  }

  