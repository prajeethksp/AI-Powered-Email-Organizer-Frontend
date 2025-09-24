import React from 'react';
import { Modal, Button, Form, Input } from 'semantic-ui-react';

const ReplyModal = ({ open, onClose, to }) => {
  return (
    <Modal open={open} onClose={onClose} size='large'>
      <Modal.Header>Reply Email</Modal.Header>
      <Modal.Content>
        <Form>
          <Form.Field>
            <label>To:</label>
            <Input value={to} readOnly />
          </Form.Field>
          <Form.Field>
            <label>Message:</label>
            <textarea rows={10} placeholder='Write your reply...' />
          </Form.Field>
        </Form>
      </Modal.Content>
      <Modal.Actions>
        <Button color='black' onClick={onClose}>
          Cancel
        </Button>
        <Button
          content="Send"
          labelPosition='right'
          icon='send'
          onClick={() => {
            // Handle send reply logic here
            onClose(); // Close modal after sending reply
          }}
          positive
        />
      </Modal.Actions>
    </Modal>
  );
};

export default ReplyModal;
