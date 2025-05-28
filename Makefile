.PHONY: build deps

build:
	@PYTHONPATH=. python build.py

deps:
	pip install -r requirements.txt

check:
	black .
	isort .
	flake8 .
