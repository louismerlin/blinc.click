const Web3 = require('web3')
const web3 = new Web3(new Web3.providers.HttpProvider('http://localhost:8545'))

const INC = require('./build/contracts/Inc.json')

web3.eth.getAccounts().then(accounts => {
    const contract = new web3.eth.Contract(INC.abi)
    web3.eth.estimateGas({data: INC.unlinked_binary}).then(gas => {
      contract.deploy({data: INC.unlinked_binary})
              .send({from: accounts[0], gas: gas, gasPrice: 5})
              .then(console.log)
    })
})
