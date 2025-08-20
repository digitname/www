# Test info

- Name: Dark Mode >> should toggle dark mode
- Location: /home/tom/github/digitname/www/tests/dark-mode.spec.js:7:3

# Error details

```
Error: locator.click: Test timeout of 30000ms exceeded.
Call log:
  - waiting for locator('#dark-mode-toggle')
    - locator resolved to <button id="dark-mode-toggle" aria-label="Toggle dark mode">…</button>
  - attempting click action
    2 × waiting for element to be visible, enabled and stable
      - element is visible, enabled and stable
      - scrolling into view if needed
      - done scrolling
      - <div id="loader" class="loader">…</div> intercepts pointer events
    - retrying click action
    - waiting 20ms
    2 × waiting for element to be visible, enabled and stable
      - element is visible, enabled and stable
      - scrolling into view if needed
      - done scrolling
      - <div id="loader" class="loader">…</div> intercepts pointer events
    - retrying click action
      - waiting 100ms
    - waiting for element to be visible, enabled and stable
    - element is not stable
  49 × retrying click action
       - waiting 500ms
       - waiting for element to be visible, enabled and stable
       - element is visible, enabled and stable
       - scrolling into view if needed
       - done scrolling
       - <div id="loader" class="loader">…</div> intercepts pointer events
  - retrying click action
    - waiting 500ms

    at /home/tom/github/digitname/www/tests/dark-mode.spec.js:25:26
```

# Page snapshot

