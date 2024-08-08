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
  // Step 1: Parse the date string into a Date object (2025-06-10T00:00:00)
  const date = new Date(dateString);

  // Step 2: Extract the day, month, and year
  const day = date.getDate();
  const month = monthNames[date.getMonth()];
  const year = date.getFullYear();

  // Step 3: Format the extracted values into the desired format
  const formattedDate = `${day} ${month}, ${year}`;

  return formattedDate
};
