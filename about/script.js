// Intersection Observer for scroll animations
document.addEventListener('DOMContentLoaded', () => {
    const menuToggle = document.querySelector('.menu-toggle');
    const navLinks = document.querySelector('.nav-links');

    if (menuToggle && navLinks) {
        menuToggle.addEventListener('click', () => {
            const isOpen = navLinks.classList.toggle('open');
            menuToggle.setAttribute('aria-expanded', String(isOpen));
        });

        navLinks.querySelectorAll('a').forEach((link) => {
            link.addEventListener('click', () => {
                navLinks.classList.remove('open');
                menuToggle.setAttribute('aria-expanded', 'false');
            });
        });

        window.addEventListener('resize', () => {
            if (window.innerWidth > 768 && navLinks.classList.contains('open')) {
                navLinks.classList.remove('open');
                menuToggle.setAttribute('aria-expanded', 'false');
            }
        });
    }

    const observerOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.1
    };

    const observer = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    const elementsToAnimate = document.querySelectorAll('.slide-up');
    elementsToAnimate.forEach(el => observer.observe(el));

    const bgLayers = document.querySelectorAll('.interactive-bg [data-depth]');
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (!reducedMotion && bgLayers.length > 0) {
        window.addEventListener('mousemove', (event) => {
            const x = (event.clientX / window.innerWidth - 0.5) * 2;
            const y = (event.clientY / window.innerHeight - 0.5) * 2;

            bgLayers.forEach((layer) => {
                const depth = Number(layer.getAttribute('data-depth')) || 0.05;
                const moveX = x * depth * 36;
                const moveY = y * depth * 36;
                layer.style.transform = `translate3d(${moveX}px, ${moveY}px, 0)`;
            });
        });
    }

    const hero = document.querySelector('.hero');
    const glow = document.querySelector('.background-glow');

    if (hero && glow) {
        hero.addEventListener('mousemove', (event) => {
            const rect = hero.getBoundingClientRect();
            const x = ((event.clientX - rect.left) / rect.width) * 100;
            const y = ((event.clientY - rect.top) / rect.height) * 100;
            glow.style.left = `${x}%`;
            glow.style.top = `${y}%`;
        });

        hero.addEventListener('mouseleave', () => {
            glow.style.left = '50%';
            glow.style.top = '50%';
        });
    }

    const teamData = {
        board: [
            { initials: 'RS', name: 'Riya Sharma', role: 'Executive Board Member', bio: 'Strategic leader focused on scaling SDC chapters and building strong campus-industry connections.', link: '#' },
            { initials: 'VK', name: 'Vikram Khanna', role: 'Board Strategy Member', bio: 'Leads long-term planning and governance, ensuring each initiative aligns with the community vision.', link: '#' },
            { initials: 'NA', name: 'Neha Arora', role: 'Programs Board Member', bio: 'Designs mentorship programs and high-impact events that help students convert ideas into products.', link: '#' },
            { initials: 'AJ', name: 'Aarav Jain', role: 'Board Operations Member', bio: 'Improves execution workflows and drives collaboration between technical and non-technical teams.', link: '#' }
        ],
        tech: [
            { initials: 'AP', name: 'Arjun Patel', role: 'Lead Developer', bio: 'Builds scalable learning tools and sets engineering standards for community platforms.', link: '#' },
            { initials: 'MD', name: 'Meera Desai', role: 'Engineering Lead', bio: 'Drives architecture decisions and mentors contributors on quality, performance, and shipping fast.', link: '#' },
            { initials: 'RK', name: 'Rohit Kulkarni', role: 'DevOps Lead', bio: 'Owns CI/CD and reliability, helping projects ship quickly with stable infrastructure.', link: '#' },
            { initials: 'SN', name: 'Sara Nair', role: 'AI Track Lead', bio: 'Leads AI learning paths and builds applied projects around ML and intelligent systems.', link: '#' }
        ],
        core: [
            { initials: 'KS', name: 'Karan Singh', role: 'Frontend Developer', bio: 'Crafts accessible interfaces and interactive experiences for workshops, dashboards, and event pages.', link: '#' },
            { initials: 'SR', name: 'Sneha Reddy', role: 'Community Manager', bio: 'Coordinates chapter engagement and keeps communication flowing across members, mentors, and partners.', link: '#' },
            { initials: 'AM', name: 'Aman Malik', role: 'Backend Developer', bio: 'Builds APIs and automation pipelines that support registrations, reporting, and internal tools.', link: '#' },
            { initials: 'PI', name: 'Priya Iyer', role: 'Design Lead', bio: 'Shapes product storytelling and visual systems to keep SDC experiences memorable and consistent.', link: '#' },
            { initials: 'DK', name: 'Dev Khurana', role: 'Event Coordinator', bio: 'Plans and executes coding events while ensuring smooth speaker and participant experiences.', link: '#' },
            { initials: 'HM', name: 'Harini Menon', role: 'Content Lead', bio: 'Builds educational content and learning series to keep member growth consistent.', link: '#' }
        ]
    };

    const teamState = { board: 0, tech: 0, core: 0 };
    const cardsPerPage = 2;

    function getPageCount(group) {
        return Math.ceil(teamData[group].length / cardsPerPage);
    }

    function buildMemberCard(member) {
        return `
            <article class="team-card light-card hover-lift flash">
                <div class="profile-pic profile-initials">${member.initials}</div>
                <div class="team-info">
                    <h4>${member.name}</h4>
                    <p class="role">${member.role}</p>
                    <p class="bio">${member.bio}</p>
                    <a href="${member.link}" class="linkedin-link" target="_blank" rel="noopener noreferrer">LinkedIn</a>
                </div>
            </article>
        `;
    }

    function renderDots(group, pageCount) {
        const dotsEl = document.getElementById(`${group}-dots`);
        if (!dotsEl) {
            return;
        }

        dotsEl.innerHTML = '';
        for (let i = 0; i < pageCount; i += 1) {
            const dot = document.createElement('button');
            dot.className = `team-dot ${i === teamState[group] ? 'active' : ''}`;
            dot.setAttribute('aria-label', `Go to ${group} page ${i + 1}`);
            dot.addEventListener('click', () => {
                teamState[group] = i;
                renderTeam(group);
            });
            dotsEl.appendChild(dot);
        }
    }

    function renderTeam(group) {
        const listEl = document.getElementById(`${group}-list`);
        const statusEl = document.getElementById(`${group}-status`);
        const members = teamData[group];
        if (!listEl || !statusEl || !members || members.length === 0) {
            return;
        }

        const pageCount = getPageCount(group);
        const start = teamState[group] * cardsPerPage;
        const visibleMembers = members.slice(start, start + cardsPerPage);

        listEl.innerHTML = visibleMembers.map(buildMemberCard).join('');
        statusEl.textContent = `${teamState[group] + 1} / ${pageCount}`;
        renderDots(group, pageCount);
    }

    function wireTeamControls(group) {
        const prevBtn = document.getElementById(`${group}-prev`);
        const nextBtn = document.getElementById(`${group}-next`);
        const shuffleBtn = document.getElementById(`${group}-shuffle`);
        const pageCount = getPageCount(group);

        if (!prevBtn || !nextBtn || !shuffleBtn || pageCount === 0) {
            return;
        }

        prevBtn.addEventListener('click', () => {
            teamState[group] = (teamState[group] - 1 + pageCount) % pageCount;
            renderTeam(group);
        });

        nextBtn.addEventListener('click', () => {
            teamState[group] = (teamState[group] + 1) % pageCount;
            renderTeam(group);
        });

        shuffleBtn.addEventListener('click', () => {
            teamState[group] = Math.floor(Math.random() * pageCount);
            renderTeam(group);
        });

        renderTeam(group);
    }

    wireTeamControls('board');
    wireTeamControls('tech');
    wireTeamControls('core');
});