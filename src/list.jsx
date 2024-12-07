import React, { Component } from 'react';
import _ from 'lodash';

class CardList extends Component {
    state = {  } 
    render() {
        let {question,image,votes,voted} = this.props.poll;
        let result = votes.map(i=>Number(i));
        return (
            <div className="card mb-4" onClick={this.props.onClick}>
                <img src={image} alt="" className="card-img-top"/>
                <div className="card-body">
                    <p className="card-text text-truncate fw-bold">
                       {question}
                    </p>
                    <div className="d-flex justify-content-between">
                        <small className="text-muted">votes: {_.sum(result)}</small>
                        {voted && <span className="badge bg-success">voted</span>}
                    </div>

                </div>
            </div>
        );
    }
}
 
export default CardList;