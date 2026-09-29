export declare const MAX_EDGE: number;
export declare function ingestPhoto(options: {
  input: string;
  outDir: string;
  slug: string;
  index: number;
  force?: boolean;
}): Promise<{ output: string; width: number; height: number; bytes: number }>;
