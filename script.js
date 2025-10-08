const STORAGE_KEY = 'kurumeWebtoolState';
const TOTAL_ROUNDS = 4;

function applyLayoutScale() {
    const root = document.documentElement;
    const container = document.querySelector('.container');
    if (!root || !container) {
        return;
    }

    const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
    if (isSafari) {
        root.style.setProperty('--scale-factor', '1');
        return;
    }

    root.style.setProperty('--scale-factor', '1');

    requestAnimationFrame(() => {
        const contentHeight = container.scrollHeight;
        if (!contentHeight) {
            root.style.setProperty('--scale-factor', '1');
            return;
        }
        const availableHeight = window.innerHeight;
        const initialRatio = availableHeight / contentHeight;
        const normalizedScale = initialRatio > 0 ? Math.min(1, initialRatio) : 1;

    });
}

function getDefaultRoundState() {
    return {
        personalScore: 0,
        playerScores: Array(TOTAL_ROUNDS).fill(0),
        playerStatuses: Array(TOTAL_ROUNDS).fill('out')
    };
}

function getDefaultGameState() {
    return {
        currentRound: 0,
        rounds: Array.from({ length: TOTAL_ROUNDS }, () => getDefaultRoundState()),
        playerTotalScores: Array(TOTAL_ROUNDS).fill(0),
        isMultiMode: true
    };
}

let gameState = getDefaultGameState();

function normalizeScores(arrayLike) {
    const result = Array(TOTAL_ROUNDS).fill(0);
    if (!Array.isArray(arrayLike)) {
        return result;
    }
    for (let i = 0; i < TOTAL_ROUNDS; i++) {
        const value = Number(arrayLike[i]);
        result[i] = Number.isFinite(value) ? value : 0;
    }
    return result;
}

function normalizeStatuses(arrayLike) {
    const result = Array(TOTAL_ROUNDS).fill('out');
    if (!Array.isArray(arrayLike)) {
        return result;
    }
    for (let i = 0; i < TOTAL_ROUNDS; i++) {
        const status = arrayLike[i];
        if (status === 'out') {
            result[i] = 'out';
        } else {
            result[i] = 'rescue';
        }
    }
    return result;
}

function normalizeRound(roundLike) {
    if (!roundLike || typeof roundLike !== 'object') {
        return getDefaultRoundState();
    }
    return {
        personalScore: Number.isFinite(Number(roundLike.personalScore)) ? Number(roundLike.personalScore) : 0,
        playerScores: normalizeScores(roundLike.playerScores),
        playerStatuses: normalizeStatuses(roundLike.playerStatuses)
    };
}

function normalizeRounds(roundsLike) {
    const rounds = Array.from({ length: TOTAL_ROUNDS }, () => getDefaultRoundState());
    if (!Array.isArray(roundsLike)) {
        return rounds;
    }
    for (let i = 0; i < TOTAL_ROUNDS; i++) {
        rounds[i] = normalizeRound(roundsLike[i]);
    }
    return rounds;
}

function getCurrentRoundState() {
    return gameState.rounds[gameState.currentRound];
}

function updateRoundButtons() {
    document.querySelectorAll('.round-btn').forEach(button => {
        const round = Number(button.dataset.round);
        button.classList.toggle('active', round === gameState.currentRound);
    });
}

function recalculateTotalScores() {
    const totals = Array(TOTAL_ROUNDS).fill(0);

    gameState.rounds.forEach(roundState => {
        for (let i = 0; i < TOTAL_ROUNDS; i++) {
            const status = roundState.playerStatuses[i];
            if (status === 'rescue') {
                const value = Number(roundState.playerScores[i]) || 0;
                totals[i] += value < 0 ? 0 : value;
            }
        }
        const personalValue = Number(roundState.personalScore);
        if (Number.isFinite(personalValue)) {
            totals[0] += personalValue < 0 ? 0 : personalValue;
        }
    });

    gameState.playerTotalScores = totals;
}

