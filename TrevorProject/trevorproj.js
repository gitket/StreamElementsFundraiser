let eventsLimit = 1,
    userLocale = "en-US",
    direction = "top",
    textOrder = "nameFirst",
    minCheer = 0,
	totalEvents = 0,
    fadeoutTime = 999;
	startingAmount = 0;
let intervalTimer;
let proxyUrl = 'https://cors-anywhere.herokuapp.com/';
let targetUrl = 'https://give.thetrevorproject.org/frs-api/fundraising-pages/';
let lastDisplayedId = '';


window.addEventListener('onWidgetLoad', function (obj) {
  
  const fieldData = obj.detail.fieldData;
  audio = fieldData.changeSound;
  scare = fieldData.scareSound;
  cID = fieldData.campaignID; 
  
  if(cID){
    if(window && window.external && window.external.isXsplitShell){
      proxyUrl = '';
    }
    getDonors(true);
    getInitial();
    intervalTimer = setInterval(()=>{
      fetch(proxyUrl + targetUrl + cID)
      .then(blob => blob.json())
      .then(data => {
        let total = data.total_raised;
        let goal = data.goal;
      	if(startingAmount != total){
          startingAmount = total;
          addEvent(total, goal);
    	  getDonors(false);
        }

      })
      .catch(e => {
        addEvent('Error', e.toString());
      });
    }, 30000);
  }

});


function getDonors(first){
  let donorFeed = '/feed-items?with=member,linkable&sort=created_at:desc&per_page=5&campaignId=24399&page=1';
    fetch(proxyUrl + targetUrl + cID + donorFeed)
      .then(blob => blob.json())
      .then(data => {
       console.log(data)
		let latestDonorId = data.data[0].id;
      	let donorhtmlstr = '';
      	data.data.forEach(element =>{
          if(element.linkable){
          	let details = element.linkable;
            let donorName ='Anonymous';
            if(details.member_name){
              let anonName = details.member_name.split(" ");
              donorName = anonName[0] + ' ' + anonName[1].charAt(0);
            }
            let donorAmt = details.donation_gross_amount;
            donorhtmlstr += `<span class='donor-spacer'>${donorName} - $${donorAmt}</span>`
          }
        });
      if(first){
      	lastDisplayedId = latestDonorId;
      }else{ 
        console.log('why u not first')
		setTimeout(()=>queueDonations(data.data), 0);

      }
      
      $(".marquee").remove();
      let donors =   `<p class="marquee">`+donorhtmlstr +`
    </p>`
      $(".marquee-container").prepend(donors);
      })
      .catch(e => {
        addEvent('Error', e.toString());
      });
}

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

// Returns a Promise that resolves after "ms" Milliseconds
function timer(ms) {
 return new Promise(res => setTimeout(res, ms));
}

async function queueDonations (data) { // We need to wrap the loop into an async function for this to work
  for (var i = 0; i < data.length; i++) {
    if(data[i].id != lastDisplayedId){
      	let tmpName = data[i].member_name.split(" ");
        let anonyName = tmpName[0] + ' ' + tmpName[1].charAt(0);
       donationAlert(anonyName, data[i].linkable.donation_gross_amount, data[i].linkable.comment );
       await timer(10000); // then the created Promise can be awaited
  	}else{
       break;
    }    
  }
  lastDisplayedId = data[0].id;
}

function donationAlert(name, donoAmt, message){

  let alertDialog;
  let playMusic = audio;
  if(donoAmt >= 50){
  	playMusic = scare;
  }
  alertDialog= `
	<div class='alert'>
		<div>
    		<span class='donor-highlight'>${name}</span> 
			donated <span class='donor-highlight'>$${donoAmt}</span> 
			to The Trevor Project
  		</div>
  		<br>
  		<div class='donor-message'>
    		${message}
 	 	</div>
      <audio id="audio" autoplay >
      	<source id="alertsound" src="${playMusic}" type="audio/ogg">
      </audio>
 	</div>
 `;
  $(".alert-container").prepend(alertDialog);
  setTimeout(()=>{
    $(".alert").remove();
  }, 7000);
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
      else {
          element =`
          <div class="event-container" id="event-${totalEvents}">
              <div class="backgroundsvg"></div>
              <div class="username-container">The Trevor Project - Total raised: &#36;${total}  </div>
             <div class="goal-container">Goal: &#36;${goal}</div>
          </div>`;
          first = false;
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
