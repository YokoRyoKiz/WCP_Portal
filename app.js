// ==========================================
// CONFIGURATION & STATE
// ==========================================
const GAS_API_URL = 'https://script.google.com/macros/s/AKfycbxET91FhDNLfIqgmHUJoSaYWtWTCZwRs65YBewCVicTMqdLLhWVD4iYcyKWpvzRcmgb/exec';
let currentView = 'home';
let viewHistory = [];
let isLoading = true;

// Mock Data (will be overwritten by GAS)
let mockData = {
    news: [],
    books: [],
    reviews: [],
    members: [],
    events: []
};

// ==========================================
// ROUTING & NAVIGATION
// ==========================================
const appRoot = document.getElementById('app-root');
const navButtons = document.querySelectorAll('.nav-btn');

navButtons.forEach(btn => {
    btn.addEventListener('click', (e) => {
        const view = e.currentTarget.dataset.view;
        if(currentView !== view) {
            navigateTo(view);
        }
    });
});

function navigateTo(view, isBack = false) {
    if (!isBack && currentView) {
        viewHistory.push(currentView);
    }
    
    currentView = view;
    
    // Update active nav button
    navButtons.forEach(btn => {
        if(btn.dataset.view === view) {
            btn.classList.add('active');
        } else {
            btn.classList.remove('active');
        }
    });

    if (isLoading) return;

    // Render corresponding view
    switch(view) {
        case 'home': renderHome(); break;
        case 'books': renderBooks(); break;
        case 'roster': renderRoster(); break;
        case 'schedule': renderSchedule(); break;
    }
}

window.goBack = function() {
    if (viewHistory.length > 0) {
        const previousView = viewHistory.pop();
        navigateTo(previousView, true);
    } else {
        navigateTo('home', true);
    }
};

function getBackButtonHtml() {
    if (viewHistory.length > 0) {
        return `<button class="cyber-btn" style="margin-bottom: 1.5rem;" onclick="goBack()"><i class="fa-solid fa-arrow-left"></i> 戻る</button>`;
    }
    return '';
}

// ==========================================
// API通信 (GET / POST)
// ==========================================
async function fetchPortalData() {
    isLoading = true;
    try {
        // ロード中のポップな演出
        appRoot.innerHTML = `
            <div style="text-align:center; margin-top:5rem; font-family: var(--font-heading);">
                <i class="fa-solid fa-spinner fa-spin" style="font-size: 3rem; margin-bottom: 1rem; color: var(--accent-blue);"></i>
                <div style="color: var(--accent-blue); letter-spacing: 2px; font-size: 1.5rem;">LOADING...</div>
            </div>`;

        const response = await fetch(GAS_API_URL);
        const data = await response.json();

        // 取得したデータで上書き
        mockData = data;
        isLoading = false;

        // データ取得完了後に現在のビューを描画
        navigateTo(currentView);
    } catch (error) {
        isLoading = false;
        console.error("データの取得に失敗しました:", error);
        appRoot.innerHTML = `
            <div style="text-align:center; margin-top:5rem; background: #fff; padding: 2rem; border: var(--border-width) solid var(--border-color); border-radius: 12px; box-shadow: var(--hard-shadow); display: inline-block;">
                <div style="color: #ff6b6b; font-family: var(--font-heading); font-size: 2rem; margin-bottom: 1rem;">
                    <i class="fa-solid fa-triangle-exclamation"></i> ERROR!
                </div>
                <p style="font-weight: 700; margin-top: 1rem;">データの取得に失敗しました。</p>
            </div>`;
    }
}

// 汎用のデータ送信処理
async function sendAction(action, payload) {
    try {
        const response = await fetch(GAS_API_URL, {
            method: 'POST',
            // CORSのpreflightを回避するために text/plain で送信
            headers: { 'Content-Type': 'text/plain' },
            body: JSON.stringify({ action, ...payload })
        });
        
        const result = await response.json();
        if(result.success) {
            // 成功したらデータを再取得して画面を更新
            await fetchPortalData();
            return true;
        } else {
            alert("エラー: " + result.error);
            return false;
        }
    } catch (error) {
        console.error("送信エラー:", error);
        alert("通信エラーが発生しました。データが保存されていない可能性があります。");
        return false;
    }
}

// ==========================================
// VIEWS
// ==========================================

