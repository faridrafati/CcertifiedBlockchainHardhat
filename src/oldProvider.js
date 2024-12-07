import React, { Component } from 'react';
import detectEthereumProvider from '@metamask/detect-provider';

class Provider extends Component {
    async checkMetamask () {
        const { ethereum } = window;
  
        const provider = await detectEthereumProvider();
        if (provider) {
            this.startApp(provider); // Initialize your app
            this.setState({buttonName: ''});
        } else {
            this.setState({buttonName:'Install'});
            this.setState({message: '1. Please First install MetaMask!\n2. Then Connect App to Metamask.'});
            return;
        }
  
        const chainId = await ethereum.request({ method: 'eth_chainId' });
        ethereum.on('chainChanged', (chainId)=>this.handleChainChanged(chainId));
        this.setState({chainId});

        ethereum.request({ method: 'eth_accounts' }).then((res) => {this.handleAccountsChanged(res)}).catch((err) => {
            console.error(err);
        });
  
        ethereum.on('accountsChanged', (res) => 
        {
          this.handleAccountsChanged(res);
          window.location.reload();
        }  
        ); 
    }
    async componentDidMount () {
        this.checkMetamask();
    }
  
    handleChainChanged(_chainId) {
        // We recommend reloading the page, unless you must do otherwise
        window.location.reload();
        console.log(_chainId);
    }
  
  
  
    // For now, 'eth_accounts' will continue to always return an array
    handleAccountsChanged(accounts) {
      if (accounts.length === 0) {
        // MetaMask is locked or the user has not connected any accounts
        this.setState({buttonName:'Connect'});
        this.setState({message: 'Please Connect to MetaMask!'});
        this.setState({currentAccount: null});
        this.setState({modalNeed: true});
          return;
      }else{
        this.setState({buttonName: ''});
        if (accounts[0] !== this.state.currentAccount) {
          this.setState({currentAccount : accounts[0]});
          this.setState({buttonName:'Refresh'});
          this.setState({message: `Your Account Address is: ${accounts[0]}`});
          this.setState({modalNeed: false});
        }
      }
    }
  
    startApp(provider) {
        // If the provider returned by detectEthereumProvider is not the same as
        // window.ethereum, something is overwriting it, perhaps another wallet.
        if (provider !== window.ethereum) {
          console.error('Do you have multiple wallets installed?');
        }
        // Access the decentralized web!
    }
  
    onClickConnect = async () => {
        const { ethereum } = window;
        const accounts = await ethereum.request({ method: 'eth_requestAccounts' }).catch((err) => {
            if (err.code === 4001) {
              // EIP-1193 userRejectedRequest error
              // If this happens, the user rejected the connection request.
              console.log('Please connect to MetaMask.');
            } else {
              console.error(err);
            }
          });
        const account = accounts[0];
        this.setState({currentAccount: account});
        this.setState({modalNeed: false});
    }
}
 
export default Provider;

