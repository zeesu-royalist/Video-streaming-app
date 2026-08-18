export function formatTimestamp(seconds: number | null | undefined): string {
  if (seconds === null || seconds === undefined || isNaN(seconds) || seconds < 0) {
    return "";
  }
  const s = Math.floor(seconds);
  const hrs = Math.floor(s / 3600);
  const mins = Math.floor((s % 3600) / 60);
  const secs = s % 60;
  const paddedSecs = secs.toString().padStart(2, "0");
  if (hrs > 0) {
    const paddedMins = mins.toString().padStart(2, "0");
    return `${hrs}:${paddedMins}:${paddedSecs}`;
  }
  return `${mins}:${paddedSecs}`;
}

export function formatTimeAgo(dateStr: string): string {
  const now = Date.now();
  const then = new Date(dateStr).getTime();
  const diff = now - then;
  if (isNaN(then) || diff < 0) return "just now";
  const mins = Math.floor(diff / 60000);
  const hours = Math.floor(mins / 60);
  const days = Math.floor(hours / 24);
  const weeks = Math.floor(days / 7);
  const months = Math.floor(days / 30);
  const years = Math.floor(days / 365);
  if (years > 0) return `${years} year${years > 1 ? "s" : ""} ago`;
  if (months > 0) return `${months} month${months > 1 ? "s" : ""} ago`;
  if (weeks > 0) return `${weeks} week${weeks > 1 ? "s" : ""} ago`;
  if (days > 0) return `${days} day${days > 1 ? "s" : ""} ago`;
  if (hours > 0) return `${hours} hour${hours > 1 ? "s" : ""} ago`;
  if (mins > 0) return `${mins} minute${mins !== 1 ? "s" : ""} ago`;
  return "just now";
}

export function getVideoThumbnailUrl(filePath: string): string {
  if (!filePath) return "";
  if (filePath.includes("cloudinary.com") && filePath.includes("/video/upload/")) {
    return filePath
      .replace(/\/video\/upload\/(v\d+\/)?/, "/video/upload/so_0,c_fill,w_640,h_360,q_auto,f_jpg/")
      .replace(/\.[a-zA-Z0-9]+$/, ".jpg");
  }
  return filePath;
}
