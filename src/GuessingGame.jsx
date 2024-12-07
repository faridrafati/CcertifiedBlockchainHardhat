import React from 'react';
import Web3 from 'web3/dist/web3.min';
import HideShow from './HideShow';
import resetProvider from './resetProvider';
import { GUESSINGGAME_ABI,GUESSINGGAME_ADDRESS } from './components/config/GuessingGameConfig';
import "font-awesome/css/font-awesome.css";

class GuessingGame extends resetProvider {
    state = {
        web3:new Web3(Web3.givenProvider || 'http://localhost:8545'),
        network:'',
        account:'',
        Contract:[],
        isMetaMask:'',
        owner:'',
        player:{
            wins:0,
            losses:0
        },
        zeroAddress:'0x0000000000000000000000000000000000000000',
        buttonEnabled: {checking: false, inputting: false},
        guess: false,
        amount: 0,
        winEvents:[],
        loseEvents:[]
    }

    componentDidMount = () =>{
        this.checkMetamask();
        this.tokenContractHandler();
    }

    tokenContractHandler = async () => {
        await this.initWeb();
        await this.initContract(GUESSINGGAME_ABI, GUESSINGGAME_ADDRESS);
        this.getPlayersData();
    }

    getPlayersData = async () => {
        let {Contract,account} = this.state;
        let buttonEnabled = this.state.buttonEnabled;
        let player = await Contract.methods.players(account).call();
        this.setState({player});
        buttonEnabled.checking=false;
        buttonEnabled.inputting=false;
        this.setState({amount : 0,buttonEnabled});
        let winEvents = await this.getEvents('PlayerWon',0);
        let loseEvents = await this.getEvents('PlayerLost',0);

        this.setState({winEvents, loseEvents});
    }

    getEvents = async (eventName,blockNumberOfContract) => {
        let {web3,Contract} = this.state;
        let latest_block = await web3.eth.getBlockNumber();
        let historical_block = blockNumberOfContract;//latest_block - 10000; // you can also change the value to 'latest' if you have a upgraded rpc
        const events = await Contract.getPastEvents(eventName, {
            filter: {}, // Using an array means OR: e.g. 20 or 23
            fromBlock: historical_block,
            toBlock: latest_block
        }, function(error){ 
            if(error){
                console.log(error); 
            }
        });
        let winOrLose = await this.getTransferDetails(events,eventName);
        return winOrLose;
    };

    getTransferDetails = async (data_events,eventName) => {
        let {web3,account} = this.state;
        let winOrLose=[];
        for (let i = 0; i < data_events.length; i++) {
            let mysteryNumber = data_events[i]['returnValues']['mysteryNumber'];
            let player = data_events[i]['returnValues']['player'];
            let amount = data_events[i]['returnValues']['amount'];
            let converted_amount = web3.utils.fromWei(amount);
            if(player === account) {
                if(eventName==='PlayerWon'){
                    if(mysteryNumber>5){
                        winOrLose.push(`${converted_amount} (eth) by guessing ${mysteryNumber} would be higher than 5`);
                    } else {
                        winOrLose.push(`${converted_amount} (eth) by guessing ${mysteryNumber} would be lower than or equal 5`);
                    }
                } else {
                    if(mysteryNumber<=5){
                        winOrLose.push(`${converted_amount} (eth) by guessing ${mysteryNumber} would be higher than 5`);
                    } else {
                        winOrLose.push(`${converted_amount} (eth) by guessing ${mysteryNumber} would be lower than or equal 5`);
                    }
                }

                
            }
        };
        return winOrLose;
    };

    withdrawBet = async () => {
        let {Contract,account} = this.state;
        let TxId = '';
        await Contract.methods.withdrawBet().send({from: (account), gas: '1000000'},(error,result) => {
            if(!error){
              TxId = result;
              this.notify('info','Pending Transactions on Ethereum');
            }else{
              this.notify('error',error.message);
            }
        
        });
        this.notify('success','TX is Done: '+TxId);
        this.getPlayersData();   

      };


