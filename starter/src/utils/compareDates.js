export const compareDates = ( dateA, dateB ) => {
    if ( dateA.startTime < dateB.startTime ) {
        return -1;
    } else if ( dateA.startTime > dateB.startTime ) {
        return 1;
    }
    
    // a must be equal to b
    return 0;
}