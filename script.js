// 가이드 화면 순서
const guideScreens = [
    'guide-title',      // 필독 타이틀
    'guide-1',          // 전자기기 반입금지
    'guide-2',          // 폐쇄공포증/임산부
    'guide-3',          // 개인정보 동의서
    'guide-4',          // 중도포기 환불불가
    'notice-title',     // 주의사항 타이틀
    'notice-1',         // 반입금지
    'notice-2',         // 힘으로 X
    'notice-3',         // 천장/벽
    'notice-4',         // 폐쇄공포증/임산부
    'notice-5',         // 힌트
    'notice-6',         // 보안유지
    'notice-7',         // 인터폰
    'notice-8',         // CCTV
    'notice-9',         // 진행률
    'notice-10',        // 직원용 자물쇠
    'notice-11',        // 폴라로이드 찾기 이벤트
    'hint-title',       // 힌트시스템 타이틀
    'hint-1',           // 힌트폰 화면 소개
    'hint-2',           // QR Code 버튼
    'hint-3',           // QR 스캔
    'hint-4',           // 메시지 보내기
    'hint-5',           // 추가 힌트
    'hint-6',           // 추가 힌트 화면
    'hint-7',           // 바탕화면
    'hint-8',           // 그림판
    'hint-9',           // 로그인 넘버
    'lock-title',       // 자물쇠 안내 타이틀
    'lock-1',           // 방향 자물쇠
    'lock-1-video',     // 방향 자물쇠 영상
    'lock-2',           // 숫자 자물쇠
    'lock-3',           // 마스터 자물쇠
    'lock-4',           // 4버튼 자물쇠
    'lock-5',           // 금고
    'lock-6',           // 도어락
    'guide-end'         // 완료
];

// 화면은 자동으로 넘어가지 않고, 손님이 '다음' / '이전' 버튼으로 직접 넘김
let currentGuideIndex = 0;

// 섹션 탭 정보
const sectionTabs = [
    { name: '주의사항', start: 'notice-title', prefix: 'notice' },
    { name: '힌트시스템', start: 'hint-title', prefix: 'hint' },
    { name: '자물쇠 안내', start: 'lock-title', prefix: 'lock' }
];

// 현재 섹션 확인
function getCurrentSection(screenId) {
    if (screenId.startsWith('notice')) return 'notice';
    if (screenId.startsWith('hint')) return 'hint';
    if (screenId.startsWith('lock')) return 'lock';
    return null;
}

// 탭 생성 함수
function createTabs(screenId) {
    const currentSection = getCurrentSection(screenId);
    if (!currentSection) return '';

    let tabsHtml = '<div class="section-tabs">';

    sectionTabs.forEach(tab => {
        const isActive = tab.prefix === currentSection ? 'active' : '';
        tabsHtml += `<button class="section-tab ${isActive}" onclick="goToSection('${tab.start}')">${tab.name}</button>`;
    });

    tabsHtml += '</div>';
    return tabsHtml;
}

// 섹션으로 이동
function goToSection(screenId) {
    const index = guideScreens.indexOf(screenId);
    if (index !== -1) {
        currentGuideIndex = index;
        showGuideScreen();
    }
}

// 탭 업데이트 함수
function updateTabs(screenId) {
    // 기존 탭 제거
    document.querySelectorAll('.section-tabs').forEach(tab => tab.remove());

    // 새 탭 추가
    const screen = document.getElementById(screenId);
    if (screen) {
        const tabsHtml = createTabs(screenId);
        if (tabsHtml) {
            screen.insertAdjacentHTML('afterbegin', tabsHtml);
        }
    }
}

// 폼 페이지로 이동
function goToForm() {
    window.location.href = 'form.html';
}

// 화면 전환 함수
function goToScreen(screenId) {
    document.querySelectorAll('.screen').forEach(screen => {
        screen.classList.remove('active');
    });

    document.getElementById(screenId).classList.add('active');
    document.getElementById('guide-nav').classList.remove('visible');
}

// 가이드 시작
function startGuide() {
    currentGuideIndex = 0;
    showGuideScreen();
}

// 다음 화면 (마지막 화면에서는 서약서로 이동)
function nextScreen() {
    if (currentGuideIndex >= guideScreens.length - 1) {
        goToForm();
    } else {
        currentGuideIndex++;
        showGuideScreen();
    }
}

// 이전 화면
function prevScreen() {
    if (currentGuideIndex > 0) {
        currentGuideIndex--;
        showGuideScreen();
    }
}

// 하단 이전/다음 버튼 상태 업데이트
function updateNav() {
    const isLast = currentGuideIndex === guideScreens.length - 1;
    document.getElementById('guide-nav').classList.add('visible');
    document.getElementById('nav-prev').disabled = currentGuideIndex === 0;
    document.getElementById('nav-count').textContent = `${currentGuideIndex + 1} / ${guideScreens.length}`;
    const nextBtn = document.getElementById('nav-next');
    nextBtn.innerHTML = isLast
        ? '서약서 작성하기 <i class="fa-solid fa-pen"></i>'
        : '다음 <i class="fa-solid fa-chevron-right"></i>';
    nextBtn.classList.toggle('final', isLast);
}

// 가이드 화면 표시
function showGuideScreen() {
    const screenId = guideScreens[currentGuideIndex];

    // 모든 화면 비활성화
    document.querySelectorAll('.screen').forEach(screen => {
        screen.classList.remove('active');
    });

    // 현재 화면 활성화
    const currentScreen = document.getElementById(screenId);
    currentScreen.classList.add('active');

    // 화면 안에 video가 있으면 처음부터 재생 (iOS Safari autoplay 우회)
    const video = currentScreen.querySelector('video');
    if (video) {
        try { video.currentTime = 0; } catch (e) {}
        video.play().catch(() => {});
    }

    // 탭 업데이트
    updateTabs(screenId);

    // 프로그레스 바: 전체 중 몇 번째 화면인지 표시
    const progressBar = currentScreen.querySelector('.progress');
    if (progressBar) {
        // 섹션별 프로그레스 바 색상
        if (screenId.startsWith('notice')) {
            progressBar.style.background = '#D4A853';  // 주의사항: 머스타드
        } else if (screenId.startsWith('hint')) {
            progressBar.style.background = '#3366FF';  // 힌트시스템: 파란색
        } else if (screenId.startsWith('lock')) {
            progressBar.style.background = '#2D5A4A';  // 자물쇠: 딥그린
        } else {
            progressBar.style.background = '#2D5A4A';  // 필독: 딥그린
        }
        progressBar.style.width = `${(currentGuideIndex + 1) / guideScreens.length * 100}%`;
    }

    updateNav();
}

// 키보드 단축키
document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
        goToScreen('screen-intro');
    }
    const activeScreen = document.querySelector('.screen.active');
    if (!activeScreen || !guideScreens.includes(activeScreen.id)) return;
    if (e.key === 'ArrowRight') {
        nextScreen();
    }
    if (e.key === 'ArrowLeft') {
        prevScreen();
    }
});
