import React from 'react';
import MessagesHeader from './MessagesHeader';
import MessageForm from './MessageForm';
import {Segment, Comment, FeedExtra} from 'semantic-ui-react';
import firebase from '../../firebase';
import Message from './Message';
import {connect} from 'react-redux';
import {setUserPosts} from '../../actions';
import Typing from './Typing';

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
        isChannelStarred: false,
        usersRef: firebase.database().ref('users'),
        typingRef: firebase.database().ref('typing'),
        typingUsers: [],
        connectedRef: firebase.database().ref('.info/connected')
    }

    componentDidMount(){

        if(this.state.channel && this.state.user){
            this.addListeners(this.state.channel.id);
            this.addUserStarsListener(this.state.channel.id, this.state.user.uid)
        }
    }
    addUserStarsListener = (channelId, userId) => {
        this.state.usersRef
        .child(userId)
        .child('starred')
        .once('value')
        .then(data => {
            if(data.val() !== null){
                const channelIds = Object.keys(data.val());
                const prevStarred = channelIds.includes(channelId);
                this.setState({ isChannelStarred : prevStarred});
            }
        })
    }

    displayChannelName = channel => {
        return channel ? `${this.state.privateChannel ? '@' : '#'}${channel.name}` : '';
    }

    addListeners = channelId => {
        this.addMessageListener(channelId);
        this.addTypingListeners(channelId);
    }

    addTypingListeners = channelId => {
        let typingUsers = [];
        this.state.typingRef.child(channelId).on('child_added', snap => {
            if(snap.key !== this.state.user.uid){
                typingUsers = typingUsers.concat({
                    id: snap.key,
                    name: snap.val()
                })
                this.setState({typingUsers});
            }
        })

        this.state.typingRef.child(channelId).on('child_removed', snap => {
            const index = typingUsers.findIndex(user => user.id === snap.key);
            if(index !== -1){
                typingUsers = typingUsers.filter(user => user.id !== snap.key);
                this.setState({typingUsers});
            }
        })

        this.state.connectedRef.on('value', snap => {
            if(snap.val() === true){
                this.state.typingRef
                .child(channelId)
                .child(this.state.user.uid)
                .onDisconnect()
                .remove(err => {
                    if(err !== null){
                        console.error(err);
                    }
                })
            }
        })
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
            this.countUserPosts(loadedMessages);
        })
        
    }

    getMessagesRef = () => {
        const {messagesRef, privateMessagesRef, privateChannel} = this.state;
        return privateChannel ? privateMessagesRef : messagesRef;
    }

    handleStar = () => {
        this.setState(prevState => ({
            isChannelStarred: !prevState.isChannelStarred
        }), () => this.starChannel());
    }

    starChannel = () => {
        if (this.state.isChannelStarred){
            this.state.usersRef
            .child(`${this.state.user.uid}/starred`)
            .update({
                [this.state.channel.id]: {
                    name: this.state.channel.name,
                    details: this.state.channel.details,
                    createdBy: {
                        name: this.state.channel.createdBy.name,
                        avatar: this.state.channel.createdBy.avatar
                    }
                }
            })
        } else {
           this.state.usersRef
           .child(`${this.state.user.uid}/starred`)
           .child(this.state.channel.id)
           .remove(err => {
               if(err !== null) {
                   console.error(err);
               }
           })
        }
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

    countUserPosts = messages => {
        let userPosts = messages.reduce((acc, message) => {
            if(message.user.name in acc){
                acc[message.user.name].count += 1;
            } else {
                acc[message.user.name] = {
                    avatar: message.user.avatar,
                    count: 1
                }
            }
            return acc;
        }, {} );
        this.props.setUserPosts(userPosts);
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

    displayTypingUsers = users => (
        users.length > 0 && users.map(user => (
            <div style={{display: 'flex', alignItems: 'center', marginBottom: '0.2em'}} key={user.id}>
                <span className="user_typing">{user.name} is typing</span><Typing />
            </div>
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
                isPrivateChannel={this.state.privateChannel}
                handleStar={this.handleStar}
                isChannelStarred={this.state.isChannelStarred} />
                <Segment>
                    <Comment.Group className="messages">
                    {this.state.searchTerm ? this.displayMessages(this.state.searchResults) : this.displayMessages(this.state.messages)}
                    {this.displayTypingUsers(this.state.typingUsers)}
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

export default connect(null, {setUserPosts})(Messages);