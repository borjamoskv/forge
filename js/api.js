const API_BASE = 'https://api.github.com';
const USERNAME = 'borjamoskv';

async function fetchUser() {
    try {
        const response = await fetch(`${API_BASE}/users/${USERNAME}`);
        if (!response.ok) throw new Error('Error al obtener perfil');
        return await response.json();
    } catch (error) {
        console.error('API Error:', error);
        return null;
    }
}

async function fetchRepos() {
    try {
        // Obtenemos los repositorios (máximo 100 por ahora para el análisis interno del agente)
        const response = await fetch(`${API_BASE}/users/${USERNAME}/repos?per_page=100&sort=updated`);
        if (!response.ok) throw new Error('Error al obtener repositorios');
        return await response.json();
    } catch (error) {
        console.error('API Error:', error);
        return [];
    }
}

window.ForgeAPI = {
    fetchUser,
    fetchRepos
};
