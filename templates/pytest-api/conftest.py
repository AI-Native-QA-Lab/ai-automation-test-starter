"""Keep the starter's local API client importable during native pytest runs."""

from pathlib import Path
import sys


SOURCE_ROOT = Path(__file__).parent / "src"
sys.path.insert(0, str(SOURCE_ROOT))