```yaml
- banner:
  - link "TomSapletta":
    - /url: /
  - navigation:
    - list:
      - listitem:
        - link "Home":
          - /url: /
      - listitem:
        - link "Portfolio":
          - /url: /portfolio/
      - listitem:
        - link "About":
          - /url: "#about"
      - listitem:
        - link "Contact":
          - /url: "#contact"
    - button "Toggle dark mode": 
  - button "Toggle menu"
- img "Tom Sapletta"
- heading "Tom Sapletta DigitName Portfolio" [level=1]:
  - link "Tom Sapletta":
    - /url: https://sapletta.com
  - link "DigitName Portfolio":
    - /url: https://www.digitname.com
- heading "Professional Overview" [level=2]
- paragraph: With over 12 years of experience as a DevOps Engineer, Software Developer, and Systems Architect, I specialize in creating human-technology connections through innovative solutions. My expertise spans edge computing, hypermodularization, and automated software development lifecycles, with a focus on building bridges between complex technical requirements and human needs.
- paragraph:
  - text: Currently, as the founder and CEO of
  - link "Telemonit":
    - /url: https://www.telemonit.com/
  - text: ", I'm developing"
  - link "Portigen":
    - /url: https://www.portigen.com/
  - text: "- an innovative power supply system with integrated edge computing functionality that enables natural human-machine interactions even in environments with limited connectivity."
- heading "Areas of Expertise" [level=2]
- list:
  - listitem:
    - strong: "DevOps & Cloud Engineering:"
    - text: Docker, Kubernetes, CI/CD pipelines, infrastructure automation
  - listitem:
    - strong: "Software Development:"
    - text: Java, Python, PHP, NodeJS, microservices architecture
  - listitem:
    - strong: "Edge Computing & IoT:"
    - text: Distributed systems, sensor networks, real-time processing
  - listitem:
    - strong: "Hardware-Software Integration:"
    - text: Embedded systems, power management solutions
  - listitem:
    - strong: "Research:"
    - text: TextToSoftware, Hypermodularization, Model-Based Systems Engineering
- heading "Projects" [level=2]
- heading "Portigen" [level=3]:
  - link "Portigen":
    - /url: https://www.portigen.com
- paragraph: An innovative power supply system with edge computing capabilities, providing autonomous energy solutions for IoT and edge computing applications. Features include 500Wh capacity, ultra-low latency processing, and modular design for various deployment scenarios.
- heading "TextToSoftware Ecosystem" [level=3]:
  - link "TextToSoftware Ecosystem":
    - /url: https://text.to.software
- paragraph: Pioneering systems that convert natural language into functional applications, bridging the gap between human communication and code generation.
- heading "Python Packages" [level=3]:
  - link "Python Packages":
    - /url: https://pypi.org/user/tom-sapletta-com/
- paragraph: Creator of numerous Python libraries including pifunc, mdirtree, markdown2code, dynapsys, and more, focusing on automation, modularity, and domain-specific languages (DSLs).
- heading "Publications & Creative Works" [level=2]
- list:
  - listitem: "\"System sterowania dla osób niepełnosprawnych\" (Control System for People with Disabilities) - Published in Elektronika dla Wszystkich, 1999"
  - listitem:
    - link "\"Hexagonal Sandbox with Smartphones\"":
      - /url: https://www.amazon.ca/Hexagonal-Sandbox-smartphones-modular-architecture-ebook/dp/B0CR1RLZYQ
    - text: "- Illustrated book explaining complex hypermodularization technologies for children"
  - listitem:
    - link "Hyper Modularity":
      - /url: https://www.hypermodularity.com
    - text: "- Software modularization insights"
- heading "Last Professional Experience" [level=2]
- heading "Telemonit, Frankfurt Oder" [level=3]
- paragraph: Founder & CEO, Hardware and Software Developer
- paragraph: 06.2024 – Present
- paragraph: Leading the development and production of Portigen energy supply stations with edge computing capabilities.
- heading "Link11 GmbH, Frankfurt" [level=3]
- paragraph: DevOps Engineer CDN/DNS
- paragraph: 07.2023 – 01.2024
- paragraph: Optimized CDN/DNS services for improved security and performance.
- heading "IT-NRW (SEVEN PRINCIPLES AG), Düsseldorf" [level=3]
- paragraph: Java Developer and DevOps
- paragraph: 09.2020 - 04.2023
- paragraph: Developed integration platforms connecting complex systems for public service applications.
- heading "Research Interests" [level=2]
- paragraph: "My research focuses on creating accessible, modular solutions to complex technical challenges. Key areas include:"
- list:
  - listitem: TextToSoftware - Automated Code Generation from Natural Language
  - listitem: Hypermodularization in Software Architecture
  - listitem: Edge Computing and Distributed Systems
  - listitem: Model-Based Systems Engineering (MBSE)
  - listitem: Component-Based Software Development
  - listitem: Digital Twin Technology
- heading "Collaboration Opportunities" [level=2]
- paragraph: I welcome collaboration in edge computing, hypermodularization, text-to-software technologies, and open-source hardware/software development. Particularly interested in projects bridging academic research with practical industry applications and technology education initiatives.
- heading "Contact Information" [level=2]
- heading "ORCID" [level=3]
- paragraph:
  - link "0009-0000-6327-2810":
    - /url: https://orcid.org/my-orcid?orcid=0009-0000-6327-2810
- paragraph
- heading "GitHub" [level=3]
- paragraph:
  - link "tom-sapletta-com":
    - /url: https://github.com/tom-sapletta-com
- paragraph
- heading "Python Packages" [level=3]
- paragraph:
  - link "PyPI":
    - /url: https://pypi.org/user/tom-sapletta-com/
- paragraph
- heading "Python Packages" [level=3]
- paragraph:
  - link "PyPI":
    - /url: https://pypi.org/user/tom-sapletta-com/
- paragraph
- heading "LinkedIn Profile" [level=3]
- paragraph:
  - link "Tom Sapletta":
    - /url: https://www.linkedin.com/in/tom-sapletta-com/
- paragraph
- heading "English Blog" [level=3]
- paragraph:
  - link "tom.sapletta.com":
    - /url: https://tom.sapletta.com/
- paragraph
- heading "Deutsch Blog" [level=3]
- paragraph:
  - link "tom.sapletta.de":
    - /url: https://tom.sapletta.de/
- paragraph
- heading "Polski Blog" [level=3]
- paragraph:
  - link "tom.sapletta.pl":
    - /url: https://tom.sapletta.pl/
- paragraph
- heading "Softreck, Estonia" [level=3]
- paragraph:
  - link "Software Development":
    - /url: https://www.softreck.com/
- heading "Telemonit, Germany" [level=3]
- link "Hardware Development":
  - /url: https://www.telemonit.com/
- paragraph
- heading "My Projects" [level=2]
- paragraph: A collection of my open source contributions and personal projects.
- text: 
- textbox "Search projects"
- button "All" [pressed]
- button "JavaScript"
- button "Python"
- button "DevOps"
- button "Web"
- button "IoT"
- text: Showing 0 of 0 projects Loading portfolio projects...
- heading "Expertise Areas" [level=3]
- text: Hypermodularity ModDevOps Edge Computing MBSE Text to Software Python DSL Automation DevOps Digital Twin
- heading "Research Areas" [level=2]
- list:
  - listitem: "TextToSoftware: Automated Code Generation from Natural Language"
  - listitem: Hypermodularization in Software Architecture and Development
  - listitem: Edge Computing and Distributed Systems
  - listitem: Model-Based Systems and Software Engineering (MBSE and ModDevOps)
  - listitem: Component-Based Software Development (CBSD)
  - listitem: Digital Twin Technology
  - listitem: Open Source Development Methodologies
  - listitem: Hardware-Software Integration
- heading "Services Offered" [level=2]
- heading "Infrastructure Development" [level=3]
- list:
  - listitem: DevOps
  - listitem: Cloud Engineer
  - listitem: Solutions Architect
- heading "Software Development" [level=3]
- list:
  - listitem: Python
  - listitem: Java, Kotlin, Scala
  - listitem: JavaScript, TypeScript, Node.js
  - listitem: PHP
- heading "Hardware Development" [level=3]
- list:
  - listitem: Network
  - listitem: IoT
  - listitem: Mobile Servers
- heading "Internet Domains" [level=2]
- heading "AskDomainer" [level=3]:
  - link "AskDomainer":
    - /url: https://www.askdomainer.com/
- paragraph: Domain consultation service
- heading "Text to Software Projects" [level=2]
- heading "www.to.software" [level=3]:
  - link "www.to.software":
    - /url: https://www.to.software/
- paragraph: Project hub for software automation tools
- heading "text.to.software" [level=3]:
  - link "text.to.software":
    - /url: https://text.to.software/
- paragraph: Convert natural language descriptions to working software
- heading "click.to.software" [level=3]:
  - link "click.to.software":
    - /url: https://click.to.software/
- paragraph: No-code/low-code solutions
- heading "dsl.to.software" [level=3]:
  - link "dsl.to.software":
    - /url: https://dsl.to.software/
- paragraph: DSL to Software conversion
- paragraph: "Last updated:"
- textbox "Search projects by name, technology, or description..."
- button "All Projects"
- button "Automation"
- button "DSL"
- button "Modularity"
- button "Latest Releases"
- heading "Python Projects" [level=2]
- heading "Total Websites" [level=3]
- text: "0"
- heading "Most Common Theme" [level=3]
- text: "-"
- heading "Top Technology" [level=3]
- text: "-"
- heading "Last Updated" [level=3]
- text: "-"
- heading "Most Used Technologies" [level=3]
- textbox "Search by domain, theme, technology, or keyword..."
- button "All"
- button "E-commerce"
- button "Blog"
- button "project"
- button "Corporate"
- button "News"
- heading "Github Projects" [level=2]
- contentinfo:
  - paragraph: © 2025 Tom Sapletta - digitname.com | All Rights Reserved
```

