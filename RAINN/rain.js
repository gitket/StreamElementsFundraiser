let eventsLimit = 1,
    userLocale = "en-US",
    direction = "top",
    textOrder = "nameFirst",
    minCheer = 0,
	totalEvents = 0,
    fadeoutTime = 999;
	startingAmount = 0;
let intervalTimer;
let alertTimer;
let proxyUrl = 'https://cors-anywhere.herokuapp.com/';
//let proxyUrl = 'https://yacdn.org/serve/';
let lastDisplayedId = '';
let alertQueue = [];


window.addEventListener('onWidgetLoad', function (obj) {
  
  const fieldData = obj.detail.fieldData;
  audio = fieldData.changeSound;
  scare = fieldData.scareSound;
  cID = fieldData.campaignID;
  tID = fieldData.teamID;
  displayName = fieldData.displayName;
  apiURL = fieldData.apiURL;
  if(cID){
    if(window && window.external && window.external.isXsplitShell){
      proxyUrl = '';
    }
    getDonors();
    getInitial();
    intervalTimer = setInterval(()=>{
      fetch(proxyUrl + apiURL + tID)
      .then(blob => blob.json())
      .then(data => {
        let total = data.total_raised;
        let goal = data.goal;
    	this.setProgPercent(data.percent_to_goal);
      	if(startingAmount != total){
          startingAmount = total;
          addEvent(total, goal);
    	  getDonors();
        }

      })
      .catch(e => {
        addEvent('Error', e.toString());
      });
    }, 30000);
    alertTimer = setInterval(()=>{
      donationAlert();
    }, 10000)
  }

});


function getDonors(){
  let donorFeed = '/feed-items?with=member,linkable&sort=created_at:desc&per_page=5&campaignId='+cID+'&page=1';
    fetch(proxyUrl + apiURL + tID + donorFeed)
      .then(blob => blob.json())
      .then(data => {
      	console.log(data)
      let latestDonorId = data.data[0].id;
      	let donorhtmlstr = '';
      	let addMoreAlerts = true;
      	data.data.forEach(element =>{
          if(element.linkable){
          	let details = element.linkable;
            let donorName ='Anonymous';
            if(!details.is_anonymous){
              let anonName = details.member_name.split(" ");
              donorName = element.member.first_name + ' ' + element.member.last_name.charAt(0);
            }
            let donorAmt = details.donation_gross_amount;
            donorhtmlstr += `<span class='donor-spacer'>${donorName} - $${donorAmt}</span>`;            
            if(lastDisplayedId && element.id != lastDisplayedId && addMoreAlerts){
             	let alertInfo = {
                  	id: element.id,
             		name: donorName,
              		donoAmt: element.linkable.donation_gross_amount,
              		message: element.linkable.comment
            		}
            		alertQueue.push(alertInfo);
            }else{
              addMoreAlerts = false;
            }
          }
        }); 
      	lastDisplayedId = latestDonorId;
      
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
  fetch(proxyUrl + apiURL + tID)
      .then(blob => blob.json())
      .then(data => {
        let total = data.total_raised;
        let goal = data.goal;
    	this.setProgPercent(data.percent_to_goal);
      	if(startingAmount != total){
          startingAmount = total;
          addEvent(total, goal);
        }

      })
      .catch(e => {
        addEvent('Error', e.toString());
      });
}


function donationAlert(){
  if(alertQueue.length > 0){
    let alertInfo = alertQueue.shift();
    let name = alertInfo.name;
    let donoAmt = alertInfo.donoAmt;
    let message = alertInfo.message;
    let playMusic = audio;
    if(donoAmt >= 50){
      playMusic = scare;
    }
    let alertDialog= `
      <div class='alert'>
          <div>
              <span class='donor-highlight'>${name}</span> 
              donated <span class='donor-highlight'>$${donoAmt}</span> 
              to ${displayName}
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
              <div class="username-container">{displayName} - Total raised: &#36;${total}  </div>
             <div class="goal-container">Goal: &#36;${goal}</div>
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

function setProgPercent(percent_to_goal){
	$('.prog-bar').width(percent_to_goal + '%');
}