    onSubmitGuess = async () => {
        let {Contract,web3,account,amount} = this.state;
        let TxId = '';
        await Contract.methods.winOrLose(5,this.state.guess).send({from: (account), gas: '1000000', value: web3.utils.toWei(amount, "ether")},(error,result) => {
            if(!error){
              TxId = result;
              this.notify('info','Pending Transactions on Ethereum');
            }else{
              this.notify('error',error.message);
            }
        
        });
        this.notify('success','TX is Done: '+TxId);
        this.getPlayersData();        
    }

    onButtonClick = async (e) => {
        let buttonEnabled = this.state.buttonEnabled;
        buttonEnabled.checking = true;
        this.setState({buttonEnabled});
        if (e.currentTarget['id'] === 'success-outlined') {
            this.setState({guess: true});
        } else if (e.currentTarget['id'] === 'danger-outlined') {
            this.setState({guess: false});
        }
    }

    changeHandler = (e) => {
        let {value} = e.currentTarget;
        let buttonEnabled = this.state.buttonEnabled;
        if ((value ==='')||(value==='.')||(value==='0')){
            buttonEnabled.inputting=false;
        } else {
            buttonEnabled.inputting=true;
        }
        this.setState({amount:value, buttonEnabled});
    } 
    
    render() {
        let {owner,amount,buttonEnabled,winEvents,loseEvents,account} = this.state;
        return (
            <div className="row">
                <section className="bg-light text-center">
                <h1>Guessing Game</h1>
                    <HideShow 
                        currentAccount = {this.state.currentAccount}
                        contractAddress = {GUESSINGGAME_ADDRESS}
                        chainId = {this.state.chainId}
                        owner = {owner}
                    />
                </section>
                <div className="row">
                    <div className="col-6 col-md-8 offset-md-2 mt-2">
                        <div className="card text-center">
                            <div className="card-header">
                                Betting Window
                            </div>
                            <div className="card-body">
                                <h5 className="card-title">Higher or Lower</h5>
                                <p className="card-text">Will the mystery number be higher or lower than 5?</p>
                                
                                <input 
                                    type="radio" 
                                    className="btn-check m-2" 
                                    name="options-outlined" 
                                    id="success-outlined" 
                                    autoComplete="off" 
                                    onClick={this.onButtonClick}
                                />
                                <label 
                                    className="btn btn-outline-success m-2" 
                                    htmlFor="success-outlined">
                                        Higher
                                </label>

                                <input 
                                    type="radio" 
                                    className="btn-check m-2" 
                                    name="options-outlined" 
                                    id="danger-outlined" 
                                    autoComplete="off" 
                                    onClick={this.onButtonClick}
                                />
                                <label 
                                    className="btn btn-outline-danger m-2"
                                    htmlFor="danger-outlined">
                                        Lower
                                </label>
 
 
                                <div className="input-group mb-3">
                                   <div className="input-group-prepend">
                                        <span className="input-group-text" id="inputGroup-sizing-default">Ether</span>
                                    </div>
                                    <input type="number" value={amount} className="form-control" aria-label="Default" aria-describedby="inputGroup-sizing-default" onChange={this.changeHandler}/> 
                                </div>
                                <button className="btn btn-primary m-1" disabled = {!((buttonEnabled.checking)&&(buttonEnabled.inputting))} onClick={this.onSubmitGuess}>Check Your Chance</button>
                                {account === owner ?<button className="btn btn-warning m-1"  onClick={this.withdrawBet}>Withdraw Balance</button>:""}

                            </div>

                        </div>
                    </div>
                </div>
                <div className="row mt-3">
                    <div className="col-lg-6 col-md-8 offset-md-2 offset-lg-0">
                        <div className="card  bg-success bg-opacity-10 ">
                            <div className="card-header text-center ">
                                <b>Wins</b>
                            </div>
                            <div className="card-body ">
                                {winEvents.map((events,index) =>(
                                    <li key={index}>
                                        You win {events}
                                    </li>
                                ))}
                            </div>
                        </div>
                    </div>
                    <div className="col-lg-6 col-md-8 offset-md-2 offset-lg-0">
                        <div className="card  bg-danger bg-opacity-10">
                            <div className="card-header text-center ">
                                <b>Losses</b>
                            </div>
                            <div className="card-body">
                                {loseEvents.map((events,index) =>(
                                    <li key={index}>
                                        You lose {events}
                                    </li>
                                ))}

                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}
 
export default GuessingGame;