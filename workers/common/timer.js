/**
 * For global date and time methods.
 * @key SGT: Schemester Global Time: The global notation as YYYYMMDDHHmmSSmmm, in the order of year, month, day, hour, minutes, seconds, milliseconds.
 */
class Time {
  constructor() {}
  /**
   * Returns days in given month of given year.
   * @param {Number} monthIndex The month index of which days to be returned (January = 0).
   * @param {Number} year The year in which the given month index is to be found.
   * @return {Number} Total days in given month index.
   */
  daysInMonth = (monthIndex = Number, year = Number) =>
    new Date(year, monthIndex, 0).getDate();

  /**
   * Returns the current moment in SGT notation.
   * @param {Boolean} stringForm Defaults to true. This ensures that returned time in SGT notation is of type string?true else type number?false.
   * @param {Number} dayincrement The number of days to be incremented in returned SGT time. Defaults to 0.
   */
  getTheMoment = (stringForm = true, dayincrement = 0) => {
    let d = new Date();
    let year = d.getFullYear();
    let month = d.getMonth() + 1;
    let date = d.getDate();
    let incrementedDate = date + dayincrement;
    if (this.daysInMonth(month, year) - incrementedDate < 0) {
      incrementedDate = incrementedDate - this.daysInMonth(month, year);
      if (12 - (month + 1) < 0) {
        month = 13 - month;
        year++;
      } else {
        month++;
      }
    }
    incrementedDate =
      incrementedDate < 10 ? `0${incrementedDate}` : incrementedDate;
    month = month < 10 ? `0${month}` : month;
    let hour = d.getHours() < 10 ? `0${d.getHours()}` : d.getHours();
    let min = d.getMinutes() < 10 ? `0${d.getMinutes()}` : d.getMinutes();
    let insts = d.getSeconds();
    let secs = insts < 10 ? `0${insts}` : insts;
    let instm = d.getMilliseconds();
    let milli = instm < 10 ? `00${instm}` : instm < 100 ? `0${instm}` : instm;
    if (stringForm) {
      return (
        String(year) +
        String(month) +
        String(incrementedDate) +
        String(hour) +
        String(min) +
        String(secs) +
        String(milli)
      );
    } else {
      return Number(
        String(year) +
          String(month) +
          String(incrementedDate) +
          String(hour) +
          String(min) +
          String(secs) +
          String(milli)
      );
    }
  };
  /**
   * Gets current date time in SGT numeric notation.
   * @param {Number} minuteIncrement The number of minutes to be incremented in returned timing. (default=0)
   * @returns {Number} A number showing the current/incremented time in the SGT notation.
   */
  getTheMomentMinute = (minuteIncrement = 0) => {
    let d = new Date();
    let year = d.getFullYear();
    let month = d.getMonth() + 1;
    let date = d.getDate();
    let hour = d.getHours();
    let min = d.getMinutes();
    let incrementMin = min + minuteIncrement;
    if (incrementMin > 59) {
      incrementMin = incrementMin - 60;
      if (24 < hour + 1) {
        //if next hour is next day
        date++;
        if (time.daysInMonth(month, year) < date) {
          date = date - time.daysInMonth(month, year);
          if (12 < month + 1) {
            month = 13 - month;
            year++;
          } else {
            month++;
          }
        }
      } else {
        hour++;
      }
    }
    month = month < 10 ? `0${month}` : month;
    date = date < 10 ? `0${date}` : date;
    hour = hour < 10 ? `0${hour}` : hour;
    incrementMin = incrementMin < 10 ? `0${incrementMin}` : incrementMin;

    let insts = d.getSeconds();
    let secs = insts < 10 ? `0${insts}` : insts;
    let instm = d.getMilliseconds();
    let milli = instm < 10 ? `00${instm}` : instm < 100 ? `0${instm}` : instm;
    return Number(
      String(year) +
        String(month) +
        String(date) +
        String(hour) +
        String(incrementMin) +
        String(secs) +
        String(milli)
    );
  };
}

module.exports = new Time();
