# 15min - timed skill test for smart contract developer

Create your branch from the project root before you change any code:

```bash
git checkout -b John-david-1998-03-01
```

Run the current API from the project root and leave that terminal open:

```bash
cd backend
npm install
npm run dev
```

The API listens on http://localhost:4000.

The quote route also reads the deployed vault, so the local chain has to be up before that URL will answer.

## Task

An investor claims a share of vault proceeds. Finish `quote` in `contracts/contracts/skill/Quote.sol` so it returns that claim the same way the protocol does.

`quote(proceeds, shares, totalSold)` returns:

- `claimable` — the floored pro-rata amount, `proceeds * shares / totalSold`, as an integer in wei. Use integer division so leftover dust stays in the vault. When `totalSold` is 0, return 0. Still return this amount when `shares` is greater than `totalSold`.
- `canClaim` — `true` only when `totalSold` is greater than 0 and `shares` is at most `totalSold`. A claim that uses the full sold float still succeeds. If nothing has been sold, or `shares` is greater than `totalSold`, return the amount above and set `canClaim` to `false`.

Do not change `RealEstateMarketplace.sol`. Stay inside `Quote.sol`.

Run your result from the project root:

```bash
cd contracts
npx hardhat test test/Quote.test.js
```

Read the API result in another terminal, from the project root:

```bash
curl.exe "http://localhost:4000/api/properties/1/quote?shares=4"
```

Pass if `npx hardhat test test/Quote.test.js` passes. That run calls http://localhost:4000/api/properties/1/quote?shares=4 and checks `claimable` and `canClaim` against it.
