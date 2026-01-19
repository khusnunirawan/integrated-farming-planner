
export {};

declare global {
  /* Renamed to AIStudioInterface to avoid duplicate identifier errors with potentially pre-existing global AIStudio types */
  interface AIStudioInterface {
    /* Changed to property signature style which is often more compatible for augmentation merging */
    hasSelectedApiKey: () => Promise<boolean>;
    openSelectKey: () => Promise<void>;
  }

  interface Window {
    /* Added readonly modifier to match the likely declaration provided by the host environment and resolve modifier mismatch errors */
    readonly aistudio: AIStudioInterface;
  }
}