function refreshScoreDisplays() {
    recalculateTotalScores();
    const roundState = getCurrentRoundState();

    for (let i = 1; i <= 3; i++) {
        const tempScoreEl = document.getElementById(`personalPlayer${i}TempScore`);
        if (tempScoreEl) {
            tempScoreEl.textContent = roundState.playerScores[i - 1];
        }
        const totalScoreEl = document.getElementById(`personalPlayer${i}TotalScore`);
        if (totalScoreEl) {
            totalScoreEl.textContent = gameState.playerTotalScores[i - 1];
        }
    }

    for (let i = 0; i < TOTAL_ROUNDS; i++) {
        const displayIndex = i + 1;
        const roundScoreEl = document.getElementById(`multiPlayer${displayIndex}Score`);
        if (roundScoreEl) {
            roundScoreEl.textContent = roundState.playerScores[i];
        }
        const totalEl = document.getElementById(`multiPlayer${displayIndex}TotalScore`);
        if (totalEl) {
            totalEl.textContent = gameState.playerTotalScores[i];
        }
    }
}

        function updateStatusButtons() {
    const roundState = getCurrentRoundState();

    const sectionId = gameState.isMultiMode ? 'multiStatusSection' : 'personalStatusSection';
    const section = document.getElementById(sectionId);
    if (!section) {
        return;
    }

    const playerCount = gameState.isMultiMode ? 4 : 3;

    for (let i = 0; i < playerCount; i++) {
        const currentStatus = roundState.playerStatuses[i];
        const isRescue = currentStatus !== 'out';

        const toggle = section.querySelector('.status-switch-input[data-player="' + i + '"]');
        if (!toggle) {
            continue;
        }

        toggle.checked = isRescue;

        const track = toggle.nextElementSibling;
        if (track && track.classList.contains('status-switch-track')) {
            track.classList.toggle('is-rescue', isRescue);
            track.classList.toggle('is-out', !isRescue);
        }

        const label = toggle.closest('.status-toggle');
        if (label) {
            label.classList.toggle('is-rescue', isRescue);
            label.classList.toggle('is-out', !isRescue);

            const stateText = label.querySelector('.status-state-text');
            if (stateText) {
                stateText.textContent = '移動中/脱落';
                stateText.classList.toggle('state-rescue', isRescue);
                stateText.classList.toggle('state-out', !isRescue);
            }
        }
    }
}

function handleStatusToggle(input) {
    if (!input) {
        return;
    }
    const playerIndex = Number(input.dataset.player);
    if (Number.isNaN(playerIndex)) {
        return;
    }
    const status = input.checked ? 'rescue' : 'out';
    setPlayerStatus(playerIndex, status);
}

function handlePersonalStatusToggle(input) {
    if (!input) {
        return;
    }
    const playerIndex = Number(input.dataset.player);
    if (Number.isNaN(playerIndex)) {
        return;
    }
    const status = input.checked ? 'rescue' : 'out';
    setPlayerStatus(playerIndex, status);
}

function saveGameState() {
    if (typeof localStorage === 'undefined') {
        return;
    }
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(gameState));
    } catch (error) {
        console.warn('Failed to save game state', error);
    }
}

function loadGameState() {
    if (typeof localStorage === 'undefined') {
        return;
    }
    try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (!stored) {
            return;
        }
        const parsed = JSON.parse(stored);
        if (!parsed || typeof parsed !== 'object') {
            return;
        }

        const playerTotalScores = normalizeScores(parsed.playerTotalScores);
        let rounds;
        let currentRound = Number(parsed.currentRound);
        if (!Number.isInteger(currentRound) || currentRound < 0 || currentRound >= TOTAL_ROUNDS) {
            currentRound = 0;
        }

        if (Array.isArray(parsed.rounds)) {
            rounds = normalizeRounds(parsed.rounds);
        } else {
            rounds = normalizeRounds();
            rounds[0].personalScore = Number.isFinite(Number(parsed.personalScore)) ? Number(parsed.personalScore) : 0;
            rounds[0].playerScores = normalizeScores(parsed.playerScores);
            rounds[0].playerStatuses = normalizeStatuses(parsed.playerStatuses);
            currentRound = 0;
        }

        gameState = {
            currentRound,
            rounds,
            playerTotalScores,
            isMultiMode: parsed.isMultiMode === false ? false : true
        };
        saveGameState();
    } catch (error) {
        console.warn('Failed to load game state', error);
        gameState = getDefaultGameState();
    }
}

function setCurrentRound(roundIndex) {
    if (!Number.isInteger(roundIndex) || roundIndex < 0 || roundIndex >= TOTAL_ROUNDS) {
        return;
    }
    gameState.currentRound = roundIndex;
    updateRoundButtons();
    refreshScoreDisplays();
    updateStatusButtons();
    saveGameState();
}

