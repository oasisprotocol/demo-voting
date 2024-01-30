.PHONY: build
build:
	pnpm hardhat compile --force --quiet
	pnpm build

.PHONY: deploy-localnet
deploy-localnet:
	pnpm hardhat --network sapphire-localnet deploy --viteenv ../frontend/.env.development

.PHONY: test
test:
	pnpm test

.PHONY: clean
clean:
	rm -rf lib src/contracts abis artifacts cache

.PHONY: veryclean
veryclean:
	rm -rf node_modules
