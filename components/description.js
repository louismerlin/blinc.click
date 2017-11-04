export default () => (
  <div>
    <p className="title is-1 has-text-primary has-text-bold">blinc.click</p>
    <p className="subtitle is-4">The blockchain incremental experiment</p>
    <div className="content">
      <h4 className="has-text-bold">What is this ?</h4>
      <p>This website is plain html & javascript, and it connects to the <a href="https://ethereum.org/" target="_blank">ethereum</a> blockchain using <a href="https://metamask.io/" target="_blank">metamask</a> or <a href="https://github.com/ethereum/mist" target="_blank">mist</a>.</p>

      <h4 className="has-text-bold">Incremental experiment ?</h4>
      <p> There is a smart contract on the blockchain with this number in the center, and your goal is to make it go as high as possible ! You can do this by upgrading the speed through a blockchain transaction.</p>

      <h4 className="has-text-bold">I upgraded, how do I see if everything worked ?</h4>
      <p>You should be able to access the transaction page from where you placed the transaction. You will see if it is still pending, if it failed or succeeded.</p>

      <h4 className="has-text-bold">Cool ! How did you do that ?</h4>
      <p>With a combination if <a href="https://github.com/zeit/next.js">next.js</a>, <a href="https://bulma.io">bulma</a> and <a href="https://github.com/ethereum/web3.js/">web3.js</a>. The code will be made public and Open Source after the experiment is over.</p>

      <h4 className="has-text-bold">How can I replace my address with my username ?</h4>
      <p>Use the form bellow. It costs 0.01 ether to change your username, and you can do it as much as you like !</p>
    </div>
  </div>
)
