export const useGoogleSearch = () => {
  const searchImages = async (query: string) => {
    const res = await fetch("/api/search", {
      method: "POST",
      body: JSON.stringify({ query, type: "image" }),
    });
    const j = await res.json();
    return j?.imageUrl;
  };

  const searchVideo = async (query: string) => {
    const res = await fetch("/api/search", {
      method: "POST",
      body: JSON.stringify({ query, type: "video" }),
    });
    const j = await res.json();
    return j?.videoUrl;
  };

  return { searchImages, searchVideo };
};
