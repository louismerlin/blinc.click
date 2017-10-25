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
    this.setUsername = this.setUsername.bind(this)
    this.changeFormUsername = this.changeFormUsername.bind(this)
    this.getUpgraders = this.getUpgraders.bind(this)
    this.getUsername = this.getUsername.bind(this)
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
    date: null,
    username: null,
    formUsername: '',
    upgrades: [],
    upgradesSync: 1
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
    window.setInterval(this.blockchainSync, 1*1000)
    window.setTimeout(this.blockchainSync, 0.5*1000)

    window.setInterval(() => {
      this.setState(state => ({date: Date.now()}))
    }, 1000/30)
    
    // TEST NET
    this.state.web3.eth.getTransactionFromBlock(3, 0).then(transaction =>
      this.state.web3.eth.getTransactionReceipt(transaction.hash).then(receipt =>
        this.setState(state => ({
          contract: new this.state.web3.eth.Contract(INC.abi, receipt.contractAddress)
        }))
      )
    )
    /*
    // RINKEBY
    this.setState(state => ({
      contract: new this.state.web3.eth.Contract(INC.abi, '0x20E48687787117996AE90Bc2ffb74429c3223569')
    }))
    */
    /*
    // MAIN NET
    this.setState(state => ({
      contract: new this.state.web3.eth.Contract(INC.abi, '0x')
    }))
    */
  }

  blockchainSync() {
    if(this.state.web3) {
      this.state.web3.eth.getBlockNumber().then(
        block => this.setState(state => ({block: block}))
      )
    }
    if(this.state.contract) {
      this.state.contract.methods.inc().call().then(
        inc => {
          this.setState(state => ({inc: parseInt(inc)}))
        }
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
      this.state.web3.eth.getAccounts().then(accounts =>
        this.state.contract.methods.usernames(accounts[0]).call().then(
          username => this.setState(state => ({username: username}))
        )
      )
      this.getUpgraders(this.state.upgradesSync)
    }
  }

  getUpgraders(i) {
    this.state.contract.methods.upgrades(i).call().then(
      upgrader => {
        if(upgrader != '0x0000000000000000000000000000000000000000') {
          this.setState(state => ({upgrades: [...state.upgrades, {hash: upgrader, username: ''}]}))
          this.getUpgraders(i+1)
          this.setState(state => ({upgradesSync: state.upgradesSync + 1}))
          this.getUsername(i)
        }
        return new Promise(() => console.log)
      }
    )
  }

  getUsername(i) {
    this.state.contract.methods.usernames(this.state.upgrades[i-1].hash).call().then(
        username => {
          var upgrades = this.state.upgrades
          upgrades[i-1].username = username
          this.setState(state => ({upgrades: upgrades}))
        }
    )
  }

  upgrade() {
    this.state.web3.eth.getAccounts().then(accounts => {
      return this.state.contract.methods.upgrade().estimateGas().then(gas => {
        return this.state.contract.methods.upgrade().send({
          from: accounts[0],
          gas: gas
        })
      })
    })
  }

  setUsername() {
    this.state.web3.eth.getAccounts().then(accounts => {
      return this.state.contract.methods.setUsername(this.state.formUsername)
      .estimateGas({
        value: this.state.web3.utils.toWei(0.01, 'ether')
      }).then(gas => {
        return this.state.contract.methods.setUsername(this.state.formUsername).send({
          from: accounts[0],
          gas: gas,
          value: this.state.web3.utils.toWei(0.01, 'ether')
        })
      })
    })
  }

  changeFormUsername(event) {
    this.setState({formUsername: event.target.value })
  }

  render() {
    const secondsSinceLastUpgrade = this.state.date - this.state.lastUpgrade * 1000
    const buttonText = `UPGRADE SPEED\n [${ this.state.upgradeCost }]`
    var currentInc = 0
    if(this.state.speed != null && this.state.inc != null)
      var currentInc = this.state.inc + Math.floor(secondsSinceLastUpgrade / 1000 * this.state.speed)
    var upgradesList = ''
    if(this.state.upgrades.length)
      var upgradesList = this.state.upgrades.map((x, i) => <li key={i}>
        {x.username ? x.username + ' (' + x.hash + ')' : x.hash}</li>)

    return (
      <div className="container is-fluid">
        <Head>
          <meta name="viewport" content="width=device-width, initial-scale=1"/>
          <title>INC</title>
        </Head>
        <style dangerouslySetInnerHTML={{ __html: stylesheet }} />
        <div className="columns">
          <div className="column is-one-quarter">
            <div className="tags has-addons ">
              <span className="tag is-medium">block</span>
              <span className="tag is-success is-medium">
                { this.state.block }
              </span>
            </div>
            <div className="tags has-addons">
              <span className="tag is-medium">username</span>
              <span className="tag is-info is-medium">
                { this.state.username }
              </span>
            </div>
            <input className="input" type="text" placeholder="/u/incblockchain"
                    onChange={ this.changeFormUsername }/>
            <button className="button"
                    onClick={this.setUsername}>SET USERNAME</button>
          </div>
          <div className="column is-half has-text-centered">
            <h1 className="title inc">{ currentInc }</h1>
            <button className="button is-info is-large"
                    onClick={this.upgrade}>{ buttonText }
            </button>
          </div>
          <div className="column is-one-quarter">
            <h2 className="title">Upgraders list</h2>
            <ul>{ upgradesList }</ul>
          </div>
        </div>
      </div>
    )
  }
}

export default App
