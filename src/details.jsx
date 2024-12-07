import React, { Component } from 'react';


class Details extends Component {
    state = { 
        btnDisabled : true,
        selectedItem:"",
    }

    btnCheck = (e) => {
        this.setState({btnDisabled:false,selectedItem:e.currentTarget.value});
    }

    render() {
        let {question,items,voted} = this.props.selectedPoll;
        return (
            <div>
                <h1>{question}</h1>
                <form action="submit">
                    <div className="form-group">
                        {items.filter(item => {return item!==""}).map((item,index)=>(
                           <div className="form-check"  key={index}>
                                <input 
                                    type="radio" 
                                    className="form-check-input" 
                                    id={index} name='selection' 
                                    value={item} 
                                    checked={this.state.selectedItem === item} 
                                    onChange={this.btnCheck}/>
                                <label htmlFor={index} className="form-check-label">{item}</label>
                            </div>
                        ))}
                        <button  onClick={(e)=>this.props.submitVote(e,this.state.selectedItem)} className='btn btn-secondary' disabled={this.state.btnDisabled || voted}>Submit Vote</button>                          
                    </div>
                </form>
            </div>
        );
    }
}
 
export default Details;