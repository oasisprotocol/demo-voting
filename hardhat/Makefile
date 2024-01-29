build:
	pnpm hardhat compile --force
	pnpm build

deploy-localnet:
	pnpm hardhat --network sapphire-localnet deploy --viteenv ../frontend/.env.development

test:
	pnpm test

clean:
	rm -rf lib src/contracts abis artifacts cache

veryclean:
	rm -rf node_modules
