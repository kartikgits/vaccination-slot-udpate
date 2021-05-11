const axios=require('axios')
const request=require('request')

class CheckUpdates {

    static getDate() {
        var today = new Date();
        var dd = String(today.getDate()).padStart(2, '0');
        var mm = String(today.getMonth() + 1).padStart(2, '0'); //January is 0!
        var yyyy = today.getFullYear();

        today = dd + '/' + mm + '/' + yyyy;
        return today;
    }

    static processApiResponse(response){
        //check last and this time change here
        const parsedResponse = JSON.parse(response)
        
        let centersAvailable=[];
        
        let centers=parsedResponse.centers
        for(var i=0;i<centers.length;i++){
            let sessions=centers[i].sessions
            for(var j=0;j<sessions.length;j++){
                if(sessions[j].min_age_limit<46 && sessions[j].available_capacity>0){
                    centersAvailable.push(centers[i].name)
                }
            }
        }

        if(centersAvailable.length>0){
            //send to telegram bot
            let chatIDProduction='-1001438859776'
            let chatIDTrial='-433292314'
            let text=encodeURI("Slots available at:\n\n\n"+centersAvailable.join('\r\n\n')+"\n\n\nPlease book slots at accessible locations only. #StaySafe")
            let telegramSendUrl=`https://api.telegram.org/bot1777568327:AAElaoDDA8SmazbQpFDP1l5vPbJIykjTlks/sendMessage?chat_id=${chatIDTrial}&text=${text}`
            axios.get(telegramSendUrl)
                .then(response => {
                    // console.log(response)
                })
                .catch(error => {
                    console.log(error)
                })
        }
    }

    static requestApi(){
        const date = this.getDate()
        const pincode = '248001'
        const apiUrl = `https://cdn-api.co-vin.in/api/v2/appointment/sessions/public/calendarByPin?pincode=${pincode}&date=${date}`
        
        let self = this;

        request(apiUrl, function (error, response, body) {
            if(error){
                console.log(error)
            }else if(response && response.statusCode===200){
                self.processApiResponse(body)
            }
        });
        
    }

}

module.exports = CheckUpdates