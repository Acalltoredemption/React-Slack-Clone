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
        messagesLoading: true,
        numUniqueUsers: ''
    }

    componentDidMount(){
        if(this.state.channel && this.state.user){
            this.addListeners(this.state.channel.id);
        }
    }

    displayChannelName = channel => channel ? `${channel.name}` : ''

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
            });
            this.countUniqueUsers(loadedMessages);
        })
        
    }

    countUniqueUsers = messages => {
        const uniqueUsers = messages.reduce((acc, message) => {
            if(!acc.includes(message.user.name)) {
                acc.push(message.user.name);
            }
            return acc;
        }, []);
        const plural = uniqueUsers.length > 1 || uniqueUsers.length === 0;
        const numUniqueUsers = `${uniqueUsers.length} user${plural ? "s" : ''}`;
        this.setState({numUniqueUsers})
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
                <MessagesHeader
                channelName={this.displayChannelName(this.state.channel)}
                numUniqueUsers={this.state.numUniqueUsers} />
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