## Ops

### Deploying
Deploy with gasless options

    pnpm hardhat --network sapphire-localnet deploy --gasless

Then copy the `VITE_DAO_V1_ADDR=...` to `frontend/.env.development`

### Monitoring Signer Accounts

Monitor accounts, use `gv-topup` which will show the balances:

    pnpm hardhat --network sapphire-localnet gv-topup --dryrun 0x...

To specify minimum balance for `gv-topup` use `--min`, remove `--dryrun` to submit the transactions

### Adding Signer Accounts

To add more signer accounts:

    pnpm hardhat --network sapphire-localnet gv-newkp 0x...

0xDc64a140Aa3E981100a9becA4E685f962f0cF6C9