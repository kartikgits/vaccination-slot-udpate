const axios=require('axios')
const request=require('request')
const NodeCache = require( "node-cache" )
const cache = new NodeCache()

class CheckUpdates {

    static getDate() {
        var today = new Date();
        var dd = String(today.getDate()).padStart(2, '0');
        var mm = String(today.getMonth() + 1).padStart(2, '0'); //January is 0!
        var yyyy = today.getFullYear();

        today = dd + '/' + mm + '/' + yyyy;
        return today;
    }

    static sendToTelegram(chatID, text){
        let telegramSendUrl=`https://api.telegram.org/bot1777568327:AAElaoDDA8SmazbQpFDP1l5vPbJIykjTlks/sendMessage?chat_id=${chatID}&text=${text}`
        axios.get(telegramSendUrl)
            .then(response => {
                // console.log(response)
            })
            .catch(error => {
                console.log(error)
            })
    }

    static processApiResponse(cachedCenters, response){
        //check last and this time change here
        const parsedResponse = JSON.parse(response)

        let myPromise = new Promise(function(myResolve, myReject) {
            let centersAvailable=[];
        
            let centers=parsedResponse.centers
            for(var i=0;i<centers.length;i++){
                let sessions=centers[i].sessions
                for(var j=0;j<sessions.length;j++){
                    if(sessions[j].min_age_limit<46 && sessions[j].available_capacity>2){
                        centersAvailable.push(centers[i].name)
                    }
                }
            }
            
            if(centersAvailable.length>0){
                myResolve(centersAvailable)
            }else{
                myReject('nop')
            }
        });
          
        myPromise.then(
            centersAvailable=> {
                let centersAvailableStr = centersAvailable.join('\r\n\n')
                //telegram bot
                let chatIDProduction='-1001438859776'
                let chatIDTrial='-433292314'

                if(cache.get(cachedCenters)!==undefined){
                    if(centersAvailableStr!==cache.get(cachedCenters)){
                        let text=encodeURI("Slots available at:\n\n\n"+centersAvailableStr+"\n\n\nPlease book slots at accessible locations only. #StaySafe")
                        this.sendToTelegram(chatIDTrial, text)
                        console.log('cache not same')
                    }else{
                        console.log('cache same')
                    }
                    cache.set(cachedCenters, centersAvailableStr)
                }else{
                    let text=encodeURI("Slots available at:\n\n\n"+centersAvailableStr+"\n\n\nPlease book slots at accessible locations only. #StaySafe")
                    this.sendToTelegram(chatIDTrial, text)
                    cache.set(cachedCenters, centersAvailableStr)
                    console.log('cache not set')
                }
            },
            error=> {
                console.log(error)
                cache.set(cachedCenters, '')
            }
        );

    }