function renderHome() {
    let html = `
        <div class="view-animate">
            ${getBackButtonHtml()}
            <h1 class="section-title">ターミナルダッシュボード</h1>
            <div class="grid-2">
                <div class="cyber-card">
                    <h3><i class="fa-solid fa-satellite-dish neon-text"></i> システムニュース</h3>
                    <div class="mt-4">
                        ${mockData.news.map(item => `
                            <div class="news-item">
                                <div class="news-date">${item.date}</div>
                                <div>${item.text}</div>
                            </div>
                        `).join('')}
                    </div>
                </div>
                <div class="cyber-card">
                    <h3><i class="fa-solid fa-link neon-text"></i> クイックリンク</h3>
                    <div style="margin-top: 1rem; display: flex; flex-direction: column; gap: 1rem;">
                        <button class="cyber-btn" onclick="navigateTo('books')">図書管理へアクセス</button>
                        <button class="cyber-btn" onclick="navigateTo('roster')">名簿を確認</button>
                        <button class="cyber-btn" onclick="navigateTo('schedule')">スケジュールを確認</button>
                    </div>
                </div>
            </div>
        </div>
    `;
    appRoot.innerHTML = html;
}

function renderBooks() {
    let html = `
        <div class="view-animate">
            ${getBackButtonHtml()}
            <h1 class="section-title">図書データベース</h1>
            <div class="grid-3">
                ${mockData.books.map(book => `
                    <div class="cyber-card">
                        <div class="book-cover">
                            <i class="fa-solid fa-book-journal-whills"></i>
                        </div>
                        <div class="book-title">${book.title}</div>
                        <div class="book-meta">${book.author}</div>
                        
                        <div style="margin-bottom: 1rem;">
                            ${book.status === 'available' 
                                ? `<span class="status-badge status-available">貸出可能</span>`
                                : `<span class="status-badge status-borrowed">貸出中: ${book.borrower} (期限: ${book.dueDate})</span>`
                            }
                        </div>
                        
                        <div style="display: flex; gap: 0.5rem;">
                            ${book.status === 'available'
                                ? `<button class="cyber-btn" style="flex: 1;" onclick="openBorrowModal('${book.id}')">借りる</button>`
                                : `<button class="cyber-btn danger" style="flex: 1;" onclick="returnBook('${book.id}')">返却</button>`
                            }
                            <button class="cyber-btn" title="履歴を見る" onclick="openReviewModal('${book.id}')"><i class="fa-solid fa-clock-rotate-left"></i></button>
                        </div>
                    </div>
                `).join('')}
            </div>
        </div>
    `;
    appRoot.innerHTML = html;
}

function renderRoster() {
    let html = `
        <div class="view-animate">
            ${getBackButtonHtml()}
            <h1 class="section-title">メンバー名簿</h1>
            <div class="grid-2">
                ${mockData.members.map(member => `
                    <div class="cyber-card">
                        <div class="profile-header">
                            <div class="avatar">${member.squadNumber}</div>
                            <div>
                                <h3 style="color: var(--accent-green); margin-bottom: 0.2rem;">${member.name}</h3>
                                <div style="font-family: var(--font-heading); font-size: 0.8rem; color: var(--text-muted);">
                                    タイピングスコア: <span style="color: var(--text-main);">${member.typingScore}</span>
                                </div>
                            </div>
                        </div>
                        <div style="margin-top: 1rem;">
                            <h4 style="font-size: 0.8rem; color: var(--text-muted); margin-bottom: 0.5rem; text-transform: uppercase;">獲得バッジ</h4>
                            <div class="badge-list">
                                ${member.badges && member.badges.length > 0 ? member.badges.map(badge => `<span class="badge">${badge}</span>`).join('') : '<span style="color: var(--text-muted); font-size: 0.8rem;">なし</span>'}
                            </div>
                        </div>
                    </div>
                `).join('')}
            </div>
        </div>
    `;
    appRoot.innerHTML = html;
}

function renderSchedule() {
    let html = `
        <div class="view-animate">
            ${getBackButtonHtml()}
            <h1 class="section-title">イベントスケジュール</h1>
            <div style="display: flex; flex-direction: column; gap: 1.5rem;">
                ${mockData.events.map(event => `
                    <div class="cyber-card" style="display: flex; justify-content: space-between; align-items: center;">
                        <div>
                            <div class="news-date">${event.date}</div>
                            <h3 style="margin-bottom: 0.5rem;">${event.title}</h3>
                            <div style="font-size: 0.8rem; color: var(--text-muted);">
                                参加者: ${event.attendees && event.attendees.length > 0 ? event.attendees.join(', ') : 'まだいません'}
                            </div>
                        </div>
                        <div>
                            <button class="cyber-btn" onclick="openAttendanceModal('${event.id}')">出欠登録</button>
                        </div>
                    </div>
                `).join('')}
            </div>
        </div>
    `;
    appRoot.innerHTML = html;
}

