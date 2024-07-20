import React, { useState, useEffect } from 'react';
import { Link, useLoaderData } from "react-router-dom";
import { 
  Card, 
  CardBody, 
  Divider, 
  Text, 
  Box, 
  Container, 
  Heading, 
  SimpleGrid, 
  Stack, 
  Image, 
  Tag, 
  Input, 
  Checkbox, 
  CardFooter, 
  CardHeader, 
  Center, 
  VStack,
  Tab,
  Tabs,
  TabList,
  TabPanel,
  TabPanels,
  CheckboxGroup,
  HStack,
  Button,
  Modal,
  ModalBody,
  ModalFooter,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  FormControl,
  FormLabel,
  Select,
  useDisclosure
} from '@chakra-ui/react';

import { formatTime } from '../utils/formatTime';
import { formatDate } from '../utils/formatDate';
import { compareDates } from '../utils/compareDates';


// Load initial data
export const loader = async () => {

  const events = await fetch('http://localhost:3000/events');
  const championships = await fetch('http://localhost:3000/championships');
  const categories = await fetch('http://localhost:3000/categories');

  return { events: await events.json(), championships: await championships.json(), categories: await categories.json() }; 
 
};

export const EventsPage = () => {
  
  // Initial data and states
  const { events: initialEvents, championships, categories } = useLoaderData();
  const [events, setEvents] = useState(initialEvents);
  const [searchField, setSearchField] = useState('');
  const [checkedChampionships, setCheckedChampionships] = useState(championships.map(() => true));
  const [matchedRaceEvents, setMatchedRaceEvents] = useState([]);

  // Sort the events on dates
  events.sort(compareDates);
  

  // Use effect that rerenders the page when the user uses the searchbar or filters
  useEffect(() => {
    const filterEvents = () => {
      return events.filter((event) => {
        return event.title.toLowerCase().includes(searchField.toLowerCase()) && checkedChampionships[event.championshipId - 1];
      });
    };
    setMatchedRaceEvents(filterEvents);
  }, [searchField, checkedChampionships, events]);


  // Adding event Modal and form data
  const { isOpen, onOpen, onClose } = useDisclosure(); 
  const [ formData, setFormData ] = useState({
    title: '',
    createdBy: Math.ceil(Math.random(2)),
    country: '',
    image: `../src/assets/images/newEvent0${Math.ceil(Math.random(4))}.jpg`,
    championshipId: '',
    location: '',
    startTime: '',
    endTime: ''
  });

  // Fetch event when data is submited
  const fetchEvents = async () => {
    const eventsResponse = await fetch('http://localhost:3000/events');
    const eventsData = await eventsResponse.json();

    // After the data is fetched sort the events and add it to the state
    eventsData.sort(compareDates);
    setEvents(eventsData);
    
  };

  // Add the entered form values to the formdata object
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    setFormData(prevState => ({
      ...prevState,
      [name]: value
    }));
  };

  // Post request when form is submitted
  const handleSubmit = async () => {
    const response = await fetch('http://localhost:3000/events', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(formData),
    });

    if (response.ok) {
      
      await response.json();
      await fetchEvents();
      onClose();

    } else {
      
      console.error('Failed to add event');

    }
  };


  // Updated the searchfield when someone types in the box
  const searchFieldInputChange = ( event ) => setSearchField(event.target.value);
  
  // Filters the event list based on the checked filter options
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

  // Returns the coresponding championship and property
  const getChampionshipProperty = ( eventId, property ) => {

    const championship = championships.find((championship) => Number(eventId) === Number(championship.id));

    if(!championship) {
      return [];
    }

    return championship[property];
    
  };

  // Returns the event list
  const eventList = matchedRaceEvents.map((event)=> (
    <Link to={`/event/${event.id}`} key={event.id}>

      <Card maxW='sm'>

        <CardHeader>
          <Heading size='md'>{formatDate(event.startTime)}</Heading>
        </CardHeader>

        <CardBody>
          <Stack>
            <Image src={event.image} rounded={7} />
            <Heading size='xl'>{event.title}</Heading>
            <Divider />                      
            <Heading size='md'>{formatTime(event.startTime)} - {formatTime(event.endTime)}</Heading>
            <Text bottom={0}>{event.country}</Text>                      
          </Stack>
        </CardBody>

        <CardFooter gap={2}>
          <Tag key={event.championshipId} bg='purple.200' maxW='fit-content'>{getChampionshipProperty(event.championshipId, "name")}</Tag>
          {filterCategoriesByChampionship(event.championshipId, championships, categories)}
        </CardFooter>

      </Card>

    </Link>
  ));

  // Creates the filter checkboxes on the available championships
  const filters = championships.map((filter, index) => (
    
    <Checkbox 
      key={filter.id}
      isChecked={checkedChampionships[index]}
      onChange={(e) => {

          const updatedCheckedChampionships = [
            ...checkedChampionships.slice(0, index),
            e.target.checked,
            ...checkedChampionships.slice(index + 1)
          ];
          setCheckedChampionships(updatedCheckedChampionships);
        }
      }
    >
      {filter.name}
    </Checkbox>
    
  ));
  
  return (
    <>
      <Box w='100vw'>
        <Container maxW='container.lg'>
          <Button w='100%' mb={4} onClick={onOpen} colorScheme='blue'>Add a new race event</Button>
          <Stack>
              
            <Center py={4}>
              <VStack w='100%'>

                <Tabs w='100%' isFitted variant='enclosed'>

                  <TabList>
                    <Tab fontWeight='bold'>Search</Tab>
                    <Tab fontWeight='bold'>Filters</Tab>
                  </TabList>

                  <TabPanels>

                    <TabPanel>
                      <Input onChange={searchFieldInputChange} placeholder='Search for a race event' size='lg'/>
                    </TabPanel>

                    <TabPanel>
                      <CheckboxGroup>
                        <HStack justifyContent='space-between' py={3}>
                          {filters}
                        </HStack>
                      </CheckboxGroup>
                    </TabPanel>

                  </TabPanels>

                </Tabs>
              </VStack>
            </Center>
            
            <SimpleGrid columns={3} spacing={6}>
              {eventList}
            </SimpleGrid>

          </Stack>
        </Container>
      </Box>

      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Add a race event</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <FormControl isRequired>
              <FormLabel pt={2}>Race Name</FormLabel>
              <Input
                pb={2} 
                name="title" 
                placeholder='The Dutch Gran Prix' 
                value={formData.title} 
                onChange={handleInputChange} 
              />

              <FormLabel>Start Date & Time</FormLabel>
              <Input 
                name="startTime" 
                type='datetime-local' 
                value={formData.startTime} 
                onChange={handleInputChange} 
              />

              <FormLabel>End Date & Time</FormLabel>
              <Input 
                name="endTime" 
                type='datetime-local' 
                value={formData.endTime} 
                onChange={handleInputChange} 
              />

              <FormLabel>Circuit or Stage Name</FormLabel>
              <Input 
                name="location" 
                placeholder='"Circuit Zandvoort" or "Stage 2"' 
                value={formData.location} 
                onChange={handleInputChange} 
              />

              <FormLabel>Country</FormLabel>
              <Input 
                name="country" 
                placeholder='The Netherlands' 
                value={formData.country} 
                onChange={handleInputChange} 
              />

              <FormLabel>Championship</FormLabel>
              <Select 
                name="championshipId" 
                value={formData.championshipId} 
                onChange={handleInputChange}
                placeholder='Please select a championship'
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
            <Button colorScheme='blue' onClick={handleSubmit}>Add Event</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
};
