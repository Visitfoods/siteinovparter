import OpenAI from "openai";
import fs from "node:fs/promises";
import path from "node:path";
import type { RequestInit } from "next/dist/server/web/spec-extension/request";

// Instanciar OpenAI apenas se existir OPENAI_API_KEY (em Vercel podes usar só OPENROUTER)
export const openai: OpenAI | null = process.env.OPENAI_API_KEY
  ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
  : null;

// --------- Heurística de routing de modelo ---------
export type ModelTier = "gpt-5-mini" | "gpt-5-nano";

export function pickModel(
  input: string,
  opts?: { needTools?: boolean; strict?: boolean }
): ModelTier {
  const len = input.length;
  const hard = /debug|stacktrace|complex|multi-step|optimizar código|arquitetura|sql complexa|regra|contrato/i.test(
    input
  );
  // Regra: apenas mini/nano
  if (opts?.strict) return "gpt-5-mini";
  if (opts?.needTools) return "gpt-5-mini";
  if (hard || len > 800) return "gpt-5-mini";
  if (len > 200) return "gpt-5-mini";
  return "gpt-5-nano";
}

function decideMaxTokens(input: string): number {
  const len = input.length;
  // Heurística dinâmica por tipo de pergunta
  const isSimpleQuestion = /^(quem|o que|onde|quando|como|qual|quais|quanto|por que|porque)/i.test(input);
  const isComplexQuestion = /explique|descreva|detalhe|história|percurso|roteiro|itinerário|visita/i.test(input);
  const isListRequest = /lista|enumere|cite|mencione|quais são/i.test(input);

  // Aumentar limites para evitar respostas cortadas e permitir respostas mais completas
  if (isSimpleQuestion) {
    return Math.max(512, Math.min(1024, Math.floor(len * 4)));
  }
  if (isComplexQuestion) {
    return Math.max(1536, Math.min(2048, Math.floor(len * 5)));
  }
  if (isListRequest) {
    return Math.max(1024, Math.min(1536, Math.floor(len * 4)));
  }

  // Padrão por comprimento - aumentado para respostas mais completas
  if (len >= 1200) return 2048;
  if (len >= 600) return 1536;
  if (len >= 240) return 1024;
  return 768;
}

function buildCurrentDateSystemMessage(preferredTz?: string): string {
  try {
    const tz = preferredTz && preferredTz.trim() ? preferredTz : "Europe/Lisbon";
    const now = new Date();
    const datePt = new Intl.DateTimeFormat("pt-PT", {
      timeZone: tz,
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    }).format(now);
    const timePt = new Intl.DateTimeFormat("pt-PT", {
      timeZone: tz,
      hour: "2-digit",
      minute: "2-digit",
      second: undefined,
    }).format(now);
    const isoUtc = now.toISOString();
    return `Contexto temporal: hoje é ${datePt}, ${timePt} (${tz}). Agora (UTC): ${isoUtc}. Usa esta data/hora como referência atual.`;
  } catch {
    const now = new Date();
    return `Contexto temporal: agora (UTC) ${now.toISOString()}. Fuso principal: Europe/Lisbon.`;
  }
}

// Mapeamento: tiers → modelo (OpenRouter)
function resolveOpenAIModel(tier: ModelTier): string {
  // Usar DeepSeek Chat (V3) via OpenRouter
  // Pode ser ajustado por tier no futuro
  return tier === "gpt-5-mini" ? "deepseek/deepseek-chat" : "deepseek/deepseek-chat";
}

// --------- Cache (memória) com interface para trocar por Redis ---------
type CacheValue = { at: number; value: string };
type CacheStore = {
  get: (key: string) => Promise<string | null>;
  set: (key: string, value: string, ttlMs?: number) => Promise<void>;
};

const TTL_MS_DEFAULT = 1000 * 60 * 20; // 20 min
const mem = new Map<string, CacheValue>();

