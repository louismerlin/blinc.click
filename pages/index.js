import Head from 'next/head'
import { Component } from 'react'
import Web3 from 'web3'
import stylesheet from 'styles/index.scss'
import UpgradesList from '../components/upgradesList'
import Navbar from '../components/navbar'

const INC = require('../build/contracts/Inc.json')

class App extends Component {

  constructor(props) {
    super(props)

    this.syncBlockchain = this.syncBlockchain.bind(this)
    this.syncContract = this.syncContract.bind(this)
    this.syncUsernames = this.syncUsernames.bind(this)
    this.upgrade = this.upgrade.bind(this)
    this.setUsername = this.setUsername.bind(this)
    this.changeFormUsername = this.changeFormUsername.bind(this)
    this.bytesToString = this.bytesToString.bind(this)
    this.stringToBytes = this.stringToBytes.bind(this)
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
    formBytes: [],
    formString: '',
    upgraders: [],
    bestList: [],
    usernames: new Map(),
    noWeb3: false,
    loading: true
  }

  componentWillMount() {
    let provider
    if (typeof web3 !== 'undefined') {
      provider = web3.currentProvider
    } else {
      this.setState({noWeb3: true})
    }
    this.setState({web3Provider: provider})
    this.setState({web3: new Web3(provider)})
  }

  componentDidMount() {
    window.setInterval(this.syncBlockchain, 5*1000)
    window.setTimeout(this.syncBlockchain, 0.5*1000)

    window.setInterval(() => {
      this.setState({date: Date.now()})
    }, 1000/30)

    /*
    // TEST NET
    this.state.web3.eth.getTransactionFromBlock(3, 0).then(transaction =>
      this.state.web3.eth.getTransactionReceipt(transaction.hash).then(receipt =>
        this.setState(state => ({
          contract: new state.web3.eth.Contract(INC.abi, receipt.contractAddress)
        }))
      )
    )
    */
    // RINKEBY
    this.setState(state => ({
      contract: new state.web3.eth.Contract(INC.abi, '0x9e2CD3e60bC39535B1A6e4C9a6Cf8f5bF502598f')
    }))
    /*
    // MAIN NET
    this.setState(state => ({
      contract: new state.web3.eth.Contract(INC.abi, '0x')
    }))
    */
  }

  syncBlockchain() {
    if(this.state.web3) {
      this.state.web3.eth.getBlockNumber().then(
        block => {
          if(this.state.block != block) {
            this.setState({block: block})
            if(this.state.contract) {
              this.state.contract.methods.upgradeCount().call().then(
                upgradeCount => {
                  if(this.state.upgradeCount != upgradeCount) {
                    this.setState({upgradeCount: upgradeCount})
                    this.syncContract()
                  }
                }
              )
              this.syncUsernames()
            }
          }
        }
      )
    }
    return () => {}
  }

  syncContract() {
    if(this.state.contract) {
      this.state.contract.methods.inc().call().then(
        inc => {
          this.setState({inc: parseInt(inc)})
        }
      )
      this.state.contract.methods.speed().call().then(
        speed => this.setState({speed: parseInt(speed)})
      )
      this.state.contract.methods.upgradeCost().call().then(
        upgradeCost => this.setState({upgradeCost: upgradeCost})
      )
      this.state.contract.methods.lastUpgrade().call().then(
        lastUpgrade => this.setState({lastUpgrade: lastUpgrade})
      )
      this.state.contract.methods.getUpgraders().call().then(
        upgraders => {
          this.setState({upgraders: Array.from(upgraders)})
          this.setState(() => {
            const bestList = []
            upgraders.forEach(address => {
              const j = bestList.findIndex(u => u.hash == address)
              if (j != -1)
                bestList[j].score++
              else
                bestList.push({hash: address, score: 1})
            })
            return({bestList: bestList.sort((x, y) => {return y.score-x.score})})
          })
          this.syncUsernames(upgraders)
        }
      )
      this.state.web3.eth.getAccounts().then(accounts =>
        this.state.contract.methods.usernames(accounts[0]).call().then(
          username => this.setState({username: this.state.web3.utils.hexToString(username)})
        )
      )
    }
    return () => {}
  }

  syncUsernames(upgraders) {
    if (upgraders == null) upgraders = this.state.upgraders
    var hasBeenUpdated = false
    upgraders.forEach(hash => {
      this.state.contract.methods.usernames(hash).call().then(
        username => {
          if (this.state.web3.utils.hexToString(username) != this.state.usernames.get(hash)) {
            this.state.usernames.set(hash, this.state.web3.utils.hexToString(username))
            hasBeenUpdated = true
          }
        }
      )
    })
    if (hasBeenUpdated) this.forceUpdate()
    return () => {}
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
      return this.state.contract.methods.setUsername(this.state.web3.utils.stringToHex(this.state.formString))
      .estimateGas({
        value: this.state.web3.utils.toWei(0.01, 'ether')
      }).then(gas => {
        return this.state.contract.methods.setUsername(this.state.web3.utils.stringToHex(this.state.formString)).send({
          from: accounts[0],
          gas: gas,
          value: this.state.web3.utils.toWei(0.01, 'ether')
        })
      }).catch(console.log)
    })
  }

  changeFormUsername(event) {
    const sliced = this.stringToBytes(event.target.value).slice(0, 32)
    this.setState({formBytes: sliced})
    this.setState({formString: this.bytesToString(sliced)})
  }

  bytesToString(b) {
    return this.state.web3.utils.hexToString(this.state.web3.utils.bytesToHex(b))
  }
  stringToBytes(s) {
    return this.state.web3.utils.hexToBytes(this.state.web3.utils.stringToHex(s))
  }

  render() {
    const secondsSinceLastUpgrade = this.state.date - this.state.lastUpgrade * 1000
    const buttonText = `UPGRADE FOR ${ (new Number(this.state.upgradeCost)).toPrecision(3) }`

    var currentInc = 0
    if(this.state.speed != null && this.state.inc != null)
      var currentInc = (new Number(this.state.inc + Math.floor(secondsSinceLastUpgrade / 1000 * this.state.speed))).toPrecision(5)

    if(this.state.noWeb3) return(<div>Yo install metamask</div>)

    return (
      <div>
        <Head>
          <meta name="viewport" content="width=device-width, initial-scale=1"/>
          <link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/font-awesome/4.7.0/css/font-awesome.min.css"/>
          <title>blinc.click</title>
        </Head>
        <Navbar username={ this.state.username } block={ this.state.block }/>
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
                        onChange={ this.changeFormUsername } value={ this.state.formString }/>
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
              <UpgradesList table={ this.state.bestList } usernames={ this.state.usernames } />
              <h2 className="title">Latest Upgraders</h2>
              <UpgradesList table={ Array.from(this.state.upgraders).map(u => ({hash: u})).reverse() } usernames={ this.state.usernames } />
            </div>
          </div>
        </div>
      </div>
    )
  }
}

export default App
