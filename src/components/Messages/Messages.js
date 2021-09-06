import React from 'react';
import MessagesHeader from './MessagesHeader';
import MessageForm from './MessageForm';
import {Segment, Comment} from 'semantic-ui-react';
import firebase from '../../firebase';

class Messages extends React.Component {
    state = {
        messagesRef: firebase.database().ref('messages'),
        channel: this.props.currentChannel,
        user: this.props.currentUser
    }
    render(){
        return(
            <React.Fragment>
                <MessagesHeader />
                <Segment>
                    <Comment.Group className="messages">

                    </Comment.Group>
                </Segment>

                <MessageForm
                messagesRef={this.state.messagesRef}
                currentChannel={this.state.channel}
                currentUser={this.state.user} />
            </React.Fragment>
        )
    }
}

export default Messages;