import {
  Heading,
  List,
  ListItem,
  Box,
  Text
} from '@chakra-ui/react'
import React from 'react'
import { Link } from 'react-router-dom'
import { Layout } from '../components/Layout'

export default function Homepage() {
  return (
    <>
    <Layout>
      <Text
        bgGradient='linear(to-l, #7928CA, #FF3080)'
        bgClip='text'
        fontSize='6xl'
        fontWeight='extrabold'
>Home Page</Text>
      <Box 
        
        borderRadius='10px' 
        padding='20px'
        bgGradient='linear(to-r, green.200, pink.500)' >
        <Text bgClip='text'
          fontSize='2xl'
          color='#000'
          fontWeight='extrabold'>
            A Web App to Help with Skin Disease Detection and Connect Patients with Verified Dermatologists
        </Text>
      </Box>
      <div style={{
        display:'flex',
        justifyContent:'space-between',
        alignItems:'center',
        width:'100%',
      }}>
          <p style={{marginTop:'20px',flex:0.8,marginLeft:'10px', fontWeight:'bold', fontSize:'20px', textAlign:'justify'}}>Detect Skin is an online portal to help Dermatologists with their diagnosis of Skin Cancer Lesions by leveraging the advances in Artifical Intelligence and Deep Learning. This platform allows patients to upload images of their Skin Infections so that Doctors can view them in real-time and come to a faster diagnosis for therapy. We look forward in expanding our application to Dermotologists located around the country. </p>
          <img style = {{ marginTop: 20, borderRadius:'20px', height: '500px', width: '500px', boxShadow: '-2px -5px 20px -8px rgba(0,0,0,0.75)'}} alt="" src="http://127.0.0.1:8887/homepage_photo.jpg"/>
      </div>
      
      <Box position="relative" bottom={0} left={'container.lg'}>
        <Heading size='md' mt={8}>
          Some other links (only for reference):
        </Heading>
        <List>
          <ListItem>
            <Link to='/reset-password'>Reset Password</Link>
          </ListItem>
          <ListItem>
            <Link to='/forgot-password'>Forgot Password </Link>
          </ListItem>
        </List>
      </Box>
    </Layout>
    </>
  )
}
