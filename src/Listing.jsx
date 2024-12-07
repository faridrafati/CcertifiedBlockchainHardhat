import './Listing.css';
import {List, ListItem, ListItemText} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import React, { Component } from 'react';

class Listing extends Component {
    render() { 
        let {taskText,onClick} = this.props;
        return (
            <List className='todo_list'>
                <ListItem>
                    <ListItemText primary = {taskText}/>
                </ListItem>
                <DeleteIcon fontSize='large' style={{opacity:0.7}} onClick={onClick}></DeleteIcon>
            </List>
        );
    }
}
 
export default Listing;

