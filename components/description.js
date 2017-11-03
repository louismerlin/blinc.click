export default () => (
  <div>
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
  </div>
)
