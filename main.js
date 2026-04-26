document.addEventListener('DOMContentLoaded', () => {
    // ---------------------------------------------------------
    // 0. API Initialization (Firebase & EmailJS)
    // ---------------------------------------------------------
    const firebaseConfig = {
      apiKey: "AIzaSyDdkhIu6ptdItzIqoGK7eylk3G9Ky8JHKY",
      authDomain: "myweb-4e04e.firebaseapp.com",
      projectId: "myweb-4e04e",
      storageBucket: "myweb-4e04e.firebasestorage.app",
      messagingSenderId: "737628637723",
      appId: "1:737628637723:web:03cd8310bbee3ea0b146be",
      measurementId: "G-E93WR68PD5"
    };

    const EMAILJS_PUBLIC_KEY = 'YOUR_EMAILJS_PUBLIC_KEY';
    const EMAILJS_SERVICE_ID = 'YOUR_SERVICE_ID';
    const EMAILJS_TEMPLATE_ID = 'YOUR_TEMPLATE_ID';

    // Initialize Firebase
    let db = null;
    if (typeof firebase !== 'undefined') {
        try {
            firebase.initializeApp(firebaseConfig);
            db = firebase.firestore();
        } catch (e) {
            console.error('Firebase initialization failed:', e);
        }
    }
    
    if (typeof emailjs !== 'undefined' && EMAILJS_PUBLIC_KEY !== 'YOUR_EMAILJS_PUBLIC_KEY') {
        emailjs.init(EMAILJS_PUBLIC_KEY);
    }

    // List of section elements
    const sections = document.querySelectorAll('section, .hero');
    const navLinks = document.querySelectorAll('.nav-menu a, .nav-dropdown a, .btn-primary, .btn-outline, .nav-special');

    /**
     * Switching Logic for Sections (Tabbed View)
     */
    const showSection = (sectionId) => {
        // Remove # if present
        const id = sectionId.startsWith('#') ? sectionId.substring(1) : sectionId;
        const targetSection = document.getElementById(id);

        if (!targetSection) return;

        // Hide all sections
        sections.forEach(section => {
            section.classList.remove('active-section');
        });

        // Show target section
        targetSection.classList.add('active-section');

        // Force enable scrolling on body just in case
        document.body.style.overflow = 'auto';
        document.documentElement.style.overflow = 'auto';

        // Scroll to top of the section (internal scroll reset)
        targetSection.scrollTop = 0;
        window.scrollTo(0, 0);

        // Auto-activate reveal animations inside the section
        const reveals = targetSection.querySelectorAll('.reveal');
        reveals.forEach(el => el.classList.add('active'));

        // [New] Troubleshooting Section Staggered Animation
        if (id === 'troubleshooting') {
            const staggerItems = targetSection.querySelectorAll('.stagger-item');
            // Reset state first to allow re-animation when switching back
            staggerItems.forEach(item => item.classList.remove('visible'));

            staggerItems.forEach((item, index) => {
                setTimeout(() => {
                    item.classList.add('visible');
                }, 500 + (index * 150)); // 0.15s interval, starting after main card reveal
            });
        }

        // Update Nav Menu Active State
        updateNavLinks(id);

        // Update URL Hash
        if (window.location.hash !== '#' + id) {
            history.pushState(null, null, '#' + id);
        }
    };

    const updateNavLinks = (activeId) => {
        const links = document.querySelectorAll('.nav-menu a, .dropdown-content a, .nav-special');
        links.forEach(link => {
            const href = link.getAttribute('href');
            if (href === '#' + activeId) {
                link.classList.add('active');
            } else {
                link.classList.remove('active');
            }
        });
    };

    // Handle Nav Clicks
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            const href = link.getAttribute('href');
            if (href && href.startsWith('#')) {
                e.preventDefault();
                showSection(href);
            }
        });
    });

    // Handle Browser Back/Forward (Hash change)
    window.addEventListener('hashchange', () => {
        const hash = window.location.hash;
        if (hash) {
            showSection(hash);
        }
    });

    // 0. Intro Splash Screen Logic
    const splash = document.getElementById('intro-splash');
    if (splash) {
        // Prevent scrolling while splash is active
        document.body.style.overflow = 'hidden';

        // Wait for 2.8 seconds, then fade out
        setTimeout(() => {
            splash.classList.add('fade-out');

            // Bento Roadmap Interaction Logic
            const bentoTabs = document.querySelectorAll('.bento-tab');
            const bentoMainContent = document.getElementById('bento-main-content');
            const phaseLabel = document.getElementById('current-phase-label');
            const goalTitle = document.getElementById('bento-goal-title');
            const goalDesc = document.getElementById('bento-goal-desc');

            // --- Updated Roadmap Data with Academic Results ---
            const roadmapData = {
                1: {
                    label: "PHASE 01: FOUNDATION",
                    year: "1학년 (Foundation)",
                    title: "전공 기초 확립 및 설계 입문",
                    comment: "기초 전공 과목에서 우수한 성적을 거두며 엔지니어링의 기본기를 탄탄히 다졌습니다.",
                    desc: "엔지니어링의 기본 언어인 파이썬 프로그래밍과 논리 회로를 익히고, 3D CAD를 통해 설계의 기초를 다집니다.",
                    curriculum: [
                        { 
                            icon: "PY", 
                            title: "파이썬 프로그래밍", 
                            sub: "데이터 분석 및 엔지니어링 프로그래밍 기초",
                            detailedInfo: {
                                category: "SOFTWARE",
                                image: "파이썬.png",
                                fullDesc: "파이썬을 활용한 데이터 분석 및 로봇 제어 알고리즘의 기초를 습득했습니다. NumPy와 Pandas 라이브러리를 활용하여 방대한 센서 데이터를 정제하고 시각화하는 프로젝트를 수행했으며, 이를 통해 데이터 기반의 의사결정 역량을 강화했습니다.",
                                skills: ["Python 3.x", "NumPy", "Pandas", "Data Visualization", "Automation Script"]
                            }
                        },
                        { icon: "CAD", title: "3차원 CAD 실습", sub: "AutoCAD 및 Inventor 활용 설계 기초" },
                        { icon: "DIG", title: "디지털 논리회로", sub: "하드웨어 설계 기초 메커니즘 및 논리 게이트 이해" }
                    ],
                    goal: { title: "Design Junior", desc: "도면 해독 및 기초 프로그래밍 논리 구현 능력 확보" },
                    stats: ["4.1", "4.2", "36", "TOP 10%"]
                },
                2: {
                    label: "PHASE 02: SPECIALIST",
                    year: "2학년 (Current)",
                    title: "반도체 장비 및 실무 심화 과정",
                    comment: "PLC 및 반도체 공학 등 핵심 전공에 집중하여 직무 관련 전문성을 획기적으로 끌어올렸습니다.",
                    desc: "하드웨어 제어의 핵심인 PLC와 MCU 심화 제어를 마스터하고, 반도체 공정 장비의 메커니즘을 심층적으로 분석합니다.",
                    curriculum: [
                        { 
                            icon: "PLC", 
                            title: "PLC 프로그래밍", 
                            sub: "장비 제어 로직 최적화 및 시뮬레이션",
                            detailedInfo: {
                                category: "AUTOMATION",
                                image: "plc_logic.png",
                                fullDesc: "산업용 자동화 시스템의 핵심인 PLC(Programmable Logic Controller)를 활용하여 장비 제어 시퀀스를 설계했습니다. LS 일렉트릭 장비를 기반으로 센서 입력에 따른 모터 및 액추에이터의 정밀 제어 로직을 구현했으며, 현장에서 발생할 수 있는 이상 현상 진단 로직을 포함시켰습니다.",
                                skills: ["PLC Logic", "Sequence Control", "XG5000", "Sensor Interfacing", "HMI Design"]
                            }
                        },
                        { icon: "MCU", title: "MCU 심화 제어 (Arduino)", sub: "센서 인터페이스 및 임베디드 시스템 설계" },
                        { icon: "SEM", title: "반도체 공학", sub: "공정 장비 구동 원리 및 진단 기술" }
                    ],
                    goal: { title: "Equipment Specialist", desc: "반도체 장비 제어 정밀도 향상을 위한 핵심 알고리즘 설계 역량" },
                    stats: ["4.3", "4.4", "72", "TOP 5%"]
                },
                3: {
                    label: "PHASE 03: PROFESSIONAL",
                    year: "3학년 (Goal)",
                    title: "시스템 통합 및 AMK CSE 완성",
                    comment: "현장 실무 중심의 캡스톤 디자인과 심화 연구를 통해 최상위 성과와 통합적 해결 능력을 증명하겠습니다.",
                    desc: "캡스톤 디자인을 통해 실무 시스템을 통합 제작하고, ROS와 AI 제어를 결합한 로봇 지능 시스템을 연구합니다.",
                    curriculum: [
                        { icon: "CAP", title: "캡스톤 디자인", sub: "실무 맞춤형 졸업 작품 통합 제작" },
                        { icon: "ROS", title: "로봇지능제어", sub: "ROS 기반 자율 주행 및 지능 제어 연구" },
                        { icon: "SYS", title: "시스템 통합", sub: "AMK CSE 직무에 최적화된 기술 내재화" }
                    ],
                    goal: { title: "System Engineer", desc: "복합 시스템 통합 제어 및 현장 이슈 해결 전문가" },
                    stats: ["4.5", "4.5", "120", "TOP 1%"]
                }
            };

            const updateBento = (year) => {
                const data = roadmapData[year];
                if (!data) return;

                // Sync active tab state
                bentoTabs.forEach(t => {
                    if (t.getAttribute('data-year') == year) t.classList.add('active');
                    else t.classList.remove('active');
                });

                // Animation fade out
                bentoMainContent.style.opacity = '0';
                bentoMainContent.style.transform = 'translateX(-20px)';
                bentoMainContent.style.filter = 'blur(5px)';
                
                setTimeout(() => {
                    phaseLabel.textContent = data.label;
                    goalTitle.textContent = data.goal.title;
                    goalDesc.textContent = data.goal.desc;

                    let currHtml = `
                        <div class="phase-content">
                            <span class="year-label">${data.year}</span>
                            <h3>${data.title}</h3>
                            <p class="description">${data.desc}</p>
                            <div class="curriculum-list">
                                ${data.curriculum.map((item, idx) => `
                                    <div class="curr-item ${item.detailedInfo ? 'clickable-item' : ''}" data-year="${year}" data-idx="${idx}">
                                        <div class="curr-icon">${item.icon}</div>
                                        <div class="curr-text">
                                            <strong>${item.title} ${item.detailedInfo ? '<span class="click-hint">(자세히 보기)</span>' : ''}</strong>
                                            <span>${item.sub}</span>
                                        </div>
                                    </div>
                                `).join('')}
                            </div>
                        </div>
                    `;
                    bentoMainContent.innerHTML = currHtml;

                    // Update Side Card Stats (GPA & Quote)
                    const gpaVal = document.getElementById('bento-gpa-val');
                    const growthQuote = document.getElementById('bento-growth-quote');
                    if (gpaVal) gpaVal.textContent = data.stats[0];
                    if (growthQuote) growthQuote.textContent = `"${data.comment}"`;

                    // Add click listeners to items
                    const items = bentoMainContent.querySelectorAll('.clickable-item');
                    items.forEach(item => {
                        item.addEventListener('click', () => {
                            const y = item.getAttribute('data-year');
                            const i = item.getAttribute('data-idx');
                            openSubjectModal(roadmapData[y].curriculum[i]);
                        });
                    });

                    // Reset internal styles to let CSS animation take over
                    bentoMainContent.style.opacity = '1';
                    bentoMainContent.style.transform = 'translateX(0)';
                    bentoMainContent.style.filter = 'blur(0)';
                }, 250);
            };

            const openSubjectModal = (item) => {
                const overlay = document.getElementById('subject-modal-overlay');
                const modalBody = document.getElementById('subject-modal-body');
                const info = item.detailedInfo;

                if (!info) return;

                modalBody.innerHTML = `
                    <div class="subject-detail-layout">
                        <div class="subject-visual">
                            <img src="${info.image}" alt="${item.title}">
                        </div>
                        <div class="subject-info">
                            <span class="tech-tag-mini">${info.category}</span>
                            <h3>${item.title}</h3>
                            <div class="subject-desc-box">
                                <p>${info.fullDesc}</p>
                            </div>
                            <div class="subject-skills">
                                <label>APPLIED TECHNOLOGIES</label>
                                <div class="skill-chips-group">
                                    ${info.skills.map(s => `<span class="s-chip">${s}</span>`).join('')}
                                </div>
                            </div>
                        </div>
                    </div>
                `;

                overlay.classList.add('active');
                document.body.style.overflow = 'hidden';
            };

            const closeSubjectModal = () => {
                const overlay = document.getElementById('subject-modal-overlay');
                overlay.classList.remove('active');
                document.body.style.overflow = 'auto';
            };

            document.getElementById('close-subject-modal').addEventListener('click', closeSubjectModal);
            document.getElementById('subject-modal-overlay').addEventListener('click', (e) => {
                if (e.target.id === 'subject-modal-overlay') closeSubjectModal();
            });

            bentoTabs.forEach(tab => {
                tab.addEventListener('click', () => {
                    updateBento(tab.getAttribute('data-year'));
                });
            });

            // Set initial state to Year 2 (Phase 02) as requested
            updateBento(2);

            // 0.1 Menu Reveal Logic
            const navbar = document.getElementById('navbar');
            if (navbar) {
                setTimeout(() => {
                    navbar.classList.add('visible');
                }, 500);
            }

            // Remove from DOM safely
            setTimeout(() => {
                splash.style.display = 'none';

                // Show initial section after splash
                const initialHash = window.location.hash || '#home';
                showSection(initialHash);

                // Re-enable scrolling
                document.body.style.overflow = 'auto';

                // --- Engineering Metrics Counter Animation ---
                const counters = document.querySelectorAll('.counter');
                const counterObserver = new IntersectionObserver((entries) => {
                    entries.forEach(entry => {
                        if (entry.isIntersecting) {
                            const target = entry.target;
                            const targetValue = parseFloat(target.getAttribute('data-target'));
                            const duration = 2000;
                            const startTime = performance.now();

                            const updateCounter = (currentTime) => {
                                const elapsed = currentTime - startTime;
                                const progress = Math.min(elapsed / duration, 1);
                                const easeOut = 1 - Math.pow(1 - progress, 3);
                                
                                let current;
                                if (targetValue % 1 === 0) {
                                    current = Math.floor(easeOut * targetValue);
                                } else {
                                    current = (easeOut * targetValue).toFixed(2);
                                }
                                target.textContent = current;

                                if (progress < 1) requestAnimationFrame(updateCounter);
                                else target.textContent = targetValue;
                            };
                            requestAnimationFrame(updateCounter);
                            counterObserver.unobserve(target);
                        }
                    });
                }, { threshold: 0.5 });
                counters.forEach(counter => counterObserver.observe(counter));

                // [New] Hero Section 3D Tilt Logic
                const heroSection = document.getElementById('home');
                const heroText = document.querySelector('.hero-text');
                const heroImage = document.querySelector('.hero-image-box');
                
                if (heroSection) {
                    heroSection.addEventListener('mousemove', (e) => {
                        // Tilt Text
                        if (heroText) {
                            const rect = heroText.getBoundingClientRect();
                            const x = e.clientX - (rect.left + rect.width / 2);
                            const y = e.clientY - (rect.top + rect.height / 2);
                            const rotateX = -y / 70;
                            const rotateY = x / 70;
                            heroText.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
                        }
                    });
                    
                    heroSection.addEventListener('mouseleave', () => {
                        if (heroText) heroText.style.transform = `perspective(1000px) rotateX(0deg) rotateY(0deg)`;
                    });
                }
            }, 800);

        }, 2800);
    } else {
        // If no splash, show default section immediately
        const initialHash = window.location.hash || '#home';
        showSection(initialHash);
    }

    // 2. Logic Circuit Sequence Animation
    const seqNodes = document.querySelectorAll('.seq-node');
    let currentIndex = 0;
    const animateSequence = () => {
        if (seqNodes.length === 0) return;
        seqNodes.forEach(node => node.classList.remove('active'));
        seqNodes[currentIndex].classList.add('active');
        currentIndex = (currentIndex + 1) % seqNodes.length;
    };
    if (seqNodes.length > 0) {
        setInterval(animateSequence, 1000);
    }

    // 4. Free Board CRUD Logic (Supabase Realtime)
    const boardForm = document.getElementById('board-form');
    const boardList = document.getElementById('board-list');
    const boardSubmitBtn = document.getElementById('board-submit-btn');
    const boardStatus = document.getElementById('board-status');
    const statusText = document.getElementById('status-text');
    const cancelEditBtn = document.getElementById('cancel-edit');
    const editIdInput = document.getElementById('edit-id');
    const replyToInput = document.getElementById('reply-to');

    const modal = document.getElementById('board-modal');
    const modalPasswordInput = document.getElementById('modal-password');
    const modalSubmit = document.getElementById('modal-submit');
    const modalCancel = document.getElementById('modal-cancel');

    let posts = [];
    let currentBoardSort = 'latest'; 

    let currentAction = null; 
    let currentTargetId = null;

    // Load Posts (Prioritize Local, Sync with DB)
    const fetchPosts = async () => {
        // 1. Always load local posts first for instant UI
        posts = JSON.parse(localStorage.getItem('amk_portfolio_posts') || '[]');
        renderPosts();

        // 2. If Firebase is connected, set up Realtime Listener
        if (db) {
            db.collection('posts').orderBy('created_at', 'desc').onSnapshot((snapshot) => {
                const data = snapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                }));
                
                if (data && data.length > 0) {
                    posts = data;
                    localStorage.setItem('amk_portfolio_posts', JSON.stringify(posts));
                    renderPosts();
                }
            }, (e) => {
                console.warn('Firebase sync failed, using local data:', e.message);
            });
        }
    };



    const resetBoardForm = () => {
        boardForm.reset();
        editIdInput.value = '';
        replyToInput.value = '';
        boardStatus.style.display = 'none';
        boardSubmitBtn.textContent = '글쓰기';
        document.querySelectorAll('.board-item').forEach(el => el.classList.remove('target-highlight'));
    };

    if (cancelEditBtn) {
        cancelEditBtn.addEventListener('click', resetBoardForm);
    }

    const renderPosts = () => {
        if (!boardList) return;
        boardList.innerHTML = '';

        if (posts.length === 0) {
            boardList.innerHTML = '<p style="text-align:center; color:var(--text-muted); padding:3rem;">아직 남겨진 글이 없습니다. 첫 글을 남겨주세요!</p>';
            return;
        }

        let sortedPosts;
        if (currentBoardSort === 'likes') {
            sortedPosts = [...posts].sort((a, b) => (b.likes - a.likes) || new Date(b.created_at) - new Date(a.created_at));
        } else {
            sortedPosts = [...posts].sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
        }

        const postMap = {};
        sortedPosts.forEach(p => postMap[p.id] = { ...p, children: [] });

        const rootPosts = [];
        sortedPosts.forEach(p => {
            if (p.parent_id && postMap[p.parent_id]) {
                postMap[p.parent_id].children.push(postMap[p.id]);
            } else {
                rootPosts.push(postMap[p.id]);
            }
        });

        const avatarColors = ['#0ea5e9', '#6366f1', '#a855f7', '#ec4899', '#f43f5e', '#f59e0b', '#10b981'];
        const getAvatarColor = (name) => {
            let hash = 0;
            for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
            return avatarColors[Math.abs(hash) % avatarColors.length];
        };

        const createPostHTML = (post, depth = 0, parentContainer = boardList) => {
            const isHighlight = (editIdInput.value == post.id || replyToInput.value == post.id);
            const postWrapper = document.createElement('div');
            postWrapper.className = 'post-wrapper';

            const postEl = document.createElement('div');
            postEl.id = `post-${post.id}`;
            postEl.className = `board-item ${isHighlight ? 'target-highlight' : ''}`;

            const firstChar = post.author.charAt(0).toUpperCase();
            const avatarColor = getAvatarColor(post.author);
            const displayDate = new Date(post.created_at || post.date).toLocaleString();

            postEl.innerHTML = `
                <div class="board-item-main">
                    <div class="post-avatar" style="background-color: ${avatarColor}">${firstChar}</div>
                    <div class="post-body">
                        <div class="board-item-header">
                            <span class="author-name">@${post.author}</span>
                            <span class="post-date">${displayDate}</span>
                        </div>
                        <div class="board-item-content">${post.content}</div>
                        <div class="board-item-footer">
                            <div class="board-item-actions">
                                <button class="btn-like ${localStorage.getItem('liked_' + post.id) ? 'liked' : ''}" onclick="likePost('${post.id}')">
                                    <svg viewBox="0 0 24 24" width="14" height="14" stroke="currentColor" stroke-width="2" fill="none"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg>
                                    <span class="like-count">${post.likes || 0}</span>
                                </button>
                                <button class="btn-small" onclick="startReply('${post.id}', '${post.author.replace(/'/g, "\\'")}')">답글</button>
                                <button class="btn-small" onclick="openBoardModal('edit', '${post.id}')">수정</button>
                                <button class="btn-small" onclick="openBoardModal('delete', '${post.id}')">삭제</button>
                            </div>
                        </div>
                    </div>
                </div>
            `;
            postWrapper.appendChild(postEl);

            if (post.children && post.children.length > 0) {
                const replyCount = post.children.length;
                const toggleBtn = document.createElement('button');
                toggleBtn.className = 'reply-toggle-btn';
                toggleBtn.innerHTML = `<span>▼</span> 답글 ${replyCount}개 보기`;
                toggleBtn.onclick = () => toggleReplies(post.id, toggleBtn);
                postWrapper.appendChild(toggleBtn);

                const repliesContainer = document.createElement('div');
                repliesContainer.id = `replies-${post.id}`;
                repliesContainer.className = 'replies-container';

                post.children.sort((a, b) => new Date(a.created_at) - new Date(b.created_at)).forEach(child => {
                    createPostHTML(child, depth + 1, repliesContainer);
                });
                postWrapper.appendChild(repliesContainer);
            }

            parentContainer.appendChild(postWrapper);
        };

        rootPosts.forEach(root => createPostHTML(root));
    };

    window.toggleReplies = (postId, btn) => {
        const container = document.getElementById(`replies-${postId}`);
        const isShowing = container.classList.toggle('show');
        const count = container.querySelectorAll('.board-item').length;
        btn.innerHTML = isShowing ? `<span>▲</span> 답글 숨기기` : `<span>▼</span> 답글 ${count}개 보기`;
    };

    window.startReply = (parentId, author) => {
        resetBoardForm();
        replyToInput.value = parentId;
        statusText.innerHTML = `<span style="opacity:0.7">↳</span> @${author} 님의 글에 답글 작성 중...`;
        boardStatus.style.display = 'block';
        boardSubmitBtn.textContent = '답글달기';

        const targetEl = document.getElementById(`post-${parentId}`);
        if (targetEl) targetEl.classList.add('target-highlight');

        boardForm.scrollIntoView({ behavior: 'smooth', block: 'center' });
        document.getElementById('board-author').focus();
    };

    window.likePost = async (postId) => {
        const post = posts.find(p => p.id == postId);
        if (!post) return;

        let newLikes = post.likes || 0;
        const likedKey = 'liked_' + postId;

        if (localStorage.getItem(likedKey)) {
            newLikes = Math.max(0, newLikes - 1);
            localStorage.removeItem(likedKey);
        } else {
            newLikes += 1;
            localStorage.setItem(likedKey, 'true');
        }

        // 1. Always Update Local First for instant UI
        post.likes = newLikes;
        localStorage.setItem('amk_portfolio_posts', JSON.stringify(posts));
        renderPosts();

        // 2. Sync with Firebase in background
        if (db) {
            db.collection('posts').doc(String(postId)).update({ likes: newLikes })
                .catch(e => console.error('Remote like failed:', e.message));
        }
    };

    window.setBoardSort = (type) => {
        currentBoardSort = type;
        document.querySelectorAll('.sort-btn').forEach(btn => btn.classList.remove('active'));
        if (type === 'latest') document.getElementById('sort-latest').classList.add('active');
        if (type === 'likes') document.getElementById('sort-likes').classList.add('active');
        renderPosts();
    };

    if (boardForm) {
        boardForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const author = document.getElementById('board-author').value.trim();
            const password = document.getElementById('board-password').value;
            const content = document.getElementById('board-content').value.trim();
            const editId = editIdInput.value;
            const parentId = replyToInput.value;

            if (author && password && content) {
                const newPost = {
                    id: editId ? editId : Date.now(),
                    parent_id: parentId ? parentId : null,
                    author,
                    password,
                    content,
                    likes: 0,
                    created_at: new Date().toISOString()
                };

                // 1. Always Update Local First
                if (editId) {
                    const idx = posts.findIndex(p => p.id == editId);
                    if (idx !== -1) posts[idx] = { ...posts[idx], author, content };
                } else {
                    posts.unshift(newPost);
                }
                
                // Ensure no duplicates and save
                const uniquePosts = Array.from(new Map(posts.map(item => [item.id, item])).values());
                posts = uniquePosts;
                
                localStorage.setItem('amk_portfolio_posts', JSON.stringify(posts));
                renderPosts();
                resetBoardForm();

                // 2. Sync with Firebase if available
                if (db) {
                    try {
                        if (editId) {
                            await db.collection('posts').doc(editId).update({ author, password, content });
                        } else {
                            const dbPost = { ...newPost };
                            delete dbPost.id; 
                            await db.collection('posts').add(dbPost);
                        }
                    } catch (e) {
                        console.error('Remote sync failed:', e.message);
                    }
                }
            }
        });
    }

    window.openBoardModal = (action, id) => {
        currentAction = action;
        currentTargetId = id;
        if (modal) {
            modal.classList.add('active');
            modalPasswordInput.value = '';
            modalPasswordInput.focus();
        }
    };

    const closeBoardModal = () => {
        if (modal) modal.classList.remove('active');
        currentAction = null;
        currentTargetId = null;
    };

    if (modalCancel) modalCancel.addEventListener('click', closeBoardModal);

    if (modalSubmit) {
        modalSubmit.addEventListener('click', async () => {
            const inputPass = modalPasswordInput.value;
            const targetPost = posts.find(p => p.id == currentTargetId);

            if (!targetPost) {
                closeBoardModal();
                return;
            }

            if (inputPass === targetPost.password) {
                if (currentAction === 'delete') {
                    if (confirm('정말 삭제하시겠습니까?')) {
                        // 1. Always Update Local First for instant UI
                        console.log('Attempting to delete post ID:', currentTargetId);
                        
                        // ID comparison with explicit string conversion for robustness
                        const idx = posts.findIndex(p => String(p.id) === String(currentTargetId));
                        
                        if (idx !== -1) {
                            console.log('Post found at index:', idx);
                            posts.splice(idx, 1);
                            
                            // Also remove any replies to this post
                            posts = posts.filter(p => String(p.parent_id) !== String(currentTargetId));
                            
                            localStorage.setItem('amk_portfolio_posts', JSON.stringify(posts));
                            renderPosts();
                            console.log('Post and replies deleted. Current count:', posts.length);
                        } else {
                            console.warn('Post not found in local array. ID type mismatch?');
                        }
                        closeBoardModal();

                        // 2. Sync with Firebase in background
                        if (db) {
                            db.collection('posts').doc(String(currentTargetId)).delete()
                                .catch(e => console.error('Remote delete failed:', e.message));
                        }
                    }
                } else if (currentAction === 'edit') {
                    resetBoardForm();
                    document.getElementById('board-author').value = targetPost.author;
                    document.getElementById('board-password').value = targetPost.password;
                    document.getElementById('board-content').value = targetPost.content;
                    editIdInput.value = targetPost.id;
                    statusText.textContent = '글 수정 중...';
                    boardStatus.style.display = 'block';
                    boardSubmitBtn.textContent = '수정완료';
                    closeBoardModal();
                    boardForm.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }
            } else {
                alert('비밀번호가 일치하지 않습니다.');
            }
        });
    }

    // Initial Load
    fetchPosts();

    // Glass panel move interaction
    const glassPanels = document.querySelectorAll('.glass');
    glassPanels.forEach(panel => {
        panel.addEventListener('mousemove', (e) => {
            const rect = panel.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            panel.style.setProperty('--mouse-x', `${x}px`);
            panel.style.setProperty('--mouse-y', `${y}px`);
        });
    });



    /**
     * Vertical Timeline Scroll Reveal
     */
    const timelineItems = document.querySelectorAll('.timeline-item');
    const timelineObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('active');
            }
        });
    }, { threshold: 0.3 });

    timelineItems.forEach(item => timelineObserver.observe(item));


    // 5. Competency Card Interactions (Modal Expansion)
    const competencyData = {
        'responsibility': {
            tag: 'RELIABILITY & STAMINA',
            title: '육군 만기 전역이 증명하는 현장 적합성',
            content: `
                <div class="competency-overview">
                    <div class="overview-box">
                        <h5>💡 핵심 경험</h5>
                        <p>육군 18개월 복무 중 철저한 점검과 예방 정비 습관으로 단 한 건의 장비 사고 없이 <strong>운용률 100%</strong>를 달성하며 <span class="text-highlight">엔지니어의 책임감</span>을 체득했습니다.</p>
                    </div>
                    <div class="overview-box">
                        <h5>🚀 AMK 실무 적용점</h5>
                        <p>무거운 방진복을 착용하는 클린룸 환경의 교대 근무와 돌발 상황에서도 흔들리지 않는 <span class="text-highlight">강인한 체력</span>으로 장비 가동률(Up-time)을 수호하겠습니다.</p>
                    </div>
                </div>
                <div class="detail-highlights">
                    <div class="highlight-item">
                        <h4>Zero-Fail Mindset</h4>
                        <p>중요 장비 유지보수 임무 수행 시 철저한 체크리스트 기반 점검 습관 정착</p>
                    </div>
                    <div class="highlight-item">
                        <h4>Field Endurance</h4>
                        <p>교대 근무 및 야간 긴급 대응 상황에서도 평정심을 유지하는 강인한 체력 보유</p>
                    </div>
                </div>
            `
        },
        'troubleshooting-detail': {
            tag: 'DATA-DRIVEN RCA',
            title: 'Troubleshooting: 반도체 공정의 근본 원인을 찾는 통찰력',
            content: `
                <div class="competency-overview">
                    <div class="overview-box">
                        <h5>💡 핵심 경험</h5>
                        <p>PLC 입출력 데이터와 센서 반응 로그를 분석하여, 원인을 알 수 없던 밸브 및 가스 유량(MFC) 제어 타이밍의 로직 병목을 찾아내고 시퀀스를 최적화했습니다.</p>
                    </div>
                    <div class="overview-box">
                        <h5>🚀 AMK 실무 적용점</h5>
                        <p>단순한 하드웨어 교체가 아닌 데이터 기반의 <span class="text-highlight">Root Cause Analysis(RCA)</span>를 통해 비정형적 에러의 근본 원인을 식별하고 최단 시간에 장비를 안정화합니다.</p>
                    </div>
                </div>
                <div class="detail-highlights">
                    <div class="highlight-item">
                        <h4>Process Data Analysis</h4>
                        <p>장비 로그 데이터를 정량화하여 원인 범위를 축소하는 논리적 분석 프로세스 구축</p>
                    </div>
                    <div class="highlight-item">
                        <h4>Logic Optimization</h4>
                        <p>반도체 공정 조건에 부합하는 제어 로직 최적화 및 선제적 장비 안정화 경험</p>
                    </div>
                </div>
            `
        },
        'teamwork-detail': {
            tag: 'GLOBAL COLLABORATION',
            title: '협업과 소통: 최고의 Customer Satisfaction 실현',
            content: `
                <div class="competency-overview">
                    <div class="overview-box">
                        <h5>💡 핵심 경험</h5>
                        <p>프로젝트 리더로서 기계/전자/SW 파트 간의 소통 오류를 막기 위해 <strong>Weekly Sync-up</strong>과 <strong>인터페이스 정의서(ICD)</strong>를 도입하여 다학제적 융합을 이끌었습니다.</p>
                    </div>
                    <div class="overview-box">
                        <h5>🚀 AMK 실무 적용점</h5>
                        <p>글로벌 기술 문서 해독 능력과 <span class="text-highlight">투명한 소통</span>을 바탕으로, 글로벌 엔지니어 및 고객사와 협업하여 최상의 장비 솔루션을 제공하는 브릿지가 되겠습니다.</p>
                    </div>
                </div>
                <div class="detail-highlights">
                    <div class="highlight-item">
                        <h4>Multi-disciplinary Bridge</h4>
                        <p>기계와 전자 파트 간의 기술적 간극을 메우는 조율자 및 중재자 역할 수행</p>
                    </div>
                    <div class="highlight-item">
                        <h4>Proactive Communication</h4>
                        <p>문제 발생 시 숨기지 않고 공유하여 해결 시간을 단축시키는 투명한 소통 방식</p>
                    </div>
                </div>
            `
        },
        'clutch-detail': {
            tag: 'MECHANICAL INSIGHT',
            title: 'Orthographic Projection: Clutch Automata',
            content: `
                <div class="competency-overview">
                    <div class="overview-box process-step">
                        <h5 class="step-title"><span class="step-badge">Phase 1</span> 기구학적 설계 (Kinematic Design)</h5>
                        <p>삼각법(Orthographic Projection)을 활용하여 동력 전달을 위한 레버와 크랭크 기구의 3D 도면을 설계하고, 동작 메커니즘을 구체화했습니다.</p>
                    </div>
                    <div class="overview-box process-step">
                        <h5 class="step-title"><span class="step-badge">Phase 2</span> 공차 및 간섭 해석 (Tolerance Analysis)</h5>
                        <p>3D 시뮬레이션을 통해 조립 시 발생할 수 있는 부품 간 물리적 간섭을 사전에 검증하고, 기계적 오차를 최소화하는 정밀한 공차(Tolerance)를 계산했습니다.</p>
                    </div>
                    <div class="overview-box process-step">
                        <h5 class="step-title"><span class="step-badge">Phase 3</span> 통찰력 및 실무 적용 (Insight & Application)</h5>
                        <p>기구 구조에 대한 깊은 이해를 바탕으로, AMK 웨이퍼 이송 로봇 등 장비 하드웨어의 <span class="text-highlight">정렬 불량(Misalignment)이나 기구학적 마모 이슈</span>를 정확하게 진단하고 신속하게 조치합니다.</p>
                    </div>
                </div>
                <div class="detail-highlights">
                    <div class="highlight-item">
                        <h4>Tolerance Design</h4>
                        <p>조립 공차 계산을 통해 부품 간 충돌을 방지하고 구동부의 수명을 연장하는 설계 체득</p>
                    </div>
                    <div class="highlight-item">
                        <h4>Power Transmission</h4>
                        <p>모터의 회전력을 선형/왕복 운동으로 변환하는 과정에서의 구동 에너지 손실률 최소화</p>
                    </div>
                </div>
            `
        },
        'robot-detail': {
            tag: 'SYSTEM INTEGRATION & RCA',
            title: 'Linkage Analysis: 6-Legged Robot',
            content: `
                <div class="competency-overview">
                    <div class="overview-box process-step">
                        <h5 class="step-title"><span class="step-badge">Phase 1</span> 통합 시스템 설계 (System Integration)</h5>
                        <p>단순한 보행 알고리즘을 넘어, 하드웨어(기구부)와 제어 로직 간의 통합 관점에서 동역학 모듈 간의 간섭을 최소화한 6족 로봇을 설계했습니다.</p>
                    </div>
                    <div class="overview-box process-step">
                        <h5 class="step-title"><span class="step-badge">Phase 2</span> 원인 분석 및 최적화 (Root Cause Analysis)</h5>
                        <p>로봇 제작 중 발생한 다리 꼬임 현상을 단순 모터 불량으로 넘기지 않고 <span class="text-highlight">RCA</span>를 수행하여, 제어 응답 속도 격차에 의한 공차 누적임을 규명하고 설계를 최적화했습니다.</p>
                    </div>
                    <div class="overview-box process-step">
                        <h5 class="step-title"><span class="step-badge">Phase 3</span> 트러블슈팅 및 실무 적용 (Troubleshooting)</h5>
                        <p>수천 개의 부품이 정밀하게 동기화되는 초격차 공정 장비에서, 수치 기반의 오차 분석을 통해 <span class="text-highlight">비정형적 알람의 근본 원인을 즉시 파악</span>하고 가동률을 극대화하겠습니다.</p>
                    </div>
                </div>
                <div class="detail-highlights">
                    <div class="highlight-item">
                        <h4>Kinematic Simulation</h4>
                        <p>수십 차례의 시뮬레이션을 통해 모터와 링크 간의 물리적 간섭 범위를 도출 및 최적화</p>
                    </div>
                    <div class="highlight-item">
                        <h4>Tolerance Analysis</h4>
                        <p>부품 누적 공차가 장비 기동에 미치는 영향을 정량화하여 근본적인 개선 방안 제시</p>
                    </div>
                </div>
            `
        }
    };

    const compCards = document.querySelectorAll('[data-target]');
    const detailOverlay = document.getElementById('detail-overlay');
    const detailBodyContent = document.getElementById('detail-body-content');
    const closeDetailBtn = document.getElementById('close-detail');

    compCards.forEach(card => {
        card.addEventListener('click', () => {
            const target = card.getAttribute('data-target');
            const data = competencyData[target];

            if (data && detailBodyContent && detailOverlay) {
                detailBodyContent.innerHTML = `
                    <div class="detail-header">
                        <span class="tag">${data.tag}</span>
                        <h2>${data.title}</h2>
                    </div>
                    <div class="detail-body">
                        ${data.content}
                    </div>
                `;
                detailOverlay.classList.add('active');
            }
        });
    });

    const closeDetail = () => {
        if (detailOverlay) {
            detailOverlay.classList.remove('active');
        }
    };

    if (closeDetailBtn) closeDetailBtn.addEventListener('click', closeDetail);
    if (detailOverlay) {
        detailOverlay.addEventListener('click', (e) => {
            if (e.target === detailOverlay) closeDetail();
        });
    }

    // 5. Logic Simulation Reveal Logic
    const logicTrigger = document.getElementById('logic-simulation-trigger');
    const triggerWrapper = document.getElementById('trigger-wrapper');
    const simulationWrapper = document.getElementById('simulation-wrapper');
    const scrollHint = document.getElementById('new-scroll-hint');

    if (logicTrigger && triggerWrapper && simulationWrapper) {
        logicTrigger.addEventListener('click', () => {
            // 1. 섹션 먼저 노출 (display: block 처리)
            simulationWrapper.style.display = 'block';

            // 2. 애니메이션 클래스 부여 (브라우저 리플로우를 위해 미세한 지연)
            setTimeout(() => {
                triggerWrapper.classList.add('shrunk');
                simulationWrapper.classList.add('expanded');
                if (scrollHint) scrollHint.classList.add('visible');

                // 버튼 숨기기
                logicTrigger.style.transition = 'opacity 0.4s ease';
                logicTrigger.style.opacity = '0';

                // 3. 중앙 자동 스크롤 적용
                simulationWrapper.scrollIntoView({ behavior: 'smooth', block: 'center' });

                // 4. STEP 가이드 박스 순차적 등장 (Staggered Animation)
                const guideItems = document.querySelectorAll('.guide-item');
                guideItems.forEach((item, index) => {
                    setTimeout(() => {
                        item.classList.add('visible');
                    }, 400 + (index * 200)); // 메인 카드 등장 후 0.4초부터 0.2초 간격으로 등장
                });
            }, 50);
        });
    }

    // 6. Roadmap Subject Modal Logic (Dynamic Data Mapping)
    const subjectData = {
        plc: {
            title: "PLC프로그래밍",
            desc: "자동화 설비 제어 및 트러블슈팅을 위한 시퀀스 및 래더 로직 설계 역량 습득. XGK 시리즈 실습을 통해 장비 가동 시퀀스 최적화 및 안정적인 인터락 인터페이스 구축 능력을 확보했습니다.",
            image: "plc_logic.png",
            customHtml: ""
        },
        mcu: {
            title: "마이크로컨트롤러",
            desc: "하드웨어 기반 제어 시스템 및 센서 인터페이스 설계 능력 배양. 임베디드 C를 활용하여 실시간 데이터 수집 및 액츄에이터 정밀 제어 시스템을 구축했습니다.",
            image: "mcu_circuit.png",
            customHtml: ""
        },
        web: {
            title: "웹프로그래밍",
            desc: "바이브코딩을 활용한 효율적인 웹 UI 및 데이터 모니터링 대시보드 구축. 실시간 장비 가동 현황과 공정 파라미터를 대시보드로 시각화하여 운영 효율성을 극대화하는 솔루션을 제시합니다.",
            image: "바이브코딩.png",
            customHtml: ""
        },
        window: {
            title: "윈도우프로그래밍",
            desc: "C# .NET을 기반으로 한 직관적인 장비 운용 GUI(Graphic User Interface) 소프트웨어 개발. 복잡한 장비 시퀀스를 한눈에 파악할 수 있는 HMI(Human-Machine Interface) 디자인과 예외 처리 로직을 구현했습니다.",
            image: "windows_programming.png",
            customHtml: ""
        },
        python: {
            title: "파이썬프로그래밍",
            desc: "",
            image: "",
            customHtml: `
                <div class="python-modal-custom">
                    <h3 class="py-title"><span class="icon">🚀</span> Next-Gen: 자율 주행 설비 최적화</h3>
                    <p class="py-desc">
                        반도체 현장에서는 단순한 하드웨어 제어를 넘어 방대한 '공정 빅데이터'를 어떻게 다루느냐가 핵심 경쟁력입니다. 
                        저는 파이썬의 강력한 라이브러리를 활용하여 <strong>현장의 데이터를 수집, 분석하고 공정 알고리즘을 최적화</strong>하는 역량을 갖추었습니다. 
                        단순 제어를 넘어, 딥러닝 기반의 알고리즘으로 장비의 '골든 사이클'을 도출하고 공정 변수를 실시간 튜닝합니다.
                    </p>
                    <div class="code-editor-mock">
                        <div class="editor-header">
                            <span class="dot red"></span><span class="dot yellow"></span><span class="dot green"></span>
                            <span class="filename">wafer_cycle_optimizer.py</span>
                        </div>
                        <pre>
<span class="keyword">import</span> numpy <span class="keyword">as</span> np
<span class="keyword">from</span> amk_lib <span class="keyword">import</span> EquipmentBrain

<span class="comment"># 설비 디지털 트윈 데이터 동기화</span>
fleet = EquipmentBrain(id=<span class="string">'AMK-ETCH-01'</span>)
process_logs = fleet.get_telemetry_stream()

<span class="keyword">def</span> <span class="function">optimize_process_window</span>(data):
    <span class="comment"># 실시간 수율(Yield) 하락 지점 감지 알고리즘</span>
    drift = np.abs(data[<span class="string">'pressure'</span>] - 1.25)
    
    <span class="keyword">if</span> drift > 0.05:
        <span class="comment"># 엣지 연산 기반 파라미터 즉각 보정</span>
        fleet.adjust_valve(<span class="string">'MFC_02'</span>, target=drift * -1.2)
        <span class="keyword">return</span> <span class="string">"ALERT: 공정 드리프트 감지 - 실시간 보정 완료"</span>
    <span class="keyword">return</span> <span class="string">"OPTIMIZED: 최적 공정 윈도우 유지 중"</span>
                        </pre>
                    </div>
                    <ul class="py-footer-list" style="margin-top: 1.5rem;">
                        <li><span class="arrow">▶</span> <span class="text-highlight">데이터 중심 사고</span>: NumPy/Pandas를 활용한 초정밀 공정 데이터 분석 및 가시화 역량.</li>
                        <li><span class="arrow">▶</span> <span class="text-highlight">RCA 엔지니어링</span>: 장비의 비정상 신호를 0.1초 단위로 분석하여 장애 징후를 조기에 감지하는 스마트 PM(예방 정비) 솔루션 구현 가능.</li>
                        <li><span class="arrow">▶</span> <span class="text-highlight">AI 통합 제어</span>: 머신러닝 모델을 시스템 인터페이스에 통합하여 수율 최적화 로직 설계.</li>
                    </ul>
                </div>
            `
        }
    };

    const triggers = document.querySelectorAll('.modal-trigger');
    const roadmapOverlay = document.getElementById('subject-modal-overlay');
    const roadmapCloseBtn = document.getElementById('close-subject-modal');
    const roadmapModalBody = document.getElementById('subject-modal-body');
    const roadmapModalContent = roadmapOverlay ? roadmapOverlay.querySelector('.roadmap-modal-content') : null;

    const openSubjectModal = (subject) => {
        const data = subjectData[subject];
        if (!data) return;

        // Reset classes
        if (roadmapModalContent) {
            roadmapModalContent.classList.remove('web-special');
            if (subject === 'web') roadmapModalContent.classList.add('web-special');
        }

        let content = '';
        if (data.customHtml) {
            content = data.customHtml;
        } else {
            content = `
                <div class="subject-img-wrap"><img src="${data.image}" alt="${data.title}"></div>
                <h3 class="subject-title">${data.title}</h3>
                <p class="subject-desc" style="white-space: pre-line; word-break: keep-all;">${data.desc}</p>
            `;
        }

        if (roadmapModalBody) roadmapModalBody.innerHTML = content;
        if (roadmapOverlay) roadmapOverlay.classList.add('active');
    };

    const closeSubjectModal = () => {
        if (roadmapOverlay) roadmapOverlay.classList.remove('active');
    };

    triggers.forEach(trigger => {
        trigger.addEventListener('click', () => {
            openSubjectModal(trigger.dataset.subject);
        });
    });

    if (roadmapCloseBtn) roadmapCloseBtn.addEventListener('click', closeSubjectModal);
    if (roadmapOverlay) {
        roadmapOverlay.addEventListener('click', (e) => {
            if (e.target === roadmapOverlay) closeSubjectModal();
        });
    }

    renderPosts();

    /**
     * Three.js 3D Background Animation
     */
    const initThreeJS = () => {
        const canvas = document.querySelector('#bg-canvas');
        if (!canvas) return;

        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        const renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true, alpha: true });
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

        // Objects - Floating Engineering Polyhedrons
        const geometry = new THREE.IcosahedronGeometry(1.5, 0);
        const wireMaterial = new THREE.MeshStandardMaterial({ 
            color: 0x0284c7, 
            wireframe: true,
            transparent: true,
            opacity: 0.25
        });
        const solidMaterial = new THREE.MeshStandardMaterial({ 
            color: 0xffffff,
            transparent: true,
            opacity: 0.1,
            metalness: 0.2,
            roughness: 0.1
        });

        const meshes = [];
        for (let i = 0; i < 12; i++) {
            const group = new THREE.Group();
            
            const wireMesh = new THREE.Mesh(geometry, wireMaterial);
            const solidMesh = new THREE.Mesh(geometry, solidMaterial);
            
            group.add(wireMesh);
            group.add(solidMesh);
            
            group.position.x = (Math.random() - 0.5) * 30;
            group.position.y = (Math.random() - 0.5) * 30;
            group.position.z = (Math.random() - 0.5) * 15;
            
            const scale = Math.random() * 0.8 + 0.3;
            group.scale.set(scale, scale, scale);
            
            scene.add(group);
            meshes.push({
                mesh: group,
                speedX: (Math.random() - 0.5) * 0.008,
                speedY: (Math.random() - 0.5) * 0.008,
                rotSpeed: (Math.random() - 0.5) * 0.005
            });
        }

        // --- Particle System Enhanced ---
        const particlesCount = 30;
        const positions = new Float32Array(particlesCount * 3);
        const pVelocities = new Float32Array(particlesCount * 3);
        
        for (let i = 0; i < particlesCount * 3; i += 3) {
            positions[i] = (Math.random() - 0.5) * 50;
            positions[i + 1] = (Math.random() - 0.5) * 50;
            positions[i + 2] = (Math.random() - 0.5) * 15;
            
            pVelocities[i] = (Math.random() - 0.5) * 0.02;
            pVelocities[i + 1] = (Math.random() - 0.5) * 0.02;
            pVelocities[i + 2] = (Math.random() - 0.5) * 0.01;
        }
        
        const particlesGeometry = new THREE.BufferGeometry();
        particlesGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        
        const createBubbleTexture = () => {
            const canvas = document.createElement('canvas');
            canvas.width = 64;
            canvas.height = 64;
            const ctx = canvas.getContext('2d');
            const gradient = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
            
            // Bubble effect: Transparent center, thin glowing ring
            gradient.addColorStop(0, 'rgba(255, 255, 255, 0)');
            gradient.addColorStop(0.7, 'rgba(14, 165, 233, 0.05)');
            gradient.addColorStop(0.85, 'rgba(14, 165, 233, 0.3)');
            gradient.addColorStop(0.92, 'rgba(255, 255, 255, 0.6)'); // Highlight
            gradient.addColorStop(0.96, 'rgba(14, 165, 233, 0.4)');
            gradient.addColorStop(1, 'rgba(14, 165, 233, 0)');
            
            ctx.fillStyle = gradient;
            ctx.fillRect(0, 0, 64, 64);
            
            // Add a small specular highlight for a more bubble-like look
            ctx.beginPath();
            ctx.arc(22, 22, 4, 0, Math.PI * 2);
            ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
            ctx.fill();
            
            return new THREE.CanvasTexture(canvas);
        };
        
        const particlesMaterial = new THREE.PointsMaterial({
            size: 2.5,
            map: createBubbleTexture(),
            transparent: true,
            opacity: 0.5,
            blending: THREE.NormalBlending,
            depthWrite: false,
            sizeAttenuation: true
        });
        
        const particleSystem = new THREE.Points(particlesGeometry, particlesMaterial);
        scene.add(particleSystem);
        // -----------------------------

        // Lights
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
        scene.add(ambientLight);
        const directionalLight = new THREE.DirectionalLight(0xffffff, 1.2);
        directionalLight.position.set(5, 5, 5);
        scene.add(directionalLight);

        // [New] Mouse-following Spotlight (PointLight)
        const mouseLight = new THREE.PointLight(0x0284c7, 15, 50);
        scene.add(mouseLight);

        camera.position.z = 10;

        // Mouse Parallax
        let mouseX = 0;
        let mouseY = 0;
        window.addEventListener('mousemove', (e) => {
            mouseX = (e.clientX / window.innerWidth - 0.5) * 2;
            mouseY = (e.clientY / window.innerHeight - 0.5) * 2;
            
            // Move spotlight with mouse (normalized to 3D space)
            mouseLight.position.x = mouseX * 15;
            mouseLight.position.y = -mouseY * 15;
            mouseLight.position.z = 5;
        });

        const animate = () => {
            requestAnimationFrame(animate);

            meshes.forEach(m => {
                m.mesh.rotation.x += m.rotSpeed;
                m.mesh.rotation.y += m.rotSpeed;
                m.mesh.position.x += m.speedX;
                m.mesh.position.y += m.speedY;

                // Bounce
                if (Math.abs(m.mesh.position.x) > 20) m.speedX *= -1;
                if (Math.abs(m.mesh.position.y) > 20) m.speedY *= -1;
            });

            // Update Particles
            const pPositions = particlesGeometry.attributes.position.array;
            for (let i = 0; i < particlesCount; i++) {
                const i3 = i * 3;
                pPositions[i3] += pVelocities[i3];
                pPositions[i3 + 1] += pVelocities[i3 + 1];
                pPositions[i3 + 2] += pVelocities[i3 + 2];
                
                // Keep within bounds with wrap-around or bounce
                if (Math.abs(pPositions[i3]) > 25) pVelocities[i3] *= -1;
                if (Math.abs(pPositions[i3 + 1]) > 25) pVelocities[i3 + 1] *= -1;
                if (Math.abs(pPositions[i3 + 2]) > 15) pVelocities[i3 + 2] *= -1;
            }
            particlesGeometry.attributes.position.needsUpdate = true;

            // Smooth Camera Movement (Parallax)
            camera.position.x += (mouseX * 2 - camera.position.x) * 0.03;
            camera.position.y += (-mouseY * 2 - camera.position.y) * 0.03;
            camera.lookAt(scene.position);

            renderer.render(scene, camera);
        };

        window.addEventListener('resize', () => {
            camera.aspect = window.innerWidth / window.innerHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(window.innerWidth, window.innerHeight);
        });

        animate();
    };

    initThreeJS();
    // 7. Contact Form Submission (EmailJS Integration)
    const contactForm = document.getElementById('contact-form');
    const contactSubmit = document.getElementById('contact-submit');
    const formStatus = document.getElementById('form-status');

    if (contactForm) {
        contactForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            // Check if emailjs is loaded
            if (typeof emailjs === 'undefined') {
                console.error('EmailJS not loaded');
                return;
            }

            // Set loading state
            contactSubmit.classList.add('loading');
            formStatus.innerHTML = '';

            try {
                // Replace with your Service ID and Template ID
                const serviceID = 'YOUR_SERVICE_ID';
                const templateID = 'YOUR_TEMPLATE_ID';

                await emailjs.sendForm(serviceID, templateID, contactForm);
                
                formStatus.innerHTML = '메시지가 성공적으로 전송되었습니다!';
                formStatus.className = 'form-status success';
                contactForm.reset();
            } catch (error) {
                console.error('EmailJS Error:', error);
                formStatus.innerHTML = '전송에 실패했습니다. 다시 시도해주세요.';
                formStatus.className = 'form-status error';
            } finally {
                contactSubmit.classList.remove('loading');
            }
        });
    }
    // 8. Debug: Reset Board Data
    window.clearBoardData = () => {
        if (confirm('모든 게시판 데이터를 초기화할까요? (내 브라우저 한정)')) {
            localStorage.removeItem('amk_portfolio_posts');
            posts = [];
            renderPosts();
            alert('초기화되었습니다. 새로고침 후 다시 이용해주세요.');
            location.reload();
        }
    };
});


