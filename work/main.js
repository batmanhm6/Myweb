document.addEventListener('DOMContentLoaded', () => {
    // 1. Reveal animations on scroll
    const revealElements = document.querySelectorAll('.reveal');
    const revealOnScroll = () => {
        const triggerBottom = window.innerHeight * 0.95;
        revealElements.forEach(el => {
            const elTop = el.getBoundingClientRect().top;
            if (elTop < triggerBottom) {
                el.classList.add('active');
            }
        });
    };
    window.addEventListener('scroll', revealOnScroll);
    revealOnScroll();

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

    // 3. Smooth scrolling for navigation
    const navLinks = document.querySelectorAll('.nav-menu a');
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const targetId = link.getAttribute('href');
            const targetPart = document.querySelector(targetId);
            if (targetPart) {
                const navHeight = document.getElementById('navbar').offsetHeight;
                window.scrollTo({
                    top: targetPart.offsetTop - navHeight,
                    behavior: 'smooth'
                });
            }
        });
    });

    // 4. Free Board CRUD Logic (Local Storage)
    const boardForm = document.getElementById('board-form');
    const boardList = document.getElementById('board-list');
    const modal = document.getElementById('board-modal');
    const modalPasswordInput = document.getElementById('modal-password');
    const modalSubmit = document.getElementById('modal-submit');
    const modalCancel = document.getElementById('modal-cancel');

    let posts = JSON.parse(localStorage.getItem('amk_portfolio_posts') || '[]');
    let currentAction = null; // 'edit' or 'delete'
    let currentTargetIndex = null;

    const savePosts = () => {
        localStorage.setItem('amk_portfolio_posts', JSON.stringify(posts));
        renderPosts();
    };

    const renderPosts = () => {
        boardList.innerHTML = '';
        if (posts.length === 0) {
            boardList.innerHTML = '<p style="text-align:center; color:var(--text-muted); padding:3rem;">아직 남겨진 글이 없습니다. 첫 글을 남겨주세요!</p>';
            return;
        }

        posts.forEach((post, index) => {
            const postEl = document.createElement('div');
            postEl.className = 'board-item glass reveal active';
            postEl.innerHTML = `
                <div class="board-item-header">
                    <span class="author"><strong>${post.author}</strong></span>
                    <span class="date">${post.date}</span>
                </div>
                <div class="board-item-content">${post.content}</div>
                <div class="board-item-actions">
                    <button class="btn-small btn-edit" onclick="openBoardModal('edit', ${index})">수정</button>
                    <button class="btn-small btn-delete" onclick="openBoardModal('delete', ${index})">삭제</button>
                </div>
            `;
            boardList.appendChild(postEl);
        });
    };

    if (boardForm) {
        boardForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const author = document.getElementById('board-author').value.trim();
            const password = document.getElementById('board-password').value;
            const content = document.getElementById('board-content').value.trim();

            if (author && password && content) {
                const newPost = {
                    author,
                    password,
                    content,
                    date: new Date().toLocaleString()
                };
                posts.unshift(newPost);
                savePosts();
                boardForm.reset();
            }
        });
    }

    // Modal Functions (Global access for onclick)
    window.openBoardModal = (action, index) => {
        currentAction = action;
        currentTargetIndex = index;
        modal.classList.add('active');
        modalPasswordInput.value = '';
        modalPasswordInput.focus();
    };

    const closeBoardModal = () => {
        modal.classList.remove('active');
        currentAction = null;
        currentTargetIndex = null;
    };

    modalCancel.addEventListener('click', closeBoardModal);
    
    modalSubmit.addEventListener('click', () => {
        const inputPass = modalPasswordInput.value;
        const targetPost = posts[currentTargetIndex];

        if (inputPass === targetPost.password) {
            if (currentAction === 'delete') {
                if (confirm('정말 삭제하시겠습니까?')) {
                    posts.splice(currentTargetIndex, 1);
                    savePosts();
                    closeBoardModal();
                }
            } else if (currentAction === 'edit') {
                const newContent = prompt('수정할 내용을 입력하세요:', targetPost.content);
                if (newContent !== null && newContent.trim() !== '') {
                    posts[currentTargetIndex].content = newContent.trim();
                    posts[currentTargetIndex].date = new Date().toLocaleString() + ' (수정됨)';
                    savePosts();
                    closeBoardModal();
                }
            }
        } else {
            alert('비밀번호가 일치하지 않습니다.');
        }
    });

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

    // Initial render
    renderPosts();
});
