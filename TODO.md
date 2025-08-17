# PROMPT: Stwórz kompletne rozwiązania IaC do logowania

**Analizując strukturę mojego projektu fullstack (Python backend + React frontend + scripts), stwórz GOTOWE PLIKI KONFIGURACYJNE dla systemu logowania zero-code.**

## Status wdrożenia (2025-08-16) i rekomendacje

- __Infrastruktura__: działa. Obecne pliki i katalogi: `docker-compose.logging.yml`, `promtail-config.yaml`, `loki-config.yaml`, `grafana/provisioning/` (datasource + dashboardy). Uruchamianie i provisioning są gotowe.
- __Backend__: endpoint `POST /api/logs` istnieje (FastAPI router: `www/digitname/logs_api.py`; dawny Flask endpoint też jest). Dodano middleware do logowania HTTP requestów (FastAPI) oraz zapis do pliku w `LOG_DIR`. Brakuje wspólnego loggera Pythona (structlog, trace_id, dekoratory).
- __Frontend__: `www/src/utils/logger.js` istnieje (batching, retry, web vitals hook). Dodano `www/src/components/ErrorBoundary.jsx` i integrację w `www/src/index.js`.
- __Dashboardy__: są w `grafana/provisioning/dashboards/` (np. `app-monitoring.json`). Alerting nie jest skonfigurowany.
- __Integracja Promtail__: skonfigurowana.
  - Dodano label `logging=promtail` do usług `web` i `api` w `docker-compose.yml`.
  - Ujednolicono ścieżkę logów: `LOG_DIR=/var/log/app`, `./logs:/var/log/app` zamontowane do `api` i do `promtail` (read-only).
  - W `promtail-config.yaml` poprawiono `timestamp: timestamp` w obu jobach; `app-logs` czyta `/var/log/app/*.log`.
- __Dokumentacja__: zaktualizowano `LOGGING-README.md` – Loki dostępne na `http://localhost:3101` + sekcja „Quick check”.

### Najbliższe kroki (1–2h)

- [x] Dodać label `logging=promtail` do usług `web` i `api` w `docker-compose.yml`.
- [x] Ujednolicić ścieżkę logów aplikacyjnych: dodać `LOG_DIR=/var/log/app` i montaż `./logs:/var/log/app`; zmodyfikować `www/api/logs.py`, by używał `LOG_DIR`.
- [x] Poprawić `promtail-config.yaml`: `timestamp: timestamp` oraz upewnić się, że job `app-logs` czyta z `/var/log/app/*.log`.
- [x] Zaktualizować `LOGGING-README.md` (port Loki 3101 + sekcja „Quick check”).
- [ ] (Opcjonalnie) Dodać `www/src/components/ErrorBoundary.jsx` i wpiąć w React.

---

## WYMAGANIA:

### 1. DOCKER COMPOSE - Grafana + Loki Stack
Stwórz kompletny `docker-compose.logging.yml` z:
- Grafana (port 3000, admin/admin123)
- Loki (port 3100)  
- Promtail (automatyczne zbieranie z kontenerów)
- Volume persistence
- Health checks
- Environment variables z .env support

### 2. PROMTAIL CONFIG
Stwórz `promtail-config.yml` który automatycznie:
- Zbiera logi z `/var/lib/docker/containers/*/*log`
- Parsuje JSON logs z moich Python/React aplikacji
- Dodaje labels: service, level, trace_id
- Obsługuje multiline stack traces
- Filtruje sensitive data

### 3. LOKI CONFIG  
Stwórz `loki-config.yaml` z:
- Filesystem storage (development)
- Retention 30 dni
- Index optimization
- Query limits

### 4. GRAFANA PROVISIONING
Stwórz folder `grafana/` z:
- `datasources/loki.yml` - auto-connection do Loki
- `dashboards/app-monitoring.json` - gotowy dashboard z:
  - Request rates, error rates, response times
  - Top errors, stack traces
  - User activity, performance metrics
  - Python script execution status

### 5. PYTHON LOGGER DROP-IN
Stwórz `logger.py` gotowy do import który:
- Auto-configuration (dev/prod based on ENV)
- Structured JSON output compatible z Promtail
- Trace ID generation i propagation
- Decorators: @log_execution_time, @log_errors
- Zero changes needed w existing code

