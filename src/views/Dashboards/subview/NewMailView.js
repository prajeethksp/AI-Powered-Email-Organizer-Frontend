import React, { Component } from 'react';
import Editor from '../../../components/Editor.js';
import 'react-quill/dist/quill.snow.css';
import { Input, Form, Grid, GridColumn } from 'semantic-ui-react';
import { GlobalContext } from '../../../Context/GlobalContext.js';

export default class NewMailView extends Component {
  static contextType = GlobalContext;

  constructor(props) {
    super(props);
    if (props.email) {
      const payload = props.email.payload;
      const from = props.email?.payload?.headers?.find(
        (e) => e.name.toUpperCase() === 'FROM'
      )?.value?.replaceAll('"', '');
      const to = props.email?.payload?.headers?.find(
        (e) => e.name.toUpperCase() === 'DELIVERED-TO' || e.name.toUpperCase() === 'TO'
      )?.value?.replaceAll('"', '');

      const subject = props.email?.payload?.headers?.find(
        (e) => e.name.toUpperCase() === 'SUBJECT'
      )?.value;
      const receivedDate = props.email?.payload?.headers?.find(
        (e) => e.name.toUpperCase() === 'DATE'
      )?.value;
      const body = this.findEmailBody(payload);

      const decodedBody = Buffer.from(body, 'base64').toString('utf-8');
      this.state = {
        emailContent: decodedBody,
        subject: subject,
        to: to,
        receivedDate: receivedDate,
      };
    }
  }

  state = {
    emailContent: '',
    to: '',
    cc: '',
    bcc: '',
    subject: '',
  };
  componentDidMount(){
    const {dashboardState, setDashboardState} =this.context
    const {selectedEmail, currentView} = dashboardState
    const payload = selectedEmail.payload;
    const from = selectedEmail.payload?.headers?.find(e => e.name.toUpperCase() === 'FROM')?.value?.replaceAll('"', '');
    const to = selectedEmail?.payload?.headers?.find(e => e.name.toUpperCase() === 'TO' || e.name.toUpperCase() === 'TO')?.value?.replaceAll('"', ''); // Assuming 'To' is the correct header to fetch the recipient email
    const cc = selectedEmail?.payload?.headers?.find(e => e.name.toUpperCase() === 'CC')?.value?.replaceAll('"', ''); // Assuming 'To' is the correct header to fetch the recipient email
    const bcc = selectedEmail?.payload?.headers?.find(e => e.name.toUpperCase() === 'BCC')?.value?.replaceAll('"', ''); // Assuming 'To' is the correct header to fetch the recipient email

    const subject = selectedEmail?.payload?.headers?.find(e => e.name.toUpperCase() === 'SUBJECT')?.value;
    const receivedDate = selectedEmail?.payload?.headers?.find(e => e.name.toUpperCase() === 'DATE')?.value;
    const body = this.findEmailBody(payload);
    const decodedBody = Buffer.from(body, 'base64').toString('utf-8');

    setDashboardState({showSidebar: false})
    if(currentView ==='draft'){
      setDashboardState({emailToSend: {
        threadId: selectedEmail.threadId, // If threadId => reply to email
        _id: selectedEmail._id,
        draftId: selectedEmail.draftId, // google id for drafts
        to: to,
        cc: cc,
        bcc: bcc,
        subject: subject,
        emailContent: decodedBody
        }})
    }

  } 

  findEmailBody = (payload) => {
    if (payload?.body.size > 0) {
      return payload?.body.data;
    }
    else if (payload?.parts && payload?.parts.length > 0) {
      const nextPayload = payload?.parts.find(e => e["mimeType"] === "text/html") || payload?.parts.find(e => e["mimeType"] === "text/plain") || payload?.parts.find(e => e["mimeType"].includes("multipart"))
      return this.findEmailBody(nextPayload);
    }   else {
      return '';
    }
  }

  render() {    
    
    const {dashboardState, setDashboardState, saveDraft} =this.context
    const {emailToSend, showSidebar} = dashboardState

    const { emailContent = '', to = '', cc = '', bcc = '', subject = '' } =  emailToSend;
    return (
      <div style={{paddingLeft: showSidebar ? '5em': '0'}}>
        <Form>
          <Form.Field>
            <Grid columns={'equal'}>
              <GridColumn width={2}>
                <label>To:</label>
              </GridColumn>
              <GridColumn>
                <Input
                  value={to}
                  onChange={(e) => {
                    
                    setDashboardState({
                      emailToSend: {
                        ...emailToSend,
                        to: e.target.value
                      }
                    }, () => {  saveDraft() })
                

                  }
                }
                  style={{ paddingRight: '30px', paddingBottom: '30px' }}
                />
              </GridColumn>
            </Grid>
          </Form.Field>
          <Form.Field>
            <Grid columns={'equal'}>
              <GridColumn width={2}>
                <label>Cc:</label>
              </GridColumn>
              <GridColumn>
                <Input
                  value={cc}
                  onChange={(e) => {
                    setDashboardState({
                      emailToSend: {
                        ...emailToSend,
                        cc: e.target.value
                      }
                    }, () => {  saveDraft() })
                    
                  }
                }
                  style={{ paddingRight: '30px', paddingBottom: '30px' }}
                />
              </GridColumn>
            </Grid>
          </Form.Field>
          <Form.Field>
            <Grid columns={'equal'}>
              <GridColumn width={2}>
                <label>Bcc:</label>
              </GridColumn>
              <GridColumn>
                <Input
                  value={bcc}
                  onChange={(e) => {
                    setDashboardState({
                      emailToSend: {
                        ...emailToSend,
                        bcc: e.target.value                     
                       }
                    }, () => {  saveDraft() })
                   
                  }
                }
                  style={{ paddingRight: '30px', paddingBottom: '30px' }}
                />
              </GridColumn>
            </Grid>
          </Form.Field>
          <Form.Field>
            <Grid columns={'equal'}>
              <GridColumn width={2}>
                <label>Subject:</label>
              </GridColumn>
              <GridColumn>
                <Input
                  value={subject}
                  onChange={(e) => {
                    setDashboardState({
                      emailToSend: {
                        ...emailToSend,
                        subject: e.target.value                  
                       }
                    }, () => {  saveDraft() })
                   
                  }
                }
                  style={{ paddingRight: '30px', paddingBottom: '30px' }}
                />
              </GridColumn>
            </Grid>
          </Form.Field>
        </Form>
        <br />
        <Editor  />
      </div>
    );
  }
}
