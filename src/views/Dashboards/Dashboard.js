import './Dashboard.css';
import {
  SidebarPusher,
  SidebarPushable,
  MenuItem,
  GridColumn,
  Checkbox,
  Grid,
  Header,
  Icon,
  Image,
  Menu,
  Segment,
  Sidebar,
  Container,
  Button,
  Modal,
  Dropdown,
  Input,
  Form,
  List
} from 'semantic-ui-react';

import React, { Component, createContext } from 'react';
import NewMailView from './subview/NewMailView';
import GoogleAuthButton from '../../components/GoogleAuth/GoogleAuthButton';
import { BACKEND_URL, currentUser } from '../../constants';
import DashboardMenu from '../../components/Dashboard/DashboardMenu';
import EmailList from '../../components/EmailComp/EmailList';
import EmailViewer from '../../components/EmailComp/EmailViewer';
import {  toast, Bounce } from 'react-toastify';
import { displayName } from 'react-quill';
import { GlobalContext } from '../../Context/GlobalContext';


export default class Dashboard extends Component {
  state = {
    showSidebar: true,
    currentView: 'inbox',
    searchQuery: '',
    selectedEmail: {},
    selectedEmails: [],
    inboxEmails: [],
    draftEmails: [],
    sentEmails: [],
    isSyncing: false,
    inboxFetching: false,
    draftFetching: false,
    sentFetching: false,
    showCategorizeModal: false,
    tags: [],
    selectedTag: '',
    showManageTagsModal: false,
    newTagName: '',
    newTagColor: 'red',
    emailToSend: {},
    draftTimeoutIds: [],
    isSendingEmail: false,

  }

