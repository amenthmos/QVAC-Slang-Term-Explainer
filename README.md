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

## License

MIT
