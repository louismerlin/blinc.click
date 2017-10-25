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
    this.contractSync = this.contractSync.bind(this)
    this.computeUpgraders = this.computeUpgraders.bind(this)
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
    upgradesSync: 1,
    reverseList: [],
    bestList: []
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

    // TEST NET
    /*
    this.state.web3.eth.getTransactionFromBlock(3, 0).then(transaction =>
      this.state.web3.eth.getTransactionReceipt(transaction.hash).then(receipt =>
        this.setState(state => ({
          contract: new this.state.web3.eth.Contract(INC.abi, receipt.contractAddress)
        }))
      )
    )
    */
    // RINKEBY
    this.setState(state => ({
      contract: new this.state.web3.eth.Contract(INC.abi, '0x20E48687787117996AE90Bc2ffb74429c3223569')
    }))
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
        block => {
          if(this.state.block != block) {
            this.setState(state => ({block: block}))
            this.contractSync()
          }
          return () => {}
        }
      )
    }
  }
  contractSync() {
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
          this.state.upgrades[i-1] = {hash: upgrader, username: ''}
          this.computeUpgraders()
          this.getUpgraders(i+1)
          this.getUsername(i)
        }
        return new Promise(() => console.log)
      }
    )
  }

  getUsername(i) {
    this.state.contract.methods.usernames(this.state.upgrades[i-1].hash).call().then(
        username => {
          this.state.upgrades[i-1].username = username
          this.computeUpgraders()
        }
    )
  }

  computeUpgraders() {
    this.state.reverseList = Array.from(this.state.upgrades)
    this.state.reverseList.reverse()
    this.state.bestList = []
    this.state.upgrades.forEach(u => {
      const f = this.state.bestList.findIndex(b => b.hash == u.hash)
      if(f != -1) this.state.bestList[f].score++
      else this.state.bestList.push({hash: u.hash, username: u.username, score: 1})
    })
    this.state.bestList = this.state.bestList.sort((x, y) => {return y.score-x.score})
    this.forceUpdate()
  }

  upgrade() {
    this.state.web3.eth.getAccounts().then(accounts => {
      return this.state.contract.methods.upgrade().estimateGas().then(gas => {
        return this.state.contract.methods.upgrade().send({
          from: accounts[0],
          gas: gas
        })
      }).catch(console.log)
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
      }).catch(console.log)
    })
  }

  changeFormUsername(event) {
    this.setState({formUsername: event.target.value })
  }

  render() {
    const secondsSinceLastUpgrade = this.state.date - this.state.lastUpgrade * 1000
    const buttonText = `UPGRADE FOR ${ (new Number(this.state.upgradeCost)).toPrecision(3) }`
    var currentInc = 0
    if(this.state.speed != null && this.state.inc != null)
      var currentInc = (new Number(this.state.inc + Math.floor(secondsSinceLastUpgrade / 1000 * this.state.speed))).toPrecision(5)

    var bestTable = ''
    if(this.state.bestList.length)
      var bestTable = this.state.bestList.map((x, i) => <tr className={i==0 ? 'is-selected' : ''} key={i}>
        <td>{ i+1 }</td><td>{ x.username }</td><td>{ x.hash.substr(0, 10) }</td><td>{ x.score }</td></tr>)

    var latestTable = ''
    if(this.state.reverseList.length)
      var latestTable = this.state.reverseList.map((x, i) => <tr className={i==0 ? 'is-selected' : ''} key={i}>
        <td>{ x.username }</td><td>{ x.hash.substr(0, 10) }</td></tr>)

    return (
      <div className="section container is-fluid">
        <Head>
          <meta name="viewport" content="width=device-width, initial-scale=1"/>
          <title>INC</title>
        </Head>
        <style dangerouslySetInnerHTML={{ __html: stylesheet }} />
        <div className="columns">
          <div className="column is-one-quarter">
            <div className="tags has-addons">
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
            <div className="field has-addons">
              <div className="control">
                <input className="input is-info" type="text" placeholder="/u/incblockchain"
                      onChange={ this.changeFormUsername }/>
              </div>
              <div className="control">
                <a className="button is-info" onClick={this.setUsername}>
                  SET USERNAME
                </a>
              </div>
            </div>
          </div>
          <div className="column is-half has-text-centered">
            <div className="is-hidden-mobile" style={{height: '25vh'}}></div>
            <h1 className="title inc">{ currentInc }</h1>
            <br/>
            <button className="button is-primary is-large"
                    onClick={this.upgrade}>{ buttonText }
            </button>
          </div>
          <div className="column is-one-quarter">
            <h2 className="title">Top Upgraders</h2>
            <div style={{maxHeight: '40vh', overflow: 'auto'}}>
              <table className="table is-narrow is-fullwidth">
                <tbody>
                  { bestTable }
                </tbody>
              </table>
            </div>
            <h2 className="title">Latest Upgraders</h2>
            <div style={{maxHeight: '40vh', overflow: 'auto'}}>
              <table className="table is-narrow is-fullwidth">
                <tbody>
                  { latestTable }
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    )
  }
}

export default App
