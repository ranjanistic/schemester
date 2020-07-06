const defaults = require('../modelschema/Defaults.js');
const code = require('../hardcodes/events.js');
class Registration{
    /**
     *  Called only on registration for first time.
     * @param requestBody This contains json form of default details, as schemed in defaults {name:some, email:emailid} like so.
     */
    createInstitutionDefaults(requestBody){
        //if collection(requestBody.institute.uiid) already exists, return 
         code.server.INSTITUTION_EXISTS;
        //else
        var model = defaults.getModelOf(requestBody.institute.uiid)
        new model({
            defaults:[requestBody]
                // requestBody should contain a json structure with values like below.
                // {admin:{
                //     adminName:"Empajj",
                //     email:"someemail@com",
                //     phone:"34987394"
                // },
                // institute:{
                //     instituteName:"School of soe",
                //     uiid:"soeScholl",
                //     subscriptionTill:"9-12-2020 23:59",
                //     active:true
                // },
                // timings:{
                //     startTime:"0830",
                //     endTime:"1400",
                //     breakStartTime:"1045",
                //     startDay:"Monday",
                //     periodMinutes:45,
                //     breakMinutes:15,
                //     periodsInDay:6,
                //     daysInWeek:5
                // }}
        }).save((error,document)=>{
            if(error) {
                console.error(error)
                //return
                code.server.DATABASE_ERROR+error;
            }
            else {console.log(document);
                //return
                code.server.INSTITUTION_CREATED
            }
        })
    }
}

module.exports = new Registration();