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
        numUniqueUsers: '',
        searchTerm: '',
        searchLoading: false,
        searchResults: [],
        privateChannel: this.props.isPrivateChannel,
        privateMessagesRef: firebase.database().ref('privateMessages'),
    }

    componentDidMount(){
        if(this.state.channel && this.state.user){
            this.addListeners(this.state.channel.id);
        }
    }

    displayChannelName = channel => {
        return channel ? `${this.state.privateChannel ? '@' : '#'}${channel.name}` : '';
    }

    addListeners = channelId => {
        this.addMessageListener(channelId)
    }

    addMessageListener = channelId => {
        let loadedMessages = [];
        const ref = this.getMessagesRef();
        ref.child(channelId).on('child_added', snap => {
            loadedMessages.push(snap.val());
            this.setState({
                messages: loadedMessages,
                messagesLoading: false
            });
            this.countUniqueUsers(loadedMessages);
        })
        
    }

    getMessagesRef = () => {
        const {messagesRef, privateMessagesRef, privateChannel} = this.state;
        return privateChannel ? privateMessagesRef : messagesRef;
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

    handleSearchChange = event => {
        this.setState({
            searchTerm: event.target.value,
            searchLoading: true
        }, () => this.handleSearchMessages());
    }

    handleSearchMessages = () => {
        const channelMessages = [...this.state.messages];
        const regex = new RegExp(this.state.searchTerm, 'gi');
        const searchResults = channelMessages.reduce((acc, message) => {
            if(message.content && message.content.match(regex) || message.user.name.match(regex)){
                acc.push(message);
            }
            return acc;
        },  []);
        this.setState({searchResults});
        setTimeout(() =>this.setState({ searchLoading: false}), 1000);
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
                numUniqueUsers={this.state.numUniqueUsers}
                handleSearchChange={this.handleSearchChange}
                searchLoading={this.state.searchLoading}
                isPrivateChannel={this.state.privateChannel} />
                <Segment>
                    <Comment.Group className="messages">
                    {this.state.searchTerm ? this.displayMessages(this.state.searchResults) : this.displayMessages(this.state.messages)}
                    </Comment.Group>
                </Segment>

                <MessageForm
                messagesRef={this.state.messagesRef}
                currentChannel={this.state.channel}
                currentUser={this.state.user}
                isPrivateChannel={this.state.privateChannel}
                getMessagesRef={this.getMessagesRef} />
            </React.Fragment>
        )
    }
}

export default Messages;