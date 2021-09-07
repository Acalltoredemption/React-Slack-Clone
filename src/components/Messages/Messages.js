import React from 'react';
import MessagesHeader from './MessagesHeader';
import MessageForm from './MessageForm';
import {Segment, Comment} from 'semantic-ui-react';
import firebase from '../../firebase';
import Message from './Message';

class Messages extends React.Component {
    state = {
        messagesRef: firebase.database().ref('messages'),
        channel: this.props.currentChannel,
        user: this.props.currentUser,
        messages: [ ],
        messagesLoading: true
    }

    componentDidMount(){
        if(this.state.channel && this.state.user){
            this.addListeners(this.state.channel.id);
        }
    }

    addListeners = channelId => {
        this.addMessageListener(channelId)
    }

    addMessageListener = channelId => {
        let loadedMessages = [];
        this.state.messagesRef.child(channelId).on('child_added', snap => {
            loadedMessages.push(snap.val());
            this.setState({
                messages: loadedMessages,
                messagesLoading: false
            })
        })
        
    }

    displayMessages = messages => (
        messages.length > 0 && messages.map(message => (
            <Message
            key={message.timestamp}
            message={message}
            user={this.state.user} />
        ))
    )
    render(){
        return(
            <React.Fragment>
                <MessagesHeader />
                <Segment>
                    <Comment.Group className="messages">
                    {this.displayMessages(this.state.messages)}
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