function updatePersonalScore(playerIndex, change) {
    const roundState = getCurrentRoundState();
    roundState.playerScores[playerIndex - 1] += change;
    refreshScoreDisplays();
    saveGameState();
}

function updateMultiPlayerScore(playerIndex, change) {
    const roundState = getCurrentRoundState();
    roundState.playerScores[playerIndex - 1] += change;
    refreshScoreDisplays();
    saveGameState();
}

function setPlayerStatus(playerIndex, status) {
    if (!Number.isInteger(playerIndex) || playerIndex < 0 || playerIndex >= TOTAL_ROUNDS) {
        return;
    }
    const roundState = getCurrentRoundState();
    const allowedStatuses = ['rescue', 'out'];
    const nextStatus = allowedStatuses.includes(status) ? status : 'rescue';
    if (roundState.playerStatuses[playerIndex] === nextStatus) {
        return;
    }
    roundState.playerStatuses[playerIndex] = nextStatus;
    updateStatusButtons();
    refreshScoreDisplays();
    saveGameState();
}

function resetProvisionalScores() {
    const roundState = getCurrentRoundState();
    if (gameState.isMultiMode) {
        for (let i = 0; i < TOTAL_ROUNDS; i++) {
            roundState.playerScores[i] = 0;
        }
    } else {
        roundState.personalScore = 0;
    }
    refreshScoreDisplays();
    saveGameState();
}

function showResetConfirmation() {
    const modal = document.getElementById('resetModal');
    if (modal) {
        modal.style.display = 'flex';
    }
}

function hideResetConfirmation() {
    const modal = document.getElementById('resetModal');
    if (modal) {
        modal.style.display = 'none';
    }
}

function confirmReset() {
    gameState = getDefaultGameState();
    updateRoundButtons();
    updateStatusButtons();
    refreshScoreDisplays();
    saveGameState();
    hideResetConfirmation();
}

function showHelpModal() {
    const modal = document.getElementById('helpModal');
    if (modal) {
        modal.style.display = 'flex';
    }
}

function hideHelpModal() {
    const modal = document.getElementById('helpModal');
    if (modal) {
        modal.style.display = 'none';
    }
    if (typeof localStorage !== 'undefined') {
        try {
            const currentTime = new Date().getTime();
            localStorage.setItem('kurumeWebtoolLastVisit', currentTime.toString());
        } catch (error) {
            console.warn('Failed to save last visit time', error);
        }
    }
}

function checkFirstVisit() {
    if (typeof localStorage === 'undefined') {
        return;
    }
    try {
        const lastVisitStr = localStorage.getItem('kurumeWebtoolLastVisit');
        const currentTime = new Date().getTime();

        if (!lastVisitStr) {
            setTimeout(() => {
                showHelpModal();
            }, 500);
        } else {
            const lastVisit = parseInt(lastVisitStr, 10);
            const daysSinceLastVisit = (currentTime - lastVisit) / (1000 * 60 * 60 * 24);

            if (daysSinceLastVisit >= 7) {
                setTimeout(() => {
                    showHelpModal();
                }, 500);
            }
        }
    } catch (error) {
        console.warn('Failed to check first visit', error);
    }
}

function switchToPersonalMode() {
    if (!gameState.isMultiMode) {
        return;
    }
    resetAllScores();
    gameState.isMultiMode = false;
    updateModeDisplay();
    saveGameState();
}

function switchToMultiMode() {
    if (gameState.isMultiMode) {
        return;
    }
    resetAllScores();
    gameState.isMultiMode = true;
    updateModeDisplay();
    saveGameState();
}

function resetAllScores() {
    gameState.rounds = Array.from({ length: TOTAL_ROUNDS }, () => getDefaultRoundState());
    gameState.playerTotalScores = Array(TOTAL_ROUNDS).fill(0);
    gameState.currentRound = 0;
    updateRoundButtons();
    refreshScoreDisplays();
    updateStatusButtons();
    saveGameState();
}

