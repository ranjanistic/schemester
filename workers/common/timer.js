/**
 * For global date and time methods.
 * @key SGT: Schemester Global Time: The global notation as YYYYMMDDHHmmSSmmm, in the order of year, month, day, hour, minutes, seconds, milliseconds.
 */
class Time {
  constructor() {
    this.keys = ['year','month','day','hour','minute','second','milli']
  }
  /**
   * Returns days in given month of given year.
   * @param {Number} monthIndex The month index of which days to be returned (January = 0).
   * @param {Number} year The year in which the given month index is to be found.
   * @return {Number} Total days in given month index.
   */
  daysInMonth = (monthIndex = Number, year = new Date().getFullYear()) =>
    new Date(year, monthIndex+1, 0).getDate();

  /**
   * Returns the current moment (or incremented) in SGT notation.
   * @param {JSON} increment int objects from any of ['year','month','day','hour','minute','second','milli'] for increment. If not provided, then no increment takes place.
   * @param {Boolean} string Returns string if true, defaults to false (Number).
   * @note The value returned could differ at two different instances because of the shift of milliseconds. Therefore, use a single instance of this method wherever possible.
   */
  getMoment(increment = {
    year:0,
    month:0,
    day:0,
    hour:0,
    minute:0,
    second:0,
    milli:0
  },string = false){
    if(!increment) increment = {}
    this.keys.forEach((k)=>{
      increment[k] = increment[k]?increment[k]:0
    });
    let currentTime = new Date();
    let currentOffset = currentTime.getTimezoneOffset();
    let ISTOffset = 330;   // IST offset UTC +5:30 
    let d = new Date(currentTime.getTime() + (ISTOffset + currentOffset)*60000);
    let year = d.getFullYear();
    let month = d.getMonth();
    let day = d.getDate();
    let hour = d.getHours();
    let min = d.getMinutes();
    let sec = d.getSeconds();
    let milli = d.getMilliseconds();

    if(milli+increment.milli > 999){
      milli = (milli+increment.milli)-1000;
      sec++;
      while(milli>999){
        sec++;
        milli-=1000;
      }
    } else milli += increment.milli;

    if(sec+increment.second > 59){
      sec = (sec+increment.second)-60;
      min++;
      while(sec>59){
        min++;
        sec-=60;
      }
    } else sec += increment.second;

    if(min+increment.minute > 59){
      min = (min+increment.minute) - 60;
      hour++;
      while(min>59){
        hour++;
        min-=60;
      }
    } else min += increment.minute;

    if(hour+increment.hour>23){
      hour = (hour+increment.hour)-24;
      day++
      while(hour>23){
        day++;
        hour -= 24;
      }
    } else hour += increment.hour;

    if(day+increment.day>this.daysInMonth(month)){
      day = (day+increment.day)-this.daysInMonth(month)
      month++;
      while(day>this.daysInMonth(month)){  
        month++;
        day -= this.daysInMonth(month);
      }
    } else day += increment.day;

    month++;
    if(month+increment.month>12){
      month = month+increment.month -12
      year++;
      while(month>12){
        year++;
        month -= 12;
      }
    } else month += increment.month;

    year+=increment.year;
    return this.getTemplateNotation(year,month,day,hour,min,sec,milli,string);
  }

  getTemplateNotation(year,month,day,hour,minute,seconds,millis,string = false){
    if(month<10) month = `0${month}`;
    if(day<10) day = `0${day}`;
    if(hour<10) hour = `0${hour}`;
    if(minute<10) minute = `0${minute}`;
    if(seconds<10) seconds = `0${seconds}`;
    if(millis<10) millis = `00${millis}`;
    else if(millis<100) millis = `0${millis}`;
    return string?`${year}${month}${day}${hour}${minute}${seconds}${millis}`:Number(`${year}${month}${day}${hour}${minute}${seconds}${millis}`);
  }

  /**
   * @deprecated As of November 30, 2020 03:30 IST
   * @see Time.getMoment() method.
   * Returns the current moment in SGT notation.
   * @param {Boolean} stringForm Defaults to true. This ensures that returned time in SGT notation is of type string?true else type number?false.
   * @param {Number} dayincrement The number of days to be incremented in returned SGT time. Defaults to 0.
   */
  getTheMoment = (stringForm = true, dayincrement = 0) => this.getMoment({day:dayincrement},stringForm);

  /**
   * @deprecated As of November 30, 2020 03:30 IST
   * @see Time.getMoment() method.
   * Gets current date time in SGT notation.
   * @param {Number} minuteIncrement The number of minutes to be incremented in returned timing. (default=0)
   * @returns current/incremented time in the SGT notation.
   */
  getTheMomentMinute = (minuteIncrement = 0,stringform = true) => this.getMoment({minute:minuteIncrement},stringform);

}

module.exports = new Time();
