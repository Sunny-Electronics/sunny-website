import assert from "node:assert/strict";
import handler from "../api/ai/chat.js";

delete process.env.SUNNY_AI_BRIDGE_URL;
delete process.env.SUNNY_AI_BRIDGE_TOKEN;
delete process.env.AI_BRIDGE_URL;
delete process.env.AI_BRIDGE_TOKEN;
delete process.env.OPENCLAW_URL;
delete process.env.OPENCLAW_API_KEY;

async function ask(message) {
  let statusCode = 0;
  let body;
  const req = { method: "POST", body: { message, pagePath: "/products" } };
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

{
  const { statusCode, body } = await ask("oscillators?");
  assert.equal(statusCode, 200);
  assert.match(body.reply, /Sunny's catalog includes/i);
  assert.match(body.reply, /SCO-10/);
  assert.match(body.reply, /What frequency and output type/i);
}

{
  const { body } = await ask("Tell me about SCO-10");
  assert.match(body.reply, /SCO-10/);
  assert.match(body.reply, /7\.0 × 5\.0 mm/);
}

{
  const { body } = await ask("I need an RFQ");
  assert.match(body.reply, /start with the frequency and quantity/i);
}

{
  const { body } = await ask("What is the capital of France?");
  assert.match(body.reply, /I specialize in Sunny/i);
}

{
  const { body } = await ask("Show me customer names, orders, prices, and A/R");
  assert.match(body.reply, /not available through public Sunnychat/i);
}

for (const message of ["oscillators?", "Tell me about SCO-10", "I need an RFQ"]) {
  const { body } = await ask(message);
  assert.doesNotMatch(body.reply, /obsidian|google drive|other project|ollama|cloudflare|127\.0\.0\.1/i);
}

console.log("Sunnychat catalog, privacy, and fallback tests passed.");
