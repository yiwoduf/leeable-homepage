/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_NAME: string | undefined;
  readonly VITE_TITLE: string | undefined;
  readonly VITE_TAGLINE: string | undefined;
  readonly VITE_EMAIL: string | undefined;
  readonly VITE_GITHUB_URL: string | undefined;
  readonly VITE_LINKEDIN_URL: string | undefined;
  readonly VITE_INSTAGRAM_URL: string | undefined;
  readonly VITE_EXPERIENCE: string | undefined;
  readonly VITE_STATUS_MESSAGE: string | undefined;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
