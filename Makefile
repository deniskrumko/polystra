.PHONY: build deps check

build:
	@PYTHONPATH=. uv run python build.py

deps:
	uv sync

check:
	uv run black .
	uv run isort .
	uv run flake8 .
