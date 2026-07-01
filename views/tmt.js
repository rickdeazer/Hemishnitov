"use strict";

const TMT = (() => {
    const feed = document.getElementById('tmt-feed');
    const postModal = document.getElementById('TMT-MODAL');
    const condModal = document.getElementById('CONDITIONS-MODAL');
    let currentCategory = 'all';

    async function fetchTMTs() {
        feed.innerHTML = '<div class="loader-placeholder">Updating feed...</div>';
        try {
            const res = await fetch(`/api/tmt?category=${currentCategory}`);
            const data = await res.json();
            renderFeed(data);
        } catch (err) {
            feed.innerHTML = '<p style="text-align:center; color:gray;">Could not load feed.</p>';
        }
    }

    function renderFeed(posts) {
        if (posts.length === 0) {
            feed.innerHTML = '<p style="text-align:center; color:gray; padding:50px;">No one is going anywhere yet. Be the first!</p>';
            return;
        }
        feed.innerHTML = posts.map(post => `
            <div class="tmt-card">
                <div class="tmt-card-header">
                    <div class="tmt-user-pic" style="background-image: url('${post.host.profileLink || '/mediafiles/defaultProfile.png'}')"></div>
                    <div class="tmt-info">
                        <h4>${post.host.username}</h4>
                        <p>${post.category}</p>
                    </div>
                </div>
                <div class="tmt-details">
                    <span class="tmt-venue">📍 ${post.venue}</span>
                    <span class="tmt-time">⏰ Leaving at: ${post.time}</span>
                </div>
                <div class="tmt-actions">
                    <button class="btn-join" onclick="TMT.join('${post._id}')">Join (${post.attendees.length})</button>
                    ${post.conditions ? `<button class="btn-cond" onclick="TMT.showCond('${post.conditions}')">Conditions</button>` : ''}
                </div>
            </div>
        `).join('');
    }

    async function joinEvent(id) {
        try {
            const res = await fetch(`/api/tmt/join/${id}`, { method: 'POST' });
            if (res.ok) fetchTMTs();
        } catch (err) { alert("Failed to join."); }
    }

    // Initial Bindings
    function init() {
        // Tab Switching
        document.querySelectorAll('.tab-item').forEach(btn => {
            btn.addEventListener('click', () => {
                document.querySelector('.tab-item.active').classList.remove('active');
                btn.classList.add('active');
                currentCategory = btn.dataset.category;
                fetchTMTs();
            });
        });

        // Modal Control
        document.getElementById('addTmtBtn').onclick = () => postModal.style.display = 'flex';
        document.querySelectorAll('.close-modal').forEach(b => b.onclick = () => {
            postModal.style.display = 'none';
            condModal.style.display = 'none';
        });

        // Form Submission
        document.getElementById('tmt-form').onsubmit = async (e) => {
            e.preventDefault();
            const payload = {
                venue: document.getElementById('tmt-venue').value,
                time: document.getElementById('tmt-time').value,
                category: document.getElementById('tmt-category').value,
                conditions: document.getElementById('tmt-conditions').value
            };
            
            const res = await fetch('/api/tmt', {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify(payload)
            });

            if (res.ok) {
                postModal.style.display = 'none';
                e.target.reset();
                fetchTMTs();
            }
        };

        fetchTMTs();
    }

    return {
        init,
        join: joinEvent,
        showCond: (txt) => {
            document.getElementById('conditions-text').innerText = txt;
            condModal.style.display = 'flex';
        },
        search: (val) => {
            // Simple local filter or trigger fetch with query
        }
    };
})();

document.addEventListener('DOMContentLoaded', TMT.init);