let cacheStore: CacheStore = {
  async get(key) {
    const hit = mem.get(key);
    if (!hit) return null;
    if (Date.now() - hit.at > TTL_MS_DEFAULT) {
      mem.delete(key);
      return null;
    }
    return hit.value;
  },
  async set(key, value, ttlMs = TTL_MS_DEFAULT) {
    mem.set(key, { at: Date.now() - (TTL_MS_DEFAULT - ttlMs), value });
  },
};

// Podes injectar Redis (ex.: ioredis) sem mudar chamadas
export function configureCache(custom: CacheStore) {
  cacheStore = custom;
}

async function getCache(key: string) {
  return cacheStore.get(key);
}
async function setCache(key: string, value: string, ttlMs?: number) {
  return cacheStore.set(key, value, ttlMs);
}

// --------- System prompt removida (não estava em uso) ---------

// --------- Tipos de opções ---------
export type AskOpts = {
  verbosity?: "low" | "medium" | "high";
  effort?: "minimal" | "medium" | "high";
  temperature?: number;
  max_output_tokens?: number;
  needTools?: boolean; // encaminha para gpt‑5 quando necessário
  system?: string; // permite override do system prompt por chamada
  history?: Array<{ role: "user" | "assistant" | "system" | "developer"; content: string }>;
  previousResponseId?: string;
  timeZone?: string; // fuso horário preferido do utilizador (ex.: "Europe/Lisbon")
};

