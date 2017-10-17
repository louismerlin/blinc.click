# INC
Blockchain-based incremental game

## How to use

### Solidity Contract

If you have edited the contract, run `truffle compile`. This will create a new
version of `build/contracts/Inc.json` that contains all the information about
the contract.

If you have not edited the contract, there should be nothing to do here.

### Ethereum network setup

Create a local ethereum network by launching `testrpc`.

Run `node depolyInc.js` to deploy the contract (**for the moment do this at
block 0**)

### Frontend

Run `yarn` or `npm install` followed by `yarn run dev` or `npm run dev`. The site will then be available on you port 3000.

Happy hacking !
