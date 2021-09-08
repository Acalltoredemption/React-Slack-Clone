import React from 'react';
import {Menu} from 'semantic-ui-react';
import Channels from './Channels';
import UserPanel from './UserPanel';
import DirectMessages from './DirectMessages';

class SidePanel extends React.Component {
    render(){
        const {currentUser} = this.props;
        return(
            <Menu size="large"
            inverted
            fixed="left"
            vertical
            style={{background: '#4c3c4c', fontsize: '1.2em'}}>

            <UserPanel currentUser={currentUser}/>
            <Channels currentUser={currentUser} />
            <DirectMessages currentUser={currentUser} />
            </Menu>
        )
    }
}

export default SidePanel;