// --------- Chamada base (com cache + routing) ---------
export async function ask(userInput: string, opts: AskOpts = {}) {
  const cacheKey = JSON.stringify({ v: 3, provider: "openrouter-deepinfra", userInput, opts });
  const cached = await getCache(cacheKey);
  if (cached) return { text: cached, cached: true } as const;

  const tier = pickModel(userInput, { needTools: opts.needTools });
  const model = resolveOpenAIModel(tier);
  const system = opts.system;

  const messages: Array<{ role: "system" | "user" | "assistant" | "developer"; content: string }> = [];
  if (system) messages.push({ role: "system", content: system });
  // Injetar data/hora atual para respostas dependentes do tempo (respeitando fuso do utilizador)
  messages.push({ role: "system", content: buildCurrentDateSystemMessage(opts.timeZone) });
  for (const m of opts.history || []) messages.push({ role: m.role, content: m.content });
  messages.push({ role: "user", content: userInput });

  const apiKey = process.env.OPENROUTER_API_KEY || process.env.OPENAI_API_KEY;
  const url = "https://openrouter.ai/api/v1/chat/completions";
  const maxTokens = typeof opts.max_output_tokens === "number" ? opts.max_output_tokens : decideMaxTokens(userInput);
  const body = {
    model,
    messages,
    max_tokens: maxTokens,
    temperature: typeof opts.temperature === "number" ? opts.temperature : 0.3,
    top_p: 0.9,
    // Forçar provider DeepInfra no OpenRouter
    provider: { only: ["deepinfra"] },
  } as const;

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 10000); // timeout mais agressivo para respostas mais rápidas
  const init: RequestInit & { signal: AbortSignal } = {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(apiKey ? { Authorization: `Bearer ${apiKey}` } : {}),
      ...(process.env.OPENROUTER_HTTP_REFERER ? { "HTTP-Referer": process.env.OPENROUTER_HTTP_REFERER } : {}),
      ...(process.env.OPENROUTER_TITLE ? { "X-Title": process.env.OPENROUTER_TITLE } : {}),
    },
    body: JSON.stringify(body),
    signal: controller.signal,
  };

  // Tentativa 1: LLaMA via OpenRouter com timeout de 25 segundos
  try {
    const llamaModels = ["meta-llama/llama-3.1-70b-instruct", "meta-llama/llama-3.1-8b-instruct"] as const;
    for (const llamaModel of llamaModels) {
      const llamaController = new AbortController();
      const llamaTimeout = setTimeout(() => llamaController.abort(), 25000);
      
      const llamaBody = {
        model: llamaModel,
        messages,
        max_tokens: maxTokens,
        temperature: typeof opts.temperature === "number" ? opts.temperature : 0.3,
        top_p: 0.9,
      } as const;
      const llamaInit: RequestInit = {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(apiKey ? { Authorization: `Bearer ${apiKey}` } : {}),
          ...(process.env.OPENROUTER_HTTP_REFERER ? { "HTTP-Referer": process.env.OPENROUTER_HTTP_REFERER } : {}),
          ...(process.env.OPENROUTER_TITLE ? { "X-Title": process.env.OPENROUTER_TITLE } : {}),
        },
        body: JSON.stringify(llamaBody),
        signal: llamaController.signal,
      };
      
      try {
        const llamaResp = await fetch(url, llamaInit as unknown as RequestInit).finally(() => clearTimeout(llamaTimeout));
        if (llamaResp.ok) {
          const data = (await llamaResp.json()) as {
            choices?: Array<{ message?: { content?: string } }>;
            usage?: { prompt_tokens?: number; completion_tokens?: number; total_tokens?: number; input_tokens?: number; output_tokens?: number; reasoning_tokens?: number };
          };
          const out = String(data?.choices?.[0]?.message?.content || "").trim();
          const usage = data && data.usage ? {
            input: (data.usage.input_tokens ?? data.usage.prompt_tokens) ?? undefined,
            output: (data.usage.output_tokens ?? data.usage.completion_tokens) ?? undefined,
            reasoning: (data.usage.reasoning_tokens ?? undefined),
            total: (data.usage.total_tokens ?? ((data.usage.prompt_tokens ?? 0) + (data.usage.completion_tokens ?? 0))) ?? undefined,
          } : undefined;
          await setCache(cacheKey, out);
          return { text: out, cached: false, model: llamaModel, usage } as const;
        }
      } catch (llamaError) {
        console.log(`⏰ Timeout no modelo ${llamaModel}, tentando próximo...`);
        continue;
      }
    }
    throw new Error("Nenhum modelo LLaMA do OpenRouter respondeu com sucesso");
    } catch (primaryErr) {
    // Tentativa 2A: DeepSeek via OpenRouter com timeout de 10 segundos
    try {
      const altModels = ["deepseek-ai/deepseek-r1-distill-qwen", "deepseek-ai/deepseek-coder"] as const;
      for (const altModel of altModels) {
        const altController = new AbortController();
        const altTimeout = setTimeout(() => altController.abort(), 10000);
        
        const altBody = {
          model: altModel,
          messages,
          max_tokens: Math.min(maxTokens, 1024), // Reduzir tokens para resposta mais rápida
          temperature: typeof opts.temperature === "number" ? opts.temperature : 0.3,
          top_p: 0.9,
        } as const;
        const altInit: RequestInit = {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...(apiKey ? { Authorization: `Bearer ${apiKey}` } : {}),
            ...(process.env.OPENROUTER_HTTP_REFERER ? { "HTTP-Referer": process.env.OPENROUTER_HTTP_REFERER } : {}),
            ...(process.env.OPENROUTER_TITLE ? { "X-Title": process.env.OPENROUTER_TITLE } : {}),
          },
          body: JSON.stringify(altBody),
          signal: altController.signal,
        };
        
        try {
          const altResp = await fetch(url, altInit as unknown as RequestInit).finally(() => clearTimeout(altTimeout));
          if (altResp.ok) {
            const data = (await altResp.json()) as {
              choices?: Array<{ message?: { content?: string } }>;
              usage?: { prompt_tokens?: number; completion_tokens?: number; total_tokens?: number; input_tokens?: number; output_tokens?: number; reasoning_tokens?: number };
            };
            const out = String(data?.choices?.[0]?.message?.content || "").trim();
            await setCache(cacheKey, out);
            return { text: out, cached: false, model: altModel, usage: data?.usage } as const;
          }
        } catch (altError) {
          continue;
        }
      }
      throw new Error("Nenhum modelo DeepSeek do OpenRouter respondeu com sucesso");
    } catch (secondaryErr) {
      // Apenas 2 tentativas: LLaMA principal e DeepSeek fallback
      const msgPrimary = primaryErr instanceof Error ? primaryErr.message : String(primaryErr);
      const msgSecondary = secondaryErr instanceof Error ? secondaryErr.message : String(secondaryErr);
      throw new Error(`Falha em ambos os modelos (LLaMA e DeepSeek). Erros: ${msgPrimary} | ${msgSecondary}`);
    }
  }
}

