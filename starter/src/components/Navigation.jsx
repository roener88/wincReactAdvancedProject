import { Container, Heading, HStack } from '@chakra-ui/react';
import React from 'react';
import { Link } from 'react-router-dom';

export const Navigation = () => {

  return (
    <>
      <Container maxW='container.lg' py={6}>
        <HStack justifyContent='space-between' alignItems='center'>
          <Heading>
            <Link to="/">Race Calendar</Link>
          </Heading>
        </HStack>          
      </Container>
    </>
  );
};
