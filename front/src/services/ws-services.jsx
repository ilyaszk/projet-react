const API_URL = 'https://projet-react-memg.onrender.com';
// Méthode GET
export const fetchData = async (pUrl) => {
    try {
        const response = await fetch(API_URL + pUrl);
        if (!response.ok) {
            throw new Error('Erreur lors de la récupération des données');
        }
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Erreur:', error);
        throw error;
    }

};

// Méthode POST
export const postData = async (pUrl, pData) => {
    try {
        const response = await fetch(API_URL + pUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'authorization': localStorage.getItem('token') ? 'Bearer ' + localStorage.getItem('token') : ''
            },
            body: JSON.stringify(pData)
        });
        if (!response.ok) {
            throw new Error('Erreur lors de l\'envoi des données');
        }
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Erreur:', error);
        throw error;
    }
};
