# QVAC Slang Term Explainer

Enter a slang term or idiom and an on-device AI gives a plain-English explanation plus an example sentence using it. No cloud call, no API key.

## Run

```bash
npm install
npm start
```

Then open http://localhost:30010

## QVAC SDK version

`@qvac/sdk` ^0.19.0 (see `package.json`).

## How it works

Built on [Tether's QVAC SDK](https://www.npmjs.com/package/@qvac/sdk) — all inference runs on-device, no cloud call, no API key. The app loads `LLAMA_3_2_1B_INST_Q4_0` locally with `loadModel()`, generates with `completion()` (streamed via `tokenStream`), and releases the model with `unloadModel()` on shutdown. The explanation and example are parsed and validated deterministically: if the model's example sentence doesn't actually contain the term being explained, the app rewrites the example so it does.

The first run downloads the model file, so it may take a minute before "Model ready." prints; after that `loadModel()` reuses the cached weights and startup is fast.

## Example

**Input**

- Term: `ghosting`

**Output**

> Meaning: Suddenly cutting off all communication with someone, without any explanation, instead of telling them directly that you're no longer interested.
> Example: After their third date, he just stopped replying to her texts entirely — classic ghosting.

`logic.js` parses the model's `Meaning:` / `Example:` reply with a regex into two separate fields. If the "Example" line doesn't actually contain the term being explained (checked after stripping punctuation, so "ghosting" still matches inside "he's ghosting me"), it's discarded and replaced with a guaranteed-to-contain-the-term fallback sentence instead — so the example is always genuinely usable, never a mismatch.

## Setup notes

- Requires Node.js >=22.17 (see `engines` in `package.json`).
- `npm start` runs `src/gui.js`, which starts the local HTTP server on port `30010` by default. Set the `PORT` environment variable to use a different port.
- No API keys, accounts, or network access are needed — everything, including the model weights, stays on your machine.

## License

MIT