# Test source

```ts
   1 | const { test, expect } = require('@playwright/test');
   2 | const { waitForNetworkIdle } = require('./helpers');
   3 |
   4 | // Test suite for dark mode functionality
   5 | test.describe('Dark Mode', () => {
   6 |   // Test case: Check if dark mode toggle exists and works
   7 |   test('should toggle dark mode', async ({ page }) => {
   8 |     // Navigate to the homepage
   9 |     await page.goto('/');
  10 |     
  11 |     // Wait for page to load
  12 |     await waitForNetworkIdle(page);
  13 |     
  14 |     // Check if dark mode toggle exists
  15 |     const darkModeToggle = page.locator('#dark-mode-toggle');
  16 |     await expect(darkModeToggle).toBeVisible();
  17 |     
  18 |     // Check initial state (should be light by default)
  19 |     const body = page.locator('body');
  20 |     const initialTheme = await body.evaluate(el => {
  21 |       return window.getComputedStyle(el).getPropertyValue('color-scheme');
  22 |     });
  23 |     
  24 |     // Toggle dark mode
> 25 |     await darkModeToggle.click();
     |                          ^ Error: locator.click: Test timeout of 30000ms exceeded.
  26 |     await page.waitForTimeout(500); // Wait for transition
  27 |     
  28 |     // Check if theme changed
  29 |     const newTheme = await body.evaluate(el => {
  30 |       return window.getComputedStyle(el).getPropertyValue('color-scheme');
  31 |     });
  32 |     
  33 |     // Verify theme changed
  34 |     expect(newTheme).not.toBe(initialTheme);
  35 |     
  36 |     // Check localStorage for theme preference
  37 |     const themePreference = await page.evaluate(() => {
  38 |       return localStorage.getItem('theme-preference');
  39 |     });
  40 |     
  41 |     expect(themePreference).toBeDefined();
  42 |   });
  43 |   
  44 |   // Test case: Check if dark mode preference is saved
  45 |   test('should persist dark mode preference', async ({ page }) => {
  46 |     // Set dark mode in localStorage
  47 |     await page.goto('/');
  48 |     await page.evaluate(() => {
  49 |       localStorage.setItem('theme-preference', 'dark');
  50 |     });
  51 |     
  52 |     // Reload the page
  53 |     await page.reload();
  54 |     await waitForNetworkIdle(page);
  55 |     
  56 |     // Check if dark mode is applied
  57 |     const body = page.locator('body');
  58 |     const theme = await body.evaluate(el => {
  59 |       return window.getComputedStyle(el).getPropertyValue('color-scheme');
  60 |     });
  61 |     
  62 |     // Verify dark mode is active
  63 |     expect(theme).toContain('dark');
  64 |   });
  65 | });
  66 |
```