// ==========================================
// MODALS & INTERACTIONS
// ==========================================
const modalOverlay = document.getElementById('modal-overlay');
const modalBody = document.getElementById('modal-body');
const modalClose = document.getElementById('modal-close');

modalClose.addEventListener('click', closeModal);

function openModal(contentHtml) {
    modalBody.innerHTML = contentHtml;
    modalOverlay.classList.remove('hidden');
}

function closeModal() {
    modalOverlay.classList.add('hidden');
}

function openBorrowModal(bookId) {
    const book = mockData.books.find(b => b.id === bookId);
    let html = `
        <h2 style="margin-bottom: 1rem; color: var(--accent-green);"><i class="fa-solid fa-hand-holding-hand"></i> 本を借りる</h2>
        <p style="margin-bottom: 1.5rem;">対象: <strong>${book.title}</strong></p>
        
        <div class="form-group">
            <label>背番号 (Squad Number)</label>
            <input type="text" id="squadNumInput" class="cyber-input" placeholder="例: 007">
        </div>
        <div class="form-group">
            <label>返却期限</label>
            <input type="date" id="dueDateInput" class="cyber-input">
        </div>
        <button class="cyber-btn" id="btn-borrow" style="width: 100%; margin-top: 1rem;" onclick="submitBorrow('${bookId}')">貸出リクエスト送信</button>
    `;
    openModal(html);
}

async function submitBorrow(bookId) {
    const squadNum = document.getElementById('squadNumInput').value;
    const dueDate = document.getElementById('dueDateInput').value;
    
    if(!squadNum || !dueDate) {
        alert("すべての項目を入力してください。");
        return;
    }

    // UX向上のため先にボタンを無効化
    document.getElementById('btn-borrow').disabled = true;
    document.getElementById('btn-borrow').innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> 送信中...';
    
    const success = await sendAction('borrowBook', { bookId, squadNum, dueDate });
    if (success) {
        closeModal();
    }
}

async function returnBook(bookId) {
    if(confirm("この本を返却しますか？")) {
        // ボタンを無効化する代わりに少し待つUIも可能ですが、シンプルに同期
        await sendAction('returnBook', { bookId });
    }
}

function openReviewModal(bookId) {
    const book = mockData.books.find(b => b.id === bookId);
    const bookReviews = mockData.reviews.filter(r => r.bookId === bookId);
    
    let html = `
        <h2 style="margin-bottom: 1rem; color: var(--accent-green);"><i class="fa-solid fa-clock-rotate-left"></i> 感想文履歴</h2>
        <p style="margin-bottom: 1.5rem; color: var(--text-muted);">${book.title}</p>
        
        <div class="timeline">
            ${bookReviews.length > 0 ? bookReviews.map(review => `
                <div class="timeline-item">
                    <div style="font-family: var(--font-heading); font-size: 0.8rem; color: var(--accent-green);">${review.date} - 背番号 ${review.reviewer}</div>
                    <div style="margin-top: 0.5rem; font-size: 0.95rem; line-height: 1.4;">「${review.text}」</div>
                </div>
            `).join('') : '<div style="color: var(--text-muted);">この本の履歴はまだありません。</div>'}
        </div>
    `;
    openModal(html);
}

function openAttendanceModal(eventId) {
    const event = mockData.events.find(e => e.id === eventId);
    let html = `
        <h2 style="margin-bottom: 1rem; color: var(--accent-green);"><i class="fa-solid fa-calendar-check"></i> 出欠登録</h2>
        <p style="margin-bottom: 1.5rem;">イベント: <strong>${event.title}</strong></p>
        
        <div class="form-group">
            <label>背番号 (Squad Number)</label>
            <input type="text" id="attSquadNum" class="cyber-input" placeholder="例: 007">
        </div>
        <div class="form-group" style="display: flex; gap: 1rem;">
            <button class="cyber-btn" id="btn-attend" style="flex: 1;" onclick="submitAttendance('${eventId}', 'attend')">出席</button>
            <button class="cyber-btn danger" id="btn-absent" style="flex: 1;" onclick="submitAttendance('${eventId}', 'absent')">欠席</button>
        </div>
    `;
    openModal(html);
}

async function submitAttendance(eventId, status) {
    const squadNum = document.getElementById('attSquadNum').value;
    if(!squadNum) {
        alert("背番号を入力してください。");
        return;
    }

    document.getElementById('btn-attend').disabled = true;
    document.getElementById('btn-absent').disabled = true;

    const success = await sendAction('updateAttendance', { eventId, squadNum, status });
    if (success) {
        closeModal();
    }
}

// ==========================================
// INIT
// ==========================================
document.addEventListener('DOMContentLoaded', () => {
    currentView = 'home';
    fetchPortalData();
});