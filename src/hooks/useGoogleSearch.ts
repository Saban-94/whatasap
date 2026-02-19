export const useGoogleSearch = () => {
  const search = async (query: string, type: "image" | "video") => {
    try {
      const res = await fetch("/api/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query, type }),
      });
      return await res.json();
    } catch (err) {
      console.error("Search Hook Error:", err);
      return {};
    }
  };

  return { 
    searchImages: (q: string) => search(q, "image"), 
    searchVideo: (q: string) => search(q, "video") 
  };
};
