import React from 'react';
import car from './components/images/car.png';
import sold from './components/images/sold.png';
import Web3 from 'web3/dist/web3.min';
import {TextField,Button} from '@mui/material';
import 'bootstrap/dist/css/bootstrap.min.css';
import {AUCTION_ABI,AUCTION_ADDRESS} from './components/config/AuctionConfig';
import resetProvider from './resetProvider';
import HideShow from './HideShow';
class Auction extends resetProvider {
    state = {
        web3:new Web3(Web3.givenProvider || 'http://localhost:8545'),
        network:'',
        account:"",
        Contract:'',
        isMetaMask:'', 
        Highest:{
            bid:'',
            bidder:''
        },
        accountBid:'',
        tasks:[],
        input:"",
        status:'',
        endTime:'',
        auctionEnded:false,
        withdraw:''
    }


    

    componentDidMount() {
        this.checkMetamask();
        this.tokenContractHandler();
    }
    tokenContractHandler = async () => {
        await this.initWeb();
        await this.initContract(AUCTION_ABI,AUCTION_ADDRESS);
        await this.extraInitContract();
    }
    
    extraInitContract = async () => {
        let {Contract,Highest,accountBid,account,endTime,auctionEnded} = this.state;
        Highest.bid= await Contract.methods.HighestBid().call();
        Highest.bidder= await Contract.methods.HighestBidder().call();
        accountBid= await Contract.methods.getBidderBid(account).call();
        endTime= await Contract.methods.getEndTime().call();
        auctionEnded= await Contract.methods.getAuctionEnded().call();
        this.setState({Highest,accountBid,endTime,auctionEnded});
    }