// --------- Streaming (UX rápida) ---------
export async function* askStream(userInput: string, opts: AskOpts = {}) {
  // Streaming "rápido": chunks maiores e sem atrasos artificiais
  const { text, usage } = await ask(userInput, opts) as unknown as { text: string; usage?: { input?: number; output?: number; reasoning?: number; total?: number } };
  const chunkSize = 48; // Aumentado para chunks maiores e mais rápidos
  for (let i = 0; i < text.length; i += chunkSize) {
    const piece = text.slice(i, i + chunkSize);
    if (piece) yield { delta: piece } as const;
  }
  if (usage) {
    yield { usage } as const;
  }
}

// --------- Ferramentas + allowed_tools ---------
// Tipagem relaxada para compatibilidade com versões do SDK
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const tools: any[] = [
  {
    type: "function",
    name: "getWeather",
    description: "Devolve o tempo atual para uma cidade",
    parameters: {
      type: "object",
      properties: { city: { type: "string" } },
      required: ["city"],
    },
  },
  {
    type: "function",
    name: "searchDocs",
    description: "Procura nos documentos internos",
    parameters: {
      type: "object",
      properties: { q: { type: "string" } },
      required: ["q"],
    },
  },
  // adiciona mais ferramentas conforme necessário
];

export async function askWithTools(
  userInput: string,
  allowed: readonly string[],
  opts: Omit<AskOpts, "needTools"> = {}
) {
  if (!openai) {
    throw new Error("OpenAI client indisponível (OPENAI_API_KEY ausente). Usa ask() via OpenRouter.");
  }
  const system = opts.system;
  const resp = await openai.responses.create({
    model: resolveOpenAIModel("gpt-5-mini"),
    input: [
      { role: "system", content: system },
      { role: "user", content: userInput },
    ],
    tools,
    tool_choice: "auto",
  });
  return resp;
}

// --------- Batch API (tarefas offline baratas) ---------
// Nota: correr em ambiente Node (não Edge). Usa ficheiro temporário JSONL.
export async function runBatch(jobs: Array<{ id: string; prompt: string }>) {
  const lines = jobs
    .map((j) =>
      JSON.stringify({
        custom_id: j.id,
        method: "POST",
        url: "/v1/responses",
        body: { model: resolveOpenAIModel("gpt-5-nano"), input: j.prompt },
      })
    )
    .join("\n");

  const tmpDir = path.join(process.cwd(), ".next", "tmp");
  await fs.mkdir(tmpDir, { recursive: true });
  const tmpFile = path.join(tmpDir, `batch-input-${Date.now()}.jsonl`);
  await fs.writeFile(tmpFile, lines, "utf8");

  // upload do ficheiro
  const file = await openai.files.create({
    // @ts-expect-error: SDK aceita caminho ou blob/stream
    file: await fs.readFile(tmpFile),
    purpose: "batch",
  });

  // cria o batch
  const batch = await openai.batches.create({
    input_file_id: file.id,
    endpoint: "/v1/responses",
    completion_window: "24h",
  });

  // polling simples
  let status = batch.status;
  while (status === "in_progress" || status === "validating") {
    await new Promise((r) => setTimeout(r, 5000));
    const cur = await openai.batches.retrieve(batch.id);
    status = cur.status;
    if (status === "completed" && cur.output_file_id) {
      const out = await openai.files.content(cur.output_file_id);
      return await out.text();
    }
    if (status === "failed" || status === "expired" || status === "cancelling") {
      throw new Error(`Batch falhou: ${status}`);
    }
  }

  return null;
}


