import React from 'react';
import Web3 from 'web3/dist/web3.min';
import 'bootstrap/dist/css/bootstrap.min.css';
import logoPhoto from './components/images/image007.png';
import certPhoto from './components/images/image008.png';
import {CERTIFICATE_ABI,CERTIFICATE_ADDRESS} from './components/config/CertificateConfig';
import {TextField, Button} from '@mui/material';
import resetProvider from './resetProvider';
import HideShow from './HideShow';
import './components/css/App.css';
import { sha256 } from 'js-sha256';

class Certificate extends resetProvider {  
    state = {
        certified:{
            credentialID:'',
            name:'',
            courseName:'',
            issuingOrganization:'',
            reasonForAward:'',  
            issueDate:0,
            expirationDate: 0,
        },
        certifiedList:[{
            credentialID:'',
            name:'',
            courseName:'',
            issuingOrganization:'',
            reasonForAward:'',  
            issueDate:0,
            expirationDate: 0,
        }],
        web3:new Web3(Web3.givenProvider || 'http://localhost:8545'),
        network:'',
        account:'',
        Contract:[],
        isMetaMask:'',
        owner:'', 
        inputs:{
            credentialID:'',
            name:'',
            courseName:'',
            issuingOrganization:'',
            issueDate:'',
            expirationDate:'', 
            reasonForAward:'',    
        },
        input:'',
        showCertificate:false,
        helperText: '', 
        zeroAddress:'0x0000000000000000000000000000000000000000',
        error: false,
        today: new Date()
    }

    componentDidMount() {
        this.checkMetamask();
        this.tokenContractHandler();
    }

    tokenContractHandler = async () => {
        await this.initWeb();
        await this.initContract(CERTIFICATE_ABI,CERTIFICATE_ADDRESS);
        await this.getAllCertificates();
    }

    DateTime = (timeStamp) => {
        let out = new Intl.DateTimeFormat('en-US', {year: 'numeric', month: '2-digit',day: '2-digit'}).format(timeStamp*1000);
        return out;
    }

    dateToTimestamp = (myDate) => {
        console.log(myDate);
        myDate = myDate.split("-");
        var newDate = new Date( myDate[0], myDate[1] - 1, myDate[2]);
        console.log(myDate, newDate.getTime()/1000);
        return(newDate.getTime()/1000);
    }



    formatDate = (date) => {
        var d = new Date(date),
            month = '' + (d.getMonth() + 1),
            day = '' + d.getDate(),
            year = d.getFullYear();
    
        if (month.length < 2) 
            month = '0' + month;
        if (day.length < 2) 
            day = '0' + day;
    
        return [year, month, day].join('-');
    }



    
    

    inputHandler = (e) => {
        let {inputs,input} = this.state;
        if(e.currentTarget.id === 'checkCertificate'){
            input = e.currentTarget.value;
        }else{
            inputs[e.currentTarget.id] = e.currentTarget.value;
            inputs.credentialID = this.hashing(inputs);
        }
        this.setState({inputs,input});
    }

    checkCertificate = async (e) => {
        e.preventDefault();
        let {Contract,input,showCertificate,certified} = this.state;
        let foundCertificate = await Contract.methods.checkCertificate(input).call();
        if(foundCertificate[0]!==''){
            showCertificate=true;
            certified.credentialID=foundCertificate[0];
            certified.name=foundCertificate[1];
            certified.courseName=foundCertificate[2];
            certified.issuingOrganization=foundCertificate[3];
            certified.issueDate=foundCertificate[4];
            certified.expirationDate=foundCertificate[5];
            certified.reasonForAward=foundCertificate[6];
        }else{
            showCertificate = false;
        }
        this.setState({certified,showCertificate});
    }

