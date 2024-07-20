import React, { useState } from 'react';
import { 
  Box, 
  Container, 
  Flex, 
  Heading, 
  Image, 
  Text, 
  Tag, 
  AspectRatio, 
  HStack, 
  Button, 
  useDisclosure,
  AlertDialog,
  AlertDialogOverlay,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogBody,
  AlertDialogFooter,
  Modal,
  ModalBody,
  ModalHeader,
  ModalContent,
  ModalFooter,
  ModalCloseButton,
  ModalOverlay,
  FormControl,
  FormLabel,
  Input,
  Select,
  useToast
} from '@chakra-ui/react';
import { useLoaderData, useNavigate } from 'react-router-dom';
import { formatDate } from '../utils/formatDate';
import { formatTime } from '../utils/formatTime';

export const loader = async ({ params }) => {

  const { eventId } = params;

  const event = await fetch(`http://localhost:3000/events/${eventId}`);
  const championships = await fetch(`http://localhost:3000/championships`);
  const categories = await fetch('http://localhost:3000/categories');
  const users = await fetch('http://localhost:3000/users');

  return { event: await event.json(), championships: await championships.json(), categories: await categories.json(), users: await users.json() }; 
 
};

export const EventPage = () => {

  // Load the initial data and states
  const { event: initialEvent, championships, categories, users } = useLoaderData();
  const [event, setEvent] = useState(initialEvent);


  // Find the user who created the event
  const user = users.find((user) => Number(user.id) === Number(event.createdBy) );


  // Category filter
  function filterCategoriesByChampionship(championshipId, championships, categories) {

    // Find the selected championship
    const selectedChampionship = championships.find(champ => Number(champ.id) === Number(championshipId));
    
    // If championship is not found, return an empty array
    if (!selectedChampionship) {
        return [];
    }
  
    // Get the categoryIds for the selected championship
    const categoryIds = selectedChampionship.categoryIds;

    // Filter the categories based on the categoryIds
    const filteredCategories = categories.filter(category => categoryIds.includes(Number(category.id)));

    return filteredCategories.map((category) => (
      <Tag key={category.id} maxW='fit-content' bg='green.200'>{category.type}</Tag>
    ));
  }


  
  // Delete post Alert Dialoge
  const { isOpen: isOpenDelete, onOpen: onOpenDelete, onClose: onCloseDelete } = useDisclosure();
  const cancelRef = React.useRef();
  // Redirect after deletion of event
  const navigate = useNavigate();

  const deleteEvent = async (e) => {
    const url = `http://localhost:3000/events/${event.id}`;
    await fetch(url, {method: 'DELETE'}).then((response) => {
      if(!response.ok){
        throw new Error('Something went wrong. The event might not be deleted');
      }
      navigate('/');
    }).catch((e)=> {console.log(e)});
  };
  



  // Edit event modal & toast
  const { isOpen: isOpenEdit, onOpen: onOpenEdit, onClose: onCloseEdit } = useDisclosure(); 
  const toast = useToast();

  const [ formData, setFormData ] = useState({
    title: event.title,
    createdBy: Math.ceil(Math.random(2)),
    country: event.country,
    image: event.image,
    championshipId: event.championshipId,
    location: event.location,
    startTime: event.startTime,
    endTime: event.endTime
  });

  const fetchEvent = async () => {
    const eventResponse = await fetch(`http://localhost:3000/events/${event.id}`);
    const eventData = await eventResponse.json();

    setEvent(eventData);
    
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    setFormData(prevState => ({
      ...prevState,
      [name]: value
    }));
  };

  const handleSubmit = async () => {
    const response = await fetch(`http://localhost:3000/events/${event.id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(formData),
    });

    if (response.ok) {
      
      await response.json();
      await fetchEvent();
      toast({
        title: 'The race event has been updated.',
        description: "",
        status: 'success',
        duration: 9000,
        isClosable: true,
      })
      onCloseEdit();

    } else {
      
      toast({
        title: 'Failed to update the race event.',
        description: "Please try again later",
        status: 'error',
        duration: 9000,
        isClosable: true,
      })

    }
  };

  return (
    <>
      <Box w='100vw'>
        <Container maxW='container.lg'>
          <Box pos="relative" bgGradient='linear(to-b, gray.300, black)' rounded={7}>
            <AspectRatio ratio={16 / 7}>
              <Image src={event.image} rounded={7} opacity='45%'/>
            </AspectRatio>
            <Heading size='3xl' pos="absolute" top="80%" left="5%" color="white" transform="translate(0%,-50%)">
              {event.title}
            </Heading>
          </Box>
          <Flex flexDirection='row' justifyContent='space-between'>
            <Box py={4} alignContent='center'>
              <Heading>{formatDate(event.startTime)}</Heading>
              <Text>{formatTime(event.startTime)} - {formatTime(event.endTime)}</Text>
            </Box>
            <Box py={4}>
              <HStack>
                <Image maxW='6rem' src={user.image} rounded='50%'/>

                <Box>
                  <Text>Event created by</Text>
                  <Text fontWeight='bold'>{user.name}</Text>
                </Box>
              </HStack>
            </Box>
          </Flex>
        
          <Box  pb={4}>
            <Heading size='lg'>{event.location}</Heading>
            <Text>{event.country}</Text>
          </Box>
      
          <Box py={4}>
            <Flex justifyContent='space-between'>
              <HStack gap={1}>
                <Tag bg='purple.200' maxW='fit-content'>{championships.find((championship) => Number(championship.id) === Number(event.championshipId) ).name}</Tag>
                {filterCategoriesByChampionship(event.championshipId, championships, categories)}
              </HStack>
              <HStack spacing={4}>
                <Button onClick={onOpenEdit} size='sm' colorScheme='green'>Edit this event</Button>
                <Button onClick={onOpenDelete} size='sm' colorScheme='gray'>Remove this race event</Button>
              </HStack>
            </Flex>
          </Box>
        </Container>
      </Box>

      <AlertDialog
        isOpen={isOpenDelete}
        leastDestructiveRef={cancelRef}
        onClose={onCloseDelete}
      >
        <AlertDialogOverlay>
          <AlertDialogContent>
            <AlertDialogHeader fontSize='lg' fontWeight='bold'>
              Remove race event
            </AlertDialogHeader>

            <AlertDialogBody>
              Are you sure? 
              You can't undo this action afterwards.
            </AlertDialogBody>

            <AlertDialogFooter>
              <Button ref={cancelRef} onClick={onCloseDelete}>
                Cancel
              </Button>
              <Button 
                colorScheme='red' 
                onClick={deleteEvent} 
                ml={3}
              >
                Remove
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>

      <Modal isOpen={isOpenEdit} onClose={onCloseEdit}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Add a race event</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <FormControl>
              <FormLabel>Race Name</FormLabel>
              <Input 
                name="title" 
                placeholder={event.title}
                value={formData.title} 
                onChange={handleInputChange} 
              />

              <FormLabel>Start Date & Time</FormLabel>
              <Input 
                name="startTime" 
                type='datetime-local' 
                placeholder={event.startTime}
                value={formData.startTime} 
                onChange={handleInputChange} 
              />

              <FormLabel>End Date & Time</FormLabel>
              <Input 
                name="endTime" 
                type='datetime-local' 
                placeholder={event.endTime}
                value={formData.endTime} 
                onChange={handleInputChange} 
              />

              <FormLabel>Circuit or Stage Name</FormLabel>
              <Input 
                name="location" 
                placeholder={event.location}
                value={formData.location} 
                onChange={handleInputChange} 
              />

              <FormLabel>Country</FormLabel>
              <Input 
                name="country" 
                placeholder={event.country}
                value={formData.country} 
                onChange={handleInputChange} 
              />

              <FormLabel>Championship</FormLabel>
              <Select 
                name="championshipId"
                placeholder={championships.find((championship) => Number(championship.id) === Number(event.championshipId) ).name} 
                value={formData.championshipId} 
                onChange={handleInputChange}
              >
                <option value='1'>Formula 1</option>
                <option value='4'>World Rally Championship</option>
                <option value='5'>Dakar</option>
                <option value='3'>World Endurance Championship</option>
                <option value='2'>Formula E</option>
              </Select>
            </FormControl>
          </ModalBody>
          <ModalFooter>
            <Button colorScheme='green' onClick={handleSubmit}>Edit Event</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

    </>

  );
};
