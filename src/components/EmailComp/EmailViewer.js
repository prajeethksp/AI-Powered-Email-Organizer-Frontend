import React, { Component,useContext } from 'react';
import { Button, Container, Grid, GridColumn, Label } from 'semantic-ui-react';
import ReplyModal from '../ReplyModal/ReplyModal'; // Adjust the path as per your actual folder structure
import { GlobalContext } from '../../Context/GlobalContext';
import { BACKEND_URL } from '../../constants';

class EmailViewer extends Component {
  static contextType = GlobalContext;
  constructor(props) {
    super(props);
  
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
  componentDidMount(){
    setTimeout(()=> {this.readEmail()}, 5000)
  }

 readEmail = async () => {
  const {dashboardState, setDashboardState} =this.context
  const {selectedEmail} = dashboardState

  const {currentView} = dashboardState
  if(selectedEmail.labelIds.includes('UNREAD')){
    setDashboardState({...selectedEmail, labelIds: selectedEmail.labelIds.filter(e => e !== 'UNREAD')})
  let emails = Object.assign({}, dashboardState[`${currentView}Emails`])
  for(const key in emails){

    emails[key] = emails[key].map(e => {
      if(emails[key].find(email => email._id === selectedEmail._id)){
        return {...e, labelIds: e.labelIds.filter( id => id !== 'UNREAD')}
      }else{
        return e
      }
    })

  
  }
  setDashboardState({
    [`${currentView}Emails`]: emails
  })
  const resp = await fetch(`${BACKEND_URL}/emails/${selectedEmail._id}`, {
      
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',

      },
      body:JSON.stringify( {
        labelIds: selectedEmail.labelIds.filter(e => e !== 'UNREAD')
      })

   

  });
  const data = await resp.json();
  console.log(data)
  }
  

 }



  render() {
    const {dashboardState, setDashboardState} =this.context
    const {selectedEmail} = dashboardState
    const payload = selectedEmail.payload;
    const from = selectedEmail.payload?.headers?.find(e => e.name.toUpperCase() === 'FROM')?.value?.replaceAll('"', '');
    const to = selectedEmail?.payload?.headers?.find(e => e.name.toUpperCase() === 'TO' || e.name.toUpperCase() === 'DELIVERED-TO'  )?.value?.replaceAll('"', ''); // Assuming 'To' is the correct header to fetch the recipient email

    const subject = selectedEmail?.payload?.headers?.find(e => e.name.toUpperCase() === 'SUBJECT')?.value;
    const receivedDate = selectedEmail?.payload?.headers?.find(e => e.name.toUpperCase() === 'DATE')?.value;
    const body = this.findEmailBody(payload);
    const decodedBody = Buffer.from(body, 'base64').toString('utf-8');

    return (
      <Container fluid style={{ paddingLeft: '5em', paddingTop: '0', right: '0' }}>
        <Grid style={{ marginBottom: '10px' }}>
          <GridColumn style={{ display: 'flex', justifyContent: 'center' }}>
            <h1>{subject}</h1>
          </GridColumn>
        </Grid>
        <Grid>
          <GridColumn width={1}>
            <Label circular color="blue" size="big" style={{ marginRight: '1em' }}>
              {from.charAt(0).toUpperCase()}
            </Label>
          </GridColumn>
          <GridColumn width={6}>
            <h3>{from}</h3>
            <small>to: {to}</small>
          </GridColumn>
          <GridColumn width={4}>
            <small>{receivedDate}</small>
          </GridColumn>
          <GridColumn width={1}>
            <Button icon='reply' onClick={() => {
              setDashboardState({currentView: 'newMail', selectedEmail: {},showSidebar: false, emailToSend: {
                threadId: selectedEmail.threadId,
                to: from,
                subject: `${subject.includes('Re: ') ? subject : 'Re: ' + subject}`,
                emailContent: `
                      <br/> 
                      <br/>

                    <p><img src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAcwAAAACCAYAAADVTuz2AAAAAXNSR0IArs4c6QAAAIRlWElmTU0AKgAAAAgABQESAAMAAAABAAEAAAEaAAUAAAABAAAASgEbAAUAAAABAAAAUgEoAAMAAAABAAIAAIdpAAQAAAABAAAAWgAAAAAAAABIAAAAAQAAAEgAAAABAAOgAQADAAAAAQABAACgAgAEAAAAAQAAAcygAwAEAAAAAQAAAAIAAAAAV54xwgAAAAlwSFlzAAALEwAACxMBAJqcGAAAAH9JREFUSA3tlkEOwCAIBOH/D/I5PKUtNXtoQ+yJTWqWi8aouMKIPsY4LrMOc3fLvbNNQ7/L35cG9nnY/qR/fQPseLD9rdXbzSEYzLnod/Eo/Xr/kGOMfGPkv0dET7UsTo/LA6BvoIolWw1J//w8Kf4TOeX/s6BsBXshRvz/n/8TgZvGwKSf11AAAAAASUVORK5CYII=" style="cursor: nwse-resize;  "></p>
                     
                      <br/> 
                      <br/>
                        <b>From:</b> ${from} <br />
                        <b>Date:</b> ${receivedDate}<br />
                        <b>To: </b> ${to}<br />
                        <b>Subject:</b> Re: ${subject}<br />
                        <br/> 
                        <br/>
                      ${decodedBody}
                    <br/> 
                    <br/>
                    <p><img src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAcwAAAACCAYAAADVTuz2AAAAAXNSR0IArs4c6QAAAIRlWElmTU0AKgAAAAgABQESAAMAAAABAAEAAAEaAAUAAAABAAAASgEbAAUAAAABAAAAUgEoAAMAAAABAAIAAIdpAAQAAAABAAAAWgAAAAAAAABIAAAAAQAAAEgAAAABAAOgAQADAAAAAQABAACgAgAEAAAAAQAAAcygAwAEAAAAAQAAAAIAAAAAV54xwgAAAAlwSFlzAAALEwAACxMBAJqcGAAAAH9JREFUSA3tlkEOwCAIBOH/D/I5PKUtNXtoQ+yJTWqWi8aouMKIPsY4LrMOc3fLvbNNQ7/L35cG9nnY/qR/fQPseLD9rdXbzSEYzLnod/Eo/Xr/kGOMfGPkv0dET7UsTo/LA6BvoIolWw1J//w8Kf4TOeX/s6BsBXshRvz/n/8TgZvGwKSf11AAAAAASUVORK5CYII=" width="819" style="cursor: nwse-resize;"></p>

                `,
                
                
              }})
            }} />
          </GridColumn>
        </Grid>
        <div style={{ background: 'white', height: '40rem', overflow: 'auto', padding: '5em' }} dangerouslySetInnerHTML={{ __html: decodedBody }} />

       
      </Container>
    );
  }
}

export default EmailViewer;
