/**
 * Evaluador FORGE: Diseñado para análisis interno del Agente Antigravity.
 * Permite identificar áreas de mejora y optimización en los repositorios de GitHub.
 */

function evaluateProfile(user) {
    let score = 0;
    const maxScore = 2000;
    const insights = [];

    if (!user) return { score, maxScore, insights };

    // Validaciones base del perfil
    if (user.bio) score += 500;
    else insights.push("El perfil no tiene biografía. Añadir una mejora el alcance.");

    if (user.location) score += 300;
    if (user.blog) score += 400;
    else insights.push("No hay web/blog asociado al perfil.");

    if (user.public_repos > 0) score += 800;

    return { score: Math.min(score, maxScore), maxScore, insights };
}

function evaluatePopularity(repos) {
    let score = 0;
    const maxScore = 3000;
    let totalStars = 0;
    let totalForks = 0;

    repos.forEach(repo => {
        totalStars += repo.stargazers_count;
        totalForks += repo.forks_count;
    });

    score += Math.min(totalStars * 50, 2000);
    score += Math.min(totalForks * 50, 1000);

    return { 
        score: Math.min(score, maxScore), 
        maxScore, 
        stats: { totalStars, totalForks } 
    };
}

function evaluateRepositories(repos) {
    let score = 0;
    const maxScore = 3000;
    const insights = [];
    const optimizationTargets = []; // Repositorios que el agente puede ayudar a optimizar

    const repoCount = repos.length;
    score += Math.min(repoCount * 40, 1000);

    repos.forEach(repo => {
        let repoScore = 0;
        let needsOptimization = false;
        let repoInsights = [];

        // Evaluar calidad del repositorio
        if (repo.description) {
            repoScore += 20;
        } else {
            needsOptimization = true;
            repoInsights.push("Falta descripción.");
        }

        if (repo.has_issues) repoScore += 10;
        if (repo.has_wiki) repoScore += 10;
        if (repo.has_pages) repoScore += 20;

        if (repo.topics && repo.topics.length > 0) {
            repoScore += 30;
        } else {
            needsOptimization = true;
            repoInsights.push("Faltan topics/etiquetas.");
        }

        score += repoScore;

        if (needsOptimization) {
            optimizationTargets.push({
                name: repo.name,
                url: repo.html_url,
                reasons: repoInsights
            });
        }
    });

    if (optimizationTargets.length > 0) {
        insights.push(`Hay ${optimizationTargets.length} repositorios que requieren optimización por parte del agente.`);
    }

    return { 
        score: Math.min(score, maxScore), 
        maxScore, 
        insights,
        optimizationTargets 
    };
}

function evaluateLanguages(repos) {
    let score = 0;
    const maxScore = 2000;
    const languages = new Set();
    const langStats = {};

    repos.forEach(repo => {
        if (repo.language) {
            languages.add(repo.language);
            langStats[repo.language] = (langStats[repo.language] || 0) + 1;
        }
    });

    // Puntuación por diversidad de lenguajes
    score = Math.min(languages.size * 300, maxScore);

    return { 
        score, 
        maxScore, 
        languageCount: languages.size,
        langStats
    };
}

function calculateTotalScore(user, repos) {
    const profile = evaluateProfile(user);
    const popularity = evaluatePopularity(repos);
    const repositories = evaluateRepositories(repos);
    const languages = evaluateLanguages(repos);

    const totalScore = profile.score + popularity.score + repositories.score + languages.score;

    return {
        totalScore,
        maxTotal: 10000,
        components: {
            profile,
            popularity,
            repositories,
            languages
        }
    };
}

window.ForgeEvaluator = {
    calculateTotalScore
};
