NPM=pnpm

all: build

dev:
	$(NPM) $@

build:
	$(NPM) $@
	$(NPM) node scripts/optimizehtml.js
	ls -lah dist/*.html

clean:
	rm -rf dist

veryclean:
	rm -rf node_modules

