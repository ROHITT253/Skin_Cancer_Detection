import { Center, Accordion, AccordionItem, AccordionButton,AccordionPanel, AccordionIcon, Container, Heading,Button, useDisclosure, Box } from '@chakra-ui/react'
import React, {useRef, useState, useEffect} from 'react'
import { Layout } from '../components/Layout'
// import { DatePicker } from 'react-datepicker-app' //https://www.positronx.io/react-datepicker-tutorial-with-react-datepicker-examples/
// import Book_Appointment from "../components/book_appointment";
import { useAuth } from '../contexts/AuthContext';
import ImgModal from '../components/ImgModal';
import FormModal from '../components/FormModal';
import FormModalAppointment from '../components/FormModalAppointment';
import {collection, getDocs} from "firebase/firestore"
import { db } from '../utils/init-firebase';
import { query, where } from "firebase/firestore";


export default function PatientPage() {
  const fileInputRef = useRef(null)
  const dermRef = useRef(null)
  const [selectedImage, setSelectedImage] = useState(null)
  const { isOpen, onOpen, onClose } = useDisclosure()
  const btnRef = React.useRef()
  const [pd, setPd] = useState(false)
  const [data,setData] = useState([]) 
  const [loader,setLoader] = useState(true)
  const {currentUser} = useAuth()
  const [showComment, setShowComment] = useState(false)
  
  const [doctorSnap, setDoctorSnap] = useState(null) 
  const [appointmentDetails, setAppointmentDetails] = useState(false)

  useEffect(() => {
      const getDoctors = async() => {
        const doctorRef = collection(db, "users");
        const q = query(doctorRef, where("userType", "==", "Doctor"));
        const querySnapshot = await getDocs(q);
        // console.log('Doctors:', querySnapshot)
        setDoctorSnap(querySnapshot)
      }
      getDoctors()
  }, [])

  const onImageChange = (e) => {
    setSelectedImage(e.target.files[0])
    onOpen()
  }

  

  useEffect(() => {
    const querySnapshot = async() => {
      await getDocs(collection(db, "users")).then((querySnapshot) => {
        const items = []
        querySnapshot.forEach((doc) => {
          if(doc.data().email === currentUser.providerData[0].email) {
            items.push(doc.data())
          }});
          setData(items)  
          setLoader(false)
  })};
    querySnapshot()
  },[currentUser]);

  useEffect(() => {
  if(showComment){
    window.scrollTo(0, 130)
  }
  }, [showComment])
  
  

  return (

    
    <Layout>
      <div >
      <Box style={{display: 'flex', gap:10, marginBottom: 10, alignItems: 'center'}}>
      {/* <Button ref={btnRef} colorScheme='pink' variant='outline' onClick={onOpen}>
        Options
      </Button> */}
      <Heading width="-webkit-fit-content" mr={2}>Patient Dashboard</Heading>
      </Box>

      <div>

      {/* <h3 style={{color :'#B83280',fontSize :'30px',textAlign: 'center',fontWeight :'bold',marginBottom:'20px'}}>Patient Details:</h3> */}

        {loader=== false && data.map(data => (
          <>
          <Center><Heading width="-webkit-fit-content" mr={2} as='h3' size='lg' marginTop={'20px'}><span style={{fontWeight:'bold'}}>
          Welcome {data.gender === "Male" ? 'Mr. ':'Ms. '} 
          </span> <span style={{width:"30%"}}>{data.firstName}</span> <span style={{width:"30%"}}>{data.lastName}</span></Heading></Center>
          <Heading width="-webkit-fit-content" mr={2} as='h4' size='md' marginTop={'20px'}><span style={{fontWeight:'bold'}}>
          What would you like to do?
          </span></Heading>
          <Accordion allowToggle marginTop={'20px'}>
              <AccordionItem>
                <h2>
                  <AccordionButton>
                    <Box flex='1' textAlign='left'>
                      View/Update your Profile Details
                    </Box>
                    <AccordionIcon />
                  </AccordionButton>
                </h2>
          <AccordionPanel>
          <div style = { { 
            border:'1px solid rgba(255, 255, 255, 0.79)', 
            outline:'#B83280 solid 3px',
            padding:'20px', 
            background: "rgba( 226, 74, 181, 0.25 )",
            boxShadow: "0 8px 32px 0 rgba(  31, 38, 135, 0.37  )",
            backdropFilter: "blur( 10px )",
            borderRadius:'20px',
            margin:'auto',
            } } className="displayData" key = {data.email}> 

            <div style={{display:'flex',justifyContent:'space-between',width:'50%',textAlign:'left'}}><span style={{fontWeight:'bold'}}>
            First Name:
            </span> <span style={{width:"30%"}}>{data.firstName}</span></div>
            <div style={{display:'flex',justifyContent:'space-between',width:'50%',textAlign:'left'}}><span style={{fontWeight:'bold'}}>
            Last Name:
              </span> <span style={{width:"30%"}}>{data.lastName}</span></div>
            <div style={{display:'flex',justifyContent:'space-between',width:'50%',textAlign:'left'}}><span style={{fontWeight:'bold'}}>email:</span> <span style={{width:"30%"}}>{data.email}</span></div>
            <div style={{display:'flex',justifyContent:'space-between',width:'50%',textAlign:'left'}}><span style={{fontWeight:'bold'}}>Phone Number:</span> <span style={{width:"30%"}}>{data.phoneNumber}</span></div>
            <div style={{display:'flex',justifyContent:'space-between',width:'50%',textAlign:'left'}}><span style={{fontWeight:'bold'}}>age:</span> <span style={{width:"30%"}}>{data.age}</span></div>
            <div style={{display:'flex',justifyContent:'space-between',width:'50%',textAlign:'left'}}><span style={{fontWeight:'bold'}}>Date of Birth:</span> <span style={{width:"30%"}}>{data.dob}</span></div>
            <div style={{display:'flex',justifyContent:'space-between',width:'50%',textAlign:'left'}}><span style={{fontWeight:'bold'}}>Gender:</span> <span style={{width:"30%"}}>{data.gender}</span></div>
            <div style={{display:'flex',justifyContent:'space-between',width:'100%',textAlign:'left',borderRadius:'10px',border:'1px solid #000',padding:'10px',marginTop:'10px',marginBottom:'10px'}}><span style={{fontWeight:'bold'}}>Reason for Consultation:</span> <span style={{width:"65.5%"}}>{data.roc}</span></div>
            <h4 style={{fontWeight:'bold', marginTop:'10px'}}>Uploaded Skin Image:</h4>
            <img alt ="" src={data.skinImgURL} style={{ marginTop: 20, borderRadius:'20px', height: '300px', width: '300px', display:'block', marginLeft:'auto',marginRight:'auto',boxShadow: '-4px -5px 33px -8px rgba(0,0,0,0.75)'}} />
            <Button  variant = 'outline' onClick={() => {
              setPd(true)
            }} width = '270px' colorScheme = 'pink' mb={2}>Update Patient Details </Button>

          </div>
          </AccordionPanel>
          </AccordionItem>
          <AccordionItem>
          <h2>
            <AccordionButton>
              <Box flex='1' textAlign='left'>
                Get your Diagnosis
              </Box>
              <AccordionIcon />
            </AccordionButton>
          </h2>
          <AccordionPanel pb={4}>
          <Button  ref={btnRef} colorScheme='pink' variant='outline' marginTop={'20px'} marginBottom={'20px'} onClick={()=>fileInputRef.current.click()} mb={2}>Upload Skin Images</Button>
          <p><span style={{fontWeight:'bold'}}> Or </span></p>
          <Button  ref={btnRef} colorScheme='pink' variant='outline' marginTop={'20px'} onClick={() => {
              setShowComment(true)
              onClose()
              }}> View Dermatologist Comments </Button>
          </AccordionPanel>
          </AccordionItem>

          
          <AccordionItem>
            <h2>
            <AccordionButton>
              <Box flex='1' textAlign='left'>
                Book Appointments
              </Box>
              <AccordionIcon />
            </AccordionButton>
          </h2>
          <AccordionPanel>
            <p> Available Doctors: </p>
            {doctorSnap?.docs?.map((doctor, idx) => 
            <>
            {doctor.data().firstName&&(
              <Button colorScheme='pink' variant='outline' onClick={() => {
              setAppointmentDetails(true)
              }}>{`Doctor ${idx+1} : ${doctor.data().firstName} ${doctor.data().lastName}`}</Button>
            )}
            </>

            )}
          </AccordionPanel>
          </AccordionItem>
          </Accordion>    
          </>

          
        ))}
      </div>

      {showComment && <div ref={dermRef} className="viewComments" style={{marginTop: "40px"}}>
        <h4 style={{ fontWeight:'bold', marginTop:'10px', marginBottom:"10px", fontSize:'larger' }}>Dermotologist Comments:</h4>
         <p style={{border:'1px solid rgba(255, 255, 255, 0.79)', 
            outline:'#B83280 solid 3px',
            padding:'5px', 
            background: "rgba( 226, 74, 181, 0.25 )",
            boxShadow: "0 8px 32px 0 rgba(  31, 38, 135, 0.37  )",
            backdropFilter: "blur( 10px )",
            borderRadius:'5px',
            margin:'auto',}}>{data[0].doctorComment}</p>
       
        
      </div>

      }

      </div>

      <input
            type="file"
            ref={fileInputRef}
            accept="image/*"
            onChange={onImageChange}
            hidden
          />
      
      
      {/* <Drawer
        isOpen={isOpen}
        placement='left'
        onClose={onClose}
        finalFocusRef={btnRef}
      >
        <DrawerOverlay />
        <DrawerContent>
          <DrawerCloseButton />
          <DrawerHeader>Patient Options</DrawerHeader>

          <DrawerBody>
            <Button  variant = 'outline' onClick={() => {
              setPd(true)
              onOpen()
            }} width = '270px' colorScheme = 'pink' mb={2}>Update Patient Details </Button>
            <Button  variant = 'outline' onClick={()=>fileInputRef.current.click()} width = '270px' colorScheme = 'pink' mb={2}>Upload Skin Images</Button>
            <Button  variant = 'outline'  width = '270px' colorScheme = 'pink' mb={2} onClick={() => {
              setShowComment(true)
              onClose()
              }}> View Dermatologist Comments </Button>
          </DrawerBody>

          <DrawerFooter>
            <Button variant='outline' mr={3} onClick={onClose}>
              Cancel
            </Button>
          </DrawerFooter>
        </DrawerContent>

      </Drawer> */}

      {selectedImage && <ImgModal isOpen={isOpen} onClose={onClose} selectedImage={selectedImage} setSelectedImage={setSelectedImage}/>}
      {pd && <FormModal isOpen={pd} onClose={onClose} pd={pd} setPd={setPd} />}
      {appointmentDetails && <FormModalAppointment isOpen={appointmentDetails} onClose={onClose} appointmentDetails={appointmentDetails} setAppointmentDetails={setAppointmentDetails} />}
      <Container maxW='container.lg' overflowX='auto' py={4}>

      </Container>
    </Layout>
  )
}
