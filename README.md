## Demo Voting App

This is a demo voting app running natively on Oasis Sapphire. The app is a fork
of the [OPL Secret Ballot].

[OPL Secret Ballot]: https://github.com/oasisprotocol/playground/tree/main/opl-secret-ballot

### Backend

This monorepo is set up for `pnpm`. Install dependencies by running:

```sh
pnpm install
```

Then, move to the `backend` folder and build smart contracts:

```sh
pnpm build
```

### Frontend

After compiling the backend, you can move to the `frontend` folder to compile
and Hot-Reload frontend for Development:

```sh
pnpm dev
```

You can build assets for deployment by running:

```sh
pnpm build
```

### Local Development

We use [Hardhat] and [Hardhat-deploy] to simplify development.

Move to the `backend` folder and start local Hardhat network:

```sh
npx hardhat node
```

Deploy smart contracts to that local network:

```sh
npx hardhat deploy --network localhost
```

We can now reference the deployed contracts in our frontend Vue app.

Modify the `.env.development` file with the appropriate addresses,
for example:

```
VITE_DAO_V1_ADDR=0xa16E02E87b7454126E5E10d957A927A7F5B5d2be
VITE_BALLOT_BOX_V1_ADDR=0x5FbDB2315678afecb367f032d93F642f64180aa3
```

Additionally, we need a [Pinata API key] to access the IPFS pinning
service where we store details of the ballots to.

```yaml
VITE_PINATA_JWT=
```

Start Vue app:

```sh
pnpm dev
```

Navigate to http://localhost:5173, and you should be able to create a new poll.

You can use one of the deployed test accounts and associated private key with
MetaMask. If you use the same MetaMask accounts on fresh local networks, don't
forget to *clear your account's activity* each time or manually specify the
correct account nonce.

### Deploy to Testnet or Mainnet

Prepare your hex-encoded private key and move to the `backend` folder.

To deploy your contract to the Sapphire Testnet, run:

```shell
PRIVATE_KEY=0x... npx hardhat deploy --network sapphire-testnet
```

To deploy your contract to the Sapphire Mainnet, run:

```shell
PRIVATE_KEY=0x... npx hardhat deploy --network sapphire
```

[Hardhat]: https://hardhat.org/hardhat-runner/docs/getting-started#overview
[Hardhat-deploy]: https://github.com/wighawag/hardhat-deploy
[Pinata API key]: https://docs.pinata.cloud/pinata-api/authentication
