# Pytest API Starter

This starter keeps the native Pytest workflow visible. It uses a local,
deterministic API-shaped fixture and a small client seam; it does not send an
HTTP request or invent an external endpoint. Install the project and run:

```bash
python -m pip install -e .
python -m pytest
```

The health tests show both a positive and a negative response assertion. Add a
real API target only after its contract and credentials are explicitly
available; keep credentials in environment variables, never in committed tests.