### 6. REACT LOGGER DROP-IN
Stwórz `logger.js` gotowy do import który:
- Sends logs do backend /api/logs endpoint
- Error boundary integration
- Performance monitoring (Core Web Vitals)
- User interaction tracking
- Offline queue z retry logic

### 7. BACKEND API ENDPOINT
Stwórz gotowy kod dla `/api/logs` endpoint (Flask/FastAPI compatible) który:
- Accepts frontend logs
- Validates i sanitizes
- Writes do file w Promtail-compatible format
- Rate limiting
- CORS enabled

### 8. DEPLOYMENT SCRIPTS
Stwórz:
- `deploy-logging.sh` - one-command setup
- `health-check.sh` - verify all services
- `.env.example` z wszystkimi potrzebnymi variables

### 9. TERRAFORM (BONUS)
If possible, stwórz Terraform configs dla:
- AWS CloudWatch integration
- S3 backup dla logs
- SNS alerting

## FORMAT ODPOWIEDZI:
Dla każdego pliku podaj:
1. **Pełną ścieżkę i nazwę pliku**
2. **Kompletną zawartość do skopiowania**  
3. **Komendę instalacji/uruchomienia**
4. **Krótki opis co robi**

## PRIORYTET:
1. Docker Compose + configs (działający stack w 5 minut)
2. Python/React loggers (zero-code integration)
3. Grafana dashboard (monitoring od razu)
4. Deployment automation

**WAŻNE: Podaj gotowe pliki do skopiowania, nie instrukcje jak je tworzyć. Chcę móc skopiować, wkleić i uruchomić.**

---

## ✅ FAZA 1: INFRASTRUKTURA (IaC)

### [x] Task 1.1: Docker Compose Setup
**Czas:** 15 min  
**Prompt dla LLM:**
```
Stwórz docker-compose.logging.yml dla mojego projektu fullstack z:
- Grafana (port 3000) 
- Loki (port 3100)
- Promtail (automatyczne zbieranie logów z kontenerów)
- Volume mounts dla persistencji
- Environment variables dla konfiguracji
- Network setup między serwisami
- Health checks dla wszystkich serwisów

Dodaj też .env.logging z przykładowymi wartościami i instrukcje uruchomienia.
```
**Rezultat:** Gotowy stack logowania do uruchomienia jedną komendą

---

### [x] Task 1.2: Konfiguracja Promtail
**Czas:** 10 min  
**Prompt dla LLM:**
```
Stwórz promtail.yml config który:
- Zbiera logi z /var/log/containers/*.log
- Parsuje JSON logi automatycznie  
- Dodaje labels: service, environment, host
- Filtruje wrażliwe dane (passwords, tokens)
- Wysyła do Loki z retry logic
- Obsługuje multiline stack traces

Include examples logów które będzie parsować z mojego Python/React projektu.
```
**Rezultat:** Automatyczne zbieranie i parsowanie logów

---

## ✅ FAZA 2: BACKEND PYTHON

### [ ] Task 2.1: Python Logger Setup
**Czas:** 20 min  
**Prompt dla LLM:**
```
Analizuj mój server.py i stwórz src/utils/logger.py z:
- Structured logging (structlog + json-logger)
- Konfiguracja dla dev/prod environments
- Automatic trace ID generation i propagation
- Context manager dla request/response
- Error handling z full stack traces
- Performance timing decorators
- Log levels: DEBUG, INFO, WARN, ERROR, CRITICAL

Dodaj do requirements.txt potrzebne zależności.
Format logów: timestamp, level, service, trace_id, message, data, duration_ms
```
**Rezultat:** Centralized logging utility gotowy do użycia

---

### [x] Task 2.2: Flask/FastAPI Middleware
**Czas:** 15 min  
**Prompt dla LLM:**
```
Stwórz middleware dla mój server.py który automatycznie:
- Loguje wszystkie HTTP requests (method, path, headers, body)
- Loguje responses (status, duration, size)
- Generuje unique trace_id dla każdego requesta
- Obsługuje CORS headers dla frontend logów
- Catches i loguje wszystkie exceptions
- Dodaje user_id jeśli dostępny w session

Integration bez zmiany istniejącego kodu - tylko dodanie @app.before_request
```
**Rezultat:** Automatyczne logowanie wszystkich API calls

