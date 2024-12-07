import React from 'react';
import Web3 from 'web3/dist/web3.min';
import {VOTING_ABI,VOTING_ADDRESS} from './components/config/VotingConfig';
import resetProvider from './resetProvider';
import HideShow from './HideShow';
import Select from './components/pollCommon/select';


class Voting extends resetProvider {
    state = {
        web3 : new Web3(Web3.givenProvider || 'http://localhost:8545'),
        network:'',
        account:'',
        Contract:'',
        button: 1,
        numberC: 0,
        candidates:[{
            address:'',
            votes:''
        }],
        data:''
    };

    componentDidMount = () => {
        this.checkMetamask();
        this.tokenContractHandler();
    }

    tokenContractHandler = async () => {
        await this.initWeb();
        await this.initContract(VOTING_ABI,VOTING_ADDRESS);
        await this.extraInitContract();
    }

    extraInitContract = async () => {
        let {Contract} = this.state;
        const numberC = parseInt(await Contract.methods.numberOfCandidates().call());
        let candidates = this.state.candidates;
        let candidateList = [];
        for (var i=0; i<numberC; i++) {
            let address = await Contract.methods.Candidates(i).call();  // Retrieve address of each candidate
            let votes = await Contract.methods.VotesForCandidate(address).call(); // Retrieve votes of candidate
            candidates[i]={address : address.toString() , votes : votes.toString()};
        }
        this.setState({candidateList,candidates,numberC});
    }

    onSubmit = e => {
        e.preventDefault();
        if (this.state.button === 'Vote') {
            this.voteForCandidate();
        }
        if (this.state.button === 'AddCandidate') {
          this.addCandidate();
        }
    };


    voteForCandidate = async() => {
        let TxId ='';
        let address = this.state.data['voteFor'];
        let {Contract} = this.state;
        await Contract.methods.voteForCandidate(address).send({from: (this.state.account), gas: '1000000'},(error,result) => {
          if(!error){
            TxId=result;
            this.notify('info','Voting is in Progress');
          }else{
            console.log(error);
            this.notify('error','Voting Failed: '+error.message);
          }
      
        });
        await this.extraInitContract();
        this.notify('success','Voting is Done: '+TxId);
    }    

    addCandidate = async() => {
        let TxId='';
        let address = this.state.data['addCandidate'];
        let {Contract} = this.state;
        await Contract.methods.addCandidate(address).send({from: (this.state.account), gas: '1000000'},(error,result) => {
            if(!error){
                TxId=result;
                this.notify('info','Adding Candidate is in Progress');
              }else{
                console.log(error);
                this.notify('error','Adding Candidate is Failed: '+error.message);
              }
          
            });
        await this.extraInitContract();
        this.notify('success','Adding Candidate is Done: '+TxId);
    }

    handleChange = ({ currentTarget: input }) => {
        const data = { ...this.state.data };
        data[input.name] = input.value;
        if(data.voteFor !== 'Open this select menu'){
            this.setState({ data });
        }
    };

    render() {
        let {data} = this.state;
        return (
            <div className="container">
                <section className="bg-light text-center">
                    <h1>Voting Application</h1>
                    <HideShow 
                        currentAccount = {this.state.currentAccount}
                        contractAddress = {VOTING_ADDRESS}
                        chainId = {this.state.chainId}
                    />
                </section>
                <div >
                    <h2>Candidates</h2>
                    <table className="table table-bordered">
                        <thead>
                            <tr>
                                <th scope="col">Address</th>
                                <th scope="col">Votes</th>
                            </tr>
                        </thead>

                        <tbody id="tableBody_Candidates">


                        {
                            this.state.candidates.map((cd,index)=>(
                                <tr key={index}>
                                    <td>{cd['address']}</td>
                                    <td>{cd['votes']}</td>
                                </tr>
                            ))}
                        </tbody>

                        <tbody id="votersList">

                        </tbody>
                    </table>
                </div>
                <form onSubmit={this.onSubmit}>
                <div className="row g-3 align-items-center mb-3">
                        <div className="col-auto">
                            <label 
                                htmlFor="addCandidate" 
                                className="col-form-label">
                                    Add Candidate
                            </label>
                        </div>
                        <div className="col-4">
                            <input 
                                type="text" 
                                id="addCandidate"
                                name="addCandidate"
                                className="form-control"
                                placeholder='Address'
                                value={data['addCandidate']}
                                onChange={this.handleChange} 
                            />
                        </div>
                        <div className="col-auto">
                            <button 
                                id="addCandidate" 
                                className="btn btn-primary"
                                onClick={() => (this.setState({button : 'AddCandidate'}))}
                                type="submit"
                                name="addCandidate"
                            >
                                Add Candidate
                            </button>
                        </div>
                    </div>
                    <div className="row g-3 align-items-center mb-3">
                        <div className="col-auto">
                            <label 
                                htmlFor="voteFor" 
                                className="col-form-label">
                                    Vote For
                            </label>
                        </div>
                        <Select className="col-4" name='voteFor' options={this.state.candidates} onChange={this.handleChange} />
                        <div className="col-auto">
                            <button 
                                id="voteFor" 
                                className="btn btn-primary"
                                onClick={() => (this.setState({button : 'Vote'}))}
                                type="submit"
                                name="voteFor"
                            >
                                Vote
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        );
    }
}
 
export default Voting;