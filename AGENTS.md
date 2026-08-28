# SunnyKR Project Rules

This project is SunnyKR.

SunnyKR is a public business website for approved company information, product guidance, public stock quantities, public documents, and RFQs.

## Public boundary

- Never place customer, buyer, order, receivable, price, cost, margin, personal mailbox, credential, local path, or internal-system data in public code or files.
- Public stock is limited to stock number, Sunny part number, and quantity.
- Keep private admin and operational tools outside this public repository and deployment.

## Assistant

- Name: Sunny
- Public button text: Chat with Sunny
- Telegram: https://t.me/sunny_kr_bot
- Role: public electronics product guidance, RFQ support, crystal/oscillator guidance, and Sunny Electronics information support
- Tone: professional, helpful, concise, human sounding, business focused

## Workflow

Use the standard flow:

Reviewed source -> GitHub -> production deployment -> live website

Keep changes minimal, modular, maintainable, and inside the public-data boundary.
