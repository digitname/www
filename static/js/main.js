// Main JavaScript for the portfolio

// Funkcja do logowania z możliwością wyłączenia
let loggingEnabled = true;

function log(message, level = 'info') {
    if (loggingEnabled) {
        const timestamp = new Date().toISOString().substr(11, 12);
        switch(level) {
            case 'error':
                console.error(`[ERROR ${timestamp}] ${message}`);
                break;
            case 'warn':
                console.warn(`[WARN ${timestamp}] ${message}`);
                break;
            case 'debug':
                console.debug(`[DEBUG ${timestamp}] ${message}`);
                break;
            default:
                console.log(`[INFO ${timestamp}] ${message}`);
        }
    }
}

// Ładowanie konfiguracji
function loadConfig() {
    return fetch('/static/js/config.json')
        .then(response => {
            if (!response.ok) {
                throw new Error('Nie udało się załadować konfiguracji');
            }
            return response.json();
        })
        .then(config => {
            log('Konfiguracja załadowana');
            loggingEnabled = config.loggingEnabled;
            log('Logowanie ' + (loggingEnabled ? 'włączone' : 'wyłączone'));
            return config;
        })
        .catch(error => {
            log('Błąd podczas ładowania konfiguracji: ' + error.message, 'error');
            // Domyślna konfiguracja w razie błędu
            return {
                loggingEnabled: true,
                defaultTheme: 'dark',
                portfolioDataPath: '/data/portfolio.json',
                debugLevel: 'verbose',
                sections: {
                    header: true,
                    about: true,
                    skills: true,
                    portfolio: true,
                    experience: true,
                    domains: true,
                    contact: true
                }
            };
        });
}

// Ukryj spinner/loader po załadowaniu strony
function hideLoader() {
    log('Ukrywanie loadera');
    const loader = document.getElementById('loader');
    if (loader) {
        loader.style.display = 'none';
        log('Loader ukryty');
    } else {
        log('Element loader nie znaleziony', 'warn');
    }
    
    const portfolioLoading = document.getElementById('portfolio-loading');
    if (portfolioLoading) {
        portfolioLoading.style.display = 'none';
        log('Portfolio loading ukryty');
    } else {
        log('Element portfolio-loading nie znaleziony', 'warn');
    }
}

// Inicjalizacja trybu ciemnego
function initDarkMode(config) {
    log('Inicjalizacja trybu ciemnego');
    const toggleButton = document.getElementById('dark-mode-toggle');
    const rootElement = document.documentElement;
    
    // Ustaw domyślny motyw z konfiguracji
    const defaultTheme = config.defaultTheme || 'dark';
    rootElement.setAttribute('data-theme', defaultTheme);
    log(`Ustawiono domyślny motyw: ${defaultTheme}`);
    
    // Aktualizuj ikonę
    if (toggleButton) {
        if (defaultTheme === 'dark') {
            toggleButton.innerHTML = '<i class="fas fa-sun"></i>';
        } else {
            toggleButton.innerHTML = '<i class="fas fa-moon"></i>';
        }
        log('Zaktualizowano ikonę przełącznika motywu');
    } else {
        log('Przycisk przełączania motywu nie znaleziony', 'warn');
    }
    
    // Obsługa przełączania motywu
    if (toggleButton) {
        toggleButton.addEventListener('click', function() {
            const currentTheme = rootElement.getAttribute('data-theme');
            const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
            rootElement.setAttribute('data-theme', newTheme);
            log(`Przełączono motyw na: ${newTheme}`);
            
            // Zapisz preferencję użytkownika
            localStorage.setItem('theme', newTheme);
            log('Zapisano preferencję motywu do localStorage');
            
            // Aktualizuj ikonę
            if (newTheme === 'dark') {
                this.innerHTML = '<i class="fas fa-sun"></i>';
            } else {
                this.innerHTML = '<i class="fas fa-moon"></i>';
            }
            log('Zaktualizowano ikonę przełącznika motywu po kliknięciu');
        });
        log('Dodano obsługę kliknięcia dla przełącznika motywu');
    }
}

// Sprawdzanie danych portfolio
function checkPortfolioData(config) {
    log('Sprawdzanie danych portfolio');
    const dataPath = config.portfolioDataPath || '/data/portfolio.json';
    fetch(dataPath)
        .then(response => {
            if (!response.ok) {
                throw new Error(`Nie udało się załadować danych portfolio z ${dataPath}`);
            }
            return response.json();
        })
        .then(data => {
            log(`Dane portfolio załadowane z ${dataPath}`);
            log(`Liczba elementów portfolio: ${data.length}`);
            // Możesz dodać więcej logów lub manipulacji danymi tutaj
        })
        .catch(error => {
            log(`Błąd podczas ładowania danych portfolio: ${error.message}`, 'error');
        });
}

// Dodaj smooth scrolling do linków
document.addEventListener('DOMContentLoaded', function() {
    log('DOMContentLoaded - inicjalizacja');
    hideLoader();
    
    // Załaduj konfigurację i zainicjalizuj funkcje
    loadConfig().then(config => {
        log('Konfiguracja załadowana, inicjalizacja funkcji');
        initDarkMode(config);
        checkPortfolioData(config);
        
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function (e) {
                e.preventDefault();
                log('Kliknięto link z kotwicą');
                
                const targetId = this.getAttribute('href');
                if (targetId === '#') return;
                
                const targetElement = document.querySelector(targetId);
                if (targetElement) {
                    targetElement.scrollIntoView({
                        behavior: 'smooth'
                    });
                    log(`Przewinięto do elementu: ${targetId}`);
                } else {
                    log(`Element docelowy nie znaleziony: ${targetId}`, 'warn');
                }
            });
        });
        log('Dodano smooth scrolling do linków');
    });
});

log('Skrypt main.js rozpoczęty');
