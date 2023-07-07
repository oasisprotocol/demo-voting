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

Now, move to the `frontend` folder and reference the deployed contract in our
frontend Vue app. Modify the `.env.development` file with the appropriate
addresses, for example:

```
VITE_DAO_V1_ADDR=0x5FbDB2315678afecb367f032d93F642f64180aa3
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

### Deployment scripts

Prepare your hex-encoded private key and move to the `backend` folder.

To build and deploy simple DAO contract without ACL to the localhost, Sapphire
Testnet or Mainnet, use the following commands respectively:

```shell
PRIVATE_KEY=0x... npx hardhat deploy --network localhost
PRIVATE_KEY=0x... npx hardhat deploy --network sapphire-testnet
PRIVATE_KEY=0x... npx hardhat deploy --network sapphire
```

A script for building and deploying DAO with SimpleWhiteListACL can be run by:

```shell
PRIVATE_KEY=0x... npx hardhat deploy-simplewhitelist --network localhost
```

To whitelist voters for a specific ballot:

1. Store the reported `VITE_DAO_V1_ADDR` by the deployment script, for example
   ```shell
   export VITE_DAO_V1_ADDR=0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512
   ```
2. Create a new poll. You can use the Vue frontend for this. Then store the new
   poll ID (you can copy it from the URL) as env variable, for example:
   ```shell
   export PROPOSAL_ID=e386cceaa6ceea2f935d89951e522ac6d7ac777503b234d61b193439de571cfc
   ```
3. Store the private key of the poll creator (the "poll manager") to env
   variable, e.g.:
   ```shell
   export PRIVATE_KEY=...
   ```
4. Prepare a file containing whitelisted voters addresses, one per line. This
   list will overwrite any existing whitelisted users. Export the file name
   containing the list as env variable, e.g.:
   ```shell
   export VOTERS_FILE=voters.txt
   ```
5. Finally, execute the `whitelist-voters` script. For the `localhost`, this
   would be:
   ```shell
   npx hardhat whitelist-voters --network localhost
   ```

[Hardhat]: https://hardhat.org/hardhat-runner/docs/getting-started#overview
[Hardhat-deploy]: https://github.com/wighawag/hardhat-deploy
[Pinata API key]: https://docs.pinata.cloud/pinata-api/authentication