    addCertificate = async (e) => {
        let TxId = '';
        e.preventDefault();
        let {inputs,account,Contract} = this.state;

        await Contract.methods.addCertificate(
            inputs.credentialID,
            inputs.name,
            inputs.courseName,
            inputs.issuingOrganization,
            this.dateToTimestamp(inputs.issueDate),
            this.dateToTimestamp(inputs.expirationDate),
            inputs.reasonForAward
            ).send({from: (account), gas: '1000000'},(error,result) => {
                if(!error){
                    TxId=result;
                    this.notify('info','Adding Certificate is in Progress');
                  }else{
                    console.log(error);
                    this.notify('error','Adding Certificate is Failed: '+error.message);
                  }
              
                });

            this.notify('success','Adding Certificate is Done: '+TxId);
        await this.getAllCertificates();
    }

    getAllCertificates = async () => {
        let {certifiedList,Contract} = this.state;
        let numberOfCertificates = await Contract.methods.getNumberOfCertificates().call();
        for(let i=0; i< numberOfCertificates; i++){
            certifiedList[i] = await Contract.methods.certified(i).call();
        }
        this.setState({certifiedList});
    }
    hashing = (certified) => {
        let id = certified.name+certified.courseName+certified.issuingOrganization+certified.reasonForAward+certified.issueDate+certified.expirationDate;
        return(sha256(id).substr(0,13));
    }

