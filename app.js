// ==========================================
// CONFIGURATION & STATE
// ==========================================
const GAS_API_URL = 'https://script.google.com/macros/s/AKfycbwWioCbK9oaPT5rKIikLn9o0N5egYNFj_QlQ-CGW5VHzPBUAPfxfTzIPE51nqgomxGL/exec';
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
        case 'about': renderAbout(); break;
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

function renderAbout() {
    let html = `
        <div class="view-animate">
            ${getBackButtonHtml()}
            <h1 class="section-title">WCPについて</h1>
            <div class="cyber-card" style="text-align: center; padding: 3rem;">
                <h2 style="color: var(--accent-blue); margin-bottom: 1rem;">現在準備中です</h2>
                <i class="fa-solid fa-person-digging" style="font-size: 4rem; color: var(--text-muted);"></i>
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
            <div style="display: flex; flex-direction: column; gap: 1.5rem;">
                ${mockData.members.map(member => `
                    <div class="cyber-card member-card" style="cursor: pointer;" onclick="toggleMemberDetails('${member.squadNumber}')">
                        <div class="profile-header" style="margin-bottom: 0;">
                            <div class="avatar">${member.squadNumber}</div>
                            <div class="profile-info" style="flex: 1; display: flex; flex-direction: column; justify-content: center;">
                                <h3 style="color: var(--accent-green); margin-bottom: 0.4rem; font-size: 1.4rem;">${member.name}</h3>
                                <div style="font-family: var(--font-heading); font-size: 0.95rem; color: var(--text-muted); display: flex; gap: 1.5rem; align-items: center; flex-wrap: wrap;">
                                    <span>背番号: <span style="color: var(--text-main); font-weight: bold;">${member.squadNumber}</span></span>
                                    <span>カテゴリー: <span style="color: var(--text-main); font-weight: bold;">${member.category || '未登録'}</span></span>
                                </div>
                            </div>
                            <div class="accordion-icon" id="icon-${member.squadNumber}" style="color: var(--accent-blue); font-size: 1.5rem; margin-right: 1rem; display: flex; align-items: center;">
                                <i class="fa-solid fa-chevron-down transition-icon"></i>
                            </div>
                        </div>
                        <div id="details-${member.squadNumber}" class="member-details">
                            <div class="detail-row">
                                <div>
                                    <h4 style="font-size: 0.8rem; color: var(--text-muted); text-transform: uppercase; margin-bottom: 0.3rem;">タイピング記録</h4>
                                    <div style="font-weight: bold;">${member.typingScore || '未登録'}</div>
                                </div>
                                <button class="cyber-btn member-edit-btn" onclick="event.stopPropagation(); openEditMemberModal('${member.squadNumber}', 'typingScore', '${member.typingScore || ''}')"><i class="fa-solid fa-pen"></i> 編集</button>
                            </div>
                            
                            <div class="detail-row">
                                <div style="flex: 1;">
                                    <h4 style="font-size: 0.8rem; color: var(--text-muted); text-transform: uppercase; margin-bottom: 0.3rem;">バッジ</h4>
                                    <div class="badge-list">
                                        ${member.badges && member.badges.length > 0 ? member.badges.map(badge => `<span class="badge">${badge}</span>`).join('') : '<span style="color: var(--text-muted); font-size: 0.8rem;">なし</span>'}
                                    </div>
                                </div>
                            </div>

                            <div class="detail-row">
                                <div style="flex: 1;">
                                    <h4 style="font-size: 0.8rem; color: var(--text-muted); text-transform: uppercase; margin-bottom: 0.3rem;">読書記録</h4>
                                    <div style="font-size: 0.9rem; display: flex; flex-wrap: wrap; gap: 0.5rem; margin-top: 0.5rem;">
                                        ${(() => {
                                            const memberReviews = mockData.reviews.filter(r => String(r.squadNumber) === String(member.squadNumber));
                                            if (memberReviews.length > 0) {
                                                return memberReviews.map(rev => `<a href="${rev.docLink}" target="_blank" rel="noopener noreferrer" class="cyber-btn" style="padding: 0.3rem 0.6rem; font-size: 0.8rem; text-decoration: none; display: inline-flex; align-items: center; gap: 0.3rem;" onclick="event.stopPropagation();"><i class="fa-solid fa-file-lines"></i> ${rev.bookTitle}</a>`).join('');
                                            } else {
                                                return '<span style="color: var(--text-muted); font-size: 0.8rem;">なし</span>';
                                            }
                                        })()}
                                    </div>
                                </div>
                                <button class="cyber-btn member-edit-btn" onclick="event.stopPropagation(); openAddReviewModal('${member.squadNumber}')"><i class="fa-solid fa-plus"></i> 追加</button>
                            </div>
                        </div>
                    </div>
                `).join('')}
            </div>
        </div>
    `;
    appRoot.innerHTML = html;
}

