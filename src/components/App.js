import React from 'react';
import './App.css';
import {Grid} from 'semantic-ui-react';
import {connect} from 'react-redux';
import ColorPanel from './ColorPanel/ColorPanel';
import SidePanel from './SidePanel/SidePanel';
import Messages from './Messages/Messages';
import MetaPanel from './MetaPanel/MetaPanel';

const App = ({currentUser, currentChannel, isPrivateChannel, userPosts}) => {
  return(
  <Grid columns="equal" className="app" style={{background: '#eee'}}>
    <ColorPanel 
    key={currentUser && currentUser.name}
    currentUser={currentUser} />
    <SidePanel 
    key={currentUser && currentUser.id}
    currentUser={currentUser} />

    <Grid.Column style={{marginLeft: 320}}>
    <Messages
    key={currentChannel && currentChannel.id}
    currentChannel={currentChannel}
    currentUser={currentUser}
    isPrivateChannel={isPrivateChannel} />
    </Grid.Column>

    <Grid.Column width={4}>
    <MetaPanel
    userPosts={userPosts}
    currentChannel={currentChannel}
    key={currentChannel && currentChannel.id}
    isPrivateChannel={isPrivateChannel} />
    </Grid.Column>
  </Grid>
  );
}

const mapStateToProps = state => ({
  currentUser: state.user.currentUser,
  currentChannel: state.channel.currentChannel,
  isPrivateChannel: state.channel.isPrivateChannel,
  userPosts: state.channel.userPosts
})

export default connect(mapStateToProps)(App);
