export const adjustColor = (color: string): string => {
  // Assuming color is in hex format, e.g., "#FFFF00" for yellow
  let r = parseInt(color.slice(1, 3), 16);
  let g = parseInt(color.slice(3, 5), 16);
  let b = parseInt(color.slice(5, 7), 16);

  // Adjust the color values
  r = Math.min(255, r - 20); // Increase red component
  g = Math.max(0, g - 62); // Decrease green component
  b = Math.min(255, b - 11); // Blue remains the same

  // Convert back to hex
  const newColor = `#${r.toString(16).padStart(2, "0")}${g
    .toString(16)
    .padStart(2, "0")}${b.toString(16).padStart(2, "0")}`;
  return newColor;
};
