document.addEventListener('DOMContentLoaded', function () {
    // Load the data.json file
    fetch('data.json')
        .then(response => response.json())
        .then(data => {
            // Update dashboard stats
            document.getElementById('total-websites').textContent = data.length;

            // Find most common theme
            const themes = {};
            data.forEach(site => {
                const theme = site.theme || 'Unknown';
                themes[theme] = (themes[theme] || 0) + 1;
            });

            const mostCommonTheme = Object.entries(themes)
                .sort((a, b) => b[1] - a[1])[0][0];
            document.getElementById('common-theme').textContent = mostCommonTheme;

            // Find top technology
            const techs = {};
            data.forEach(site => {
                (site.technologies || []).forEach(tech => {
                    techs[tech] = (techs[tech] || 0) + 1;
                });
            });

            const topTech = Object.entries(techs).length > 0
                ? Object.entries(techs).sort((a, b) => b[1] - a[1])[0][0]
                : 'None';
            document.getElementById('top-tech').textContent = topTech;

            // Set last updated date
            const today = new Date();
            const formattedDate = today.toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            });
            document.getElementById('last-updated').textContent = formattedDate;
            document.getElementById('current-date').textContent = formattedDate;

            // Generate tech tag cloud
            const techTagsContainer = document.getElementById('tech-tags');
            const sortedTechs = Object.entries(techs)
                .sort((a, b) => b[1] - a[1])
                .slice(0, 15);

            sortedTechs.forEach(([tech, count]) => {
                const tag = document.createElement('span');
                tag.className = 'tech-tag';
                tag.textContent = `${tech} (${count})`;
                tag.addEventListener('click', () => {
                    document.getElementById('searchProjects').value = tech;
                    document.getElementById('searchProjects').dispatchEvent(new Event('keyup'));
                });
                techTagsContainer.appendChild(tag);
            });

            // Generate portfolio items
            const portfolioContainer = document.getElementById('portfolio-items');

            data.forEach(site => {
                const domain = site.domain || '';
                const url = site.url || '';
                const thumbnail = site.thumbnail || '';
                const theme = site.theme || 'Unknown';
                const technologies = site.technologies || [];
                const keywords = site.keywords || [];
                const description = site.description || '';
                const lastUpdated = site.last_updated || '';

                // Generate color and initials for fallback image
                const color = getColorForDomain(domain);
                const initials = getInitials(domain);

                // Create portfolio item
                const item = document.createElement('div');
                item.className = 'portfolio-item';
                item.setAttribute('data-domain', domain);
                item.setAttribute('data-theme', theme);
                item.setAttribute('data-keywords', keywords.join(','));
                item.setAttribute('data-tech', technologies.join(','));

                // Create HTML content
                item.innerHTML = `
                                <div class="thumbnail-container">
                                    <img src="${thumbnail}" alt="${domain}" onerror="
                                        if (!this.getAttribute('data-error-handled')) {
                                            this.setAttribute('data-error-handled', 'true');

                                            // Try loading the website in an iframe
                                            const iframe = document.createElement('iframe');
                                            iframe.src = '${url}';
                                            iframe.sandbox = 'allow-same-origin allow-scripts';
                                            iframe.onload = () => {
                                                // Iframe loaded successfully
                                            };

                                            // Add iframe-active class to the image container for potential styling
                                            this.parentNode.classList.add('iframe-active');

                                            // Hide the image and insert iframe before it
                                            this.style.display = 'none';
                                            this.parentNode.insertBefore(iframe, this);

                                            // Handle iframe loading failure after timeout
                                            setTimeout(() => {
                                                if (iframe.contentDocument &&
                                                    (iframe.contentDocument.body === null ||
                                                     iframe.contentDocument.body.innerHTML === '')) {
                                                    iframe.remove();
                                                    this.style.display = 'block';
                                                                                                    this.src = 'data:image/svg+xml;utf8,<svg xmlns=\\'http://www.w3.org/2000/svg\\' width=\\'300\\' height=\\'200\\' viewBox=\\'0 0 300 200\\'><rect fill=\\'%23${color}\\' width=\\'300\\' height=\\'200\\'></rect><text fill=\\'%23fff\\' font-family=\\'Arial\\' font-size=\\'30\\' font-weight=\\'bold\\' text-anchor=\\'middle\\' x=\\'150\\' y=\\'110\\'>${initials}</text></svg>';
                                                    this.parentNode.classList.remove('iframe-active');
                                                }
                                            }, 5000);
                                        } else {
                                            this.src = 'data:image/svg+xml;utf8,<svg xmlns=\\'http://www.w3.org/2000/svg\\' width=\\'300\\' height=\\'200\\' viewBox=\\'0 0 300 200\\'><rect fill=\\'%23${color}\\' width=\\'300\\' height=\\'200\\'></rect><text fill=\\'%23fff\\' font-family=\\'Arial\\' font-size=\\'30\\' font-weight=\\'bold\\' text-anchor=\\'middle\\' x=\\'150\\' y=\\'110\\'>${initials}</text></svg>';
                                        }">
                                </div>
                                <div class="content">
                                    <div class="domain"><a href="${url}" target="_blank">${domain}</a></div>
                                    <div class="theme">${theme}</div>
                                    <div class="technologies">Technologies: ${technologies.join(', ') || 'None detected'}</div>
                                    <div class="description">
                                        ${description}
                                    </div>
                                    <div class="tech-tags">
                                        ${keywords.map(kw => `<span class="tech-tag">${kw}</span>`).join('')}
                                    </div>
                                </div>
                            `;

                portfolioContainer.appendChild(item);
            });

            // Set up search functionality
            const searchProjects = document.getElementById('searchProjects');
            const portfolioItems = document.querySelectorAll('.portfolio-item');

            searchProjects.addEventListener('keyup', function () {
                const searchTerm = this.value.toLowerCase();

                portfolioItems.forEach(item => {
                    const domain = item.getAttribute('data-domain').toLowerCase();
                    const theme = item.getAttribute('data-theme').toLowerCase();
                    const keywords = item.getAttribute('data-keywords').toLowerCase();
                    const tech = item.getAttribute('data-tech').toLowerCase();

                    if (domain.includes(searchTerm) ||
                        theme.includes(searchTerm) ||
                        keywords.includes(searchTerm) ||
                        tech.includes(searchTerm)) {
                        item.style.display = 'block';
                    } else {
                        item.style.display = 'none';
                    }
                });
            });

            // Set up filter buttons
            const filterButtons = document.querySelectorAll('.filter-btn');

            filterButtons.forEach(button => {
                button.addEventListener('click', function () {
                    // Remove active class from all buttons
                    filterButtons.forEach(btn => btn.classList.remove('active'));

                    // Add active class to clicked button
                    this.classList.add('active');

                    const filter = this.getAttribute('data-filter');

                    portfolioItems.forEach(item => {
                        if (filter === 'all') {
                            item.style.display = 'block';
                        } else {
                            const theme = item.getAttribute('data-theme').toLowerCase();
                            if (theme.includes(filter)) {
                                item.style.display = 'block';
                            } else {
                                item.style.display = 'none';
                            }
                        }
                    });
                });
            });
        })
        .catch(error => {
            console.error('Error loading portfolio data:', error);
            document.getElementById('portfolio-items').innerHTML =
                '<p style="text-align: center; width: 100%;">Error loading portfolio data. Please try again later.</p>';
        });
});

// Helper functions
function getColorForDomain(domain) {
    let hashValue = 0;
    for (let i = 0; i < domain.length; i++) {
        hashValue = ((hashValue << 5) - hashValue) + domain.charCodeAt(i);
        hashValue = hashValue & 0xFFFFFF;
    }

    // Convert to hex and ensure it's 6 characters
    return (hashValue & 0xFFFFFF).toString(16).padStart(6, '0');
}

function getInitials(domain) {
    const domainName = domain.split('.')[0];
    if (domainName.length >= 2) {
        return domainName.substring(0, 2).toUpperCase();
    }
    return domainName.toUpperCase();
}