import React, { Component } from 'react';
import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';
import MetamaskLogo from './metamask.svg';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';


class ModalForm extends Component {
    state = { show : true }
    handleClose = () => {
        if (this.props.buttonName === 'Connect'){
            this.props.onClick();
            this.setState({show : false});
        } else if (this.props.buttonName === 'Install'){
            window.open("https://metamask.io/download/", "_blank");
            this.setState({show : true});
        } else if (this.props.buttonName === 'Refresh'){
            window.location.reload();
            this.setState({show : false});
        }
        
        
    }
    handleShow = () => {this.setState({show : true})};

    render() {
        return (
            <div className = 'container'>
                <Modal
                    show={this.state.show}
                    onHide={this.handleClose}
                    backdrop="static"
                    keyboard={false}
                >                    
                    <Modal.Body>
                    <Row>
                        <Col>
                        </Col>
                        <img className = 'metamaskPhoto' src={MetamaskLogo} alt="meta mask logo" />
                        <Col>
                        </Col>
                        <h5 className = 'display-lineBreak' style={{textAlign: 'center'}}>
                            {this.props.message}
                        </h5>

                    </Row>


                    </Modal.Body>
                    
                    <Modal.Footer>
                        <Button variant="primary" onClick={this.handleClose}>
                        {this.props.buttonName}
                        </Button>
                    </Modal.Footer>
                </Modal>
            </div>
        );
    }
}
 
export default ModalForm;