    static requestApi(){
        const date = this.getDate()
        const pincode1 = '248001'
        // const pincode2 = '248171'
        // const pincode3 = '248007'
        const district_id = '697'
        const apiUrl1 = `https://cdn-api.co-vin.in/api/v2/appointment/sessions/public/calendarByPin?pincode=${pincode1}&date=${date}`
        // const apiUrl2 = `https://cdn-api.co-vin.in/api/v2/appointment/sessions/public/calendarByPin?pincode=${pincode2}&date=${date}`
        // const apiUrl3 = `https://cdn-api.co-vin.in/api/v2/appointment/sessions/public/calendarByPin?pincode=${pincode3}&date=${date}`
        // const apiUrl = `https://cdn-api.co-vin.in/api/v2/appointment/sessions/public/calendarByDistrict?district_id=${district_id}&date=${date}`
        let self = this;

        var options = {
            'method': 'GET',
            'url': apiUrl1,
            'headers': {
                'Host': 'cdn-api.co-vin.in',
                'Origin': 'https://www.cowin.gov.in',
                'Connection': 'keep-alive',
                'User-Agent': 'Mozilla/5.0 (Windows NT 6.3; Win64; x64; rv:88.0) Gecko/20100101 Firefox/88.0',
                'Accept': 'application/json, text/plain, */*',
                'Accept-Language': 'en-US,en;q=0.5',
                'Accept-Encoding': 'gzip, deflate, br',
                'Referer': 'https://www.cowin.gov.in/'
            }
        }

        request(options, function (error, response) {
            if(error){
                console.log(error)
            }else if(response && response.statusCode===200){
                self.processApiResponse('cachedCenters',response.body)
            }
        })

        // request(apiUrl1, function (error, response, body) {
        //     if(error){
        //         console.log(error)
        //     }else if(response && response.statusCode===200){
        //         self.processApiResponse('cachedCenters1',body)
        //     }
        // })

        // request(apiUrl2, function (error, response, body) {
        //     if(error){
        //         console.log(error)
        //     }else if(response && response.statusCode===200){
        //         self.processApiResponse('cachedCenters2',body)
        //     }
        // })

        // request(apiUrl3, function (error, response, body) {
        //     if(error){
        //         console.log(error)
        //     }else if(response && response.statusCode===200){
        //         self.processApiResponse('cachedCenters3',body)
        //     }
        // })


        // var options1 = {
        //     'method': 'GET',
        //     'url': apiUrl1,
        //     'headers': {
        //         'Host': 'cdn-api.co-vin.in',
        //         'Origin': 'https://www.cowin.gov.in',
        //         'Connection': 'keep-alive',
        //         'User-Agent': 'Mozilla/5.0 (Windows NT 6.3; Win64; x64; rv:88.0) Gecko/20100101 Firefox/88.0',
        //         'Accept': 'application/json, text/plain, */*',
        //         'Accept-Language': 'en-US,en;q=0.5',
        //         'Accept-Encoding': 'gzip, deflate, br',
        //         'Referer': 'https://www.cowin.gov.in/'
        //     }
        // }

        // var options2 = {
        //     'method': 'GET',
        //     'url': apiUrl2,
        //     'headers': {
        //         'Host': 'cdn-api.co-vin.in',
        //         'Origin': 'https://www.cowin.gov.in',
        //         'Connection': 'keep-alive',
        //         'User-Agent': 'Mozilla/5.0 (Windows NT 6.3; Win64; x64; rv:88.0) Gecko/20100101 Firefox/88.0',
        //         'Accept': 'application/json, text/plain, */*',
        //         'Accept-Language': 'en-US,en;q=0.5',
        //         'Accept-Encoding': 'gzip, deflate, br',
        //         'Referer': 'https://www.cowin.gov.in/'
        //     }
        // }

        // var options3 = {
        //     'method': 'GET',
        //     'url': apiUrl3,
        //     'headers': {
        //         'Host': 'cdn-api.co-vin.in',
        //         'Origin': 'https://www.cowin.gov.in',
        //         'Connection': 'keep-alive',
        //         'User-Agent': 'Mozilla/5.0 (Windows NT 6.3; Win64; x64; rv:88.0) Gecko/20100101 Firefox/88.0',
        //         'Accept': 'application/json, text/plain, */*',
        //         'Accept-Language': 'en-US,en;q=0.5',
        //         'Accept-Encoding': 'gzip, deflate, br',
        //         'Referer': 'https://www.cowin.gov.in/'
        //     }
        // }

        // request(options1, function (error, response) {
        //     if(error){
        //         console.log(error)
        //     }else if(response && response.statusCode===200){
        //         self.processApiResponse(response.body)
        //     }
        // })

        // request(options2, function (error, response) {
        //     if(error){
        //         console.log(error)
        //     }else if(response && response.statusCode===200){
        //         self.processApiResponse(response.body)
        //     }
        // })

        // request(options3, function (error, response) {
        //     if(error){
        //         console.log(error)
        //     }else if(response && response.statusCode===200){
        //         self.processApiResponse(response.body)
        //     }
        // })

        
    }

}

module.exports = CheckUpdates