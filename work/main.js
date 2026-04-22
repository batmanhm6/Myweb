document.addEventListener('DOMContentLoaded', () => {
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

        // Scroll to top of the section (internal scroll reset)
        targetSection.scrollTop = 0;

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

        // Wait for 2.6 seconds, then fade out
        setTimeout(() => {
            splash.classList.add('fade-out');

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
            }, 800);
        }, 2600);
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

    // 4. Free Board CRUD Logic (Local Storage)
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

    let posts = JSON.parse(localStorage.getItem('amk_portfolio_posts') || '[]');

    // 데이터 마이그레이션 (기존 글에 ID가 없는 경우 대비)
    let needsSave = false;
    posts.forEach((post, idx) => {
        if (!post.id) {
            post.id = Date.now() - (idx * 1000); // 겹치지 않게 임시 ID 부여
            needsSave = true;
        }
    });
    if (needsSave) localStorage.setItem('amk_portfolio_posts', JSON.stringify(posts));

    let currentAction = null; // 'edit' or 'delete'
    let currentTargetId = null;

    const savePosts = () => {
        localStorage.setItem('amk_portfolio_posts', JSON.stringify(posts));
        renderPosts();
    };

    const resetBoardForm = () => {
        boardForm.reset();
        editIdInput.value = '';
        replyToInput.value = '';
        boardStatus.style.display = 'none';
        boardSubmitBtn.textContent = '글쓰기';

        // 모든 하이라이트 제거
        document.querySelectorAll('.board-item').forEach(el => el.classList.remove('target-highlight'));
    };

    if (cancelEditBtn) {
        cancelEditBtn.addEventListener('click', resetBoardForm);
    }

    const renderPosts = () => {
        if (!boardList) return;
        boardList.innerHTML = '';

        // 연한 파란색 배경을 유지하기 위해 board-list가 비어있어도 최소 높이 보장
        if (posts.length === 0) {
            boardList.innerHTML = '<p style="text-align:center; color:var(--text-muted); padding:3rem;">아직 남겨진 글이 없습니다. 첫 글을 남겨주세요!</p>';
            return;
        }

        // 최신순 정렬 (ID 기준 내림차순)
        const sortedPosts = [...posts].sort((a, b) => b.id - a.id);

        // 계층형 구조 렌더링을 위해 맵 생성
        const postMap = {};
        sortedPosts.forEach(p => postMap[p.id] = { ...p, children: [] });

        const rootPosts = [];
        sortedPosts.forEach(p => {
            if (p.parentId && postMap[p.parentId]) {
                // 부모가 있는 경우 (답글)
                postMap[p.parentId].children.push(postMap[p.id]);
            } else {
                // 부모가 없거나 못 찾은 경우 (원본글)
                rootPosts.push(postMap[p.id]);
            }
        });

        // 아바타 색상 팔레트
        const avatarColors = ['#0ea5e9', '#6366f1', '#a855f7', '#ec4899', '#f43f5e', '#f59e0b', '#10b981'];
        const getAvatarColor = (name) => {
            let hash = 0;
            for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
            return avatarColors[Math.abs(hash) % avatarColors.length];
        };

        // 재귀적 렌더링 함수
        const createPostHTML = (post, depth = 0, parentContainer = boardList) => {
            const isHighlight = (editIdInput.value == post.id || replyToInput.value == post.id);
            const postWrapper = document.createElement('div');
            postWrapper.className = 'post-wrapper';

            const postEl = document.createElement('div');
            postEl.id = `post-${post.id}`;
            postEl.className = `board-item ${isHighlight ? 'target-highlight' : ''}`;

            const firstChar = post.author.charAt(0).toUpperCase();
            const avatarColor = getAvatarColor(post.author);

            postEl.innerHTML = `
                <div class="board-item-main">
                    <div class="post-avatar" style="background-color: ${avatarColor}">${firstChar}</div>
                    <div class="post-body">
                        <div class="board-item-header">
                            <span class="author-name">@${post.author}</span>
                            <span class="post-date">${post.date}</span>
                        </div>
                        <div class="board-item-content">${post.content}</div>
                        <div class="board-item-footer">
                            <div class="board-item-actions">
                                <button class="btn-small" onclick="startReply(${post.id}, '${post.author}')">답글</button>
                                <button class="btn-small" onclick="openBoardModal('edit', ${post.id})">수정</button>
                                <button class="btn-small" onclick="openBoardModal('delete', ${post.id})">삭제</button>
                            </div>
                        </div>
                    </div>
                </div>
            `;
            postWrapper.appendChild(postEl);

            // 답글 처리
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

                // 답글 내에서는 작성 순서대로 (id 오름차순)
                post.children.sort((a, b) => a.id - b.id).forEach(child => {
                    createPostHTML(child, depth + 1, repliesContainer);
                });
                postWrapper.appendChild(repliesContainer);
            }

            parentContainer.appendChild(postWrapper);
        };

        rootPosts.forEach(root => createPostHTML(root));
    };

    // 답글 토글 함수
    window.toggleReplies = (postId, btn) => {
        const container = document.getElementById(`replies-${postId}`);
        const isShowing = container.classList.toggle('show');
        const count = container.querySelectorAll('.board-item').length;
        btn.innerHTML = isShowing ? `<span>▲</span> 답글 숨기기` : `<span>▼</span> 답글 ${count}개 보기`;
    };

    // 답글 시작 함수
    window.startReply = (parentId, author) => {
        resetBoardForm();
        replyToInput.value = parentId;
        statusText.innerHTML = `<span style="opacity:0.7">↳</span> @${author} 님의 글에 답글 작성 중...`;
        boardStatus.style.display = 'block';
        boardSubmitBtn.textContent = '답글달기';

        // 대상 글 하이라이트 추가
        const targetEl = document.getElementById(`post-${parentId}`);
        if (targetEl) targetEl.classList.add('target-highlight');

        boardForm.scrollIntoView({ behavior: 'smooth', block: 'center' });
        document.getElementById('board-author').focus();
    };

    if (boardForm) {
        boardForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const author = document.getElementById('board-author').value.trim();
            const password = document.getElementById('board-password').value;
            const content = document.getElementById('board-content').value.trim();
            const editId = editIdInput.value;
            const parentId = replyToInput.value;

            if (author && password && content) {
                if (editId) {
                    // 수정 로직
                    const index = posts.findIndex(p => p.id == editId);
                    if (index !== -1) {
                        posts[index].author = author;
                        posts[index].password = password; // 비밀번호도 업데이트 가능하게
                        posts[index].content = content;
                        posts[index].date = new Date().toLocaleString() + ' (수정됨)';
                    }
                } else {
                    // 새 글 또는 답글 작성
                    const newPost = {
                        id: Date.now(),
                        parentId: parentId ? parseInt(parentId) : null,
                        author,
                        password,
                        content,
                        date: new Date().toLocaleString()
                    };
                    posts.unshift(newPost);
                }
                savePosts();
                resetBoardForm();
            }
        });
    }

    // Modal Functions (Global access for onclick)
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
        modalSubmit.addEventListener('click', () => {
            const inputPass = modalPasswordInput.value;
            const targetIndex = posts.findIndex(p => p.id == currentTargetId);

            if (targetIndex === -1) {
                closeBoardModal();
                return;
            }

            const targetPost = posts[targetIndex];

            if (inputPass === targetPost.password) {
                if (currentAction === 'delete') {
                    if (confirm('정말 삭제하시겠습니까? (답글이 있는 경우 답글도 함께 삭제될 수 있습니다)')) {
                        // 실제로는 parentId가 이 ID인 것들도 처리해야 할 수 있지만, 간단하게 해당 글만 삭제하거나 트리 정리
                        posts.splice(targetIndex, 1);
                        savePosts();
                        closeBoardModal();
                    }
                } else if (currentAction === 'edit') {
                    // 수정 폼으로 로드
                    resetBoardForm();
                    document.getElementById('board-author').value = targetPost.author;
                    document.getElementById('board-password').value = targetPost.password;
                    document.getElementById('board-content').value = targetPost.content;

                    editIdInput.value = targetPost.id;
                    statusText.textContent = '글 수정 중...';
                    boardStatus.style.display = 'block';
                    boardSubmitBtn.textContent = '수정완료';

                    // 대상 글 하이라이트 추가
                    const targetEl = document.getElementById(`post-${targetPost.id}`);
                    if (targetEl) targetEl.classList.add('target-highlight');

                    closeBoardModal();
                    boardForm.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }
            } else {
                alert('비밀번호가 일치하지 않습니다.');
            }
        });
    }

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

    // Roadmap stage hover
    const roadmapStages = document.querySelectorAll('.roadmap-stage');
    roadmapStages.forEach(stage => {
        stage.addEventListener('mouseenter', () => {
            stage.style.transform = 'translateY(-5px) scale(1.02)';
        });
        stage.addEventListener('mouseleave', () => {
            stage.style.transform = 'translateY(0) scale(1)';
        });
    });

    // 5. Competency Card Interactions (Modal Expansion)
    const competencyData = {
        'responsibility': {
            tag: 'RELIABILITY & STAMINA',
            title: '육군 만기 전역이 증명하는 현장 적합성',
            content: `
                <p>대한민국 육군에서 18개월간의 복무를 마치며,<br>어떤 극한의 환경에서도 맡은 바 임무를 완수하는 <span class="text-highlight">엔지니어의 책임감</span>을 체득했습니다.</p>
                <p>군 복무 시절, 단 한 건의 장비 사고 없이 운용률 100%를 유지했던 경험은 AMK의 초격차 반도체 장비를 다루는 데 있어 최상의 신뢰를 드릴 수 있는 근거입니다.</p>
                <p>특히 CE 직무는 무거운 방진복을 착용하고 클린룸 내에서 장시간 교대 근무를 수행해야 하는 <span class="text-highlight">강인한 체력</span>이 필수적입니다.</p>
                <p>저는 군에서 단련된 기초 체력과 정신력을 바탕으로, 현장의 돌발 상황에서도 지치지 않고 고객사의 가동률(Up-time) 극대화를 위해 헌신할 준비가 되어 있습니다.</p>
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
                <p><span class="text-highlight">반도체 부트캠프</span> 실무 실습 중, 장비 제어 시뮬레이션에서 원인을 알 수 없는 지연(Delay) 현상과 오작동 이슈가 발생했습니다. 저는 이를 단순한 하드웨어 결함으로 넘기지 않고, 전체 시스템 관점에서 <span class="text-highlight">Root Cause Analysis(RCA)</span> 기법을 적용하여 문제에 접근했습니다.</p>
                <p>PLC 입출력 데이터와 각종 센서의 반응 로그를 시간대별로 대조한 결과, 고도의 <span class="text-highlight">반도체 공정 기술</span>에서 요구되는 챔버 내 밸브 제어와 가스 유량(MFC) 제어 사이의 미세한 타이밍 오차가 누적되어 발생한 로직 병목임을 밝혀냈습니다.</p>
                <p>이후 타이밍 다이어그램을 재설계하고 제어 시퀀스를 최적화하여 오차를 해결함으로써, 공정 장비 시스템의 안정적인 구동을 성공적으로 구현해냈습니다.</p>
                <p>이러한 데이터 기반의 <span class="text-highlight">분석적 사고방식</span>은 복잡한 AMK 장비에서 발생하는 비정형적인 에러의 근본 원인을 식별하고 신속하게 조치하여 장비 가동률(Up-time)을 철저히 보장하는 핵심 역량이 될 것입니다.</p>
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
                <p>로봇 제작은 기계, 전자, 소프트웨어 등 다양한 분야의 전공지식이 융합되는 과정입니다. 저는 프로젝트 리더로서 각 파트 간의 소통 오류를 해결하기 위해 <span class="text-highlight">Weekly Sync-up</span> 회의를 도입했고, 인터페이스 정의서(ICD)를 작성하여 팀원 간의 R&R을 명확히 했습니다.</p>
                <p>또한, 글로벌 기술 문서를 해독하고 해외 커뮤니티의 오픈 소스를 활용하여 기술적 난제를 해결하는 과정에서 <span class="text-highlight">기술 영어</span>의 중요성을 깨닫고 꾸준히 역량을 쌓아왔습니다.</p>
                <p>AMK의 글로벌 엔지니어들과 협력하여 고객사가 만족하는 최상의 장비 솔루션을 제공하는 <span class="text-highlight">Professional Collaborator</span>가 되겠습니다.</p>
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
                <p>단순한 도면 시각화를 넘어, <span class="text-highlight">삼각법(Orthographic Projection)</span>을 기반으로 복잡한 하드웨어의 공차(Tolerance)를 정밀하게 계산하고 구조적 안정성을 검증하는 역량을 길렀습니다.</p>
                <p>특히 레버 및 크랭크 기구의 동력 전달 메커니즘을 3D로 구조화하고 간섭 여부를 시뮬레이션하며 기계적 통찰력을 심화했습니다.</p>
                <p>이 경험은 AMK의 웨이퍼 이송 로봇 및 진공 구동부 등 <span class="text-highlight">핵심 장비 하드웨어의 정렬 불량(Misalignment)이나 기구학적 마모 이슈</span>를 정확하게 진단하고 신속하게 유지보수(PM/BM)하는 데 강력한 밑거름이 될 것입니다.</p>
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
                <p>단순한 보행 알고리즘 구현을 넘어, <span class="text-highlight">하드웨어와 제어 간의 통합(Integration)</span> 관점 하에 동역학 모듈 간의 간섭을 최소화한 6족 로봇 프로젝트입니다.</p>
                <p>제작 중 발생한 다리 꼬임 현상을 1차원적인 모터 결함으로 치부하지 않고 <span class="text-highlight">Root Cause Analysis(RCA)</span>를 수행하여, 응답 속도 격차에 의한 하드웨어적 공차 누적을 규명하고 설계를 전면적으로 변경했습니다.</p>
                <p>이러한 수치 기반의 오차 분석 경험은, 수천 개의 부품이 정밀하게 동기화되어야 하는 AMK 반도체 공정 장비의 <span class="text-highlight">비정형적 알람 원인 분석</span> 및 신속한 퍼포먼스 안정화에 즉각적으로 기여할 것입니다.</p>
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

    // Initial render
    renderPosts();
});
