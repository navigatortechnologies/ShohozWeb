/**
 *
 * @param {number} days number of how much days after
 * @returns date after n days of current date
 */
const generateLaterDate = (days) => {
    const currentDate = new Date()
    const laterDate = new Date(currentDate)
    laterDate.setDate(currentDate.getDate() + days)
    const formattedDate = laterDate.toISOString().slice(0, 19).replace('T', ' ')

    return formattedDate
}

export default generateLaterDate