    DateTime = (timeStamp) => {
        let out = new Intl.DateTimeFormat('en-US', {year: 'numeric', month: '2-digit',day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit'}).format(timeStamp*1000);
        return out;
    }

    inputHandler = (e) => {
        let input = this.state.input;
        input = e.currentTarget.value;
        this.setState({input});
    }

    withdrawHandler = (e) => {
        let withdraw = this.state.withdraw;
        withdraw = e.currentTarget.value;
        this.setState({withdraw});
    }

    putBid = async () => {
        let {account,input,Contract,web3} = this.state;
        let TxId='';
        await Contract.methods.putBid().send({from: (account), gas: '1000000', value: web3.utils.toWei(input, "finney")},(error,result) => {
            if(!error){
                TxId=result;
                this.notify('info','Putting Bid is in Progress');
              }else{
                console.log(error);
                this.notify('error','Putting Bid is Failed: '+error.message);
              }
          
            });
        this.notify('success','Putting Bid is Done: '+TxId);
        await this.extraInitContract();

    }

    putEndTime = async () => {
        let {account,input,Contract} = this.state;
        let TxId='';

        console.log('putEndTime ',input,this.dateToTimestamp(input));
        
        await Contract.methods.putEndTime(parseInt(this.dateToTimestamp(input))).send({from: (account), gas: '1000000'},(error,result) => {
            if(!error){
                TxId=result;
                this.notify('info','Putting End Time is in Progress');
              }else{
                console.log(error);
                this.notify('error','Putting End Time is Failed: '+error.message);
              }
          
            });
        this.notify('success','Putting End Time is Done: '+TxId);
        await this.extraInitContract();
    }

    endAuction = async (e) => {
        e.preventDefault();
        let TxId='';
        let {account,Contract} = this.state;
        await Contract.methods.endAuction(true).send({from: (account), gas: '1000000'},(error,result) => {
            if(!error){
                TxId=result;
                this.notify('info','Ending Auction is in Progress');
              }else{
                console.log(error);
                this.notify('error','Ending Auction is Failed: '+error.message);
              }
          
            });
        this.notify('success','Ending Auction is Done: '+TxId);
        await this.extraInitContract();
    }

    startAuction = async (e) => {
        e.preventDefault();
        let TxId='';
        let {account,Contract} = this.state;
        await Contract.methods.endAuction(false).send({from: (account), gas: '1000000'},(error,result) => {
            if(!error){
                TxId=result;
                this.notify('info','Starting Auction is in Progress');
              }else{
                console.log(error);
                this.notify('error','Starting Auction is Failed: '+error.message);
              }
          
            });
        this.notify('success','Starting Auction is Done: '+TxId);
        await this.extraInitContract();
    }

    withdrawBid = async() => {
        let {account,withdraw,Contract} = this.state;
        let TxId='';

        await Contract.methods.withdrawBid(withdraw).send({from: (account), gas: '1000000'},(error,result) => {
            if(!error){
                TxId=result;
                this.notify('info','Withdrawing is in Progress');
              }else{
                console.log(error);
                this.notify('error','Withdrawing is Failed: '+error.message);
              }
          
            });
        this.notify('success','Withdrawing Auction is Done: '+TxId);
        await this.extraInitContract();
    } 
    
    dateToTimestamp = (myDate) => {
        return(new Date(myDate).valueOf()/1000);
    }


    render() {
        let {input,web3,Highest,account,accountBid,owner,endTime,auctionEnded,withdraw} = this.state;
        let now = parseInt(Date.now()/1000);
        let isBidder = Highest.bidder === account ? true : false;
        let isOwner = owner === account ? true : false;
        let messages = []; 
        messages[0] = AUCTION_ADDRESS;
        messages[1] = account;
        messages[2] = owner;
        if(!isOwner){
            return (
                <div >
                    <section className="bg-light text-center">
                        <h1>Auction App</h1>
                        <HideShow 
                            currentAccount = {this.state.currentAccount}
                            contractAddress = {AUCTION_ADDRESS}
                            chainId = {this.state.chainId}
                        />
                    </section>
                    <div className="row align-items-center justify-content-center">
                        <div className='col-4'>
                            {(auctionEnded || (parseInt(now) > parseInt(endTime)))? <img src={sold} alt=""/> : <img src={car} alt=""/>  }
                        </div>
                        <form className='col-12  align-items-center justify-content-center  text-center'>
                            <p className={(parseInt(now) > parseInt(endTime)) ? 'badge bg-danger' : 'badge bg-primary'}>Auction {(parseInt(now) > parseInt(endTime))?  'is Ended at ( ' +endTime+' timeStamp) '+ this.DateTime(endTime) : 'is in Process till ( ' +endTime+' timeStamp) '+ this.DateTime(endTime) }</p>
                            <br /><br />
                            {(auctionEnded || (parseInt(now) > parseInt(endTime)))? '': <TextField id='outlined-basic' label='Bid in finney (1 ether = 1000 finney)' variant='outlined' style={{margin:'0px 5px'}} size='small' value={input} onChange = {this.inputHandler} />}
                            {(auctionEnded || (parseInt(now) > parseInt(endTime)))? '':<Button variant='contained' color='primary' onClick={() => this.putBid()}>Put Bid</Button>}
                            <br /><br />
                            {isBidder ? <br /> : <p>Your Bid is {web3.utils.fromWei(accountBid,'ether')} Ether </p>}
                            {isBidder ? <p>You Are Highest Bidder till Refresh Page</p> : <p>Highest Bidder is {Highest.bidder}</p>}
                            {isBidder ? <p>Your Bid is {web3.utils.fromWei(Highest.bid,'ether')} Ether </p> : <p>Highest Bid is {web3.utils.fromWei(Highest.bid,'ether')} Ether</p>}
                        </form>
                    </div>
                </div>
            );
        }else{
            return(
                <div>
                    <section className="bg-light text-center">
                        <h1>Auction App (Admin Section)</h1>
                        <HideShow 
                            currentAccount = {this.state.currentAccount}
                            contractAddress = {AUCTION_ADDRESS}
                            chainId = {this.state.chainId}
                            owner = {owner}
                        />
                    </section>
                    <div className="row align-items-center justify-content-center">
                        <div className='col-4'>
                            {(auctionEnded || (parseInt(now) > parseInt(endTime)))? <img src={sold} alt=""/> : <img src={car} alt=""/>  }
                        </div>
                        <form className='col-12 align-items-center justify-content-center  text-center'>
                            <p className={(parseInt(now) > parseInt(endTime)) ? 'badge bg-danger' : 'badge bg-primary'}>Auction {(parseInt(now) > parseInt(endTime))?  'is Ended at ( ' +endTime+' timeStamp) '+ this.DateTime(endTime) : 'is in Process till ( ' +endTime+' timeStamp) '+ this.DateTime(endTime) }</p>
                            <br /><br />
                            <TextField id="outlined-basic1" label="Put End Time to Auction in timeStamp" variant='outlined' style={{margin:'0px 5px'}} size='small' value={input} onChange = {this.inputHandler} type="datetime-local" InputLabelProps={{shrink: true,}} />

                            <Button variant='contained' color='primary' onClick={() => this.putEndTime()}>Submit End Time to Auction</Button>
                            <br /><br />
                            <TextField id='outlined-basic2' label='Put withdraw Address' variant='outlined' style={{margin:'0px 5px'}} size='small' value={withdraw} onChange = {this.withdrawHandler} />
                            <Button variant='contained' color='warning' onClick={() => this.withdrawBid()}>Submit Withdraw Address</Button>
                            <br /><br />
                            <p className={auctionEnded ? 'badge bg-danger' : 'badge bg-primary'}>Auction is {auctionEnded?  'Ended' : 'in Process' }</p>
                            <br />
                            {auctionEnded? <button className = 'btn btn-primary' onClick={this.startAuction} style={{align: 'center'}}>Start Auction</button>: <button className = 'btn btn-danger' onClick={this.endAuction}>End Auction</button>}
                        </form>
                    </div>
                </div>
            );
        }
    }
}
 
export default Auction;