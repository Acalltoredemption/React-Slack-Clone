import React from 'react';
import {Menu} from 'semantic-ui-react';
import Channels from './Channels';
import UserPanel from './UserPanel';
import DirectMessages from './DirectMessages';
import Starred from './Starred';

class SidePanel extends React.Component {
    render(){
        const {currentUser, primaryColor} = this.props;
        return(
            <Menu size="large"
            inverted
            fixed="left"
            vertical
            style={{background: primaryColor, fontsize: '1.2em'}}>

            <UserPanel primaryColor={primaryColor} currentUser={currentUser}/>
            <Starred currentUser={currentUser} />
            <Channels currentUser={currentUser} />
            <DirectMessages currentUser={currentUser} />
            </Menu>
        )
    }
}

export default SidePanel;