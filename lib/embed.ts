import { pipeline, env } from "@xenova/transformers";

// Keep model files in project-local cache instead of ~/.cache/huggingface
env.cacheDir = "./.hf-cache";
// No remote model fetching after first download; still allow first download
env.allowLocalModels = true;

type FeatureExtractionPipeline = Awaited<ReturnType<typeof pipeline>>;

const globalForEmbed = globalThis as unknown as { embedPipeline: FeatureExtractionPipeline | null };
if (!globalForEmbed.embedPipeline) globalForEmbed.embedPipeline = null;

let pipelinePromise: Promise<FeatureExtractionPipeline> | null = null;

async function getEmbedder(): Promise<FeatureExtractionPipeline> {
  if (globalForEmbed.embedPipeline) return globalForEmbed.embedPipeline;
  if (!pipelinePromise) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    pipelinePromise = (pipeline as any)("feature-extraction", "Xenova/all-MiniLM-L6-v2", {
      quantized: true,
    }) as Promise<FeatureExtractionPipeline>;
  }
  globalForEmbed.embedPipeline = await pipelinePromise;
  return globalForEmbed.embedPipeline;
}

export async function embed(text: string): Promise<number[]> {
  const embedder = await getEmbedder();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const output: any = await (embedder as any)(text, { pooling: "mean", normalize: true });
  return Array.from(output.data as Float32Array);
}

export function cosineSimilarity(a: number[], b: number[]): number {
  let dot = 0, normA = 0, normB = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }
  return dot / (Math.sqrt(normA) * Math.sqrt(normB) || 1);
}
