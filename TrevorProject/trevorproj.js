let eventsLimit = 1,
    userLocale = "en-US",
    direction = "top",
    textOrder = "nameFirst",
    minCheer = 0,
	totalEvents = 0,
    fadeoutTime = 999;
	startingAmount = 0;
	first = true;
let timer;
let proxyUrl = 'https://cors-anywhere.herokuapp.com/';
let targetUrl = 'https://give.thetrevorproject.org/frs-api/fundraising-pages/';

window.addEventListener('onWidgetLoad', function (obj) {
  
  const fieldData = obj.detail.fieldData;
  audio = fieldData.changeSound;
  cID = fieldData.campaignID;
  if(cID){
    getInitial();
    timer = setInterval(()=>{
      fetch(proxyUrl + targetUrl + cID)
      .then(blob => blob.json())
      .then(data => {
        let total = data.total_raised;
        let goal = data.goal;
      	if(startingAmount != total){
          startingAmount = total;
          addEvent(total, goal);
        }

      })
      .catch(e => {
        addEvent('Error', e.toString());
      });
    }, 30000);
  }

});

function getInitial(){
  fetch(proxyUrl + targetUrl + cID)
      .then(blob => blob.json())
      .then(data => {
        let total = data.total_raised;
        let goal = data.goal;
      	if(startingAmount != total){
          startingAmount = total;
          addEvent(total, goal);
          first = false;
        }

      })
      .catch(e => {
        addEvent('Error', e.toString());
      });
}

function addEvent(total, goal) {
    totalEvents += 1;
    let element;
  	  if(total == 'Error'){
        element =`
          <div class="event-container" id="event-${totalEvents}">
              ${goal}
          </div>`;
      }
      else if (first) {
          element =`
          <div class="event-container" id="event-${totalEvents}">
              <div class="backgroundsvg"></div>
              <div class="username-container">The Trevor Project - Total raised: &#36;${total}  </div>
             <div class="goal-container">Goal: &#36;${goal}</div>
          </div>`;
          first = false;
    	} else {
        element = `
          <div class="event-container" id="event-${totalEvents}">
              <div class="backgroundsvg"></div>
              <div class="username-container"> The Trevor Project - Total raised: &#36;${total} </div>
             <div class="goal-container">Goal: &#36;${goal}</div>
              <audio id="audio" autoplay >
                  <source id="alertsound" src="${audio}" type="audio/ogg">
              </audio>
          </div>`;
    	}

    $('.main-container').removeClass("fadeOutClass").show().prepend(element);
    if (fadeoutTime !== 999) {
        $('.main-container').addClass("fadeOutClass");
    }
    if (totalEvents > eventsLimit) {
        removeEvent(totalEvents - eventsLimit);
    }
}

function removeEvent(eventId) {
    $(`#event-${eventId}`).animate({
        height: 0,
        opacity: 0
    }, 'slow', function () {
        $(`#event-${eventId}`).remove();
    });
}
