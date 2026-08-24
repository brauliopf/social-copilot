# Social Copilot

## Model query

Set `OPENROUTER_API_KEY` and/or `OPENAI_API_KEY` in the environment (see
`.env.example`). Optional `OPENROUTER_MODEL` and `OPENAI_MODEL` variables pick
the default model for each provider.

Start the API with `npm start`, then query a model:

```sh
curl -X POST http://localhost:3000/models/query \
  -H 'Content-Type: application/json' \
  -d '{"prompt":"Draft a friendly social media post about coffee"}'
```

Send `"provider":"openai"` to call OpenAI directly instead of OpenRouter:

```sh
curl -X POST http://localhost:3000/models/query \
  -H 'Content-Type: application/json' \
  -d '{"provider":"openai","prompt":"Draft a friendly social media post about coffee"}'
```

Use `model` in the request body to override the provider's default model for one
request.