    render() {
        let {certified,input,showCertificate,owner,account,inputs,certifiedList} = this.state;
        if((owner !== account) || (account ==='')){
            return (
                <div>
                    <section className="bg-light text-center">
                        <h1>Certified Certificate App</h1>
                        <HideShow 
                            currentAccount = {this.state.currentAccount}
                            contractAddress = {CERTIFICATE_ADDRESS}
                            chainId = {this.state.chainId}
                        />
                    </section>
                    <br />
                    <form>
                        <TextField id='checkCertificate' label='credential ID:' variant='outlined' style={{margin:'0px 5px'}} size='small' value={input} onChange = {this.inputHandler} />
                        <Button variant='contained' color='primary' onClick={this.checkCertificate}>Check Certificate</Button>
                        <br /><br /><br /><hr />
                    </form>
                    {showCertificate ? 
                        <div>

                            <p className='MsoNormal'  style={{marginBottom:'0cm',textAlign:'center'}}><span
                                style={{fontSize:'30pt',lineHeight:'107%',fontFamily:'Lato',
                                color:'#7F7F7F'}}>COURSE CERTIFICATE</span></p>

                            <p className='MsoNormal' style={{marginBottom:'0cm',textAlign:'center'}}><span
                                style={{color:'black'}}><img style={{width:'189', height:'154'}} src={logoPhoto} alt="description"/></span></p>

                            <p className='MsoNormal'  style={{marginBottom:'0cm',textAlign:'center'}}><span
                                style={{fontSize:'22pt',lineHeight:'107%',fontFamily:'Lato',
                                color:'#7F7F7F'}}>This is to certify that</span></p>

                            <p className='MsoNormal'  style={{marginBottom:'0cm',textAlign:'center'}}><span
                                style={{fontSize:'60pt',lineHeight:'107%',fontFamily:'Times New Roman'}}>{certified.name}</span></p>
                            <br /><br />
                            <p className='MsoNormal'  style={{marginBottom:'0cm',textAlign:'center'}}><span
                                style={{position:'absolute',zIndex:'251661312',left:'0px',marginLeft:'4px',marginTop:'31px',width:'396px',height:'396px'}}>
                                    <img style={{width:'396', height:'396'}} src={certPhoto} alt="description" /></span>
                                    <span style={{fontSize:'22pt',lineHeight:'107%',fontFamily:'Lato',
                                color:'#7F7F7F'}}>{certified.reasonForAward}</span></p>
                                
                                
                            <p className='MsoNormal'  style={{marginBottom:'0cm',textAlign:'center'}}><span
                                style={{fontSize:'48pt',lineHeight:'107%',fontFamily:'Times New Roman'}}>{certified.courseName}</span></p>
                            <br /><br />
                            
                            
                            
                            
                            <p className='MsoNormal'  style={{marginBottom:'0cm',textAlign:'center'}}><span
                                style={{fontSize:'18pt',lineHeight:'107%',fontFamily:'Lato',
                                color:'#7F7F7F'}}>{certified.issuingOrganization}</span></p>
                            <br />
                            <p className='MsoNormal'  style={{marginBottom:'0cm',textAlign:'center'}}><span
                                style={{fontSize:'18pt',lineHeight:'107%',fontFamily:'Lato',
                                color:'#7F7F7F'}}>Issued {this.DateTime(certified.issueDate)}</span></p>

                            <p className='MsoNormal'  style={{marginBottom:'0cm',textAlign:'center'}}><span
                                style={{fontSize:'18pt',lineHeight:'107%',fontFamily:'Lato',
                                color:'#7F7F7F'}}>Expired {this.DateTime(certified.expirationDate)}</span></p>
                                <br />



                            <p className='MsoNormal'  style={{marginBottom:'0cm',textAlign:'center'}}><span
                                style={{fontSize:'18pt',lineHeight:'107%',fontFamily:'Lato',
                                color:'#7F7F7F'}}>Your ID: {certified.credentialID}</span></p>

                        </div>:<h1 className='badge bg-danger'>Certificate does not existed</h1>}

                </div>
                
            );
        }else{
            return (
                <div>
                    <section className="bg-light text-center">
                        <h1>Certified Certificate App (Admin Section)</h1>
                        <HideShow 
                            currentAccount = {this.state.currentAccount}
                            contractAddress = {CERTIFICATE_ADDRESS}
                            chainId = {this.state.chainId}
                            owner={owner}
                        />
                    </section>
                    <br />
                    <form>
                        <TextField id='name' label='Name & Family:' variant='outlined' style={{margin:'10px 15px'}} size='small' value={inputs.name} onChange = {this.inputHandler} />
                        <TextField id='courseName' label='Course Name:' variant='outlined' style={{margin:'10px 15px'}} size='small' value={inputs.courseName} onChange = {this.inputHandler} />
                        <TextField id='issuingOrganization' label='Issuing Organization:' variant='outlined' style={{margin:'10px 15px'}} size='small' value={inputs.issuingOrganization} onChange = {this.inputHandler} /><br />
                        
                        <TextField id='reasonForAward' label='Reason For Award:' variant='outlined' sx={{width: '690px'}} style={{margin:'10px 15px'}} size='small' value={inputs.reasonForAward} onChange = {this.inputHandler} /><br />
                        
                        <TextField id="issueDate" label="issueDate" type="date" value={inputs.issueDate} style={{margin:'10px 15px'}} size='small' InputLabelProps={{shrink: true,}} onChange = {this.inputHandler}/>
                        <TextField id="expirationDate" label="expirationDate" type="date"  value={inputs.expirationDate} style={{margin:'10px 15px'}} size='small' InputLabelProps={{shrink: true,}} onChange = {this.inputHandler}/>
                        
                        <TextField id='credentialID' label='credential ID:' inputProps={{ readOnly: true }} variant='outlined' style={{margin:'10px 15px'}} size='small' value={inputs.credentialID} /><br />                 










                        <br />
                        <Button variant='contained' color='primary' onClick={this.addCertificate}>Add Certificate</Button>

                        <br /><hr />
                        <table className="table">
                            <thead>
                                <tr>
                                    <th scope="col">#</th>
                                    <th scope="col">Credential ID</th>
                                    <th scope="col">Name</th>
                                    <th scope="col">Course Name</th>
                                    <th scope="col">Issuing Organization</th>
                                    <th scope="col">Reason For Reward</th>
                                    <th scope="col">Issue Date</th>
                                    <th scope="col">Expiration Date</th>
                                </tr>
                            </thead>
                            <tbody>
                                {certifiedList.map((certified,index)=>(
                                    <tr key={index}>
                                        <th scope="row">{index+1}</th>
                                        <td>{certified.credentialID}</td>
                                        <td>{certified.name}</td>
                                        <td>{certified.courseName}</td>
                                        <td>{certified.issuingOrganization}</td>
                                        <td>{certified.reasonForAward}</td>
                                        <td>{this.DateTime(certified.issueDate)}</td>
                                        <td>{this.DateTime(certified.expirationDate)}</td>
                                    </tr>
                                ))}
 
                            </tbody>
                            </table>
                        
                    </form>
                </div>
            )
        }
    }
}
export default Certificate;