function toggleMemberDetails(squadNum) {
    const detailsDiv = document.getElementById(`details-${squadNum}`);
    const iconDiv = document.getElementById(`icon-${squadNum}`);
    if(detailsDiv) {
        detailsDiv.classList.toggle('open');
    }
    if(iconDiv) {
        iconDiv.classList.toggle('open');
    }
}

let currentCalendarDate = new Date();
let currentScheduleView = 'calendar';

window.changeCalendarMonth = function(offset) {
    currentCalendarDate.setMonth(currentCalendarDate.getMonth() + offset);
    renderSchedule();
}

window.switchScheduleView = function(view) {
    currentScheduleView = view;
    renderSchedule();
}

function renderSchedule() {
    const year = currentCalendarDate.getFullYear();
    const month = currentCalendarDate.getMonth();
    
    let contentHtml = '';
    
    if (currentScheduleView === 'calendar') {
        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);
        const daysInMonth = lastDay.getDate();
        const startingDayOfWeek = firstDay.getDay(); // 0 is Sunday
        
        let calendarHtml = `
            <div class="cyber-card" style="margin-bottom: 2rem;">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem;">
                    <button class="cyber-btn" style="padding: 0.5rem 1rem;" onclick="changeCalendarMonth(-1)"><i class="fa-solid fa-chevron-left"></i></button>
                    <h3 style="margin: 0; font-size: 1.5rem;">${year}年 ${month + 1}月</h3>
                    <button class="cyber-btn" style="padding: 0.5rem 1rem;" onclick="changeCalendarMonth(1)"><i class="fa-solid fa-chevron-right"></i></button>
                </div>
                <div style="display: grid; grid-template-columns: repeat(7, 1fr); gap: 5px; text-align: center;">
                    <div style="font-weight: bold; color: #ff6b6b;">日</div>
                    <div style="font-weight: bold;">月</div>
                    <div style="font-weight: bold;">火</div>
                    <div style="font-weight: bold;">水</div>
                    <div style="font-weight: bold;">木</div>
                    <div style="font-weight: bold;">金</div>
                    <div style="font-weight: bold; color: #4facfe;">土</div>
        `;
        
        for (let i = 0; i < startingDayOfWeek; i++) {
            calendarHtml += `<div style="padding: 0.5rem; background: rgba(0,0,0,0.02); border-radius: 4px;"></div>`;
        }
        
        for (let day = 1; day <= daysInMonth; day++) {
            const dateStr = `${year}/${String(month + 1).padStart(2, '0')}/${String(day).padStart(2, '0')}`;
            
            const dayEvents = mockData.events.filter(e => {
                if (!e.date) return false;
                const normalizedDate = e.date.replace(/-/g, '/');
                return normalizedDate.startsWith(dateStr);
            });
            
            let eventsHtml = dayEvents.map(e => `
                <div style="font-size: 0.75rem; font-weight: bold; background: var(--accent-blue); color: white; border-radius: 4px; margin-top: 4px; padding: 4px 6px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; cursor: pointer; transition: transform 0.2s; box-shadow: 1px 1px 0px var(--border-color);" title="${e.title}" onclick="openAttendanceModal('${e.id}')" onmouseover="this.style.transform='scale(1.05)'" onmouseout="this.style.transform='scale(1)'">
                    ${e.title}
                </div>
            `).join('');
            
            const today = new Date();
            const isToday = (day === today.getDate() && month === today.getMonth() && year === today.getFullYear());
            const borderStyle = isToday ? 'border: 2px solid var(--accent-blue);' : 'border: 1px solid var(--border-color);';
            
            calendarHtml += `
                <div style="padding: 0.5rem; background: #fff; border-radius: 4px; min-height: 80px; ${borderStyle} display: flex; flex-direction: column;">
                    <div style="text-align: left; font-weight: bold; font-size: 0.9rem; ${isToday ? 'color: var(--accent-blue);' : ''}">${day}</div>
                    <div style="flex: 1; display: flex; flex-direction: column; gap: 2px; margin-top: 4px;">
                        ${eventsHtml}
                    </div>
                </div>
            `;
        }
        
        const remainingSlots = (7 - ((startingDayOfWeek + daysInMonth) % 7)) % 7;
        for (let i = 0; i < remainingSlots; i++) {
            calendarHtml += `<div style="padding: 0.5rem; background: rgba(0,0,0,0.02); border-radius: 4px;"></div>`;
        }
        
        calendarHtml += `
                </div>
            </div>
        `;
        contentHtml = calendarHtml;
    } else if (currentScheduleView === 'event') {
        let eventListHtml = `
            <div style="display: flex; flex-direction: column; gap: 1.5rem;">
                ${mockData.events.map(event => {
                    const attendeesCount = event.attendees ? event.attendees.length : 0;
                    const capacity = event.capacity ? Number(event.capacity) : 0;
                    const isFull = capacity > 0 && attendeesCount >= capacity;
                    
                    return `
                    <div class="cyber-card" style="display: flex; justify-content: space-between; align-items: stretch;">
                        <div style="flex: 1; margin-right: 1rem;">
                            <div class="news-date">${event.date}</div>
                            <h3 style="margin-bottom: 0.5rem; color: var(--accent-blue);">${event.title}</h3>
                            ${event.description ? `<p style="margin-bottom: 0.5rem; font-size: 0.9rem;">${event.description}</p>` : ''}
                            <div style="font-size: 0.85rem; color: var(--text-muted); margin-bottom: 0.3rem;">
                                参加者:
                            </div>
                            <div class="event-attendees">
                                ${attendeesCount > 0 
                                    ? event.attendees.map(a => `<span class="attendee-tag">${String(a).trim()}</span>`).join('') 
                                    : '<span style="color: var(--text-muted); font-size: 0.85rem;">まだいません</span>'}
                            </div>
                            <div style="font-size: 0.85rem; font-weight: bold; color: ${isFull ? '#ff6b6b' : 'var(--text-main)'};">
                                現在の参加人数: ${attendeesCount} / ${capacity || '無制限'}
                            </div>
                        </div>
                        <div style="display: flex; flex-direction: column; justify-content: space-between; align-items: flex-end; min-width: 100px;">
                            <button class="cyber-btn danger" style="padding: 0.4rem; border-radius: 50%; width: 36px; height: 36px; display: flex; align-items: center; justify-content: center;" onclick="openPasswordModal('deleteEvent', '${event.id}')" title="削除">
                                <i class="fa-solid fa-trash"></i>
                            </button>
                            <button class="cyber-btn" ${isFull ? 'disabled' : ''} style="margin-top: auto; padding: 0.5rem 1rem;" onclick="openAttendanceModal('${event.id}')">
                                ${isFull ? '満員' : '出欠登録'}
                            </button>
                        </div>
                    </div>
                    `;
                }).join('')}
            </div>
        `;
        contentHtml = eventListHtml;
    }

    let tabsHtml = `
        <div class="schedule-tabs">
            <button class="schedule-tab-btn ${currentScheduleView === 'calendar' ? 'active' : ''}" onclick="switchScheduleView('calendar')">
                <i class="fa-solid fa-calendar"></i> カレンダー
            </button>
            <button class="schedule-tab-btn ${currentScheduleView === 'event' ? 'active' : ''}" onclick="switchScheduleView('event')">
                <i class="fa-solid fa-list"></i> イベント一覧
            </button>
        </div>
    `;

    let html = `
        <div class="view-animate">
            ${getBackButtonHtml()}
            <h1 class="section-title" style="margin-bottom: 1rem;">イベントスケジュール</h1>
            
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem; flex-wrap: wrap; gap: 1rem;">
                ${tabsHtml}
                <button class="cyber-btn" onclick="openPasswordModal('addEvent')"><i class="fa-solid fa-plus"></i> イベントを追加</button>
            </div>
            
            ${contentHtml}
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
        const book = mockData.books.find(b => b.id === bookId);
        if (book) {
            book.status = 'borrowed';
            book.borrower = squadNum;
            book.dueDate = dueDate;
        }
        navigateTo(currentView);
        closeModal();
    }
}

async function returnBook(bookId) {
    if(confirm("この本を返却しますか？")) {
        // ボタンを無効化する代わりに少し待つUIも可能ですが、シンプルに同期
        const success = await sendAction('returnBook', { bookId });
        if (success) {
            const book = mockData.books.find(b => b.id === bookId);
            if (book) {
                book.status = 'available';
                book.borrower = '';
                book.dueDate = '';
            }
            navigateTo(currentView);
        }
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
        const event = mockData.events.find(e => e.id === eventId);
        if (event) {
            if (!event.attendees) event.attendees = [];
            if (status === 'attend') {
                if (!event.attendees.includes(squadNum)) {
                    event.attendees.push(squadNum);
                }
            } else if (status === 'absent') {
                event.attendees = event.attendees.filter(a => a !== squadNum);
            }
        }
        navigateTo(currentView);
        closeModal();
    }
}

function openPasswordModal(actionType, payload = null) {
    let payloadArg = payload ? `'${payload}'` : 'null';
    let html = `
        <h2 style="margin-bottom: 1rem; color: var(--accent-yellow);"><i class="fa-solid fa-lock"></i> 認証が必要です</h2>
        <p style="margin-bottom: 1.5rem;">この操作を実行するにはパスワードを入力してください。</p>
        
        <div class="form-group">
            <input type="password" id="passwordInput" class="cyber-input" placeholder="パスワードを入力">
        </div>
        <button class="cyber-btn" style="width: 100%;" onclick="submitPassword('${actionType}', ${payloadArg})">認証</button>
    `;
    openModal(html);
}

function submitPassword(actionType, payload) {
    const pwd = document.getElementById('passwordInput').value;
    if(pwd === '20230914') {
        if(actionType === 'addEvent') {
            openAddEventModal();
        } else if(actionType === 'deleteEvent') {
            confirmDeleteEvent(payload);
        }
    } else {
        alert("パスワードが間違っています。");
    }
}

function openAddEventModal() {
    let html = `
        <h2 style="margin-bottom: 1rem; color: var(--accent-blue);"><i class="fa-solid fa-calendar-plus"></i> イベントを追加</h2>
        
        <div class="form-group">
            <label>イベント名</label>
            <input type="text" id="addEventTitle" class="cyber-input" placeholder="例: 臨時ミーティング">
        </div>
        <div class="form-group">
            <label>開催日時 (Date)</label>
            <input type="text" id="addEventDate" class="cyber-input" placeholder="例: 2026/06/01 19:00">
        </div>
        <div class="form-group">
            <label>一言説明 (Description)</label>
            <input type="text" id="addEventDesc" class="cyber-input" placeholder="例: 重要な議題があります">
        </div>
        <div class="form-group" style="display: flex; gap: 1rem;">
            <div style="flex: 1;">
                <label>定員 (Capacity)</label>
                <input type="number" id="addEventCapacity" class="cyber-input" placeholder="例: 10" min="1">
            </div>
            <div style="flex: 1;">
                <label>主催者背番号 (Host)</label>
                <input type="text" id="addEventHost" class="cyber-input" placeholder="例: 001">
            </div>
        </div>
        <button class="cyber-btn" id="btn-add-event" style="width: 100%; margin-top: 1rem;" onclick="submitAddEvent()">イベント作成</button>
    `;
    openModal(html);
}

async function submitAddEvent() {
    const title = document.getElementById('addEventTitle').value;
    const date = document.getElementById('addEventDate').value;
    const description = document.getElementById('addEventDesc').value;
    const capacity = document.getElementById('addEventCapacity').value;
    const host = document.getElementById('addEventHost').value;
    
    if(!title || !date || !capacity || !host) {
        alert("必須項目(イベント名、日時、定員、主催者)を入力してください。");
        return;
    }

    document.getElementById('btn-add-event').disabled = true;
    document.getElementById('btn-add-event').innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> 作成中...';
    
    const success = await sendAction('addEvent', { title, date, description, capacity, host });
    if (success) {
        mockData.events.push({
            id: 'evt_' + Date.now(),
            title: title,
            date: date,
            description: description,
            capacity: capacity,
            host: host,
            attendees: []
        });
        navigateTo(currentView);
        closeModal();
    }
}

async function confirmDeleteEvent(eventId) {
    if(confirm("本当にこのイベントを削除しますか？")) {
        modalBody.innerHTML = '<div style="text-align:center;"><i class="fa-solid fa-spinner fa-spin" style="font-size: 2rem; color: var(--accent-blue);"></i><p style="margin-top:1rem;">削除中...</p></div>';
        const success = await sendAction('deleteEvent', { eventId });
        if (success) {
            mockData.events = mockData.events.filter(e => e.id !== eventId);
            navigateTo(currentView);
            closeModal();
        }
    }
}

// ==========================================
// MEMBER EDIT MODAL & ACTIONS
// ==========================================
function openEditMemberModal(squadNum, fieldName, currentVal) {
    let fieldLabel = '';
    let note = '';
    let inputHtml = '';
    if(fieldName === 'typingScore') {
        inputHtml = `
            <div class="form-group">
                <label>挑戦したコース</label>
                <select id="typingCourse" class="cyber-input">
                    <option value="3000円">3000円</option>
                    <option value="5000円">5000円</option>
                    <option value="10000円">10000円</option>
                </select>
            </div>
            <div class="form-group">
                <label>自分の記録</label>
                <input type="number" id="typingRecord" class="cyber-input" placeholder="例: 4500">
            </div>
        `;
    } else {
        if(fieldName === 'badges') {
            fieldLabel = 'バッジ';
            note = '<p style="font-size: 0.8rem; color: var(--text-muted); margin-bottom: 0.5rem;">※カンマ区切りで入力してください</p>';
        } else if(fieldName === 'readingRecord') {
            fieldLabel = '読書記録';
            note = '<p style="font-size: 0.8rem; color: var(--text-muted); margin-bottom: 0.5rem;">※カンマ区切りで入力してください</p>';
        }
        inputHtml = `
            <div class="form-group">
                <label>${fieldLabel}</label>
                ${note}
                <input type="text" id="editMemberInput" class="cyber-input" value="${currentVal}">
            </div>
        `;
    }

    let html = `
        <h2 style="margin-bottom: 1rem; color: var(--accent-blue);"><i class="fa-solid fa-pen-to-square"></i> メンバー情報編集</h2>
        <p style="margin-bottom: 1.5rem;">背番号: <strong>${squadNum}</strong></p>
        
        ${inputHtml}
        
        <button class="cyber-btn" id="btn-edit-member" style="width: 100%; margin-top: 1rem;" onclick="submitMemberEdit('${squadNum}', '${fieldName}')">更新する</button>
    `;
    openModal(html);
}

async function submitMemberEdit(squadNum, fieldName) {
    let newValue;
    if (fieldName === 'typingScore') {
        const course = document.getElementById('typingCourse').value;
        const record = document.getElementById('typingRecord').value;
        if (!record) {
            alert("自分の記録を入力してください。");
            return;
        }
        newValue = `${record} / ${course}`;
    } else {
        newValue = document.getElementById('editMemberInput').value;
    }
    
    document.getElementById('btn-edit-member').disabled = true;
    document.getElementById('btn-edit-member').innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> 更新中...';
    
    const success = await sendAction('updateMemberField', { squadNum, fieldName, newValue });
    if (success) {
        const member = mockData.members.find(m => String(m.squadNumber) === String(squadNum));
        if (member) {
            if (fieldName === 'badges') {
                member[fieldName] = newValue ? newValue.split(',').map(s => s.trim()) : [];
            } else {
                member[fieldName] = newValue;
            }
        }
        navigateTo(currentView);
        closeModal();
    }
}

// ==========================================
// ADD REVIEW MODAL & ACTIONS
// ==========================================
function openAddReviewModal(squadNum) {
    let bookOptions = mockData.books.map(b => `<option value="${b.id}">${b.title}</option>`).join('');
    
    let html = `
        <h2 style="margin-bottom: 1rem; color: var(--accent-blue);"><i class="fa-solid fa-book-open"></i> 読書感想文の追加</h2>
        
        <div class="form-group">
            <label>背番号 (Squad Number)</label>
            <input type="text" id="addReviewSquadNum" class="cyber-input" value="${squadNum}" readonly>
        </div>
        
        <div class="form-group">
            <label>本のタイトル</label>
            <select id="addReviewBookSelect" class="cyber-input" onchange="toggleManualBookTitle()">
                <option value="">選択してください</option>
                ${bookOptions}
                <option value="other">その他（手動入力）</option>
            </select>
        </div>
        
        <div class="form-group" id="manualBookTitleGroup" style="display: none;">
            <label>本のタイトル (手動入力)</label>
            <input type="text" id="addReviewManualTitle" class="cyber-input" placeholder="本のタイトルを入力">
        </div>
        
        <div class="form-group">
            <label>感想文リンク (ドキュメントURL)</label>
            <input type="url" id="addReviewDocLink" class="cyber-input" placeholder="https://docs.google.com/...">
        </div>
        
        <button class="cyber-btn" id="btn-add-review" style="width: 100%; margin-top: 1rem;" onclick="submitAddReview()">追加する</button>
    `;
    openModal(html);
}

function toggleManualBookTitle() {
    const select = document.getElementById('addReviewBookSelect');
    const manualGroup = document.getElementById('manualBookTitleGroup');
    if(select.value === 'other') {
        manualGroup.style.display = 'block';
    } else {
        manualGroup.style.display = 'none';
    }
}

async function submitAddReview() {
    const squadNum = document.getElementById('addReviewSquadNum').value;
    const select = document.getElementById('addReviewBookSelect');
    const manualTitle = document.getElementById('addReviewManualTitle').value;
    const docLink = document.getElementById('addReviewDocLink').value;
    
    let bookId = '';
    let bookTitle = '';
    
    if (select.value === '') {
        alert("本のタイトルを選択してください。");
        return;
    } else if (select.value === 'other') {
        if (!manualTitle.trim()) {
            alert("本のタイトルを手動入力してください。");
            return;
        }
        bookTitle = manualTitle.trim();
    } else {
        bookId = select.value;
        bookTitle = select.options[select.selectedIndex].text;
    }
    
    if (!docLink.trim()) {
        alert("感想文リンクを入力してください。");
        return;
    }

    document.getElementById('btn-add-review').disabled = true;
    document.getElementById('btn-add-review').innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> 送信中...';
    
    const success = await sendAction('addReview', { 
        squadNumber: squadNum, 
        bookId: bookId, 
        bookTitle: bookTitle, 
        docLink: docLink.trim() 
    });
    
    if (success) {
        const today = new Date();
        const yyyy = today.getFullYear();
        const mm = String(today.getMonth() + 1).padStart(2, '0');
        const dd = String(today.getDate()).padStart(2, '0');
        
        mockData.reviews.push({
            id: 'rev_' + Date.now(),
            squadNumber: squadNum,
            reviewer: squadNum,
            bookId: bookId,
            bookTitle: bookTitle,
            docLink: docLink.trim(),
            date: `${yyyy}/${mm}/${dd}`,
            text: ''
        });
        navigateTo(currentView);
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