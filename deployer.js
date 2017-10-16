global.config = {
  rpc: {
    host: "localhost",
    port: "8545",
  },
};

// Load Libraries
//global.solc = require("solc");
global.fs = require("fs");
global.Web3 = require("web3");

// Connect Web3 Instance
global.web3 = new Web3(new Web3.providers.HttpProvider(`http://${global.config.rpc.host}:${global.config.rpc.port}`));

// Global Account Accessors
global.accounts = web3.eth.getAccounts()

// Helper Functions
class Helpers {

  contractName(source) {
    const re1 = /contract.*{/g;
    const re2 = /\s\w+\s/;
    return source.match(re1).pop().match(re2)[0].trim();
  }

/*  createContract(source, options={}) {
    const compiled = solc.compile(source);
    const contractName = this.contractName(source);
    console.log(compiled.contracts)
    const contractToDeploy = compiled.contracts[`:${contractName}`];
    const bytecode = contractToDeploy.bytecode;
    const abi = JSON.parse(contractToDeploy.interface);
    const contract = new global.web3.eth.Contract(abi);
    const gasEstimate = global.web3.eth.estimateGas({ data: bytecode });
    return global.accounts.then(accounts => {
      return gasEstimate.then(gas => {
        return contract.deploy({
          data: bytecode,
          arguments: options
        }).send({
          from: accounts[0],
          gas: gas,
          gasPrice: 5
        });
      })
    })
  }*/

  loadContract(name) {
    const path = `./${name}.sol`;
    return fs.readFileSync(path, 'utf8');
  }

  deployContract(name, options={}) {
    const source = this.loadContract(name);
    return this.createContract(source, options);
  }

  etherBalance(contract) {
    switch(typeof(contract)) {
      case "object":
        if(contract.address) {
          return global.web3.utils.fromWei(global.web3.eth.getBalance(contract.address), 'ether').toNumber();
        } else {
          return new Error("cannot call getEtherBalance on an object that does not have a property 'address'");
        }
        break
      case "string":
        return global.web3.eth.getBalance(contract).then(b => { return global.web3.utils.fromWei(b, 'ether') });
    }
  }
}

// Load Helpers into Decypher namespace
global.ethelp = new Helpers()

// Start repl
require('repl').start({})
