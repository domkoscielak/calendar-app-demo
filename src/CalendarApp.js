import React, { useState, useEffect } from 'react';
import axios from 'axios';

const dataSets = [
  'dataset1.json',
  'dataset2.json',
  'dataset3.json'
];

function availibilityStatus(statusCode){
  let status = {};
  switch(statusCode){
    case 1:
      status.text = 'available';
      status.className = 'available';
      break;
    case 0:
      status.text = 'booked';
      status.className = 'booked';
      break;
    case -1:
      status.text = 'out of service';
      status.className = 'oos';
      break;
    default:
      status.text = 'N/A';
      status.className = 'oos';
  }
  return '<span class="calendar__status calendar__status--'+status.className+'">'+status.text+'</span>';
}

export default function CalendarApp() {

    const [availability, setAvailability] = useState([]);
    const [days, setDays] = useState([]);
    const [currentDataSet, setCurrentDataSet] = useState(1);
    const [showMask, setShowMask] = useState(true);

    const fetchData = (dataSet)=>{
      // Show loading spinner mask
      setShowMask(true);
      // Get data
      axios.get('https://storage.googleapis.com/demo-app-misc/calendar-data/'+dataSet)
      .then(({ data })=> {

        setDays(data.data.days); // Set days state with fetched days data
        let fetchedAvailability = data.data.availability; // Fetched availibility data
        let availabilityArray = []; // Array to store formatted availibility data objects
        
        // Loop over object to format data and store it in the availabilityArray
        for (let key in fetchedAvailability) {
          if (fetchedAvailability.hasOwnProperty(key)) {
            availabilityArray = [...availabilityArray,{
              time: key,
              availability: fetchedAvailability[key]
            }]
          }
        }

        setAvailability(availabilityArray); // Set availability state
        
        setTimeout(()=>{
          // fake network delay to show loading spinner
          setShowMask(false);
        },300);
        
      })
      .catch((err)=> {})
    }

    useEffect(()=>{
      // Initial data fetch
      fetchData(dataSets[currentDataSet]);
    },[]);

    function handleNextPrevClick(event,num){
      event.preventDefault();
      const dataSetIndex = currentDataSet + num;

      if(dataSetIndex == dataSets.length || dataSetIndex < 0 ){
        return false;
      }
      
      fetchData(dataSets[dataSetIndex]);
      setCurrentDataSet(dataSetIndex);
      
      if(dataSetIndex==dataSets.length-1 || dataSetIndex == 0 ){
        event.target.classList.add('controls__btn--disabled');
      }else{
        document.querySelectorAll('.controls__btn').forEach((el)=>{  
          el.classList.remove('controls__btn--disabled');
        });
      }
      
    }
    
    return (
      <main className="component">
        <div className="calendar">
          {days.map((day,index)=>{
            return(
              <div className="calendar__field calendar__field--date" key={index}>{day}</div>
            )
          })}

          {availability.map((timeSlot)=>{
            return(
              timeSlot['availability'].map((status,index)=>{
                return(
                  <div className="calendar__field" key={index}>
                    <span className="calendar__time">{timeSlot.time}</span>
                    <div dangerouslySetInnerHTML={{ __html:availibilityStatus(status)}} ></div>
                  </div>
                )
              })
            )
            
          })}
          {showMask && 
              <div className="mask"></div>
          }
        </div>
        <nav className="controls">
          <button className="controls__btn" onClick={event => handleNextPrevClick(event,-1)}>&#8678; Prev</button>
          <button className="controls__btn" onClick={event => handleNextPrevClick(event,1)}>Next &#8680;</button>
        </nav>
      </main>
    );
  }