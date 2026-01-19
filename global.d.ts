
export {};

declare global {
  /* Renamed to AIStudio to match existing environment declarations and resolve type mismatch errors */
  interface AIStudio {
    hasSelectedApiKey: () => Promise<boolean>;
    openSelectKey: () => Promise<void>;
  }

  interface Window {
    // Restored the readonly modifier to resolve the "All declarations of 'aistudio' must have identical modifiers" error.
    readonly aistudio: AIStudio;
  }
}
