import Head from 'next/head'
import { Component } from 'react'
import Web3 from 'web3'
import stylesheet from 'styles/index.scss'
import UpgradesList from '../components/upgradesList'

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
          this.setState(state => ({upgradesSync: state.upgradesSync + 1}))
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

    return (
      <div>
        <Head>
          <meta name="viewport" content="width=device-width, initial-scale=1"/>
          <link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/font-awesome/4.7.0/css/font-awesome.min.css"/>
          <title>blinc.click</title>
        </Head>
        <nav className="navbar" role="navigation" aria-label="main navigation">
          <div className="navbar-brand">
          </div>
          <div className="navbar-menu is-active">
            <div className="navbar-end">
              <div className="navbar-item">
                <div className="tags has-addons">
                  <span className="tag is-medium">username</span>
                  <span className="tag is-info is-medium">
                    { this.state.username }
                  </span>
                </div>
              </div>
              <div className="navbar-item">
                <div className="tags has-addons">
                  <span className="tag is-medium">block</span>
                  <span className="tag is-success is-medium">
                    { this.state.block }
                  </span>
                </div>
              </div>
            </div>
          </div>
        </nav>
        <div className="section container is-fluid">
          <style dangerouslySetInnerHTML={{ __html: stylesheet }} />
          <div className="columns">
            <div className="column is-one-quarter">
              <p className="title is-1 has-text-primary">blinc.click</p>
              <p className="subtitle is-4">The blockchain incremental experiment</p>
              <div className="content">
                <h3>What is this ?</h3>
                <p>This website is plain html & javascript, and it connects to the <a href="https://ethereum.org/" target="_blank">ethereum</a> blockchain using <a href="https://metamask.io/" target="_blank">metamask</a> or <a href="https://github.com/ethereum/mist" target="_blank">mist</a>.</p>

                <h3>Incremental experiment ?</h3>
                <p> There is a smart contract on the blockchain with this number in the center, and your goal is to make it go as high as possible ! You can do this by upgrading the speed through a blockchain transaction.</p>
                <h3>I upgraded, how do I see if everything worked ?</h3>
                <p>You should be able to access the transaction page from where you placed the transaction. You will see if it is still pending, if it failed or succeeded.</p>
                <h3>How can I replace my address with my username ?</h3>
                <p>Use the form bellow. It costs 0.01 ether to change your username, and you can do it as much as you like !</p>
              </div>

              <div className="field has-addons">
                <div className="control">
                  <input className="input is-info" type="text" placeholder="/u/blinc.click"
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
              <UpgradesList table={ this.state.bestList } />
              <h2 className="title">Latest Upgraders</h2>
              <UpgradesList table={ this.state.reverseList } />
            </div>
          </div>
        </div>
      </div>
    )
  }
}

export default App
