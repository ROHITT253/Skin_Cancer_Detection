import { Container, Heading, Box, Button, useDisclosure, Accordion, AccordionItem, AccordionButton,AccordionPanel, AccordionIcon, Flex} from '@chakra-ui/react'
// import  {Textarea, Slider, SliderTrack, SliderFilledTrack, SliderThumb, SliderMark, Link } from '@chakra-ui/react'
import React, { useState,useEffect, useRef}from 'react'
import { Layout } from '../components/Layout'
import FormModalDoct from '../components/FormModelDoct';
import {collection, doc, getDocs, setDoc} from "firebase/firestore"
import { useAuth } from '../contexts/AuthContext';
import { db } from '../utils/init-firebase';
import { query, where } from "firebase/firestore";
import axios from 'axios';
import SearchSpotlight from '../components/SearchSpotlight';
// import { InfinitySpin } from 'react-loader-spinner';

export default function DiagnosisPage() {

  const [docdet, setDocdet] = useState(false)
  const btnRef = React.useRef(null)
  const {isOpen, onOpen, onClose} = useDisclosure()
  const [loader,setLoader] = useState(true)
  const [data,setData] = useState([]) 
  const {currentUser} = useAuth()
  const [revealPatients, setRevealPatients] = useState(false)
  const [patientSnap, setPatientSnap] = useState(null)
  const [segImg, setSegImg] = useState(null)
  const [segLoading, setSegLoading] = useState(false)
  const [predClass, setPredClass] = useState('')
  const [comment, setComment] = useState('')
  const [commentSubmit, setCommentSubmit] = useState(false)
  const [severeSubmit, setSevereSubmit] = useState(false)
  const [sliderValue, setSliderValue] = useState(50)
  const accordionRef = useRef(null)

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
    if(revealPatients){
      const getPatients = async() => {
        const patientsRef = collection(db, "users");
        const q = query(patientsRef, where("userType", "==", "Patient"));
        const querySnapshot = await getDocs(q);
        setPatientSnap(querySnapshot)
      }
      getPatients()
    }
  }, [revealPatients])
  
  const fetchData = async(patientImg) => {
    setSegLoading(true)
    const formData = new FormData();
    const headers= {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET,PUT,POST,DELETE,PATCH,OPTIONS"
  }
    formData.append('img_url', patientImg);
    const {data} = await axios.post("http://127.0.0.1:3000/predict", formData, { headers: headers, responseType: 'blob'  })
    const imageObjectURL = URL.createObjectURL(data);
    setSegImg(imageObjectURL);
    setSegLoading(false)
  }

    const fetchDataClass = async(patientImg) => {
    const formData = new FormData();
    const headers= {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET,PUT,POST,DELETE,PATCH,OPTIONS"
  }
    formData.append('img_url', patientImg);
    const {data} = await axios.post("http://127.0.0.1:3000/predict_class", formData, { headers: headers, responseType: 'text'  })
    setPredClass(data);
  }

  const submitComment = async (email) => {
    const commentRef = doc(db, 'users', email);
    setCommentSubmit(true)
    await setDoc(commentRef, { doctorComment: comment }, { merge: true });
    setComment('')
    setCommentSubmit(false)
  }

  const submitSevere =  (email) => {
    
    setSevereSubmit(true)
     setDoc(doc(db, 'users', email), { doctorSevere: sliderValue}, { merge: true }).then(()=>{
      setSevereSubmit(false)
     })
    
  }
  

  return (
    <Layout>
      <Box style={{display: 'flex', flexDirection: 'column', gap:10, marginBottom: 10, alignItems: 'center'}}>
      <Heading width="-webkit-fit-content" mr={2}>Diagnosis History</Heading>
      {revealPatients && patientSnap !==null ? <SearchSpotlight patientData={patientSnap} /> : null}
      </Box>
      <Button onClick={() => {
              setRevealPatients(!revealPatients)
              onClose()
            }}  variant = 'outline'  width = '270px' colorScheme = 'pink' mb={2}>{revealPatients?'Hide':'View'} Patient Details</Button>
        <div style={{marginTop:'50px'}} id = 'container'>
        {revealPatients && <Accordion allowMultiple>
          {patientSnap?.docs?.map((patient, idx) => 
          <AccordionItem key={idx} onClick={() => {
            setSegImg(null)
            setPredClass('')
            }}>
            <h2>
              <AccordionButton className={`test${idx}`}>
                <Box flex='1' display="flex" justifyContent="space-between" textAlign='left' style={{fontWeight:'bold'}}>
                  <p>{`Patient ${idx+1} : ${patient.data().firstName}`}</p>
                  <p style={{marginRight:'5px'}}>{`Severity Rating: ${patient.data().doctorSevere}`}</p>
                </Box>
                <AccordionIcon />
              </AccordionButton>
            </h2>
            <AccordionPanel pb={4}>
              <p><span style={{fontWeight:'bold'}}>Email:</span> {patient.data().email}</p>
              <p><span style={{fontWeight:'bold'}}>Phone Number:</span> {patient.data().phoneNumber}</p>
              <p><span style={{fontWeight:'bold'}}>Age:</span> {patient.data().age}</p>
              <p><span style={{fontWeight:'bold'}}>Date of Birth:</span> {patient.data().dob}</p>
              <p><span style={{fontWeight:'bold'}}>Gender:</span> {patient.data().gender}</p>
              <p><span style={{fontWeight:'bold'}}>Reason for consultation:</span> {patient.data().roc}</p>
              <Flex mt={3} direction="row" align="center" justify="space-between">
                <div>
                  <p style={{fontWeight:'bold', marginBottom:'5px'}}><span>Original Image:</span></p>
                  <img style={{height:"200px", borderRadius: "10px", marginBottom:'10px'}} src={patient.data().skinImgURL} alt="" />
                  <p style={{fontWeight:'bold', marginBottom:'5px'}}><span>Segmented Image:</span></p>
                  <img style={{height:"200px", borderRadius: "10px"}} src={patient.data().segmentedImgURL} alt="" />

                </div>
                <div>
                {/* {segLoading ? <InfinitySpin color="#B83280" /> :
                
                <Button colorScheme='pink' variant='outline' onClick={() => 
                  fetchData(patient.data().skinImgURL)
                  }>Segment Image</Button>
              } */}
                </div>
                <div style={{height:"200px", width: "300px", borderRadius: "10px"}}>
                {segImg && <img style={{height:"200px", borderRadius: "10px"}} src={segImg} alt="" />}
                </div>
              </Flex>
              {/* <Button mt={3} colorScheme='pink' variant='outline' onClick={() => 
                  fetchDataClass(patient.data().skinImgURL)
                  }>Disease Classification</Button> */}
              <p style={{marginTop: "10px", marginBottom: "10px"}}><span style={{fontWeight:'bold'}}>Classification result:</span> {patient.data().predictedClass}</p>
              <p style={{marginTop: "10px", marginBottom: "10px"}}><span style={{fontWeight:'bold'}}>Previous Comments:</span> {patient.data().doctorComment}</p>
              {/* <Textarea
                mt={3}
                value={comment}
                onChange={e=>setComment(e.target.value)}
                placeholder='Comments'
                size='lg'
                rows={7}
            /> */}
            {/* <Button isLoading={commentSubmit} loadingText='Submitting' mt={3} colorScheme='pink' variant='outline' onClick={()=>submitComment(patient.data().email)}>Submit comment</Button> */}
            <p style={{marginTop: "10px", marginBottom: "10px"}}><span style={{fontWeight:'bold'}}>Approx Severity Rating:</span> {patient.data().doctorSevere}</p>

            <p style={{marginTop: "10px", marginBottom: "10px"}}><span style={{fontWeight:'bold'}}>Appointment Date:</span> {patient.data().appointmentDate}</p>

            <p style={{marginTop: "10px", marginBottom: "10px"}}><span style={{fontWeight:'bold'}}>Appointment Time:</span> {patient.data().appointmentTime}</p>
            {/* <Slider aria-label='slider-ex-6' onChangeEnd={(val) => setSliderValue(val)}>
              <SliderMark value={25} mt='1' ml='-2.5' fontSize='sm'>
                25%
              </SliderMark>
              <SliderMark value={50} mt='1' ml='-2.5' fontSize='sm'>
                50%
              </SliderMark>
              <SliderMark value={75} mt='1' ml='-2.5' fontSize='sm'>
                75%
              </SliderMark>
              <SliderMark
                value={sliderValue}
                textAlign='center'
                bg='blue.500'
                color='white'
                mt='-10'
                ml='-5'
                w='12'
              >
                {sliderValue}%
                {console.log(sliderValue)}
              </SliderMark>
              <SliderTrack>
                <SliderFilledTrack />
              </SliderTrack>
              <SliderThumb />
            </Slider> */}
            {/* <Button isLoading={severeSubmit} loadingText='Submitting' mt={3} colorScheme='pink' variant='outline' onClick={()=>submitSevere(patient.data().email)}>Submit Severity Rating</Button> */}
            </AccordionPanel>
          </AccordionItem>
          )}
        </Accordion>}
      </div>

      {docdet && <FormModalDoct isOpen={docdet} onClose={onClose} docdet={docdet} setDocdet={setDocdet} />}

      <Container maxW='container.lg' overflowX='auto' py={4}>
        {/* <chakra.pre p={4}>
          {currentUser && <pre> {JSON.stringify(currentUser, null, 2)}</pre>}
        </chakra.pre> */}

      </Container>
    </Layout>
  )
}
