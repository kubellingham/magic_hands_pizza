/// <reference types="vite/client" />
/// <reference types="vite-plugin-pwa/client" />

/** Injected at build time so /diag can report exactly which bundle is running. */
declare const __BUILD_ID__: string
declare const __BUILD_TIME__: string
