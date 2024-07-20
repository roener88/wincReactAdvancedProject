// context/EventContext.js
import React, { createContext, useState, useContext, useEffect } from 'react';

// Maak de context
const EventContext = createContext();

// Maak een provider component
export const EventProvider = ({ children }) => {
  const [events, setEvents] = useState([]);

  useEffect(() => {
    const fetchEvents = async () => {
      const response = await fetch('http://localhost:3000/events');
      const data = await response.json();
      setEvents(data);
    };

    fetchEvents();
  }, [events]);

  return (
    <EventContext.Provider value={{ events, setEvents }}>
      {children}
    </EventContext.Provider>
  );
};

// Maak een custom hook om de context te gebruiken
export const useEventContext = () => {
  return useContext(EventContext);
};
