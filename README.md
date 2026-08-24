# Social Copilot

## OpenRouter model query

Set `OPENROUTER_API_KEY` in the environment (see `.env.example`). The optional
`OPENROUTER_MODEL`, `OPENROUTER_SITE_URL`, and `OPENROUTER_APP_NAME` variables
configure the request without putting credentials in source code.

Start the API with `npm start`, then query the model:

```sh
curl -X POST http://localhost:3000/models/query \
  -H 'Content-Type: application/json' \
  -d '{"prompt":"Draft a friendly social media post about coffee"}'
```

Use `model` in the request body to override `OPENROUTER_MODEL` for one request.
