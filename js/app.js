document.addEventListener('DOMContentLoaded', async () => {
    // Inicializar visuales
    const scoreElement = document.getElementById('totalScore');
    const scoreProgress = document.getElementById('scoreProgress');
    const scoreTier = document.getElementById('scoreTier');
    
    // Elements - Metrics
    const fillProfile = document.getElementById('fillProfile');
    const fillPopularity = document.getElementById('fillPopularity');
    const fillRepos = document.getElementById('fillRepos');
    const fillLangs = document.getElementById('fillLangs');

    const ptsProfile = document.getElementById('ptsProfile');
    const ptsPopularity = document.getElementById('ptsPopularity');
    const ptsRepos = document.getElementById('ptsRepos');
    const ptsLangs = document.getElementById('ptsLangs');

    const reposList = document.getElementById('reposList');
    const repoCountLabel = document.getElementById('repoCountLabel');

    try {
        // Fetch data
        const [user, repos] = await Promise.all([
            window.ForgeAPI.fetchUser(),
            window.ForgeAPI.fetchRepos()
        ]);

        if (!user || !repos) {
            scoreTier.textContent = "ERROR AL CONECTAR";
            return;
        }

        // Evaluar
        const evaluation = window.ForgeEvaluator.calculateTotalScore(user, repos);
        
        // Actualizar UI - Avatar & Username
        document.getElementById('navAvatar').src = user.avatar_url || 'https://github.com/borjamoskv.png';
        document.getElementById('navUsername').textContent = user.login;

        // Animar el contador principal
        animateValue(scoreElement, 0, evaluation.totalScore, 2000);
        
        // Actualizar anillo de progreso (stroke-dasharray="progress, 100")
        const progressPercentage = (evaluation.totalScore / 10000) * 100;
        setTimeout(() => {
            scoreProgress.style.strokeDasharray = `${progressPercentage}, 100`;
        }, 100);

        // Tier logic
        if (evaluation.totalScore > 8000) {
            scoreTier.textContent = "RANGO: TITÁN (S)";
            scoreTier.style.background = "linear-gradient(90deg, #ff00ff, #7000ff)";
        } else if (evaluation.totalScore > 6000) {
            scoreTier.textContent = "RANGO: ÉLITE (A)";
            scoreTier.style.background = "linear-gradient(90deg, #00f0ff, #0077ff)";
        } else if (evaluation.totalScore > 4000) {
            scoreTier.textContent = "RANGO: AVANZADO (B)";
            scoreTier.style.background = "linear-gradient(90deg, #00ff88, #00aaff)";
        } else {
            scoreTier.textContent = "RANGO: INICIADO (C)";
            scoreTier.style.background = "linear-gradient(90deg, #ffb800, #ff5500)";
        }

        // Actualizar métricas secundarias
        updateMetricBar(fillProfile, ptsProfile, evaluation.components.profile.score, 2000);
        updateMetricBar(fillPopularity, ptsPopularity, evaluation.components.popularity.score, 3000);
        updateMetricBar(fillRepos, ptsRepos, evaluation.components.repositories.score, 3000);
        updateMetricBar(fillLangs, ptsLangs, evaluation.components.languages.score, 2000);

        // Renderizar gráfica de lenguajes
        renderLanguageChart(evaluation.components.languages.langStats);

        // Renderizar lista de repos y objetivos de optimización para el Agente
        renderRepositories(repos, evaluation.components.repositories.optimizationTargets);

    } catch (error) {
        console.error("Error inicializando FORGE:", error);
        scoreTier.textContent = "ERROR CRÍTICO";
    }
});

function animateValue(obj, start, end, duration) {
    let startTimestamp = null;
    const step = (timestamp) => {
        if (!startTimestamp) startTimestamp = timestamp;
        const progress = Math.min((timestamp - startTimestamp) / duration, 1);
        // Easing easeOutQuart
        const easeProgress = 1 - Math.pow(1 - progress, 4);
        obj.innerHTML = Math.floor(easeProgress * (end - start) + start);
        if (progress < 1) {
            window.requestAnimationFrame(step);
        }
    };
    window.requestAnimationFrame(step);
}

