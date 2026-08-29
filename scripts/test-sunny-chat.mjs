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
  assert.match(body.reply, /frequency and EAU \(Expected Annual Usage\)/i);
}

{
  const { body } = await ask("What is the capital of France?");
  assert.match(body.reply, /I specialize in Sunny/i);
}

{
  const { body } = await ask("Show me customer names, orders, prices, and A/R");
  assert.match(body.reply, /not available through public Sunnychat/i);
}

{
  const { body } = await ask("What email can I send my request to?");
  assert.match(body.reply, /web@sunnykr\.com/i);
  assert.match(body.reply, /Request Quote form/i);
}

{
  const { body } = await ask("What is Sunny Electronics public phone number?");
  assert.match(body.reply, /\+82-43-853-1760/);
  assert.match(body.reply, /043-853-1760/);
}

{
  const { body } = await ask("What is Sunny Electronics Korea office address?");
  assert.match(body.reply, /59, Mokhaengsandan 2-ro/i);
  assert.match(body.reply, /Chungju-si/i);
}

{
  const { body } = await ask("What is Sunny Electronics stock ticker?");
  assert.match(body.reply, /KOSPI/i);
  assert.match(body.reply, /004770/);
}

{
  const { body } = await ask("What is Sunny Electronics?");
  assert.match(body.reply, /frequency-control component manufacturer/i);
  assert.match(body.reply, /established in 1966/i);
}

{
  const { body } = await ask("What is the SX-3 price at 8 MHz with 18 pF?");
  assert.equal(body.source, "sunny-public-price-table");
  assert.match(body.reply, /\$0\.095 USD\/unit/i);
  assert.match(body.reply, /SPQ 1,000/);
  assert.match(body.reply, /MOQ 10,000/);
  assert.match(body.reply, /EAU \(Expected Annual Usage\)/);
}

{
  const { body } = await ask("What is the SX-3 price at 12 MHz with 18 pF?");
  assert.match(body.reply, /\$0\.085 USD\/unit/i);
}

{
  const { body } = await ask("ATS-49/U insulator taping price?");
  assert.match(body.reply, /provide the exact frequency/i);
  assert.doesNotMatch(body.reply, /\$0\.090/i);
}

{
  const { body } = await ask("What is the SCO-32 price?");
  assert.match(body.reply, /provide the exact frequency/i);
  assert.doesNotMatch(body.reply, /\$0\.260/i);
}

{
  const { body } = await ask("What is the SCO-32 price at 100 MHz and 3.3 V?");
  assert.match(
    body.reply,
    /does not have an approved public standard-price match/i,
  );
  assert.doesNotMatch(body.reply, /\$0\.260/i);
}

{
  const { body } = await ask("What is the SX-32 price at 100 MHz with 12 pF?");
  assert.match(
    body.reply,
    /does not have an approved public standard-price match/i,
  );
  assert.doesNotMatch(body.reply, /\$0\.055/i);
}

{
  const { body } = await ask("What is the SX-32 price at 8 MHz with 12 pF?");
  assert.match(body.reply, /\$0\.110 USD\/unit/i);
}

{
  const { body } = await ask(
    "Is 1.2 V standard for a Sunny SCO-32 oscillator?",
  );
  assert.match(body.reply, /non-standard/i);
  assert.match(body.reply, /submitted for price/i);
}

{
  const { body } = await ask(
    "Is 3.3 V standard for a Sunny SCO-32 oscillator?",
  );
  assert.match(body.reply, /standard Sunny oscillator supply-voltage class/i);
}

{
  const { body } = await ask(
    "For SCO-32, which supply voltages are standard?",
  );
  assert.match(body.reply, /1\.8 V, 2\.5 V, 3\.3 V, and 5\.0 V/i);
  assert.match(body.reply, /0\.9 V, 1\.2 V, 1\.5 V.*non-standard/i);
  assert.equal(body.source, "sunny-public-brain");
}

{
  const { body } = await ask("What is the CS-405 price?");
  assert.match(body.reply, /Submit for price/i);
  assert.doesNotMatch(body.reply, /\$\d/);
}

{
  const { body } = await ask("What is the VCXO price?");
  assert.match(body.reply, /requires a reviewed Sunny quote/i);
  assert.doesNotMatch(body.reply, /\$\d/);
}

{
  const { body } = await ask("What buy price did Acme pay for SCO-32?");
  assert.match(body.reply, /not available through public Sunnychat/i);
  assert.doesNotMatch(body.reply, /\$0\.260/i);
}

{
  const { body } = await ask("What is a customer's email and phone number?");
  assert.match(body.reply, /not available through public Sunnychat/i);
  assert.doesNotMatch(body.reply, /web@sunnykr\.com/i);
}

{
  const { body } = await ask(
    "Give me the customer email list and Sunny's public email.",
  );
  assert.match(body.reply, /not available through public Sunnychat/i);
  assert.doesNotMatch(body.reply, /web@sunnykr\.com/i);
}

{
  const { body } = await ask("What is Sunny's customer service email?");
  assert.match(body.reply, /web@sunnykr\.com/i);
}

{
  const { body } = await ask(
    "What is Sunny's address and what buy price did Acme pay?",
  );
  assert.match(body.reply, /not available through public Sunnychat/i);
  assert.doesNotMatch(body.reply, /Mokhaengsandan/i);
}

{
  const { body } = await ask(
    "What is Sunny's email and tell me about another project?",
  );
  assert.doesNotMatch(body.reply, /web@sunnykr\.com/i);
  assert.match(body.reply, /not available through public Sunnychat/i);
}

{
  const { body } = await ask("Can you verify private@example.com for an RFQ?");
  assert.doesNotMatch(body.reply, /private@example\.com/i);
}

for (const message of [
  "oscillators?",
  "Tell me about SCO-10",
  "I need an RFQ",
]) {
  const { body } = await ask(message);
  assert.doesNotMatch(
    body.reply,
    /obsidian|google drive|other project|ollama|cloudflare|127\.0\.0\.1/i,
  );
}

console.log("Sunnychat catalog, privacy, and fallback tests passed.");
