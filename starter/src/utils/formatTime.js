export const formatTime = (date) => {

    const dateObject = new Date(date);

    let hours = dateObject.getHours();
    let minutes = dateObject.getMinutes();

    hours = hours < 10 ? '0' + hours : hours;
    minutes = minutes < 10 ? '0' + minutes : minutes;

    return `${hours}:${minutes}`;
}