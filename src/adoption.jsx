import React from 'react';
import pets from './components/pets.json';
import Web3 from 'web3/dist/web3.min';
import {ADOPTION_ABI,ADOPTION_ADDRESS} from './components/config/AdoptionConfig';
import HideShow from './HideShow';
import resetProvider from './resetProvider';

class Adoption extends resetProvider {
    state = {
        web3:new Web3(Web3.givenProvider || 'http://localhost:8545'),
        network:'',
        account:'',
        Contract:[],
        isMetaMask:'',
        owner:'',
        adopters:[],
        zeroAddress:'0x0000000000000000000000000000000000000000'
    }

    componentDidMount() {
        this.checkMetamask();
        this.tokenContractHandler();
    }

    tokenContractHandler = async () => {
        await this.initWeb();
        await this.initContract(ADOPTION_ABI,ADOPTION_ADDRESS);
        this.getAllAdopters();
    }
    
    getAllAdopters =async() => {
        let {Contract,account} = this.state;
        let adopters = await Contract.methods.getAdopters().call({from: account});
        this.setState({adopters});
    }

    Adopt = async (index) => {
        let TxId = '';
        let {Contract,account} = this.state;

        
        await Contract.methods.adopt(index).send({from: (account), gas: '1000000'},(error,result) => {
            if(!error){
                TxId=result;
                this.notify('info','Adoption is in Progress');
              }else{
                console.log(error);
                this.notify('error','Adoption is Failed: '+error.message);
              }
          
            });
        this.notify('success','Adoption is Done: '+TxId);
        await this.getAllAdopters();
    }


    render() {
        let {zeroAddress, adopters,account} = this.state;
        const loadedData = JSON.stringify(pets);
        const data = JSON.parse(loadedData);

        return (
            <div className="container">
                <section className="bg-light text-center">
                    <h1>Pet Adoption</h1>
                    <HideShow 
                        currentAccount = {this.state.currentAccount}
                        contractAddress = {ADOPTION_ADDRESS}
                        chainId = {this.state.chainId}
                    />
                </section>
                <div className="row">
                    {data.map((d,index)=>(
                        <div key={index} className="card"  style={{"width": "19rem","margin": "8px", 'border' : 'secondary', 'textAlign':'left'}}>
                            <div className="card-header" style={{'textAlign':'center'}}>
                                <h5><b>{d.name}</b></h5>
                            </div>
                            <img src={require('./components/'+d.picture)} className="card-img-top" alt={"./"+d.picture} />
                            <div className="card-body">
                                <p className="card-text"><b>Breed: </b>{d.breed}</p>
                                <p className="card-text"><b>Age: </b> {d.age} Yrs</p>
                                <p className="card-text"><b>Location: </b>{d.location} Yrs</p>
                                <button 
                                    className={"btn btn-"+(adopters[index] ===  zeroAddress? 'primary' : (account === adopters[index] ? 'success' : 'secondary') )} 
                                    onClick={()=>this.Adopt(index)}
                                    disabled = {adopters[index] !==  zeroAddress}>
                                        {adopters[index] ===  zeroAddress ? 'Adopt' : (account === adopters[index] ? 'Owned' : 'Adopted')}
                                    </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

        );
    }
}
 
export default Adoption;