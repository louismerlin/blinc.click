import Head from 'next/head'
import { Component } from 'react'
import Web3 from 'web3'
import stylesheet from 'styles/index.scss'

const INC = require('../build/contracts/Inc.json')

class App extends Component {

  constructor(props) {
    super(props)

    this.blockchainSync = this.blockchainSync.bind(this)
    this.upgrade = this.upgrade.bind(this)
  }

  state = {
    web3: null,
    web3Provider: null,
    block: null,
    contract: null,
    inc: null,
    speed: null,
    upgradeCost: null,
    lastUpgrade: null,
    date: null
  }

  componentWillMount() {
    let provider
    if (typeof web3 !== 'undefined') {
      provider = web3.currentProvider
    } else {
      provider = new Web3.providers.HttpProvider('http://localhost:8545')
    }
    this.setState(state => ({web3Provider: provider}))
    this.setState(state => ({web3: new Web3(provider)}))
  }

  componentDidMount() {
    window.setInterval(this.blockchainSync, 5*1000)
    window.setTimeout(this.blockchainSync, 0.5*1000)

    window.setInterval(() => {
      this.setState(state => ({date: Date.now()}))
    }, 1000/30)

    this.state.web3.eth.getTransactionFromBlock(1, 0).then(transaction =>
      this.state.web3.eth.getTransactionReceipt(transaction.hash).then(receipt =>
        this.setState(state => ({
          contract: new this.state.web3.eth.Contract(INC.abi, receipt.contractAddress)
        }))
      )
    )
  }

  blockchainSync() {
    if(this.state.web3) {
      this.state.web3.eth.getBlockNumber().then(
        block => this.setState(state => ({block: block}))
      )
    }
    if(this.state.contract) {
      this.state.contract.methods.inc().call().then(
        inc => this.setState(state => ({inc: parseInt(inc)}))
      )
      this.state.contract.methods.speed().call().then(
        speed => this.setState(state => ({speed: parseInt(speed)}))
      )
      this.state.contract.methods.upgradeCost().call().then(
        upgradeCost => this.setState(state => ({upgradeCost: upgradeCost}))
      )
      this.state.contract.methods.lastUpgrade().call().then(
        lastUpgrade => this.setState(state => ({lastUpgrade: lastUpgrade}))
      )
    }
  }

  upgrade() {
    this.state.web3.eth.getAccounts().then(accounts =>
      this.state.contract.methods.upgrade().send({from: accounts[0]})
                                           .then(blockchainSync)
    )
  }

  render() {
    const secondsSinceLastUpgrade = this.state.date - this.state.lastUpgrade * 1000
    const buttonText = `UPGRADE SPEED\n
              ${ this.state.speed }/s➡️${ this.state.speed + 1}/s [${ this.state.upgradeCost }]`
    var currentInc = 0
    if (this.state.speed != null && this.state.inc != null)
      var currentInc = this.state.inc + Math.floor(secondsSinceLastUpgrade / 1000 * this.state.speed)
//    const incStyle = { font-size: ''}
    return (
      <div className="container is-fluid">
        <Head>
          <meta name="viewport" content="width=device-width, initial-scale=1"/>
          <title>INC</title>
        </Head>
        <style dangerouslySetInnerHTML={{ __html: stylesheet }} />
        <div className="column">
          <span className="tag is-success is-medium pull-right">
            block { this.state.block }
          </span>
        </div>
        <div className="column is-centered">
          <h1 className="title has-text-centered inc">{ currentInc }</h1>
        </div>
        <div className="columns is-centered">
          <button className="column button is-info is-narrow is-large"
                  onClick={this.upgrade}>{ buttonText }
          </button>
        </div>
        {  }
      </div>
    )
  }
}

export default App
