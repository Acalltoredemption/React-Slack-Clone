import React from 'react';
import {Segment, Button, Input} from 'semantic-ui-react';
import firebase from '../../firebase';
import FileModal from './FileModal';
class MessageForm extends React.Component {

    state = {
        message: '',
        loading: false,
        channel: this.props.currentChannel,
        user: this.props.currentUser,
        errors: [],
        modal: false
    };

    openModal = () => this.setState({ modal: true});
    closeModal = () => this.setState({ modal: false});

    handleChange = event => {
        this.setState({ [event.target.name]: event.target.value })
    }
    createMessage = () => {
        const message = {
            content: this.state.message,
            timestamp: firebase.database.ServerValue.TIMESTAMP,
            user: {
                id: this.state.user.uid,
                name: this.state.user.displayName,
                avatar: this.state.user.photoURL
            }
        };
        return message;
    }

    sendMessage = () => {
        const {messagesRef} = this.props;
        const {message, channel} = this.state;
        if(message){
            this.setState({loading: true})
            messagesRef
            .child(channel.id)
            .push()
            .set(this.createMessage())
            .then(() => {
                this.setState({loading: false, message: '', errors: []})
            })
            .catch(err => {
                console.error(err);
                this.setState({
                    loading: false,
                    errors: this.state.errors.concat(err)
                })
            })
        } else {
            this.setState({
                errors: this.state.errors.concat({message: 'Add a message'})
            })
        }
    }

    uploadFile = (file, metadata) => {
        console.log(file, metadata);
    }
    render(){
        const {errors} = this.state;
        return(
            <Segment className="message__form">
                <Input
                fluid
                value={this.state.message}
                name="message"
                onChange={this.handleChange}
                style={{marginBottom: '0.7em'}}
                label={<Button icon={'add'}/>}
                labelPosition="left"
                className={
                    errors.some(error => error.message.includes('message')) ? 'error' : ''
                }
                placeholder="Write your message" />

                <Button.Group icon widths="2">
                    <Button 
                    onClick={this.sendMessage}
                    color="orange"
                    content="Add Reply"
                    labelPosition="left"
                    icon="edit"
                    />
                    <Button
                    color="teal"
                    onClick={this.openModal}
                    content="Upload Media"
                    disabled={this.state.loading}
                    labelPosition="right"
                    icon="cloud upload"
                    />
                    <FileModal
                    modal={this.state.modal}
                    closeModal={this.closeModal}
                    uploadFile={this.uploadFile} />
                </Button.Group>
            </Segment>
        )
    }
}

export default MessageForm;