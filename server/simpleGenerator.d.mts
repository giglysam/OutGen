import type { Buffer } from 'node:buffer'

export function fetchSimpleGeneratorImage(
  positivePrompt: string,
  opts?: { generatorType?: string },
): Promise<{ contentType: string; buffer: Buffer }>
