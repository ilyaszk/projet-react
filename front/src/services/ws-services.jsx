// Méthode GET
export const fetchData = async (pUrl) => {
  try {
    console.log("API URL:"); // Ajoutez cette ligne pour vérifier la variable d'environnement

    // const response = await fetch(`${process.env.REACT_APP_API_URL}${pUrl}`);
    // const response = await fetch(`http://localhost:3000${pUrl}`);
    const response = await fetch(
      `https://projet-react-memg.onrender.com${pUrl}`
    );
    if (!response.ok) {
      throw new Error("Erreur lors de la récupération des données");
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Erreur:", error);
    throw error;
  }
};

// Méthode POST
export const postData = async (pUrl, pData) => {
  try {
    // const response = await fetch(`${process.env.REACT_APP_API_URL}${pUrl}`, {
    // const response = await fetch(`http://localhost:3000${pUrl}`, {
    const response = await fetch(
      `https://projet-react-memg.onrender.com${pUrl}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          authorization: localStorage.getItem("token")
            ? "Bearer " + localStorage.getItem("token")
            : "",
        },
        body: JSON.stringify(pData),
      }
    );
    if (!response.ok) {
      throw new Error("Erreur lors de l'envoi des données");
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Erreur:", error);
    throw error;
  }
};
