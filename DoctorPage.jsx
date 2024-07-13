import { Container, Center, Heading, Box, Button, useDisclosure, Accordion, AccordionItem, AccordionButton,AccordionPanel, AccordionIcon, Flex, Textarea, Slider, SliderTrack, SliderFilledTrack, SliderThumb, SliderMark, Link} from '@chakra-ui/react'
import React, { useState,useEffect}from 'react'
import { Layout } from '../components/Layout'
import FormModalDoct from '../components/FormModelDoct';
import {collection, doc, getDocs, setDoc} from "firebase/firestore"
import { useAuth } from '../contexts/AuthContext';
import { db,storage } from '../utils/init-firebase';
import { query, where } from "firebase/firestore";
import axios from 'axios';
import { getDownloadURL, ref, uploadBytes } from 'firebase/storage';
import { InfinitySpin } from 'react-loader-spinner';

export default function DoctorPage() {

  const [docdet, setDocdet] = useState(false)
  const btnRef = React.useRef(null)
  const {onClose} = useDisclosure()
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
  const [classificationSubmit, setClassificationSubmit] = useState(false)
  const [predEmail,setPredEmail] = useState('')
  const [selectedSegImg, setSelectedSegImg] = useState(null)
  const [segImgData, setSegImgData] = useState({})
  

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
  useEffect(()=>{
    const predSubmit=async()=>{
      const classificationRef = doc(db, 'users', predEmail);
    setClassificationSubmit(true)
    await setDoc(classificationRef, { predictedClass: predClass}, { merge: true });
    setClassificationSubmit(false)
    }
    if(predClass.length>2){
      predSubmit();
    }
  },[predClass,predEmail])

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
  
  const fetchData = async(patientImg, email) => {
    setSegLoading(true)
    const formData = new FormData();
    const headers= {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET,PUT,POST,DELETE,PATCH,OPTIONS"
  }
    formData.append('img_url', patientImg);
    const {data} = await axios.post("http://127.0.0.1:3000/predict", formData, { headers: headers, responseType: 'blob'  })
    console.log('data', data)
    const myFile = new File([data], 'image.jpeg', {
      type: data.type,
  });
  console.log(myFile)
    setSegImgData(myFile)
    
    const imageObjectURL = URL.createObjectURL(data);
    
    setSegImg(imageObjectURL);
    setSegLoading(false)
    const imageURL = await getSegmentedImageURL(myFile,email)
      await setDoc(doc(db, 'users', email), { segmentedImgURL: imageURL }, { merge: true });
      setSelectedSegImg(null)
      onClose()
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

  const submitClassification = async (email, predclass) => {
    console.log('predicted_class', predclass)
    const classificationRef = doc(db, 'users', email);
    setClassificationSubmit(true)
    await setDoc(classificationRef, { predictedClass: predclass}, { merge: true });
    setClassificationSubmit(false)
  }

  const submitSevere =  (email) => {
    
    setSevereSubmit(true)
     setDoc(doc(db, 'users', email), { doctorSevere: sliderValue}, { merge: true }).then(()=>{
      setSevereSubmit(false)
     })
    
  }

  const getSegmentedImageURL = async (image, user) => {
    if (!(image && user)) return;
    const storageRef = ref(storage, `input/${user}`);
    await uploadBytes(storageRef, image);
    return await getDownloadURL(storageRef).then((url) => url);
  };

  // const submitSegmentedImgHandler = async(email) => {
      
  //   }
  

  return (
    <Layout>
      <Box style={{display: 'flex', gap:10, marginBottom: 10, alignItems: 'center'}}>
      <Heading width="-webkit-fit-content" mr={2}>Doctor Dashboard</Heading>
      </Box>
      {loader=== false && data.map(data => (
          <>
          <Center><Heading width="-webkit-fit-content" mr={2} as='h3' size='lg' marginTop={'20px'}><span style={{fontWeight:'bold'}}>
            Welcome Dr. 
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
            marginTop:'20px'
            } } className="displayData" key = {data.email}> 
<div style={{display:'flex',justifyContent:'space-between',width:'50%',textAlign:'left'}}><span style={{fontWeight:'bold'}}>
            First Name:
            </span> <span style={{width:"30%"}}>{data.firstName}</span></div>
            <div style={{display:'flex',justifyContent:'space-between',width:'50%',textAlign:'left'}}><span style={{fontWeight:'bold'}}>
            Last Name:
              </span> <span style={{width:"30%"}}>{data.lastName}</span></div>
            <div style={{display:'flex',justifyContent:'space-between',width:'50%',textAlign:'left'}}><span style={{fontWeight:'bold'}}>Email Address:</span> <span style={{width:"30%"}}>{data.email}</span></div>
            <div style={{display:'flex',justifyContent:'space-between',width:'50%',textAlign:'left'}}><span style={{fontWeight:'bold'}}>Phone Number:</span> <span style={{width:"30%"}}>{data.phoneNumber}</span></div>
            <div style={{display:'flex',justifyContent:'space-between',width:'50%',textAlign:'left'}}><span style={{fontWeight:'bold'}}>Age:</span> <span style={{width:"30%"}}>{data.age}</span></div>
            <div style={{display:'flex',justifyContent:'space-between',width:'50%',textAlign:'left'}}><span style={{fontWeight:'bold'}}>Date of Birth:</span> <span style={{width:"30%"}}>{data.dob}</span></div>
            <div style={{display:'flex',justifyContent:'space-between',width:'50%',textAlign:'left'}}><span style={{fontWeight:'bold'}}>Gender:</span> <span style={{width:"30%"}}>{data.gender}</span></div>
            <div style={{display:'flex',justifyContent:'space-between',width:'50%',textAlign:'left'}}><span style={{fontWeight:'bold'}}>Specialization:</span> <span style={{width:"30%"}}>{data.speciality}</span></div>
            <div style={{display:'flex',justifyContent:'space-between',width:'50%',textAlign:'left'}}><span style={{fontWeight:'bold'}}>Clinic Name:</span> <span style={{width:"30%"}}>{data.clinicName}</span></div>
            <div style={{display:'flex',justifyContent:'space-between',width:'100%',textAlign:'left',borderRadius:'10px',border:'1px solid #000',padding:'10px',marginTop:'10px',marginBottom:'10px'}}><span style={{fontWeight:'bold'}}>Clinic Address:</span> <span style={{width:"65.5%"}}>{data.clinicAddress}</span></div>
            <div style={{display:'flex',justifyContent:'space-between',width:'100%',textAlign:'left',borderRadius:'10px',border:'1px solid #000',padding:'10px',marginTop:'10px',marginBottom:'10px'}}><span style={{fontWeight:'bold'}}>Previous Experience:</span> <span style={{width:"65.5%"}}>{data.prevExperience}</span></div>
            <Button  variant = 'outline' onClick={() => {
              setDocdet(true)
            }} width = '270px' colorScheme = 'pink' mb={2}>Update Doctor Details</Button>
          </div>  
          </AccordionPanel>
          </AccordionItem>
          <AccordionItem>
          <h2>
            <AccordionButton>
              <Box flex='1' textAlign='left'>
                Patient Diagnosis
              </Box>
              <AccordionIcon />
            </AccordionButton>
          </h2>
          <AccordionPanel pb={4}>
          <Button ref={btnRef} colorScheme='pink' variant='outline' marginTop={'20px'} marginBottom={'20px'}><span style={{fontWeight:'bold'}}><Link href='/diagnosis' colorScheme='pink'> Diagnosis History </Link></span></Button>
          <p><span style={{fontWeight:'bold'}}> Or </span></p>
          <Button  onClick={() => {
              setRevealPatients(!revealPatients)
              onClose()
            }}  ref={btnRef} variant = 'outline' colorScheme = 'pink' marginTop={'20px'} mb={2}><span style={{fontWeight:'bold'}}> {revealPatients?'Hide':'Edit'} Patients Diagnosis</span></Button>

          </AccordionPanel>
          </AccordionItem>
          </Accordion>        
          </>

        ))}
    
        <div style={{marginTop:'50px'}} id = 'container'>
        {revealPatients && <Accordion allowToggle>
          {patientSnap?.docs?.map((patient, idx) => 
          <AccordionItem key={idx} onClick={() => {
            setSegImg(null)
            setPredClass('')
            }}>
            <h2>
              <AccordionButton>
                <Box flex='1' textAlign='left' style={{fontWeight:'bold'}}>
                  {`Patient ${idx+1} : ${patient.data().firstName} ${patient.data().lastName}`}
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
                  <img style={{height:"200px", borderRadius: "10px"}} src={patient.data().skinImgURL} alt="" />
                </div>
                <div>
                {segLoading ? <InfinitySpin color="#B83280" /> :
                
                <Button colorScheme='pink' variant='outline' onClick={() => 
                  {
                    fetchData(patient.data().skinImgURL, patient.data().email)
                  }
                  }>Segment Image</Button>
              }
                </div>
                <div style={{height:"200px", width: "300px", borderRadius: "10px"}}>
                {segImg && <img style={{height:"200px", borderRadius: "10px"}} src={segImg} alt="" />}
                </div>
              </Flex>
              <Button isLoading={classificationSubmit} mt={3} colorScheme='pink' variant='outline' onClick={() => 
                  {
                    fetchDataClass(patient.data().skinImgURL)
                    setPredEmail(patient.data().email)
                    // submitClassification(patient.data().email,predClass)
                  }
                  }>Disease Classification</Button>
              <p style={{marginTop: "10px", marginBottom: "10px"}}><span style={{fontWeight:'bold'}}>Classification result:</span> {predClass}</p>
              <Textarea
                mt={3}
                value={comment}
                onChange={e=>setComment(e.target.value)}
                placeholder='Comments'
                size='lg'
                rows={7}
            />
            <Button isLoading={commentSubmit} loadingText='Submitting' mt={3} colorScheme='pink' variant='outline' onClick={()=>submitComment(patient.data().email)}>Submit comment</Button>
            <p style={{marginTop: "10px", marginBottom: "10px"}}><span style={{fontWeight:'bold'}}>Approx Severity Rating:</span> </p>
            <Slider aria-label='slider-ex-6' onChangeEnd={(val) => setSliderValue(val)}>
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
            </Slider>
            <Button isLoading={severeSubmit} loadingText='Submitting' mt={3} colorScheme='pink' variant='outline' onClick={()=>submitSevere(patient.data().email)}>Submit Severity Rating</Button>
            </AccordionPanel>
          </AccordionItem>
          )}
        </Accordion>}
      </div>

      {/* <Drawer
        isOpen={isOpen}
        placement='left'
        onClose={onClose}
        finalFocusRef={btnRef}
      >
        <DrawerOverlay />
        <DrawerContent>
          <DrawerCloseButton />
          <DrawerHeader>Doctor Options</DrawerHeader>

          <DrawerBody>
            <Button onClick={() => {
              setRevealPatients(true)
              onClose()
            }}  variant = 'outline'  width = '270px' colorScheme = 'pink' mb={2}>View Patient Details</Button>
          </DrawerBody>

          <DrawerFooter>
            <Button variant='outline' mr={3} onClick={onClose}>
              Cancel
            </Button>
          </DrawerFooter>
        </DrawerContent>

      </Drawer> */}

      {docdet && <FormModalDoct isOpen={docdet} onClose={onClose} docdet={docdet} setDocdet={setDocdet} />}

      <Container maxW='container.lg' overflowX='auto' py={4}>
        {/* <chakra.pre p={4}>
          {currentUser && <pre> {JSON.stringify(currentUser, null, 2)}</pre>}
        </chakra.pre> */}

      </Container>
    </Layout>
  )
}
