export async function shareUrl(url: string, title: string, text: string) {
  try {
    if (navigator.share) {
      await navigator.share({
        title,
        text,
        url,
      });
      return true;
    } else {
      await navigator.clipboard.writeText(url);
      alert("Link copied to clipboard!");
      return true;
    }
  } catch (err: any) {
    // User cancelled or error - try clipboard as fallback
    if (err.name !== 'AbortError') {
      try {
        await navigator.clipboard.writeText(url);
        alert("Link copied to clipboard!");
        return true;
      } catch (clipboardErr) {
        console.error("Failed to copy:", clipboardErr);
        return false;
      }
    }
    return false;
  }
}