  componentDidMount = async  () => {
    this.fetchTags(); // Fetch tags on component mount
    const queries = ['in:inbox', 'in:sent', 'in:draft'];

    await Promise.all(queries.map(query => this.fetchUserEmail( query)));

  }
  deleteMail = async (id = null) => {
    const {selectedEmail, selectedEmails, currentView} = this.state
    const emailIds = selectedEmail._id ?  [selectedEmail._id] : selectedEmails
    let emails = Object.assign({}, this.state[`${currentView}Emails`])
    for(const key in emails){

      emails[key] = emails[key].filter(e => !emailIds.includes(e._id) )
      
    }
    
    this.setState({
      [`${currentView}Emails`]: emails,
      currentView: this.state.currentView,
      selectedEmail: {},
      selectedEmails: []
    })

    const resp = await fetch(`${BACKEND_URL}/emails/`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',

      },
      body: JSON.stringify({
        ids: selectedEmail._id ?  [selectedEmail._id] : selectedEmails,
        userId: currentUser()?._id
      }),

    });

    const data = await resp.json()

    if(data.success){
      toast.dismiss();    
      toast.success( data.success, {
        position: "top-right",
        autoClose: 2000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "light",
        transition: Bounce,
    
        });
    }else{
      toast.dismiss();    
      toast.error( data.error, {
        position: "top-right",
        autoClose: 2000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "light",
        transition: Bounce,
    
        });
    }

  }

  fetchUserEmail = async (q)=>{
    const type = q.split(':').at(-1)
    this.setState({[`${type}Fetching`]: true})
    const resp = await fetch(`${BACKEND_URL}/emails/?userId=${currentUser()?._id}&q=${q}`);
    const data = await resp.json();
    this.setState({[`${type}Fetching`]: false, [`${type}Emails`]: data.emails});
    

    console.log(q, data.emails);
  }
  syncEmails = async () =>{
    this.setState({isSyncing: true})
    const resp = await fetch(`${BACKEND_URL}/emails/sync/?userId=${currentUser()?._id}`)
    const data = await resp.json()
    this.setState({isSyncing: false})

    if(data.success){
      toast.dismiss();    
      toast.success( 'Sync Complete', {
          position: "top-right",
          autoClose: 2000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
          theme: "light",
          transition: Bounce,
          onOpen: () => setTimeout(() => {
            window.location.reload();
            }, 2500)
      
          });
    }else{
      toast.dismiss();    
      toast.error( data.error, {
          position: "top-right",
          autoClose: 2000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
          theme: "light",
          transition: Bounce,
      
          });
    }
  }

  sendEmail = async ()=> {
    this.setState({isSendingEmail: true})
    const {emailToSend}= this.state
    console.log(emailToSend)
    const body = {
      emailToSend: emailToSend,
      userId: currentUser()?._id
    }
    try{
      const send_url = emailToSend.draftId ? `${BACKEND_URL}/emails/send-draft` :  `${BACKEND_URL}/emails`
      const resp = await fetch(send_url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
  
        },
        body: JSON.stringify(body),
  
      })
      const data = await resp.json()

      if(data._id){

        let sentEmails = this.state.sentEmails
        let existingThread = sentEmails[data.threadId]
        delete sentEmails[data.threadId]
       
        sentEmails = { [data.threadId]: existingThread ? [data, ...existingThread ] : [data], ...sentEmails} ;
        this.setState({
          currentView: 'sent', 
          emailToSend: {}, 
          sentEmails: sentEmails, 
          selectedEmail: {}
        })
        toast.dismiss();    
        toast.success( 'Your email was successfully sent', {
            position: "top-right",
            autoClose: 2000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            progress: undefined,
            theme: "light",
            transition: Bounce,
        
            });
          console.log(data)
         
        
        
          if(emailToSend.draftId){ // remove draft from the draft list
          let emails =Object.assign({}, this.state.draftEmails) 
          for(const key in emails){
            const foundDraft = emails[key].find(e => e.draftId === emailToSend.draftId)
            if(foundDraft){
              emails[key] = emails[key]?.filter(e => e.draftId !== emailToSend.draftId)
              this.setState({draftEmails: emails})
              break;
            }
          }

  
        }
       
  
      }else{
        toast.dismiss()
        toast.error( 'Could not send the email', {
          position: "top-right",
          autoClose: 2000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
          theme: "light",
          transition: Bounce,
      
          });
      }
      this.setState({isSendingEmail: false})

    }catch(err){
      console.log(err, '******')
      toast.dismiss()
      toast.error( 'Email is too large!', {
        position: "top-right",
        autoClose: 2000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "light",
        transition: Bounce,
    
        });
        this.setState({isSendingEmail: false})

    }
   

    

  }
  
  fetchTags = async () => {
    try {
      const resp = await fetch(`${BACKEND_URL}/tags/?userId=${currentUser()?._id}`);
      const data = await resp.json();
      this.setState({ tags: data });
    } catch (error) {
      console.error('Error fetching tags:', error);
    }
  }

  deleteTag  = async (tagId) => {
  
   
    
    this.setState({tags: this.state.tags.filter(e => e._id != tagId)}, ()=>{
      for(const view of ['inbox', 'sent', 'draft']){
        let emails =Object.assign({}, this.state[`${view}Emails`]) 
        for (const key in emails){
          emails[key] = emails[key].map(e => {
            if(e.tagIds.includes(tagId)){
              return {...e, tagIds: e.tagIds.filter( id => id !== tagId)}
            }else{
              return e
            }
      
          })
        }
        this.setState({[`${view}Emails`]: emails})
    
       }
    })
    const resp = await fetch(`${BACKEND_URL}/tags/${tagId}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',

      },
   

    })
    const data = await resp.json();
    if(data.success){


      console.log('deleted tag')
    }else{
      console.log(data.error)
    }

  }

  handleCategorizeClick = () => {
    this.setState({ showCategorizeModal: true });
  }

  handleCategorizeModalClose = () => {
    this.setState({ showCategorizeModal: false, selectedTag: '' });
  }

  handleTagChange = (e, { value }) => {
    this.setState({ selectedTag: value });
  }

  handleCategorize = async (mode) => {
    const { selectedEmail,selectedEmails, selectedTag } = this.state;
    const emailIds = selectedEmail?._id ? [selectedEmail?._id ] : selectedEmails
    let emails =Object.assign({}, this.state[`${this.state.currentView}Emails`]) 
    for( const key in emails){
      if(mode === 'add'){
        emails[key] = emails[key].map(e => {
          if(emailIds.includes(e._id)){
            console.log('add id to ', {...e, tagIds: !e.tagIds.includes(selectedTag) ? [...e?.tagIds, selectedTag]: e.tagIds})
            return {...e, tagIds: !e.tagIds.includes(selectedTag) ? [...e?.tagIds, selectedTag]: e.tagIds}
          }else{
            return e
          }
  
  
        })
      }else if (mode === 'remove'){
        emails[key] = emails[key].map(e => {
          if(emailIds.includes(e._id)){
            console.log('remove id from ',  {...e, tagIds: e.tagIds.filter( id => id !== selectedTag)})
            return {...e, tagIds: e.tagIds.filter( id => id !== selectedTag)}

          }else{
            return e
          }
 
        })
      }
     
    }    
      
    this.setState({[`${this.state.currentView}Emails`]: emails})

    try {
      const resp = await fetch(`${BACKEND_URL}/tags/add_or_remove/?mode=${mode}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          tagId: selectedTag,
          emailIds: emailIds
         })
      });
      const data = await resp.json()
      if(data.success){
        
        toast.dismiss();    
        toast.success( data.success, {
            position: "top-right",
            autoClose: 2000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            progress: undefined,
            theme: "light",
            transition: Bounce,
        
            });
      }else{
        toast.dismiss();    
        toast.error( data.errorMessages[0], {
            position: "top-right",
            autoClose: 2000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            progress: undefined,
            theme: "light",
            transition: Bounce,
        
            });
      }
      
      // Optionally, refresh emails or update local state to reflect changes
    } catch (error) {
      console.error('Error categorizing email:', error);
    }
  }

  clearAllDraftTimeouts() {
    const {draftTimeoutIds} = this.state
    draftTimeoutIds.forEach(timeoutId => clearTimeout(timeoutId));
    this.setState({draftTimeoutIds: []}) 
  }
  saveDraft= async ()=> {
    const {emailToSend, draftEmails} = this.state
    console.log('saving draft',emailToSend)

    this.clearAllDraftTimeouts()
  

    const body = {
      emailToSend: emailToSend,
      userId: currentUser()?._id
    }


    try{
      const resp = await fetch(`${BACKEND_URL}/emails/save-draft`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
  
        },
        body: JSON.stringify(body),
  
      })
      const data = await resp.json()
      if(data._id){
          console.log('saved draft')
          console.log(data)

          let emails =Object.assign({}, draftEmails)
          let found = false 
          for (const key in emails){
            if(emails[key].find(e => e._id === data?._id)){
              // console.log('updating draft here')
              found = true
              emails[key]= [{...data},...emails[key].filter(e => e._id !== data._id)]
          
              break;
            }

          }
          if(!found){
            // console.log('Adding new draft')
            emails[data.threadId] = [{...data}]
          }
          
        
          
        this.setState({
          draftEmails: emails,
          emailToSend: {
          ...this.state.emailToSend,
          draftId: data.draftId, 
          id: data.id, 
          tagIds: [],
           
        } 
        })
  
      }else{
        console.log('error saving draft')
        console.log(data)
      }
    }catch(err){
      console.log(err)
      toast.error( 'Email is too large!', {
        position: "top-right",
        autoClose: 2000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "light",
        transition: Bounce,
    
        });
    }
   
  }
  handleManageTagsClick = () => {
    this.setState({ showManageTagsModal: true });
  }

  handleManageTagsModalClose = () => {
    this.setState({ showManageTagsModal: false, newTagName: '' });
  }

  createTag = async () => {
    const { newTagName , newTagColor} = this.state;
    if (!newTagName) return;

    try {
      const response = await fetch(`${BACKEND_URL}/tags`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId: currentUser()?._id, name: newTagName, color: newTagColor }),
      });

      const newTag = await response.json();


      if(newTag._id){
        
        this.setState(prevState => ({
          tags: [newTag,...prevState.tags ],
          newTagName: '',
        }));
      }else{
        toast.dismiss();    
        toast.error( 'Could not add your tag', {
            position: "top-right",
            autoClose: 2000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            progress: undefined,
            theme: "light",
            transition: Bounce,
        
            });

      }
      
    } catch (error) {
      console.error('Error creating tag:', error);
    }
  }

  render() {
    const {
      showSidebar,
      currentView,
      selectedEmail,
      selectedEmails,
      inboxEmails,
      draftEmails,
      sentEmails,
      inboxFetching,
      draftFetching,
      sentFetching,
      showCategorizeModal,
      tags,
      selectedTag,
      showManageTagsModal,
      newTagName,
      newTagColor
    } = this.state;

    const tagOptions = tags.map(tag => ({ key: tag._id, text: tag.name, color:tag.color, value: tag._id }));

    return (
      <Container fluid>
        <DashboardMenu />

        <Grid columns={1} style={{marginTop: '-2rem'}}>
          <GridColumn>
            <Menu style={{borderRadius: '0'}}>
              <Menu.Item
                style={{color: 'black'}}
                onClick={() => this.setState({showSidebar: !showSidebar})}
              >
                <Icon name={showSidebar ? 'close' : 'bars'} />
              </Menu.Item>
              <Menu.Item>
                <Button color='blue' icon labelPosition='left'
                  onClick={() => this.setState({currentView: 'newMail', showSidebar: false, selectedEmail: {}})}
                >
                  <Icon name='edit' />
                  New Mail
                </Button>
              </Menu.Item>
              <Menu.Item
                    disabled={Object.keys(selectedEmail).length === 0 && !selectedEmails.length > 0}
                    onClick={() => this.deleteMail()}
                  >
                    <Icon name='trash' />
                    Delete
                  </Menu.Item>
              {(currentView !== 'draft' && currentView !== 'newMail') &&
                <>
                
                  <Menu.Item
                    disabled={!Object.keys(selectedEmail).length >0 && !selectedEmails.length >0}
                    onClick={this.handleCategorizeClick}
                  >
                    <Icon name='tag' />
                    Categorize by tags
                  </Menu.Item>
                  <Menu.Item
                    disabled = {this.state.isSyncing}
                    onClick={this.syncEmails}
                  >
                    <Icon name='sync'  className={ this.state.isSyncing ? 'rotate' : ''} />
                    Sync
                  </Menu.Item>
                  <Menu.Item onClick={this.handleManageTagsClick}>
                    <Icon name='tags' />
                    Manage Tags
                  </Menu.Item>
                </>
              }
              {((currentView === 'draft' && Object.keys(selectedEmail).length !== 0) || currentView === 'newMail') &&
                <Menu.Menu position='right'>
                  <Menu.Item 
                    disabled = {this.state.isSendingEmail}
                    
                    onClick={ () => this.sendEmail() }
                  >
                    <Icon name='send' loading={this.state.isSendingEmail}/>
                    Send
                  </Menu.Item>
                  <Menu.Item
                    onClick={()=> {
                      this.setState({emailToSend: {}, currentView: 'inbox', showSidebar: true})
                    }}
                  >
                    <Icon name='trash' />
                    Discard
                  </Menu.Item>
                </Menu.Menu>
              }
            </Menu>
          </GridColumn>
        </Grid>

        <Grid columns={2} style={{ height: '100vh' }}>
          <Grid.Column width={3}>
            <Sidebar
              style={{top: '8.5rem', height: '100vh'}}
              as={Menu}
              animation='scale down'
              icon='labeled'
              inverted
              vertical
              visible={showSidebar}
              width='large'
            >
              <GoogleAuthButton
                disabled={false}
                icon="google"
                color={!currentUser()?.connectedAccount ? "google plus" : ""}
                text={
                  !currentUser()?.connectedAccount ? 'Connect Gmail' : `Connected As: ${currentUser()?.connectedAccount.email}`
                }
                mode={'connectAccount'}
              />
              <MenuItem as='a'
                style={{marginTop: '50px'}}
                active={currentView === 'inbox'}
                onClick={() => this.setState({currentView: 'inbox', selectedEmail: {}, selectedEmails: []})}
              >
                <Icon name='inbox' />
                Inbox
              </MenuItem>
              <MenuItem as='a'
                active={currentView === 'sent'}
                onClick={() => this.setState({currentView: 'sent', selectedEmail: {}, selectedEmails: []})}
              >
                <Icon name='send' />
                Sent
              </MenuItem>
              <MenuItem as='a'
                active={currentView === 'draft'}
                onClick={() => this.setState({currentView: 'draft', selectedEmail: {}, selectedEmails: []})}
              >
                <Icon name='write' />
                Drafts
              </MenuItem>
            </Sidebar>
          </Grid.Column>

          <Grid.Column stretched width={showSidebar ? 13: 16}>
            <GlobalContext.Provider 
                value={{
                    dashboardState: this.state, 
                    setDashboardState: (obj, callback=null) => {
                      this.setState(obj,()=>{
                        
                        if(callback){
                          const darftTimeOutId = setTimeout(() => {
                            this.setState({draftTimeoutIds: this.state.draftTimeoutIds.filter(id => id !== darftTimeOutId)})
                            callback()
                          }, 5000);

                          this.setState({draftTimeoutIds: [...this.state.draftTimeoutIds, darftTimeOutId]})
                        }
                      })
                    }, 
                    saveDraft: ()=> this.saveDraft(),
                    fetchUserEmail: this.fetchUserEmail
                    
                    }}>

           
                <>
                  {currentView === 'draft' && Object.keys(selectedEmail).length === 0 && <EmailList q='in:draft' emails={this.state.draftEmails} selectedEmails={selectedEmails} isLoading={draftFetching} parentSetState={obj => this.setState(obj)} tags={tags}/>}
                  {currentView === 'inbox' && Object.keys(selectedEmail).length === 0 && <EmailList q='in:inbox' emails={this.state.inboxEmails}  selectedEmails={selectedEmails}   isLoading={inboxFetching} parentSetState={obj => this.setState(obj)} tags={tags} />}
                  {currentView === 'sent' && Object.keys(selectedEmail).length === 0 && <EmailList q='in:sent' emails={this.state.sentEmails}   selectedEmails={selectedEmails}  isLoading={sentFetching} parentSetState={obj => this.setState(obj)} tags={tags} />}
                  {currentView === 'newMail' && <NewMailView parentSetState ={obj => this.setState(obj)} />}
                  {Object.keys(selectedEmail).length !== 0 && currentView === 'draft' && <NewMailView email={selectedEmail}  />}
                  {Object.keys(selectedEmail).length !== 0 && currentView !== 'draft' && <EmailViewer email={selectedEmail}  />}
                </>
            </GlobalContext.Provider>
          </Grid.Column>
        </Grid>

        {/* Modal for categorizing by tags */}
        <Modal
          onClose={this.handleCategorizeModalClose}
          open={showCategorizeModal}
        >
          <Modal.Header>Categorize by Tags</Modal.Header>
          <Modal.Content>
            <Grid>
              <GridColumn width={1}>
              <Icon
                name='circle'
                style={{ color: tags.find(e => e._id === selectedTag)?.color , paddingTop: '10px'}}
              />
              </GridColumn>
              <GridColumn width={14}>
                <Dropdown
                style={{paddingLeft: '20px'}}
                  fluid
                  selection
                  search
                  floating
                  labeled
                  labelPosition="right"

                  options={tagOptions}
                  onChange={this.handleTagChange}
                  value={selectedTag}
                >
                  
                </Dropdown>
              </GridColumn>
            </Grid>
            
          </Modal.Content>
          <Modal.Actions>
            <Button color='black' onClick={this.handleCategorizeModalClose}>
              Cancel
            </Button>
            <Button
              content="Remove Tag"
              labelPosition='right'
              icon='checkmark'
              onClick={() => {
                this.handleCategorize('remove')
                this.handleCategorizeModalClose();
              }}
              negative
              disabled={!selectedTag} // Disable button when no tag is selected
            />
            <Button
              content="Add Tag"
              labelPosition='right'
              icon='checkmark'
              onClick={() => {

                this.handleCategorize('add')
                this.handleCategorizeModalClose();
              }}
              positive
              disabled={!selectedTag} // Disable button when no tag is selected
            />
          </Modal.Actions>
        </Modal>

        {/* Modal for managing tags */}
        <Modal
          onClose={this.handleManageTagsModalClose}
          open={showManageTagsModal}
        >
          <Modal.Header>Manage Tags</Modal.Header>
          <Modal.Content >
            <Container fluid style={{display: 'flex', justifyContent: 'center' }} >
              <Grid >
                <GridColumn width={14}>

                  <Input
                    icon='tags'
                    iconPosition='left'
                    label={{ tag: true, content: 'New Tag Name' }}
                    labelPosition='right'
                    placeholder='Enter tag name'
                    value={newTagName}
                    onChange={(e) => this.setState({ newTagName: e.target.value })}
                  />
                
                </GridColumn>


                <GridColumn width={1}>

                  <input 
                    type='color'
                    value={newTagColor}
                    onChange={(e) => this.setState({newTagColor: e.target.value})}
                    style={{    
                      backgroundColor: newTagColor,
                      padding: '15px',
                      border: 'none',
                      borderRadius: '50%',
                      display: 'block',
                      height: 0,
                      width: 0,
                    }}

                  />
              </GridColumn>
            </Grid>
            </Container>
           
           <Container fluid style={{
            display: 'flex', 
            justifyContent: 'center', 
            padding:'20px', 
            marginTop: '20px', 
            height: '200px', 
            overflow: 'auto',
            
            
            }} >
            
          <List divided verticalAlign='middle'>
            {tags.map( tag  => (
               <List.Item key={tag?._id} style={{padding: '20px'}} >
                  <Grid columns={'equal'} key={tag._id} style={{display: 'block'}}>
                  <GridColumn width={5} >
                    <h3>{tag.name}</h3>
                  </GridColumn>
                  <GridColumn width={3} >
                    <Icon name='circle' style={{color: tag.color }} size='big'/>
                    
                  </GridColumn>

                  <GridColumn width={3} style={{marginLeft: '20px'}}>
                  <Button
                    onClick={()=> this.deleteTag(tag?._id)}
                    icon='trash'
                  />
                    
                  </GridColumn>
                </Grid>

               </List.Item>
               
              ))}

          </List>
            
           </Container>
            
          </Modal.Content>
          <Modal.Actions>
            <Button color='black' onClick={this.handleManageTagsModalClose}>
              Cancel
            </Button>
            <Button
              content="Create Tag"
              labelPosition='right'
              icon='checkmark'
              onClick={this.createTag}
              positive
              disabled={!newTagName} // Disable button when no tag name is entered
            />
          </Modal.Actions>
        </Modal>
      </Container>
    )
  }
}
