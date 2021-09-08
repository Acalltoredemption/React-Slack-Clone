import React from 'react';
import { Menu, Icon, Modal, Form, Input, Button } from 'semantic-ui-react';
import firebase from '../../firebase';
import {connect} from 'react-redux';
import {setCurrentChannel} from '../../actions';

class Channels extends React.Component {
    state = {
        channels: [],
        modal: false,
        channelName: '',
        channelDetails: '',
        channelsRef: firebase.database().ref('channels'),
        user: this.props.currentUser,
        firstLoad: true,
        activeChannel: ''
    };

    componentDidMount(){
        this.addListeners();
    }

    componentWillUnmount(){
        this.removeListeners();
    }
    removeListeners = () => {
        this.state.channelsRef.off();
    }
    addListeners = () => {
        let loadedChannels = [];
        this.state.channelsRef.on('child_added', snap => {
            loadedChannels.push(snap.val());
            this.setState({channels: loadedChannels}, () => this.setFirstChannel());
        })
    }

    setFirstChannel = () => {
        const firstChannel = this.state.channels[0];
        if (this.state.firstLoad && this.state.channels.length > 0){
            this.props.setCurrentChannel(firstChannel);
            this.setActiveChannel(firstChannel);
        }
        this.setState({firstLoad: false});
    }

    addChannel = () => {
        const {channelsRef} = this.state;

        const key = channelsRef.push().key;

        const newChannel = {
            id: key,
            name: this.state.channelName,
            details: this.state.channelDetails,
            createdBy: {
                name: this.state.user.displayName,
                avatar: this.state.user.photoURL
            }
        };

        channelsRef
        .child(key)
        .update(newChannel)
        .then(() => {
            this.setState({channelName: '', channelDetails: ''});
            this.closeModal();
            console.log('channel added');
        })
        .catch(err => {
            console.error(err);
        })
    }

    handleSubmit = event => {
        event.preventDefault();
        if (this.isFormValid(this.state)){
            this.addChannel();
        }
    }

    isFormValid = ({channelName, channelDetails}) => channelName && channelDetails;

    handleChange = event => {
        this.setState({ [event.target.name]: event.target.value})
    }
    setActiveChannel = channel => {
        this.setState({activeChannel: channel.id});
    }

    changeChannel = channel => {
        this.setActiveChannel(channel);
        this.props.setCurrentChannel(channel);

    }
    displayChannels = channels => 
        channels.length > 0 && channels.map(channel => (
            <Menu.Item
            key={channel.id}
            onClick={() => this.changeChannel(channel)}
            name={channel.name}
            style={{opacity: 0.8}}
            active={channel.id === this.state.activeChannel}>
                #{channel.name}

            </Menu.Item>
        ))
    

    openModal = () => this.setState({modal: true})

    closeModal = () => this.setState({modal: false})
    render(){
        const {channels} = this.state;
    return (    
        <React.Fragment>
        <Menu.Menu className="menu">
        <Menu.Item>
        <span>
        <Icon name="exchange" /> CHANNELS
        </span> {" "}
        ({channels.length}) <Icon name="add" onClick={this.openModal}/>
        </Menu.Item>
        {this.displayChannels(channels)}
        </Menu.Menu>

        <Modal basic open={this.state.modal} onClose={this.closeModal}>
            <Modal.Header>Add a Channel</Modal.Header>
            <Modal.Content>
                <Form onSubmit={this.handleSubmit}>
                    <Form.Field>
                        <Input 
                        fluid
                        label="Name of Channel"
                        name="channelName"
                        onChange={this.handleChange}
                        />
                    </Form.Field>
                    <Form.Field>
                        <Input 
                        fluid
                        label="About the Channel"
                        name="channelDetails"
                        onChange={this.handleChange}
                        />
                    </Form.Field>
                </Form>
            </Modal.Content>

            <Modal.Actions>
            <Button color="green" inverted onClick={this.handleSubmit}>
                <Icon name="checkmark" />Add
            </Button>
            <Button color="red" inverted onClick={this.closeModal}>
                <Icon name="remove" />Cancel
            </Button>
            </Modal.Actions>
        </Modal>
        </React.Fragment>

    )
    }
}

export default connect(null, {setCurrentChannel})(Channels);