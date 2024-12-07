import React from 'react';
import Web3 from 'web3/dist/web3.min';
import PollForm from './pollForm';
import CardList from './list';
import Details from './details';
import Chart from 'react-apexcharts';
import {POLL_ABI,POLL_ADDRESS} from './components/config/PollConfig';
import resetProvider from './resetProvider';
import HideShow from './HideShow';
class Poll extends resetProvider {
  
    state = {
        web3:new Web3(Web3.givenProvider || 'http://localhost:8545'),
        network:'',
        account:'',
        Contract:[],
        isMetaMask:'',

        Voter: {
            id:'',
            voted:[]
        },

        Polls: [
            {
              id:'',
              question: "",
              image: "",
              votes: [],
              items: [],
            }
        ],

        selectedPoll:  {
            question: "",
            image: "",
            votes: [0,0,0],
            items: ["","",""],
        },

        pollOrNot : false,
            
        options: {
            chart: {
                id: 'apexchart-example'
            },
            xaxis: 
            {
                categories: ['Option #1','Option #2','Option #3']
            },
            plotOptions : {
                bar: {
                    distributed: true
                }
            },
        },

        series: [{
            name: 'series-1',
            type: 'column',
            data: [0,0,0]
        }],
    }

    componentDidMount() {
        this.checkMetamask();
        this.tokenContractHandler();
    }
    tokenContractHandler = async () => {
        await this.initWeb();
        await this.initContract(POLL_ABI,POLL_ADDRESS);
        await this.getAllPolls();
    }

    getAllPolls = async () => {
        let {Contract,account} = this.state;
        let Polls = this.state.Polls;
        let numberOfPolls = await Contract.methods.getTotalPolls().call();
        for(let i=0; i< numberOfPolls; i++){
            let _poll = await Contract.methods.getPoll(i).call();
            Polls[i] =   {            
                id:_poll[0],
                question: _poll[1],
                image: _poll[2],
                votes: _poll[3],
                items: _poll[4],
                voted: false
            }
        }
        let votedList = await Contract.methods.getVoter(account).call();
        let result = votedList[1].map(i=>Number(i));
        let length = result.length;
        for (let i=0; i< length; i++) {
            Polls[result[i]].voted = true;
        }
        this.setState(Polls);
    }


    submitCreatePollHandler = async (createdPoll) => {
        let TxId='';
        let {Contract,account} = this.state;
        await Contract.methods.createPoll(createdPoll.question,createdPoll.image,[createdPoll.option1,createdPoll.option2,createdPoll.option3]).send({from: (account), gas: '1000000'},(error,result) => {
            if(!error){
                TxId=result;
                this.notify('info','Creating Poll is in Progress');
              }else{
                console.log(error);
                this.notify('error','Creating Poll is Failed: '+error.message);
              }
              this.setState({pollOrNot:false});
            });
        this.notify('success','Creating Poll is Done: '+TxId);
        await this.getAllPolls();
    }

    onClickCard = (selectedPoll) => {
        this.setState({selectedPoll});
        this.refreshChart(selectedPoll);
    }
    
    refreshChart = (selectedPoll) => {
        const newSeries = [];
        var i=0;
        this.state.series.forEach((s) => {
            const data = s.data.map(() => {
                i++;
                return selectedPoll.votes[i-1];
            })
            newSeries.push({ data: data })
        })        
        this.setState({
            series: newSeries,
        }) 

        
        this.setState({
            options : {
                ...this.state.options,
                chart: {
                    ...this.state.chart,
                    id: selectedPoll.items
                },
                ...this.state.options,
                xaxis: {
                    ...this.state.xaxis,
                    categories: selectedPoll.items
                }
            }
        });
    }

    submitVote =  async (e,selectedItem) => {
        let TxId='';
        e.preventDefault();
        let selectedPoll = this.state.selectedPoll;
        let selectedIndex = selectedPoll.items.indexOf(selectedItem);
        await this.state.Contract.methods.vote(selectedPoll.id,selectedIndex).send({from: (this.state.account), gas: '1000000'},(error,result) => {
            if(!error){
                TxId=result;
                this.notify('info','Submitting Vote is in Progress');
                selectedPoll.voted = true;
            }else{
                console.log(error);
                this.notify('error','Submitting Vote is Failed: '+error.message);
            }
        });

        this.notify('success','Submitting Vote is Done: '+TxId); 

        selectedPoll.votes = selectedPoll.votes.map(i=>Number(i));
        selectedPoll.votes[selectedIndex] ++;

        let Polls = this.state.Polls;
        let index = Polls.indexOf(selectedPoll);
        Polls[index] = selectedPoll;
        this.setState({Polls});
        this.setState({selectedPoll});
        this.refreshChart(selectedPoll);
    }
    
    render() { 
        let {Polls,options,series} = this.state;
        return (
            <div>
                <section className="bg-light text-center">
                    <h1>Polling App</h1>
                    <HideShow 
                        currentAccount = {this.state.currentAccount}
                        contractAddress = {POLL_ADDRESS}
                        chainId = {this.state.chainId}
                    />
                </section>
                <button className='btn btn-success m-2 mt-4 mb-4 container' onClick={() => this.setState({pollOrNot: !(this.state.pollOrNot)})}>{!this.state.pollOrNot?'Create a Poll':'Start Polling'}</button>
                {this.state.pollOrNot &&                 
                    <div className='col-sm-4 container'>
                        <PollForm submitCreatePollHandler = {this.submitCreatePollHandler}/>
                    </div>
                }

                {!this.state.pollOrNot &&    
                    <div className='d-flex'>
                        <div className='container pollList' style={{maxWidth:'400px',textAlign:'left'}}>
                            {Polls.map((Poll,index)=>(<CardList key={index} poll={Poll} onClick={() => this.onClickCard(Poll)}/>))}
                        </div>

                        <div className='container pollDetail' style={{textAlign:'left'}}>
                            <Details 
                                selectedPoll={this.state.selectedPoll} 
                                submitVote={this.submitVote} 
                                selectedRadio={this.state.selectedRadio}
                            />
                            {options.xaxis.categories[0] !== 'Option #1' ? <Chart 
                                options={options} 
                                series={series} 
                                type="bar" 
                                width={500} 
                                height={320} 
                            />:""}
                        </div>
                    </div>
                }
            </div>
        );
    }
}
 
export default Poll;