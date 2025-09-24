import React ,{useContext, useEffect, useState, useRef} from 'react'
import { List, Image, Icon, Segment, Container, Label, Loader, Dimmer, Checkbox, Grid, GridColumn, Popup, GridRow, Search, DropdownMenu, Input, DropdownDivider, DropdownHeader, Dropdown, DropdownItem, Button, Modal, ModalHeader, ModalContent, ModalActions } from 'semantic-ui-react';
import './EmailList.css'; // Custom CSS file for additional styling
import { GlobalContext } from '../../Context/GlobalContext';
import { BACKEND_URL, currentUser } from '../../constants';

export default function EmailList(props) {
    const inputRef = useRef(null);

    const {dashboardState, setDashboardState} = useContext(GlobalContext)
    const {currentView,selectedEmails, tags, showSidebar} = dashboardState
    const  [emails,setEmails] = useState([])
   const [searchTerm, setSearchTerm] = useState ([])
   const [isSearching, setSearching] = useState(false)

    const[ filteredEmails ,setFilteredEmails] = useState([])

    const tagOptions  =  tags.map(e => ({
      key: e._id,
      text: e.name,
      value: e._id,
      color: e.color,
      label: <Icon name='circle' style={{color: e.color}}/>

    }))

    const [appliedFilters, setAppliedFitler] = useState([])
    const [tempFilters, setTempFilters] = useState([])

    const [showFilterModal,setFilterModal] = useState(false)
  
  const search = async (searchTerm)=> {
    setSearching(true)
    const resp =  await fetch(`${BACKEND_URL}/emails/search/?q=${props.q}&userId=${currentUser()?._id}&searchTerm=${searchTerm}`)
    const data = await resp.json()
    if(data.emails){
      setDashboardState({[`${currentView}Emails`]: data.emails})
      console.log(data.size)
    }else{
      console.log(data)
    }

    setSearching(false)

  }
  useEffect(() => {
    if (inputRef.current) { // focus the search
      inputRef.current.focus();
    }
    let newEmails = []
    console.log(props.emails, 'props emails')
    Object.keys(props.emails).forEach(key => {
      newEmails = newEmails.concat(props.emails[key])
  })
    setEmails(newEmails)
    setFilteredEmails(newEmails)
    // reset everything on refresh
    setDashboardState({selectedEmails: [], selectedEmail: {}, })
    
    setAppliedFitler([])
    setTempFilters([])
    
   
  }, [props.emails, props.isLoading]);


  return (

    <Container fluid style={{ paddingLeft: '5em', paddingTop: '0',right: '0' , height: '80vh', overflow: 'auto'}}>
    {/* Modal Filters */}
     <Modal
        dimmer
        open={showFilterModal}
        onClose={() => {
          setTempFilters(appliedFilters)
          setFilterModal(false)
        
        }}
      >
        <ModalHeader>Filter By Tags</ModalHeader>
        <ModalContent>
         
         <Dropdown
         style={{width: '100%', marginBottom: '2rem'}}
          search
          multiple
          selection
          clearable
          
          
          value={tempFilters}
          onChange={ (e, {value}) => setTempFilters(value)}
          options={tagOptions}
        />
         
        </ModalContent>
        <ModalActions>
          <Button   color='black' onClick={() =>{
            setTempFilters(appliedFilters)
            setFilterModal(false)
          } 
            }>
            
            Cancel
          </Button>
          <Button positive onClick={() =>{
            setAppliedFitler(tempFilters)
            setFilterModal(false)
            if(tempFilters.length > 0){
              setFilteredEmails(emails.filter(e => tempFilters.some(item => e.tagIds.includes(item) )))

            }else{
              setFilteredEmails(emails)
            }
          }}>
            Apply Filter
          </Button>
        </ModalActions>
      </Modal>

     
      {!props.isLoading   && 
        <Grid>
          <GridColumn width={12}>
             
            <Input 
              loading={isSearching}
              placeholder='Press Enter To Search'
              ref={inputRef} 
              icon='search' 
              iconPosition='left' 
              className='search'
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              onKeyDown = {e => {
                if(e.key === 'Enter'){
                  console.log('Enter key pressed')
                  search(searchTerm)
                 
                }
              }}
             />

          </GridColumn>
          <GridColumn width={4}>
              
          {
            !props.q.includes('draft')  && 
            
            <Button 
              icon='filter'
              floating
              onClick={()=> setFilterModal(true)}
            />
            
          
          
          }
     
          </GridColumn>

          
        </Grid>
       
      }
      { props.isLoading  &&<Loader active   inline='centered' size='large'/> }

     {!props.isLoading   && 
    <List divided verticalAlign='middle' >
      { !props.isLoading && !isSearching && <Checkbox 
          indeterminate={selectedEmails.length !== filteredEmails.length && selectedEmails.length > 0}
          checked = {selectedEmails.length === filteredEmails.length  &&  filteredEmails.length  > 0}
          style={{marginBottom: '20px'}} label={selectedEmails.length !== filteredEmails.length ? 'Select All' : 'Deselect All' }
          onClick={
            () => {
              const emailsIds = filteredEmails.map(e => e._id)
              if(selectedEmails.length !== emailsIds.length  ){
                setDashboardState({selectedEmails: emailsIds})
              }else{
                setDashboardState({selectedEmails: []})

              }
            }
          }
      
      />}
          {!isSearching && filteredEmails.map((email, index) => (
            <>
              <List.Item key={email?.id} >
         
                <Grid>
                  <GridColumn width={1} style={{paddingTop: '2em' ,background: email?.labelIds?.includes("UNREAD") ? '#fff9c4' : '#ffffff' }}>
                    <Checkbox 
                      checked={selectedEmails.includes(email?._id)} 
                      onClick={
                        ()=> {
                          console.log(selectedEmails)
                          if(!selectedEmails.includes(email?._id)){
                            
                            setDashboardState({selectedEmails: [email?._id, ...selectedEmails]})

                          }else{
                            setDashboardState({selectedEmails: selectedEmails.filter(e => e !== email._id) })

                          }
                        }
                      }
                    />
                  </GridColumn>
                  <GridColumn width={15} style={{ cursor: 'pointer', padding: '2em', background: email?.labelIds?.includes("UNREAD") ? '#fff9c4' : '#ffffff' }} onClick={()=> {
                        window.scrollTo({
                            top: 0,
                          });
                          console.log(email)
                          setDashboardState({selectedEmail: email, showSidebar: true})
                    }}>
                    <Label circular color="blue" size="big" style={{ marginRight: '1em' }}>
                      {email?.payload?.headers?.find(e => e.name.toUpperCase() === 'FROM')?.value?.replaceAll('"', '').charAt(0).toUpperCase()}
                    </Label>
                    <List.Content>
                      <List.Header as='a' style={{ color: email?.labelIds?.includes("UNREAD") ? '#000' : '#333' }}>{email?.payload?.headers?.find(e => e.name.toUpperCase() === 'FROM')?.value.replaceAll('"', '')}</List.Header>
                      <List.Description>
                        <p style={{ fontWeight: email?.labelIds?.includes("UNREAD") ? 'bold' : 'normal', margin: '0.5em 0' }}>{email?.payload?.headers?.find(e => e.name.toUpperCase() === 'SUBJECT')?.value}</p>
                        <p style={{ color: '#777', margin: '0.5em 0' }}>{email?.snippet}</p>
                        <span style={{ float: 'right', color: '#999' }}>{email?.payload?.headers?.find(e => e.name.toUpperCase() === 'DATE')?.value}</span>
                        {email?.tagIds?.length > 0 &&
                            <Grid  columns={'equal'} style={{marginTop: '10px', padding:'2em'}}>
                               <List horizontal>
                              
                                   
                                        {email?.tagIds?.map(tagId=>  
                                            <List.Item key={tagId} >
                                              
                                              <Popup content={tags.find(e => e._id === tagId)?.name} trigger={<Icon 
                                                      name='circle'
                                                      style={{ color: tags.find(e => e._id === tagId)?.color}}      
                                                  />} />
                                              
                                            
                                              </List.Item>

                                          )}
                                      
                                </List>
                                
                            </Grid>
                
                
                          }
                      </List.Description>
                    </List.Content>
                  </GridColumn>
                 
                </Grid>
              
              
              </List.Item>
              {index != filteredEmails.length - 1 && <hr style={ {borderTop: '8px solid #1b1919', background: ''}}/>}
            </>
        
      ))}
    </List>
    
 }
  </Container>
  )
}
