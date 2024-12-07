import React, { Component } from 'react';
import {Collapse } from 'react-bootstrap';

class HideShow extends Component {
  state = { 
    isVisible : false,
    chain :
      [
        {chainId: '0x5',chainName:'Goerli'},
        {chainId: '0x1',chainName:'Mainnet'},
        {chainId: '0xaa36a7',chainName:'Sepolia'},
        {chainId: '1337',chainName:'Ganache'},
        {chainId: '31337',chainName:'Hardhat'}
      ]
    }
  invokeCollapse = () => {
    this.setState({ isVisible : ! this.state.isVisible})
  }
  
  render() {
    let {owner,currentAccount,contractAddress} = this.props;
    owner = (owner !==undefined)?owner.toLowerCase():undefined;
    currentAccount = (currentAccount !==undefined)?currentAccount.toLowerCase():undefined;
    const chains = this.state.chain;
    let webAddress = '';
    let chain = {};
    chains.forEach(element => {
      if (element.chainId === this.props.chainId){
        chain = element;
        if (chain.chainName !== 'Mainnet') {
          webAddress = chain.chainName+'.';
        }
      }    
    });
    
    return (
      <div>
      <u className="link-secondary lead text-muted" onClick={this.invokeCollapse} style={{cursor:'pointer'}}>+ Contract Info...</u>

      <Collapse in={this.state.isVisible}>
        <div id="collapsePanel">
          <p className='lead text-muted'>
          Your Chain is: {chain.chainName} With Id: {chain.chainId}
          </p>
          <p>
          <a className="link-dark" href={'https://'+webAddress+'etherscan.io/address/'+currentAccount}  target='_blank' rel="noreferrer" type="addressLinks">
          Your Address is{(owner === currentAccount)?' (Contract Owner): ':': '} {currentAccount}</a>
          </p>
          <p>
          <a className="link-dark"href={'https://'+webAddress+'etherscan.io/address/'+contractAddress+'#readContract'}  target='_blank' rel="noreferrer" type="addressLinks">
          Your Contract Address is: {contractAddress}</a>
          </p>
        </div>
      </Collapse>
    </div>
    );
  }
}
 
export default HideShow;