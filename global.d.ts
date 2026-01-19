
export {};

declare global {
  /* Renamed to AIStudio to match existing environment declarations and resolve type mismatch errors */
  interface AIStudio {
    hasSelectedApiKey: () => Promise<boolean>;
    openSelectKey: () => Promise<void>;
  }

  interface Window {
    // Removed the readonly modifier to match the underlying environment declaration and fix the modifier mismatch error.
    // The error "All declarations of 'aistudio' must have identical modifiers" occurs when multiple declarations of the same property in the same interface have different readonly or optionality modifiers.
    aistudio: AIStudio;
  }
}
