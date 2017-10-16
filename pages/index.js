import Head from 'next/head'
import { Component } from 'react'
import Web3 from 'web3'
import stylesheet from 'styles/index.scss'

const INC = require('../build/contracts/Inc.json')

class App extends Component {

  state = {
    web3: null,
    web3Provider: null,
    block: null,
    contract: null,
    cost: null,
    inc: null
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
    window.setInterval(() => {
      this.state.web3.eth.getBlockNumber().then(
        block => this.setState(state => ({block: block}))
      )
      this.state.contract.methods.upgradeCost().call().then(
        cost => this.setState(state => ({cost: cost}))
      )
      this.state.contract.methods.inc().call().then(
        inc => this.setState(state => ({inc: inc}))
      )
    }, 5*1000)
    this.setState(state => ({
      contract: new this.state.web3.eth.Contract(INC.abi, '0x5447875e433ec052bf5a7db639a38d28c49dd49b')
    }))
  }

  render() {
    return (
      <div className="container is-fluid">
        <Head>
            <meta name="viewport" content="width=device-width, initial-scale=1"/>
            <title>INC</title>
        </Head>
        <style dangerouslySetInnerHTML={{ __html: stylesheet }} />
        <div className="column">
          <span className="tag is-info is-medium pull-right">block { this.state.block }</span>
        </div>
        <div className="column is-centered">
          <h1 className="title has-text-centered inc">{ this.state.inc }</h1>
        </div>
        <div className="column">
          <button className="button is-primary is-large ">UPGRADE</button>
        </div>
        <div className="column">
          <h3>{ this.state.cost }</h3>
        </div>
      </div>
    )
  }
}

export default App
