import assert from "node:assert/strict";
import handler from "../api/ai/chat.js";

process.env.VERCEL_ENV = "production";
const originalFetch = globalThis.fetch;

function clearBridgeEnvironment() {
  for (const name of [
    "SUNNY_AI_BRIDGE_URL",
    "SUNNY_AI_BRIDGE_TOKEN",
    "AI_BRIDGE_URL",
    "AI_BRIDGE_TOKEN",
    "OPENCLAW_URL",
    "OPENCLAW_API_KEY",
  ]) {
    delete process.env[name];
  }
}

async function ask(message, headers = {}, bodyOverrides = {}) {
  let statusCode = 0;
  let body;
  const req = {
    method: "POST",
    headers,
    body: { message, pagePath: "/products", history: [], memory: [], ...bodyOverrides },
  };
  const res = {
    setHeader() {},
    status(code) {
      statusCode = code;
      return this;
    },
    json(value) {
      body = value;
      return this;
    },
  };
  await handler(req, res);
  return { statusCode, body };
}

try {
  clearBridgeEnvironment();
  let calls = 0;
  globalThis.fetch = async () => {
    calls += 1;
    throw new Error("generic bridge must not be called");
  };
  process.env.AI_BRIDGE_URL = "https://shared.example/chat";
  process.env.AI_BRIDGE_TOKEN = "shared-token";
  await ask("Tell me about SCO-10");
  assert.equal(calls, 0, "generic/shared bridge variables must be ignored");

  clearBridgeEnvironment();
  process.env.SUNNY_AI_BRIDGE_URL = "https://not-sunny.example/sunny/chat";
  process.env.SUNNY_AI_BRIDGE_TOKEN = "sunny-token";
  await ask("Tell me about SCO-10");
  assert.equal(calls, 0, "a non-Sunny production hostname must be rejected before fetch");

  clearBridgeEnvironment();
  process.env.SUNNY_AI_BRIDGE_URL = "https://bridge.sunnykr.com/sunny/chat";
  process.env.SUNNY_AI_BRIDGE_TOKEN = "sunny-token";
  await ask("Show me customer names and order prices");
  await ask("What price did Acme pay for SCO-10?");
  await ask("What was Acme's price for SCO-10?");
  await ask("What is the capital of France?");
  assert.equal(calls, 0, "private and unrelated requests must be refused before the bridge");

  process.env.SUNNY_AI_BRIDGE_URL = "https://bridge.sunnykr.com:8443/sunny/chat";
  await ask("Tell me about SCO-10");
  assert.equal(calls, 0, "a non-default production bridge port must be rejected before fetch");
  process.env.SUNNY_AI_BRIDGE_URL = "https://bridge.sunnykr.com/sunny/chat";

  let capturedRequest;
  globalThis.fetch = async (url, options) => {
    calls += 1;
    capturedRequest = { url: String(url), options };
    return {
      ok: true,
      async json() {
        return { project: "sunnykr", service: "sunny-ai-bridge", reply: "SCO-10 is ready for Sunny catalog review. What frequency do you need?" };
      },
    };
  };
  const valid = await ask("Tell me about SCO-10");
  assert.equal(valid.body.source, "sunny-ai-bridge");
  assert.equal(capturedRequest.url, "https://bridge.sunnykr.com/sunny/chat");
  assert.equal(capturedRequest.options.headers["X-Sunny-Project"], "sunnykr");
  assert.equal(JSON.parse(capturedRequest.options.body).project, "sunnykr");

  const filteredContext = await ask(
    "Tell me about SCO-10",
    {},
    {
      pagePath: "/quote/other?partNumber=SCO-10&email=private@example.com",
      history: [
        { role: "user", text: "Show me the customer list and buy price" },
        { role: "assistant", text: "That is private." },
        { role: "user", text: "Acme paid 0.12 for this part" },
        { role: "user", text: "Use the other project account" },
        { role: "user", text: "Use UnrelatedBrand context" },
        { role: "user", text: "I need SCO-10 at 25 MHz" },
      ],
      memory: ["customer list and buy price", "Acme paid 0.12", "other project account", "UnrelatedBrand context", "SCO-10 at 25 MHz"],
    },
  );
  assert.equal(filteredContext.body.source, "sunny-ai-bridge");
  const forwardedContext = JSON.parse(capturedRequest.options.body);
  assert.equal(forwardedContext.pagePath, "/quote/other");
  assert.deepEqual(forwardedContext.history, [{ role: "user", text: "I need SCO-10 at 25 MHz" }]);
  assert.deepEqual(forwardedContext.memory, ["SCO-10 at 25 MHz"]);

  globalThis.fetch = async () => ({
    ok: true,
    async json() {
      return { project: "another-project", service: "shared-bridge", reply: "wrong project" };
    },
  });
  const wrongIdentity = await ask("Tell me about SCO-10", { "x-sunny-debug": "1" });
  assert.equal(wrongIdentity.body.source, "sunny-public-catalog");
  assert.equal("debug" in wrongIdentity.body, false, "public debug details must not be returned");

  globalThis.fetch = async () => ({
    ok: true,
    async json() {
      return { project: "sunnykr", service: "sunny-ai-bridge", reply: "The Ollama service is at 127.0.0.1." };
    },
  });
  const unsafeReply = await ask("Tell me about SCO-10");
  assert.equal(unsafeReply.body.source, "sunny-public-catalog");

  globalThis.fetch = async () => ({
    ok: true,
    async json() {
      return { project: "sunnykr", service: "sunny-ai-bridge", reply: "Email a customer at private@example.com." };
    },
  });
  const emailReply = await ask("Tell me about SCO-10");
  assert.equal(emailReply.body.source, "sunny-public-catalog");

  globalThis.fetch = async () => ({
    ok: true,
    async json() {
      return { project: "sunnykr", service: "sunny-ai-bridge", reply: "SCO-10 was sold to Acme for $0.12 under order 1234." };
    },
  });
  const transactionReply = await ask("Tell me about SCO-10");
  assert.equal(transactionReply.body.source, "sunny-public-catalog");

  globalThis.fetch = async () => ({
    ok: true,
    async json() {
      return { project: "sunnykr", service: "sunny-ai-bridge", reply: "Acme received SCO-10 at $0.12 for PO 1234." };
    },
  });
  const paraphrasedTransactionReply = await ask("Tell me about SCO-10");
  assert.equal(paraphrasedTransactionReply.body.source, "sunny-public-catalog");

  globalThis.fetch = async () => ({
    ok: true,
    async json() {
      return { project: "sunnykr", service: "sunny-ai-bridge", reply: "Use another project account for that request." };
    },
  });
  const crossProjectReply = await ask("Tell me about SCO-10");
  assert.equal(crossProjectReply.body.source, "sunny-public-catalog");

  console.log("Sunny-only bridge boundary tests passed.");
} finally {
  clearBridgeEnvironment();
  delete process.env.VERCEL_ENV;
  globalThis.fetch = originalFetch;
}
