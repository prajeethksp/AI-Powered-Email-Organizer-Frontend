import React, { useState } from 'react';

const ComposeEmail = () => {
  const [recipient, setRecipient] = useState('');
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');

  const handleSubmit = (event) => {
    event.preventDefault();
    // Example: Send email logic here
    console.log('Sending email:', { recipient, subject, body });
    // Replace with actual API call to send email
  };

  return (
    <div>
      <h2>Compose Email</h2>
      <form onSubmit={handleSubmit}>
        <label>
          To:
          <input type="text" value={recipient} onChange={(e) => setRecipient(e.target.value)} />
        </label>
        <label>
          Subject:
          <input type="text" value={subject} onChange={(e) => setSubject(e.target.value)} />
        </label>
        <label>
          Body:
          <textarea value={body} onChange={(e) => setBody(e.target.value)} />
        </label>
        <button type="submit">Send</button>
      </form>
    </div>
  );
};

export default ComposeEmail;
