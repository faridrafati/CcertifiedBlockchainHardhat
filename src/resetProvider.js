import { Component } from 'react';
import detectEthereumProvider from '@metamask/detect-provider';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

class resetProvider extends Component {

  async componentDidMount () {
    this.checkMetamask();
  }

  startApp(provider) {
    // If the provider returned by detectEthereumProvider is not the same as
    // window.ethereum, something is overwriting it, perhaps another wallet.
    if (provider !== window.ethereum) {
      console.error('Do you have multiple wallets installed?');
    }
    // Access the decentralized web!
  }
    
////////////////////////////////////////////////////////////////////////////////////  
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


    ethereum.request({ method: 'eth_chainId' }).then((res) => {this.handleChainChanged(res)}).catch((err) => {
      console.error(err);
    });
    ethereum.on('chainChanged', (res)=>{this.handleChainChanged(res)
      window.location.reload();
    });


    ethereum.request({ method: 'eth_accounts' }).then((res) => {this.handleAccountsChanged(res)}).catch((err) => {
      console.error(err);
    });
    ethereum.on('accountsChanged', (res) =>{this.handleAccountsChanged(res);
      window.location.reload();
    }); 

  }
////////////////////////////////////////////////////////////////////////////////////  

  
  handleChainChanged(_chainId) {
      // We recommend reloading the page, unless you must do otherwise
      this.setState({chainId: _chainId});
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

  ////////////////////////////////////////////////////////////////////////////////////  


  
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

  ////////////////////////////////////////////////////////////////////////////////////  

  initWeb = async () => {
    let {web3,} = this.state;
    const network = await web3.eth.net.getNetworkType();
    const accounts = await web3.eth.getAccounts();
    let account = accounts[0];
    this.setState({web3,network,account});
  }

  initContract = async (ABI,ADDRESS) => {
    let owner = '';
    let {web3} = this.state;
    let Contract = new web3.eth.Contract(ABI,ADDRESS);
    try {
      owner = await Contract.methods.getOwner().call();
      this.setState({owner});
    } catch (error) {
      console.log(error);
    }
    try {
      owner= await Contract.methods.getOwnerAddress().call();
      this.setState({owner});
    } catch (error) {
      console.log(error);
    }
    try {
      owner= await Contract.methods.owner().call();
      this.setState({owner});
    } catch (error) {
      console.log(error);
    }
    let isMetaMask = await web3.currentProvider.isMetaMask;
    this.setState({isMetaMask,Contract,owner});
  }

  notify = (type,message) => {
    let milSeconds = 4000;
    switch(type) {
        case 'info': 
            return toast.info(message, {
                position: "bottom-right",
                autoClose: milSeconds,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
                theme: "colored",
                });
        case 'success':
            return toast.success(message, {
                position: "bottom-right",
                autoClose: milSeconds,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
                theme: "colored",
                });
        case 'warning':
            return toast.warning(message, {
                position: "bottom-right",
                autoClose: milSeconds,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
                theme: "colored",
                });
        case 'error':
            return toast.error(message, {
                position: "bottom-right",
                autoClose: milSeconds,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
                theme: "colored",
                });
        default :
            return toast(message, {
              position: "bottom-right",
              autoClose: milSeconds,
              hideProgressBar: false,
              closeOnClick: true,
              pauseOnHover: true,
              draggable: true,
              progress: undefined,
              theme: "colored",
              });
    }
}



}
 
export default resetProvider;

