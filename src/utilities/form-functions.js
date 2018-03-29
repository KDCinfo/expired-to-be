export const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']

const countDays = (thisDate) => {
                                                            // thisDate : string : 20170619
    const monthSelect = parseFloat(thisDate.substr(4, 2)),  // 6
          month = months[parseFloat(monthSelect)-1],        // Jun
          yearSelect = parseFloat(thisDate.substr(0, 4))    // 2017

    let dayNum

    if(month === 'Jan' | month === 'Mar' | month === 'May' | month === 'Jul' | month === 'Aug' | month === 'Oct' | month === 'Dec') {
        dayNum = 31
    } else if(month === 'Apr' | month === 'Jun' | month === 'Sep' | month === 'Nov') {
        dayNum = 30
    } else {
        (yearSelect - 2016) % 4 === 0 ? dayNum = 29 : dayNum = 28
    }
    return dayNum
}

export function populateDays(thisDate) {
    return Array.from(Array(countDays(thisDate)), (e,i)=>i+1)
}
