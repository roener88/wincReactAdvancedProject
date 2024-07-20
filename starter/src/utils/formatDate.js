export const formatDate = (date) => {

    const dateObject = new Date(date);

    const weekdays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

    const weekday = weekdays[dateObject.getDay()];
    const month = months[dateObject.getMonth()];
    const day = dateObject.getDate();

    return `${weekday} ${day} ${month}`;
}