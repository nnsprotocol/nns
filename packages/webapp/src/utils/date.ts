const monthNames = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

export const covertDateToHumanReadable = (dateString: string) => {
  let date: Date;
  if (/^\d+$/.test(dateString)) {
    // Second timestamp
    date = new Date(parseInt(dateString) * 1000);
  } else {
    // Normal date
    date = new Date(dateString);
  }
  const day = date.getDate();
  const month = monthNames[date.getMonth()];
  const year = date.getFullYear();

  return `${day} ${month}, ${year}`;
};