---

### [x] Task 2.3: API Endpoint dla Frontend Logów
**Czas:** 10 min  
**Prompt dla LLM:**
```
Dodaj POST /api/logs endpoint do server.py który:
- Przyjmuje array logów z frontendu
- Validates JSON structure (required fields)
- Dodaje server-side metadata (IP, timestamp)
- Correlates z backend trace_id
- Rate limiting (max 100 logs/minute/IP)
- CORS enabled dla localhost:3000
- Error handling z proper HTTP codes

Response format: {success: boolean, processed: number, errors: []}
```
**Rezultat:** Frontend może wysyłać logi do backendu

---

## ✅ FAZA 3: FRONTEND REACT

### [x] Task 3.1: React Logger Utility
**Czas:** 20 min  
**Prompt dla LLM:**
```
Analizuj react-app/src/ i stwórz src/utils/logger.js z:
- Browser-compatible logger wysyłający do /api/logs
- Automatic error boundary integration
- User interaction tracking (clicks, navigation)
- Performance monitoring (loading times, Core Web Vitals)
- Local storage fallback gdy API niedostępny
- Batch sending (co 5 sekund lub 10 logów)
- Trace ID synchronizacja z backend

Export: logInfo, logError, logWarning, logDebug, logUserAction
```
**Rezultat:** Frontend logging gotowy do użycia w komponentach

---

### [x] Task 3.2: React Error Boundary
**Czas:** 10 min  
**Prompt dla LLM:**
```
Stwórz src/components/ErrorBoundary.js który:
- Catches wszystkie React errors
- Automatically loguje do backend z full stack trace
- Shows user-friendly error message
- Includes component stack trace
- Correlates z user actions przed błędem
- Recovery mechanism (retry button)
- Screenshot capability (jeśli możliwe)

Dodaj integration do App.js bez zmiany innych komponentów.
```
**Rezultat:** Automatyczne error reporting z React

---

### [ ] Task 3.3: Performance Monitoring
**Czas:** 15 min  
**Prompt dla LLM:**
```
Dodaj do src/utils/logger.js monitoring:
- Page load times (Navigation Timing API)
- Core Web Vitals (CLS, FID, LCP)
- Component render times (React Profiler)
- API response times
- Memory usage tracking
- Bundle size impact
- User engagement metrics (time on page, clicks)

Auto-send performance data co 30 sekund. Include user agent i screen resolution.
```
**Rezultat:** Comprehensive frontend performance monitoring

---

## ✅ FAZA 4: SCRIPTS I NARZĘDZIA

### [ ] Task 4.1: Python Scripts Logging
**Czas:** 15 min  
**Prompt dla LLM:**
```
Dodaj logging do scripts/:
- generate_portfolio.py - progress tracking, file operations
- serve_portfolio.py - server status, request handling  
- update_portfolio_repos.py - git operations, API calls
- setup_tokens.py - configuration changes (bez sensitive data)

Use common logger format. Add --verbose flag support. 
Progress bars z logging integration. Error recovery suggestions.
```
**Rezultat:** Wszystkie skrypty z comprehensive logging

---

### [ ] Task 4.2: Playwright Tests Integration
**Czas:** 20 min  
**Prompt dla LLM:**
```
Modify tests/ żeby:
- Capture browser console logs podczas testów
- Log test steps z screenshots on failure
- Correlate frontend errors z test actions
- Performance assertions (page load < 3s)
- Integration z main logging system
- Test result summary z error details
- Automatic bug report generation

Update conftest.py i helpers.js. Add custom matchers dla performance.
```
**Rezultat:** Tests jako część monitoring systemu

---

## ✅ FAZA 5: MONITORING I DASHBOARDS

### [x] Task 5.1: Grafana Dashboards
**Czas:** 25 min  
**Prompt dla LLM:**
```
Stwórz Grafana dashboards (JSON configs):

1. Application Overview:
   - Request rates, error rates, response times
   - Top endpoints, slowest queries
   - User activity heatmap

2. Error Analysis:
   - Error count by service/component
   - Stack trace aggregation
   - Error trends over time

3. Performance Metrics:
   - Frontend: Core Web Vitals, load times
   - Backend: API response times, memory usage
   - Scripts: execution times, success rates

4. User Experience:
   - Page views, user journeys
   - Device/browser breakdown
   - Geographic distribution

Include alerting rules dla critical metrics.
```
**Rezultat:** Production-ready monitoring dashboards

