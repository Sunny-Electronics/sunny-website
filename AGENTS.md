# SunnyKR Project Rules

This project is SunnyKR.

SunnyKR is an independent frontend/site, but it must connect to the same centralized Mac Mini AI stack used by PupCare, AshleyBaek, and Asivanta.

## Architecture

Public access must follow this path:

Frontend -> bridge/API -> Cloudflare tunnel -> OpenClaw/Gemma4

Never expose Ollama, OpenClaw, local ports, Telegram tokens, API secrets, or Cloudflare secrets directly.

## Assistant

- Name: Sunny
- Public button text: Chat with Sunny
- Telegram: https://t.me/sunny_kr_bot
- Role: electronics manufacturing assistant, RFQ support, crystal/oscillator product guidance, sourcing/manufacturing support, customer assistance, and Sunny Electronics information support
- Tone: professional, helpful, concise, human sounding, business focused

## Workflow

Use the standard flow:

Mac Mini or work notebook -> GitHub -> Vercel auto deploy -> live website

Keep changes minimal, modular, maintainable, and aligned with the shared AI stack.
