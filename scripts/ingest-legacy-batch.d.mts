export declare function insertImagesBlock(
  markdown: string,
  images: { src: string; alt: string; caption?: string }[],
): string;

export interface BatchJob {
  kind: 'legacy' | 'commons' | 'needs-commons';
  image?: string;
  input?: string;
  slug: string;
  index: number;
  alt: string;
  caption?: string;
  url?: string;
}
export declare function planBatch(
  mapping: {
    entries: { image: string; targets: { slug: string; alt: string; caption?: string }[] }[];
    commons?: { url: string; slug: string; alt: string; caption: string }[];
    [key: string]: unknown;
  },
  options?: { commonsPath?: string; skipCommons?: boolean },
): BatchJob[];