---

### [ ] Task 5.2: Alert Configuration
**Czas:** 15 min  
**Prompt dla LLM:**
```
Stwórz Grafana alerting rules:
- Error rate > 5% w 5 minut
- Response time > 2s średnio w 10 minut  
- Memory usage > 80% w 15 minut
- Zero requests w 30 minut (service down)
- Frontend errors > 10/minute
- Script failures

Configure notification channels (email, Slack webhook).
Include runbook links w alert messages.
```
**Rezultat:** Proactive monitoring z automatic alerts

---

## ✅ FAZA 6: DEVELOPMENT TOOLS

### [ ] Task 6.1: Log Viewer CLI
**Czas:** 20 min  
**Prompt dla LLM:**
```
Stwórz scripts/log-viewer.py CLI tool:
- Query logs by date range, service, level
- Filter by trace_id, user_id, error type
- Tail live logs z colored output
- Export filtered logs to JSON/CSV
- Search text w log messages
- Aggregate stats (error counts, avg response time)
- Integration z Loki API

Usage: python log-viewer.py --service=backend --level=ERROR --last=1h
```
**Rezultat:** Developer-friendly log analysis tool

---

### [ ] Task 6.2: Debug Mode Configuration
**Czas:** 10 min  
**Prompt dla LLM:**
```
Dodaj debug mode support:
- Environment variable DEBUG=true dla verbose logging
- Hot-reload log level changes bez restart
- Request/response body logging w debug mode
- SQL query logging (jeśli używane)
- Disable log aggregation w development
- Color-coded console output
- Performance profiling włączone

Update wszystkie logger configurations. Add development docker-compose override.
```
**Rezultat:** Enhanced development experience

---

## ✅ FAZA 7: PRODUCTION READINESS

### [ ] Task 7.1: Security i Compliance
**Czas:** 15 min  
**Prompt dla LLM:**
```
Implement security measures:
- Filter sensitive data (passwords, tokens, PII)
- Log sanitization functions
- Audit trail dla admin actions
- GDPR compliance (user data anonymization)
- Rate limiting dla log endpoints
- Authentication dla Grafana dashboard
- SSL/TLS dla log transmission
- Data retention policies

Create security checklist i compliance documentation.
```
**Rezultat:** Production-secure logging system

---

### [ ] Task 7.2: Backup i Archival
**Czas:** 10 min  
**Prompt dla LLM:**
```
Setup log management:
- Automatic log rotation (daily/weekly)
- Compression dla old logs
- S3/cloud backup integration
- Retention policy (30 days live, 1 year archive)
- Disaster recovery procedures
- Log integrity verification
- Storage cost optimization

Create backup scripts i monitoring dla storage usage.
```
**Rezultat:** Enterprise-grade log management

---

## ✅ FAZA 8: DOKUMENTACJA I DEPLOYMENT

### [ ] Task 8.1: Documentation
**Czas:** 20 min  
**Prompt dla LLM:**
```
Stwórz comprehensive documentation:

1. LOGGING.md - overview i architecture
2. TROUBLESHOOTING.md - common issues i solutions
3. DEPLOYMENT.md - production setup guide
4. API.md - logging API reference
5. DASHBOARD.md - Grafana usage guide

Include:
- Quick start guide
- Environment configuration
- Performance tuning tips
- Security best practices
- Monitoring runbooks
- FAQ section
```
**Rezultat:** Complete documentation package

---

### [ ] Task 8.2: Deployment Scripts
**Czas:** 15 min  
**Prompt dla LLM:**
```
Stwórz deployment automation:
- deploy-logging.sh script for production
- Environment-specific configs (dev/staging/prod)
- Health check scripts
- Backup/restore procedures
- Rolling update strategy
- Rollback mechanisms
- Performance testing scripts

Include Kubernetes manifests jeśli potrzebne.
```
**Rezultat:** One-click deployment solution