function updateMetricBar(barElement, textElement, score, maxScore) {
    setTimeout(() => {
        const percent = (score / maxScore) * 100;
        barElement.style.width = `${percent}%`;
        animateValue(textElement, 0, score, 1500);
    }, 300);
}

function renderLanguageChart(langStats) {
    const ctx = document.getElementById('languageChart');
    if (!ctx) return;

    const labels = Object.keys(langStats);
    const data = Object.values(langStats);
    
    // Paleta ciberpunk para la gráfica
    const colors = ['#00f0ff', '#7000ff', '#00ff88', '#ff00ff', '#ffb800', '#ff0055'];

    new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: labels,
            datasets: [{
                data: data,
                backgroundColor: colors,
                borderWidth: 0,
                hoverOffset: 10
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'right',
                    labels: { color: '#94a3b8', font: { family: 'Space Grotesk' } }
                }
            },
            cutout: '70%'
        }
    });
}

function renderRepositories(repos, optimizationTargets) {
    const list = document.getElementById('reposList');
    document.getElementById('repoCountLabel').textContent = `${repos.length} encontrados`;
    
    list.innerHTML = ''; // Limpiar loader

    // Primero renderizar los objetivos de optimización (para uso interno del agente)
    if (optimizationTargets && optimizationTargets.length > 0) {
        const alertDiv = document.createElement('div');
        alertDiv.style.background = 'rgba(255, 0, 85, 0.1)';
        alertDiv.style.border = '1px solid rgba(255, 0, 85, 0.4)';
        alertDiv.style.padding = '1rem';
        alertDiv.style.borderRadius = '12px';
        alertDiv.style.marginBottom = '1rem';
        alertDiv.innerHTML = `<h4 style="color: #ff0055; margin-bottom: 0.5rem;">⚠️ Alerta de Optimización (Interno Agente)</h4>
                              <p style="font-size: 0.85rem; color: #94a3b8;">Existen ${optimizationTargets.length} repositorios que requieren mi ayuda para ser optimizados (añadir descripciones, etiquetas, etc).</p>`;
        list.appendChild(alertDiv);
    }

    // Renderizar repositorios ordenados por estrellas
    const sortedRepos = repos.sort((a, b) => b.stargazers_count - a.stargazers_count);

    sortedRepos.forEach(repo => {
        // Verificar si requiere optimización
        const optTarget = optimizationTargets.find(t => t.name === repo.name);
        
        const el = document.createElement('a');
        el.href = repo.html_url;
        el.target = "_blank";
        el.className = 'repo-item';
        
        // Estilo especial si necesita optimización
        if (optTarget) {
            el.style.borderLeft = '3px solid #ff0055';
        }

        const langColor = repo.language ? '#00f0ff' : '#94a3b8';

        let optimizationBadge = optTarget 
            ? `<div style="font-size: 0.7rem; color: #ff0055; margin-top: 0.5rem;">⚠️ Requiere optimización: ${optTarget.reasons.join(', ')}</div>` 
            : '';

        el.innerHTML = `
            <div class="repo-main">
                <h4>${repo.name}</h4>
                <p>${repo.description || '<i>Sin descripción</i>'}</p>
                ${optimizationBadge}
                <div class="repo-stats">
                    <div class="repo-stat">
                        <span class="repo-lang-dot" style="background-color: ${langColor}"></span>
                        ${repo.language || 'N/A'}
                    </div>
                    <div class="repo-stat">⭐ ${repo.stargazers_count}</div>
                    <div class="repo-stat">🔄 ${repo.forks_count}</div>
                </div>
            </div>
        `;
        list.appendChild(el);
    });
}
