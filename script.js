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

// 각 화면 표시 시간 (ms)
const screenDurations = [
    3000,   // 필독 타이틀
    5000,   // 전자기기
    6000,   // 폐쇄공포증
    6000,   // 동의서
    5000,   // 환불
    3000,   // 주의사항 타이틀
    5000,   // 반입금지
    5000,   // 힘으로 X
    5000,   // 천장/벽
    4000,   // 폐쇄공포증
    6000,   // 힌트
    5000,   // 보안유지
    5000,   // 인터폰
    4000,   // CCTV
    5000,   // 진행률
    5000,   // 자물쇠
    3000,   // 힌트시스템 타이틀
    6000,   // 힌트폰 화면 소개
    6000,   // QR Code 버튼
    6000,   // QR 스캔
    6000,   // 메시지 보내기
    6000,   // 추가 힌트
    6000,   // 추가 힌트 화면
    6000,   // 바탕화면
    6000,   // 그림판
    6000,   // 로그인 넘버
    3000,   // 자물쇠 안내 타이틀
    7000,   // 방향 자물쇠
    10000,  // 방향 자물쇠 영상
    6000,   // 숫자 자물쇠
    6000,   // 마스터 자물쇠
    6000,   // 4버튼 자물쇠
    7000,   // 금고
    5000,   // 도어락
    5000    // 완료 (5초 후 자동 이동)
];

let currentGuideIndex = 0;
let guideTimer = null;
let isPaused = false;
let pausedTimeRemaining = 0;
let pausedStartTime = 0;

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
        stopGuide();
        isPaused = false;
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
    stopGuide();

    document.querySelectorAll('.screen').forEach(screen => {
        screen.classList.remove('active');
    });

    document.getElementById(screenId).classList.add('active');
}

// 가이드 시작
function startGuide() {
    currentGuideIndex = 0;
    showGuideScreen();
}

// 가이드 화면 표시
function showGuideScreen() {
    const screenId = guideScreens[currentGuideIndex];
    const duration = screenDurations[currentGuideIndex];

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

    // 프로그레스 바 업데이트
    const progressBar = currentScreen.querySelector('.progress');
    if (progressBar && duration > 0) {
        progressBar.style.width = '0%';
        progressBar.style.transition = 'none';

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

        setTimeout(() => {
            progressBar.style.transition = `width ${duration}ms linear`;
            progressBar.style.width = '100%';
        }, 50);
    }

    // 다음 화면으로 자동 전환
    if (duration > 0) {
        pausedStartTime = Date.now();
        pausedTimeRemaining = duration;
        guideTimer = setTimeout(() => {
            if (currentGuideIndex >= guideScreens.length - 1) {
                goToForm();
            } else {
                currentGuideIndex++;
                showGuideScreen();
            }
        }, duration);
    }
}

// 일시정지
function pauseGuide() {
    if (guideTimer) {
        clearTimeout(guideTimer);
        guideTimer = null;
        pausedTimeRemaining = pausedTimeRemaining - (Date.now() - pausedStartTime);
        isPaused = true;

        // 프로그레스 바 일시정지
        const activeScreen = document.querySelector('.screen.active');
        const progressBar = activeScreen?.querySelector('.progress');
        if (progressBar) {
            const computedWidth = getComputedStyle(progressBar).width;
            progressBar.style.transition = 'none';
            progressBar.style.width = computedWidth;
        }
    }
}

// 재개
function resumeGuide() {
    if (isPaused && pausedTimeRemaining > 0) {
        isPaused = false;
        pausedStartTime = Date.now();

        // 프로그레스 바 재개
        const activeScreen = document.querySelector('.screen.active');
        const progressBar = activeScreen?.querySelector('.progress');
        if (progressBar) {
            setTimeout(() => {
                progressBar.style.transition = `width ${pausedTimeRemaining}ms linear`;
                progressBar.style.width = '100%';
            }, 50);
        }

        guideTimer = setTimeout(() => {
            currentGuideIndex++;
            showGuideScreen();
        }, pausedTimeRemaining);
    }
}

// 가이드 중지
function stopGuide() {
    if (guideTimer) {
        clearTimeout(guideTimer);
        guideTimer = null;
    }
}

// 키보드 단축키
document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
        goToScreen('screen-intro');
    }
    // 스페이스바: 일시정지/재개 토글
    if (e.key === ' ') {
        e.preventDefault();
        const activeScreen = document.querySelector('.screen.active');
        if (activeScreen && guideScreens.includes(activeScreen.id)) {
            if (isPaused) {
                resumeGuide();
            } else {
                pauseGuide();
            }
        }
    }
    if (e.key === 'ArrowRight') {
        const activeScreen = document.querySelector('.screen.active');
        if (activeScreen && guideScreens.includes(activeScreen.id)) {
            stopGuide();
            isPaused = false;
            if (currentGuideIndex < guideScreens.length - 1) {
                currentGuideIndex++;
                showGuideScreen();
            }
        }
    }
    if (e.key === 'ArrowLeft') {
        const activeScreen = document.querySelector('.screen.active');
        if (activeScreen && guideScreens.includes(activeScreen.id)) {
            stopGuide();
            isPaused = false;
            if (currentGuideIndex > 0) {
                currentGuideIndex--;
                showGuideScreen();
            }
        }
    }
});
