
export {};

declare global {
  /* Renamed to AIStudio to match existing environment declarations and resolve type mismatch errors */
  interface AIStudio {
    hasSelectedApiKey: () => Promise<boolean>;
    openSelectKey: () => Promise<void>;
  }

  interface Window {
    /* Removed readonly modifier to match the likely declaration provided by the host environment and resolve modifier mismatch errors */
    aistudio: AIStudio;
  }
}