function updateModeDisplay() {
    const personalSection = document.getElementById('personalSection');
    const multiPlayerSection = document.getElementById('multiPlayerSection');
    const personalModeBtn = document.getElementById('personalModeBtn');
    const multiModeBtn = document.getElementById('multiModeBtn');

    const personalSummaryWrapper = document.getElementById('personalSummaryWrapper');
    const multiSummaryWrapper = document.getElementById('multiSummaryWrapper');

    if (gameState.isMultiMode) {
        if (personalSection) personalSection.style.display = 'none';
        if (multiPlayerSection) multiPlayerSection.style.display = 'flex';

        if (personalSummaryWrapper) personalSummaryWrapper.style.display = 'none';
        if (multiSummaryWrapper) multiSummaryWrapper.style.display = 'flex';

        if (personalModeBtn) personalModeBtn.classList.remove('active');
        if (multiModeBtn) multiModeBtn.classList.add('active');
    } else {
        if (personalSection) personalSection.style.display = 'flex';
        if (multiPlayerSection) multiPlayerSection.style.display = 'none';

        if (personalSummaryWrapper) personalSummaryWrapper.style.display = 'flex';
        if (multiSummaryWrapper) multiSummaryWrapper.style.display = 'none';

        if (personalModeBtn) personalModeBtn.classList.add('active');
        if (multiModeBtn) multiModeBtn.classList.remove('active');
    }

    updateRoundButtons();
    updateStatusButtons();
    refreshScoreDisplays();
    applyLayoutScale();
}


function toggleMode() {
    switchToMultiMode();
}

window.addEventListener('load', function() {
    loadGameState();
    updateModeDisplay();
    checkFirstVisit();

    let previousHeight = window.innerHeight;
    let isKeyboardOpen = false;

    function setViewportHeight() {
        let currentHeight;
        if (window.visualViewport) {
            currentHeight = window.visualViewport.height;
        } else {
            currentHeight = window.innerHeight;
        }

        let vh = currentHeight * 0.01;
        document.documentElement.style.setProperty('--vh', `${vh}px`);

        if (previousHeight > currentHeight + 150) {
            isKeyboardOpen = true;
            document.body.classList.add('keyboard-open');
        } else if (previousHeight < currentHeight - 150) {
            isKeyboardOpen = false;
            document.body.classList.remove('keyboard-open');
        }
        previousHeight = currentHeight;

        const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
        if (isSafari) {
            document.body.style.height = `${currentHeight}px`;
            document.body.style.minHeight = `-webkit-fill-available`;
        }
    }

    setViewportHeight();
    applyLayoutScale();

    if (window.visualViewport) {
        window.visualViewport.addEventListener('resize', function() {
            setViewportHeight();
            applyLayoutScale();
        });

        window.visualViewport.addEventListener('scroll', function() {
            if (isKeyboardOpen) {
                window.scrollTo(0, 0);
            }
        });
    }

    let resizeTimer;
    window.addEventListener('resize', function() {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(() => {
            setViewportHeight();
            applyLayoutScale();
        }, 100);
    });

    window.addEventListener('orientationchange', function() {
        setTimeout(() => {
            setViewportHeight();
            applyLayoutScale();
        }, 100);
        setTimeout(() => {
            setViewportHeight();
            applyLayoutScale();
        }, 600);
    });

    let isScrolling = false;
    function preventScroll() {
        if (!isScrolling && (document.body.scrollTop > 0 || document.documentElement.scrollTop > 0)) {
            isScrolling = true;
            document.body.scrollTop = 0;
            document.documentElement.scrollTop = 0;
            setTimeout(() => { isScrolling = false; }, 10);
        }
    }

    document.body.addEventListener('scroll', preventScroll, { passive: true });
    document.documentElement.addEventListener('scroll', preventScroll, { passive: true });

    function hideAddressBar() {
        window.scrollTo(0, 1);
        setTimeout(() => {
            window.scrollTo(0, 0);
            document.body.scrollTop = 0;
            document.documentElement.scrollTop = 0;
        }, 0);
    }

    setTimeout(hideAddressBar, 100);
    setTimeout(hideAddressBar, 500);
    setTimeout(hideAddressBar, 1000);

    let lastTouchEnd = 0;
    document.addEventListener('touchend', function(e) {
        const now = (new Date()).getTime();
        if (now - lastTouchEnd <= 300) {
            e.preventDefault();
        }
        lastTouchEnd = now;
    }, { passive: false });

    document.addEventListener('gesturestart', function(e) {
        e.preventDefault();
    });

    document.addEventListener('contextmenu', function(e) {
        e.preventDefault();
    });

    document.addEventListener('visibilitychange', function() {
        if (!document.hidden) {
            setTimeout(() => {
                setViewportHeight();
                applyLayoutScale();
            }, 100);
        }
    });
});

window.addEventListener('beforeunload', saveGameState);
