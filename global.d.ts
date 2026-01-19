
export {};

declare global {
  /* Renamed to AIStudio to match existing environment declarations and resolve type mismatch errors */
  interface AIStudio {
    hasSelectedApiKey: () => Promise<boolean>;
    openSelectKey: () => Promise<void>;
  }

  interface Window {
    // Added the readonly modifier to match the underlying environment declaration and fix the modifier mismatch error.
    readonly aistudio: AIStudio;
  }
}
