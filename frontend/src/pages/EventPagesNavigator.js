
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Axios from '../Axios';

import { EventDetailPage } from './EventDetailPage';
import { EventInsightPage } from './EventInsightPage';

export function EventPageNavigator() {
    const { event_id } = useParams();
    const navigate = useNavigate();
    const [nextPage, setNextPage] = useState(null);

    useEffect(() => {
        const fetchEventDetails = async () => {
          try {
            const response = await Axios.get(`/event/${event_id}`);
            if(response.data && response.data.organizer.organizer_id === localStorage.getItem("userId")){
              setNextPage('event_insight');
            }
          } catch (error) {
            console.error('Failed to fetch event details', error);
          }
    
        }
        fetchEventDetails();

    }, [event_id]);

    
    return (
      <>
        {nextPage === 'event_insight' ? <EventInsightPage /> : <EventDetailPage />}
        
      </>
        
    );


};